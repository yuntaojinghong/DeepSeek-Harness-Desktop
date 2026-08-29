import struct, os, math

def make_bmp_8bit(width, height, pixels_rgb, palette_rgb):
    # pixels_rgb: list of rows (top->bottom), each row list of (r,g,b)
    # palette_rgb: list of up to 256 (r,g,b) tuples
    assert len(palette_rgb) <= 256
    # pad palette to 256 entries with black
    while len(palette_rgb) < 256:
        palette_rgb.append((0, 0, 0))

    # build pixel index data using nearest-neighbor quantization
    def nearest(r, g, b):
        best = 0
        best_d = 1 << 30
        for i, (pr, pg, pb) in enumerate(palette_rgb):
            d = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2
            if d < best_d:
                best_d = d
                best = i
        return best

    raw = b''
    for y in range(height - 1, -1, -1):  # bottom-up
        row = bytes(nearest(*pixels_rgb[y][x]) for x in range(width))
        # 4-byte row align
        pad = (4 - (len(row) % 4)) % 4
        raw += row + b'\x00' * pad

    file_header = struct.pack('<2sIHHI', b'BM', 14 + 40 + 1024 + len(raw), 0, 0, 14 + 40 + 1024)
    info_header = struct.pack('<IiiHHIIiiII', 40, width, -height, 1, 8, 0, len(raw), 2835, 2835, 256, 0)
    palette = b''
    for r, g, b in palette_rgb:
        palette += bytes([b, g, r, 0])
    return file_header + info_header + palette + raw

def build_palette():
    # Deep space gradient + star white + orbit cyan
    pal = []
    # deep blue -> deep purple gradient (200 entries)
    top = (11, 17, 38)
    bot = (27, 16, 64)
    for i in range(200):
        t = i / 199
        pal.append(tuple(int(top[c] + (bot[c] - top[c]) * t) for c in range(3)))
    # star white shades (40 entries: 0..255 white mixed with deep blue)
    for i in range(40):
        t = i / 39
        r = int(11 + (255 - 11) * t)
        g = int(17 + (255 - 17) * t)
        b = int(38 + (255 - 38) * t)
        pal.append((r, g, b))
    # orbit cyan shades (16 entries: deep blue -> bright cyan)
    for i in range(16):
        t = i / 15
        r = int(56 + (56 - 56) * t)
        g = int(189 + (248 - 189) * t)
        b = int(248 + (255 - 248) * t)
        pal.append((r, g, b))
    return pal

def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))

def render(w, h, cx, cy, spark_rx, spark_ry, with_ring=False, ring_rx=0, ring_ry=0):
    top = (11, 17, 38)
    bot = (27, 16, 64)
    px = [[(0, 0, 0) for _ in range(w)] for _ in range(h)]
    for y in range(h):
        t = y / max(1, h - 1)
        base = lerp(top, bot, t)
        for x in range(w):
            r, g, b = base
            u = abs(x - cx) / spark_rx
            v = abs(y - cy) / spark_ry
            s = (u ** 0.5 + v ** 0.5)
            if s < 1.0:
                k = (1.0 - s) ** 2
                r = int(r + (255 - r) * k)
                g = int(g + (255 - g) * k)
                b = int(b + (255 - b) * k)
            if with_ring and ring_rx > 0:
                dx = (x - cx) / ring_rx
                dy = (y - cy) / ring_ry
                d = abs(math.hypot(dx, dy) - 1.0)
                if d < 0.06:
                    k = (1.0 - d / 0.06) * 0.8
                    r = int(r + (56 - r) * k)
                    g = int(g + (189 - g) * k)
                    b = int(b + (248 - b) * k)
            px[y][x] = (min(255, r), min(255, g), min(255, b))
    return px

pal = build_palette()
hdr = render(150, 57, 75, 28, 34, 20)
with open('installer-header.bmp', 'wb') as f:
    f.write(make_bmp_8bit(150, 57, hdr, pal))

sdb = render(164, 314, 82, 150, 52, 46, with_ring=True, ring_rx=60, ring_ry=70)
with open('installer-sidebar.bmp', 'wb') as f:
    f.write(make_bmp_8bit(164, 314, sdb, pal))

# remove old png
for f in ('installer-header.png', 'installer-sidebar.png'):
    if os.path.exists(f):
        try: os.remove(f)
        except: pass

print("8-bit BMP:", os.path.getsize('installer-header.bmp'), os.path.getsize('installer-sidebar.bmp'))
