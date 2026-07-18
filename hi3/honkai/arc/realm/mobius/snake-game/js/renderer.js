/**
 * renderer.js
 * ----------------------------------------------------------------------------
 * The ONLY module that draws to the canvas. It knows nothing about game rules;
 * it receives plain state snapshots and paints them. This separation keeps
 * game logic and rendering independent, so each can evolve without coupling.
 *
 * Responsibilities:
 *   - Resize the canvas to fill its container and compute the square cell size
 *     that fits the GRID_COLS x GRID_ROWS board into the available space.
 *   - Draw the background image scaled to cover the board.
 *   - Draw food, bombs, followers, head, and effects in the exact order the
 *     spec requires.
 *   - Provide simple colored fallbacks when an image asset is missing.
 *
 * Render order (per spec):
 *   1. Background
 *   2. Food
 *   3. Bomb
 *   4. Followers
 *   5. Head
 *   6. Effects
 */

import {
  CONFIG,
  gridCenter,
} from "./utils.js";

export class Renderer {
  constructor(canvas, assetManager) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.assets = assetManager;
    // Computed each resize: pixel size of one grid cell and the board's
    // pixel width/height. The board is centered in the canvas if its aspect
    // ratio doesn't match the container.
    this.cellSize = 0;
    this.boardWidth = 0;
    this.boardHeight = 0;
    this.offsetX = 0;
    this.offsetY = 0;
    this.dpr = window.devicePixelRatio || 1;
  }

  /**
   * Resize the canvas backing store to match its CSS size (accounting for
   * device pixel ratio) and recompute the grid layout. Returns the new layout.
   */
  resize(cssWidth, cssHeight) {
    this.dpr = window.devicePixelRatio || 1;
    this.canvas.width = Math.floor(cssWidth * this.dpr);
    this.canvas.height = Math.floor(cssHeight * this.dpr);
    this.canvas.style.width = cssWidth + "px";
    this.canvas.style.height = cssHeight + "px";

    // Reset transform and scale so we can draw in CSS pixels.
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    // Fit the square grid into the available space, centered.
    const cols = CONFIG.GRID_COLS;
    const rows = CONFIG.GRID_ROWS;
    const cellByW = cssWidth / cols;
    const cellByH = cssHeight / rows;
    this.cellSize = Math.floor(Math.min(cellByW, cellByH));
    this.boardWidth = this.cellSize * cols;
    this.boardHeight = this.cellSize * rows;
    this.offsetX = Math.floor((cssWidth - this.boardWidth) / 2);
    this.offsetY = Math.floor((cssHeight - this.boardHeight) / 2);
  }

  /**
   * Translate a grid cell's center into absolute canvas pixels (including the
   * board offset). Used internally and exposed for hit-testing if needed.
   */
  _cellCenter(g) {
    return {
      x: this.offsetX + g.x * this.cellSize + this.cellSize / 2,
      y: this.offsetY + g.y * this.cellSize + this.cellSize / 2,
    };
  }

  /**
   * Draw an image sprite centered on a grid cell at a given size ratio of the
   * cell. Falls back to a colored circle if the asset is missing.
   */
  _drawSprite(cellPos, imageKey, sizeRatio, fallbackColor) {
    const c = this._cellCenter(cellPos);
    const size = this.cellSize * sizeRatio;
    const img = this.assets.getImage(imageKey);
    if (img) {
      this.ctx.drawImage(img, c.x - size / 2, c.y - size / 2, size, size);
    } else {
      this.ctx.fillStyle = fallbackColor;
      this.ctx.beginPath();
      this.ctx.arc(c.x, c.y, size / 2, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  /**
   * Paint the full background: cover-fit background image over the board area.
   */
  _drawBackground() {
    const img = this.assets.getImage("background");
    const x = this.offsetX;
    const y = this.offsetY;
    const w = this.boardWidth;
    const h = this.boardHeight;
    if (img) {
      // "Cover" scaling: fill the board area while preserving aspect ratio.
      const iw = img.width;
      const ih = img.height;
      const scale = Math.max(w / iw, h / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      this.ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
    } else {
      // Solid fallback color so the board is visible.
      this.ctx.fillStyle = "#1b2330";
      this.ctx.fillRect(x, y, w, h);
    }
  }

  /**
   * Draw a fuse/timer ring around a bomb or big food to visualize its
   * remaining lifetime. Only drawn when the entity has a finite lifetime.
   */
  _drawTimerRing(cellPos, elapsedFraction, color) {
    if (elapsedFraction == null) return;
    const c = this._cellCenter(cellPos);
    const r = this.cellSize * 0.52;
    this.ctx.save();
    this.ctx.lineWidth = Math.max(2, this.cellSize * 0.06);
    this.ctx.strokeStyle = "rgba(0,0,0,0.45)";
    this.ctx.beginPath();
    this.ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.strokeStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(
      c.x,
      c.y,
      r,
      -Math.PI / 2,
      -Math.PI / 2 + Math.PI * 2 * (1 - elapsedFraction)
    );
    this.ctx.stroke();
    this.ctx.restore();
  }

  /**
   * Main draw entry point. `snapshot` is a plain object produced by the game:
   *   {
   *     snake: { body, justAte },
   *     foods: [{ position, kind, elapsedFraction }],
   *     bombs: [{ position, elapsedFraction }],
   *     effects: [{ type, ... }],
   *     state: GAME_STATE
   *   }
   */
  render(snapshot) {
    const { ctx } = this;
    // Clear the whole canvas (not just the board) so letterboxing is clean.
    ctx.clearRect(0, 0, this.canvas.width / this.dpr, this.canvas.height / this.dpr);

    // 1. Background
    this._drawBackground();

    // 2. Food
    for (const f of snapshot.foods || []) {
      if (f.kind === "regular") {
        this._drawSprite(f.position, "foodRegular", CONFIG.FOOD_SIZE_RATIO, "#e0394b");
      } else {
        this._drawSprite(f.position, "foodBig", CONFIG.BIG_FOOD_SIZE_RATIO, "#ffd400");
        // Show countdown ring in Hell mode (elapsedFraction present).
        if (f.elapsedFraction != null) {
          this._drawTimerRing(f.position, f.elapsedFraction, "#ffd400");
        }
      }
    }

    // 3. Bomb
    for (const b of snapshot.bombs || []) {
      this._drawSprite(b.position, "bomb", CONFIG.BOMB_SIZE_RATIO, "#2a2a33");
      this._drawTimerRing(b.position, b.elapsedFraction, "#ff5a3c");
    }

    // 4. Followers (drawn before the head so the head sits on top)
    const body = snapshot.snake ? snapshot.snake.body : [];
    for (let i = 1; i < body.length; i++) {
      this._drawSprite(body[i], "follower", CONFIG.FOLLOWER_SIZE_RATIO, "#4a9a55");
    }

    // 5. Head
    if (body.length > 0) {
      this._drawSprite(body[0], "head", CONFIG.HEAD_SIZE_RATIO, "#3a8a45");
    }

    // 6. Effects (e.g. eat pop, explosion)
    this._drawEffects(snapshot.effects || []);

    // 7. Overlay banners for won/lost/paused states.
    this._drawStateOverlay(snapshot.state);
  }

  /**
   * Draw transient visual effects. Each effect has a `type` and a `progress`
   * (0..1) computed by the game. We keep these lightweight and additive.
   */
  _drawEffects(effects) {
    for (const e of effects) {
      if (e.type === "pop") {
        const c = this._cellCenter(e.position);
        const r = this.cellSize * (0.3 + e.progress * 0.7);
        this.ctx.save();
        this.ctx.globalAlpha = 1 - e.progress;
        this.ctx.strokeStyle = e.color || "#ffffff";
        this.ctx.lineWidth = Math.max(2, this.cellSize * 0.08);
        this.ctx.beginPath();
        this.ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.restore();
      } else if (e.type === "explosion") {
        const c = this._cellCenter(e.position);
        const r = this.cellSize * (0.4 + e.progress * 1.4);
        this.ctx.save();
        this.ctx.globalAlpha = 1 - e.progress;
        this.ctx.fillStyle = "#ff6a2c";
        this.ctx.beginPath();
        this.ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      }
    }
  }

  /**
   * Centered banner text for terminal/paused states.
   */
  _drawStateOverlay(state) {
    if (!state || state === "playing" || state === "menu") return;
    let text = "";
    let sub = "";
    if (state === "paused") {
      text = "PAUSED";
      sub = "Press Space or the Pause button to resume";
    } else if (state === "won") {
      text = "YOU WIN!";
      sub = "The board is full. Press Restart to play again.";
    } else if (state === "lost") {
      text = "GAME OVER";
      sub = "Press Restart to try again";
    } else {
      return;
    }
    const cx = this.offsetX + this.boardWidth / 2;
    const cy = this.offsetY + this.boardHeight / 2;
    this.ctx.save();
    this.ctx.fillStyle = "rgba(0,0,0,0.55)";
    this.ctx.fillRect(
      this.offsetX,
      this.offsetY,
      this.boardWidth,
      this.boardHeight
    );
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = `bold ${Math.floor(this.cellSize * 1.4)}px system-ui, sans-serif`;
    this.ctx.fillText(text, cx, cy - this.cellSize * 0.4);
    this.ctx.font = `${Math.floor(this.cellSize * 0.5)}px system-ui, sans-serif`;
    this.ctx.fillStyle = "rgba(255,255,255,0.85)";
    this.ctx.fillText(sub, cx, cy + this.cellSize * 0.8);
    this.ctx.restore();
  }
}
