/* ============================================================
   saveManager.js — Persistent high scores via localStorage.
   Stores the best score, highest level, and most lines.
   ============================================================ */

const SaveManager = {
  KEY: 'tetris_arcade_save_v1',

  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (raw) {
        const data = JSON.parse(raw);
        return {
          highScore: data.highScore || 0,
          bestLevel: data.bestLevel || 0,
          mostLines: data.mostLines || 0,
        };
      }
    } catch (e) {
      console.warn('SaveManager: could not load save', e);
    }
    return { highScore: 0, bestLevel: 0, mostLines: 0 };
  },

  save(score, level, lines) {
    const current = this.load();
    const updated = {
      highScore: Math.max(current.highScore, score),
      bestLevel: Math.max(current.bestLevel, level),
      mostLines: Math.max(current.mostLines, lines),
    };
    try {
      localStorage.setItem(this.KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('SaveManager: could not save', e);
    }
    return updated;
  },

  reset() {
    try {
      localStorage.removeItem(this.KEY);
    } catch (e) { /* ignore */ }
  },
};

window.SaveManager = SaveManager;
