# TETRIS — Arcade Edition

A complete, playable Tetris clone built from scratch using vanilla JavaScript, HTML5 Canvas, and CSS. No frameworks, no external assets — everything is procedurally generated and self-contained.

## Summary

This is a feature-complete Tetris game implementing all standard modern Tetris mechanics: the 7 standard tetromino pieces, SRS rotation with wall kicks, a 7-bag randomizer, hold piece, ghost piece, lock delay, soft/hard drop, combos, back-to-back bonuses, level progression with increasing gravity, and persistent high score storage. The game features an original visual style with a modern glassmorphism aesthetic, distinct neon-glowing colors per piece type, 3D-style block rendering, line-clear flash effects, floating score popups, screen shake, and particle effects. All audio is synthesized procedurally via the Web Audio API — no audio files needed. The architecture is modular, with each system in its own file, and the UI is fully responsive with mobile touch controls.

## UI/UX Design

The game features a polished, modern visual design:

- **Glassmorphism panels** with backdrop blur, semi-transparent backgrounds, and subtle glass-like borders throughout the HUD, menus, and overlays
- **Animated background** with a slowly moving grid pattern and floating colored orbs that create depth and atmosphere
- **Neon-glowing title** with an animated gradient (cyan → purple → orange) and a pulsing glow effect
- **Pulsing Play button** that draws attention with an expanding glow ring animation
- **3D-style block rendering** with highlight gradients, shadow edges, and inner glow borders for each piece
- **Glowing HUD panels** — the Score panel has a cyan glow accent, the Combo panel has an orange glow accent, creating visual hierarchy
- **Floating score popups** that appear on line clears showing "SINGLE", "DOUBLE", "TRIPLE", "TETRIS!", "COMBO xN", and "LEVEL UP!" with points
- **Line-clear flash** animation that pulses white across cleared rows
- **Screen shake** on hard drops and line clears for tactile feedback
- **Particle effects** that burst from cleared blocks in their piece colors
- **Ghost piece** with translucent rendering showing where the current piece will land
- **Smooth transitions** with cubic-bezier easing on all panels, buttons, and state changes
- **Responsive layout** that adapts to smaller screens with resized HUD panels and preview canvases
- **Mobile touch controls** with on-screen buttons for rotate, hold, move, and drop that automatically appear on touch devices

## File List

```
tetris/
├── index.html              # Main HTML: canvas + UI overlays (menu, pause, game over, touch controls)
├── style.css               # All styling: glassmorphism, HUD, panels, buttons, animations, responsive, touch
├── todo.md                 # Build plan / progress tracking
├── README.md               # This file
└── js/
    ├── main.js             # Entry point: boots the game, initializes audio on first interaction
    ├── constants.js        # Central CONFIG: dimensions, colors, gravity table, controls, states
    ├── tetromino.js        # 7 piece definitions, 4 rotation states each, SRS wall kick data
    ├── board.js            # Grid, collision detection, line detection, line clearing with gravity
    ├── spawner.js          # 7-bag randomizer (Fisher-Yates shuffle, queue-based)
    ├── rotation.js         # SRS rotation system with wall kicks (CW and CCW)
    ├── ghost.js            # Ghost piece projection (computes landing position)
    ├── hold.js             # Hold piece system (swap once per piece)
    ├── scoring.js          # Scoring: single/double/triple/tetris, combo, back-to-back
    ├── levelSystem.js      # Level progression, gravity speed table lookup
    ├── saveManager.js      # localStorage high score persistence
    ├── audioManager.js     # Web Audio API procedural sound synthesis (all SFX + music)
    ├── inputManager.js     # Keyboard handling with DAS/ARR auto-repeat
    └── game.js             # Core game loop, state machine, rendering, effects, touch controls
```

**Total: 14 JavaScript modules + HTML + CSS**

## Run Instructions

### Option 1: Local Server (Recommended)

The game requires serving over HTTP (for proper module loading). From the project root:

```bash
cd tetris
python3 -m http.server 9098
```

Then open in your browser: **http://localhost:9098/index.html**

### Option 2: Direct File Open

You can also open `index.html` directly in a browser, though some browsers may restrict features. Using a local HTTP server is recommended.

### Requirements

- Any modern web browser (Chrome, Firefox, Edge, Safari)
- No dependencies, no build step, no installation required
- Audio requires a user interaction (click/keypress) before it activates (browser autoplay policy)

## Control Scheme

### Keyboard (Desktop)

| Action          | Key               |
|-----------------|-------------------|
| Move Left       | ← (Left Arrow)    |
| Move Right      | → (Right Arrow)   |
| Soft Drop       | ↓ (Down Arrow)    |
| Rotate CW       | ↑ (Up Arrow)      |
| Rotate CCW      | Z                 |
| Hard Drop       | Space             |
| Hold Piece      | C                 |
| Pause / Resume  | P or Esc          |
| Mute / Unmute   | M (or mute icon button) |

