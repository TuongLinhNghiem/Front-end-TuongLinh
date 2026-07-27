/* ============================================================
   levelSystem.js — Level progression and gravity lookup.
   Level increases every LINES_PER_LEVEL lines cleared.  The
   gravity (ms per cell drop) decreases with level, following
   the classic Tetris guideline speed curve.
   ============================================================ */

class LevelSystem {
  constructor() {
    this.reset();
  }

  reset() {
    this.level = 1;
    this.totalLines = 0; // total lines cleared across the game
  }

  // Add cleared lines and possibly level up.  Returns the number
  // of level-ups that occurred (for visual effects / sounds).
  addLines(lines) {
    this.totalLines += lines;
    let levelUps = 0;
    const newLevel = Math.min(
      CONFIG.MAX_LEVEL,
      Math.floor(this.totalLines / CONFIG.LINES_PER_LEVEL) + 1
    );
    if (newLevel > this.level) {
      levelUps = newLevel - this.level;
      this.level = newLevel;
    }
    return levelUps;
  }

  // Get the current gravity interval in ms.
  gravity() {
    const idx = Math.min(this.level - 1, CONFIG.GRAVITY_TABLE.length - 1);
    return CONFIG.GRAVITY_TABLE[idx];
  }
}

window.LevelSystem = LevelSystem;
