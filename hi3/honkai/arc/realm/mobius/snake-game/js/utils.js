/**
 * utils.js
 * ----------------------------------------------------------------------------
 * Shared constants, grid math, and small helper functions used across the
 * whole game. Keeping these in one place avoids duplicated logic and gives
 * every other module a single source of truth for tunable values.
 *
 * No DOM or canvas dependencies here - pure logic only.
 */

/**
 * Global configuration object. Difficulty-specific values live in
 * DIFFICULTIES below; this object holds settings shared by both modes.
 */
export const CONFIG = {
  // Number of grid cells along the X and Y axes. The grid is square so the
  // canvas always maps cleanly onto it regardless of window size.
  GRID_COLS: 28,
  GRID_ROWS: 20,

  // How many regular foods may exist on the board at the same time (1-2).
  MAX_REGULAR_FOODS: 2,

  // Spawn cadence (in regular-food spawns) before a big food appears.
  BIG_FOOD_EVERY: 5,

  // How many big-food spawns happen before a bomb appears (Normal mode).
  BOMB_EVERY_NORMAL: 2,

  // Delay (ms) before a regular food respawns after being eaten.
  REGULAR_FOOD_RESPAWN_MS: 1000,

  // Minimum grid distance a bomb must keep from the snake head on spawn.
  BOMB_MIN_DISTANCE_FROM_HEAD: 4,

  // Snake rendering sizes, expressed as a fraction of a single grid cell.
  HEAD_SIZE_RATIO: 0.92,
  FOLLOWER_SIZE_RATIO: 0.72,
  FOOD_SIZE_RATIO: 0.8,
  BIG_FOOD_SIZE_RATIO: 0.95,
  BOMB_SIZE_RATIO: 0.85,
};

/**
 * Per-difficulty tuning. Each difficulty bundles every value that differs
 * between Normal and Hell so the rest of the code can stay generic and just
 * read from the active difficulty object.
 */
export const DIFFICULTIES = {
  normal: {
    id: "normal",
    label: "Normal",
    // Movement interval in milliseconds (lower = faster).
    moveIntervalMs: 140,
    // Big food never expires in Normal mode.
    bigFoodLifetimeMs: Infinity,
    // Bomb lifetime and penalty.
    bombLifetimeMs: 5000,
    bombPenalty: 1,
    // A bomb is spawned every BOMB_EVERY_NORMAL big-food spawns.
    bombEvery: CONFIG.BOMB_EVERY_NORMAL,
    // Self-collision: lose the tail follower; game over only when none left.
    selfCollisionRemovesTail: true,
    selfCollisionInstantGameOver: false,
  },
  hell: {
    id: "hell",
    label: "Hell",
    moveIntervalMs: 80,
    // Big food expires after 3 seconds in Hell mode.
    bigFoodLifetimeMs: 3000,
    // Bomb lifetime and (heavier) penalty.
    bombLifetimeMs: 7000,
    bombPenalty: 2,
    // In Hell a bomb spawns as frequently as a big food.
    bombEvery: 1,
    // Any self-collision ends the game immediately.
    selfCollisionRemovesTail: false,
    selfCollisionInstantGameOver: true,
  },
};

/**
 * Game-wide state identifiers. Using an enum-like object prevents typos and
 * makes state transitions readable (e.g. GAME_STATE.PLAYING).
 */
export const GAME_STATE = {
  MENU: "menu",
  PLAYING: "playing",
  PAUSED: "paused",
  WON: "won",
  LOST: "lost",
};

/**
 * Cardinal directions as grid offsets. Storing them as objects lets the snake
 * module add/subtract them and compare for opposite directions.
 */
export const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

/**
 * Returns true when two directions are exact opposites. Used to stop the
 * snake from reversing directly into itself on a single tick.
 */
export function areOpposite(a, b) {
  return a.x + b.x === 0 && a.y + b.y === 0;
}

/**
 * Convert a grid coordinate to a top-left pixel position given a cell size.
 * Centralizes the math so the renderer and logic always agree.
 */
export function gridToPixel(grid, cellSize) {
  return { x: grid.x * cellSize, y: grid.y * cellSize };
}

/**
 * Get the center pixel of a grid cell, handy for drawing sprites centered.
 */
export function gridCenter(grid, cellSize) {
  return {
    x: grid.x * cellSize + cellSize / 2,
    y: grid.y * cellSize + cellSize / 2,
  };
}

/**
 * Two grid cells are equal when both coordinates match.
 */
export function sameCell(a, b) {
  return a.x === b.x && a.y === b.y;
}

/**
 * Is a cell inside the board boundaries?
 */
export function inBounds(grid) {
  return (
    grid.x >= 0 &&
    grid.x < CONFIG.GRID_COLS &&
    grid.y >= 0 &&
    grid.y < CONFIG.GRID_ROWS
  );
}

/**
 * Total number of cells on the board (used by the win condition check).
 */
export function totalCells() {
  return CONFIG.GRID_COLS * CONFIG.GRID_ROWS;
}

/**
 * Clamp a value into [min, max].
 */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * A small deterministic pseudo-random helper in case seeded values are ever
 * needed; the game itself uses Math.random for spawn locations.
 */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Build a {x, y} cell object. Tiny factory keeps cell creation consistent.
 */
export function cell(x, y) {
  return { x, y };
}
