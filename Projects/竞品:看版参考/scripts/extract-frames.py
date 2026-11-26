#!/usr/bin/env python3
"""
Laka 竞品录屏智能抽帧与滚动长规则拼接脚本（仅依赖本机 ffmpeg + Python Pillow）

核心步骤：
1. 调用 ffmpeg 按固定采样率（默认 3 fps）提取候选帧；
2. 自动检测并裁切 Mac 投屏/QuickTime 录屏四周的纯色黑边或固定亮边；
3. 屏蔽顶部时间状态栏与底部横条，通过相邻帧差分检测手指停稳窗口（Settled State），选出最清晰帧；
4. 基于 8x16 网格分块差分剔除语音房公屏单行滚动、麦位音波等局部微动重复帧，保留弹窗/Tab切换/滚屏；
5. 检测连续纵向滚动的 H5 规则页（剔除吸顶栏与吸底栏干扰），自动拼接输出完整长规则图。
"""

import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path
from PIL import Image, ImageChops, ImageFilter, ImageStat


def ensure_media_path():
    extra = ["/opt/homebrew/bin", "/usr/local/bin", "/usr/bin", "/bin"]
    cur = os.environ.get("PATH", "")
    parts = cur.split(":") if cur else []
    for p in reversed(extra):
        if p not in parts:
            parts.insert(0, p)
    os.environ["PATH"] = ":".join(parts)


def probe_duration(video_path: Path) -> float:
    cmd = [
        "ffprobe",
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        str(video_path),
    ]
    try:
        out = subprocess.check_output(cmd, stderr=subprocess.DEVNULL, text=True).strip()
        return round(float(out), 2)
    except Exception:
        return 0.0


def sample_video_frames(video_path: Path, tmp_dir: Path, fps: float, max_width: int = 880):
    pattern = str(tmp_dir / "raw-%05d.png")
    vf = f"fps={fps},scale='min({max_width},iw)':-2"
    cmd = [
        "ffmpeg",
        "-hide_banner",
        "-loglevel",
        "error",
        "-i",
        str(video_path),
        "-vf",
        vf,
        pattern,
    ]
    subprocess.run(cmd, check=True)
    files = sorted(tmp_dir.glob("raw-*.png"))
    return files


