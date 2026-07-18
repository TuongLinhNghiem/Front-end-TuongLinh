/**
 * food.js
 * ----------------------------------------------------------------------------
 * Food spawning and state. Two kinds of food live here:
 *
 *   - RegularFood : 1-2 may exist at once. +1 score, +1 follower. Respawn
 *                   one second after being eaten.
 *   - BigFood     : spawned on a counter (every BIG_FOOD_EVERY regular spawns).
 *                   +3 score, +2 followers. Lifetime depends on difficulty
 *                   (Infinity in Normal, 3s in Hell).
 *
 * FoodManager tracks all live food, handles respawn timers, and exposes a
 * clean API the game loop calls: update(dt), tryEat(head), and requestSpawn.
 * The actual spawn-location picking (free cell search) is delegated to the
 * game's SpawnSystem so food/bomb/snake occupancy is considered together.
 */

import { CONFIG, cell as makeCell, sameCell } from "./utils.js";
import { CountdownTimer, DelayTimer } from "./timer.js";

/**
 * A single piece of food on the board. `kind` is "regular" or "big".
 */
export class Food {
  constructor(position, kind, lifetimeMs) {
    this.position = position; // {x, y}
    this.kind = kind; // "regular" | "big"
    this.consumed = false;
    // Big food in Hell mode has a lifetime; regular and Normal big food do not.
    this.lifetime = lifetimeMs && lifetimeMs !== Infinity
      ? new CountdownTimer(lifetimeMs)
      : null;
  }

  update(dtMs) {
    if (this.lifetime) this.lifetime.update(dtMs);
  }

  get expired() {
    return this.consumed || (this.lifetime && this.lifetime.expired);
  }

  pause() {
    if (this.lifetime) this.lifetime.pause();
  }

  resume() {
    if (this.lifetime) this.lifetime.resume();
  }
}

export class FoodManager {
  constructor(difficulty, spawnLocator) {
    this.difficulty = difficulty;
    // spawnLocator(positionKey) -> free cell or null. Provided by the game so
    // food can ask "where can I go that's not on the snake/other food/bombs?"
    this.spawnLocator = spawnLocator;

    this.regularFoods = []; // Food[]
    this.bigFood = null; // single big food at a time

    // Counter of regular foods spawned so far; every BIG_FOOD_EVERY we issue
    // a big food.
    this.regularSpawnCounter = 0;

    // Pending respawn timers for regular food (one per eaten piece).
    this._respawnTimers = [];
  }

  /** Reconfigure when difficulty changes (e.g. restart in another mode). */
  setDifficulty(difficulty) {
    this.difficulty = difficulty;
  }

  /**
   * Seed the board with the initial regular food(s) at game start.
   */
  initialSpawn() {
    while (this.regularFoods.length < CONFIG.MAX_REGULAR_FOODS) {
      this._spawnRegular();
    }
  }

  /**
   * Place one regular food on a free cell. No-op if no free cell exists.
   */
  _spawnRegular() {
    const pos = this.spawnLocator();
    if (!pos) return false;
    this.regularFoods.push(new Food(pos, "regular", null));
    this.regularSpawnCounter += 1;
    return true;
  }

  /**
   * Place a big food on a free cell. Called by the game when the regular
   * spawn counter hits BIG_FOOD_EVERY.
   */
  spawnBig() {
    if (this.bigFood && !this.bigFood.expired) return false;
    const pos = this.spawnLocator();
    if (!pos) return false;
    this.bigFood = new Food(pos, "big", this.difficulty.bigFoodLifetimeMs);
    return true;
  }

  /**
   * Advance all food timers and process pending respawns.
   */
  update(dtMs) {
    for (const f of this.regularFoods) f.update(dtMs);
    if (this.bigFood) this.bigFood.update(dtMs);

    // Drop expired/respawned regular foods.
    this.regularFoods = this.regularFoods.filter((f) => !f.consumed);

    // Drop an expired big food (Hell mode timeout).
    if (this.bigFood && this.bigFood.expired) {
      this.bigFood = null;
    }

    // Process pending respawn timers.
    for (const t of this._respawnTimers) t.update(dtMs);
    this._respawnTimers = this._respawnTimers.filter((t) => {
      if (t.ready) {
        // Respawn a regular food once the delay fires.
        if (this.regularFoods.length < CONFIG.MAX_REGULAR_FOODS) {
          this._spawnRegular();
        }
        return false;
      }
      return true;
    });
  }

  /**
   * Did the snake head eat anything this tick? Returns an event descriptor
   * the game uses to update score/followers/spawn counters, or null.
   *
   * Returns: { kind, score, followers } or null.
   */
  tryEat(head) {
    // Regular food first.
    for (const f of this.regularFoods) {
      if (!f.consumed && sameCell(f.position, head)) {
        f.consumed = true;
        // Schedule respawn after the configured delay.
        this._respawnTimers.push(
          new DelayTimer(CONFIG.REGULAR_FOOD_RESPAWN_MS, null)
        );
        return { kind: "regular", score: 1, followers: 1 };
      }
    }
    // Big food.
    if (this.bigFood && !this.bigFood.expired && sameCell(this.bigFood.position, head)) {
      const result = { kind: "big", score: 3, followers: 2 };
      this.bigFood = null;
      return result;
    }
    return null;
  }

  /**
   * Pause all food timers (called when the game is paused).
   */
  pauseTimers() {
    for (const f of this.regularFoods) f.pause();
    if (this.bigFood) this.bigFood.pause();
    for (const t of this._respawnTimers) t.pause();
  }

  /**
   * Resume all food timers.
   */
  resumeTimers() {
    for (const f of this.regularFoods) f.resume();
    if (this.bigFood) this.bigFood.resume();
    for (const t of this._respawnTimers) t.resume();
  }

  /** All cells currently occupied by food (for spawn-free checks). */
  get occupiedCells() {
    const cells = this.regularFoods.filter((f) => !f.consumed).map((f) => f.position);
    if (this.bigFood && !this.bigFood.expired) cells.push(this.bigFood.position);
    return cells;
  }

  /** Whether a big food currently exists (for HUD / rendering). */
  get hasBigFood() {
    return this.bigFood && !this.bigFood.expired;
  }
}
