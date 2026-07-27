/* ============================================================
   spawner.js — 7-bag randomizer.  Each "bag" contains one of
   each of the 7 piece types in random order.  When the bag
   is exhausted a new shuffled bag is generated.
   ============================================================ */

class Spawner {
  constructor() {
    this.queue = [];
    this.refill();
    this.refill(); // pre-fill 2 bags so the "next" preview works
  }

  // Fisher-Yates shuffle in place
  shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  refill() {
    const bag = [...PIECE_TYPES];
    this.shuffle(bag);
    this.queue.push(...bag);
  }

  // Pop the next piece type off the queue.
  // Ensures at least 1 piece remains for the "next" preview.
  next() {
    if (this.queue.length <= 1) this.refill();
    return this.queue.shift();
  }

  // Peek at the upcoming piece(s) without removing them.
  // count: how many upcoming pieces to return.
  peek(count = 1) {
    while (this.queue.length < count) this.refill();
    return this.queue.slice(0, count);
  }

  reset() {
    this.queue = [];
    this.refill();
    this.refill();
  }
}

window.Spawner = Spawner;