def detect_viewport_crop(sample_paths):
    """
    自动检测 Mac 录屏四周是否存在固定纯色黑边/白边（例如 QuickTime 或 iPhone 镜像窗口黑边）。
    若整屏本身已是手机比例且无纯色边，则保持原尺寸。
    """
    if not sample_paths:
        return None

    picks = sample_paths[:: max(1, len(sample_paths) // 6)][:6]
    imgs = [Image.open(p).convert("RGB") for p in picks]
    w, h = imgs[0].size
    if w < 120 or h < 120:
        return None

    # 将多帧取平均并计算边缘行列的标准差，纯黑/纯灰/纯白静止背景边标准差极低且亮度一致
    def is_uniform_col(x):
        vals = []
        for im in imgs:
            col = im.crop((x, int(h * 0.12), x + 1, int(h * 0.88))).convert("L")
            st = ImageStat.Stat(col)
            if st.stddev[0] > 5.0:
                return False
            vals.append(st.mean[0])
        return (max(vals) - min(vals)) < 4.0 and (vals[0] < 24 or vals[0] > 242)

    def is_uniform_row(y):
        vals = []
        for im in imgs:
            row = im.crop((int(w * 0.12), y, int(w * 0.88), y + 1)).convert("L")
            st = ImageStat.Stat(row)
            if st.stddev[0] > 5.0:
                return False
            vals.append(st.mean[0])
        return (max(vals) - min(vals)) < 4.0 and (vals[0] < 24 or vals[0] > 242)

    left = 0
    while left < int(w * 0.38) and is_uniform_col(left):
        left += 2

    right = w - 1
    while right > int(w * 0.62) and is_uniform_col(right):
        right -= 2

    top = 0
    while top < int(h * 0.22) and is_uniform_row(top):
        top += 2

    bottom = h - 1
    while bottom > int(h * 0.78) and is_uniform_row(bottom):
        bottom -= 2

    crop_w = right - left + 1
    crop_h = bottom - top + 1
    if left <= 4 and (w - 1 - right) <= 4 and top <= 4 and (h - 1 - bottom) <= 4:
        return None
    if crop_w < int(w * 0.25) or crop_h < int(h * 0.4):
        return None
    # 保证偶数宽高
    left = max(0, left - (left % 2))
    top = max(0, top - (top % 2))
    right_edge = min(w, left + crop_w - (crop_w % 2))
    bottom_edge = min(h, top + crop_h - (crop_h % 2))
    return (left, top, right_edge, bottom_edge)


def make_core_thumb(img: Image.Image, thumb_w: int = 160, thumb_h: int = 348) -> Image.Image:
    w, h = img.size
    # 屏蔽顶部 5% 状态栏（时间/电量变化）与底部 4% Home 横条
    core = img.crop((0, int(h * 0.05), w, int(h * 0.96))).convert("L")
    return core.resize((thumb_w, thumb_h), Image.Resampling.BILINEAR)


def mean_diff(a: Image.Image, b: Image.Image) -> float:
    diff = ImageChops.difference(a, b)
    return ImageStat.Stat(diff).mean[0]


def sharpness_score(gray_thumb: Image.Image) -> float:
    edges = gray_thumb.filter(ImageFilter.FIND_EDGES)
    return ImageStat.Stat(edges).mean[0]


def is_structurally_different(thumb_a: Image.Image, thumb_b: Image.Image) -> tuple[bool, float]:
    """
    8x16 分块结构对比：
    - 过滤语音房单个麦位呼吸灯、公屏 1~2 行新消息等局部微动（仅少量孤立块变化）；
    - 保留半屏弹窗、Tab 切换、按钮开关切换、页面跳转或滚屏。
    """
    overall = mean_diff(thumb_a, thumb_b)
    if overall >= 8.5:
        return True, round(overall, 2)
    if overall < 1.1:
        return False, round(overall, 2)

    diff = ImageChops.difference(thumb_a, thumb_b)
    w, h = diff.size
    cols, rows = 8, 16
    bw, bh = w // cols, h // rows

    changed_blocks = 0
    strong_blocks = 0
    row_hits = [0] * rows

    for r in range(rows):
        for c in range(cols):
            box = (c * bw, r * bh, (c + 1) * bw, (r + 1) * bh)
            m = ImageStat.Stat(diff.crop(box)).mean[0]
            if m > 13.0:
                changed_blocks += 1
                row_hits[r] += 1
            if m > 26.0:
                strong_blocks += 1

    # 若同一水平带（如 Tab 栏或选项行）连续多块发生显著变化，说明发生了 Tab / 选项切换
    concentrated_row = any(cnt >= 3 for cnt in row_hits) and strong_blocks >= 2
    if changed_blocks >= 8 or strong_blocks >= 5 or concentrated_row:
        return True, round(overall, 2)

    return False, round(overall, 2)


def select_settled_keyframes(frame_paths, fps: float, crop_box):
    if not frame_paths:
        return []

    thumbs = []
    cropped_sizes = []
    for p in frame_paths:
        with Image.open(p) as im:
            im_c = im.crop(crop_box) if crop_box else im.copy()
            cropped_sizes.append(im_c.size)
            thumbs.append(make_core_thumb(im_c))

    n = len(thumbs)
    if n == 1:
        return [{"rawIndex": 0, "timestampSec": 0.0, "motionScore": 0.0, "changeScore": 100.0}]

    # 相邻帧运动评分：衡量当前帧是否处于滑动/动画过渡中
    motions = [0.0] * n
    for i in range(n):
        diffs = []
        if i > 0:
            diffs.append(mean_diff(thumbs[i], thumbs[i - 1]))
        if i + 1 < n:
            diffs.append(mean_diff(thumbs[i], thumbs[i + 1]))
        motions[i] = min(diffs) if diffs else 0.0

    SETTLE_LIMIT = 4.8
    settled_flags = [m <= SETTLE_LIMIT for m in motions]

    # 提取连续稳定区间，每段选运动最小且边缘最清晰的一帧
    candidates = []
    i = 0
    while i < n:
        if not settled_flags[i]:
            i += 1
            continue
        j = i
        while j + 1 < n and settled_flags[j + 1] and mean_diff(thumbs[i], thumbs[j + 1]) < 5.5:
            j += 1
        # 在 [i..j] 稳定窗口内挑最佳帧
        best_idx = max(
            range(i, j + 1),
            key=lambda idx: sharpness_score(thumbs[idx]) - motions[idx] * 1.5,
        )
        candidates.append(best_idx)
        i = j + 1

    # 兜底：若用户全程匀速快滑未停顿，按每秒局部运动极小值采样
    if not candidates:
        step = max(1, int(round(fps)))
        for start in range(0, n, step):
            end = min(n, start + step)
            best_idx = min(range(start, end), key=lambda idx: motions[idx])
            candidates.append(best_idx)

    # 确保尾帧稳定态不被遗漏
    if (n - 1) not in candidates and motions[-1] <= SETTLE_LIMIT * 1.4:
        candidates.append(n - 1)

    # 结构去重：保留真正发生 UI 状态或滚动变化的帧
    kept = []
    kept_thumbs = []
    for idx in candidates:
        t_cur = thumbs[idx]
        if not kept_thumbs:
            kept.append(
                {
                    "rawIndex": idx,
                    "timestampSec": round(idx / fps, 2),
                    "motionScore": round(motions[idx], 2),
                    "changeScore": 100.0,
                }
            )
            kept_thumbs.append(t_cur)
            continue

        # 与上一保留帧及最近 2 帧对比，防止弹窗关掉回到同一房间主页产生大量重复（但若中间隔了其他页面，允许回到主页保留路径感，所以只跟紧邻上一帧强去重）
        diff_prev, score_prev = is_structurally_different(kept_thumbs[-1], t_cur)
        if not diff_prev:
            continue

        kept.append(
            {
                "rawIndex": idx,
                "timestampSec": round(idx / fps, 2),
                "motionScore": round(motions[idx], 2),
                "changeScore": score_prev,
            }
        )
        kept_thumbs.append(t_cur)

    return kept


def detect_vertical_scroll_shift(img_a: Image.Image, img_b: Image.Image):
    """
    检测 img_b 是否为 img_a 向下滚动后的同一页面（即内容向上平移了 dy > 0 像素）。
    采用除吸顶栏(top 13%)与吸底栏(bottom 13%)外的「全重叠窗口匹配」，支持最高 62% 屏高的大幅滑动，
    并避免等高卡片边框造成的周期性错配。
    返回原图尺度下的整数纵向位移 dy；若不匹配则返回 None。
    """
    if img_a.size != img_b.size:
        return None
    orig_w, orig_h = img_a.size
    if orig_h < 300:
        return None

    scale = 440.0 / orig_h
    sw = max(96, int(round(orig_w * scale)))
    sh = 440

    ga = img_a.convert("L").resize((sw, sh), Image.Resampling.BILINEAR)
    gb = img_b.convert("L").resize((sw, sh), Image.Resampling.BILINEAR)

    x0, x1 = int(sw * 0.06), int(sw * 0.94)
    top_guard = int(sh * 0.13)
    bot_guard = int(sh * 0.13)
    usable_end = sh - bot_guard

    # 检查中间区域是否有足够纹理（纯色背景不拼接）
    mid_check = gb.crop((x0, top_guard + 10, x1, usable_end - 10))
    if ImageStat.Stat(mid_check).stddev[0] < 6.0:
        return None

    min_dy = int(sh * 0.08)
    # 至少保留 12% 屏高的重叠窗口以确保匹配可靠，最高可支持约 62% 屏高的单次大幅滑动
    min_overlap = int(sh * 0.12)
    max_dy = usable_end - top_guard - min_overlap
    if max_dy <= min_dy:
        return None

    best_dy = None
    best_err = 999.0

    # 粗搜（步长 2px）：对比完整重叠窗口 ga[top_guard + dy : usable_end] 与 gb[top_guard : usable_end - dy]
    for dy in range(min_dy, max_dy + 1, 2):
        ov_h = usable_end - top_guard - dy
        if ov_h < min_overlap:
            break
        win_a = ga.crop((x0, top_guard + dy, x1, top_guard + dy + ov_h))
        win_b = gb.crop((x0, top_guard, x1, top_guard + ov_h))
        if ImageStat.Stat(win_b).stddev[0] < 5.5:
            continue
        err = mean_diff(win_a, win_b)
        if err < best_err:
            best_err = err
            best_dy = dy

    if best_dy is None or best_err > 10.0:
        return None

    # 细搜（逐像素）
    fine_dy = best_dy
    fine_err = best_err
    for dy in range(max(min_dy, best_dy - 2), min(max_dy, best_dy + 2) + 1):
        ov_h = usable_end - top_guard - dy
        if ov_h < min_overlap:
            continue
        win_a = ga.crop((x0, top_guard + dy, x1, top_guard + dy + ov_h))
        win_b = gb.crop((x0, top_guard, x1, top_guard + ov_h))
        err = mean_diff(win_a, win_b)
        if err < fine_err:
            fine_err = err
            fine_dy = dy

    if fine_err > 9.0:
        return None

    # 换算到原图尺寸并在全分辨率重叠区做逐像素精配，保证拼接文字零重影
    approx_orig_dy = int(round(fine_dy / scale))
    ox0, ox1 = int(orig_w * 0.08), int(orig_w * 0.92)
    otop = int(orig_h * 0.14)
    ousable = orig_h - int(orig_h * 0.14)
    ga_full = img_a.convert("L")
    gb_full = img_b.convert("L")

    best_full_dy = approx_orig_dy
    best_full_err = 999.0
    search_r = max(4, int(round(3 / scale)))
    for ody in range(max(16, approx_orig_dy - search_r), approx_orig_dy + search_r + 1):
        ov_h = ousable - otop - ody
        if ov_h < int(orig_h * 0.10):
            continue
        # 限制精配高度上限以加速计算
        check_h = min(ov_h, int(orig_h * 0.35))
        win_a = ga_full.crop((ox0, otop + ody, ox1, otop + ody + check_h))
        win_b = gb_full.crop((ox0, otop, ox1, otop + check_h))
        err = mean_diff(win_a, win_b)
        if err < best_full_err:
            best_full_err = err
            best_full_dy = ody

    if best_full_err > 10.0:
        return None
    return best_full_dy


def compose_stitched_image(images: list[Image.Image], shifts: list[int]) -> Image.Image:
    """
    将连续滚动的帧序列无缝拼接为单张长规则图：
    - 首帧保留顶部导航栏至 H - bottom_guard；
    - 中间每帧追加新增露出的 dy 高度内容（接缝处做 8px 线性羽化过渡）；
    - 末帧完整保留至画面最底部（保留底部按钮与页脚）。
    """
    w, h = images[0].size
    bottom_guard = int(h * 0.14)
    feather = 8

    total_h = h + sum(shifts)
    canvas = Image.new("RGB", (w, total_h), (18, 18, 24))

    # 贴入首帧
    canvas.paste(images[0], (0, 0))
    cur_bottom = h - bottom_guard

    for idx, dy in enumerate(shifts):
        nxt = images[idx + 1]
        is_last = idx == (len(shifts) - 1)
        # 在上一帧中 y = cur_bottom 对应新帧中的 y_in_nxt = cur_bottom - sum_prev_dy
        # 递推更简单：每次上一帧有效底边在新帧中的纵坐标固定为 (h - bottom_guard - dy)
        src_y_start = (h - bottom_guard) - dy
        src_y_end = h if is_last else (h - bottom_guard)

        if src_y_start < 0:
            src_y_start = 0

        # 羽化接缝区域
        blend_h = min(feather, src_y_start, cur_bottom)
        if blend_h > 0:
            top_strip = canvas.crop((0, cur_bottom - blend_h, w, cur_bottom))
            bot_strip = nxt.crop((0, src_y_start - blend_h, w, src_y_start))
            for row in range(blend_h):
                alpha = (row + 1) / (blend_h + 1)
                blended_row = Image.blend(
                    top_strip.crop((0, row, w, row + 1)),
                    bot_strip.crop((0, row, w, row + 1)),
                    alpha,
                )
                canvas.paste(blended_row, (0, cur_bottom - blend_h + row))

        body_slice = nxt.crop((0, src_y_start, w, src_y_end))
        canvas.paste(body_slice, (0, cur_bottom))
        cur_bottom += body_slice.size[1]

    return canvas.crop((0, 0, w, cur_bottom))


def process_input(input_path: Path, out_dir: Path, fps: float):
    ensure_media_path()
    frames_dir = out_dir / "frames"
    stitched_dir = out_dir / "stitched"
    frames_dir.mkdir(parents=True, exist_ok=True)
    stitched_dir.mkdir(parents=True, exist_ok=True)

    # 清理旧文件以便幂等重跑
    for old in frames_dir.glob("*.png"):
        old.unlink()
    for old in stitched_dir.glob("*.png"):
        old.unlink()

    duration_sec = probe_duration(input_path)

    with tempfile.TemporaryDirectory(prefix="laka-cap-") as tmp_str:
        tmp_dir = Path(tmp_str)
        raw_paths = sample_video_frames(input_path, tmp_dir, fps=fps)
        crop_box = detect_viewport_crop(raw_paths)
        selected = select_settled_keyframes(raw_paths, fps=fps, crop_box=crop_box)

        saved_frames = []
        pil_frames = []

        for order, item in enumerate(selected, start=1):
            raw_p = raw_paths[item["rawIndex"]]
            with Image.open(raw_p) as im:
                cropped = (im.crop(crop_box) if crop_box else im).convert("RGB")
            fname = f"frame-{order:02d}.png"
            dest = frames_dir / fname
            cropped.save(dest, format="PNG", optimize=True)
            pil_frames.append(cropped)
            saved_frames.append(
                {
                    "id": f"frame-{order:02d}",
                    "fileName": fname,
                    "timestampSec": item["timestampSec"],
                    "motionScore": item["motionScore"],
                    "changeScore": item["changeScore"],
                    "width": cropped.size[0],
                    "height": cropped.size[1],
                }
            )

    # 检测纵向连续滚屏区间并生成拼接长图
    stitched_items = []
    idx = 0
    stitch_seq = 1
    while idx + 1 < len(pil_frames):
        run_imgs = [pil_frames[idx]]
        run_ids = [saved_frames[idx]["id"]]
        run_shifts = []

        cur = idx
        while cur + 1 < len(pil_frames):
            dy = detect_vertical_scroll_shift(pil_frames[cur], pil_frames[cur + 1])
            if dy is None:
                break
            run_shifts.append(dy)
            run_imgs.append(pil_frames[cur + 1])
            run_ids.append(saved_frames[cur + 1]["id"])
            cur += 1

        if run_shifts:
            long_img = compose_stitched_image(run_imgs, run_shifts)
            sname = f"stitched-long-{stitch_seq:02d}.png"
            sdest = stitched_dir / sname
            long_img.save(sdest, format="PNG", optimize=True)
            stitched_items.append(
                {
                    "id": f"stitched-{stitch_seq:02d}",
                    "fileName": sname,
                    "sourceFrameIds": run_ids,
                    "startTimestampSec": saved_frames[idx]["timestampSec"],
                    "endTimestampSec": saved_frames[cur]["timestampSec"],
                    "width": long_img.size[0],
                    "height": long_img.size[1],
                }
            )
            stitch_seq += 1
            idx = cur + 1
        else:
            idx += 1

    result = {
        "durationSec": duration_sec,
        "fpsSampled": fps,
        "viewportCrop": list(crop_box) if crop_box else None,
        "frameCount": len(saved_frames),
        "stitchedCount": len(stitched_items),
        "frames": saved_frames,
        "stitched": stitched_items,
    }

    result_path = out_dir / "extract-result.json"
    result_path.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(result, ensure_ascii=False))


def main():
    parser = argparse.ArgumentParser(description="Laka 竞品录屏智能切图与长规则拼接")
    parser.add_argument("--input", required=True, help="输入录屏视频路径")
    parser.add_argument("--out-dir", required=True, help="输出批次目录")
    parser.add_argument("--fps", type=float, default=3.0, help="每秒候选采样帧数")
    args = parser.parse_args()

    input_path = Path(args.input)
    out_dir = Path(args.out_dir)
    if not input_path.exists():
        print(f"输入文件不存在: {input_path}", file=sys.stderr)
        sys.exit(1)

    process_input(input_path, out_dir, fps=args.fps)


if __name__ == "__main__":
    main()
