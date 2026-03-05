#!/usr/bin/env python3
"""
Hoai Niem - Placeholder Image Generator
Creates simple placeholder images for testing.
"""

from PIL import Image, ImageDraw, ImageFont
import os

# Directories
BACKGROUNDS_DIR = "images/backgrounds"
CHARACTERS_DIR = "images/characters"

# Background sizes
BG_WIDTH = 1280
BG_HEIGHT = 720

# Character sizes
CHAR_WIDTH = 600
CHAR_HEIGHT = 900

# Colors
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
HOAI_COLOR = (255, 107, 157)  # Pink
NIEM_COLOR = (107, 179, 255)  # Blue

def create_gradient(width, height, color1, color2, direction="vertical"):
    """Create a gradient image."""
    img = Image.new('RGB', (width, height))
    pixels = img.load()

    for i in range(width if direction == "horizontal" else height):
        ratio = i / (width if direction == "horizontal" else height)
        r = int(color1[0] * (1 - ratio) + color2[0] * ratio)
        g = int(color1[1] * (1 - ratio) + color2[1] * ratio)
        b = int(color1[2] * (1 - ratio) + color2[2] * ratio)

        if direction == "vertical":
            for j in range(width):
                pixels[j, i] = (r, g, b)
        else:
            for j in range(height):
                pixels[i, j] = (r, g, b)

    return img

def create_background(name, color1, color2):
    """Create a background image with gradient."""
    os.makedirs(BACKGROUNDS_DIR, exist_ok=True)

    img = create_gradient(BG_WIDTH, BG_HEIGHT, color1, color2)

    # Add placeholder text
    draw = ImageDraw.Draw(img)
    text = name.replace("_", " ").title()

    try:
        font = ImageFont.truetype("fonts/Nunito-Bold.ttf", 64)
    except:
        font = ImageFont.load_default()

    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (BG_WIDTH - text_width) // 2
    y = (BG_HEIGHT - text_height) // 2
    draw.text((x, y), text, fill=WHITE, font=font)

    filepath = os.path.join(BACKGROUNDS_DIR, f"{name}.png")
    img.save(filepath)
    print(f"Created: {filepath}")

def create_character_sprite(character, expression, color):
    """Create a character sprite placeholder."""
    os.makedirs(f"{CHARACTERS_DIR}/{character}", exist_ok=True)

    img = Image.new('RGBA', (CHAR_WIDTH, CHAR_HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Simple body: ellipse + rectangle
    body_width = CHAR_WIDTH - 100
    body_height = CHAR_HEIGHT - 200
    body_x = 50
    body_y = 100
    draw.ellipse([body_x, body_y, body_x + body_width, body_y + body_width], fill=color)
    draw.rectangle([body_x, body_y + body_width//2, body_x + body_width, body_y + body_height], fill=color)

    # Face
    face_radius = 80
    face_x = CHAR_WIDTH // 2 - face_radius
    face_y = 150
    draw.ellipse([face_x, face_y, face_x + 2*face_radius, face_y + 2*face_radius], fill=color)

    # Expression indicator
    indicator_colors = {
        "neutral": WHITE,
        "happy": (255, 255, 0),
        "excited": (0, 255, 0),
        "thoughtful": (128, 128, 255),
        "surprised": (255, 165, 0)
    }
    indicator_color = indicator_colors.get(expression, WHITE)
    ind_x = CHAR_WIDTH // 2 - 20
    ind_y = 350
    draw.ellipse([ind_x, ind_y, ind_x + 40, ind_y + 40], fill=indicator_color)

    # Text
    text = f"{character.upper()}\n{expression.upper()}"
    try:
        font = ImageFont.truetype("fonts/Nunito-Bold.ttf", 48)
    except:
        font = ImageFont.load_default()

    for i, line in enumerate(text.split('\n')):
        bbox = draw.textbbox((0, 0), line, font=font)
        text_width = bbox[2] - bbox[0]
        x = (CHAR_WIDTH - text_width) // 2
        y = body_y + body_height + 20 + i*50
        draw.text((x, y), line, fill=WHITE, font=font)

    filepath = f"{CHARACTERS_DIR}/{character}/{character}_{expression}.png"
    img.save(filepath)
    print(f"Created: {filepath}")

def main():
    print("Creating placeholder images for Hoai Niem...\n")

    # Backgrounds
    print("Creating backgrounds...")
    create_background("black", BLACK, BLACK)
    create_background("school_morning", (100, 150, 200), (150, 200, 255))
    create_background("school_hallway", (80, 80, 100), (120, 120, 150))
    create_background("school_garden", (100, 150, 100), (150, 200, 150))
    create_background("classroom_morning", (180, 180, 200), (220, 220, 240))
    create_background("school_cafeteria", (150, 130, 100), (200, 180, 150))
    create_background("school_rooftop", (100, 80, 120), (200, 100, 80))
    print()

    # Characters
    print("Creating character sprites...")
    expressions = ["neutral", "happy", "excited", "thoughtful", "surprised"]
    for expr in expressions:
        create_character_sprite("hoai", expr, HOAI_COLOR)
        create_character_sprite("niem", expr, NIEM_COLOR)

    print("\nDone! Placeholder images created successfully.")

if __name__ == "__main__":
    main()