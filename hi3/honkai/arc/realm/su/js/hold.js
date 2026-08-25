/* ============================================================
   hold.js — Hold piece system.
   Allows the player to stash the current piece and swap it
   with the held piece.  Only one swap is allowed per spawned
   piece (until the next piece locks).
   ============================================================ */

class HoldManager {
  constructor() {
    this.heldPiece = null;
    this.canHold = true;
  }

  reset() {
    this.heldPiece = null;
    this.canHold = true;
  }

  // Swap the current piece type with the held one.
  // currentType: the type string of the current piece ('I', etc.)
  // spawner: the Spawner instance (for fetching a fresh piece if
  //          the hold slot was empty)
  // Returns the type to use for the next active piece, or null
  // if the hold is not allowed (already used this turn).
  swap(currentType, spawner) {
    if (!this.canHold) return null;

    const prevHeld = this.heldPiece;
    this.heldPiece = currentType;
    this.canHold = false;

    if (prevHeld) {
      return prevHeld; // swap with previously held piece
    }
    // Nothing was held → pull the next piece from the queue
    return spawner.next();
  }
}

window.HoldManager = HoldManager;
