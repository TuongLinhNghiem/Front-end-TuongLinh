/* ============================================================
   rotation.js — Rotation System with SRS wall kicks.
   Handles clockwise (CW) and counter-clockwise (CCW) rotation,
   applying wall-kick offsets when the rotation would collide.
   Returns the new rotation state and position if successful,
   or null if the rotation fails (all kicks collide).
   ============================================================ */

const RotationSystem = {
  // Rotate clockwise: 0 -> 1 -> 2 -> 3 -> 0
  rotateCW(piece, board) {
    const fromState = piece.rotationState;
    const toState = (fromState + 1) % 4;
    return this.tryRotate(piece, board, fromState, toState);
  },

  // Rotate counter-clockwise: 0 -> 3 -> 2 -> 1 -> 0
  rotateCCW(piece, board) {
    const fromState = piece.rotationState;
    const toState = (fromState + 3) % 4;
    return this.tryRotate(piece, board, fromState, toState);
  },

  // Try all kicks for a rotation transition.
  // Returns true if the rotation succeeded (piece updated in place).
  tryRotate(piece, board, fromState, toState) {
    const kicks = getKicks(piece.type, fromState, toState);
    for (const [dx, dy] of kicks) {
      const testCells = piece.getCells(toState, piece.x + dx, piece.y + dy);
      if (!board.collides(testCells)) {
        piece.rotationState = toState;
        piece.x += dx;
        piece.y += dy;
        return true;
      }
    }
    return false;
  },
};

window.RotationSystem = RotationSystem;
