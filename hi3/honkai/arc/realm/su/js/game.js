/* ============================================================
   game.js — Core game engine: game loop, state machine,
   rendering, visual effects, and integration of all systems.
   ============================================================ */

class TetrisGame {
  constructor() {
    // ---- Core systems ----
    this.board = new Board();
    this.spawner = new Spawner();
    this.holdMgr = new HoldManager();
    this.scoring = new ScoreSystem();
    this.level = new LevelSystem();
    this.input = new InputManager();

    // ---- Current piece state ----
    this.currentPiece = null;   // { type, def, state, row, col, positions }
    this.nextPreview = null;    // type string for "next" panel
    this.ghostPositions = null;

    // ---- Timing ----
    this.dropTimer = 0;
    this.lastFrame = 0;
    this.lockTimer = 0;
    this.lockResets = 0;
    this.isLocking = false;

    // ---- Effects ----
    this.flashRows = [];        // rows being cleared (for flash animation)
    this.flashTimer = 0;
    this.flashDuration = 300;
    this.shakeAmount = 0;
    this.shakeTimer = 0;
    this.particles = [];
    this.popups = [];           // floating score popups

    // ---- State ----
    this.state = STATE.MENU;
    this.gameStateJustChanged = false;

    // ---- UI elements ----
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.nextCanvas = document.getElementById('next-canvas');
    this.nextCtx = this.nextCanvas.getContext('2d');
    this.holdCanvas = document.getElementById('hold-canvas');
    this.holdCtx = this.holdCanvas.getContext('2d');

    // ---- DOM references ----
    this.elScore = document.getElementById('stat-score');
    this.elLevel = document.getElementById('stat-level');
    this.elLines = document.getElementById('stat-lines');
    this.elCombo = document.getElementById('stat-combo');
    this.elMenuScore = document.getElementById('menu-high-score');
    this.elMenuLevel = document.getElementById('menu-high-level');
    this.elMenuLines = document.getElementById('menu-high-lines');
    this.elPauseScore = document.getElementById('pause-score');
    this.elGoScore = document.getElementById('go-score');
    this.elGoHigh = document.getElementById('go-high-score');
    this.elGoLevel = document.getElementById('go-level');
    this.elGoLines = document.getElementById('go-lines');

    // Overlays
    this.menuScreen = document.getElementById('menu-screen');
    this.pauseScreen = document.getElementById('pause-screen');
    this.gameoverScreen = document.getElementById('gameover-screen');
    this.hud = document.getElementById('hud');
    this.topControls = document.getElementById('top-controls');

    // ---- Save data ----
    this.saveData = SaveManager.load();

    this._setupInput();
    this._setupButtons();
    this._setupCanvas();
    this._updateMenuStats();
  }

  // ================================================================
  //  Setup
  // ================================================================

  _setupCanvas() {
    // Set canvas internal resolution to match the playfield
    this.canvas.width = CONFIG.CANVAS_WIDTH;
    this.canvas.height = CONFIG.CANVAS_HEIGHT;
  }

  _setupInput() {
    this.input.on('left',      () => this._move(-1));
    this.input.on('right',     () => this._move(1));
    this.input.on('down',      () => this._softDrop());
    this.input.on('rotateCW',  () => this._rotate(1));
    this.input.on('rotateCCW', () => this._rotate(-1));
    this.input.on('hardDrop',  () => this._hardDrop());
    this.input.on('hold',      () => this._hold());
    this.input.on('pause',     () => this._togglePause());
    this.input.on('mute',      () => this._toggleMute());
  }

