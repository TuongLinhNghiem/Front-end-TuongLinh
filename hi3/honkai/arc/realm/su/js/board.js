/* ============================================================
   board.js — The playfield grid, collision detection, and
   line-clearing logic.  The board includes HIDDEN_ROWS above
   the visible field so pieces can spawn off-screen.
   ============================================================ */

class Board {
  constructor() {
    this.cols = CONFIG.COLS;
    this.totalRows = CONFIG.TOTAL_ROWS;
    this.rows = CONFIG.ROWS;
    this.reset();
  }

  reset() {
    // grid[row][col] = piece-type string ('I','O',...) or 0 for empty
    this.grid = [];
    for (let r = 0; r < this.totalRows; r++) {
      this.grid.push(new Array(this.cols).fill(CONFIG.EMPTY));
    }
  }

  // ---- Check if a piece's absolute cell positions are valid ----
  // positions: array of [row, col]
  isValid(positions) {
    for (const [r, c] of positions) {
      if (c < 0 || c >= this.cols) return false;
      if (r >= this.totalRows) return false;
      if (r < 0) continue; // above the top is fine (spawn area)
      if (this.grid[r][c] !== CONFIG.EMPTY) return false;
    }
    return true;
  }

  // ---- Lock a piece onto the grid ----
  lock(positions, type) {
    for (const [r, c] of positions) {
      if (r >= 0 && r < this.totalRows && c >= 0 && c < this.cols) {
        this.grid[r][c] = type;
      }
    }
  }

  // ---- Detect full rows (returns array of row indices) ----
  // Only checks visible rows (the bottom ROWS).
  getFullRows() {
    const full = [];
    for (let r = this.HIDDEN_ROWS_OFFSET(); r < this.totalRows; r++) {
      if (this.grid[r].every(cell => cell !== CONFIG.EMPTY)) {
        full.push(r);
      }
    }
    return full;
  }

  HIDDEN_ROWS_OFFSET() {
    return CONFIG.HIDDEN_ROWS;
  }

  // ---- Clear the given rows and shift everything down ----
  // Returns the array of cleared row indices.
  clearLines(rows) {
    if (!rows.length) return [];

    // Sort descending so we remove from the bottom up
    rows.sort((a, b) => b - a);
    for (const r of rows) {
      this.grid.splice(r, 1);
      // Insert a new empty row at the top (spawn area)
      this.grid.unshift(new Array(this.cols).fill(CONFIG.EMPTY));
    }
    return rows;
  }

  // ---- Check if the board has overflowed (any locked cell in hidden rows) ----
  // This means game over.
  isOverflow() {
    // If any cell in the hidden spawn rows is occupied → game over
    for (let r = 0; r < CONFIG.HIDDEN_ROWS; r++) {
      if (this.grid[r].some(cell => cell !== CONFIG.EMPTY)) return true;
    }
    return false;
  }
}

window.Board = Board;
