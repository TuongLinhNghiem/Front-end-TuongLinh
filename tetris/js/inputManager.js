/* ============================================================
   inputManager.js — Keyboard input with DAS/ARR.
   Handles discrete actions (rotate, hard drop, hold, pause)
   and auto-repeat actions (move left/right, soft drop) with
   configurable Delayed Auto Shift and Auto Repeat Rate.
   ============================================================ */

class InputManager {
  constructor() {
    this.heldKeys = new Set();
    this.dasTimers = {};    // key -> timer id for DAS
    this.arrTimers = {};    // key -> interval id for ARR
    this.keyActionMap = null;
    this.enabled = false;
  }

  // Build the key-to-action map from CONFIG.CONTROLS
  buildKeyMap() {
    const c = CONFIG.CONTROLS;
    this.keyActionMap = {};
    // Each action maps to a handler function set later by the game
    this.keyActionMap[c.moveLeft]    = { type: "moveLeft",    repeat: true };
    this.keyActionMap[c.moveRight]   = { type: "moveRight",   repeat: true };
    this.keyActionMap[c.softDrop]    = { type: "softDrop",    repeat: true };
    this.keyActionMap[c.rotateCW]    = { type: "rotateCW",    repeat: false };
    this.keyActionMap[c.rotateCCW]   = { type: "rotateCCW",   repeat: false };
    this.keyActionMap[c.hardDrop]    = { type: "hardDrop",    repeat: false };
    this.keyActionMap[c.hold]        = { type: "hold",        repeat: false };
    this.keyActionMap[c.pause]       = { type: "pause",       repeat: false };
    this.keyActionMap[c.pauseAlt]    = { type: "pause",       repeat: false };
    this.keyActionMap[c.restart]     = { type: "restart",    repeat: false };
  }

  // Set the callback for discrete actions
  setHandler(actionName, fn) {
    if (!this.handlers) this.handlers = {};
    this.handlers[actionName] = fn;
  }

  setRepeatHandler(actionName, fn) {
    if (!this.repeatHandlers) this.repeatHandlers = {};
    this.repeatHandlers[actionName] = fn;
  }

  enable() {
    this.enabled = true;
    if (!this.keyActionMap) this.buildKeyMap();
    this._boundKeyDown = (e) => this.onKeyDown(e);
    this._boundKeyUp = (e) => this.onKeyUp(e);
    window.addEventListener("keydown", this._boundKeyDown);
    window.addEventListener("keyup", this._boundKeyUp);
  }

  disable() {
    this.enabled = false;
    if (this._boundKeyDown) window.removeEventListener("keydown", this._boundKeyDown);
    if (this._boundKeyUp) window.removeEventListener("keyup", this._boundKeyUp);
    this.clearAllTimers();
  }

  clearAllTimers() {
    for (const k in this.dasTimers) { clearTimeout(this.dasTimers[k]); delete this.dasTimers[k]; }
    for (const k in this.arrTimers) { clearInterval(this.arrTimers[k]); delete this.arrTimers[k]; }
    this.heldKeys.clear();
  }

  onKeyDown(e) {
    if (!this.enabled) return;
    const action = this.keyActionMap[e.code];
    if (!action) return;
    // Prevent page scroll for game keys
    if (["ArrowLeft","ArrowRight","ArrowDown","ArrowUp","Space"].includes(e.code)) {
      e.preventDefault();
    }
    // If already held, ignore repeat events (we handle our own DAS/ARR)
    if (this.heldKeys.has(e.code)) return;
    this.heldKeys.add(e.code);

    // Fire the action immediately
    this.fireAction(action.type);

    // For repeatable actions, set up DAS -> ARR
    if (action.repeat) {
      this.setupDAS(e.code, action.type);
    }
  }

  onKeyUp(e) {
    if (!this.enabled) return;
    this.heldKeys.delete(e.code);
    if (this.dasTimers[e.code]) { clearTimeout(this.dasTimers[e.code]); delete this.dasTimers[e.code]; }
    if (this.arrTimers[e.code]) { clearInterval(this.arrTimers[e.code]); delete this.arrTimers[e.code]; }
  }

  fireAction(type) {
    if (this.handlers && this.handlers[type]) {
      this.handlers[type]();
    } else if (this.repeatHandlers && this.repeatHandlers[type]) {
      this.repeatHandlers[type]();
    }
  }

  setupDAS(key, actionType) {
    this.dasTimers[key] = setTimeout(() => {
      this.arrTimers[key] = setInterval(() => {
        this.fireAction(actionType);
      }, CONFIG.ARR_INTERVAL);
    }, CONFIG.DAS_DELAY);
  }
}

window.InputManager = InputManager;
