"""
DeepSeek Harness Desktop · NSIS 安装程序品牌图片生成

输出到 src-tauri/icons/：
  installer-header.bmp / .png   (150 x 57, 24-bit)   — 向导顶部品牌条
  installer-sidebar.bmp / .png  (164 x 314, 24-bit)  — 欢迎/完成页左侧大图

依赖：Pillow + assets/whale.png（白色鲸鱼，透明背景，由 assets/whale.svg 栅格化）
"""

import os
import math
import random
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
WHALE = os.path.join(HERE, "assets", "whale.png")
OUT = os.path.join(HERE, "src-tauri", "icons")

HEADER_BMP = os.path.join(OUT, "installer-header.bmp")
HEADER_PNG = os.path.join(OUT, "installer-header.png")
SIDEBAR_BMP = os.path.join(OUT, "installer-sidebar.bmp")
SIDEBAR_PNG = os.path.join(OUT, "installer-sidebar.png")

# 品牌色（深空蓝紫 + 青）
TOP = (18, 36, 80)
MID = (11, 19, 50)
BOT = (28, 19, 76)
CYAN = (34, 211, 238)
SOFT_CYAN = (103, 232, 249)
INDIGO = (99, 102, 241)
LIGHT = (234, 246, 255)
DIM = (160, 178, 212)


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def gradient_3(w, h, c0, c1, c2):
    """三段渐变：0 -> mid -> 1"""
    img = Image.new("RGB", (w, h))
    px = img.load()
    for y in range(h):
        t = y / max(1, h - 1)
        if t < 0.5:
            c = lerp(c0, c1, t / 0.5)
        else:
            c = lerp(c1, c2, (t - 0.5) / 0.5)
        for x in range(w):
            px[x, y] = c
    return img


def stars(w, h, count, seed=7, max_alpha=200):
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    rng = random.Random(seed)
    d = ImageDraw.Draw(layer)
    for _ in range(count):
        x = rng.randint(0, w - 1)
        y = rng.randint(0, h - 1)
        s = rng.choice([1, 1, 1, 1, 2, 2])
        a = rng.randint(70, max_alpha)
        # 偏青的白星
        tint = rng.choice([(255, 255, 255), (220, 240, 255), (103, 232, 249)])
        d.rectangle([x, y, x + s - 1, y + s - 1], fill=tint + (a,))
    return layer


def glow(size, color, alpha=160, blur=20):
    g = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(g)
    d.ellipse([0, 0, size - 1, size - 1], fill=color + (alpha,))
    return g.filter(ImageFilter.GaussianBlur(blur))


def load_font(size, bold=False):
    candidates = [
        r"C:\Windows\Fonts\segoeuib.ttf" if bold else r"C:\Windows\Fonts\segoeui.ttf",
        r"C:\Windows\Fonts\arialbd.ttf" if bold else r"C:\Windows\Fonts\arial.ttf",
        r"C:\Windows\Fonts\calibrib.ttf" if bold else r"C:\Windows\Fonts\calibri.ttf",
    ]
    for p in candidates:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                pass
    return ImageFont.load_default()


