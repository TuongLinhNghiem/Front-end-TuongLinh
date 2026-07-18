#!/usr/bin/env python3
"""
generate_avatar_assets.py
Generates the layered 2D avatar PNG assets used by TryItOn!.

The avatar is composed of four absolutely-positioned PNG layers, each
rendered to the SAME canvas (600 x 840) so they stack pixel-perfect:

    legs-{red,blue,yellow}.png   -> trousers
    body-{red,blue,yellow}.png   -> shirt / torso
    head.png                     -> fixed skin-tone head + face
    hat-{red,blue,yellow}.png    -> cap

Design language: minimalist, rounded, flat — matching the platform's
Apple/Nike/Figma aesthetic. No AI, no 3D.

Run:  python3 generate_avatar_assets.py
"""

import os
import cairosvg

OUT_DIR = os.path.join(os.path.dirname(__file__), "public", "images", "avatar")
W, H = 600, 840
os.makedirs(OUT_DIR, exist_ok=True)

# Brand colours (kept in sync with css/variables.css)
COLORS = {
    "red":    "#e63946",
    "blue":   "#2a6df4",
    "yellow": "#f4c20d",
}
SKIN     = "#f1c9a5"
SKIN_DK  = "#e0a986"
HAIR     = "#3b2a20"
INK      = "#1d1d1f"


def svg(body: str) -> str:
    """Wrap inner SVG markup with the shared viewBox + transparent bg."""
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" '
        f'viewBox="0 0 {W} {H}">'
        f'{body}</svg>'
    )


def write(name: str, markup: str) -> None:
    path = os.path.join(OUT_DIR, name)
    cairosvg.svg2png(bytestring=markup.encode("utf-8"),
                     write_to=path,
                     output_width=W, output_height=H)
    print(f"  ✓ {name}")


# ----------------------------------------------------------------------
# LEGS  (trousers) — drawn behind the body. Two rounded trouser legs.
# ----------------------------------------------------------------------
def legs(color: str) -> str:
    fill = COLORS[color]
    return svg(f"""
      <!-- waistband -->
      <rect x="200" y="470" width="200" height="40" rx="14" fill="{fill}"/>
      <!-- left leg -->
      <rect x="208" y="500" width="86"  height="250" rx="34" fill="{fill}"/>
      <!-- right leg -->
      <rect x="306" y="500" width="86"  height="250" rx="34" fill="{fill}"/>
      <!-- shoes -->
      <ellipse cx="251" cy="765" rx="58" ry="22" fill="{INK}"/>
      <ellipse cx="349" cy="765" rx="58" ry="22" fill="{INK}"/>
      <!-- subtle inner shadow on trousers -->
      <rect x="296" y="500" width="8" height="250" fill="rgba(0,0,0,0.10)"/>
    """)


# ----------------------------------------------------------------------
# BODY (shirt) — torso + sleeves, drawn over the legs.
# ----------------------------------------------------------------------
def body(color: str) -> str:
    fill = COLORS[color]
    shade = "rgba(0,0,0,0.10)"
    return svg(f"""
      <!-- sleeves -->
      <rect x="120" y="350" width="80" height="150" rx="36" fill="{fill}"/>
      <rect x="400" y="350" width="80" height="150" rx="36" fill="{fill}"/>
      <!-- torso -->
      <path d="
        M 210 330
        Q 300 310 390 330
        L 408 360
        Q 412 470 392 510
        L 208 510
        Q 188 470 192 360
        Z" fill="{fill}"/>
      <!-- collar (V) -->
      <path d="M 270 330 L 300 372 L 330 330 Z" fill="{shade}"/>
      <!-- hem shadow -->
      <rect x="208" y="498" width="184" height="14" rx="6" fill="{shade}"/>
    """)


# ----------------------------------------------------------------------
# HEAD — fixed (no colour variants). Skin tone + simple face + hair.
# ----------------------------------------------------------------------
def head() -> str:
    return svg(f"""
      <!-- neck -->
      <rect x="276" y="300" width="48" height="60" rx="16" fill="{SKIN_DK}"/>
      <!-- head -->
      <circle cx="300" cy="240" r="86" fill="{SKIN}"/>
      <!-- hair (cap of hair) -->
      <path d="M 220 232
               Q 222 168 300 158
               Q 378 168 380 232
               Q 360 196 300 196
               Q 240 196 220 232 Z" fill="{HAIR}"/>
      <!-- ears -->
      <circle cx="216" cy="244" r="14" fill="{SKIN}"/>
      <circle cx="384" cy="244" r="14" fill="{SKIN}"/>
      <!-- eyes -->
      <circle cx="272" cy="240" r="9" fill="{INK}"/>
      <circle cx="328" cy="240" r="9" fill="{INK}"/>
      <!-- eye highlights -->
      <circle cx="275" cy="236" r="3" fill="#ffffff"/>
      <circle cx="331" cy="236" r="3" fill="#ffffff"/>
      <!-- smile -->
      <path d="M 272 272 Q 300 292 328 272" stroke="{INK}"
            stroke-width="6" fill="none" stroke-linecap="round"/>
      <!-- cheeks -->
      <circle cx="252" cy="262" r="10" fill="rgba(230,57,70,0.18)"/>
      <circle cx="348" cy="262" r="10" fill="rgba(230,57,70,0.18)"/>
    """)


# ----------------------------------------------------------------------
# HAT — a rounded cap sitting on top of the head, in three colours.
# ----------------------------------------------------------------------
def hat(color: str) -> str:
    fill = COLORS[color]
    return svg(f"""
      <!-- cap crown -->
      <path d="M 214 196
               Q 222 120 300 116
               Q 378 120 386 196
               Q 360 168 300 168
               Q 240 168 214 196 Z" fill="{fill}"/>
      <!-- cap band -->
      <rect x="214" y="190" width="172" height="20" rx="10" fill="{fill}"/>
      <!-- visor -->
      <path d="M 200 210
               Q 300 252 400 210
               L 400 224
               Q 300 266 200 224 Z" fill="{fill}"/>
      <!-- highlight -->
      <path d="M 246 150 Q 300 132 354 150" stroke="rgba(255,255,255,0.35)"
            stroke-width="10" fill="none" stroke-linecap="round"/>
      <!-- button on top -->
      <circle cx="300" cy="120" r="8" fill="rgba(0,0,0,0.18)"/>
    """)


# ----------------------------------------------------------------------
# A small logo mark used as the favicon / navbar logo fallback.
# ----------------------------------------------------------------------
def logo() -> str:
    return svg(f"""
      <rect x="0" y="0" width="{W}" height="{H}" fill="none"/>
      <rect x="180" y="260" width="240" height="320" rx="56"
            fill="#1d1d1f"/>
      <text x="300" y="470" font-family="Helvetica, Arial, sans-serif"
            font-size="220" font-weight="700" fill="#ffffff"
            text-anchor="middle">T</text>
    """)


def main():
    print("Generating avatar assets…")
    for c in COLORS:
        write(f"legs-{c}.png", legs(c))
        write(f"body-{c}.png", body(c))
        write(f"hat-{c}.png",  hat(c))
    write("head.png", head())
    write("logo.png", logo())
    print(f"\nDone. {len(os.listdir(OUT_DIR))} files in {OUT_DIR}")


if __name__ == "__main__":
    main()