**Auto-repeat:** Holding Left/Right uses DAS (Delayed Auto Shift) with ARR (Auto Repeat Rate) for smooth continuous movement. Holding Down soft-drops repeatedly.

### Touch (Mobile)

On touch devices, on-screen controls automatically appear at the bottom of the screen:
- **↺ / ↻ buttons** — rotate counter-clockwise / clockwise
- **HOLD button** — hold the current piece
- **◀ / ▼ / ▶ buttons** — move left / soft drop / move right
- **DROP button** — hard drop

## Game Features

### Core Gameplay
- **7 Tetrominoes**: I, O, T, S, Z, J, L — each with distinct neon colors
- **10×20 playfield** (with 2 hidden rows above for spawn)
- **SRS rotation** with full wall kick tables (JLSTZ kicks, I-piece kicks, O-piece)
- **7-bag randomizer**: guaranteed one of each piece per bag, no droughts
- **Ghost piece**: translucent preview of where the piece will land
- **Hold**: swap current piece with held piece (once per spawn)
- **Lock delay**: 500ms grace period with max 15 resets to prevent infinite stalling
- **Soft drop**: accelerated gravity (1 point per cell)
- **Hard drop**: instant drop to bottom (2 points per cell)

### Scoring
- **Single**: 100 × level
- **Double**: 300 × level
- **Triple**: 500 × level
- **Tetris (4 lines)**: 800 × level
- **Combo bonus**: +50 × combo count × level (consecutive line clears)
- **Back-to-back**: 1.5× multiplier for consecutive Tetris/difficult clears

### Level Progression
- Level increases every 10 lines cleared
- 20 levels with gravity ranging from 1000ms (level 1) down to 1ms (level 20)
- Max level cap at 20

### Visual Effects
- 3D-style block rendering with highlight and shadow gradients
- Distinct color per piece type with borders and inner glow
- Line clear flash animation
- Screen shake on hard drops and line clears
- Particle effects on line clears (colored to match the cleared blocks)
- Floating score popups (SINGLE/DOUBLE/TRIPLE/TETRIS!/COMBO/LEVEL UP!)
- Ghost piece (translucent landing preview)
- Animated background grid and floating orbs

### Audio (Procedural Synthesis)
All sounds generated via Web Audio API — no audio files:
- Background music loop
- Movement, rotation, soft drop, hard drop sounds
- Lock sound
- Line clear, Tetris special, combo sounds
- Level-up fanfare
- Game over sound
- Hold sound
- Menu click

### Game States
- **Menu**: Title, high score display, Play button, controls list, Reset Save button
- **Playing**: Full game with HUD (score, level, lines, combo, next, hold)
- **Paused**: Pause overlay with current score, Resume/Quit buttons
- **Game Over**: Final score (highlighted), high score, level, lines, Play Again/Main Menu buttons

### Persistence
- High score, highest level, most lines saved to localStorage
- Survives page reloads
- Can be reset from the menu's "Reset Save" button

## Architecture

The game uses a modular architecture with clear separation of concerns:

- **Game loop**: `requestAnimationFrame` with delta-time for frame-independent updates
- **State machine**: Menu → Playing → Paused → Game Over
- **Input layer**: Centralized `InputManager` with DAS/ARR, maps keys to actions
- **Game systems**: Each system (scoring, leveling, holding, ghost, rotation, spawner) is independent and composable
- **Rendering**: Canvas-based with separate rendering for board, previews, HUD, and overlays
- **Audio**: IIFE module with procedural synthesis, toggleable mute
- **Responsive**: CSS media queries for desktop and mobile, touch controls auto-detected

## Known Limitations

1. **No multiplayer**: Single-player only.
2. **Audio requires interaction**: Due to browser autoplay policies, audio doesn't play until the first user interaction (click or keypress).
3. **Level cap at 20**: Gravity table only goes to 20 levels; reaching level 20 caps gravity at 1ms per cell.
4. **No configurable controls**: Key bindings are centralized in `constants.js` (CONFIG.CONTROLS) but not rebindable in-game via UI.
5. **No T-Spin detection**: Standard scoring only; T-Spin bonuses are not implemented.
6. **Procedural audio**: Sound effects are synthesized and may sound basic compared to sampled audio assets.
7. **Single next preview**: Shows one next piece (not a 3-5 piece queue preview).
8. **No replay/save state**: Game state cannot be saved mid-game and resumed later (only high score is persisted).

## Technical Details

- **No dependencies**: Pure vanilla JS, HTML5 Canvas, CSS
- **No build step**: Open and play directly
- **Modular**: 14 separate JS modules, each handling a single concern
- **Configurable**: All tunable values in `constants.js` CONFIG object
- **Tested**: All core mechanics verified (7-bag, collision, rotation, line clearing, scoring, combos, B2B, ghost, hold, pause, game over, persistence, touch controls)
