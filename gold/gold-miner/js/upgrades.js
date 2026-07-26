/* ============================================================
   upgrades.js - Claw retrieval speed upgrade (Level 1..5)
   Permanent upgrade stored in save data.
   ============================================================ */

const Upgrades = (function () {
  const MAX_LEVEL = 5;
  // Price to go from current level to the next
  const PRICES = { 2: 600, 3: 900, 4: 1400, 5: 2000 };

  function priceForNextLevel(level) {
    if (level >= MAX_LEVEL) return null;
    return PRICES[level + 1];
  }

  function canUpgrade(level) { return level < MAX_LEVEL; }

  // Speed multiplier per level
  function multiplier(level) {
    return [1.0, 1.1, 1.2, 1.35, 1.5][Math.min(Math.max(level - 1, 0), 4)];
  }

  return { MAX_LEVEL, PRICES, priceForNextLevel, canUpgrade, multiplier };
})();
