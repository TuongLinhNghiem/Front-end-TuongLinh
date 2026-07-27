/* ============================================================
   hold.js — Hold Piece System.
   The player can hold the current piece to swap it with a
   stored piece. Hold can only be used once per falling piece.
   ============================================================ */

class HoldSystem {
  constructor() {
    this.heldType = null;
    this.canHold = true;   // resets when a new piece spawns
  }

  // Attempt to hold the current piece.
  // Returns the type to spawn next (from hold or spawner), or null if can't hold.
  hold(currentType, spawner) {
    if (!this.canHold) return null;
    const swapped = this.heldType;
    this.heldType = currentType;
    this.canHold = false;
    // If nothing was held, pull the next from the spawner
    return swapped || spawner.next();
  }

  reset() {
    this.heldType = null;
    this.canHold = true;
  }

  // Called when a new piece spawns — re-enable holding.
  onSpawn() {
    this.canHold = true;
  }
}

window.HoldSystem = HoldSystem;
