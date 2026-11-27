#!/usr/bin/env python3
"""
智能多屏续拼长图脚本（支持连续 ⌘V 粘贴飞书文档或 App 多屏截图自动接成长图）

针对飞书文档「大面积白底 + 细文字」专门优化：
- 不使用容易被白底稀释的全局平均像素差，而采用「非白墨水/边框像素重叠率（Edge/Ink Alignment）」进行高精度匹配；
- 若两张图无重叠区，则自动检测并裁除顶部重复的飞书/浏览器固定顶栏后等宽顺滑拼接。
"""

import argparse
import json
import sys
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageStat


def normalize_width(base_im: Image.Image, next_im: Image.Image) -> Image.Image:
    bw, _ = base_im.size
    nw, nh = next_im.size
    if nw == bw:
        return next_im
    new_h = max(32, int(round(nh * (bw / float(nw)))))
    return next_im.resize((bw, new_h), Image.Resampling.LANCZOS)


def make_ink_mask(gray_im: Image.Image) -> Image.Image:
    """提取文字、分割线与卡片边框等有效信息像素（过滤大面积纯白底干扰）。"""
    edges = gray_im.filter(ImageFilter.FIND_EDGES)
    # 边缘强度 > 18 或灰度明显偏深（< 228）视为有效视觉特征像素
    dark = gray_im.point(lambda p: 255 if p < 226 else 0)
    edge_bin = edges.point(lambda p: 255 if p > 18 else 0)
    return ImageChops.lighter(dark, edge_bin)


def ink_mismatch_score(gray_a: Image.Image, gray_b: Image.Image, ink_a: Image.Image, ink_b: Image.Image):
    """
    计算两块图像仅在「有内容（非纯白）」区域的差异程度。
    返回值越小代表内容越一致；若两块都没有足够内容则返回 None。
    """
    union_ink = ImageChops.lighter(ink_a, ink_b)
    ink_pixels = ImageStat.Stat(union_ink).sum[0] / 255.0
    total_pixels = gray_a.size[0] * gray_a.size[1]
    if ink_pixels < max(25.0, total_pixels * 0.015):
        return None

    diff = ImageChops.difference(gray_a, gray_b)
    # 只统计落在 union_ink 区域内的像素差异
    masked_diff = ImageChops.darker(diff, union_ink)
    diff_sum = ImageStat.Stat(masked_diff).sum[0]
    return diff_sum / ink_pixels


