import re, pathlib

base = pathlib.Path("/Users/shilv/Agent-Workspace/Projects/laka/requirements/active/20260710-wishlist-gift/Reference image/admin_ui_render")

for name in ["page1", "page2", "page3"]:
    html = (base / f"{name}.html").read_text(encoding="utf-8")
    # 去掉「新增关联」弹窗
    html = re.sub(r'<div class="overlay">.*?</body>', '</body>', html, flags=re.S)
    # 去掉详情/趋势抽屉
    html = re.sub(r'<div class="drawer-overlay">.*?</body>', '</body>', html, flags=re.S)
    # 兜底：移除任何残留的 overlay / drawer 标签
    html = re.sub(r'<div class="overlay">[\s\S]*?</div>\s*</body>', '</body>', html)
    html = re.sub(r'<div class="drawer">[\s\S]*?</div>\s*</body>', '</body>', html)
    (base / f"{name}_clean.html").write_text(html, encoding="utf-8")
    print("wrote", f"{name}_clean.html")
