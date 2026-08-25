/* ============================================================
   tetromino.js — The 7 standard tetromino pieces.
   Each piece has 4 rotation states (0, R, 2, L) defined as
   a matrix of cells.  Also includes SRS wall-kick offset tables.
   ============================================================ */

// ---- SRS wall-kick data ----
// For J, L, S, T, Z pieces:
const KICKS_JLSTZ = {
  '0->R':  [[ 0, 0], [-1, 0], [-1, 1], [ 0,-2], [-1,-2]],
  'R->0':  [[ 0, 0], [ 1, 0], [ 1,-1], [ 0, 2], [ 1, 2]],
  'R->2':  [[ 0, 0], [ 1, 0], [ 1,-1], [ 0, 2], [ 1, 2]],
  '2->R':  [[ 0, 0], [-1, 0], [-1, 1], [ 0,-2], [-1,-2]],
  '2->L':  [[ 0, 0], [ 1, 0], [ 1, 1], [ 0,-2], [ 1,-2]],
  'L->2':  [[ 0, 0], [-1, 0], [-1,-1], [ 0, 2], [-1, 2]],
  'L->0':  [[ 0, 0], [-1, 0], [-1,-1], [ 0, 2], [-1, 2]],
  '0->L':  [[ 0, 0], [ 1, 0], [ 1, 1], [ 0,-2], [ 1,-2]],
};

// For I piece:
const KICKS_I = {
  '0->R':  [[ 0, 0], [-2, 0], [ 1, 0], [-2,-1], [ 1, 2]],
  'R->0':  [[ 0, 0], [ 2, 0], [-1, 0], [ 2, 1], [-1,-2]],
  'R->2':  [[ 0, 0], [-1, 0], [ 2, 0], [-1, 2], [ 2,-1]],
  '2->R':  [[ 0, 0], [ 1, 0], [-2, 0], [ 1,-2], [-2, 1]],
  '2->L':  [[ 0, 0], [ 2, 0], [-1, 0], [ 2, 1], [-1,-2]],
  'L->2':  [[ 0, 0], [-2, 0], [ 1, 0], [-2,-1], [ 1, 2]],
  'L->0':  [[ 0, 0], [ 1, 0], [-2, 0], [ 1,-2], [-2, 1]],
  '0->L':  [[ 0, 0], [-1, 0], [ 2, 0], [-1, 2], [ 2,-1]],
};

// O piece doesn't need kicks (rotation is visually identical)
const KICKS_O = {
  '0->R': [[0,0]], 'R->0': [[0,0]],
  'R->2': [[0,0]], '2->R': [[0,0]],
  '2->L': [[0,0]], 'L->2': [[0,0]],
  'L->0': [[0,0]], '0->L': [[0,0]],
};

// ---- Rotation-state labels ----
const ROT_NAMES = ['0', 'R', '2', 'L'];

// ---- Piece definitions ----
// Each state is a list of [row, col] offsets from the piece origin.
// We define states in SRS standard orientation.
const PIECES = {
  I: {
    type: 'I',
    color: CONFIG.COLORS.I,
    kicks: KICKS_I,
    states: [
      // 0 — horizontal
      [[0,0],[0,1],[0,2],[0,3]],
      // R
      [[0,2],[1,2],[2,2],[3,2]],
      // 2
      [[3,0],[3,1],[3,2],[3,3]],
      // L
      [[0,1],[1,1],[2,1],[3,1]],
    ],
  },
  O: {
    type: 'O',
    color: CONFIG.COLORS.O,
    kicks: KICKS_O,
    states: [
      [[0,1],[0,2],[1,1],[1,2]],
      [[0,1],[0,2],[1,1],[1,2]],
      [[0,1],[0,2],[1,1],[1,2]],
      [[0,1],[0,2],[1,1],[1,2]],
    ],
  },
  T: {
    type: 'T',
    color: CONFIG.COLORS.T,
    kicks: KICKS_JLSTZ,
    states: [
      // 0 — T pointing down
      [[0,1],[1,0],[1,1],[1,2]],
      // R
      [[0,1],[1,1],[1,2],[2,1]],
      // 2 — T pointing up
      [[0,0],[0,1],[0,2],[1,1]],
      // L
      [[0,1],[1,0],[1,1],[2,1]],
    ],
  },
  S: {
    type: 'S',
    color: CONFIG.COLORS.S,
    kicks: KICKS_JLSTZ,
    states: [
      // 0
      [[0,1],[0,2],[1,0],[1,1]],
      // R
      [[0,1],[1,1],[1,2],[2,2]],
      // 2
      [[1,1],[1,2],[2,0],[2,1]],
      // L
      [[0,0],[1,0],[1,1],[2,1]],
    ],
  },
  Z: {
    type: 'Z',
    color: CONFIG.COLORS.Z,
    kicks: KICKS_JLSTZ,
    states: [
      // 0
      [[0,0],[0,1],[1,1],[1,2]],
      // R
      [[0,2],[1,1],[1,2],[2,1]],
      // 2
      [[1,0],[1,1],[2,1],[2,2]],
      // L
      [[0,1],[1,0],[1,1],[2,0]],
    ],
  },
  J: {
    type: 'J',
    color: CONFIG.COLORS.J,
    kicks: KICKS_JLSTZ,
    states: [
      // 0 — J
      [[0,0],[1,0],[1,1],[1,2]],
      // R
      [[0,1],[0,2],[1,1],[2,1]],
      // 2
      [[0,0],[0,1],[0,2],[1,2]],
      // L
      [[0,1],[1,1],[2,0],[2,1]],
    ],
  },
  L: {
    type: 'L',
    color: CONFIG.COLORS.L,
    kicks: KICKS_JLSTZ,
    states: [
      // 0 — L
      [[0,2],[1,0],[1,1],[1,2]],
      // R
      [[0,1],[1,1],[2,1],[2,2]],
      // 2
      [[0,0],[0,1],[0,2],[1,0]],
      // L
      [[0,0],[0,1],[1,1],[2,1]],
    ],
  },
};

// All piece type names in standard order
const PIECE_TYPES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

// Spawn column offsets for each piece (so pieces appear centered)
const SPAWN_COL = { I: 3, O: 4, T: 3, S: 3, Z: 3, J: 3, L: 3 };

window.PIECES = PIECES;
window.PIECE_TYPES = PIECE_TYPES;
window.ROT_NAMES = ROT_NAMES;
window.SPAWN_COL = SPAWN_COL;