def find_overlap_cut(base_im: Image.Image, next_im: Image.Image):
    w, hb = base_im.size
    _, hn = next_im.size
    if hb < 160 or hn < 160 or w < 160:
        return None

    tail_h = min(hb, int(hn * 1.25))
    tail_offset = hb - tail_h
    tail_im = base_im.crop((0, tail_offset, w, hb))

    scale = min(1.0, 440.0 / float(w))
    sw = max(120, int(round(w * scale)))
    sh_tail = max(80, int(round(tail_h * scale)))
    sh_next = max(80, int(round(hn * scale)))

    g_tail = tail_im.convert("L").resize((sw, sh_tail), Image.Resampling.BILINEAR)
    g_next = next_im.convert("L").resize((sw, sh_next), Image.Resampling.BILINEAR)
    ink_tail = make_ink_mask(g_tail)
    ink_next = make_ink_mask(g_next)

    x0, x1 = int(sw * 0.04), int(sw * 0.96)
    top_guard = int(sh_next * 0.11)
    bot_guard = int(sh_next * 0.04)

    # 在 next_im 的 11%~52% 区间内自动挑选「信息密度最高」的条带作为锚点（避开纯白段落间隙）
    strip_h = max(24, int(sh_next * 0.16))
    best_ref_y = None
    best_ink_density = 0.0
    for ry in range(top_guard, int(sh_next * 0.50) - strip_h + 1, 6):
        ink_sum = ImageStat.Stat(ink_next.crop((x0, ry, x1, ry + strip_h))).sum[0]
        if ink_sum > best_ink_density:
            best_ink_density = ink_sum
            best_ref_y = ry

    if best_ref_y is None or best_ink_density < 255.0 * 30:
        return None

    ref_g = g_next.crop((x0, best_ref_y, x1, best_ref_y + strip_h))
    ref_i = ink_next.crop((x0, best_ref_y, x1, best_ref_y + strip_h))

    max_yt = sh_tail - strip_h - bot_guard
    if max_yt <= 4:
        return None

    best_yt = None
    best_score = 999.0

    for yt in range(4, max_yt + 1, 2):
        cand_g = g_tail.crop((x0, yt, x1, yt + strip_h))
        cand_i = ink_tail.crop((x0, yt, x1, yt + strip_h))
        sc = ink_mismatch_score(ref_g, cand_g, ref_i, cand_i)
        if sc is not None and sc < best_score:
            best_score = sc
            best_yt = yt

    if best_yt is None or best_score > 28.0:
        return None

    # 细搜 1px
    for yt in range(max(2, best_yt - 2), min(max_yt, best_yt + 2) + 1):
        sc = ink_mismatch_score(
            ref_g,
            g_tail.crop((x0, yt, x1, yt + strip_h)),
            ref_i,
            ink_tail.crop((x0, yt, x1, yt + strip_h)),
        )
        if sc is not None and sc < best_score:
            best_score = sc
            best_yt = yt

    if best_score > 20.0:
        return None

    # 扩展校验整个重叠窗口（从 top_guard 往下一直到 tail 底部），防止巧合局部一致
    delta_top = best_ref_y - top_guard
    ov_tail_start = best_yt - delta_top
    ov_next_start = top_guard
    if ov_tail_start < 0:
        shift_fix = -ov_tail_start
        ov_tail_start = 0
        ov_next_start += shift_fix

    ov_h = min(sh_tail - bot_guard - ov_tail_start, sh_next - bot_guard - ov_next_start)
    if ov_h < strip_h:
        return None

    full_ov_score = ink_mismatch_score(
        g_next.crop((x0, ov_next_start, x1, ov_next_start + ov_h)),
        g_tail.crop((x0, ov_tail_start, x1, ov_tail_start + ov_h)),
        ink_next.crop((x0, ov_next_start, x1, ov_next_start + ov_h)),
        ink_tail.crop((x0, ov_tail_start, x1, ov_tail_start + ov_h)),
    )
    if full_ov_score is None or full_ov_score > 18.0:
        return None

    # 换算到原图分辨率并做全分辨率精配 + 严格非白文字像素校验（彻底杜绝相似空卡片误配）
    full_ref_y = int(round(best_ref_y / scale))
    full_strip_h = max(28, int(round(strip_h / scale)))
    approx_full_yt = int(round(best_yt / scale))

    ox0, ox1 = int(w * 0.05), int(w * 0.95)
    g_tail_full = tail_im.convert("L")
    g_next_full = next_im.convert("L")
    ref_full = g_next_full.crop((ox0, full_ref_y, ox1, full_ref_y + full_strip_h))

    best_full_yt = approx_full_yt
    best_full_err = 999.0
    search_r = max(6, int(round(4.0 / scale)))
    for fyt in range(max(0, approx_full_yt - search_r), min(tail_h - full_strip_h, approx_full_yt + search_r) + 1):
        err = ImageStat.Stat(
            ImageChops.difference(ref_full, g_tail_full.crop((ox0, fyt, ox1, fyt + full_strip_h)))
        ).mean[0]
        if err < best_full_err:
            best_full_err = err
            best_full_yt = fyt

    # 原图严格校验：非白内容差异必须极低（不同段落文字会高达 40~120）
    cand_full = g_tail_full.crop((ox0, best_full_yt, ox1, best_full_yt + full_strip_h))
    full_ink_sc = ink_mismatch_score(
        ref_full,
        cand_full,
        make_ink_mask(ref_full),
        make_ink_mask(cand_full),
    )
    if best_full_err > 5.0 or full_ink_sc is None or full_ink_sc > 16.0:
        return None

    cut_in_base = tail_offset + best_full_yt
    cut_in_next = full_ref_y
    if (hn - cut_in_next) <= (hb - cut_in_base) + 12:
        return None

    return (cut_in_base, cut_in_next)


