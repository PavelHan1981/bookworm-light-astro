# -*- coding: utf-8 -*-
"""构建产物校验：坏链、hreflang 悬空、英文页中文残留、索引统计。"""
import os, re, sys, json
import html as htmllib
from urllib.parse import unquote

DIST = "dist"
BASE = "https://pavelhan.tech"

# dist 中实际存在的路径（URL 形式，无扩展名）
def collect_urls():
    urls = set()
    for root, _, files in os.walk(DIST):
        for f in files:
            p = os.path.join(root, f)
            rel = "/" + os.path.relpath(p, DIST).replace("\\", "/")
            urls.add(unquote(rel))
            if rel.endswith("/index.html"):
                u = rel[: -len("/index.html")]
                urls.add(unquote(u) or "/")
            elif rel.endswith(".html"):
                urls.add(unquote(rel[: -len(".html")]))
    # 归一化：去尾斜杠（除根）
    norm = set()
    for u in urls:
        if u != "/" and u.endswith("/"):
            u = u.rstrip("/")
        norm.add(u)
    return norm

URLS = collect_urls()

def exists(path):
    path = htmllib.unescape(path)
    path = unquote(path.split("#")[0].split("?")[0])
    if path == "":
        path = "/"
    if path in URLS:
        return True
    if path.rstrip("/") in URLS:
        return True
    if path + "/" in URLS:
        return True
    return False

LINK_RE = re.compile(r'(?:href|src)="([^"]+)"')
broken = {}
cjk_en = {}
hreflang_targets = {}
missing_hreflang = {}

CJK = re.compile(r"[\u3400-\u4dbf\u4e00-\u9fff]")
# 允许出现的少量中文：无（英文页必须纯净）
for root, _, files in os.walk(DIST):
    for f in files:
        if not f.endswith(".html"):
            continue
        p = os.path.join(root, f)
        rel = "/" + os.path.relpath(p, DIST).replace("\\", "/")
        url = unquote(rel)
        if url.endswith("/index.html"):
            url = url[: -len("/index.html")] or "/"
        html = open(p, encoding="utf-8", errors="ignore").read()

        for m in LINK_RE.finditer(html):
            href = htmllib.unescape(m.group(1))
            if href.startswith(("http://", "https://", "mailto:", "tel:", "data:", "#", "//")):
                continue
            if href.startswith(BASE):
                href = href[len(BASE):] or "/"
            if not href.startswith("/"):
                continue
            if not exists(href):
                broken.setdefault(url, set()).add(href)

        if url.startswith("/en"):
            hits = CJK.findall(html)
            if hits:
                cjk_en[url] = len(hits)

        for m in re.finditer(r'<link[^>]+hreflang="[^"]+"[^>]+href="([^"]+)"', html):
            t = m.group(1).replace(BASE, "") or "/"
            hreflang_targets.setdefault(url, set()).add(t)

for page, targets in hreflang_targets.items():
    for t in targets:
        if not exists(t):
            missing_hreflang.setdefault(page, set()).add(t)

print("=" * 60)
print("HTML 页面数:", sum(1 for r, _, fs in os.walk(DIST) for f in fs if f.endswith(".html")))
print("坏链页面数:", len(broken), " 坏链总数:", sum(len(v) for v in broken.values()))
for page, refs in sorted(broken.items())[:25]:
    print("  ", page, "->", sorted(refs)[:5])
print("-" * 60)
print("含中文的 /en 页面:", len(cjk_en))
for page, n in sorted(cjk_en.items(), key=lambda x: -x[1])[:20]:
    print("  ", page, n, "个汉字")
print("-" * 60)
print("hreflang 悬空页面数:", len(missing_hreflang))
for page, refs in sorted(missing_hreflang.items())[:15]:
    print("  ", page, "->", sorted(refs)[:4])
print("-" * 60)

# 索引统计
noindex = 0
total = 0
for root, _, files in os.walk(DIST):
    for f in files:
        if not f.endswith(".html"):
            continue
        total += 1
        html = open(os.path.join(root, f), encoding="utf-8", errors="ignore").read()
        if 'name="robots"' in html and "noindex" in html.split('name="robots"')[1][:80]:
            noindex += 1
print("总 HTML:", total, " noindex:", noindex, " 可索引:", total - noindex)

sm = os.path.join(DIST, "sitemap-0.xml")
if os.path.exists(sm):
    xml = open(sm, encoding="utf-8").read()
    locs = re.findall(r"<loc>([^<]+)</loc>", xml)
    print("sitemap URL 数:", len(locs))
    print("  zh:", sum(1 for l in locs if "/zh" in l or re.search(r"pavelhan\.tech/zh", l)))
    print("  en:", sum(1 for l in locs if "/en" in l))
    missing = [l for l in locs if not exists(l.replace(BASE, "") or "/")]
    print("  sitemap 中 404 的 URL:", len(missing), missing[:5])
