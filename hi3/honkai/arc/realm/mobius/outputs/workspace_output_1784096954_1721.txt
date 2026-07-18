/**
 * collision.js
 * ----------------------------------------------------------------------------
 * Pure collision-detection helpers. Keeping every "did thing A hit thing B"
 * check in one place means the snake, food, and bomb modules never reinvent
 * the same logic, and the rules are easy to audit in a single file.
 *
 * All functions work on grid cells ({x, y}) unless noted otherwise.
 */

import { sameCell, inBounds } from "./utils.js";

/**
 * Does `head` collide with any wall?
 */
export function hitWall(head) {
  return !inBounds(head);
}

/**
 * Does `head` collide with any cell in `cells` (a list of grid cells)?
 * Optionally skip the first `skip` cells - used for self-collision where the
 * snake's own neck cell must not count.
 */
export function hitAny(head, cells, skip = 0) {
  for (let i = skip; i < cells.length; i++) {
    if (sameCell(head, cells[i])) return true;
  }
  return false;
}

/**
 * Self-collision: does the head touch any of the snake's body cells? The
 * `minBodyIndex` lets callers exclude the neck (index 1) so a fresh step
 * forward never falsely counts as a self-hit.
 */
export function hitSelf(head, bodyCells, minBodyIndex = 1) {
  return hitAny(head, bodyCells, minBodyIndex);
}

/**
 * Does `cell` overlap any of the supplied occupant lists? Used by the spawn
 * system to find free cells. Each argument is an array of {x, y} cells (or
 * null/undefined, which is ignored).
 */
export function occupies(cell, ...cellLists) {
  for (const list of cellLists) {
    if (!list) continue;
    for (const c of list) {
      if (sameCell(cell, c)) return true;
    }
  }
  return false;
}

/**
 * Manhattan distance between two grid cells.
 */
export function manhattan(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

/**
 * Is `cell` far enough (>= minDistance, Manhattan) from `target`? Used to keep
 * bombs away from the snake head on spawn.
 */
export function farEnough(cell, target, minDistance) {
  return manhattan(cell, target) >= minDistance;
}