  _setupButtons() {
    document.getElementById('btn-play').addEventListener('click', () => this._startGame());
    document.getElementById('btn-restart').addEventListener('click', () => this._startGame());
    document.getElementById('btn-resume').addEventListener('click', () => this._resume());
    document.getElementById('btn-quit').addEventListener('click', () => this._quitToMenu());
    document.getElementById('btn-menu').addEventListener('click', () => this._quitToMenu());
    document.getElementById('btn-reset-save').addEventListener('click', () => this._resetSave());
    document.getElementById('btn-mute').addEventListener('click', () => this._toggleMute());

    // ---- Touch controls ----
    const touchButtons = document.querySelectorAll('.touch-btn');
    for (const btn of touchButtons) {
      const action = btn.dataset.action;
      if (!action) continue;
      // Use pointerdown for immediate response on touch devices
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        if (this.state !== STATE.PLAYING) return;
        const handler = { left: this._move.bind(this,-1), right: this._move.bind(this,1),
          down: this._softDrop.bind(this), rotateCW: this._rotate.bind(this,1),
          rotateCCW: this._rotate.bind(this,-1), hardDrop: this._hardDrop.bind(this),
          hold: this._hold.bind(this) }[action];
        if (handler) handler();
      });
    }
  }

  // ================================================================
  //  State transitions
  // ================================================================

  _showOverlay(screen) {
    this.menuScreen.classList.add('hidden');
    this.pauseScreen.classList.add('hidden');
    this.gameoverScreen.classList.add('hidden');
    if (screen) screen.classList.remove('hidden');
  }

  _setHudVisible(visible) {
    if (visible) {
      this.hud.classList.remove('hidden');
      this.topControls.style.display = 'flex';
      // Show touch controls on mobile/touch devices
      if (this._isTouchDevice()) {
        document.getElementById('touch-controls').style.display = 'flex';
      }
    } else {
      this.hud.classList.add('hidden');
      this.topControls.style.display = 'none';
      document.getElementById('touch-controls').style.display = 'none';
    }
  }

  _isTouchDevice() {
    return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  }

  _startGame() {
    AudioManager.init();
    AudioManager.menuClick();

    // Reset everything
    this.board.reset();
    this.spawner.reset();
    this.holdMgr.reset();
    this.scoring.reset();
    this.level.reset();
    this.particles = [];
    this.popups = [];
    this.flashRows = [];
    this.shakeAmount = 0;

    // Spawn first piece
    this._spawnPiece();

    // UI
    this.state = STATE.PLAYING;
    this._showOverlay(null);
    this._setHudVisible(true);
    this._updateHUD();

    // Reset timers
    this.dropTimer = 0;
    this.lastFrame = performance.now();
    this.input.setEnabled(true);
    this.input.start();

    AudioManager.startMusic();
  }

  _togglePause() {
    if (this.state === STATE.PLAYING) {
      this.state = STATE.PAUSED;
      this.elPauseScore.textContent = this.scoring.score;
      this._showOverlay(this.pauseScreen);
      AudioManager.stopMusic();
    } else if (this.state === STATE.PAUSED) {
      this._resume();
    }
  }

  _resume() {
    if (this.state !== STATE.PAUSED) return;
    AudioManager.menuClick();
    this.state = STATE.PLAYING;
    this._showOverlay(null);
    this.lastFrame = performance.now();
    AudioManager.startMusic();
  }

  _quitToMenu() {
    AudioManager.menuClick();
    AudioManager.stopMusic();
    this.state = STATE.MENU;
    this.input.setEnabled(false);
    this._setHudVisible(false);
    this._updateMenuStats();
    this._showOverlay(this.menuScreen);
  }

  _gameOver() {
    this.state = STATE.GAMEOVER;
    AudioManager.stopMusic();
    AudioManager.gameOver();

    // Save
    this.saveData = SaveManager.save(this.scoring.score, this.level.level, this.level.totalLines);

    // Update game-over screen
    this.elGoScore.textContent = this.scoring.score;
    this.elGoHigh.textContent = this.saveData.highScore;
    this.elGoLevel.textContent = this.level.level;
    this.elGoLines.textContent = this.level.totalLines;

    this.input.setEnabled(false);
    this._setHudVisible(false);
    this._showOverlay(this.gameoverScreen);
  }

  _resetSave() {
    AudioManager.menuClick();
    SaveManager.reset();
    this.saveData = SaveManager.load();
    this._updateMenuStats();
  }

  _toggleMute() {
    AudioManager.init();
    const muted = !AudioManager.isMuted();
    AudioManager.setMuted(muted);
    const btn = document.getElementById('btn-mute');
    btn.textContent = muted ? '🔇' : '🔊';
  }

  // ================================================================
  //  Piece management
  // ================================================================

  _spawnPiece(typeOverride) {
    let type;
    if (typeOverride) {
      type = typeOverride;
    } else {
      type = this.spawner.next();
    }
    const def = PIECES[type];
    const col = SPAWN_COL[type];
    const row = 0;
    const state = 0;

    this.currentPiece = {
      type: type,
      def: def,
      state: state,
      row: row,
      col: col,
      positions: Rotation.getCells(def, state, row, col),
    };

    this.nextPreview = this.spawner.peek(1)[0];
    this.holdMgr.canHold = true;
    this.lockResets = 0;
    this.isLocking = false;
    this.lockTimer = 0;

    // Check immediate game over (spawn collision)
    if (!this.board.isValid(this.currentPiece.positions)) {
      this._gameOver();
      return;
    }

    this._updateGhost();
    this._renderNext();
    this._renderHold();
  }

  _updateGhost() {
    if (!this.currentPiece) {
      this.ghostPositions = null;
      return;
    }
    this.ghostPositions = Ghost.compute(
      this.board, this.currentPiece.def,
      this.currentPiece.state, this.currentPiece.row, this.currentPiece.col
    );
  }

  _move(dx) {
    if (this.state !== STATE.PLAYING || !this.currentPiece) return;
    const newCol = this.currentPiece.col + dx;
    const positions = Rotation.getCells(
      this.currentPiece.def, this.currentPiece.state, this.currentPiece.row, newCol
    );
    if (this.board.isValid(positions)) {
      this.currentPiece.col = newCol;
      this.currentPiece.positions = positions;
      this._updateGhost();
      this._resetLockTimer();
      AudioManager.move();
    }
  }

  _rotate(dir) {
    if (this.state !== STATE.PLAYING || !this.currentPiece) return;
    const result = Rotation.tryRotate(
      this.currentPiece.def, this.currentPiece.state, dir,
      this.currentPiece.row, this.currentPiece.col, this.board
    );
    if (result) {
      this.currentPiece.state = result.state;
      this.currentPiece.row = result.row;
      this.currentPiece.col = result.col;
      this.currentPiece.positions = result.positions;
      this._updateGhost();
      this._resetLockTimer();
      AudioManager.rotate();
    }
  }

  _softDrop() {
    if (this.state !== STATE.PLAYING || !this.currentPiece) return;
    const newRow = this.currentPiece.row + 1;
    const positions = Rotation.getCells(
      this.currentPiece.def, this.currentPiece.state, newRow, this.currentPiece.col
    );
    if (this.board.isValid(positions)) {
      this.currentPiece.row = newRow;
      this.currentPiece.positions = positions;
      this._updateGhost();
      this.scoring.addSoftDrop(1);
      this._updateHUD();
      AudioManager.softDrop();
    } else {
      // Can't move down → start/continue lock delay
      this._checkLock();
    }
  }

  _hardDrop() {
    if (this.state !== STATE.PLAYING || !this.currentPiece) return;
    let dropCells = 0;
    let row = this.currentPiece.row;
    while (true) {
      const testRow = row + 1;
      const positions = Rotation.getCells(
        this.currentPiece.def, this.currentPiece.state, testRow, this.currentPiece.col
      );
      if (!this.board.isValid(positions)) break;
      row = testRow;
      dropCells++;
    }
    if (dropCells > 0) {
      this.currentPiece.row = row;
      this.currentPiece.positions = Rotation.getCells(
        this.currentPiece.def, this.currentPiece.state, row, this.currentPiece.col
      );
      this.scoring.addHardDrop(dropCells);
      this._updateHUD();
      AudioManager.hardDrop();
      this._triggerShake(4);
    }
    // Lock immediately after hard drop
    this._lockPiece();
  }

  _hold() {
    if (this.state !== STATE.PLAYING || !this.currentPiece) return;
    if (!this.holdMgr.canHold) return;
    const currentType = this.currentPiece.type;
    const newType = this.holdMgr.swap(currentType, this.spawner);
    if (newType === null) return;
    AudioManager.hold();
    this._spawnPiece(newType);
  }

  _checkLock() {
    if (!this.currentPiece) return;
    // If the piece can't move down, start/continue the lock timer
    if (!this.isLocking) {
      this.isLocking = true;
      this.lockTimer = 0;
    }
  }

  _resetLockTimer() {
    // If the piece moves/rotates while locking, reset the timer
    // (up to a maximum number of resets to prevent infinite stalling)
    if (this.isLocking && this.lockResets < CONFIG.MAX_LOCK_RESETS) {
      this.lockTimer = 0;
      this.lockResets++;
    }
  }

  _lockPiece() {
    if (!this.currentPiece) return;
    this.board.lock(this.currentPiece.positions, this.currentPiece.type);
    AudioManager.lock();

    // Check for full lines
    const fullRows = this.board.getFullRows();
    if (fullRows.length > 0) {
      this._handleLineClears(fullRows);
    } else {
      this.scoring.breakCombo();
      this._updateHUD();
    }

    // Check game over (overflow into hidden rows)
    if (this.board.isOverflow()) {
      this._gameOver();
      return;
    }

    // Spawn next piece
    this._spawnPiece();
  }

  _handleLineClears(rows) {
    const count = rows.length;

    // Trigger flash effect
    this.flashRows = [...rows];
    this.flashTimer = this.flashDuration;

    // Particles
    this._spawnLineParticles(rows);

    // Screen shake
    this._triggerShake(count * 3);

    // Score
    const gained = this.scoring.addLineClears(count, this.level.level);

    // Level up
    const levelUps = this.level.addLines(count);

    // Popups
    const labels = { 1: 'SINGLE', 2: 'DOUBLE', 3: 'TRIPLE', 4: 'TETRIS!' };
    this._addPopup(labels[count] || `${count} LINES`, gained);

    if (this.scoring.combo > 0) {
      this._addPopup(`COMBO x${this.scoring.combo + 1}`, null, '#ff8c1a');
      AudioManager.combo(this.scoring.combo);
    }

    if (count === 4) {
      AudioManager.tetris();
    } else {
      AudioManager.lineClear(count);
    }

    if (levelUps > 0) {
      AudioManager.levelUp();
      this._addPopup('LEVEL UP!', null, '#00d4e6');
    }

    // Actually clear the rows after the flash
    // We delay the actual clearing so the flash animation shows
    setTimeout(() => {
      this.board.clearLines(rows);
      this._updateHUD();
      this.flashRows = [];
    }, this.flashDuration);

    this._updateHUD();
  }

  // ================================================================
  //  Effects
  // ================================================================

  _triggerShake(amount) {
    this.shakeAmount = Math.max(this.shakeAmount, amount);
    this.shakeTimer = 300;
  }

  _spawnLineParticles(rows) {
    for (const r of rows) {
      for (let c = 0; c < this.board.cols; c++) {
        const type = this.board.grid[r][c];
        const color = (type && type !== CONFIG.EMPTY) ? CONFIG.COLORS[type].base : '#ffffff';
        const x = (c + 0.5) * CONFIG.BLOCK_SIZE;
        const y = (r - CONFIG.HIDDEN_ROWS + 0.5) * CONFIG.BLOCK_SIZE;
        for (let i = 0; i < 4; i++) {
          this.particles.push({
            x: x, y: y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8 - 2,
            life: 1,
            color: color,
            size: 2 + Math.random() * 3,
          });
        }
      }
    }
  }

  _addPopup(text, score, color) {
    const popup = {
      text: text,
      score: score,
      color: color || '#f7d51d',
      life: 1,
      y: 0,
    };
    this.popups.push(popup);
    // Keep only last 3 popups
    if (this.popups.length > 3) this.popups.shift();
  }

  _updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.3; // gravity
      p.life -= dt / 600;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }

  _updatePopups(dt) {
    for (let i = this.popups.length - 1; i >= 0; i--) {
      const p = this.popups[i];
      p.life -= dt / 800;
      p.y -= dt / 20;
      if (p.life <= 0) this.popups.splice(i, 1);
    }
  }

  // ================================================================
  //  HUD updates
  // ================================================================

  _updateHUD() {
    this.elScore.textContent = this.scoring.score;
    this.elLevel.textContent = this.level.level;
    this.elLines.textContent = this.level.totalLines;
    this.elCombo.textContent = Math.max(0, this.scoring.combo);
  }

  _updateMenuStats() {
    this.elMenuScore.textContent = this.saveData.highScore;
    this.elMenuLevel.textContent = this.saveData.bestLevel;
    this.elMenuLines.textContent = this.saveData.mostLines;
  }

  // ================================================================
  //  Main game loop
  // ================================================================

  start() {
    this.input.start();
    this.lastFrame = performance.now();
    this._loop();
  }

  _loop() {
    const now = performance.now();
    let dt = now - this.lastFrame;
    this.lastFrame = now;
    if (dt > 100) dt = 100; // clamp

    if (this.state === STATE.PLAYING) {
      this._update(dt);
    }

    // Effects update (particles, popups, shake) happen in any state
    // so they can finish their animation
    this._updateParticles(dt);
    this._updatePopups(dt);

    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt;
      if (this.shakeTimer <= 0) this.shakeAmount = 0;
    }

    this._render();

    requestAnimationFrame(() => this._loop());
  }

  _update(dt) {
    if (!this.currentPiece) return;

    // Check if piece can still move down
    const testRow = this.currentPiece.row + 1;
    const testPositions = Rotation.getCells(
      this.currentPiece.def, this.currentPiece.state, testRow, this.currentPiece.col
    );
    const canDrop = this.board.isValid(testPositions);

    if (!canDrop) {
      // Piece is resting → run lock delay
      if (!this.isLocking) {
        this.isLocking = true;
        this.lockTimer = 0;
      }
      this.lockTimer += dt;
      if (this.lockTimer >= CONFIG.LOCK_DELAY) {
        this._lockPiece();
        return;
      }
    } else {
      // Piece can drop → gravity
      this.isLocking = false;
      this.dropTimer += dt;
      const gravity = this.level.gravity();
      if (this.dropTimer >= gravity) {
        this.dropTimer = 0;
        this.currentPiece.row++;
        this.currentPiece.positions = Rotation.getCells(
          this.currentPiece.def, this.currentPiece.state,
          this.currentPiece.row, this.currentPiece.col
        );
        this._updateGhost();
      }
    }
  }

  // ================================================================
  //  Rendering
  // ================================================================

  _render() {
    const ctx = this.ctx;
    const W = this.canvas.width;
    const H = this.canvas.height;

    ctx.save();

    // Screen shake
    if (this.shakeAmount > 0) {
      const sx = (Math.random() - 0.5) * this.shakeAmount;
      const sy = (Math.random() - 0.5) * this.shakeAmount;
      ctx.translate(sx, sy);
    }

    // Clear
    ctx.fillStyle = '#0d0d1a';
    ctx.fillRect(0, 0, W, H);

    // Draw grid background
    this._drawGrid(ctx);

    // Draw locked blocks
    this._drawBoard(ctx);

    // Draw flash rows (line clear effect)
    if (this.flashRows.length > 0 && this.flashTimer > 0) {
      this._drawFlash(ctx);
    }

    // Draw ghost piece
    if (this.currentPiece && this.ghostPositions && this.state === STATE.PLAYING) {
      this._drawPieceCells(ctx, this.ghostPositions, this.currentPiece.def.color, true);
    }

    // Draw current piece
    if (this.currentPiece && this.state === STATE.PLAYING) {
      this._drawPieceCells(ctx, this.currentPiece.positions, this.currentPiece.def.color, false);
    }

    // Draw particles
    this._drawParticles(ctx);

    // Draw popups
    this._drawPopups(ctx);

    ctx.restore();
  }

  _drawGrid(ctx) {
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let c = 1; c < CONFIG.COLS; c++) {
      ctx.beginPath();
      ctx.moveTo(c * CONFIG.BLOCK_SIZE, 0);
      ctx.lineTo(c * CONFIG.BLOCK_SIZE, this.canvas.height);
      ctx.stroke();
    }
    for (let r = 1; r < CONFIG.ROWS; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * CONFIG.BLOCK_SIZE);
      ctx.lineTo(this.canvas.width, r * CONFIG.BLOCK_SIZE);
      ctx.stroke();
    }
  }

  _drawBoard(ctx) {
    const offset = CONFIG.HIDDEN_ROWS;
    for (let r = 0; r < this.board.totalRows; r++) {
      for (let c = 0; c < this.board.cols; c++) {
        const type = this.board.grid[r][c];
        if (type && type !== CONFIG.EMPTY) {
          const x = c * CONFIG.BLOCK_SIZE;
          const y = (r - offset) * CONFIG.BLOCK_SIZE;
          if (y < 0) continue; // don't draw hidden rows
          this._drawBlock(ctx, x, y, CONFIG.BLOCK_SIZE, CONFIG.COLORS[type]);
        }
      }
    }
  }

  _drawPieceCells(ctx, positions, color, isGhost) {
    const offset = CONFIG.HIDDEN_ROWS;
    for (const [r, c] of positions) {
      const x = c * CONFIG.BLOCK_SIZE;
      const y = (r - offset) * CONFIG.BLOCK_SIZE;
      if (y < 0) continue;
      if (isGhost) {
        this._drawGhostBlock(ctx, x, y, CONFIG.BLOCK_SIZE, color);
      } else {
        this._drawBlock(ctx, x, y, CONFIG.BLOCK_SIZE, color);
      }
    }
  }

  _drawBlock(ctx, x, y, size, color) {
    const pad = 1;

    // Base fill
    ctx.fillStyle = color.base;
    ctx.fillRect(x + pad, y + pad, size - 2 * pad, size - 2 * pad);

    // Top-left highlight
    ctx.fillStyle = color.light;
    ctx.fillRect(x + pad, y + pad, size - 2 * pad, 3);
    ctx.fillRect(x + pad, y + pad, 3, size - 2 * pad);

    // Bottom-right shadow
    ctx.fillStyle = color.dark;
    ctx.fillRect(x + pad, y + size - pad - 3, size - 2 * pad, 3);
    ctx.fillRect(x + size - pad - 3, y + pad, 3, size - 2 * pad);

    // Inner glow border
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + pad + 0.5, y + pad + 0.5, size - 2 * pad - 1, size - 2 * pad - 1);
  }

  _drawGhostBlock(ctx, x, y, size, color) {
    ctx.fillStyle = color.base;
    ctx.globalAlpha = CONFIG.GHOST_ALPHA;
    ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = color.base;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.4;
    ctx.strokeRect(x + 2.5, y + 2.5, size - 5, size - 5);
    ctx.globalAlpha = 1;
  }

  _drawFlash(ctx) {
    const progress = this.flashTimer / this.flashDuration;
    const alpha = progress < 0.5 ? progress * 2 : (1 - progress) * 2;
    for (const r of this.flashRows) {
      const y = (r - CONFIG.HIDDEN_ROWS) * CONFIG.BLOCK_SIZE;
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fillRect(0, y, this.canvas.width, CONFIG.BLOCK_SIZE);
    }
  }

  _drawParticles(ctx) {
    for (const p of this.particles) {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }

  _drawPopups(ctx) {
    ctx.textAlign = 'center';
    for (let i = 0; i < this.popups.length; i++) {
      const p = this.popups[i];
      const y = this.canvas.height / 2 + i * 40 + p.y;
      ctx.globalAlpha = p.life;
      ctx.font = 'bold 28px "Segoe UI", sans-serif';
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.fillText(p.text, this.canvas.width / 2, y);
      if (p.score) {
        ctx.font = 'bold 20px "Segoe UI", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('+' + p.score, this.canvas.width / 2, y + 24);
      }
    }
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

  // ---- Preview rendering (next & hold) ----
  _renderNext() {
    if (!this.nextPreview) return;
    this._renderPreview(this.nextCtx, this.nextCanvas, this.nextPreview);
  }

  _renderHold() {
    this._renderPreview(this.holdCtx, this.holdCanvas, this.holdMgr.heldPiece);
  }

  _renderPreview(ctx, canvas, type) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!type) return;
    const def = PIECES[type];
    const cells = def.states[0];

    // Find bounding box of the piece shape
    let minR = 4, maxR = 0, minC = 4, maxC = 0;
    for (const [r, c] of cells) {
      minR = Math.min(minR, r); maxR = Math.max(maxR, r);
      minC = Math.min(minC, c); maxC = Math.max(maxC, c);
    }
    const w = (maxC - minC + 1);
    const h = (maxR - minR + 1);

    // Scale to fit the preview canvas
    const blockSize = Math.min(
      Math.floor((canvas.width - 10) / 4),
      Math.floor((canvas.height - 10) / 4),
      22
    );

    const offsetX = (canvas.width - w * blockSize) / 2 - minC * blockSize;
    const offsetY = (canvas.height - h * blockSize) / 2 - minR * blockSize;

    for (const [r, c] of cells) {
      const x = offsetX + c * blockSize;
      const y = offsetY + r * blockSize;
      this._drawBlock(ctx, x, y, blockSize, def.color);
    }
  }
}

window.TetrisGame = TetrisGame;
