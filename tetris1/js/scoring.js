/* ============================================================
   scoring.js — Scoring system.
   Line-based scoring, combo counting, and back-to-back
   bonuses for consecutive Tetris/difficult clears.
   ============================================================ */

class ScoreSystem {
  constructor() {
    this.reset();
  }

  reset() {
    this.score = 0;
    this.combo = -1; // -1 means no combo active; first clear sets it to 0
    this.b2b = false; // back-to-back chain active?
  }

  // Calculate points for clearing `lines` lines at the given level.
  // Returns the points added (0 if no lines cleared).
  // Also updates internal combo and b2b state.
  addLineClears(lines, level) {
    if (lines <= 0) {
      this.combo = -1; // a non-clearing lock breaks the combo
      return 0;
    }

    // Base points from the score table
    let base = CONFIG.SCORE_TABLE[lines] * level;

    // Tetris (4 lines) counts as a "difficult" clear for B2B
    const isDifficult = (lines === 4);

    // Back-to-back bonus
    if (this.b2b && isDifficult) {
      base = Math.floor(base * CONFIG.B2B_MULTIPLIER);
    }
    this.b2b = isDifficult;

    // Combo bonus
    this.combo++;
    if (this.combo > 0) {
      base += CONFIG.COMBO_BONUS * this.combo * level;
    }

    this.score += base;
    return base;
  }

  // Add points for soft drop (per cell)
  addSoftDrop(cells) {
    this.score += cells * CONFIG.SOFT_DROP_POINTS;
  }

  // Add points for hard drop (per cell)
  addHardDrop(cells) {
    this.score += cells * CONFIG.HARD_DROP_POINTS;
  }

  // Reset combo on a lock that clears nothing
  breakCombo() {
    this.combo = -1;
  }
}

window.ScoreSystem = ScoreSystem;
