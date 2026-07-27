/* ============================================================
   game.js — Core Game class.
   Orchestrates the board, spawner, piece, rotation, ghost,
   hold, scoring, level, input, audio, and UI. Runs the
   requestAnimationFrame game loop and manages game states.
   ============================================================ */

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    // Offscreen canvas for the playfield (so we can draw the board
    // separately and overlay effects cleanly)
    this.boardCanvas = document.createElement("canvas");
    this.boardCanvas.width = CONFIG.BOARD_WIDTH;
    this.boardCanvas.height = CONFIG.BOARD_HEIGHT;
    this.boardCtx = this.boardCanvas.getContext("2d");

    // Next piece preview canvas
    this.nextCanvas = document.getElementById("next-canvas");
    this.nextCtx = this.nextCanvas ? this.nextCanvas.getContext("2d") : null;
    this.holdCanvas = document.getElementById("hold-canvas");
    this.holdCtx = this.holdCanvas ? this.holdCanvas.getContext("2d") : null;

    // Core systems
    this.board = new Board(CONFIG.COLS, CONFIG.ROWS, CONFIG.HIDDEN_ROWS);
    this.spawner = new Spawner();
    this.hold = new HoldSystem();
    this.input = new InputManager();

    // Game state
    this.state = GameState.MENU;
    this.piece = null;
    this.ghost = null;
    this.score = 0;
    this.level = 1;
    this.lines = 0;
    this.totalLines = 0;

    // Timing
    this.gravityTimer = 0;
    this.gravityInterval = LevelSystem.getGravity(1);
    this.lockTimer = 0;
    this.lockResets = 0;
    this.isOnGround = false;
    this.softDropping = false;

    // Effects
    this.particles = [];
    this.shakeIntensity = 0;
    this.shakeTime = 0;
    this.lineClearRows = [];
    this.lineClearTimer = 0;
    this.lineClearFlashing = false;

    // Save data
    this.saveData = SaveManager.load();

    // Animation
    this.lastTime = 0;
    this.running = false;

    this.setupInput();
    this.bindUIButtons();
  }

  /* ---------- Setup ---------- */

  setupInput() {
    const c = CONFIG.CONTROLS;
    this.input.setHandler("moveLeft",  () => this.movePiece(-1, 0));
    this.input.setHandler("moveRight", () => this.movePiece(1, 0));
    this.input.setHandler("rotateCW",  () => this.rotatePieceCW());
    this.input.setHandler("rotateCCW", () => this.rotatePieceCCW());
    this.input.setHandler("hardDrop",  () => this.hardDrop());
    this.input.setHandler("hold",      () => this.doHold());
    this.input.setHandler("pause",     () => this.togglePause());
    this.input.setHandler("restart",   () => { if (this.state === GameState.GAMEOVER) this.startGame(); });

    this.input.setRepeatHandler("softDrop", () => this.softDrop());
  }

  bindUIButtons() {
    const el = (id) => document.getElementById(id);
    const onClick = (id, fn) => { const b = el(id); if (b) b.addEventListener("click", fn); };

    onClick("btn-play", () => { AudioManager.sfx.menuClick(); this.startGame(); });
    onClick("btn-restart", () => { AudioManager.sfx.menuClick(); this.startGame(); });
    onClick("btn-reset-save", () => { AudioManager.sfx.menuClick(); this.resetSave(); });
    onClick("btn-menu", () => { AudioManager.sfx.menuClick(); this.goToMenu(); });
    onClick("btn-resume", () => { AudioManager.sfx.menuClick(); this.togglePause(); });
    onClick("btn-quit", () => { AudioManager.sfx.menuClick(); this.goToMenu(); });
    onClick("btn-mute", () => { this.toggleMute(); });
  }

  /* ---------- Game State Transitions ---------- */

  startGame() {
    this.board.reset();
    this.spawner.reset();
    this.hold.reset();
    ScoringSystem.init();
    this.score = 0;
    this.level = 1;
    this.lines = 0;
    this.totalLines = 0;
    this.gravityInterval = LevelSystem.getGravity(1);
    this.gravityTimer = 0;
    this.lockTimer = 0;
    this.lockResets = 0;
    this.isOnGround = false;
    this.softDropping = false;
    this.particles = [];
    this.shakeIntensity = 0;
    this.lineClearFlashing = false;
    this.lineClearRows = [];

    this.spawnPiece();
    this.state = GameState.PLAYING;

    // Hide all overlays, show game
    this.showScreen("game");

    // Start audio
    AudioManager.startMusic();

    if (!this.running) {
      this.running = true;
      this.lastTime = performance.now();
      requestAnimationFrame((t) => this.loop(t));
    }
  }

  goToMenu() {
    this.state = GameState.MENU;
    AudioManager.stopMusic();
    this.showScreen("menu");
    this.updateMenuDisplay();
  }

  togglePause() {
    if (this.state === GameState.PLAYING) {
      this.state = GameState.PAUSED;
      const ps = document.getElementById("pause-score");
      if (ps) ps.textContent = this.score.toLocaleString();
      this.showScreen("pause");
    } else if (this.state === GameState.PAUSED) {
      this.state = GameState.PLAYING;
      this.showScreen("game");
    }
  }

  gameOver() {
    this.state = GameState.GAMEOVER;
    AudioManager.stopMusic();
    AudioManager.sfx.gameOver();
    // Update high score
    this.saveData = SaveManager.update(this.score, this.level, this.totalLines);
    this.showScreen("gameover");
    this.updateGameOverDisplay();
  }

  /* ---------- Piece Management ---------- */

  spawnPiece(type) {
    const t = type || this.spawner.next();
    this.piece = new ActivePiece(t);
    this.hold.onSpawn();
    this.isOnGround = false;
    this.lockTimer = 0;
    this.lockResets = 0;
    this.updateGhost();

    // Check game over: if the new piece collides at spawn, game over.
    const cells = this.piece.getCells();
    if (this.board.collides(cells)) {
      this.gameOver();
    }
  }

  // Move piece by (dx, dy). Returns true if the move succeeded.
  movePiece(dx, dy) {
    if (!this.piece || this.state !== GameState.PLAYING || this.lineClearFlashing) return false;
    const testCells = this.piece.getCells(
      this.piece.rotationState, this.piece.x + dx, this.piece.y + dy
    );
    if (this.board.collides(testCells)) return false;
    this.piece.x += dx;
    this.piece.y += dy;
    AudioManager.sfx.move();
    this.updateGhost();
    // If we moved off the ground, reset lock timer
    if (dy === 0) this.resetLockIfPossible();
    this.isOnGround = this.checkOnGround();
    return true;
  }

  rotatePieceCW() {
    if (!this.piece || this.state !== GameState.PLAYING || this.lineClearFlashing) return;
    if (RotationSystem.rotateCW(this.piece, this.board)) {
      AudioManager.sfx.rotate();
      this.updateGhost();
      this.resetLockIfPossible();
      this.isOnGround = this.checkOnGround();
    }
  }

  rotatePieceCCW() {
    if (!this.piece || this.state !== GameState.PLAYING || this.lineClearFlashing) return;
    if (RotationSystem.rotateCCW(this.piece, this.board)) {
      AudioManager.sfx.rotate();
      this.updateGhost();
      this.resetLockIfPossible();
      this.isOnGround = this.checkOnGround();
    }
  }

  softDrop() {
    if (!this.piece || this.state !== GameState.PLAYING || this.lineClearFlashing) return;
    if (this.movePiece(0, 1)) {
      this.score += CONFIG.SCORE_TABLE.softDrop;
      this.gravityTimer = 0;
      AudioManager.sfx.softDrop();
      this.updateHUD();
    }
  }

  hardDrop() {
    if (!this.piece || this.state !== GameState.PLAYING || this.lineClearFlashing) return;
    const dy = GhostSystem.computeDrop(this.piece, this.board);
    if (dy > 0) {
      this.piece.y += dy;
      this.score += dy * CONFIG.SCORE_TABLE.hardDrop;
    }
    AudioManager.sfx.hardDrop();
    this.triggerShake(CONFIG.SHAKE_NORMAL, CONFIG.SHAKE_DURATION);
    this.lockPiece();
    this.updateHUD();
  }

  doHold() {
    if (!this.piece || this.state !== GameState.PLAYING || this.lineClearFlashing) return;
    const currentType = this.piece.type;
    const newType = this.hold.hold(currentType, this.spawner);
    if (newType === null) return;  // can't hold yet
    AudioManager.sfx.hold();
    this.spawnPiece(newType);
    this.updateHUD();
  }

  /* ---------- Lock & Line Clear ---------- */

  checkOnGround() {
    if (!this.piece) return false;
    const testCells = this.piece.getCells(
      this.piece.rotationState, this.piece.x, this.piece.y + 1
    );
    return this.board.collides(testCells);
  }

  resetLockIfPossible() {
    if (this.isOnGround && this.lockResets < CONFIG.MAX_LOCK_RESETS) {
      this.lockTimer = 0;
      this.lockResets++;
    }
  }

  lockPiece() {
    const lockedRows = this.board.lockPiece(this.piece);
    AudioManager.sfx.lock();

    // Check for full rows among the rows we just filled
    const fullRows = this.board.findFullRows(lockedRows);

    if (fullRows.length > 0) {
      this.startLineClear(fullRows);
    } else {
      ScoringSystem.onNoClear();
      this.spawnPiece();
    }
  }

  startLineClear(rows) {
    this.lineClearRows = rows;
    this.lineClearFlashing = true;
    this.lineClearTimer = CONFIG.LINE_CLEAR_DURATION;

    // Particles for cleared cells
    this.spawnLineClearParticles(rows);

    // Play sound
    const lineCount = rows.length;
    if (lineCount >= 4) {
      AudioManager.sfx.tetris();
      this.triggerShake(CONFIG.SHAKE_TETRIS, CONFIG.SHAKE_DURATION);
    } else {
      AudioManager.sfx.lineClear();
      this.triggerShake(CONFIG.SHAKE_NORMAL, CONFIG.SHAKE_DURATION);
    }
  }

  finishLineClear() {
    const count = this.board.clearLines(this.lineClearRows);

    // Update scoring
    const result = ScoringSystem.calculate(count, this.level);
    this.score += result.score;

    if (result.comboCount > 0) {
      AudioManager.sfx.combo();
    }

    // Update level
    this.totalLines += count;
    this.lines = this.totalLines % CONFIG.LINES_PER_LEVEL;
    const newLevel = LevelSystem.checkLevelUp(this.level, this.totalLines);
    if (newLevel !== null) {
      this.level = newLevel;
      this.gravityInterval = LevelSystem.getGravity(this.level);
      AudioManager.sfx.levelUp();
    }

    // Reset state
    this.lineClearRows = [];
    this.lineClearFlashing = false;

    this.updateHUD();
    this.spawnPiece();
  }

  /* ---------- Ghost Piece ---------- */

  updateGhost() {
    if (!this.piece) { this.ghost = null; return; }
    this.ghost = GhostSystem.getGhost(this.piece, this.board);
  }

  /* ---------- Gravity ---------- */

  applyGravity(dt) {
    if (!this.piece || this.lineClearFlashing) return;
    this.gravityTimer += dt;

    if (this.gravityTimer >= this.gravityInterval) {
      this.gravityTimer = 0;
      if (this.movePiece(0, 1)) {
        this.isOnGround = false;
      } else {
        // Can't move down — piece is on the ground
        this.isOnGround = true;
        this.gravityTimer = this.gravityInterval - 50; // check again soon
      }
    }
  }

  applyLockDelay(dt) {
    if (!this.piece || this.lineClearFlashing) return;
    if (this.isOnGround) {
      this.lockTimer += dt;
      if (this.lockTimer >= CONFIG.LOCK_DELAY) {
        this.lockPiece();
      }
    } else {
      this.lockTimer = 0;
    }
  }

  /* ---------- Particles & Effects ---------- */

  spawnLineClearParticles(rows) {
    for (const r of rows) {
      for (let c = 0; c < CONFIG.COLS; c++) {
        const color = this.board.grid[r][c] || "#ffffff";
        for (let i = 0; i < 3; i++) {
          this.particles.push({
            x: c * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2,
            y: (r - CONFIG.HIDDEN_ROWS) * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8 - 2,
            life: 1,
            color,
            size: 3 + Math.random() * 3,
          });
        }
      }
    }
  }

  updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.3;
      p.life -= dt / 600;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }

  triggerShake(intensity, duration) {
    this.shakeIntensity = intensity;
    this.shakeTime = duration;
  }

  updateShake(dt) {
    if (this.shakeTime > 0) {
      this.shakeTime -= dt;
      if (this.shakeTime <= 0) this.shakeIntensity = 0;
    }
  }

  getShakeOffset() {
    if (this.shakeIntensity <= 0) return { x: 0, y: 0 };
    return {
      x: (Math.random() - 0.5) * this.shakeIntensity,
      y: (Math.random() - 0.5) * this.shakeIntensity,
    };
  }

  /* ---------- Game Loop ---------- */

  loop(timestamp) {
    const dt = Math.min(timestamp - this.lastTime, 100); // cap dt at 100ms
    this.lastTime = timestamp;

    if (this.state === GameState.PLAYING) {
      this.update(dt);
    }
    this.render();

    if (this.running) {
      requestAnimationFrame((t) => this.loop(t));
    }
  }

  update(dt) {
    // Handle line clear animation countdown
    if (this.lineClearFlashing) {
      this.lineClearTimer -= dt;
      if (this.lineClearTimer <= 0) {
        this.finishLineClear();
      }
    } else {
      this.applyGravity(dt);
      this.applyLockDelay(dt);
    }
    this.updateParticles(dt);
    this.updateShake(dt);
  }

  /* ---------- Rendering ---------- */

  render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Clear
    ctx.fillStyle = "#0a0a12";
    ctx.fillRect(0, 0, w, h);

    // Only render board if playing/paused/gameover (not menu)
    if (this.state === GameState.PLAYING || this.state === GameState.PAUSED || this.state === GameState.GAMEOVER) {
      this.renderBoard(ctx);
      this.renderPreviews();
    }
  }

  renderBoard(ctx) {
    const shake = this.getShakeOffset();
    const bw = CONFIG.BOARD_WIDTH;
    const bh = CONFIG.BOARD_HEIGHT;
    const offsetX = (this.canvas.width - bw) / 2 + shake.x;
    const offsetY = (this.canvas.height - bh) / 2 + shake.y;

    ctx.save();
    ctx.translate(offsetX, offsetY);

    // Draw board background
    ctx.fillStyle = CONFIG.COLORS.EMPTY;
    ctx.fillRect(0, 0, bw, bh);

    // Draw grid lines
    ctx.strokeStyle = CONFIG.COLORS.GRID;
    ctx.lineWidth = 1;
    for (let c = 1; c < CONFIG.COLS; c++) {
      ctx.beginPath();
      ctx.moveTo(c * CONFIG.CELL_SIZE, 0);
      ctx.lineTo(c * CONFIG.CELL_SIZE, bh);
      ctx.stroke();
    }
    for (let r = 1; r < CONFIG.ROWS; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * CONFIG.CELL_SIZE);
      ctx.lineTo(bw, r * CONFIG.CELL_SIZE);
      ctx.stroke();
    }

    // Draw locked blocks (skip hidden rows)
    for (let r = CONFIG.HIDDEN_ROWS; r < this.board.totalRows; r++) {
      for (let c = 0; c < CONFIG.COLS; c++) {
        const color = this.board.grid[r][c];
        if (color) {
          const visR = r - CONFIG.HIDDEN_ROWS;
          this.drawBlock(ctx, c * CONFIG.CELL_SIZE, visR * CONFIG.CELL_SIZE,
                         CONFIG.CELL_SIZE, color, false);
        }
      }
    }

    // Draw line clear flash effect
    if (this.lineClearFlashing) {
      const flashAlpha = Math.sin((this.lineClearTimer / CONFIG.LINE_CLEAR_DURATION) * Math.PI);
      for (const r of this.lineClearRows) {
        if (r < CONFIG.HIDDEN_ROWS) continue;
        const visR = r - CONFIG.HIDDEN_ROWS;
        ctx.fillStyle = `rgba(255,255,255,${Math.max(0, flashAlpha)})`;
        ctx.fillRect(0, visR * CONFIG.CELL_SIZE, bw, CONFIG.CELL_SIZE);
      }
    }

    // Draw ghost piece
    if (this.ghost && this.state === GameState.PLAYING) {
      const cells = this.ghost.getCells();
      for (const [x, y] of cells) {
        if (y < CONFIG.HIDDEN_ROWS) continue;
        const visY = y - CONFIG.HIDDEN_ROWS;
        this.drawBlock(ctx, x * CONFIG.CELL_SIZE, visY * CONFIG.CELL_SIZE,
                       CONFIG.CELL_SIZE, this.ghost.color, true);
      }
    }

    // Draw active piece
    if (this.piece && this.state === GameState.PLAYING) {
      const cells = this.piece.getCells();
      for (const [x, y] of cells) {
        if (y < CONFIG.HIDDEN_ROWS) continue;
        const visY = y - CONFIG.HIDDEN_ROWS;
        this.drawBlock(ctx, x * CONFIG.CELL_SIZE, visY * CONFIG.CELL_SIZE,
                       CONFIG.CELL_SIZE, this.piece.color, false);
      }
    }

    // Draw particles
    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);
    }
    ctx.globalAlpha = 1;

    // Draw board border
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, bw, bh);

    ctx.restore();
  }

  drawBlock(ctx, x, y, size, color, isGhost) {
    if (isGhost) {
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.3;
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 2, y + 2, size - 4, size - 4);
      ctx.globalAlpha = 1;
      return;
    }

    // Fill with the piece color
    ctx.fillStyle = color;
    ctx.fillRect(x + 1, y + 1, size - 2, size - 2);

    // Inner highlight (top-left lighter)
    ctx.fillStyle = this.lightenColor(color, 0.3);
    ctx.fillRect(x + 1, y + 1, size - 2, 4);
    ctx.fillRect(x + 1, y + 1, 4, size - 2);

    // Inner shadow (bottom-right darker)
    ctx.fillStyle = this.darkenColor(color, 0.3);
    ctx.fillRect(x + 1, y + size - 5, size - 2, 4);
    ctx.fillRect(x + size - 5, y + 1, 4, size - 2);

    // Subtle border
    ctx.strokeStyle = CONFIG.COLORS.LOCKED_BORDER;
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, size - 1, size - 1);
  }

  lightenColor(hex, amount) {
    return this.adjustColor(hex, amount);
  }

  darkenColor(hex, amount) {
    return this.adjustColor(hex, -amount);
  }

  adjustColor(hex, amount) {
    // Parse hex color
    let r, g, b;
    if (hex.startsWith("#")) {
      const h = hex.slice(1);
      r = parseInt(h.slice(0, 2), 16);
      g = parseInt(h.slice(2, 4), 16);
      b = parseInt(h.slice(4, 6), 16);
    } else {
      return hex;
    }
    const factor = amount > 0 ? amount : -amount;
    if (amount > 0) {
      r = Math.round(r + (255 - r) * factor);
      g = Math.round(g + (255 - g) * factor);
      b = Math.round(b + (255 - b) * factor);
    } else {
      r = Math.round(r * (1 - factor));
      g = Math.round(g * (1 - factor));
      b = Math.round(b * (1 - factor));
    }
    return `rgb(${r},${g},${b})`;
  }

  renderPreviews() {
    // Next piece preview
    if (this.nextCtx) {
      this.drawPreview(this.nextCtx, this.spawner.peek(1)[0]);
    }
    // Hold piece preview
    if (this.holdCtx) {
      this.drawPreview(this.holdCtx, this.hold.heldType);
    }
  }

  drawPreview(ctx, type) {
    const cs = CONFIG.PREVIEW_CELL_SIZE;
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    ctx.clearRect(0, 0, w, h);

    if (!type) return;
    const def = TETROMINOES[type];
    const cells = def.rotations[0];

    // Find bounding box of the piece
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const [x, y] of cells) {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
    const pieceW = (maxX - minX + 1) * cs;
    const pieceH = (maxY - minY + 1) * cs;
    const offX = (w - pieceW) / 2 - minX * cs;
    const offY = (h - pieceH) / 2 - minY * cs;

    for (const [x, y] of cells) {
      this.drawBlock(ctx, offX + x * cs, offY + y * cs, cs, def.color, false);
    }
  }

  /* ---------- UI Management ---------- */

  updateHUD() {
    const el = (id) => document.getElementById(id);
    const setText = (id, val) => { const e = el(id); if (e) e.textContent = val; };

    setText("stat-score", this.score.toLocaleString());
    setText("stat-level", this.level);
    setText("stat-lines", this.totalLines);
    setText("stat-combo", ScoringSystem.combo > 0 ? `${ScoringSystem.combo}` : "0");
    setText("stat-speed", this.gravityInterval + "ms");
  }

  updateMenuDisplay() {
    const el = (id) => document.getElementById(id);
    const setText = (id, val) => { const e = el(id); if (e) e.textContent = val; };
    setText("menu-high-score", this.saveData.highScore.toLocaleString());
    setText("menu-high-level", this.saveData.highestLevel);
    setText("menu-high-lines", this.saveData.mostLines);
  }

  updateGameOverDisplay() {
    const el = (id) => document.getElementById(id);
    const setText = (id, val) => { const e = el(id); if (e) e.textContent = val; };
    setText("go-score", this.score.toLocaleString());
    setText("go-level", this.level);
    setText("go-lines", this.totalLines);
    setText("go-high-score", this.saveData.highScore.toLocaleString());
  }

  showScreen(screenName) {
    // Hide all overlay screens
    const screens = ["menu-screen", "pause-screen", "gameover-screen"];
    for (const s of screens) {
      const el = document.getElementById(s);
      if (el) el.classList.add("hidden");
    }
    // Show HUD and top controls only during gameplay
    const hud = document.getElementById("hud");
    const topControls = document.getElementById("top-controls");
    if (hud) {
      if (screenName === "game") hud.classList.remove("hidden");
      else hud.classList.add("hidden");
    }
    if (topControls) {
      if (screenName === "game") topControls.style.display = "flex";
      else topControls.style.display = "none";
    }
    // Show the requested screen
    const screenMap = {
      menu: "menu-screen",
      pause: "pause-screen",
      gameover: "gameover-screen",
      game: null,  // no overlay
    };
    const target = screenMap[screenName];
    if (target) {
      const el = document.getElementById(target);
      if (el) el.classList.remove("hidden");
    }
    if (screenName === "menu") this.updateMenuDisplay();
    if (screenName === "game") this.updateHUD();
  }

  toggleMute() {
    const muted = !AudioManager.isMuted();
    AudioManager.setMuted(muted);
    const btn = document.getElementById("btn-mute");
    if (btn) btn.textContent = muted ? "🔇" : "🔊";
  }

  resetSave() {
    SaveManager.reset();
    this.saveData = SaveManager.load();
    this.updateMenuDisplay();
  }

  /* ---------- Lifecycle ---------- */

  start() {
    this.goToMenu();
    if (!this.running) {
      this.running = true;
      this.lastTime = performance.now();
      requestAnimationFrame((t) => this.loop(t));
    }
  }

  enableInput() { this.input.enable(); }
  disableInput() { this.input.disable(); }
}

window.Game = Game;
