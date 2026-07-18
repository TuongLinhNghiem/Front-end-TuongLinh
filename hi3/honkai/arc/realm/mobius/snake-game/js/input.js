/**
 * input.js
 * ----------------------------------------------------------------------------
 * Keyboard input. This module ONLY translates key presses into game intents
 * (direction changes, pause toggle). It owns no game state; it forwards
 * intents to callbacks supplied by the game.
 *
 * Supports both Arrow Keys and WASD. Prevents the page from scrolling on
 * arrow presses.
 */

import { DIRECTIONS } from "./utils.js";

const KEY_MAP = {
  ArrowUp: DIRECTIONS.UP,
  ArrowDown: DIRECTIONS.DOWN,
  ArrowLeft: DIRECTIONS.LEFT,
  ArrowRight: DIRECTIONS.RIGHT,
  KeyW: DIRECTIONS.UP,
  KeyS: DIRECTIONS.DOWN,
  KeyA: DIRECTIONS.LEFT,
  KeyD: DIRECTIONS.RIGHT,
};

// Keys whose default action (page scroll) we want to suppress.
const PREVENT_KEYS = new Set([
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Space",
]);

export class InputManager {
  constructor({ onDirection, onPauseToggle, onResume }) {
    this.onDirection = onDirection || (() => {});
    this.onPauseToggle = onPauseToggle || (() => {});
    this.onResume = onResume || (() => {});
    this._enabled = false;
    this._handler = this._onKeyDown.bind(this);
  }

  /**
   * Start listening. Call this when entering gameplay.
   */
  attach() {
    if (this._enabled) return;
    window.addEventListener("keydown", this._handler);
    this._enabled = true;
  }

  /**
   * Stop listening (e.g. on the menu screen).
   */
  detach() {
    if (!this._enabled) return;
    window.removeEventListener("keydown", this._handler);
    this._enabled = false;
  }

  _onKeyDown(e) {
    // Suppress scrolling for movement/space keys.
    if (PREVENT_KEYS.has(e.code)) e.preventDefault();

    // Pause/resume on Space or P.
    if (e.code === "Space" || e.code === "KeyP") {
      this.onPauseToggle();
      return;
    }

    const dir = KEY_MAP[e.code];
    if (dir) {
      this.onDirection(dir);
    }
  }
}
