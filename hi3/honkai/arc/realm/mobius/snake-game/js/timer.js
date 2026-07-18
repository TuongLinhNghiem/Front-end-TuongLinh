/**
 * timer.js
 * ----------------------------------------------------------------------------
 * Lightweight, frame-rate-independent timer helpers. Two flavours:
 *
 *   - CountdownTimer : counts down from a duration and reports when expired.
 *                     Used for bomb and big-food lifetimes.
 *   - DelayTimer     : fires once after a delay. Used for the regular-food
 *                     respawn cooldown.
 *
 * Both are driven externally by `update(dtMs)` from the game loop, which keeps
 * them perfectly in sync with the simulation and lets pausing "just work"
 * (the game simply stops calling update while paused).
 */

/**
 * A countdown that runs for `durationMs` and then flags itself expired.
 */
export class CountdownTimer {
  constructor(durationMs) {
    this.durationMs = durationMs;
    this.remaining = durationMs;
    this.expired = false;
    this.running = true;
  }

  /** Advance the timer by `dtMs` milliseconds. */
  update(dtMs) {
    if (!this.running || this.expired) return;
    this.remaining -= dtMs;
    if (this.remaining <= 0) {
      this.remaining = 0;
      this.expired = true;
      this.running = false;
    }
  }

  /** Fraction of lifetime elapsed, 0..1 (handy for drawing fuse bars). */
  get progress() {
    if (this.durationMs === Infinity) return 0;
    return 1 - this.remaining / this.durationMs;
  }

  /** Stop/pause the countdown without expiring it. */
  pause() {
    this.running = false;
  }

  /** Resume a paused countdown. */
  resume() {
    if (!this.expired) this.running = true;
  }
}

/**
 * A one-shot delay that calls `callback` once after `delayMs` of accumulated
 * update() calls. Use `ready` to check whether it has fired.
 */
export class DelayTimer {
  constructor(delayMs, callback) {
    this.delayMs = delayMs;
    this.callback = callback;
    this.remaining = delayMs;
    this.fired = false;
    this.running = true;
  }

  update(dtMs) {
    if (!this.running || this.fired) return;
    this.remaining -= dtMs;
    if (this.remaining <= 0) {
      this.fired = true;
      this.running = false;
      if (this.callback) this.callback();
    }
  }

  pause() {
    this.running = false;
  }

  resume() {
    if (!this.fired) this.running = true;
  }

  get ready() {
    return this.fired;
  }
}
