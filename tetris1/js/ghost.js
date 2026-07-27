/* ============================================================
   ghost.js — Ghost piece projection.
   Computes where the current piece would land if hard-dropped
   straight down, returning the landing positions.
   ============================================================ */

const Ghost = {
  // Given the board, piece definition, current rotation state,
  // and origin (row, col), find the lowest valid row.
  compute(board, piece, state, row, col) {
    let testRow = row;
    let positions = Rotation.getCells(piece, state, testRow, col);

    // Move down until invalid
    while (board.isValid(positions)) {
      testRow++;
      positions = Rotation.getCells(piece, state, testRow, col);
    }
    // The last valid position was one row up
    testRow--;
    return Rotation.getCells(piece, state, testRow, col);
  },
};

window.Ghost = Ghost;
