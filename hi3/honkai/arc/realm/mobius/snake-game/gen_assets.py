#!/usr/bin/env python3
"""Generate placeholder PNG image assets for the Snake game.
Each asset is a simple but recognizable graphic drawn with Pillow.
Replace these files in snake-game/asset/images/ with real art later;
file names are referenced by js/assets.js."""
import os
import math
from PIL import Image, ImageDraw, ImageFilter

IMG_DIR = os.path.join(os.path.dirname(__file__), "asset", "images")
os.makedirs(IMG_DIR, exist_ok=True)


def new_canvas(size, bg=(0, 0, 0, 0)):
    img = Image.new("RGBA", (size, size), bg)
    return img, ImageDraw.Draw(img)


def save(img, name):
    path = os.path.join(IMG_DIR, name)
    img.save(path)
    print("wrote", path)


# --- Snake Head (larger, roundish with eyes) ---
def make_head(name, base_color, eye_color=(255, 255, 255, 255), pupil=(20, 20, 40, 255)):
    size = 256
    img, d = new_canvas(size)
    # body with subtle gradient via concentric circles
    for i in range(8):
        r = 110 - i * 6
        shade = tuple(max(0, c - i * 6) for c in base_color[:3]) + (255,)
        d.ellipse([size//2 - r, size//2 - r, size//2 + r, size//2 + r], fill=shade)
    # eyes
    er = 22
    d.ellipse([size//2 - 60, size//2 - 50, size//2 - 60 + er*2, size//2 - 50 + er*2], fill=eye_color)
    d.ellipse([size//2 + 20, size//2 - 50, size//2 + 20 + er*2, size//2 - 50 + er*2], fill=eye_color)
    pr = 12
    d.ellipse([size//2 - 60 + er - pr, size//2 - 50 + er - pr, size//2 - 60 + er + pr, size//2 - 50 + er + pr], fill=pupil)
    d.ellipse([size//2 + 20 + er - pr, size//2 - 50 + er - pr, size//2 + 20 + er + pr, size//2 - 50 + er + pr], fill=pupil)
    save(img, name)


make_head("snake_head.png", (60, 170, 90, 255))

# --- Snake Follower (smaller, simple rounded square) ---
def make_follower(name, base_color):
    size = 256
    img, d = new_canvas(size)
    margin = 36
    d.rounded_rectangle([margin, margin, size - margin, size - margin], radius=40, fill=base_color)
    # highlight
    hl = tuple(min(255, c + 40) for c in base_color[:3]) + (180,)
    d.rounded_rectangle([margin + 12, margin + 12, size - margin - 40, margin + 40], radius=18, fill=hl)
    save(img, name)

make_follower("snake_follower.png", (70, 150, 80, 255))

# --- Regular Food (apple-like) ---
def make_apple(name, body=(220, 40, 50, 255), leaf=(60, 160, 70, 255)):
    size = 256
    img, d = new_canvas(size)
    cx = size // 2
    # stem
    d.line([cx, 40, cx, 80], fill=(110, 70, 40, 255), width=10)
    # leaf
    d.ellipse([cx, 36, cx + 50, 72], fill=leaf)
    # body
    d.ellipse([50, 80, 206, 226], fill=body)
    # highlight
    d.ellipse([78, 104, 120, 146], fill=(255, 180, 180, 180))
    save(img, name)

make_apple("food_regular.png")

# --- Big Food (golden star) ---
def make_star(name, points=5, color=(255, 200, 30, 255), outline=(180, 130, 0, 255)):
    size = 256
    img, d = new_canvas(size)
    cx, cy = size // 2, size // 2
    outer, inner = 110, 48
    pts = []
    for i in range(points * 2):
        r = outer if i % 2 == 0 else inner
        ang = -math.pi / 2 + i * math.pi / points
        pts.append((cx + r * math.cos(ang), cy + r * math.sin(ang)))
    d.polygon(pts, fill=color, outline=outline)
    # shine
    d.ellipse([cx - 30, cy - 40, cx - 10, cy - 20], fill=(255, 255, 220, 200))
    save(img, name)

make_star("food_big.png")

# --- Bomb (black sphere with fuse) ---
def make_bomb(name):
    size = 256
    img, d = new_canvas(size)
    cx, cy = size // 2, size // 2 + 10
    # body
    d.ellipse([50, 70, 206, 226], fill=(40, 40, 50, 255))
    # highlight
    d.ellipse([80, 100, 120, 140], fill=(110, 110, 130, 200))
    # fuse
    d.line([cx, 70, cx + 30, 30], fill=(180, 140, 60, 255), width=8)
    # spark
    d.ellipse([cx + 22, 18, cx + 48, 44], fill=(255, 200, 60, 255))
    d.ellipse([cx + 28, 24, cx + 42, 38], fill=(255, 240, 180, 255))
    save(img, name)

make_bomb("bomb.png")

# --- Background (subtle grid-free texture) ---
def make_background(name):
    w, h = 1280, 800
    img = Image.new("RGBA", (w, h), (24, 30, 38, 255))
    d = ImageDraw.Draw(img)
    # radial vignette-ish blobs
    import random
    random.seed(7)
    for _ in range(40):
        x = random.randint(0, w)
        y = random.randint(0, h)
        r = random.randint(80, 220)
        col = (random.randint(30, 60), random.randint(45, 75), random.randint(60, 90), 40)
        d.ellipse([x - r, y - r, x + r, y + r], fill=col)
    img = img.filter(ImageFilter.GaussianBlur(40))
    # subtle dark vignette at edges
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    for i in range(80):
        a = int(2 + i * 0.8)
        od.rectangle([i, i, w - i, h - i], outline=(0, 0, 0, a))
    img = Image.alpha_composite(img, overlay)
    save(img, name)

make_background("background.png")

# --- Menu background ---
def make_menu_bg(name):
    w, h = 1280, 800
    img = Image.new("RGBA", (w, h), (18, 22, 30, 255))
    d = ImageDraw.Draw(img)
    import random
    random.seed(11)
    for _ in range(60):
        x = random.randint(0, w); y = random.randint(0, h)
        r = random.randint(40, 180)
        col = (random.randint(20, 50), random.randint(30, 60), random.randint(50, 90), 55)
        d.ellipse([x - r, y - r, x + r, y + r], fill=col)
    img = img.filter(ImageFilter.GaussianBlur(50))
    save(img, name)

make_menu_bg("menu_background.png")

print("All images generated.")
