/* ============================================================
   saveManager.js — High Score persistence via localStorage.
   Stores high score, highest level, and most lines cleared.
   ============================================================ */

const SaveManager = {
  KEY: "tetris_save_v1",

  defaultData: {
    highScore: 0,
    highestLevel: 0,
    mostLines: 0,
  },

  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) return { ...this.defaultData };
      const parsed = JSON.parse(raw);
      return { ...this.defaultData, ...parsed };
    } catch (e) {
      console.warn("Save load error:", e);
      return { ...this.defaultData };
    }
  },

  save(data) {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(data));
    } catch (e) {
      console.warn("Save error:", e);
    }
  },

  // Update high score if the new stats beat existing records.
  // Returns the updated save data.
  update(score, level, lines) {
    const data = this.load();
    let changed = false;
    if (score > data.highScore) { data.highScore = score; changed = true; }
    if (level > data.highestLevel) { data.highestLevel = level; changed = true; }
    if (lines > data.mostLines) { data.mostLines = lines; changed = true; }
    if (changed) this.save(data);
    return data;
  },

  reset() {
    try {
      localStorage.removeItem(this.KEY);
    } catch (e) {}
    return { ...this.defaultData };
  },
};

window.SaveManager = SaveManager;
