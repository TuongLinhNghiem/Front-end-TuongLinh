/* ============================================================
   tetromino.js — Tetromino piece definitions using SRS.
   Each piece is defined by its 4 rotation states (0, R, 2, L)
   as lists of [x, y] cell offsets within a bounding box.
   Also includes SRS wall-kick data for J/L/S/T/Z and I pieces.
   ============================================================ */

// Each rotation state is a list of 4 [col, row] pairs.
// Coordinates are relative to the piece's anchor (col, row).
// Rotation state 0 = spawn orientation.

const TETROMINOES = {
  I: {
    type: "I",
    color: CONFIG.COLORS.I,
    // I-piece uses a 4x4 bounding box in SRS
    rotations: [
      [[0,1],[1,1],[2,1],[3,1]],  // 0:  horizontal
      [[2,0],[2,1],[2,2],[2,3]],  // R:  vertical
      [[0,2],[1,2],[2,2],[3,2]],  // 2:  horizontal (other way)
      [[1,0],[1,1],[1,2],[1,3]],  // L:  vertical (other way)
    ],
    spawnOffset: { x: 3, y: 0 },  // col offset for spawn in a 10-wide board
  },
  O: {
    type: "O",
    color: CONFIG.COLORS.O,
    // O-piece doesn't really rotate, but we keep 4 identical states
    rotations: [
      [[1,0],[2,0],[1,1],[2,1]],
      [[1,0],[2,0],[1,1],[2,1]],
      [[1,0],[2,0],[1,1],[2,1]],
      [[1,0],[2,0],[1,1],[2,1]],
    ],
    spawnOffset: { x: 3, y: 0 },
  },
  T: {
    type: "T",
    color: CONFIG.COLORS.T,
    rotations: [
      [[1,0],[0,1],[1,1],[2,1]],  // 0:  T pointing up
      [[1,0],[1,1],[2,1],[1,2]],  // R:  T pointing right
      [[0,1],[1,1],[2,1],[1,2]],  // 2:  T pointing down
      [[1,0],[0,1],[1,1],[1,2]],  // L:  T pointing left
    ],
    spawnOffset: { x: 3, y: 0 },
  },
  S: {
    type: "S",
    color: CONFIG.COLORS.S,
    rotations: [
      [[1,0],[2,0],[0,1],[1,1]],  // 0
      [[1,0],[1,1],[2,1],[2,2]],  // R
      [[1,1],[2,1],[0,2],[1,2]],  // 2
      [[0,0],[0,1],[1,1],[1,2]],  // L
    ],
    spawnOffset: { x: 3, y: 0 },
  },
  Z: {
    type: "Z",
    color: CONFIG.COLORS.Z,
    rotations: [
      [[0,0],[1,0],[1,1],[2,1]],  // 0
      [[2,0],[1,1],[2,1],[1,2]],  // R
      [[0,1],[1,1],[1,2],[2,2]],  // 2
      [[1,0],[0,1],[1,1],[0,2]],  // L
    ],
    spawnOffset: { x: 3, y: 0 },
  },
  J: {
    type: "J",
    color: CONFIG.COLORS.J,
    rotations: [
      [[0,0],[0,1],[1,1],[2,1]],  // 0
      [[1,0],[2,0],[1,1],[1,2]],  // R
      [[0,1],[1,1],[2,1],[2,2]],  // 2
      [[1,0],[1,1],[0,2],[1,2]],  // L
    ],
    spawnOffset: { x: 3, y: 0 },
  },
  L: {
    type: "L",
    color: CONFIG.COLORS.L,
    rotations: [
      [[2,0],[0,1],[1,1],[2,1]],  // 0
      [[1,0],[1,1],[1,2],[2,2]],  // R
      [[0,1],[1,1],[2,1],[0,2]],  // 2
      [[0,0],[1,0],[1,1],[1,2]],  // L
    ],
    spawnOffset: { x: 3, y: 0 },
  },
};

