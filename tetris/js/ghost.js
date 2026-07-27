/* ============================================================
   ghost.js — Ghost Piece System.
   Computes where the current piece will land if hard-dropped,
   returning a shadow piece for visual preview.
   ============================================================ */

const GhostSystem = {
  // Returns the y offset the piece would land at (its drop distance).
  // Does not modify the actual piece.
  computeDrop(piece, board) {
    let dy = 0;
    while (true) {
      const testCells = piece.getCells(
        piece.rotationState, piece.x, piece.y + dy + 1
      );
      if (board.collides(testCells)) break;
      dy++;
    }
    return dy;
  },

  // Returns a clone of the piece positioned at the landing spot.
  getGhost(piece, board) {
    const dy = this.computeDrop(piece, board);
    const ghost = piece.clone();
    ghost.y += dy;
    return ghost;
  },
};

window.GhostSystem = GhostSystem;
