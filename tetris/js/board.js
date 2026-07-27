/* ============================================================
   board.js — Board Manager.
   Manages the game grid, collision detection, line detection
   and line clearing with gravity.
   ============================================================ */

class Board {
  constructor(cols, rows, hiddenRows = 0) {
    this.cols = cols;
    this.rows = rows;            // visible rows
    this.hiddenRows = hiddenRows;
    this.totalRows = rows + hiddenRows;
    // Grid is a 2D array: grid[row][col] = null or color string
    this.grid = this.createEmptyGrid();
  }

  createEmptyGrid() {
    const g = [];
    for (let r = 0; r < this.totalRows; r++) {
      g.push(new Array(this.cols).fill(null));
    }
    return g;
  }

  reset() {
    this.grid = this.createEmptyGrid();
  }

  // Check if a set of cells (from a piece) would collide with
  // boundaries or existing blocks. Returns true if collision.
  collides(cells) {
    for (const [x, y] of cells) {
      // Out of horizontal bounds
      if (x < 0 || x >= this.cols) return true;
      // Out of vertical bounds (below visible area)
      if (y >= this.totalRows) return true;
      // Collision with existing block (skip negative y — hidden buffer)
      if (y >= 0 && this.grid[y][x] !== null) return true;
    }
    return false;
  }

  // Lock a piece's cells into the grid with its color.
  // Returns the list of row indices that are now full.
  lockPiece(piece) {
    const cells = piece.getCells();
    const filledRows = new Set();
    for (const [x, y] of cells) {
      if (y >= 0 && y < this.totalRows) {
        this.grid[y][x] = piece.color;
        filledRows.add(y);
      }
    }
    // Return full rows (sorted top to bottom)
    return Array.from(filledRows).sort((a, b) => a - b);
  }

  // Find which of the given rows are full (all cells occupied).
  findFullRows(rows) {
    return rows.filter(r => {
      if (r < 0 || r >= this.totalRows) return false;
      return this.grid[r].every(cell => cell !== null);
    });
  }

  // Clear the given rows and shift everything above downward.
  // Returns the number of rows cleared.
  clearLines(rows) {
    if (rows.length === 0) return 0;
    // Sort descending so we clear from bottom up
    const sorted = [...rows].sort((a, b) => b - a);
    for (const r of sorted) {
      // Remove the row
      this.grid.splice(r, 1);
      // Add a new empty row at the top
      this.grid.unshift(new Array(this.cols).fill(null));
    }
    return rows.length;
  }

  // Check if the piece can spawn at its initial position.
  // If the spawn cells collide, it's game over.
  canSpawn(cells) {
    return !this.collides(cells);
  }

  // Check if any cell in the top hidden rows is occupied (top-out).
  isTopOut() {
    for (let r = 0; r < this.hiddenRows; r++) {
      if (this.grid[r].some(cell => cell !== null)) return true;
    }
    return false;
  }
}

window.Board = Board;