// SRS Wall Kick data.
// For J, L, S, T, Z pieces, the kick offsets per rotation transition.
// Index: [fromState][toState] -> list of [dx, dy] kicks to try in order.
// Rotation states: 0=spawn, 1=R(90° CW), 2=180°, 3=L(90° CCW)

const JLSTZ_KICKS = {
  "0->1": [[ 0, 0], [-1, 0], [-1, 1], [ 0,-2], [-1,-2]],
  "1->0": [[ 0, 0], [ 1, 0], [ 1,-1], [ 0, 2], [ 1, 2]],
  "1->2": [[ 0, 0], [ 1, 0], [ 1,-1], [ 0, 2], [ 1, 2]],
  "2->1": [[ 0, 0], [-1, 0], [-1, 1], [ 0,-2], [-1,-2]],
  "2->3": [[ 0, 0], [ 1, 0], [ 1, 1], [ 0,-2], [ 1,-2]],
  "3->2": [[ 0, 0], [-1, 0], [-1,-1], [ 0, 2], [-1, 2]],
  "3->0": [[ 0, 0], [-1, 0], [-1,-1], [ 0, 2], [-1, 2]],
  "0->3": [[ 0, 0], [ 1, 0], [ 1, 1], [ 0,-2], [ 1,-2]],
};

const I_KICKS = {
  "0->1": [[ 0, 0], [-2, 0], [ 1, 0], [-2,-1], [ 1, 2]],
  "1->0": [[ 0, 0], [ 2, 0], [-1, 0], [ 2, 1], [-1,-2]],
  "1->2": [[ 0, 0], [-1, 0], [ 2, 0], [-1, 2], [ 2,-1]],
  "2->1": [[ 0, 0], [ 1, 0], [-2, 0], [ 1,-2], [-2, 1]],
  "2->3": [[ 0, 0], [ 2, 0], [-1, 0], [ 2, 1], [-1,-2]],
  "3->2": [[ 0, 0], [-2, 0], [ 1, 0], [-2,-1], [ 1, 2]],
  "3->0": [[ 0, 0], [ 1, 0], [-2, 0], [ 1,-2], [-2, 1]],
  "0->3": [[ 0, 0], [-1, 0], [ 2, 0], [-1, 2], [ 2,-1]],
};

// O-piece has no kicks (symmetrical)
const O_KICKS = {
  "0->1": [[0,0]], "1->0": [[0,0]],
  "1->2": [[0,0]], "2->1": [[0,0]],
  "2->3": [[0,0]], "3->2": [[0,0]],
  "3->0": [[0,0]], "0->3": [[0,0]],
};

function getKicks(type, fromState, toState) {
  const key = `${fromState}->${toState}`;
  if (type === "I") return I_KICKS[key] || [[0,0]];
  if (type === "O") return O_KICKS[key] || [[0,0]];
  return JLSTZ_KICKS[key] || [[0,0]];
}

/* ---- ActivePiece class ----
   Represents the currently falling piece on the board. */

class ActivePiece {
  constructor(type) {
    const def = TETROMINOES[type];
    this.type = type;
    this.color = def.color;
    this.rotationState = 0;  // 0, 1, 2, 3
    this.def = def;
    // Spawn position: anchored so the piece appears at the top center
    this.x = def.spawnOffset.x;
    this.y = def.spawnOffset.y;
  }

  // Returns the 4 cells [x, y] occupied by the piece at its current
  // rotation state, anchored at (this.x, this.y).
  getCells(rotationState, ax, ay) {
    const rs = rotationState !== undefined ? rotationState : this.rotationState;
    const px = ax !== undefined ? ax : this.x;
    const py = ay !== undefined ? ay : this.y;
    return this.def.rotations[rs].map(([cx, cy]) => [px + cx, py + cy]);
  }

  // Clone for ghost calculations
  clone() {
    const p = new ActivePiece(this.type);
    p.rotationState = this.rotationState;
    p.x = this.x;
    p.y = this.y;
    return p;
  }
}

window.TETROMINOES = TETROMINOES;
window.getKicks = getKicks;
window.ActivePiece = ActivePiece;
