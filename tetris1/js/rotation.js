/* ============================================================
   rotation.js — SRS rotation with wall kicks.
   Given a piece, its current rotation, and a direction (CW/CCW),
   compute the new rotation and attempt wall-kick offsets.
   ============================================================ */

const Rotation = {
  // Rotate a piece's cell positions from one state to the next.
  // state: current state index (0-3)
  // dir: 1 for CW (0->R->2->L->0), -1 for CCW
  rotateState(state, dir) {
    return (state + dir + 4) % 4;
  },

  // Build a key for the kick table, e.g. "0->R"
  kickKey(fromState, toState) {
    return ROT_NAMES[fromState] + '->' + ROT_NAMES[toState];
  },

  // Attempt a rotation with wall kicks.
  // Returns the new positions (array of [r,c]) if successful,
  // or null if the rotation is blocked.
  // piece: the PIECES definition object
  // state: current rotation state index
  // dir: 1 (CW) or -1 (CCW)
  // row, col: current origin of the piece
  // board: the Board instance for collision checks
  tryRotate(piece, state, dir, row, col, board) {
    const newState = this.rotateState(state, dir);
    const key = this.kickKey(state, newState);
    const kicks = piece.kicks[key] || [[0, 0]];

    // Base cells for the new state
    const baseCells = piece.states[newState];

    for (const [dr, dc] of kicks) {
      const positions = baseCells.map(([r, c]) => [row + r - dr, col + c + dc]);
      // Note: SRS kick y-axis is inverted (up is negative), so we subtract dr
      if (board.isValid(positions)) {
        return {
          state: newState,
          row: row - dr,
          col: col + dc,
          positions: positions,
        };
      }
    }
    return null; // rotation failed
  },

  // Simple rotation without kicks (for preview rendering)
  getCells(piece, state, row, col) {
    return piece.states[state].map(([r, c]) => [row + r, col + c]);
  },
};

window.Rotation = Rotation;
