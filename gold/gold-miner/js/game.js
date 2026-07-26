/* ============================================================
   game.js - Core game class: loop, state, scoring, combos,
   TNT, Shield, Lucky Leaf, particle effects, UI integration.
   ============================================================ */

const GameState = {
  MENU: "menu",
  PLAYING: "playing",
  PAUSED: "paused",
  RESULTS: "results",
  SHOP: "shop",
  SECTION: "section",
  FINAL: "final",
  INSTRUCTIONS: "instructions"
};

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.state = GameState.MENU;
    this.round = 1;
    this.score = 0;             // gold earned in the current round
    this.totalGold = 0;         // accumulated gold across rounds (for shop spending)
    this.timeLeft = 0;
    this.lastTime = 0;

    this.objects = [];
    this.player = new Player(480, 70);
    this.claw = new Claw(480, 88);

    this.inventory = null;
    this.clawLevel = 1;

    this.combo = 0;             // consecutive valuable objects collected
    this.comboMult = 1;
    this.lastWasLowValue = false;

    this.particles = [];
    this.toasts = [];           // floating text
    this.flashAlpha = 0;
    this.shakeTime = 0;

    this._timerWarningPlayed = false;

    this.save = SaveManager.load();
    this.applySavedData();

    this.bindUI();
  }

  applySavedData() {
    this.inventory = new Inventory(this.save.inventory);
    this.clawLevel = this.save.clawSpeedLevel || 1;
    this.totalGold = this.save.totalGold || 0;
    // Note: totalGold persisted as spending balance; we re-init to a safe value on new game.
    this.claw.setRetrievalLevel(this.clawLevel);
  }

  bindUI() {
    // Menu buttons
    document.getElementById("btn-new-game").addEventListener("click", () => this.startNewGame());
    document.getElementById("btn-continue").addEventListener("click", () => this.continueGame());
    document.getElementById("btn-instructions").addEventListener("click", () => this.showInstructions());
    document.getElementById("btn-instructions-back").addEventListener("click", () => this.backToMenu());
    document.getElementById("btn-reset-save").addEventListener("click", () => this.resetSave());
    document.getElementById("btn-resume").addEventListener("click", () => this.resumeGame());
    document.getElementById("btn-quit-to-menu").addEventListener("click", () => this.quitToMenu());
    document.getElementById("btn-section-continue").addEventListener("click", () => this.continueAfterSection());
    document.getElementById("btn-results-shop").addEventListener("click", () => this.openShop());
    document.getElementById("btn-results-replay").addEventListener("click", () => this.replayRound());
    document.getElementById("btn-shop-continue").addEventListener("click", () => this.nextRound());
    document.getElementById("btn-final-replay").addEventListener("click", () => this.replayFinalRound());
    document.getElementById("btn-final-restart").addEventListener("click", () => this.restartGame());

    document.getElementById("btn-use-tnt").addEventListener("click", () => this.useTNT());
    document.getElementById("btn-use-leaf").addEventListener("click", () => this.activateLuckyLeaf());

    // Keyboard
    this.keyHandler = (e) => this.onKey(e);
    document.addEventListener("keydown", this.keyHandler);

    // Canvas click to launch
    this.canvas.addEventListener("click", () => {
      if (this.state === GameState.PLAYING) {
        AudioManager.resume();
        this.claw.launch();
      }
    });

    this.updateMenuSaveInfo();
  }

  onKey(e) {
    if (e.code === "Space") {
      e.preventDefault();
      if (this.state === GameState.PLAYING) {
        AudioManager.resume();
        this.claw.launch();
      }
    } else if (e.key === "t" || e.key === "T") {
      if (this.state === GameState.PLAYING) this.useTNT();
    } else if (e.key === "l" || e.key === "L") {
      if (this.state === GameState.PLAYING) this.activateLuckyLeaf();
    } else if (e.key === "Escape") {
      if (this.state === GameState.PLAYING) this.pauseGame();
      else if (this.state === GameState.PAUSED) this.resumeGame();
    }
  }

  updateMenuSaveInfo() {
    document.getElementById("save-stars").textContent =
      `Total Stars: ${this.save.totalStars || 0} / 30`;
  }

  showInstructions() {
    this.state = GameState.INSTRUCTIONS;
    document.getElementById("instructions-screen").classList.remove("hidden");
    document.getElementById("menu-screen").classList.add("hidden");
  }
  backToMenu() {
    this.state = GameState.MENU;
    document.getElementById("instructions-screen").classList.add("hidden");
    document.getElementById("menu-screen").classList.remove("hidden");
    this.updateMenuSaveInfo();
  }

  startNewGame() {
    // Fresh save but keep claw upgrade? Spec: new game starts fresh.
    this.save = SaveManager.reset();
    this.applySavedData();
    this.round = 1;
    this.totalGold = 0; // starting balance
    this.startRound(1);
  }

  continueGame() {
    this.applySavedData();
    this.round = this.save.highestRoundReached || 1;
    this.totalGold = this.save.totalGold || 0;
    // If inventory was persisted, we already have it via applySavedData.
    this.startRound(this.round);
  }

  resetSave() {
    this.save = SaveManager.reset();
    this.applySavedData();
    this.round = 1;
    this.totalGold = 0;
    this.updateMenuSaveInfo();
    this.toast("Save reset!");
  }

  // ---------- ROUND CONTROL ----------
  startRound(round) {
    this.round = round;
    this.score = 0;
    this.combo = 0;
    this.comboMult = 1;
    this.lastWasLowValue = false;
    this.objects = LayoutManager.buildLayout(round);
    this.claw.reset();
    this.claw.setRetrievalLevel(this.clawLevel);
    this.timeLeft = LayoutManager.getRoundTime(round);
    this._timerWarningPlayed = false;
    this.particles = [];
    this.toasts = [];

    this.hideAllOverlays();
    document.getElementById("hud").classList.remove("hidden");
    this.updateHUD();
    this.updateStarMeter();
    this.state = GameState.PLAYING;
    AudioManager.init();
    AudioManager.resume();
    AudioManager.startMusic();
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  pauseGame() {
    if (this.state !== GameState.PLAYING) return;
    this.state = GameState.PAUSED;
    document.getElementById("pause-screen").classList.remove("hidden");
    AudioManager.stopMusic();
  }
  resumeGame() {
    if (this.state !== GameState.PAUSED) return;
    document.getElementById("pause-screen").classList.add("hidden");
    this.state = GameState.PLAYING;
    AudioManager.startMusic();
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }
  quitToMenu() {
    this.state = GameState.MENU;
    this.hideAllOverlays();
    document.getElementById("menu-screen").classList.remove("hidden");
    this.updateMenuSaveInfo();
    AudioManager.stopMusic();
  }

  hideAllOverlays() {
    ["menu-screen", "instructions-screen", "pause-screen", "results-screen",
     "shop-screen", "final-screen", "section-screen"].forEach(id => {
      document.getElementById(id).classList.add("hidden");
    });
    document.getElementById("hud").classList.add("hidden");
  }

  // ---------- MAIN LOOP ----------
  loop(now) {
    if (this.state !== GameState.PLAYING) return;
    let dt = (now - this.lastTime) / 1000;
    this.lastTime = now;
    // clamp dt to avoid huge jumps on tab refocus
    if (dt > 0.1) dt = 0.1;
    if (dt <= 0) dt = 1 / 60;

    this.update(dt);
    this.render();

    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    // Timer
    if (this.claw.state === ClawState.SWINGING || this.claw.state === ClawState.EXTENDING || this.claw.state === ClawState.RETRACTING) {
      this.timeLeft -= dt;
      if (this.timeLeft <= 0) {
        this.timeLeft = 0;
        // do not allow new launches; let current claw action resolve cleanly
        if (this.claw.state === ClawState.SWINGING) {
          this.endRound();
          return;
        }
      }
    }

    // Timer warning
    if (this.timeLeft > 0 && this.timeLeft <= 10 && !this._timerWarningPlayed) {
      this._timerWarningPlayed = true;
      AudioManager.sfx.timerWarning();
      document.getElementById("hud-timer-wrap").classList.add("warning");
    }

    // Update objects (movement)
    for (const obj of this.objects) obj.update(dt);
    this.player.update(dt);

    // Update claw
    this.claw.update(dt, this.objects, {
      onGrab: (obj) => this.onGrab(obj),
      onRetrieve: (obj) => this.onRetrieve(obj)
    });

    // If timer expired and claw just returned to swinging (after a retrieve), end round
    if (this.timeLeft <= 0 && this.claw.state === ClawState.SWINGING) {
      this.endRound();
      return;
    }

    // Particles
    this.particles = this.particles.filter(p => p.life > 0);
    for (const p of this.particles) p.update(dt);

    // Floating toasts
    this.toasts = this.toasts.filter(t => t.life > 0);
    for (const t of this.toasts) { t.y -= 20 * dt; t.life -= dt; }

    // Flash decay
    if (this.flashAlpha > 0) this.flashAlpha = Math.max(0, this.flashAlpha - dt * 2);
    if (this.shakeTime > 0) this.shakeTime = Math.max(0, this.shakeTime - dt);

    this.updateHUD();
    this.updateStarMeter();
  }

  // ---------- OBJECT HANDLING ----------
  onGrab(obj) {
    // visual cue handled by particles on retrieve mostly
  }

  onRetrieve(obj) {
    if (!obj) return;
    // Mystery bag resolution
    if (obj.type === "mysteryBag") {
      this.resolveMysteryBag(obj);
      obj.removed = true;
      return;
    }
    // TNT object - explode
    if (obj.type === "tnt") {
      this.triggerExplosion(obj.x, obj.y, true);
      obj.removed = true;
      return;
    }
    // Worm - no reward, breaks combo
    if (obj.type === "worm") {
      this.resetCombo();
      this.addFloatingText(obj.x, obj.y, "Worm! +0", "#c0706b");
      obj.removed = true;
      AudioManager.sfx.rock();
      return;
    }
    // Rock - Lucky Leaf transformation check
    if (obj.type === "rock") {
      if (this.inventory.isLuckyLeafActive()) {
        this.inventory.consumeLuckyLeafOnTransform();
        this.addFloatingText(obj.x, obj.y, "💎 Lucky Leaf! +750", "#5ee0ff");
        AudioManager.sfx.leaf();
        this.addScoreRaw(750);
        this.shake(0.2);
        this.flash(0.4, [94, 224, 255]);
      } else {
        this.addFloatingText(obj.x, obj.y, "+50", "#888");
        this.addScoreRaw(50);
        AudioManager.sfx.rock();
      }
      this.resetCombo();
      obj.removed = true;
      return;
    }
    // Gold / Diamond / Treasure - valuable, builds combo
    const value = this.computeObjectValue(obj);
    this.addScoreWithCombo(obj, value);
    obj.removed = true;
  }

  computeObjectValue(obj) {
    // Most objects have a fixed value
    return obj.value;
  }

  addScoreWithCombo(obj, baseValue) {
    // valuable objects: gold, diamond, movingDiamond, goldenTreasure
    const isValuable = ["smallGold", "mediumGold", "largeGold", "diamond", "movingDiamond", "goldenTreasure"].includes(obj.type);
    if (isValuable) {
      this.combo++;
      this.updateComboMult();
      const earned = Math.round(baseValue * this.comboMult);
      this.score += earned;
      this.addFloatingText(obj.x, obj.y, `+${earned}`, "#ffce3a");
      if (this.comboMult > 1) {
        this.addFloatingText(obj.x, obj.y - 18, `Combo x${this.comboMult}`, "#5ec27a");
      }
      // Sound + star threshold notification
      if (obj.type === "diamond" || obj.type === "movingDiamond") AudioManager.sfx.diamond();
      else if (obj.type === "goldenTreasure") { AudioManager.sfx.diamond(); this.shake(0.3); this.flash(0.5, [255, 215, 0]); }
      else AudioManager.sfx.gold();
      // Check for star threshold crossed
      this.checkStarThreshold();
    } else {
      this.addScoreRaw(baseValue);
    }
  }

  addScoreRaw(amount) {
    this.score += amount;
    if (amount > 0) AudioManager.sfx.gold();
    this.checkStarThreshold();
  }

  updateComboMult() {
    if (this.combo >= 8) this.comboMult = 1.3;
    else if (this.combo >= 5) this.comboMult = 1.2;
    else if (this.combo >= 3) this.comboMult = 1.1;
    else this.comboMult = 1.0;
    if (this.comboMult > 1) AudioManager.sfx.combo();
  }

  resetCombo() {
    this.combo = 0;
    this.comboMult = 1.0;
  }

  checkStarThreshold() {
    const t = Scoring.getThresholds(this.round);
    // Mark achieved by simple comparison; the results screen handles final reveal
    if (this.score === t.oneStar || this.score === t.twoStar || this.score === t.threeStar) {
      AudioManager.sfx.star();
    }
  }

  // ---------- MYSTERY BAG ----------
  resolveMysteryBag(obj) {
    AudioManager.sfx.mystery();
    const positive = Math.random() < 0.5;
    if (positive) {
      this.score += 1000;
      this.addFloatingText(obj.x, obj.y, "Mystery! +1000", "#5ec27a");
      AudioManager.sfx.gold();
      this.checkStarThreshold();
    } else {
      // negative - shield can protect
      if (this.inventory.hasShield()) {
        this.inventory.consumeShield();
        this.addFloatingText(obj.x, obj.y, "Shield! Blocked -500", "#5ea2c2");
        AudioManager.sfx.shield();
        this.flash(0.4, [94, 162, 194]);
      } else {
        this.score = Math.max(0, this.score - 500);
        this.addFloatingText(obj.x, obj.y, "Mystery! -500", "#e06464");
        AudioManager.sfx.fail();
        this.shake(0.25);
        this.flash(0.4, [224, 100, 100]);
      }
    }
  }

  // ---------- TNT ----------
  useTNT() {
    if (this.state !== GameState.PLAYING) return;
    if (!this.inventory.hasTNT()) { this.toast("No TNT available!"); AudioManager.sfx.error(); return; }
    if (this.claw.state !== ClawState.SWINGING) { this.toast("Can't use TNT while claw is busy!"); AudioManager.sfx.error(); return; }

    // Find a target Rock. Prefer the one closest to the claw's current aim line.
    const head = this.claw.headPosition;
    // Actually use the anchor + angle projection to find which rock the claw is "aiming" at.
    // We'll pick the nearest rock to a point along the current angle at a depth.
    let best = null, bestDist = Infinity;
    for (const obj of this.objects) {
      if (obj.removed || obj.collected) continue;
      if (obj.type !== "rock") continue;
      const dx = obj.x - this.claw.anchorX;
      const dy = obj.y - this.claw.anchorY;
      const dist = Math.hypot(dx, dy);
      // weight by closeness to the claw's current pointing direction
      const ang = Math.atan2(dx, dy);
      const angDiff = Math.abs(ang - this.claw.angle);
      const score = dist + angDiff * 200;
      if (score < bestDist) { bestDist = score; best = obj; }
    }
    if (!best) { this.toast("No Rock to target with TNT!"); AudioManager.sfx.error(); return; }

    this.inventory.consumeTNT();
    this.triggerExplosion(best.x, best.y, false);
    AudioManager.sfx.tnt();
    this.shake(0.3);
    this.flash(0.5, [255, 120, 0]);
    this.toast("TNT! Rock destroyed.");
    this.updateHUD();
  }

  triggerExplosion(x, y, fromObject) {
    const radius = 90;
    // Destroy rocks and worms within radius. Do NOT touch valuable items.
    for (const obj of this.objects) {
      if (obj.removed || obj.collected) continue;
      if (obj.type === "rock" || obj.type === "worm") {
        const d = Math.hypot(obj.x - x, obj.y - y);
        if (d <= radius + obj.size) {
          obj.removed = true;
          // small puff particle
          this.spawnParticles(obj.x, obj.y, 12, "#aaa");
        }
      }
    }
    // explosion particles
    this.spawnParticles(x, y, 30, "#ff8a3a");
    this.spawnParticles(x, y, 20, "#ffce3a");
  }

  // ---------- LUCKY LEAF ----------
  activateLuckyLeaf() {
    if (this.state !== GameState.PLAYING) return false;
    if (this.inventory.luckyLeafActive) { this.toast("Lucky Leaf already active!"); return false; }
    if (!this.inventory.hasLuckyLeaf()) {
      this.toast("No Lucky Leaf available!");
      AudioManager.sfx.error();
      this.updateHUD();
      return false;
    }
    this.inventory.activateLuckyLeaf();
    AudioManager.sfx.leaf();
    this.toast("Lucky Leaf active! Next Rock → Diamond.");
    this.flash(0.3, [94, 194, 122]);
    this.updateHUD();
    return true;
  }

  // ---------- END OF ROUND ----------
  endRound() {
    AudioManager.stopMusic();
    const passed = Scoring.passed(this.round, this.score);
    const stars = Scoring.calcStars(this.round, this.score);
    const t = Scoring.getThresholds(this.round);

    // Save best score/stars
    const prevBest = this.save.bestScores[this.round] || 0;
    const prevStars = this.save.bestStars[this.round] || 0;
    if (this.score > prevBest) this.save.bestScores[this.round] = this.score;
    if (stars > prevStars) this.save.bestStars[this.round] = stars;
    // Recompute total stars
    this.save.totalStars = Object.values(this.save.bestStars).reduce((a, b) => a + b, 0);
    // Mark completed if passed
    if (passed && !this.save.completedRounds.includes(this.round)) {
      this.save.completedRounds.push(this.round);
    }
    if (passed) {
      this.totalGold += this.score;
      this.save.totalGold = this.totalGold;
    }
    this.save.highestRoundReached = Math.max(this.save.highestRoundReached, this.round);
    this.save.inventory = this.inventory.serialize();
    this.save.clawSpeedLevel = this.clawLevel;
    SaveManager.save(this.save);
    this.updateMenuSaveInfo();

    // Show results screen
    this.state = GameState.RESULTS;
    document.getElementById("hud").classList.add("hidden");
    document.getElementById("results-screen").classList.remove("hidden");
    document.getElementById("results-title").textContent = passed ? "ROUND COMPLETE!" : "ROUND FAILED";
    document.getElementById("results-gold").textContent = this.score;
    document.getElementById("results-best").textContent = `${prevBest} (⭐${prevStars})`;

    // Animate star progress meter
    this.renderResultsStarProgress();
    this.renderResultsStars(stars, passed);
    if (passed) AudioManager.sfx.roundComplete();
    else AudioManager.sfx.fail();
  }

  renderResultsStarProgress() {
    const wrap = document.getElementById("results-star-progress");
    wrap.innerHTML = "";
    const t = Scoring.getThresholds(this.round);
    const max = t.threeStar * 1.1;
    const fill = document.createElement("div");
    fill.className = "sp-fill";
    wrap.appendChild(fill);
    [t.oneStar, t.twoStar, t.threeStar].forEach(v => {
      const mark = document.createElement("div");
      mark.className = "sp-mark";
      mark.style.left = `${(v / max) * 100}%`;
      wrap.appendChild(mark);
    });
    setTimeout(() => { fill.style.width = `${Math.min(100, (this.score / max) * 100)}%`; }, 50);
  }

  renderResultsStars(stars, passed) {
    const el = document.getElementById("results-stars");
    el.innerHTML = "";
    if (!passed) {
      el.innerHTML = "—";
      return;
    }
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const s = document.createElement("span");
        s.textContent = i < stars ? "⭐" : "☆";
        if (i < stars) { s.classList.add("star-earned"); AudioManager.sfx.star(); }
        el.appendChild(s);
      }, 300 + i * 350);
    }
  }

  openShop() {
    this.state = GameState.SHOP;
    document.getElementById("results-screen").classList.add("hidden");
    document.getElementById("shop-screen").classList.remove("hidden");
    this.refreshShop();
  }

  refreshShop() {
    Shop.render(this.totalGold, this.inventory, this.clawLevel, {
      buyTNT: (count, price) => this.buyTNT(count, price),
      buyShield: (price) => this.buyShield(price),
      buyLuckyLeaf: (price) => this.buyLuckyLeaf(price),
      buyUpgrade: (price) => this.buyUpgrade(price)
    });
  }

  buyTNT(count, price) {
    if (this.totalGold < price) { this.toast("Not enough gold!"); AudioManager.sfx.error(); return; }
    this.totalGold -= price;
    this.inventory.addTNT(count);
    this.save.totalGold = this.totalGold;
    this.save.inventory = this.inventory.serialize();
    SaveManager.save(this.save);
    AudioManager.sfx.buy();
    this.refreshShop();
    this.toast(`Bought ${count} TNT!`);
  }
  buyShield(price) {
    if (this.totalGold < price) { this.toast("Not enough gold!"); AudioManager.sfx.error(); return; }
    this.totalGold -= price;
    this.inventory.addShield(1);
    this.save.totalGold = this.totalGold;
    this.save.inventory = this.inventory.serialize();
    SaveManager.save(this.save);
    AudioManager.sfx.buy();
    this.refreshShop();
    this.toast("Bought Shield!");
  }
  buyLuckyLeaf(price) {
    if (this.totalGold < price) { this.toast("Not enough gold!"); AudioManager.sfx.error(); return; }
    this.totalGold -= price;
    this.inventory.addLuckyLeaf(1);
    this.save.totalGold = this.totalGold;
    this.save.inventory = this.inventory.serialize();
    SaveManager.save(this.save);
    AudioManager.sfx.buy();
    this.refreshShop();
    this.toast("Bought Lucky Leaf!");
  }
  buyUpgrade(price) {
    if (this.totalGold < price) { this.toast("Not enough gold!"); AudioManager.sfx.error(); return; }
    if (this.clawLevel >= Upgrades.MAX_LEVEL) { this.toast("Max level reached!"); return; }
    this.totalGold -= price;
    this.clawLevel++;
    this.claw.setRetrievalLevel(this.clawLevel);
    this.save.totalGold = this.totalGold;
    this.save.clawSpeedLevel = this.clawLevel;
    SaveManager.save(this.save);
    AudioManager.sfx.buy();
    this.refreshShop();
    this.toast(`Claw upgraded to Level ${this.clawLevel}!`);
  }

  nextRound() {
    // Determine if a section milestone should be shown.
    // Show milestone when finishing the last round of a section (3, 6, 9) and going to next section.
    // Also handle end of round 10 -> final screen.
    if (this.round >= 10) {
      this.showFinal();
      return;
    }
    // Section transitions: after rounds 3, 6, 9 show section milestone
    const sectionEnds = [3, 6, 9];
    if (sectionEnds.includes(this.round)) {
      this.showSectionMilestone();
      return;
    }
    this.startRound(this.round + 1);
  }

  showSectionMilestone() {
    this.state = GameState.SECTION;
    const section = LayoutManager.getSection(this.round + 1);
    document.getElementById("shop-screen").classList.add("hidden");
    document.getElementById("section-screen").classList.remove("hidden");
    document.getElementById("section-title").textContent = `Section Complete!`;
    const starsSoFar = Object.values(this.save.bestStars).reduce((a, b) => a + b, 0);
    document.getElementById("section-text").innerHTML =
      `You've earned <b>${starsSoFar}</b> stars so far.<br>Next up: <b>${section.name}</b>.<br>Get ready, miner!`;
  }

  continueAfterSection() {
    document.getElementById("section-screen").classList.add("hidden");
    this.startRound(this.round + 1);
  }

  replayRound() {
    document.getElementById("results-screen").classList.add("hidden");
    // Replaying a passed round: refund the score we added? Spec says don't erase gold from previous completed rounds.
    // We subtract this round's score from totalGold only if it was previously added (it was, in endRound).
    // Actually, to keep it simple and fair: replaying re-attempts the round; total gold already includes the previous attempt.
    // We don't double-add: we set this.score back to 0 and start the round again. The endRound will add the NEW score.
    // But that would double count. So we subtract the previous attempt's contribution first.
    // Simpler: track per-round contribution. Let's store lastAttemptGold.
    if (this._lastPassedContribution) {
      this.totalGold -= this._lastPassedContribution;
      this._lastPassedContribution = 0;
    }
    this.startRound(this.round);
  }

  showFinal() {
    this.state = GameState.FINAL;
    document.getElementById("shop-screen").classList.add("hidden");
    document.getElementById("final-screen").classList.remove("hidden");
    const totalStars = Object.values(this.save.bestStars).reduce((a, b) => a + b, 0);
    const threeStarRounds = Object.values(this.save.bestStars).filter(s => s === 3).length;
    document.getElementById("final-gold").textContent = this.totalGold;
    document.getElementById("final-stars").textContent = `${totalStars} / 30`;
    document.getElementById("final-three").textContent = `${threeStarRounds} / 10`;
    AudioManager.sfx.roundComplete();
    AudioManager.sfx.star();
  }

  replayFinalRound() {
    document.getElementById("final-screen").classList.add("hidden");
    this.startRound(10);
  }
  restartGame() {
    document.getElementById("final-screen").classList.add("hidden");
    this.startNewGame();
  }

  // ---------- HUD ----------
  updateHUD() {
    document.getElementById("hud-round").textContent = this.round;
    document.getElementById("hud-gold").textContent = this.score;
    document.getElementById("hud-timer").textContent = Math.ceil(this.timeLeft);
    document.getElementById("hud-combo").textContent = `x${this.comboMult.toFixed(1)}`;
    document.getElementById("hud-section").textContent = LayoutManager.getSection(this.round).name;
    document.getElementById("tnt-count").textContent = this.inventory.tnt;
    document.getElementById("shield-count").textContent = this.inventory.shield;
    const leafEl = document.getElementById("hud-leaf");
    if (this.inventory.luckyLeaf > 0 || this.inventory.luckyLeafActive) {
      leafEl.classList.remove("active-hidden");
      leafEl.classList.toggle("is-active", this.inventory.luckyLeafActive);
      document.getElementById("leaf-active").textContent = this.inventory.luckyLeafActive ? "Active" : this.inventory.luckyLeaf;
    } else {
      leafEl.classList.add("active-hidden");
    }
    document.getElementById("claw-level").textContent = `L${this.clawLevel}`;
    // Enable/disable TNT/leaf buttons
    document.getElementById("btn-use-tnt").disabled = !this.inventory.hasTNT();
    document.getElementById("btn-use-leaf").disabled = !(this.inventory.hasLuckyLeaf() || this.inventory.luckyLeafActive);
    if (this.timeLeft > 10) document.getElementById("hud-timer-wrap").classList.remove("warning");
  }

  updateStarMeter() {
    const meter = document.getElementById("star-meter");
    const t = Scoring.getThresholds(this.round);
    // Build only once per round; we cache by checking child count
    if (meter.childElementCount === 0) {
      meter.innerHTML = "";
      const track = document.createElement("div");
      track.className = "sm-track";
      const fill = document.createElement("div");
      fill.className = "sm-fill";
      fill.id = "sm-fill";
      track.appendChild(fill);
      const max = t.threeStar * 1.1;
      [t.threeStar, t.twoStar, t.oneStar].forEach((v, i) => {
        const mark = document.createElement("div");
        mark.className = "sm-mark";
        const pct = 1 - (v / max); // from bottom
        mark.style.bottom = `${pct * 100}%`;
        const star = document.createElement("div");
        star.className = "sm-star";
        star.style.bottom = `${pct * 100}%`;
        star.textContent = ["⭐3", "⭐2", "⭐1"][i];
        track.appendChild(mark);
        track.appendChild(star);
      });
      meter.appendChild(track);
      const label = document.createElement("div");
      label.className = "sm-label";
      label.id = "sm-label";
      label.textContent = "0";
      meter.appendChild(label);
    }
    const fill = document.getElementById("sm-fill");
    const label = document.getElementById("sm-label");
    const max = t.threeStar * 1.1;
    const pct = Math.min(100, (this.score / max) * 100);
    fill.style.height = `${pct}%`;
    label.textContent = this.score;
  }

  // ---------- RENDER (canvas) ----------
  render() {
    const ctx = this.ctx;
    const section = LayoutManager.getSection(this.round);
    // Camera shake
    let sx = 0, sy = 0;
    if (this.shakeTime > 0) {
      sx = (Math.random() - 0.5) * 8 * this.shakeTime;
      sy = (Math.random() - 0.5) * 8 * this.shakeTime;
    }
    ctx.save();
    ctx.translate(sx, sy);

    this.drawBackground(ctx, section.bg);
    this.player.draw(ctx);
    this.claw.draw(ctx);
    for (const obj of this.objects) obj.draw(ctx);
    for (const p of this.particles) p.draw(ctx);

    // Floating toasts
    ctx.font = "bold 18px sans-serif";
    ctx.textAlign = "center";
    for (const t of this.toasts) {
      ctx.globalAlpha = Math.min(1, t.life);
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, t.x, t.y);
    }
    ctx.globalAlpha = 1;

    ctx.restore();

    // Flash overlay
    if (this.flashAlpha > 0) {
      ctx.save();
      ctx.globalAlpha = this.flashAlpha;
      ctx.fillStyle = `rgba(${this._flashColor[0]},${this._flashColor[1]},${this._flashColor[2]},1)`;
      ctx.fillRect(0, 0, 960, 640);
      ctx.restore();
    }
  }

  drawBackground(ctx, theme) {
    // Sky/ground gradient based on theme
    let topColor, bottomColor, groundColor;
    switch (theme) {
      case "jungle":
        topColor = "#3a5a2a"; bottomColor = "#2c4018"; groundColor = "#1a2a10";
        break;
      case "ruins":
        topColor = "#5a4a3a"; bottomColor = "#3a2a1a"; groundColor = "#241810";
        break;
      case "temple":
        topColor = "#5a3a1a"; bottomColor = "#3a2410"; groundColor = "#241008";
        break;
      case "mine":
      default:
        topColor = "#3d2e1f"; bottomColor = "#2c2218"; groundColor = "#1a1410";
        break;
    }
    const grad = ctx.createLinearGradient(0, 0, 0, 640);
    grad.addColorStop(0, topColor);
    grad.addColorStop(0.4, bottomColor);
    grad.addColorStop(0.4, groundColor);
    grad.addColorStop(1, groundColor);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 960, 640);

    // ground surface line
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 256);
    ctx.lineTo(960, 256);
    ctx.stroke();

    // underground texture: random stipple (deterministic-ish using simple sine)
    ctx.fillStyle = "rgba(0,0,0,0.15)";
    for (let i = 0; i < 60; i++) {
      const px = (i * 137) % 960;
      const py = 280 + ((i * 73) % 340);
      ctx.beginPath();
      ctx.arc(px, py, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    // some larger rocks for atmosphere
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    for (let i = 0; i < 20; i++) {
      const px = (i * 211) % 960;
      const py = 300 + ((i * 157) % 320);
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ---------- VISUAL FX HELPERS ----------
  spawnParticles(x, y, n, color) {
    for (let i = 0; i < n; i++) {
      this.particles.push(new Particle(x, y, color));
    }
  }
  addFloatingText(x, y, text, color) {
    this.toasts.push({ x, y, text, color: color || "#ffce3a", life: 1.4 });
  }
  flash(strength, color) {
    this.flashAlpha = strength;
    this._flashColor = color || [255, 255, 255];
  }
  shake(time) { this.shakeTime = time; }

  toast(text) {
    const el = document.getElementById("toast");
    el.textContent = text;
    el.classList.remove("hidden");
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => el.classList.add("hidden"), 1600);
  }
}

/* ---------- Particle ---------- */
class Particle {
  constructor(x, y, color) {
    this.x = x; this.y = y;
    const ang = Math.random() * Math.PI * 2;
    const speed = 40 + Math.random() * 120;
    this.vx = Math.cos(ang) * speed;
    this.vy = Math.sin(ang) * speed - 40;
    this.life = 0.6 + Math.random() * 0.4;
    this.maxLife = this.life;
    this.size = 2 + Math.random() * 3;
    this.color = color || "#ffce3a";
  }
  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vy += 200 * dt;
    this.life -= dt;
  }
  draw(ctx) {
    ctx.globalAlpha = Math.max(0, this.life / this.maxLife);
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

// Track last passed contribution for replay fairness
Game.prototype._lastPassedContribution = 0;
