/* ============================================================
   constants.js — Central configuration for the Tetris game.
   All tunable values live here: dimensions, colors, gravity,
   controls, scoring, and game-state identifiers.
   ============================================================ */

const CONFIG = {
  // ---- Playfield dimensions ----
  COLS: 10,           // visible columns
  ROWS: 20,           // visible rows
  HIDDEN_ROWS: 2,     // spawn buffer above the visible field
  get TOTAL_ROWS() { return this.ROWS + this.HIDDEN_ROWS; },

  // ---- Block rendering ----
  BLOCK_SIZE: 30,     // px per cell on the main canvas
  CELL_GAP: 1,        // tiny gap between cells for a grid look

  // ---- Canvas dimensions (derived) ----
  get CANVAS_WIDTH()  { return this.COLS * this.BLOCK_SIZE; },   // 300
  get CANVAS_HEIGHT() { return this.ROWS * this.BLOCK_SIZE; },   // 600

  // ---- Preview canvas ----
  PREVIEW_SIZE: 90,

  // ---- Timing (ms) ----
  LOCK_DELAY: 500,          // grace period before a piece locks
  MAX_LOCK_RESETS: 15,     // prevent infinite stalling
  DAS: 150,                // delayed auto-shift (initial delay)
  ARR: 40,                 // auto-repeat rate (move interval)
  SOFT_DROP_INTERVAL: 35,  // soft drop repeat

  // ---- Level / gravity (ms per cell drop) ----
  GRAVITY_TABLE: [
    1000, 793, 618, 473, 355, 262, 190, 135, 94, 64,
    43, 28, 18, 11, 7, 4, 3, 2, 1, 1, 1
  ],
  MAX_LEVEL: 20,
  LINES_PER_LEVEL: 10,

  // ---- Scoring ----
  SCORE_TABLE: [0, 100, 300, 500, 800], // [none, single, double, triple, tetris]
  COMBO_BONUS: 50,       // per combo step
  SOFT_DROP_POINTS: 1,  // per cell
  HARD_DROP_POINTS: 2,  // per cell
  B2B_MULTIPLIER: 1.5,  // back-to-back multiplier

  // ---- Controls (key bindings) ----
  CONTROLS: {
    left:    'ArrowLeft',
    right:   'ArrowRight',
    down:    'ArrowDown',
    rotateCW:  'ArrowUp',
    rotateCCW: 'KeyZ',
    hardDrop: 'Space',
    hold:    'KeyC',
    pause:   'KeyP',
    mute:    'KeyM',
  },

  // ---- Colors per piece type (I, O, T, S, Z, J, L) ----
  // Each color: [base, light, dark] for 3D shading
  COLORS: {
    I: { base: '#00f0f0', light: '#9ffefe', dark: '#00a8a8' },
    O: { base: '#f7d51d', light: '#ffe98a', dark: '#b89c0a' },
    T: { base: '#a64fd0', light: '#d49aff', dark: '#7a2f9e' },
    S: { base: '#00d450', light: '#7fffa0', dark: '#00a838' },
    Z: { base: '#ff3850', light: '#ff9fa8', dark: '#c01028' },
    J: { base: '#2864f0', light: '#9fbaff', dark: '#1640a8' },
    L: { base: '#ff8c1a', light: '#ffc78a', dark: '#c8600a' },
  },

  // ghost piece
  GHOST_ALPHA: 0.25,

  // empty cell
  EMPTY: 0,
};

// ---- Game states ----
const STATE = {
  MENU: 'menu',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAMEOVER: 'gameover',
};

// expose globally
window.CONFIG = CONFIG;
window.STATE = STATE;
