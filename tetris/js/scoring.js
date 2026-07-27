/* ============================================================
   scoring.js — Scoring System.
   Handles line-clear scoring (single/double/triple/tetris),
   combo tracking, and back-to-back bonuses.
   ============================================================ */

const ScoringSystem = {
  // Initialize/reset combo state
  init() {
    this.combo = -1;       // -1 means no combo active (first clear = combo 0)
    this.backToBack = false;
  },

  // Calculate score for a line clear event.
  // linesCleared: 1-4
  // level: current level (for score multiplication)
  // Returns { score, label, isTetris, isB2B, comboCount }
  calculate(linesCleared, level) {
    if (linesCleared === 0) return { score: 0, label: null, isTetris: false, isB2B: false, comboCount: 0 };

    let baseScore = 0;
    let label = "";
    let isTetris = false;

    switch (linesCleared) {
      case 1: baseScore = CONFIG.SCORE_TABLE.single; label = "SINGLE"; break;
      case 2: baseScore = CONFIG.SCORE_TABLE.double; label = "DOUBLE"; break;
      case 3: baseScore = CONFIG.SCORE_TABLE.triple; label = "TRIPLE"; break;
      case 4: baseScore = CONFIG.SCORE_TABLE.tetris; label = "TETRIS"; isTetris = true; break;
    }

    // Back-to-back: consecutive Tetris clears get a bonus
    let isB2B = false;
    if (isTetris && this.backToBack) {
      baseScore = Math.floor(baseScore * CONFIG.B2B_MULTIPLIER);
      isB2B = true;
    }

    // Update back-to-back state
    this.backToBack = isTetris;

    // Combo: consecutive line clears (any count) increment combo
    this.combo++;
    const comboBonus = this.combo > 0
      ? CONFIG.COMBO_BONUS * this.combo * level
      : 0;

    const totalScore = (baseScore * level) + comboBonus;

    return {
      score: totalScore,
      label,
      isTetris,
      isB2B,
      comboCount: this.combo,
    };
  },

  // Called when a piece locks without clearing lines — resets combo.
  onNoClear() {
    this.combo = -1;
  },

  // Soft drop score (per cell)
  softDropScore(cells) {
    return cells * CONFIG.SCORE_TABLE.softDrop;
  },

  // Hard drop score (per cell)
  hardDropScore(cells) {
    return cells * CONFIG.SCORE_TABLE.hardDrop;
  },
};

window.ScoringSystem = ScoringSystem;
