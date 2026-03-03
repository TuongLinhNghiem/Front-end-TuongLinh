document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const loadingScreen = document.getElementById("loading-screen");
  const gameContainer = document.querySelector(".game-container");
  const audioManager = {
    bgm: null,
    hasUserInteracted: false,
    isMuted: false,

    init() {
      const unlockAudio = (e) => {
        // Only SPACE starts the music
        if (e.type === "keydown" && e.code !== "Space") return;

        this.hasUserInteracted = true;

        if (!this.bgm) {
          this.bgm = new Audio("mei-images/background-music.mp3");
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
      this.hit = new Audio("mei-images/hit.mp3");
      this.ult = new Audio("mei-images/ult.mp3");

      this.hit.volume = 0.5;
      this.ult.volume = 0.7;
    },

    playHit() {
      if (this.isMuted) return;
      const sfx = this.hit.cloneNode();
      sfx.play().catch(() => { });
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


  let stage = 1;
  let ultGauge = 0; // 0–100
  let gameStarted = false;
  let ultActive = false;
  let isPaused = false;

  // Show loading screen initially
  showLoadingScreen();

  // ---- images ----
  const bgImg = new Image();
  const playerImg = new Image();
  const enemyImg = new Image();
  let playerSwordImg = new Image();
  let enemySwordImg = new Image();

  function showLoadingScreen() {
    loadingScreen.style.display = 'flex';
    setTimeout(() => {
      hideLoadingScreen();
    }, 3000);
  }

  function hideLoadingScreen() {
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
      loadingScreen.style.display = 'none';
      initializeGame();
    }, 1000);
  }

  function initializeGame() {
    audioManager.init();
    sfxManager.init();
    loadStageAssets();
    startStage();
    updatePortraits();
  }

  function loadStageAssets() {
    bgImg.src = `mei-images/bg${stage}.jpg`;
    playerImg.src = `mei-images/player${stage}.png`;
    enemyImg.src = `mei-images/enemy${stage}.png`;

    // Update background
    gameContainer.style.backgroundImage = `url(mei-images/bg${stage}.jpg)`;

    // player sword theo stage
    if (stage <= 2) playerSwordImg.src = "mei-images/sword1.png";
    else if (stage <= 8) playerSwordImg.src = "mei-images/sword2.png";
    else playerSwordImg.src = "mei-images/sword3.png";

    // enemy sword theo stage
    enemySwordImg.src = `mei-images/enemy-sword${stage}.png`;

    // Update stage title
    const stageTitle = document.getElementById("stage-title");
    stageTitle.textContent = `Stage ${stage}: ${getStageTitle(stage)}`;
  }

  function getStageTitle(stageNum) {
    const titles = {
      1: "Childhood",
      2: "Battle with the Herrscher of the Void",
      3: "Clash with Durandal",
      4: "Herrscher of Thunder",
      5: "Kalpas, the Raging Flame",
      6: "Aponia, the Chains of Fate",
      7: "Herrscher of Corruption",
      8: "Elysia, the Heart of Humanity",
      9: "Reunion and the Fight with Kevin",
      10: "Herrscher of Origin"
    };
    return titles[stageNum] || "Unknown Stage";
  }

  function updatePortraits() {
    const playerPortrait = document.querySelector(".player-portrait");
    const enemyPortrait = document.querySelector(".enemy-portrait");

    if (playerPortrait) {
      playerPortrait.style.backgroundImage = `url(mei-images/player${stage}.png)`;
    }
    if (enemyPortrait) {
      enemyPortrait.style.backgroundImage = `url(mei-images/enemy${stage}.png)`;
    }
  }

  const MAX_STAGE = 10;

  const stageStories = {
    1: `<h2>Stage 1 - Childhood</h2>
      <p>Raiden Mei was born into a wealthy family and raised to be the perfect lady.
      Yet behind the glitter was loneliness and discrimination from friends. Everything changed when she met Kiana,
      a goofy girl bursting with life. Kiana's smile chased away the darkness in Mei's heart
      and began a deep, sacred friendship.</p>`,

    2: `<h2>Stage 2 - Battle with the Herrscher of the Void</h2>
      <p>When the Herrscher of the Void appeared, Mei, Kiana, Bronya, and Himeko plunged into a brutal fight.
      Their strength was not enough. Kiana vanished into the Herrscher's vortex of power.
      Himeko, the mentor Mei admired, sacrificed herself to protect her students.
      Mei could only watch helplessly as everything fell apart.</p>`,

    3: `<h2>Stage 3 - Clash with Durandal</h2>
      <p>Searching for Kiana, Mei faced Schicksal's strongest Valkyrie: Durandal.
      The uneven battle ended with Mei's defeat. Right before her eyes, Kiana was taken away again,
      this time by Durandal. Mei's heart grew heavier with pain and powerlessness.</p>`,

    4: `<h2>Stage 4 - Becoming Herrscher of Thunder</h2>
      <p>After countless struggles, Mei finally met Kiana again. But Kiana chose to keep fighting,
      even while the Herrscher's sickness ate away at her body. Mei wanted to follow Kevin to find a cure,
      but Kiana stopped her. Torn between love and despair, Mei chose a painful path.
      She awakened as the Herrscher of Thunder and defeated the very friend she longed to protect.</p>`,

    5: `<h2>Stage 5 - Kalpas, the Raging Flame</h2>
      <p>Mei entered the Elysian Realm, the archive of the previous era's Herrschers.
      There she met Kalpas, the embodiment of unrestrained violence and strength.
      Their battle was a lesson about fear: only by facing it could Mei find the power to move forward.</p>`,

    6: `<h2>Stage 6 - Aponia, the Chains of Fate</h2>
      <p>Next, Mei confronted Aponia, who believed every life must obey her "rules."
      Aponia tried to impose her will on Mei, demanding submission. Mei refused.
      In a tense fight, she shattered Aponia's chains and declared: her path would be chosen by herself, not fate.</p>`,

    7: `<h2>Stage 7 - Herrscher of Corruption, Devouring Darkness</h2>
      <p>Deep within the Elysian Realm, Mei faced the Herrscher of Corruption,
      who sought to consume free will and turn all into soulless copies.
      It was a cruel trial that amplified Mei's regrets and weaknesses.
      She endured and affirmed: no one would erase the faith and feelings she vowed to protect.</p>`,

    8: `<h2>Stage 8 - Elysia, the Heart of Humanity</h2>
      <p>At last, Mei stood before Elysia, not merely an enemy but the embodiment of love and belief.
      This was not just a clash of power, but a trial of the heart.
      Elysia wanted Mei to find her true ideal. After their meaningful duel, Mei understood: her strength comes not from despair, but from the desire to protect Kiana and the world.</p>`,

    9: `<h2>Stage 9 - Reunion and the Fight with Kevin</h2>
      <p>Leaving the Elysian Realm, Mei was more resolute than ever.
      She reunited with Kiana, Bronya, and their allies. Together they opposed Kevin,
      who sought to remake the world with Herrscher power.
      The fierce battle proved one thing: when they stand together, no power can defeat them.</p>`,

    10: `<h2>Stage 10 - Herrscher of Origin</h2>
      <p>In the final battle, humanity faced the Herrscher of the End, the threat of absolute annihilation.
      Mei transcended fate and became the Herrscher of Origin,
      the union of thunder and human will. Alongside Kiana, Bronya, and every ally,
      she helped defeat the Herrscher of the End and opened a new era for the world.</p>`
  };

  // ---- entities ----
  let player = {
    x: 100,
    y: canvas.height / 2 - 100,
    w: 200,
    h: 200,
    swordAngle: 0,
    swinging: false,
    swingTimer: 0,
    swingCooldown: 90,
    swingCDLeft: 0,
  };

  let enemy = {
    x: canvas.width - 300,
    y: canvas.height / 2 - 100,
    w: 200,
    h: 200,
    hp: 15,
    maxHp: 15,
    swordAngle: 90,
    swinging: false,
    swingTimer: 0,
    swingCooldown: 180,
    swingCDLeft: 0,
  };

  const keys = {};

  // ---- Enhanced UI Updates ----
  function updateUI() {
    // Update enemy HP bar
    const enemyHPPercent = (enemy.hp / enemy.maxHp) * 100;
    document.getElementById("enemyHP").style.width = enemyHPPercent + "%";

    // Update enemy HP text
    const enemyHPText = document.querySelector(".enemy-health .bar-text");
    if (enemyHPText) {
      enemyHPText.textContent = `${enemy.hp}/${enemy.maxHp}`;
    }

    // Update ult gauge
    const ultPercent = (ultGauge / 100) * 100;
    document.getElementById("ultGauge").style.width = ultPercent + "%";

    // Update ult text
    const ultText = document.querySelector(".player-ult .bar-text");
    if (ultText) {
      ultText.textContent = `${ultGauge}/100`;
    }

    // Add ult ready effect
    const ultContainer = document.querySelector(".player-ult");
    if (ultGauge >= 100) {
      ultContainer.classList.add("ult-ready");
    } else {
      ultContainer.classList.remove("ult-ready");
    }

    // Add portrait glow effects during combat
    const playerPortraitGlow = document.querySelector(".player-portrait .portrait-glow");
    const enemyPortraitGlow = document.querySelector(".enemy-portrait .portrait-glow");

    if (player.swinging && playerPortraitGlow) {
      playerPortraitGlow.style.opacity = '1';
      setTimeout(() => {
        playerPortraitGlow.style.opacity = '0';
      }, 300);
    }

    if (enemy.swinging && enemyPortraitGlow) {
      enemyPortraitGlow.style.opacity = '1';
      setTimeout(() => {
        enemyPortraitGlow.style.opacity = '0';
      }, 300);
    }
  }

  // ---- Screen shake effect ----
  function addScreenShake() {
    gameContainer.classList.add('screen-shake');
    setTimeout(() => {
      gameContainer.classList.remove('screen-shake');
    }, 500);
  }

  // ---- input ----
  document.addEventListener("keydown", (e) => {
    if (isPaused) return;

    keys[e.code] = true;
    if (e.code === "Space" && player.swingCDLeft <= 0 && !ultActive) {
      e.preventDefault();
      startPlayerSwing();
    }
    if (e.code === "KeyK" && !ultActive && ultGauge >= 100) {
      e.preventDefault();
      startPlayerUlt();
    }
    if (e.code === "KeyP") {
      e.preventDefault();
      togglePause();
    }
  });

  document.addEventListener("keyup", (e) => (keys[e.code] = false));

  function startPlayerSwing() {
    player.swinging = true;
    player.swingTimer = 30;
    player.swordAngle = 0;
    player.swingCDLeft = player.swingCooldown;

    sfxManager.playHit();

    // chỉ đánh thường khi enemy KHÔNG swing
    if (!enemy.swinging) {
      let normalDamage = 1;
      enemy.hp -= normalDamage;
      ultGauge = Math.min(100, ultGauge + 25); // 4 hit là đầy
    }

    updateUI();
  }

  function startPlayerUlt() {
    player.swinging = true;
    player.swingTimer = 60;
    player.swordAngle = 0;
    ultGauge = 0; // reset nộ

    sfxManager.playUlt();

    // Gây damage gấp đôi ngay khi kích hoạt
    let normalDamage = 1;
    enemy.hp -= normalDamage * 2;
    addScreenShake();

    // Hiệu ứng
    const playerPortrait = document.querySelector(".player-portrait");
    if (playerPortrait) {
      playerPortrait.style.boxShadow = "0 0 30px #9d4edd, 0 0 60px #9d4edd";
      setTimeout(() => {
        playerPortrait.style.boxShadow =
          "0 0 20px rgba(157, 78, 221, 0.5), inset 0 0 20px rgba(0, 0, 0, 0.3)";
      }, 1000);
    }

    updateUI();
  }

  function startEnemySwing() {
    enemy.swinging = true;
    enemy.swingTimer = 40;
    enemy.swordAngle = 90;
    enemy.swingCDLeft = enemy.swingCooldown;

    updateUI();
  }

  // ---- Pause functionality ----
  function togglePause() {
    isPaused = !isPaused;
    const pauseBtn = document.getElementById("pauseBtn");

    if (isPaused) {
      pauseBtn.querySelector('span').textContent = "Resume";
      gameContainer.style.filter = "grayscale(0.5) blur(2px)";
      audioManager.pause();

      // Create pause overlay
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
        <div style="font-size: 48px; color: #9d4edd; text-shadow: 0 0 20px #9d4edd; margin-bottom: 30px;">⚡ PAUSED ⚡</div>
        <button id="resume-btn" style="
          padding: 15px 30px;
          background: linear-gradient(45deg, #9d4edd, #c77dff);
          color: white;
          border: none;
          border-radius: 25px;
          font-size: 18px;
          font-family: 'Orbitron', monospace;
          cursor: pointer;
          box-shadow: 0 0 20px rgba(157, 78, 221, 0.5);
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
        resumeBtn.style.boxShadow = '0 5px 25px rgba(157, 78, 221, 0.7)';
      });
      resumeBtn.addEventListener('mouseleave', () => {
        resumeBtn.style.transform = 'translateY(0)';
        resumeBtn.style.boxShadow = '0 0 20px rgba(157, 78, 221, 0.5)';
      });
    } else {
      pauseBtn.querySelector('span').textContent = "Pause";
      gameContainer.style.filter = "none";
      audioManager.play();

      const pauseOverlay = document.getElementById('pause-overlay');
      if (pauseOverlay) {
        pauseOverlay.remove();
      }
    }
  }

  // ---- update ----
  function update() {
    if (isPaused) return;

    if (player.swingCDLeft > 0) player.swingCDLeft--;
    if (enemy.swingCDLeft > 0) enemy.swingCDLeft--;

    if (enemy.swingCDLeft <= 0 && !enemy.swinging) {
      startEnemySwing();
    }

    if (player.swinging) {
      if (ultActive) {
        player.swordAngle = (360 * (60 - player.swingTimer)) / 60;
      } else {
        player.swordAngle = (90 * (30 - player.swingTimer)) / 30;
      }
      player.swingTimer--;
      if (player.swingTimer <= 0) {
        player.swinging = false;
        if (ultActive) ultActive = false;
      }
    }

    if (enemy.swinging) {
      enemy.swordAngle = 90 - (90 * (40 - enemy.swingTimer)) / 40;
      enemy.swingTimer--;
      if (enemy.swingTimer <= 0) enemy.swinging = false;
    }
  }

  // ---- render ----
  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

    // draw entities
    ctx.drawImage(playerImg, player.x, player.y, player.w, player.h);
    ctx.drawImage(enemyImg, enemy.x, enemy.y, enemy.w, enemy.h);

    drawSword(player, true);
    drawSword(enemy, false);

    // Add ultimate effects
    if (ultActive) {
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = "#9d4edd";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }
  }

  function drawSword(entity, isPlayer) {
    const size = 400;
    const angle = entity.swordAngle * (Math.PI / 180);
    let sx, sy;

    if (isPlayer) {
      sx = entity.x + entity.w;
      sy = entity.y + entity.h / 2;
    } else {
      sx = entity.x;
      sy = entity.y + entity.h / 2;
    }

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(angle);

    // Add glow effect for ultimate
    if (isPlayer && ultActive) {
      ctx.shadowColor = "#9d4edd";
      ctx.shadowBlur = 20;
    }

    if (isPlayer) ctx.drawImage(playerSwordImg, 0, -40, size, size);
    else ctx.drawImage(enemySwordImg, 0, -40, size, size);
    ctx.restore();
  }

  // ---- loop ----
  function loop() {
    if (!gameStarted) return;
    update();
    render();

    if (enemy.hp <= 0) {
      // Pause immediately so we do NOT increment stage multiple frames
      gameStarted = false;

      // Show the story of the stage that was just cleared
      const clearedStage = stage;
      showStory(stageStories[clearedStage], clearedStage);
      return; // stop this frame; we will resume after Continue
    }

    requestAnimationFrame(loop);
  }

  function showStory(html, clearedStage) {
    const overlay = document.getElementById("storyOverlay");
    const content = document.getElementById("storyContent");
    const btn = document.getElementById("continueBtn");
    const storyTitle = document.getElementById("story-title");

    content.innerHTML = html;
    storyTitle.textContent = `Stage ${clearedStage} Complete!`;
    overlay.classList.remove("hidden");

    // Update button text
    if (clearedStage >= MAX_STAGE) {
      btn.innerHTML = '<span>Finish Journey</span><div class="btn-glow"></div>';
    } else {
      btn.innerHTML = '<span>Continue Journey</span><div class="btn-glow"></div>';
    }

    btn.onclick = () => {
      overlay.classList.add("hidden");

      // If cleared the last stage, finish the game
      if (clearedStage >= MAX_STAGE) {
        showFinalScreen();
        return;
      }

      // Otherwise go to next stage
      stage = clearedStage + 1;
      startStage();
    };
  }

  function showFinalScreen() {
    const overlay = document.getElementById("storyOverlay");
    const content = document.getElementById("storyContent");
    const btn = document.getElementById("continueBtn");
    const storyTitle = document.getElementById("story-title");

    storyTitle.textContent = "Journey Complete!";
    content.innerHTML = `
      <div style="text-align: center;">
        <div style="font-size: 60px; color: #9d4edd; margin-bottom: 20px;">⚡</div>
        <h2>Congratulations!</h2>
        <p>You have completed Mei's entire journey through thunder and lightning!
        From a lonely girl to the Herrscher of Origin, you've witnessed her growth,
        struggles, and ultimate triumph. Her path was filled with pain and sacrifice,
        but through it all, she never lost sight of what truly mattered - protecting
        those she loves and fighting for humanity's future.</p>
        <p>Thank you for experiencing Mei's Thunder Journey!</p>
      </div>
    `;

    btn.innerHTML = '<span>Play Again</span><div class="btn-glow"></div>';
    btn.onclick = () => {
      // Reset game
      stage = 1;
      enemy.hp = 15;
      ultGauge = 0;
      overlay.classList.add("hidden");
      startStage();
    };

    overlay.classList.remove("hidden");
  }

  // ---- Event Listeners ----
  document.getElementById("skipBtn").onclick = () => {
    if (!gameStarted) return;

    // Pause game
    gameStarted = false;

    // Show story of current stage
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
    if (!isPaused && player.swingCDLeft <= 0 && !ultActive) {
      startPlayerSwing();
    }
  });

  // Double tap for ultimate on mobile
  let tapCount = 0;
  canvas.addEventListener('click', (e) => {
    tapCount++;
    setTimeout(() => {
      if (tapCount === 2 && !isPaused && ultGauge >= 100) {
        startPlayerUlt();
      }
      tapCount = 0;
    }, 300);
  });

  function startStage() {
    loadStageAssets();
    enemy.hp = 15;
    enemy.maxHp = 15;
    ultGauge = 0;
    gameStarted = true;
    isPaused = false;
    updateUI();
    updatePortraits();
    requestAnimationFrame(loop);
  }

  // ---- Performance optimization ----
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

  // Initialize performance optimization
  optimizePerformance();
});
