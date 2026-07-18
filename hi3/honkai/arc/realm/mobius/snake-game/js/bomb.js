/**
 * bomb.js
 * ----------------------------------------------------------------------------
 * Bombs are hazardous pickups. When the snake head touches one:
 *   - the snake loses `bombPenalty` followers (1 in Normal, 2 in Hell)
 *   - the bomb plays a sound and is removed
 *
 * Bombs have a lifetime (5s Normal, 7s Hell) after which they vanish on their
 * own. Their spawn frequency is governed by the game's spawn counter (a bomb
 * appears every N big-food spawns). The BombManager only handles lifecycle
 * and hit detection; spawn location is chosen by the game's SpawnSystem so
 * the "not on snake/food/other bomb, and far from head" rules are shared.
 */

import { CountdownTimer } from "./timer.js";
import { sameCell } from "./utils.js";

export class Bomb {
  constructor(position, lifetimeMs) {
    this.position = position;
    this.lifetime = new CountdownTimer(lifetimeMs);
    this.consumed = false;
  }

  update(dtMs) {
    this.lifetime.update(dtMs);
  }

  get expired() {
    return this.consumed || this.lifetime.expired;
  }

  /** Remaining lifetime fraction (0..1 of total elapsed). */
  get elapsedFraction() {
    return this.lifetime.progress;
  }

  pause() {
    this.lifetime.pause();
  }

  resume() {
    this.lifetime.resume();
  }
}

export class BombManager {
  constructor(difficulty, spawnLocator) {
    this.difficulty = difficulty;
    // spawnLocator(minDistanceFromHead) -> free cell far from head or null.
    this.spawnLocator = spawnLocator;
    this.bombs = []; // Bomb[]
  }

  setDifficulty(difficulty) {
    this.difficulty = difficulty;
  }

  /**
   * Spawn a single bomb on a free cell that is also a safe distance from the
   * snake head. Returns true on success.
   */
  spawnBomb(headCell) {
    const pos = this.spawnLocator(headCell);
    if (!pos) return false;
    this.bombs.push(new Bomb(pos, this.difficulty.bombLifetimeMs));
    return true;
  }

  /**
   * Advance all bomb lifetimes and remove expired ones.
   */
  update(dtMs) {
    for (const b of this.bombs) b.update(dtMs);
    this.bombs = this.bombs.filter((b) => !b.expired);
  }

  /**
   * Did the head hit a bomb? Returns the bomb (and consumes it) or null.
   */
  tryHit(head) {
    for (const b of this.bombs) {
      if (!b.consumed && sameCell(b.position, head)) {
        b.consumed = true;
        return b;
      }
    }
    return null;
  }

  pauseTimers() {
    for (const b of this.bombs) b.pause();
  }

  resumeTimers() {
    for (const b of this.bombs) b.resume();
  }

  /** Cells occupied by live bombs (for spawn-free checks). */
  get occupiedCells() {
    return this.bombs.filter((b) => !b.consumed).map((b) => b.position);
  }

  /** How many bombs are currently active. */
  get count() {
    return this.bombs.length;
  }
}
