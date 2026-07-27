/* ============================================================
   constants.js — Central configuration for the entire game.
   All tunable values live here so they can be changed in one place.
   ============================================================ */

const CONFIG = {
  // Board dimensions (in grid cells)
  COLS: 10,
  ROWS: 20,
  HIDDEN_ROWS: 2,        // buffer rows above the visible board for spawn

  // Rendering
  CELL_SIZE: 30,         // pixels per cell on the main board
  PREVIEW_CELL_SIZE: 22, // pixels per cell in next/hold previews

  // Colors per Tetromino type (original palette, not Tetris branding)
  COLORS: {
    I: "#00d4e6",   // cyan
    O: "#f7d51d",   // yellow
    T: "#a64fd0",   // purple
    S: "#41d957",   // green
    Z: "#e63946",   // red
    J: "#2d7af6",   // blue
    L: "#ff8c1a",   // orange
    GHOST: "rgba(255,255,255,0.18)",
    GRID: "rgba(255,255,255,0.06)",
    EMPTY: "#161620",
    LOCKED_BORDER: "rgba(0,0,0,0.35)",
  },

  // Gravity: milliseconds per cell-drop at each level (1–20)
  // Lower = faster.  Classic-style exponential progression.
  GRAVITY_TABLE: [
    1000, 850, 700, 600, 500,  // levels 1-5
    450, 400, 350, 300, 250,  // levels 6-10
    220, 200, 180, 160, 140,  // levels 11-15
    120, 100, 80,  70,  50,   // levels 16-20
  ],

  // Lock delay: time (ms) a piece can sit on the ground before locking
  LOCK_DELAY: 500,
  MAX_LOCK_RESETS: 15,    // prevent infinite stalling

  // Soft drop speed (ms per cell when holding Down)
  SOFT_DROP_INTERVAL: 40,

  // DAS (Delayed Auto Shift) — time before auto-repeat starts
  DAS_DELAY: 170,
  // ARR (Auto Repeat Rate) — time between auto-repeats
  ARR_INTERVAL: 50,

  // Scoring (values per line-clear type, multiplied by level)
  SCORE_TABLE: {
    single:   100,
    double:   300,
    triple:   500,
    tetris:   800,
    softDrop: 1,    // per cell soft-dropped
    hardDrop: 2,    // per cell hard-dropped
  },

  // Combo bonus: +50 * combo * level for each consecutive clear
  COMBO_BONUS: 50,
  // Back-to-back: 1.5x multiplier for consecutive Tetris/T-spin clears
  B2B_MULTIPLIER: 1.5,

  // Level progression
  LINES_PER_LEVEL: 10,
  MAX_LEVEL: 20,

  // Line clear animation
  LINE_CLEAR_DURATION: 350, // ms

  // Screen shake
  SHAKE_TETRIS: 8,
  SHAKE_NORMAL: 3,
  SHAKE_DURATION: 250,

  // Controls (key bindings) — centralized for easy modification
  CONTROLS: {
    moveLeft:     "ArrowLeft",
    moveRight:    "ArrowRight",
    softDrop:     "ArrowDown",
    rotateCW:     "ArrowUp",
    rotateCCW:    "KeyZ",
    hardDrop:     "Space",
    hold:         "KeyC",
    pause:        "KeyP",
    pauseAlt:     "Escape",
    restart:      "KeyR",
  },

  // Canvas dimensions (computed)
  get BOARD_WIDTH()  { return this.COLS * this.CELL_SIZE; },
  get BOARD_HEIGHT() { return this.ROWS * this.CELL_SIZE; },
};

// Game states
const GameState = {
  MENU: "menu",
  PLAYING: "playing",
  PAUSED: "paused",
  GAMEOVER: "gameover",
};

// Make available globally (no module system — loaded via <script> tags)
window.CONFIG = CONFIG;
window.GameState = GameState;
