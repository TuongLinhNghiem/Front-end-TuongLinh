/* ============================================================
   saveManager.js - localStorage save system
   ============================================================ */

const SaveManager = (function () {
  const KEY = "goldMiner_save_v1";

  const defaultData = {
    bestScores: {},      // { roundNumber: bestScore }
    bestStars: {},       // { roundNumber: bestStarRating (1-3) }
    totalStars: 0,
    completedRounds: [], // list of round numbers completed
    clawSpeedLevel: 1,   // permanent upgrade 1-5
    inventory: {
      tnt: 0,
      shield: 0,
      luckyLeaf: 0
    },
    highestRoundReached: 1,
    lastRoundPlayed: 0
  };

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return { ...defaultData, bestScores: {}, bestStars: {}, completedRounds: [] };
      const parsed = JSON.parse(raw);
      // merge with defaults to handle missing fields
      return {
        ...defaultData,
        ...parsed,
        inventory: { ...defaultData.inventory, ...(parsed.inventory || {}) },
        bestScores: parsed.bestScores || {},
        bestStars: parsed.bestStars || {},
        completedRounds: parsed.completedRounds || []
      };
    } catch (e) {
      console.warn("Save load error, using defaults", e);
      return { ...defaultData, bestScores: {}, bestStars: {}, completedRounds: [] };
    }
  }

  function save(data) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (e) {
      console.warn("Save error", e);
    }
  }

  function reset() {
    try {
      localStorage.removeItem(KEY);
    } catch (e) {}
    return { ...defaultData, bestScores: {}, bestStars: {}, completedRounds: [] };
  }

  return { load, save, reset };
})();
