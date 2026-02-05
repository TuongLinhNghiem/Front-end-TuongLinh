document.addEventListener('DOMContentLoaded', () => {
  // ---- Loading Screen ----
  const loadingScreen = document.getElementById('loadingScreen');
  const loadingProgress = document.getElementById('loadingProgress');
  const gameContainer = document.getElementById('gameContainer');
  const audioManager = {
    bgm: null,
    hasUserInteracted: false,
    isMuted: false,

    init() {
      const unlockAudio = (e) => {
        if (e.type !== "keydown") return;

        // Movement keys ONLY
        const movementKeys = ["KeyA", "KeyD", "ArrowLeft", "ArrowRight"];
        if (!movementKeys.includes(e.code)) return;

        this.hasUserInteracted = true;

        if (!this.bgm) {
          this.bgm = new Audio("bro-images/background-music.mp3");
          this.bgm.loop = true;
          this.bgm.volume = 0.3;
          this.bgm.muted = this.isMuted;
        }

        this.play();
        document.removeEventListener("keydown", unlockAudio);
      };

      document.addEventListener("keydown", unlockAudio);
    },

    play() {
      if (!this.bgm || !this.hasUserInteracted) return;
      this.bgm.play().catch(() => { });
    },

    pause() {
      if (this.bgm) this.bgm.pause();
    },

    toggleMute() {
      this.isMuted = !this.isMuted;
      if (this.bgm) this.bgm.muted = this.isMuted;
    }
  };

  // ===== SOUND EFFECT MANAGER =====
  const sfxManager = {
    hit: null,
    ult: null,
    isMuted: false,

    init() {
      this.ult = new Audio("bro-images/ult.mp3");

      this.ult.volume = 0.7;
    },

    playUlt() {
      if (this.isMuted) return;
      const sfx = this.ult.cloneNode();
      sfx.play().catch(() => { });
    },

    toggleMute() {
      this.isMuted = !this.isMuted;
    }
  };

  let loadingPercent = 0;
  const loadingInterval = setInterval(() => {
    loadingPercent += Math.random() * 15;
    if (loadingPercent >= 100) {
      loadingPercent = 100;
      clearInterval(loadingInterval);
      setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
          loadingScreen.style.display = 'none';
        }, 500);
      }, 500);
    }
    loadingProgress.style.width = loadingPercent + '%';
  }, 200);

  // ---- DOM Elements ----
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  // ---- Game State ----
  const MAX_STAGE = 6;
  const MAX_HP = 80;

  let stage = 1;
  let gameStarted = false;
  let isPaused = false;
  let ultCount = 0;
  let ultActive = 0;
  let enemyUltActive = 0;

  // ---- Assets ----
  let playerImg = new Image();
  let enemyImg = new Image();
  let bgImg = new Image();
  let assetsLoaded = 0;
  let assetsReady = false;

  // ---- Stage Data ----
  const stageEnemies = {
    1: "MECHA UNITS",
    2: "COCOLIA",
    3: "SEELE'S SHADOW",
    4: "HERRSCHER OF REASON'S WILL",
    5: "OTTO APOCALYPSE",
    6: "KEVIN KASLANA"
  };

  const stageStories = {
    1: `<h2>Stage 1 - Young Assassin</h2>
      <p>In the cold Siberian training grounds, young Bronya Zaychik faced her first real combat test.
      The mechanical units moved with precision, but Bronya's tactical mind and Project Bunny
      proved superior. Each victory brought her closer to understanding her true potential
      as the future Herrscher of Reason.</p>`,

    2: `<h2>Stage 2 - Cocolia</h2>
      <p>The confrontation with Cocolia was inevitable. The woman who raised her, who gave her purpose,
      now stood as an enemy. Bronya's heart ached, but her resolve was stronger.
      She had to stop Cocolia's dangerous experiments, even if it meant fighting
      the closest thing to a mother she had ever known.</p>`,

    3: `<h2>Stage 3 - Herrscher of Reason's Will</h2>
      <p>The Core of Reason tested Bronya's worthiness to inherit its power.
      Welt Yang's legacy lived within the core, and she had to prove herself
      capable of wielding the power of creation and understanding.
      Through logic, compassion, and unwavering determination, she earned the right
      to become the new Herrscher of Reason.</p>`,

    4: `<h2>Stage 4 - Otto Apocalypse</h2>
      <p>Otto's machinations threatened everything Bronya held dear.
      His 500-year plan put countless lives at risk, including Kiana's.
      As the Herrscher of Reason, Bronya used her powers of reconstruction and analysis
      to counter Otto's schemes, proving that the future belongs to those who protect it,
      not those who would sacrifice everything for their obsessions.</p>`,

    5: `<h2>Stage 5 - Kevin Kaslana</h2>
      <p>The final confrontation with Kevin Kaslana, the strongest warrior of the Previous Era.
      His Project STIGMA would save humanity by fundamentally changing it.
      Bronya, alongside her friends, stood against this absolute solution.
      She proved that humanity's strength lies not in perfection,
      but in the bonds between people and their will to protect each other.</p>`,

    6: `<h2>Stage 6 - Herrscher of Truth</h2>
      <p>In the final battle, humanity faced the Herrscher of the End, the threat of absolute annihilation.
      Bronya transcended fate and became the Herrscher of Truth,
      the union of 30000 human will. Alongside Kiana, Mei, and every ally,
      she helped defeat the Herrscher of the End and opened a new era for the world.</p>`
  };

  // ---- Game Objects ----
  let player = null;
  let enemy = null;
  let bullets = [];
  let enemyBullets = [];

  // ---- Input ----
  const keys = {};
  let lastTs = 0;

  // ---- Timing ----
  const PLAYER_SHOOT_INTERVAL = 180;
  const ENEMY_SHOOT_INTERVAL = 450;

  // ---- Canvas Setup ----
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // ---- Asset Loading ----
  function assetLoaded() {
    assetsLoaded++;
    if (assetsLoaded >= 3) {
      assetsReady = true;
      setupStageAfterAssets();
      if (!gameStarted) startGame();
    }
  }

  function loadStageAssets() {
    assetsLoaded = 0;
    assetsReady = false;

    playerImg = new Image();
    enemyImg = new Image();
    bgImg = new Image();

    playerImg.onload = assetLoaded;
    playerImg.onerror = assetLoaded;
    enemyImg.onload = assetLoaded;
    enemyImg.onerror = assetLoaded;
    bgImg.onload = assetLoaded;
    bgImg.onerror = assetLoaded;

    playerImg.src = `bro-images/player${stage}.png`;
    enemyImg.src = `bro-images/enemy${stage}.png`;
    bgImg.src = `bro-images/bg${stage}.jpg`;
  }

  function updatePortraits() {
    const enemyPortrait = document.getElementById('enemyPortrait');
    const enemyName = document.getElementById('enemyName');

    if (enemyPortrait) {
      enemyPortrait.src = `bro-images/enemy${stage}.png`;
    }
    if (enemyName) {
      enemyName.textContent = stageEnemies[stage] || "UNKNOWN";
    }
  }

  // ---- Stage Setup ----
  function setupStageAfterAssets() {
    const pw = Math.min(80, Math.floor(canvas.width * 0.06));
    const ph = Math.min(80, Math.floor(canvas.height * 0.08));
    const ew = Math.min(200, Math.floor(canvas.width * 0.12));
    const eh = Math.min(200, Math.floor(canvas.height * 0.15));

    player = {
      x: (canvas.width - pw) / 2,
      y: canvas.height - ph - 60,
      w: pw,
      h: ph,
      hp: MAX_HP,
      shootTimer: 0
    };

    enemy = {
      x: (canvas.width - ew) / 2,
      y: 40,
      w: ew,
      h: eh,
      hp: MAX_HP,
      dir: 1,
      shootTimer: 0
    };

    bullets = [];
    enemyBullets = [];
    ultCount = 0;
    ultActive = 0;
    enemyUltActive = 0;
    updateUI();
  }

  // ---- Enhanced UI Updates ----
  function updateUI() {
    if (!player || !enemy) return;

    // Update HP bars
    const playerHPPercent = (player.hp / MAX_HP) * 100;
    const enemyHPPercent = (enemy.hp / MAX_HP) * 100;

    document.getElementById("playerHP").style.width = playerHPPercent + "%";
    document.getElementById("enemyHP").style.width = enemyHPPercent + "%";

    // Update HP text
    const playerHPText = document.querySelector(".player-health .bar-text");
    const enemyHPText = document.querySelector(".enemy-health .bar-text");

    if (playerHPText) playerHPText.textContent = `${player.hp}/${MAX_HP}`;
    if (enemyHPText) enemyHPText.textContent = `${enemy.hp}/${MAX_HP}`;

    // Update ult gauge
    const ultPercent = Math.min(100, (ultCount / 10) * 100);
    document.getElementById("ultGauge").style.width = ultPercent + "%";

    const ultText = document.querySelector(".player-ult .bar-text");
    if (ultText) ultText.textContent = `${ultCount}/10`;

    // Add ult ready effect
    const ultContainer = document.querySelector(".player-ult");
    if (ultCount >= 10) {
      ultContainer.classList.add("ult-ready");
          } else {
      ultContainer.classList.remove("ult-ready");
    }

    // Add portrait glow effects during combat
    const playerPortraitGlow = document.querySelector(".player-portrait .portrait-glow");
    const enemyPortraitGlow = document.querySelector(".enemy-portrait .portrait-glow");

    if (ultActive > 0 && playerPortraitGlow) {
      playerPortraitGlow.style.opacity = '1';
    } else if (playerPortraitGlow) {
      playerPortraitGlow.style.opacity = '0';
    }

    if (enemyUltActive > 0 && enemyPortraitGlow) {
      enemyPortraitGlow.style.opacity = '1';
    } else if (enemyPortraitGlow) {
      enemyPortraitGlow.style.opacity = '0';
    }
  }

  // ---- Screen shake effect ----
  function addScreenShake() {
    gameContainer.classList.add('screen-shake');
    setTimeout(() => {
      gameContainer.classList.remove('screen-shake');
    }, 500);
  }

  // ---- Drawing Functions ----
  function drawBackground() {
    if (bgImg && bgImg.complete && bgImg.naturalWidth !== 0) {
      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
    } else {
      const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
      g.addColorStop(0, '#02040a');
      g.addColorStop(1, '#071133');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  function drawPlayer() {
    if (!player) return;
    if (playerImg && playerImg.complete && playerImg.naturalWidth !== 0) {
      ctx.drawImage(playerImg, player.x, player.y, player.w, player.h);
    } else {
      ctx.fillStyle = '#00d4ff';
      ctx.fillRect(player.x, player.y, player.w, player.h);
    }
  }

  function drawEnemy() {
    if (!enemy) return;
    if (enemyImg && enemyImg.complete && enemyImg.naturalWidth !== 0) {
      ctx.drawImage(enemyImg, enemy.x, enemy.y, enemy.w, enemy.h);
    } else {
      ctx.fillStyle = '#ff6b6b';
      ctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h);
    }
  }

  function drawBullets() {
    // Player bullets
    ctx.fillStyle = '#00d4ff';
    ctx.shadowColor = '#00d4ff';
    ctx.shadowBlur = 10;
    bullets.forEach(b => {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Enemy bullets
    ctx.fillStyle = '#ff6b6b';
    ctx.shadowColor = '#ff6b6b';
    ctx.shadowBlur = 10;
    enemyBullets.forEach(b => {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.shadowBlur = 0;
  }

  function drawUltEffects() {
    if (ultActive > 0 && player) {
      const x = player.x + player.w / 2;
      ctx.save();
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = '#00d4ff';
      ctx.fillRect(x - 40, 0, 80, canvas.height);

      // Add laser beam effect
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = '#87ceeb';
      ctx.fillRect(x - 20, 0, 40, canvas.height);

      ctx.globalAlpha = 1;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x - 5, 0, 10, canvas.height);
      ctx.restore();
    }

    if (enemyUltActive > 0 && enemy) {
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = '#ff6b6b';
      ctx.fillRect(0, enemy.y + enemy.h, canvas.width, canvas.height - (enemy.y + enemy.h));
      ctx.restore();
    }
  }

  // ---- Update Logic ----
  function update(dt) {
    if (!assetsReady || !player || !enemy || isPaused) return;

    // Player movement
    const moveSpeed = 0.28 * dt;
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
      player.x -= moveSpeed;
    }
    if (keys['ArrowRight'] || keys['d'] || keys['D']) {
      player.x += moveSpeed;
    }

    // Clamp player position
    player.x = Math.max(8, Math.min(canvas.width - player.w - 8, player.x));

    // Enemy movement
    enemy.x += enemy.dir * (0.18 * dt);
    if (enemy.x <= 8) {
      enemy.x = 8;
      enemy.dir = 1;
    }
    if (enemy.x + enemy.w >= canvas.width - 8) {
      enemy.x = canvas.width - enemy.w - 8;
      enemy.dir = -1;
    }

    // Shooting timers
    player.shootTimer -= dt;
    enemy.shootTimer -= dt;

    // Player shooting
    if (player.shootTimer <= 0) {
      const cx = player.x + player.w / 2;
      bullets.push({ x: cx - 8, y: player.y + 4, r: 6 });
      bullets.push({ x: cx + 8, y: player.y + 4, r: 6 });
      player.shootTimer = PLAYER_SHOOT_INTERVAL;
    }

    // Enemy shooting
    if (enemy.shootTimer <= 0) {
      const ex = enemy.x + enemy.w / 2;
      enemyBullets.push({ x: ex, y: enemy.y + enemy.h - 6, vx: -0.12, r: 6 });
      enemyBullets.push({ x: ex, y: enemy.y + enemy.h - 6, vx: 0, r: 6 });
      enemyBullets.push({ x: ex, y: enemy.y + enemy.h - 6, vx: 0.12, r: 6 });
      enemy.shootTimer = ENEMY_SHOOT_INTERVAL;
    }

    // Update bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
      let b = bullets[i];
      b.y -= 8;
      if (b.y < -20) bullets.splice(i, 1);
    }

    for (let i = enemyBullets.length - 1; i >= 0; i--) {
      let b = enemyBullets[i];
      b.y += 6;
      b.x += (b.vx || 0) * 60;
      if (b.y > canvas.height + 20) enemyBullets.splice(i, 1);
    }

    // Collisions
    // Player bullets -> enemy
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      if (b.x > enemy.x && b.x < enemy.x + enemy.w &&
          b.y > enemy.y && b.y < enemy.y + enemy.h) {
        bullets.splice(i, 1);
        enemy.hp = Math.max(0, enemy.hp - 1);
        ultCount = Math.min(ultCount + 1, 10);
        updateUI();
      }
    }

    // Enemy bullets -> player
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
      const b = enemyBullets[i];
      if (b.x > player.x && b.x < player.x + player.w &&
          b.y > player.y && b.y < player.y + player.h) {
        enemyBullets.splice(i, 1);
        player.hp = Math.max(0, player.hp - 1);
        updateUI();
      }
    }

    // Ultimate effects countdown
    if (ultActive > 0) ultActive = Math.max(0, ultActive - dt);
    if (enemyUltActive > 0) enemyUltActive = Math.max(0, enemyUltActive - dt);

    // Check win condition
    if (enemy.hp <= 0) {
      gameStarted = false;
      showStory(stageStories[stage], stage);
      return;
    }

    // Check lose condition
    if (player.hp <= 0) {
      gameStarted = false;
      showGameOver();
      return;
    }
  }

  // ---- Render ----
  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawPlayer();
    drawEnemy();
    drawBullets();
    drawUltEffects();
  }

  // ---- Game Loop ----
  function loop(ts) {
    if (!lastTs) lastTs = ts;
    const dt = Math.min(50, ts - lastTs);
    lastTs = ts;

    if (assetsReady && gameStarted) update(dt);
    render();
    requestAnimationFrame(loop);
  }

  // ---- Input Handlers ----
  function setupInputHandlers() {
    window.addEventListener('keydown', e => {
      if (isPaused) return;

      keys[e.key] = true;

      // Ultimate attack
      if ((e.key === 'u' || e.key === 'U') && ultCount >= 10 && ultActive <= 0) {
        e.preventDefault();
        activateUltimate();
      }

      // Pause
      if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        togglePause();
      }
    });

    window.addEventListener('keyup', e => {
      keys[e.key] = false;
    });
  }

  function activateUltimate() {
    ultCount = 0;
    ultActive = 1000; // 1 second
    enemy.hp = Math.max(0, enemy.hp - 15);
    sfxManager.playUlt();
    addScreenShake();
    updateUI();

    // Add ultimate visual effects
    const playerPortrait = document.querySelector(".player-portrait");
    if (playerPortrait) {
      playerPortrait.style.boxShadow = "0 0 30px #00d4ff, 0 0 60px #00d4ff";
      setTimeout(() => {
        playerPortrait.style.boxShadow = "0 0 20px rgba(0, 212, 255, 0.5), inset 0 0 20px rgba(0, 0, 0, 0.3)";
      }, 1000);
    }
  }

  // ---- Pause System ----
  function togglePause() {
    isPaused = !isPaused;
    const pauseBtn = document.getElementById("pauseBtn");

    if (isPaused) {
      pauseBtn.querySelector('span:last-child').textContent = "Resume";
      gameContainer.style.filter = "grayscale(0.5) blur(2px)";
      audioManager.pause();

      const pauseOverlay = document.createElement('div');
      pauseOverlay.id = 'pause-overlay';
      pauseOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 2000;
        color: white;
        font-family: 'Orbitron', monospace;
        backdrop-filter: blur(10px);
      `;
      pauseOverlay.innerHTML = `
        <div style="font-size: 48px; color: #00d4ff; text-shadow: 0 0 20px #00d4ff; margin-bottom: 30px;">🤖 PAUSED 🤖</div>
        <button id="resume-btn" style="
          padding: 15px 30px;
          background: linear-gradient(45deg, #00d4ff, #87ceeb);
          color: white;
          border: none;
          border-radius: 25px;
          font-size: 18px;
          font-family: 'Orbitron', monospace;
          cursor: pointer;
          box-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
          transition: all 0.3s ease;
        ">
          Resume Game
        </button>
      `;
      document.body.appendChild(pauseOverlay);

      const resumeBtn = document.getElementById('resume-btn');
      resumeBtn.addEventListener('click', togglePause);
      resumeBtn.addEventListener('mouseenter', () => {
        resumeBtn.style.transform = 'translateY(-2px)';
        resumeBtn.style.boxShadow = '0 5px 25px rgba(0, 212, 255, 0.7)';
      });
      resumeBtn.addEventListener('mouseleave', () => {
        resumeBtn.style.transform = 'translateY(0)';
        resumeBtn.style.boxShadow = '0 0 20px rgba(0, 212, 255, 0.5)';
      });
    } else {
      pauseBtn.querySelector('span:last-child').textContent = "Pause";
      gameContainer.style.filter = "none";
      audioManager.play();

      const pauseOverlay = document.getElementById('pause-overlay');
      if (pauseOverlay) {
        pauseOverlay.remove();
      }
    }
  }

  // ---- Story System ----
  function showStory(html, clearedStage) {
    const overlay = document.getElementById("storyOverlay");
    const content = document.getElementById("storyContent");
    const btn = document.getElementById("continueBtn");
    const storyTitle = document.getElementById("story-title");

    content.innerHTML = html;
    storyTitle.textContent = `Stage ${clearedStage} Complete!`;
    overlay.classList.remove("hidden");

    if (clearedStage >= MAX_STAGE) {
      btn.innerHTML = '<span>Finish Journey</span><div class="btn-glow"></div>';
    } else {
      btn.innerHTML = '<span>Continue Journey</span><div class="btn-glow"></div>';
    }

    btn.onclick = () => {
      overlay.classList.add("hidden");

      if (clearedStage >= MAX_STAGE) {
        showFinalScreen();
        return;
      }

      stage = clearedStage + 1;
      startStage();
    };
  }

  function showGameOver() {
    const overlay = document.getElementById("storyOverlay");
    const content = document.getElementById("storyContent");
    const btn = document.getElementById("continueBtn");
    const storyTitle = document.getElementById("story-title");

    storyTitle.textContent = "Mission Failed";
    content.innerHTML = `
      <div style="text-align: center;">
        <div style="font-size: 60px; color: #ff6b6b; margin-bottom: 20px;">💥</div>
        <h2>Project Bunny Offline</h2>
        <p>Bronya's systems have been overwhelmed. The logical approach would be to
        analyze the failure and try again with improved tactics.</p>
        <p>Remember: Victory requires both calculation and determination.</p>
      </div>
    `;

    btn.innerHTML = '<span>Retry Mission</span><div class="btn-glow"></div>';
    btn.onclick = () => {
      overlay.classList.add("hidden");
      startStage();
    };

    overlay.classList.remove("hidden");
  }

  function showFinalScreen() {
    const overlay = document.getElementById("storyOverlay");
    const content = document.getElementById("storyContent");
    const btn = document.getElementById("continueBtn");
    const storyTitle = document.getElementById("story-title");

    storyTitle.textContent = "Journey Complete!";
    content.innerHTML = `
      <div style="text-align: center;">
        <div style="font-size: 60px; color: #00d4ff; margin-bottom: 20px;">🤖</div>
        <h2>Congratulations!</h2>
        <p>You have completed Bronya's entire journey from a cold, emotionless soldier
        to the compassionate Herrscher of Reason! Through logic and understanding,
        she learned that true strength comes not from suppressing emotions,
        but from using both heart and mind to protect those she cares about.</p>
        <p>Project Bunny has been upgraded with the power of friendship and determination.
        Bronya's analytical mind, combined with her newfound emotional growth,
        makes her an unstoppable force for good.</p>
        <p>Thank you for experiencing Bronya's Reason Journey!</p>
      </div>
    `;

    btn.innerHTML = '<span>Play Again</span><div class="btn-glow"></div>';
    btn.onclick = () => {
      stage = 1;
      overlay.classList.add("hidden");
      startStage();
    };

    overlay.classList.remove("hidden");
  }

  // ---- Event Listeners ----
  document.getElementById("skipBtn").onclick = () => {
    if (!gameStarted) return;
    gameStarted = false;
    showStory(stageStories[stage], stage);
  };

  document.getElementById("pauseBtn").onclick = togglePause;

  document.getElementById("muteBtn").onclick = () => {
    const muteBtn = document.getElementById("muteBtn");
    const span = muteBtn.querySelector('span');

    audioManager.toggleMute();
    sfxManager.toggleMute();

    span.textContent = audioManager.isMuted ? "🔇" : "🔊";
  };

  // Mobile touch controls
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;

    if (touchX < canvas.width / 2) {
      keys['a'] = true;
    } else {
      keys['d'] = true;
    }
  });

  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    keys['a'] = false;
    keys['d'] = false;
  });

  // Double tap for ultimate on mobile
  let tapCount = 0;
  canvas.addEventListener('click', (e) => {
    tapCount++;
    setTimeout(() => {
      if (tapCount === 2 && !isPaused && ultCount >= 10) {
        activateUltimate();
      }
      tapCount = 0;
    }, 300);
  });

  // ---- Game Initialization ----
  function startStage() {
    loadStageAssets();
    gameStarted = true;
    isPaused = false;
    updatePortraits();
    updateUI();
  }

  function startGame() {
    setupInputHandlers();
    requestAnimationFrame(loop);
  }


  // ---- Performance Optimization ----
  function optimizePerformance() {
    if (navigator.hardwareConcurrency < 4) {
      document.body.classList.add('low-performance');
    }
  }

  // Handle window focus/blur for auto-pause
  window.addEventListener("blur", () => {
    if (gameStarted && !isPaused) {
      togglePause();
    }
  });

  // Prevent context menu
  document.addEventListener("contextmenu", (e) => e.preventDefault());

  // Initialize
  audioManager.init();
  sfxManager.init();
  optimizePerformance();
  startGame();
  startStage();

  // Debug exposure
  window._bronya = {
    loadStageAssets,
    showStory,
    getState: () => ({ stage, gameStarted, assetsReady, isPaused })
  };
});
