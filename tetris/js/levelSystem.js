/* ============================================================
   levelSystem.js — Level progression and gravity.
   Level increases every LINES_PER_LEVEL lines cleared.
   Gravity speed is looked up from the GRAVITY_TABLE.
   ============================================================ */

const LevelSystem = {
  // Returns the gravity interval (ms per cell) for a given level.
  getGravity(level) {
    const idx = Math.min(level - 1, CONFIG.GRAVITY_TABLE.length - 1);
    return CONFIG.GRAVITY_TABLE[Math.max(0, idx)];
  },

  // Given total lines cleared, return the current level.
  getLevel(totalLines) {
    return Math.min(
      Math.floor(totalLines / CONFIG.LINES_PER_LEVEL) + 1,
      CONFIG.MAX_LEVEL
    );
  },

  // Check if the player leveled up after clearing lines.
  // Returns the new level or null if no level-up.
  checkLevelUp(oldLevel, totalLines) {
    const newLevel = this.getLevel(totalLines);
    return newLevel > oldLevel ? newLevel : null;
  },
};

window.LevelSystem = LevelSystem;
