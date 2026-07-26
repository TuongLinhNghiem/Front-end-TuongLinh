/* ============================================================
   inventory.js - Consumable inventory tracking
   Holds counts of TNT, Shield, Lucky Leaf + Lucky Leaf active flag.
   ============================================================ */

class Inventory {
  constructor(saved) {
    this.tnt = (saved && saved.tnt) || 0;
    this.shield = (saved && saved.shield) || 0;
    this.luckyLeaf = (saved && saved.luckyLeaf) || 0;
    // Lucky Leaf "active" = waiting for the next rock to transform
    this.luckyLeafActive = false;
  }

  serialize() {
    return {
      tnt: this.tnt,
      shield: this.shield,
      luckyLeaf: this.luckyLeaf
    };
  }

  addTNT(n) { this.tnt += n; }
  addShield(n) { this.shield += n; }
  addLuckyLeaf(n) { this.luckyLeaf += n; }

  hasTNT() { return this.tnt > 0; }
  hasShield() { return this.shield > 0; }
  hasLuckyLeaf() { return this.luckyLeaf > 0; }

  consumeTNT() { if (this.tnt > 0) { this.tnt--; return true; } return false; }
  consumeShield() { if (this.shield > 0) { this.shield--; return true; } return false; }

  // Lucky leaf: one stored item, when activated it waits for next rock.
  activateLuckyLeaf() {
    if (this.luckyLeaf > 0) { this.luckyLeaf--; this.luckyLeafActive = true; return true; }
    return false;
  }
  consumeLuckyLeafOnTransform() { this.luckyLeafActive = false; }
  isLuckyLeafActive() { return this.luckyLeafActive; }
}
