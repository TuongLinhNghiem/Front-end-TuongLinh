/* ============================================================
   inputManager.js — Keyboard input handling with DAS/ARR.
   Maps physical keys to game actions and handles auto-repeat
   for left/right movement (Delayed Auto Shift + Auto Repeat Rate)
   and soft drop.
   ============================================================ */

class InputManager {
  constructor() {
    this.handlers = {};        // action -> callback
    this.pressedKeys = new Set();
    this.dasTimers = {};       // key -> setTimeout id for DAS
    this.arrIntervals = {};    // key -> setInterval id for ARR
    this.lastTime = 0;
    this.enabled = true;
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
  }

  start() {
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
  }

  stop() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    this._clearAllTimers();
  }

  on(action, callback) {
    this.handlers[action] = callback;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) {
      this._clearAllTimers();
      this.pressedKeys.clear();
    }
  }

  _onKeyDown(e) {
    if (!this.enabled) return;
    const code = e.code;

    // Prevent default for game-relevant keys to avoid page scroll
    const gameKeys = Object.values(CONFIG.CONTROLS);
    if (gameKeys.includes(code)) {
      e.preventDefault();
    }

    if (this.pressedKeys.has(code)) return; // ignore key repeat from OS
    this.pressedKeys.add(code);

    // Map code to action
    const action = this._mapKey(code);
    if (!action) return;

    // Trigger immediately
    if (this.handlers[action]) this.handlers[action]();

    // Set up auto-repeat for movement keys
    if (action === 'left' || action === 'right') {
      this.dasTimers[code] = setTimeout(() => {
        this.arrIntervals[code] = setInterval(() => {
          if (this.handlers[action]) this.handlers[action]();
        }, CONFIG.ARR);
      }, CONFIG.DAS);
    } else if (action === 'down') {
      this.dasTimers[code] = setTimeout(() => {
        this.arrIntervals[code] = setInterval(() => {
          if (this.handlers[action]) this.handlers[action]();
        }, CONFIG.SOFT_DROP_INTERVAL);
      }, CONFIG.DAS);
    }
  }

  _onKeyUp(e) {
    const code = e.code;
    this.pressedKeys.delete(code);
    if (this.dasTimers[code]) {
      clearTimeout(this.dasTimers[code]);
      delete this.dasTimers[code];
    }
    if (this.arrIntervals[code]) {
      clearInterval(this.arrIntervals[code]);
      delete this.arrIntervals[code];
    }
  }

  _mapKey(code) {
    const c = CONFIG.CONTROLS;
    switch (code) {
      case c.left: return 'left';
      case c.right: return 'right';
      case c.down: return 'down';
      case c.rotateCW: return 'rotateCW';
      case c.rotateCCW: return 'rotateCCW';
      case c.hardDrop: return 'hardDrop';
      case c.hold: return 'hold';
      case c.pause: return 'pause';
      case c.mute: return 'mute';
      case 'Escape': return 'pause';
      default: return null;
    }
  }

  _clearAllTimers() {
    for (const k in this.dasTimers) clearTimeout(this.dasTimers[k]);
    for (const k in this.arrIntervals) clearInterval(this.arrIntervals[k]);
    this.dasTimers = {};
    this.arrIntervals = {};
  }
}

window.InputManager = InputManager;