def paste_whale(canvas_rgb, whale, size, center, glow_color=CYAN, glow_alpha=170, glow_blur=24):
    """双层辉光 + 白色鲸鱼"""
    w = whale.resize((size, size), Image.LANCZOS).convert("RGBA")
    canvas = canvas_rgb.convert("RGBA")
    cx, cy = center
    # 外层大范围淡辉光
    g1 = glow(int(size * 1.5), glow_color, alpha=int(glow_alpha * 0.5), blur=glow_blur + 10)
    canvas.alpha_composite(g1, (cx - g1.width // 2, cy - g1.height // 2))
    # 内层亮辉光
    g2 = glow(int(size * 0.95), glow_color, alpha=glow_alpha, blur=glow_blur)
    canvas.alpha_composite(g2, (cx - g2.width // 2, cy - g2.height // 2))
    canvas.alpha_composite(w, (cx - w.width // 2, cy - w.height // 2))
    return canvas.convert("RGB")


def orbit_ring(draw, cx, cy, r, color, width=1, dash=None, rotate=0):
    """画一条轨道环（可选虚线 + 旋转弧段）"""
    bbox = [cx - r, cy - r, cx + r, cy + r]
    if dash:
        # 用两段弧拼出虚线环
        step = dash[0] + dash[1]
        seg = int(360 / step) + 1
        for i in range(seg):
            a0 = rotate + i * step
            a1 = a0 + dash[0]
            draw.arc(bbox, a0, a1, fill=color + (int(255 * 0.7),), width=width)
    else:
        draw.ellipse(bbox, outline=color + (120,), width=width)


def make_header():
    w, h = 150, 57
    img = gradient_3(w, h, TOP, MID, BOT)
    img = img.convert("RGBA")
    img.alpha_composite(stars(w, h, 22, seed=3))

    # 斜向扫描亮带
    scan = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ds = ImageDraw.Draw(scan)
    ds.line([(120, 0), (150, 40)], fill=(103, 232, 249, 60), width=14)
    img.alpha_composite(scan.filter(ImageFilter.GaussianBlur(8)), (0, 0))

    img = paste_whale(img, Image.open(WHALE).convert("RGBA"), 36, (24, h // 2),
                      glow_color=CYAN, glow_alpha=140, glow_blur=12)

    d = ImageDraw.Draw(img)
    f_name = load_font(11, bold=True)
    f_sub = load_font(8, bold=False)
    f_ver = load_font(7, bold=False)
    d.text((48, 11), "DeepSeek Harness", fill=LIGHT, font=f_name)
    d.text((48, 28), "AI Desktop Workbench", fill=DIM, font=f_sub)
    d.text((48, 42), "v0.3.0", fill=SOFT_CYAN, font=f_ver)
    # 底部渐变高光线 + 左侧竖线
    d.rectangle([0, h - 2, w - 1, h - 1], fill=CYAN)
    d.rectangle([0, 0, 1, h - 1], fill=SOFT_CYAN)
    return img.convert("RGB")


def make_sidebar():
    w, h = 164, 314
    img = gradient_3(w, h, TOP, MID, BOT)
    img = img.convert("RGBA")
    img.alpha_composite(stars(w, h, 70, seed=11))

    cx, cy = w // 2, 92
    d = ImageDraw.Draw(img)
    # 多层轨道环
    orbit_ring(d, cx, cy, 64, CYAN, width=1)
    orbit_ring(d, cx, cy, 76, INDIGO, width=1, dash=(12, 10), rotate=-30)
    orbit_ring(d, cx, cy, 90, CYAN, width=1, dash=(6, 26), rotate=60)

    img = paste_whale(img, Image.open(WHALE).convert("RGBA"), 92, (cx, cy),
                      glow_color=CYAN, glow_alpha=180, glow_blur=24)

    d = ImageDraw.Draw(img)
    f_name = load_font(15, bold=True)
    f_sub = load_font(10, bold=False)
    f_ver = load_font(9, bold=False)

    name = "DeepSeek Harness"
    bb = d.textbbox((0, 0), name, font=f_name)
    d.text(((w - (bb[2] - bb[0])) // 2, 184), name, fill=LIGHT, font=f_name)
    sub = "AI Desktop Workbench"
    bb2 = d.textbbox((0, 0), sub, font=f_sub)
    d.text(((w - (bb2[2] - bb2[0])) // 2, 206), sub, fill=DIM, font=f_sub)
    d.line([(cx - 30, 222), (cx + 30, 222)], fill=(*CYAN, 170), width=1)
    ver = "v0.3.0"
    bb3 = d.textbbox((0, 0), ver, font=f_ver)
    d.text(((w - (bb3[2] - bb3[0])) // 2, 228), ver, fill=SOFT_CYAN, font=f_ver)

    tag = "STAR CORE"
    bb4 = d.textbbox((0, 0), tag, font=f_ver)
    d.text(((w - (bb4[2] - bb4[0])) // 2, h - 24), tag, fill=DIM, font=f_ver)
    return img.convert("RGB")


def main():
    if not os.path.exists(WHALE):
        raise SystemExit(f"missing {WHALE}")
    os.makedirs(OUT, exist_ok=True)

    header = make_header()
    sidebar = make_sidebar()
    header.save(HEADER_PNG, "PNG")
    sidebar.save(SIDEBAR_PNG, "PNG")
    header.save(HEADER_BMP, "BMP")
    sidebar.save(SIDEBAR_BMP, "BMP")

    for f in (HEADER_BMP, HEADER_PNG, SIDEBAR_BMP, SIDEBAR_PNG):
        print(f"{os.path.relpath(f, HERE)}: {os.path.getsize(f)} bytes")


if __name__ == "__main__":
    main()
