# ⛏️ Gold Miner — The Arcade Adventure

A complete, polished browser-based arcade game inspired by the classic Gold Miner genre, built entirely with HTML5 Canvas, CSS, and vanilla JavaScript. No frameworks, no backend, no build tools — just open the page and play.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [How to Play](#how-to-play)
3. [Game Architecture](#game-architecture)
4. [Object Types & Rarity](#object-types--rarity)
5. [The Shop System](#the-shop-system)
6. [TNT, Lucky Leaf & Shield](#tnt-lucky-leaf--shield)
7. [Combo System](#combo-system)
8. [Three-Star Scoring](#three-star-scoring)
9. [Level Design & Layouts](#level-design--layouts)
10. [Audio System](#audio-system)
11. [Save System](#save-system)
12. [Customization Guide](#customization-guide)
    - [Adding Custom Image Assets](#adding-custom-image-assets)
    - [Adding Custom Audio](#adding-custom-audio)
    - [Creating & Editing Level Layouts](#creating--editing-level-layouts)
    - [Adjusting Object Values](#adjusting-object-values)
    - [Adjusting Star Thresholds](#adjusting-star-thresholds)
    - [Adjusting Shop Prices](#adjusting-shop-prices)
    - [Adjusting Difficulty](#adjusting-difficulty)
13. [File Structure](#file-structure)
14. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Option A — Quick Local Server (Recommended)

The game needs to be served over HTTP (not opened as a `file://` URL) so that the browser allows audio and module loading properly.

**Using Python (already available on most systems):**

```bash
cd gold-miner
python3 -m http.server 8080
```

Then open your browser to: `http://localhost:8080/index.html`

**Using Node.js:**

```bash
cd gold-miner
npx serve -p 8080
```

**Using VS Code:**

1. Install the **Live Server** extension (by Ritwick Dey) from the VS Code marketplace.
2. Right-click `index.html` in the file explorer and select **"Open with Live Server"**.
3. Your browser will open automatically at a localhost URL.

### Option B — Direct File Open

You can also just double-click `index.html` to open it in your browser. Most features work this way, but some browsers may restrict audio autoplay on first interaction. If audio doesn't play, use the local server method above.

---

## How to Play

### Controls

| Key / Input | Action |
|---|---|
| **Space** or **Click** | Launch the claw when it's swinging toward a treasure |
| **T** | Use TNT to destroy the currently-attached Rock or nearby Worms |
| **L** | Activate Lucky Leaf to turn the next Rock into a Diamond |
| **Escape** | Pause / Resume the game |

### Objective

You control a miner with a swinging claw. Aim the claw at valuable objects (gold, diamonds, treasures) and launch it to grab them. Each round has a time limit and a minimum gold target — reach the target to pass the round, and earn 1–3 stars based on your total score.

### Gameplay Loop

1. **Swing** — The claw swings back and forth above the mine.
2. **Launch** — Press Space or click to send the claw down.
3. **Collect** — The claw grabs whatever it hits first. Heavier objects pull slower.
4. **Retrieve** — The claw retracts back up with the object.
5. **Earn Gold** — Collected objects add to your round score.
6. **Shop** — After each round, visit the shop to buy consumables and upgrades.
7. **Next Round** — Proceed to the next round with increasing difficulty.

### Tips

- **Gold** comes in three sizes: Small (100), Medium (250), Large (500). Larger gold pulls slower.
- **Diamonds** are worth 750 and pull fast — always grab them!
- **Moving Diamonds** are worth 1000 but move horizontally — time your launch carefully.
- **Mystery Bags** give a random reward of +1000 or a penalty of -500. A gamble!
- **Golden Treasure** is the most valuable object at 1500, but it's very heavy (pulls extremely slowly).
- **Rocks** are low-value (50) and pull very slowly — avoid them unless you have TNT.
- **Worms** give 0 gold and waste your time — avoid them or blast them with TNT.
- **TNT** objects in the level explode and destroy nearby objects when grabbed.

---

## Game Architecture

The game follows a clean, modular architecture with separation of concerns. Each system lives in its own JavaScript module (IIFE pattern), loaded in dependency order from `index.html`.

### Module Overview

| File | Responsibility |
|---|---|
| `main.js` | Entry point. Instantiates the Game, initializes audio on first interaction, sets the menu state. |
| `saveManager.js` | localStorage save/load/reset. Stores best scores, stars, inventory, and upgrade levels. |
| `audioManager.js` | Web Audio API procedural sound synthesis. All sounds generated in code — no audio files. |
| `objects.js` | Object type definitions (`OBJECT_DEFS`), `GameObject` class with update/move/collision/draw, and individual draw functions for each object type. |
| `claw.js` | `Claw` class with the state machine: swinging → extending → retracting. Collision detection during extension, pull speed based on object weight and upgrade level. |
| `player.js` | `Player` class draws the miner character, cart, and support beam with a subtle bouncing animation. |
| `levels.js` | `LayoutManager` with 10 rounds × 3 predefined layouts each. Section themes, round times, controlled randomization. |
| `scoring.js` | `Scoring` module with per-round star thresholds (minTarget, 1-star, 2-star, 3-star). |
| `inventory.js` | `Inventory` class tracking TNT, Shield, Lucky Leaf counts and the Lucky Leaf active flag. |
| `upgrades.js` | `Upgrades` module with claw speed upgrade levels (1–5), prices, and multiplier function. |
| `shop.js` | `Shop` module with item prices, rendering, and shop dialog text. |
| `game.js` | Core `Game` class (~900 lines). Game loop, state machine, rendering, object handling, combo system, mystery bag resolution, TNT usage, Lucky Leaf activation, section milestones, final screen, HUD, star meter, particles, floating text, screen effects. |

### Game Loop

The game uses `requestAnimationFrame` with delta-time-based updates for consistent behavior across different framerates:

```
requestAnimationFrame loop:
  → calculate deltaTime
  → update() — move claw, update objects, check collisions, update timer
  → render() — draw background, objects, player, claw, particles, effects
  → update HUD
```

### State Machine

The `GameState` enum defines the game's states:

| State | Description |
|---|---|
| `MENU` | Main menu (New Game, Continue, How to Play, Reset Save) |
| `PLAYING` | Active gameplay round |
| `PAUSED` | Paused (Escape toggles) |
| `RESULTS` | Round results screen showing gold earned and stars |
| `SHOP` | Shop screen for buying consumables and upgrades |
| `SECTION` | Section milestone screen (shown after completing a section's rounds) |
| `FINAL` | Final completion screen after all 10 rounds |

### Claw State Machine

The `Claw` class has three internal states:

1. **SWINGING** — The claw pendulum swings back and forth at a fixed angle range and speed.
2. **EXTENDING** — When launched, the claw extends downward. Collision is checked against all objects during extension. The first object hit is grabbed.
3. **RETRACTING** — The claw pulls back up. Pull speed depends on the grabbed object's weight (`pullSpeed` property) multiplied by the claw upgrade level multiplier.

---

## Object Types & Rarity

All objects are defined in `OBJECT_DEFS` within `objects.js`. There are 10 object types across 3 rarity categories:

### Common Objects

| Object | Value | Size | Pull Speed | Notes |
|---|---|---|---|---|
| Small Gold | 100 | 18 | 5.5 (fast) | Easy to grab, low reward |
| Medium Gold | 250 | 28 | 4.0 | Good balance of value and speed |
| Large Gold | 500 | 40 | 1.8 (slow) | High value but slow to pull |
| Rock | 50 | 38 | 0.9 (very slow) | Low value, very slow — use TNT |
| Worm | 0 | 22 | 2.5 | No reward, moves horizontally, wastes time |
| TNT | 0 | 30 | 4.0 | Explodes on grab, destroys nearby objects |

### Rare Objects

| Object | Value | Size | Pull Speed | Notes |
|---|---|---|---|---|
| Diamond | 750 | 22 | 5.5 (fast) | High value, fast pull — always grab! |
| Mystery Bag | random (+1000 or -500) | 26 | 3.5 | Moves horizontally, gamble on outcome |
| Moving Diamond | 1000 | 22 | 4.0 | Moves horizontally, high value |

### Epic Objects

| Object | Value | Size | Pull Speed | Notes |
|---|---|---|---|---|
| Golden Treasure | 1500 | 50 | 0.7 (extremely slow) | Highest value, very heavy — plan ahead |

The `RARITY` constant defines: `COMMON`, `RARE`, `EPIC`. Each object type has a `rarity` field that determines its color coding and visual treatment.

---

## The Shop System

After each round, the shop screen appears with 4 purchasable items. The shop is defined in `shop.js`.

### Shop Items

| Item | Price | Effect |
|---|---|---|
| TNT (Single) | 500 gold | Adds 1 TNT to your inventory |
| TNT Bundle | 1300 gold | Adds 3 TNT to your inventory (saves 200 gold vs. buying 3 singles) |
| Shield | 800 gold | Adds 1 Shield to your inventory (blocks one negative Mystery Bag outcome) |
| Lucky Leaf | 1000 gold | Adds 1 Lucky Leaf to your inventory (turns next Rock into a Diamond) |

### Claw Speed Upgrade

The shop also offers claw speed upgrades with 5 levels:

| Level | Multiplier | Upgrade Price |
|---|---|---|
| 1 (starting) | 1.0× | — |
| 2 | 1.1× | 600 gold |
| 3 | 1.2× | 900 gold |
| 4 | 1.35× | 1,400 gold |
| 5 (max) | 1.5× | 2,000 gold |

The claw speed multiplier makes the claw pull objects faster, which is critical for collecting heavy objects (Large Gold, Golden Treasure) within the time limit. Upgrades persist across rounds via the save system.

---

## TNT, Lucky Leaf & Shield

### TNT (Consumable)

TNT has a dual role — it appears as an in-level object AND can be purchased as a consumable.

**As an in-level object:** When the claw grabs a TNT object, it explodes, destroying all objects within a radius (including rocks, worms, and even some valuable items). This can be strategic (clearing rocks) or risky (destroying nearby gold).

**As a consumable (press T):** When you have TNT in your inventory and the claw is holding a Rock or Worm, pressing T destroys the currently-grabbed object and any nearby objects. This lets you "reject" a bad grab without waiting for the slow retrieval.

### Lucky Leaf (Consumable, press L)

When activated, the Lucky Leaf transforms the next Rock the claw grabs into a Diamond (value 50 → 750). This is a powerful tool for turning a wasted grab into a big payoff. The leaf stays active until a Rock is grabbed or the round ends.

### Shield (Consumable)

The Shield automatically activates when a Mystery Bag resolves to a negative outcome (-500). Instead of losing gold, the Shield is consumed and the negative effect is blocked. Shields are passive — you don't need to press anything; they just work when needed.

---

## Combo System

The combo system rewards consecutive valuable grabs. Consecutive grabs of objects worth ≥100 gold build the combo counter. Grabbing a low-value object (Rock, Worm, or a negative Mystery Bag) resets the combo to 0.

| Consecutive Grabs | Multiplier |
|---|---|
| 0–2 | ×1.0 (no bonus) |
| 3–4 | ×1.1 (10% bonus) |
| 5–7 | ×1.2 (20% bonus) |
| 8+ | ×1.3 (30% bonus) |

The combo multiplier is applied to the value of each collected object while the combo is active. The current combo and multiplier are displayed in the HUD. A sound plays when the multiplier increases.

---

## Three-Star Scoring

Each round has four scoring thresholds, defined in `scoring.js`:

| Threshold | Meaning |
|---|---|
| `minTarget` | Minimum score to pass the round (below this = round failed) |
| `oneStar` | Score needed for 1 star |
| `twoStar` | Score needed for 2 stars |
| `threeStar` | Score needed for 3 stars (the ultimate goal) |

### All 10 Rounds' Thresholds

| Round | Section | Time | Min Target | ⭐1 | ⭐⭐2 | ⭐⭐⭐3 |
|---|---|---|---|---|---|---|
| 1 | The Old Mine | 60s | 300 | 500 | 800 | 1,200 |
| 2 | The Old Mine | 60s | 500 | 800 | 1,300 | 1,900 |
| 3 | The Old Mine | 60s | 900 | 1,500 | 2,400 | 3,400 |
| 4 | The Lost Jungle | 60s | 1,200 | 2,000 | 3,300 | 5,000 |
| 5 | The Lost Jungle | 55s | 1,000 | 1,600 | 2,500 | 3,800 |
| 6 | The Lost Jungle | 55s | 1,100 | 1,800 | 2,900 | 4,300 |
| 7 | Ancient Ruins | 55s | 1,100 | 1,800 | 2,900 | 4,100 |
| 8 | Ancient Ruins | 55s | 1,100 | 1,800 | 2,900 | 4,300 |
| 9 | Ancient Ruins | 60s | 1,200 | 2,000 | 3,200 | 4,800 |
| 10 | The Golden Temple | 70s | 1,600 | 2,600 | 4,200 | 6,200 |

**Important design principle:** Every layout in every round has been calibrated so that a skilled player CAN reach 3 stars. The 3-star threshold is approximately 80% of the weakest layout's maximum achievable score. No layout makes 3 stars mathematically impossible.

### Star Display

- The **star meter** in the HUD shows the three thresholds as markers, with your current score filling a progress bar.
- The **results screen** shows animated stars (1–3) with a pop animation and sound effect.
- Stars are saved per-round in the save data — your best star rating for each round persists.

---

## Level Design & Layouts

The `LayoutManager` in `levels.js` contains all level data. Each of the 10 rounds has **3 predefined layouts** (30 total layouts). When a round starts, one of the 3 layouts is randomly selected, with small controlled randomization applied.

### Controlled Randomization

When a layout is selected, the `buildLayout()` function applies:

1. **Small position offsets** — Each object's x/y position is jittered by a small random amount (±15px) so the layout isn't identical every time.
2. **Speed variations** — Moving objects' speeds are varied by ±10% for a slightly different experience each playthrough.

This means the layout structure is controlled (so it's always fair and 3-star-achievable), but the exact positions and movement speeds vary slightly each time you play.

### Section Themes

The 10 rounds are grouped into 4 themed sections:

| Section | Rounds | Theme | Background |
|---|---|---|---|
| 1 | 1–3 | The Old Mine | Dark mine tunnels with earthy tones |
| 2 | 4–6 | The Lost Jungle | Lush green with vegetation |
| 3 | 7–9 | Ancient Ruins | Sandy stone ruins |
| 4 | 10 | The Golden Temple | Golden temple interior |

Each section has a procedurally rendered background (drawn in code, no image assets needed). When you complete all rounds in a section, a **section milestone screen** appears to celebrate your progress.

### Layout Format

Each layout is an array of object specifications. Each spec uses the helper function `o(type, x, y, extra)`:

```javascript
o("largeGold", 200, 400)         // Large gold at (200, 400)
o("diamond", 500, 350, { move: true, moveSpeed: 120 })  // Moving diamond
```

The `extra` object can override: `move` (boolean), `moveSpeed` (pixels/sec), `moveDir` (-1 or 1), `minX`, `maxX` (movement bounds).

---

## Audio System

The game uses the **Web Audio API** for all sound — no audio files are needed. All sounds are procedurally synthesized in `audioManager.js` using oscillators and noise buffers.

### Sound Effects

| Function | Sound | Used When |
|---|---|---|
| `sfx.launch()` | Low sawtooth tone | Claw is launched |
| `sfx.clawExtend()` | Low square tone | Claw extending |
| `sfx.collect()` | Two-tone sine ping | Any object collected |
| `sfx.gold()` | Triangle wave chord | Gold collected |
| `sfx.diamond()` | Ascending triangle arpeggio | Diamond collected |
| `sfx.rock()` | Low square tone | Rock collected |
| `sfx.mystery()` | Wavering triangle tones | Mystery bag collected |
| `sfx.tnt()` | Noise burst + low sawtooth | TNT explodes |
| `sfx.shield()` | Sine swell | Shield blocks negative |
| `sfx.leaf()` | Ascending sine arpeggio | Lucky Leaf activated |
| `sfx.timerWarning()` | High square beep | Timer drops below 10s |
| `sfx.star()` | Triangle arpeggio | Star threshold reached |
| `sfx.roundComplete()` | 4-note ascending | Round completed |
| `sfx.buy()` | Two-tone sine | Item purchased |
| `sfx.error()` | Low sawtooth | Invalid action |
| `sfx.combo()` | Two-tone sine | Combo multiplier increased |
| `sfx.fail()` | Descending sawtooth | Round failed |

### Background Music

A simple looped melody plays during gameplay using scheduled triangle-wave notes. The music uses a C major scale pattern at a relaxed tempo. Music can be muted.

### Audio Initialization

Due to browser autoplay policies, audio is initialized on the **first user interaction** (click or keypress). The `main.js` file sets up listeners that call `AudioManager.init()` and `AudioManager.resume()` on first interaction.

---

## Save System

The game uses `localStorage` to persist progress. The save system is in `saveManager.js`.

### Save Data Structure

```javascript
{
  bestScores: {},        // { roundNumber: bestScore } — best score per round
  bestStars: {},         // { roundNumber: bestStarRating (0-3) } — best stars per round
  totalStars: 0,         // sum of all best star ratings
  completedRounds: [],    // list of round numbers the player has completed
  clawSpeedLevel: 1,    // permanent claw upgrade level (1-5)
  inventory: {
    tnt: 0,              // TNT consumables in inventory
    shield: 0,          // Shield consumables in inventory
    luckyLeaf: 0         // Lucky Leaf consumables in inventory
  },
  highestRoundReached: 1, // highest round the player has unlocked
  lastRoundPlayed: 0     // last round the player was on
}
```

### Save Key

The save is stored under the localStorage key: `goldMiner_save_v1`

### Menu Options

- **New Game** — Starts a fresh playthrough from Round 1 (keeps your upgrade level and best scores).
- **Continue** — Resumes from your highest reached round.
- **Reset Save** — Clears all progress and starts completely fresh.

---

## Customization Guide

### Adding Custom Image Assets

The game currently uses **procedurally drawn graphics** (all objects, the miner, and backgrounds are drawn with Canvas API calls). To add custom image assets:

1. **Place images** in the `assets/images/` directory.

2. **Modify the draw functions** in `objects.js`. Each object type has a dedicated draw function (e.g., `drawGold`, `drawDiamond`, `drawRock`, etc.). To use an image instead:

```javascript
// Load the image once (add at the top of objects.js)
const diamondImg = new Image();
diamondImg.src = "assets/images/diamond.png";

// In the drawDiamond function, replace the Canvas drawing code with:
function drawDiamond(ctx, obj) {
  const size = obj.size;
  ctx.save();
  ctx.translate(obj.x, obj.y);
  if (diamondImg.complete && diamondImg.naturalWidth > 0) {
    ctx.drawImage(diamondImg, -size, -size, size * 2, size * 2);
  } else {
    // Fallback to procedural drawing while image loads
    // ... (keep existing Canvas code as fallback)
  }
  ctx.restore();
}
```

3. **For the background**, modify the `drawBackground()` method in `game.js`. Currently it draws procedural backgrounds per theme. You can replace it with:

```javascript
// Load theme background images
const bgImages = {
  mine: new Image(),
  jungle: new Image(),
  ruins: new Image(),
  temple: new Image()
};
bgImages.mine.src = "assets/images/mine_bg.jpg";
// ... etc

// In drawBackground():
function drawBackground(ctx, theme) {
  const img = bgImages[theme];
  if (img && img.complete && img.naturalWidth > 0) {
    ctx.drawImage(img, 0, 0, 960, 640);
  } else {
    // Fallback to procedural background
    drawProceduralBackground(ctx, theme);
  }
}
```

4. **For the miner character**, modify `player.js` to load and draw a sprite image instead of the procedural character.

### Adding Custom Audio

The game uses **procedurally synthesized audio** via the Web Audio API. To replace sounds with custom audio files:

1. **Place audio files** in the `assets/sounds/` directory (e.g., `assets/sounds/collect.mp3`).

2. **Modify `audioManager.js`** to load and play audio buffers:

```javascript
// Add at the top of the IIFE in audioManager.js
const audioBuffers = {};
const audioFiles = {
  collect: "assets/sounds/collect.mp3",
  gold: "assets/sounds/gold.mp3",
  diamond: "assets/sounds/diamond.mp3",
  // ... etc
};

async function loadAudio() {
  for (const [name, url] of Object.entries(audioFiles)) {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      audioBuffers[name] = await ctx.decodeAudioData(arrayBuffer);
    } catch (e) {
      console.warn(`Failed to load audio: ${name}`, e);
    }
  }
}

// Modify sfx functions to use buffers with procedural fallback:
const sfx = {
  collect() {
    if (audioBuffers.collect) {
      const src = ctx.createBufferSource();
      src.buffer = audioBuffers.collect;
      src.connect(sfxGain);
      src.start();
    } else {
      // Fallback to procedural
      tone(660, 0.08, "sine", 0.25);
      tone(880, 0.12, "sine", 0.2, 0.08);
    }
  },
  // ... modify other sfx functions similarly
};
```

3. Call `loadAudio()` in the `init()` function after the AudioContext is created.

### Creating & Editing Level Layouts

All layouts are in `levels.js` within the `LAYOUTS` object. Here's how to create or edit them:

#### Layout Structure

```javascript
const LAYOUTS = {
  1: [  // Round 1
    // Layout A (index 0)
    [
      o("mediumGold", 150, 450),
      o("smallGold", 300, 500),
      o("largeGold", 500, 480),
      o("diamond", 700, 420),
      o("rock", 350, 550),
      o("worm", 600, 520, { move: true, moveSpeed: 80 }),
      o("tnt", 200, 580),
    ],
    // Layout B (index 1)
    [
      o("largeGold", 200, 400),
      // ... more objects
    ],
    // Layout C (index 2)
    [
      // ... objects
    ],
  ],
  2: [ /* ... 3 layouts ... */ ],
  // ... through round 10
};
```

#### Adding a New Layout

To add a 4th layout to a round, simply add another array to that round's layout list:

```javascript
3: [
  // ... existing 3 layouts ...
  // New Layout D (index 3)
  [
    o("mediumGold", 200, 400),
    o("diamond", 600, 450),
    o("goldenTreasure", 400, 500),
    o("rock", 700, 520),
    o("worm", 300, 480, { move: true, moveSpeed: 100 }),
    o("tnt", 150, 560),
    o("smallGold", 800, 440),
    o("mysteryBag", 500, 500, { move: true, moveSpeed: 60 }),
  ],
],
```

#### Layout Guidelines

- **Canvas size** is 960×640. Objects should be placed in the lower portion (y: 350–620) since the claw hangs from the top.
- **x range**: 40–920 (keep objects away from the very edges).
- **y range**: 350–620 (below the miner, above the bottom edge).
- **Ensure 3-star feasibility**: The total value of all objects in a layout should be at least 125% of the 3-star threshold for that round (so a skilled player can reach 3 stars even if they miss a few objects).
- **Include variety**: Mix gold sizes, diamonds, rocks, worms, and at least one high-value object per layout.
- **Moving objects**: Use `{ move: true, moveSpeed: N }` for worms, mystery bags, and moving diamonds. The `minX`/`maxX` bounds default to ±100px from the object's x position.

#### Object Spec Helper

Use the `o()` helper function:

```javascript
o(type, x, y, extra)
```

- `type`: one of the keys in `OBJECT_DEFS` (e.g., `"smallGold"`, `"diamond"`, `"rock"`, `"worm"`, `"tnt"`, `"mysteryBag"`, `"movingDiamond"`, `"goldenTreasure"`)
- `x`, `y`: canvas coordinates
- `extra` (optional): `{ move: bool, moveSpeed: number, moveDir: -1|1, minX: number, maxX: number }`

### Adjusting Object Values

Object values, sizes, and pull speeds are all defined in `OBJECT_DEFS` in `objects.js`:

```javascript
const OBJECT_DEFS = {
  smallGold:      { value: 100,  size: 18, pullSpeed: 5.5, ... },
  mediumGold:     { value: 250,  size: 28, pullSpeed: 4.0, ... },
  largeGold:      { value: 500,  size: 40, pullSpeed: 1.8, ... },
  rock:           { value: 50,   size: 38, pullSpeed: 0.9, ... },
  worm:           { value: 0,    size: 22, pullSpeed: 2.5, ... },
  diamond:        { value: 750,  size: 22, pullSpeed: 5.5, ... },
  mysteryBag:     { value: "random", size: 26, pullSpeed: 3.5, ... },
  movingDiamond:  { value: 1000, size: 22, pullSpeed: 4.0, ... },
  goldenTreasure: { value: 1500, size: 50, pullSpeed: 0.7, ... },
  tnt:            { value: 0,    size: 30, pullSpeed: 4.0, ... }
};
```

**To change a value:** Simply edit the `value` field. For example, to make diamonds worth 1000:

```javascript
diamond:        { value: 1000, ... },
```

**To change pull speed:** Edit the `pullSpeed` field. Higher = faster pull. Lower = slower (heavier). The claw upgrade multiplier multiplies this value, so a pullSpeed of 1.8 with level 5 claw (1.5× multiplier) becomes 2.7 effective pull speed.

**To change object size:** Edit the `size` field. This affects both the visual size and the collision radius.

**Important:** If you change object values significantly, you should also adjust the star thresholds (see below) to maintain balance.

### Adjusting Star Thresholds

Star thresholds are in `scoring.js` in the `thresholds` object:

```javascript
const thresholds = {
  1:  { minTarget: 300,  oneStar: 500,  twoStar: 800,  threeStar: 1200 },
  2:  { minTarget: 500,  oneStar: 800,  twoStar: 1300, threeStar: 1900 },
  // ... etc
};
```

**To adjust:** Edit the values for any round. The relationship should be:

```
minTarget < oneStar < twoStar < threeStar
```

**Guideline for calibration:** The 3-star threshold should be approximately 80% of the weakest layout's maximum achievable score (sum of all valuable objects in that layout). The 2-star should be ~55%, 1-star ~33%, and minTarget ~20%.

**Example:** If the weakest layout for Round 5 has a total max value of 4750, then:
- threeStar ≈ 4750 × 0.8 = 3800
- twoStar ≈ 4750 × 0.55 = 2612 → round to 2500
- oneStar ≈ 4750 × 0.33 = 1567 → round to 1600
- minTarget ≈ 4750 × 0.2 = 950 → round to 1000

### Adjusting Shop Prices

Shop prices are in `shop.js` in the `PRICES` object:

```javascript
const PRICES = {
  tntSingle: 500,
  tntBundle: 1300,   // 3 TNT (saves 200 vs. 3 singles)
  shield: 800,
  luckyLeaf: 1000
};
```

**To adjust:** Simply edit the price values. The TNT bundle should generally be cheaper than 3× the single price to make it worthwhile.

Claw upgrade prices are in `upgrades.js`:

```javascript
const PRICES = { 2: 600, 3: 900, 4: 1400, 5: 2000 };
```

These are the prices to upgrade FROM level N-1 TO level N. So upgrading from level 1 to 2 costs 600, from 2 to 3 costs 900, etc.

The claw speed multipliers are also in `upgrades.js`:

```javascript
function multiplier(level) {
  return [1.0, 1.1, 1.2, 1.35, 1.5][Math.min(Math.max(level - 1, 0), 4)];
}
```

To change the multipliers, edit the array `[1.0, 1.1, 1.2, 1.35, 1.5]` (index 0 = level 1, index 4 = level 5).

### Adjusting Difficulty

There are several ways to adjust difficulty:

#### 1. Round Time Limits

In `levels.js`, the `ROUND_META` object defines time limits:

```javascript
const ROUND_META = {
  1:  { time: 60 },
  2:  { time: 60 },
  // ... etc
};
```

Reduce time to increase difficulty, increase time to make it easier.

#### 2. Claw Swing Speed

In `claw.js`, the swing speed controls how fast the claw pendulum swings:

```javascript
// In the Claw class constructor or update method
this.swingSpeed = 1.5; // radians per second — increase for harder aiming
```

#### 3. Object Pull Speeds

Lower `pullSpeed` values in `OBJECT_DEFS` make objects take longer to retrieve, effectively reducing the number of objects you can collect per round (harder). Higher values make it easier.

#### 4. Layout Composition

Add more rocks and worms (and fewer diamonds/gold) to layouts to increase difficulty. The layouts in `levels.js` can be freely edited.

#### 5. Star Thresholds

Raise the thresholds in `scoring.js` to make 3 stars harder to achieve. Lower them to make it easier.

#### 6. Combo Multiplier Thresholds

In `game.js`, the `updateComboMult()` method defines combo thresholds:

```javascript
updateComboMult() {
  if (this.combo >= 8) this.comboMult = 1.3;
  else if (this.combo >= 5) this.comboMult = 1.2;
  else if (this.combo >= 3) this.comboMult = 1.1;
  else this.comboMult = 1.0;
}
```

Raise the thresholds (e.g., `>= 10` for 1.3×) to make combos harder to build, or increase the multipliers to make them more rewarding.

---

## File Structure

```
gold-miner/
├── index.html              # Main HTML — canvas + all UI overlay containers
├── style.css              # All CSS styling (menus, HUD, shop, results, animations)
├── todo.md                # Build plan (development tracking)
├── README.md             # This file
├── assets/
│   ├── images/           # (Empty — for custom image assets)
│   └── sounds/           # (Empty — for custom audio assets)
└── js/
    ├── main.js           # Entry point — bootstraps Game, initializes audio
    ├── saveManager.js    # localStorage save/load/reset
    ├── audioManager.js   # Web Audio API procedural sound synthesis
    ├── objects.js        # Object definitions, GameObject class, draw functions
    ├── claw.js           # Claw class — swing/launch/retrieve state machine
    ├── player.js         # Player class — miner character rendering
    ├── levels.js         # LayoutManager — 10 rounds × 3 layouts, sections, times
    ├── scoring.js        # Scoring module — per-round star thresholds
    ├── inventory.js      # Inventory class — TNT, Shield, Lucky Leaf tracking
    ├── upgrades.js       # Upgrades module — claw speed levels and prices
    ├── shop.js           # Shop module — item prices, rendering, dialogs
    └── game.js           # Core Game class — loop, state, rendering, all systems
```

### JavaScript Load Order

The modules in `index.html` are loaded in dependency order:

```html
<script src="js/saveManager.js"></script>
<script src="js/audioManager.js"></script>
<script src="js/objects.js"></script>
<script src="js/claw.js"></script>
<script src="js/player.js"></script>
<script src="js/levels.js"></script>
<script src="js/scoring.js"></script>
<script src="js/inventory.js"></script>
<script src="js/upgrades.js"></script>
<script src="js/shop.js"></script>
<script src="js/game.js"></script>
<script src="js/main.js"></script>
```

---

## Troubleshooting

### No Audio Plays

**Cause:** Browser autoplay policy requires user interaction before audio can play.

**Fix:** Click anywhere on the page or press any key first. The game initializes audio on the first interaction. If using `file://` protocol, some browsers are more restrictive — use a local server instead.

### Game Doesn't Load / Blank Screen

**Cause:** JavaScript files not loading (possibly due to `file://` protocol restrictions).

**Fix:** Serve the game over HTTP using a local server (see [Quick Start](#quick-start)). Open the browser console (F12) to check for errors.

### Save Data Lost

**Cause:** localStorage is cleared, or you're using incognito/private mode.

**Fix:** Use a normal browser window. The save persists under the key `goldMiner_save_v1`. If you want to start fresh, use the "Reset Save" button on the main menu.

### Objects Overlapping or Out of Bounds

**Cause:** Layout has objects placed outside the canvas bounds or overlapping.

**Fix:** Edit the layout in `levels.js`. Keep x in [40, 920] and y in [350, 620]. Ensure objects aren't placed on top of each other.

### 3 Stars Seem Impossible on a Layout

**Cause:** Layout doesn't have enough total value to reach the 3-star threshold.

**Fix:** Either (a) add more valuable objects to the layout in `levels.js`, or (b) lower the 3-star threshold in `scoring.js`. The 3-star threshold should be ~80% of the layout's total max value.

---

## Technical Notes

- **Canvas size**: 960 × 640 pixels
- **No external dependencies**: Pure HTML5 Canvas + CSS + vanilla JavaScript
- **No build step**: Just serve the directory and open in a browser
- **Browser compatibility**: Works in any modern browser with Canvas and Web Audio API support (Chrome, Firefox, Safari, Edge)
- **Performance**: Uses delta-time-based updates for consistent framerate behavior across all devices
- **Debugging**: The game instance is exposed as `window.__game` for console debugging

---

## Credits

Built as a complete browser-based arcade game using only HTML5 Canvas, CSS, and vanilla JavaScript. All graphics are procedurally drawn, and all audio is procedurally synthesized — no external assets required.

Enjoy the adventure, miner! ⛏️✨