def detect_identical_sticky_header(base_im: Image.Image, next_im: Image.Image) -> int:
    w, hb = base_im.size
    _, hn = next_im.size
    check_h = min(int(hn * 0.14), int(hb * 0.14), 200)
    if check_h < 24:
        return 0

    gb = base_im.crop((0, 0, w, check_h)).convert("L")
    gn = next_im.crop((0, 0, w, check_h)).convert("L")
    diff = ImageChops.difference(gb, gn)

    same_rows = 0
    for y in range(0, check_h, 2):
        row_err = ImageStat.Stat(diff.crop((int(w * 0.05), y, int(w * 0.95), min(check_h, y + 2)))).mean[0]
        if row_err < 4.5:
            same_rows = y + 2
        else:
            break

    return same_rows if same_rows >= 28 else 0


def stitch_two_images(base_im: Image.Image, raw_next_im: Image.Image):
    base_rgb = base_im.convert("RGB")
    next_rgb = normalize_width(base_rgb, raw_next_im.convert("RGB"))
    w, hb = base_rgb.size
    _, hn = next_rgb.size

    overlap = find_overlap_cut(base_rgb, next_rgb)
    if overlap is not None:
        cut_b, cut_n = overlap
        added_h = hn - cut_n
        total_h = cut_b + added_h
        canvas = Image.new("RGB", (w, total_h), (255, 255, 255))
        canvas.paste(base_rgb.crop((0, 0, w, cut_b)), (0, 0))

        feather = min(8, cut_b, cut_n)
        if feather > 0:
            top_s = base_rgb.crop((0, cut_b - feather, w, cut_b))
            bot_s = next_rgb.crop((0, cut_n - feather, w, cut_n))
            for r in range(feather):
                alpha = (r + 1) / float(feather + 1)
                row_im = Image.blend(top_s.crop((0, r, w, r + 1)), bot_s.crop((0, r, w, r + 1)), alpha)
                canvas.paste(row_im, (0, cut_b - feather + r))

        canvas.paste(next_rgb.crop((0, cut_n, w, hn)), (0, cut_b))
        return canvas, "overlap"

    trim_top = detect_identical_sticky_header(base_rgb, next_rgb)
    cropped_next = next_rgb.crop((0, trim_top, w, hn))
    sep_h = 2
    total_h = hb + sep_h + cropped_next.size[1]
    canvas = Image.new("RGB", (w, total_h), (255, 255, 255))
    canvas.paste(base_rgb, (0, 0))
    draw = ImageDraw.Draw(canvas)
    draw.rectangle((0, hb, w, hb + sep_h), fill=(226, 232, 240))
    canvas.paste(cropped_next, (0, hb + sep_h))
    return canvas, "stack"


def main():
    parser = argparse.ArgumentParser(description="智能续拼长图")
    parser.add_argument("--base", required=True, help="当前已有底图路径")
    parser.add_argument("--append", required=True, help="新粘贴的下一屏图片路径")
    parser.add_argument("--output", required=True, help="输出合并长图路径")
    args = parser.parse_args()

    base_p = Path(args.base)
    app_p = Path(args.append)
    out_p = Path(args.output)

    if not base_p.exists() or not app_p.exists():
        print("输入图片不存在", file=sys.stderr)
        sys.exit(1)

    with Image.open(base_p) as im_b, Image.open(app_p) as im_a:
        merged, mode = stitch_two_images(im_b, im_a)

    out_p.parent.mkdir(parents=True, exist_ok=True)
    merged.save(out_p, format="PNG")
    print(json.dumps({"ok": True, "mode": mode, "width": merged.size[0], "height": merged.size[1]}))


if __name__ == "__main__":
    main()
