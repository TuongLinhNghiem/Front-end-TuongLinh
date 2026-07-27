/* ============================================================
   spawner.js — Piece Spawner with 7-bag randomizer.
   Ensures all 7 Tetromino types are distributed fairly: each
   "bag" of 7 pieces contains exactly one of each type, shuffled.
   ============================================================ */

const PIECE_TYPES = ["I", "O", "T", "S", "Z", "J", "L"];

class Spawner {
  constructor() {
    this.bag = [];
    this.queue = [];   // pre-generated next pieces (we keep a few ahead)
    this.refillQueue(5);
  }

  // Shuffle the current bag (Fisher-Yates)
  shuffleBag() {
    const bag = [...PIECE_TYPES];
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
    return bag;
  }

  // Ensure the queue has at least n pieces, refilling from bags.
  refillQueue(n) {
    while (this.queue.length < n) {
      if (this.bag.length === 0) {
        this.bag = this.shuffleBag();
      }
      this.queue.push(this.bag.shift());
    }
  }

  // Get the next piece type and advance the queue.
  next() {
    if (this.queue.length === 0) this.refillQueue(5);
    const type = this.queue.shift();
    this.refillQueue(5);
    return type;
  }

  // Peek at the next n piece types without consuming.
  peek(n) {
    if (this.queue.length < n) this.refillQueue(n);
    return this.queue.slice(0, n);
  }

  reset() {
    this.bag = [];
    this.queue = [];
    this.refillQueue(5);
  }
}

window.Spawner = Spawner;
window.PIECE_TYPES = PIECE_TYPES;
