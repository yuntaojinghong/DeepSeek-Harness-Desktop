"""
DeepSeek Harness 桌面版 · NSIS 安装程序品牌图片生成

输出:
  installer-header.bmp / .png   (150 x 57, 24-bit)
  installer-sidebar.bmp / .png  (164 x 314, 24-bit)

依赖: Pillow, assets/whale.png (由 assets/whale.svg 栅格化生成)
"""

import os
import random
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
WHALE = os.path.join(HERE, "assets", "whale.png")
HEADER_BMP = os.path.join(HERE, "installer-header.bmp")
HEADER_PNG = os.path.join(HERE, "installer-header.png")
SIDEBAR_BMP = os.path.join(HERE, "installer-sidebar.bmp")
SIDEBAR_PNG = os.path.join(HERE, "installer-sidebar.png")

# 品牌色（深空蓝紫）
TOP = (16, 33, 74)        # #10214a
MID = (10, 18, 48)        # #0a1230
BOT = (24, 18, 70)        # #181246
CYAN = (34, 211, 238)     # #22d3ee
INDIGO = (99, 102, 241)   # #6366f1
LIGHT = (234, 246, 255)
DIM = (159, 176, 208)


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def gradient(w, h, top, bot):
    img = Image.new("RGB", (w, h))
    px = img.load()
    for y in range(h):
        c = lerp(top, bot, y / max(1, h - 1))
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
        s = rng.choice([1, 1, 1, 2])
        a = rng.randint(90, max_alpha)
        d.rectangle([x, y, x + s - 1, y + s - 1], fill=(255, 255, 255, a))
    return layer


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


def glow(size, color, alpha=160, blur=20):
    g = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(g)
    d.ellipse([0, 0, size - 1, size - 1], fill=color + (alpha,))
    return g.filter(ImageFilter.GaussianBlur(blur))


def paste_whale(canvas_rgb, whale, size, center, glow_color=CYAN, glow_alpha=150, glow_blur=22):
    w = whale.resize((size, size), Image.LANCZOS).convert("RGBA")
    g = glow(int(size * 0.9), glow_color, alpha=glow_alpha, blur=glow_blur)
    canvas = canvas_rgb.convert("RGBA")
    cx, cy = center
    canvas.alpha_composite(g, (cx - g.width // 2, cy - g.height // 2))
    canvas.alpha_composite(w, (cx - w.width // 2, cy - w.height // 2))
    return canvas.convert("RGB")


def make_header():
    w, h = 150, 57
    img = gradient(w, h, TOP, BOT)
    img = img.convert("RGBA")
    img.alpha_composite(stars(w, h, 18, seed=3))

    img = paste_whale(img, Image.open(WHALE).convert("RGBA"), 36, (24, h // 2),
                      glow_color=CYAN, glow_alpha=130, glow_blur=12)

    d = ImageDraw.Draw(img)
    f_name = load_font(11, bold=True)
    f_sub = load_font(8, bold=False)
    f_ver = load_font(7, bold=False)
    d.text((48, 11), "DeepSeek Harness", fill=LIGHT, font=f_name)
    d.text((48, 28), "AI Desktop Workbench", fill=DIM, font=f_sub)
    d.text((48, 42), "v0.3.0", fill=CYAN, font=f_ver)
    # 底部青色高光线
    d.rectangle([0, h - 2, w - 1, h - 1], fill=CYAN)
    # 左侧竖线高亮
    d.rectangle([0, 0, 1, h - 1], fill=CYAN)
    return img.convert("RGB")


def make_sidebar():
    w, h = 164, 314
    img = gradient(w, h, TOP, BOT)
    img = img.convert("RGBA")
    img.alpha_composite(stars(w, h, 55, seed=11))

    cx = w // 2
    # 环形轨道（在鲸鱼后面）
    d = ImageDraw.Draw(img)
    d.ellipse([cx - 64, 78, cx + 64, 206], outline=(*CYAN, 80), width=1)
    d.ellipse([cx - 76, 66, cx + 76, 218], outline=(*INDIGO, 60), width=1)

    img = paste_whale(img, Image.open(WHALE).convert("RGBA"), 92, (cx, 92),
                      glow_color=CYAN, glow_alpha=170, glow_blur=24)

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
    d.text(((w - (bb3[2] - bb3[0])) // 2, 228), ver, fill=CYAN, font=f_ver)

    # 底部品牌点缀
    tag = "STAR CORE"
    bb4 = d.textbbox((0, 0), tag, font=f_ver)
    d.text(((w - (bb4[2] - bb4[0])) // 2, h - 22), tag, fill=DIM, font=f_ver)
    return img.convert("RGB")


def main():
    if not os.path.exists(WHALE):
        raise SystemExit(f"missing {WHALE} (run: node -e \"sharp('assets/whale.svg',{density:300}).resize(512,512).png().toFile('assets/whale.png')\")")

    header = make_header()
    sidebar = make_sidebar()

    header.save(HEADER_PNG, "PNG")
    sidebar.save(SIDEBAR_PNG, "PNG")
    header.save(HEADER_BMP, "BMP")
    sidebar.save(SIDEBAR_BMP, "BMP")

    for f in (HEADER_BMP, HEADER_PNG, SIDEBAR_BMP, SIDEBAR_PNG):
        print(f"{os.path.basename(f)}: {os.path.getsize(f):>6} bytes")


if __name__ == "__main__":
    main()
