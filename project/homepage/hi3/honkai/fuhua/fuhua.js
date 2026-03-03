document.addEventListener("DOMContentLoaded", () => {
    console.log("🔥 Fu Hua - Phoenix Warrior Starting...");

    // ---- DOM Elements ----
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    const loadingScreen = document.getElementById("loadingScreen");
    const gameContainer = document.getElementById("gameContainer");
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
          this.bgm = new Audio("fuhua-images/background-music.mp3");
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
          // do nothing yet
      },

      playUlt() {
          if (this.isMuted) return;

          const sfx = new Audio("fuhua-images/ult.mp3");
          sfx.volume = 0.7;
          sfx.play().catch(() => { });
      },


    toggleMute() {
      this.isMuted = !this.isMuted;
    }
  };

    // Modal elements
    const storyModal = document.getElementById("storyModal");
    const storyText = document.getElementById("storyText");
    const storyTitle = document.getElementById("storyTitle");
    const btnNext = document.getElementById("btnNext");

    // UI elements
    const enemyName = document.getElementById("enemyName");
    const enemyTitle = document.getElementById("enemyTitle");
    const stageNumber = document.getElementById("stageNumber");
    const stageName = document.getElementById("stageName");

    // Control buttons
    const btnSkip = document.getElementById("skipBtn");
    const pauseBtn = document.getElementById("pauseBtn");

    // ---- Game Constants ----
    const MAX_HP = 80;
    const MAX_ENERGY = 100;
    const CANVAS_WIDTH = 1000;
    const CANVAS_HEIGHT = 700;

    // ---- Enhanced Stage Data with Custom Assets ----
    const stages = [
        {
            name: "Awakening",
            enemyName: "Shadow of Doubt",
            enemyTitle: "Inner Demon",
            bg: "fuhua-images/bg1.jpg",
            playerImg: "fuhua-images/player1.png",
            enemyImg: "fuhua-images/enemy1.png",
            story: "Fu Hua awakens in the depths of her consciousness, facing the shadows of her forgotten past. As the Phoenix Immortal, she must confront the doubts that have accumulated over millennia of existence. Her first trial begins with understanding the weight of immortality and the burden of protecting humanity across countless eras."
        },
        {
            name: "Memories Lost",
            enemyName: "Forgotten Self",
            enemyTitle: "Past Echo",
            bg: "fuhua-images/bg2.jpg",
            playerImg: "fuhua-images/player2.png",
            enemyImg: "fuhua-images/enemy2.png",
            story: "Deep within the Elysian Realm, Fu Hua encounters fragments of her lost memories. Each battle against her former self reveals pieces of who she once was - a guardian, a teacher, a friend. The pain of forgotten bonds weighs heavily as she struggles to reconcile her duty with her humanity."
        },
        {
            name: "The Herrscher Within",
            enemyName: "Herrscher of Sentience",
            enemyTitle: "False Phoenix",
            bg: "fuhua-images/bg3.jpg",
            playerImg: "fuhua-images/player3.png",
            enemyImg: "fuhua-images/enemy3.png",
            story: "The Herrscher of Sentience emerges, wearing Fu Hua's face but twisted with malice and chaos. This false phoenix seeks to corrupt everything Fu Hua stands for. In this battle of wills, Fu Hua must prove that her resolve and compassion are stronger than the Herrscher's desire for destruction."
        },
        {
            name: "Bonds Unbroken",
            enemyName: "Kiana's Despair",
            enemyTitle: "Student's Shadow",
            bg: "fuhua-images/bg4.jpg",
            playerImg: "fuhua-images/player4.png",
            enemyImg: "fuhua-images/enemy4.png",
            story: "Fu Hua faces the manifestation of Kiana's despair and self-doubt. As a mentor, she must guide her student through the darkness, showing that even in the face of becoming a Herrscher, there is always hope. This battle tests not her strength, but her ability to inspire and protect those she cares about."
        },
        {
            name: "Azure Empyrea",
            enemyName: "Ancient Honkai",
            enemyTitle: "Primordial Beast",
            bg: "fuhua-images/bg5.jpg",
            playerImg: "fuhua-images/player5.png",
            enemyImg: "fuhua-images/enemy5.png",
            story: "Transforming into Azure Empyrea, Fu Hua confronts an ancient Honkai beast from the Previous Era. This creature represents the endless cycle of destruction that has plagued humanity for millennia. With her newfound power and clarity of purpose, she must break this cycle once and for all."
        },
        {
            name: "The Final Lesson",
            enemyName: "Kevin Kaslana",
            enemyTitle: "Savior of Steel",
            bg: "fuhua-images/bg6.jpg",
            playerImg: "fuhua-images/player6.png",
            enemyImg: "fuhua-images/enemy6.png",
            story: "In her ultimate trial, Fu Hua faces Kevin Kaslana, her old comrade from the Previous Era. Their battle is not one of hatred, but of conflicting ideologies about how to save humanity. Kevin's cold pragmatism clashes with Fu Hua's belief in human potential and the power of hope."
        },
        {
            name: "Phoenix Reborn",
            enemyName: "The Honkai Will",
            enemyTitle: "World's End",
            bg: "fuhua-images/bg7.jpg",
            playerImg: "fuhua-images/player7.png",
            enemyImg: "fuhua-images/enemy7.png",
            story: "In the climactic battle, Fu Hua confronts the very will of the Honkai itself. This is the source of all suffering, the force that has driven countless civilizations to extinction. As the Phoenix Immortal, she carries the hopes and dreams of all who came before, ready to forge a new future for humanity."
        },
        {
            name: "Eternal Guardian",
            enemyName: "Destiny's Shadow",
            enemyTitle: "Final Trial",
            bg: "fuhua-images/bg8.jpg",
            playerImg: "fuhua-images/player8.png",
            enemyImg: "fuhua-images/enemy8.png",
            story: "Having overcome all trials, Fu Hua faces her final test - accepting her role as humanity's eternal guardian. This battle against destiny itself determines whether she will continue to watch over humanity from the shadows, or step forward as their guiding light into a new era of hope and prosperity."
        }
    ];

    const totalStages = stages.length;

    // ---- Asset Management ----
    let currentBgImg = new Image();
    let currentPlayerImg = new Image();
    let currentEnemyImg = new Image();
    let assetsLoaded = false;

    // ---- Game State ----
    let stage = 1;
    let gameStarted = false;
    let isPaused = false;
    let gameLoopRunning = false;

    // ---- Game Objects ----
    let player = null;
    let enemy = null;
    let bullets = [];
    let particles = [];
    let counterEffects = [];
    let ultimateEffects = [];
    let screenShake = 0;

    // ---- Input System ----
    const keys = {};
    let lastTime = 0;

    document.addEventListener("keydown", (e) => {
        keys[e.code] = true;

        if (!gameStarted || isPaused) return;

        // Counter attack
        if (e.code === "Space" && player && player.counterCooldown <= 0) {
            activateCounter();
        }

        // Ultimate attack
        if ((e.code === "KeyU" || e.code === "ShiftLeft" || e.code === "ShiftRight") &&
            player && player.energy >= MAX_ENERGY) {
            activateUltimate();
        }

        // Pause
        if (e.code === "KeyP" || e.code === "Escape") {
            togglePause();
        }

    });

    document.addEventListener("keyup", (e) => {
        keys[e.code] = false;
    });

    // ---- Asset Loading System ----
    function loadStageAssets(stageIndex, callback) {
        const stageData = stages[stageIndex - 1];
        if (!stageData) {
            console.error(`Stage ${stageIndex} not found!`);
            callback(false);
            return;
        }

        console.log(`Loading assets for stage ${stageIndex}: ${stageData.name}`);

        let loadedCount = 0;
        let totalAssets = 3; // bg, player, enemy
        let hasError = false;

        function assetLoaded() {
            loadedCount++;
            updateLoadingProgress(loadedCount, totalAssets);

            if (loadedCount >= totalAssets) {
                if (!hasError) {
                    console.log(`✅ All assets loaded for stage ${stageIndex}`);
                } else {
                    console.warn(`⚠️ Some assets failed to load for stage ${stageIndex}`);
                }
                
                callback(true); // Continue anyway
            }
        }

        function assetError(assetType, src) {
            console.warn(`❌ Failed to load ${assetType}: ${src}`);
            hasError = true;
            assetLoaded();
        }

        // Load background
        currentBgImg = new Image();
        currentBgImg.onload = assetLoaded;
        currentBgImg.onerror = () => assetError('background', stageData.bg);
        currentBgImg.src = stageData.bg;

        // Load player image
        currentPlayerImg = new Image();
        currentPlayerImg.onload = assetLoaded;
        currentPlayerImg.onerror = () => assetError('player', stageData.playerImg);
        currentPlayerImg.src = stageData.playerImg;

        // Load enemy image
        currentEnemyImg = new Image();
        currentEnemyImg.onload = assetLoaded;
        currentEnemyImg.onerror = () => assetError('enemy', stageData.enemyImg);
        currentEnemyImg.src = stageData.enemyImg;
    }

    function updateLoadingProgress(loaded, total) {
        const loadingFill = document.querySelector('.loading-fill');
        const loadingText = document.querySelector('.loading-text');

        if (loadingFill && loadingText) {
            const progress = (loaded / total) * 100;
            loadingFill.style.width = progress + '%';

            const messages = [
                "Loading Phoenix Assets...",
                "Preparing Combat Data...",
                "Initializing Stage Environment...",
                "Ready for Battle!"
            ];

            const messageIndex = Math.min(Math.floor(progress / 25), messages.length - 1);
            loadingText.textContent = messages[messageIndex];
        }
    }

    // ---- Game Initialization ----
    function initializeGame() {
        console.log("Initializing game...");

        // Initialize canvas
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;

        // Load first stage
        loadStageAssets(stage, (success) => {
            if (success) {
                // Create game objects
                createPlayer();
                createEnemy();

                // Update UI
                updateStageDisplay();
                updateUI();

                // Hide loading screen
                setTimeout(() => {
                    loadingScreen.style.opacity = '0';
                    setTimeout(() => {
                        loadingScreen.style.display = 'none';

                        audioManager.init();
                        sfxManager.init();

                        // Start game
                        gameStarted = true;
                        assetsLoaded = true;

                        if (!gameLoopRunning) {
                            gameLoopRunning = true;
                            requestAnimationFrame(gameLoop);
                        }
                    }, 500);
                }, 500);
            } else {
                alert('Failed to load game assets. Please check your file paths.');
            }
        });
    }

    function createPlayer() {
        player = {
            x: CANVAS_WIDTH / 2 - 30,
            y: CANVAS_HEIGHT - 100,
            w: 60,
            h: 80,
            hp: MAX_HP,
            maxHp: MAX_HP,
            energy: 0,
            maxEnergy: MAX_ENERGY,
            speed: 350,
            counterCooldown: 0,
            ultimateCooldown: 0,
            facing: 1,
            animFrame: 0,
            isCountering: false
        };
    }

    function createEnemy() {
        const stageData = stages[stage - 1];
        enemy = {
            x: CANVAS_WIDTH / 2 - 40,
            y: 80,
            w: 80,
            h: 80,
            hp: MAX_HP,
            maxHp: MAX_HP,
            dir: 1,
            shootCooldown: 0,
            moveSpeed: 100 + (stage * 20),
            shootRate: Math.max(30, 80 - (stage * 10)),
            animFrame: 0
        };
    }

    // ---- Enhanced Rendering with Custom Images ----
    function drawBackground() {
        // Draw custom background image
        if (currentBgImg.complete && currentBgImg.naturalWidth > 0) {
            ctx.drawImage(currentBgImg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        } else {
            // Fallback gradient background
            const stageData = stages[stage - 1];
            const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
            gradient.addColorStop(0, "#1a1a2e");
            gradient.addColorStop(1, "#000000");

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        }

        // Add overlay effect
        ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Draw grid pattern overlay
        ctx.strokeStyle = "rgba(255, 107, 53, 0.1)";
        ctx.lineWidth = 1;
        for (let x = 0; x < CANVAS_WIDTH; x += 50) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, CANVAS_HEIGHT);
            ctx.stroke();
        }
        for (let y = 0; y < CANVAS_HEIGHT; y += 50) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(CANVAS_WIDTH, y);
            ctx.stroke();
        }
    }

    function drawPlayer() {
        if (!player) return;

        ctx.save();
        ctx.translate(player.x + player.w / 2, player.y + player.h / 2);

        if (player.facing === -1) {
            ctx.scale(-1, 1);
        }

        // Draw player glow
        if (player.isCountering) {
            const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 50);
            glowGradient.addColorStop(0, "rgba(255, 107, 53, 0.8)");
            glowGradient.addColorStop(1, "rgba(255, 107, 53, 0)");
            ctx.fillStyle = glowGradient;
            ctx.fillRect(-50, -50, 100, 100);
        }

        // Draw custom player image
        if (currentPlayerImg.complete && currentPlayerImg.naturalWidth > 0) {
            ctx.drawImage(currentPlayerImg, -player.w / 2, -player.h / 2, player.w, player.h);
        } else {
            // Fallback rectangle with phoenix symbol
            ctx.fillStyle = "#ff6b35";
            ctx.fillRect(-player.w / 2, -player.h / 2, player.w, player.h);

            ctx.fillStyle = "#ffb366";
            ctx.fillRect(-player.w / 2 + 10, -player.h / 2 + 10, player.w - 20, player.h - 20);

            ctx.fillStyle = "#ffd700";
            ctx.font = "24px Arial";
            ctx.textAlign = "center";
            ctx.fillText("🔥", 0, 8);
        }

        ctx.restore();
    }

    function drawEnemy() {
        if (!enemy) return;

        ctx.save();
        ctx.translate(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2);

        // Draw enemy glow
        const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 60);
        glowGradient.addColorStop(0, "rgba(220, 20, 60, 0.6)");
        glowGradient.addColorStop(1, "rgba(220, 20, 60, 0)");
        ctx.fillStyle = glowGradient;
        ctx.fillRect(-60, -60, 120, 120);

        // Draw custom enemy image
        if (currentEnemyImg.complete && currentEnemyImg.naturalWidth > 0) {
            ctx.drawImage(currentEnemyImg, -enemy.w / 2, -enemy.h / 2, enemy.w, enemy.h);
        } else {
            // Fallback rectangle with enemy symbol
            ctx.fillStyle = "#dc143c";
            ctx.fillRect(-enemy.w / 2, -enemy.h / 2, enemy.w, enemy.h);

            ctx.fillStyle = "#8b0000";
            ctx.fillRect(-enemy.w / 2 + 8, -enemy.h / 2 + 8, enemy.w - 16, enemy.h - 16);

            ctx.fillStyle = "#ffffff";
            ctx.font = "20px Arial";
            ctx.textAlign = "center";
            ctx.fillText("👹", 0, 6);
        }

        ctx.restore();
    }

    // ---- Game Logic (keeping existing functions) ----
    function spawnBullet() {
        if (!enemy) return;

        const jitter = (Math.random() - 0.5) * 60;
        const bullet = {
            x: enemy.x + enemy.w / 2 + jitter,
            y: enemy.y + enemy.h,
            vx: (Math.random() - 0.5) * 50,
            vy: 150 + (stage * 20),
            r: 12 + (stage * 2),
            reflected: false,
            damage: 8 + (stage * 2),
            trail: [],
            color: "#dc143c",
            energy: 15
        };

        bullets.push(bullet);
    }

    function activateCounter() {
        if (!player || player.counterCooldown > 0) return;

        console.log("Counter activated!");
        player.isCountering = true;
        player.counterCooldown = 45;

        // Create counter effect
        counterEffects.push({
            x: player.x + player.w / 2,
            y: player.y + player.h / 2,
            radius: 0,
            maxRadius: 100,
            duration: 20,
            alpha: 1
        });

        // Check for bullets to reflect
        bullets.forEach(bullet => {
            if (!bullet.reflected) {
                const dx = bullet.x - (player.x + player.w / 2);
                const dy = bullet.y - (player.y + player.h / 2);
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 100) {
                    bullet.reflected = true;
                    bullet.vy = -Math.abs(bullet.vy) * 1.5;
                    bullet.vx = dx * 3;
                    bullet.color = "#ff6b35";
                    player.energy = Math.min(MAX_ENERGY, player.energy + 25);

                    // Add reflection particles
                    createParticles(bullet.x, bullet.y, "#ff6b35", 10);

                    // Screen shake
                    screenShake = 8;
                }
            }
        });

        setTimeout(() => {
            if (player) player.isCountering = false;
        }, 300);
    }

    function activateUltimate() {
        if (!player || player.energy < MAX_ENERGY) return;

        console.log("Ultimate activated!");
        player.energy = 0;
        sfxManager.playUlt();

        // Create phoenix burst effect
        ultimateEffects.push({
            x: player.x + player.w / 2,
            y: player.y,
            width: 0,
            maxWidth: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            duration: 45,
            alpha: 1
        });

        // Damage enemy
        if (enemy) {
            enemy.hp = Math.max(0, enemy.hp - 30);
            createParticles(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, "#ff4500", 20);
        }

        // Clear all bullets
        bullets.forEach(bullet => {
            createParticles(bullet.x, bullet.y, "#ffd700", 5);
        });
        bullets = [];

        // Create ultimate particles
        createParticles(player.x + player.w / 2, player.y + player.h / 2, "#ffd700", 30);

        // Screen shake
        screenShake = 15;
    }

    function createParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 200,
                vy: (Math.random() - 0.5) * 200,
                life: 30 + Math.random() * 30,
                maxLife: 60,
                color: color,
                size: Math.random() * 4 + 2,
                alpha: 1
            });
        }
    }

    function togglePause() {
        isPaused = !isPaused;
        const pauseMenu = document.getElementById("pauseMenu");

        if (isPaused) {
            pauseMenu.classList.remove("hidden");
            audioManager.pause();
        } else {
            pauseMenu.classList.add("hidden");
            audioManager.play();
        }
    }

    // ---- Update Logic (keeping existing functions) ----
    function update(dt) {
        if (!gameStarted || isPaused || !player || !enemy) return;

        // Update animations
        player.animFrame += dt * 10;
        enemy.animFrame += dt * 8;

        // Player movement
        const moveSpeed = player.speed * dt;
        if (keys['KeyA'] || keys['ArrowLeft']) {
            player.x -= moveSpeed;
            player.facing = -1;
        }
        if (keys['KeyD'] || keys['ArrowRight']) {
            player.x += moveSpeed;
            player.facing = 1;
        }

        // Clamp player position
        player.x = Math.max(20, Math.min(CANVAS_WIDTH - player.w - 20, player.x));

        // Enemy movement
        enemy.x += enemy.dir * enemy.moveSpeed * dt;
        if (enemy.x <= 20) {
            enemy.x = 20;
            enemy.dir = 1;
        }
        if (enemy.x + enemy.w >= CANVAS_WIDTH - 20) {
            enemy.x = CANVAS_WIDTH - enemy.w - 20;
            enemy.dir = -1;
        }

        // Enemy shooting
        enemy.shootCooldown -= dt * 60;
        if (enemy.shootCooldown <= 0) {
            spawnBullet();
            enemy.shootCooldown = enemy.shootRate + Math.random() * 30;
        }

        // Update cooldowns
        if (player.counterCooldown > 0) player.counterCooldown--;

        // Update bullets
        updateBullets(dt);

        // Update effects
        updateEffects(dt);

        // Update particles
        updateParticles(dt);

        // Update screen shake
        if (screenShake > 0) {
            screenShake = Math.max(0, screenShake - dt * 30);
        }

        // Check win/lose conditions
        checkGameState();

        // Update UI
        updateUI();
    }

    function updateBullets(dt) {
        for (let i = bullets.length - 1; i >= 0; i--) {
            const bullet = bullets[i];

            // Add trail
            bullet.trail.push({ x: bullet.x, y: bullet.y });
            if (bullet.trail.length > 6) bullet.trail.shift();

            // Move bullet
            bullet.x += bullet.vx * dt;
            bullet.y += bullet.vy * dt;

            // Remove bullets that go off screen
            if (bullet.y > CANVAS_HEIGHT + 50 || bullet.y < -50 ||
                bullet.x < -50 || bullet.x > CANVAS_WIDTH + 50) {

                // Damage player if bullet hits bottom
                if (!bullet.reflected && bullet.y > CANVAS_HEIGHT) {
                    player.hp = Math.max(0, player.hp - bullet.damage);
                    createParticles(player.x + player.w / 2, player.y + player.h / 2, "#ff0000", 8);
                    screenShake = 5;
                }

                bullets.splice(i, 1);
                continue;
            }

            // Check collision with enemy (reflected bullets)
            if (bullet.reflected &&
                bullet.x >= enemy.x && bullet.x <= enemy.x + enemy.w &&
                bullet.y >= enemy.y && bullet.y <= enemy.y + enemy.h) {

                enemy.hp = Math.max(0, enemy.hp - bullet.energy);
                createParticles(bullet.x, bullet.y, "#ff6b35", 12);
                bullets.splice(i, 1);
                screenShake = 6;
            }
        }
    }

    function updateEffects(dt) {
        // Update counter effects
        for (let i = counterEffects.length - 1; i >= 0; i--) {
            const effect = counterEffects[i];
            effect.duration--;
            effect.radius = (effect.maxRadius * (1 - effect.duration / 20));
            effect.alpha = effect.duration / 20;

            if (effect.duration <= 0) {
                counterEffects.splice(i, 1);
            }
        }

        // Update ultimate effects
        for (let i = ultimateEffects.length - 1; i >= 0; i--) {
            const effect = ultimateEffects[i];
            effect.duration--;
            effect.width = effect.maxWidth * (1 - effect.duration / 45);
            effect.alpha = Math.sin((effect.duration / 45) * Math.PI);

            if (effect.duration <= 0) {
                ultimateEffects.splice(i, 1);
            }
        }
    }

    function updateParticles(dt) {
        for (let i = particles.length - 1; i >= 0; i--) {
            const particle = particles[i];

            particle.x += particle.vx * dt;
            particle.y += particle.vy * dt;
            particle.life--;
            particle.alpha = particle.life / particle.maxLife;
            particle.size *= 0.98;

            // Apply gravity
            particle.vy += 100 * dt;

            if (particle.life <= 0 || particle.size < 0.5) {
                particles.splice(i, 1);
            }
        }
    }

    function checkGameState() {
        if (enemy.hp <= 0) {
            gameStarted = false;
            setTimeout(() => showStory(), 500);
        }

        if (player.hp <= 0) {
            gameStarted = false;
            setTimeout(() => showGameOver(), 500);
        }
    }

    // ---- Rendering Functions ----
    function render() {
        // Clear canvas
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Apply screen shake
        if (screenShake > 0) {
            const shakeX = (Math.random() - 0.5) * screenShake;
            const shakeY = (Math.random() - 0.5) * screenShake;
            ctx.save();
            ctx.translate(shakeX, shakeY);
        }

        // Draw background
        drawBackground();

        // Draw game objects
        drawBullets();
        drawEffects();
        drawPlayer();
        drawEnemy();
        drawParticles();

        if (screenShake > 0) {
            ctx.restore();
        }
    }

    function drawBullets() {
        bullets.forEach(bullet => {
            // Draw trail
            ctx.strokeStyle = bullet.color + "40";
            ctx.lineWidth = bullet.r;
            ctx.lineCap = "round";
            ctx.beginPath();

            if (bullet.trail.length > 1) {
                ctx.moveTo(bullet.trail[0].x, bullet.trail[0].y);
                for (let i = 1; i < bullet.trail.length; i++) {
                    ctx.lineTo(bullet.trail[i].x, bullet.trail[i].y);
                }
                ctx.stroke();
            }

            // Draw bullet
            const gradient = ctx.createRadialGradient(
                bullet.x, bullet.y, 0,
                bullet.x, bullet.y, bullet.r
            );
            gradient.addColorStop(0, bullet.color);
            gradient.addColorStop(1, bullet.color + "40");

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(bullet.x, bullet.y, bullet.r, 0, Math.PI * 2);
            ctx.fill();

            // Draw bullet core
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(bullet.x, bullet.y, bullet.r * 0.3, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    function drawEffects() {
        // Draw counter effects
        counterEffects.forEach(effect => {
            ctx.save();
            ctx.globalAlpha = effect.alpha;

            const gradient = ctx.createRadialGradient(
                effect.x, effect.y, 0,
                effect.x, effect.y, effect.radius
            );
            gradient.addColorStop(0, "rgba(255, 107, 53, 0.8)");
            gradient.addColorStop(0.7, "rgba(255, 179, 102, 0.4)");
            gradient.addColorStop(1, "rgba(255, 215, 0, 0)");

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
            ctx.stroke();

            ctx.restore();
        });

        // Draw ultimate effects
        ultimateEffects.forEach(effect => {
            ctx.save();
            ctx.globalAlpha = effect.alpha;

            const gradient = ctx.createLinearGradient(
                effect.x - effect.width / 2, 0,
                effect.x + effect.width / 2, 0
            );
            gradient.addColorStop(0, "rgba(255, 215, 0, 0)");
            gradient.addColorStop(0.5, "rgba(255, 107, 53, 0.8)");
            gradient.addColorStop(1, "rgba(255, 215, 0, 0)");

            ctx.fillStyle = gradient;
            ctx.fillRect(
                effect.x - effect.width / 2,
                0,
                effect.width,
                effect.height
            );

            ctx.restore();
        });
    }

    function drawParticles() {
        particles.forEach(particle => {
            ctx.save();
            ctx.globalAlpha = particle.alpha;

            const gradient = ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, particle.size
            );
            gradient.addColorStop(0, particle.color);
            gradient.addColorStop(1, particle.color + "00");

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        });
    }

    // ---- UI Updates ----
    function updateUI() {
        if (!player || !enemy) return;

        // Update health bars
        const playerHPBar = document.getElementById('playerHP');
        const enemyHPBar = document.getElementById('enemyHP');
        const phoenixEnergyBar = document.getElementById('phoenixEnergy');

        const playerHPText = document.getElementById('playerHPText');
        const enemyHPText = document.getElementById('enemyHPText');
        const phoenixEnergyText = document.getElementById('phoenixEnergyText');

        if (playerHPBar) {
            const playerHPPercent = Math.max(0, (player.hp / player.maxHp) * 100);
            playerHPBar.style.width = playerHPPercent + '%';
            if (playerHPText) {
                playerHPText.textContent = `${Math.max(0, Math.floor(player.hp))}/${player.maxHp}`;
            }
        }

        if (enemyHPBar) {
            const enemyHPPercent = Math.max(0, (enemy.hp / enemy.maxHp) * 100);
            enemyHPBar.style.width = enemyHPPercent + '%';
            if (enemyHPText) {
                enemyHPText.textContent = `${Math.max(0, Math.floor(enemy.hp))}/${enemy.maxHp}`;
            }
        }

        if (phoenixEnergyBar) {
            const energyPercent = Math.max(0, Math.min(100, (player.energy / player.maxEnergy) * 100));
            phoenixEnergyBar.style.width = energyPercent + '%';
            if (phoenixEnergyText) {
                phoenixEnergyText.textContent = `${Math.floor(player.energy)}/${player.maxEnergy}`;
            }

            // Add ready effect when energy is full
            const energyContainer = document.querySelector('.phoenix-energy');
            if (energyContainer) {
                if (player.energy >= MAX_ENERGY) {
                    energyContainer.classList.add('energy-ready');
                } else {
                    energyContainer.classList.remove('energy-ready');
                }
            }
        }
    }

    function updateStageDisplay() {
        const stageData = stages[stage - 1];

        if (stageNumber) stageNumber.textContent = `Stage ${stage}`;
        if (stageName) stageName.textContent = stageData.name;
        if (enemyName) enemyName.textContent = stageData.enemyName;
        if (enemyTitle) enemyTitle.textContent = stageData.enemyTitle;

        // Update progress dots
        const dots = document.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
            if (index < stage) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });

        // Update enemy portrait with custom image
        const enemyPortrait = document.getElementById('enemyPortrait');
        if (enemyPortrait && currentEnemyImg.complete && currentEnemyImg.naturalWidth > 0) {
            enemyPortrait.style.backgroundImage = `url(${currentEnemyImg.src})`;
            enemyPortrait.style.backgroundSize = 'cover';
            enemyPortrait.style.backgroundPosition = 'center';
        }
    }

    // ---- Story System ----
    function showStory() {
        const stageData = stages[stage - 1];

        if (storyTitle) storyTitle.textContent = `Stage ${stage} Complete!`;
        if (storyText) storyText.textContent = stageData.story;

        storyModal.classList.remove('hidden');
    }

    function showGameOver() {
        if (storyTitle) storyTitle.textContent = "Phoenix Fallen";
        if (storyText) {
            storyText.textContent = "The phoenix flame flickers and dims. But even in defeat, Fu Hua's spirit burns eternal. From the ashes of failure, she shall rise again, stronger and more determined than before.";
        }

        storyModal.classList.remove('hidden');

        // Change button text for restart
        if (btnNext) {
            btnNext.innerHTML = '<span>Rise from Ashes</span><div class="btn-glow"></div>';
        }
    }

    function nextStage() {
        storyModal.classList.add('hidden');

        if (stage < totalStages) {
            stage++;
            loadNextStage();
        } else {
            showEnding();
        }
    }

    function loadNextStage() {
        // Show loading for next stage
        const loadingOverlay = createLoadingOverlay();
        document.body.appendChild(loadingOverlay);

        loadStageAssets(stage, (success) => {
            if (success) {
                resetStage();
                document.body.removeChild(loadingOverlay);
            } else {
                alert('Failed to load next stage assets.');
                document.body.removeChild(loadingOverlay);
            }
        });
    }

    function createLoadingOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <p>Loading next stage...</p>
            </div>
        `;

        // Add styles
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;

        const content = overlay.querySelector('.loading-content');
        content.style.cssText = `
            text-align: center;
            color: #ff6b35;
            font-size: 18px;
        `;

        const spinner = overlay.querySelector('.loading-spinner');
        spinner.style.cssText = `
            width: 50px;
            height: 50px;
            border: 3px solid rgba(255, 107, 53, 0.3);
            border-top: 3px solid #ff6b35;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        `;

        return overlay;
    }

    function showEnding() {
        if (storyTitle) storyTitle.textContent = "Phoenix Eternal!";
        if (storyText) {
            storyText.textContent = "Fu Hua has completed her ultimate trial, mastering every aspect of her phoenix power. As the eternal guardian of humanity, she stands ready to face any threat that may come. Her legend will burn bright in the hearts of all who seek justice and protection. The Phoenix Immortal's journey continues, forever watching over those she has sworn to protect.";
        }

        if (btnNext) {
            btnNext.innerHTML = '<span>New Legend</span><div class="btn-glow"></div>';
        }

        storyModal.classList.remove('hidden');
    }

    function resetStage() {
        // Reset game state
        bullets = [];
        particles = [];
        counterEffects = [];
        ultimateEffects = [];
        screenShake = 0;

        // Create new entities
        createPlayer();
        createEnemy();

        // Update UI
        updateStageDisplay();
        updateUI();

        // Restart game
        gameStarted = true;
        isPaused = false;

    }

    function restartGame() {
        stage = 1;

        // Load first stage assets
        loadStageAssets(stage, (success) => {
            if (success) {
                resetStage();

                // Hide any open modals
                storyModal.classList.add('hidden');
                document.getElementById('pauseMenu').classList.add('hidden');

                // Reset button text
                if (btnNext) {
                    btnNext.innerHTML = '<span>Continue Journey</span><div class="btn-glow"></div>';
                }
            }
        });
    }

    // ---- Game Loop ----
    function gameLoop(currentTime) {
        if (!lastTime) lastTime = currentTime;
        const deltaTime = Math.min((currentTime - lastTime) / 1000, 1/30);
        lastTime = currentTime;

        update(deltaTime);
        render();

        requestAnimationFrame(gameLoop);
    }

    // ---- Event Listeners ----
    btnNext.addEventListener('click', () => {
        if (player && player.hp <= 0) {
            // Game over - restart
            restartGame();
        } else if (stage >= totalStages) {
            // Ending - restart from beginning
            restartGame();
        } else {
            // Continue to next stage
            nextStage();
        }
    });

    btnSkip.addEventListener('click', () => {
    if (confirm('Are you sure you want to skip this stage?')) {
        // Stop the game
        gameStarted = false;

        // Pretend the boss was defeated
        enemy.hp = 0;

        // Show "Stage Complete!" modal
        showStory();
    }
});


    pauseBtn.addEventListener('click', () => {
        togglePause();
    });

    // Pause menu buttons
    document.getElementById('resumeBtn').addEventListener('click', () => {
        togglePause();
    });

    document.getElementById('restartBtn').addEventListener('click', () => {
        if (confirm('Are you sure you want to restart the game?')) {
            restartGame();
        }
    });

    document.getElementById('mainMenuBtn').addEventListener('click', () => {
        if (confirm('Return to main menu? (This will restart the game)')) {
            restartGame();
        }
    });

    document.getElementById("muteBtn").onclick = () => {
        const muteBtn = document.getElementById("muteBtn");
        const span = muteBtn.querySelector('span');

        audioManager.toggleMute();
        sfxManager.toggleMute();

        span.textContent = audioManager.isMuted ? "🔇" : "🔊";
    };

    // ---- Canvas and Touch Events ----
    canvas.addEventListener('click', (e) => {
        if (!gameStarted || isPaused) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Scale coordinates to canvas size
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const canvasX = x * scaleX;
        const canvasY = y * scaleY;

        // Activate counter if clicking near player
        if (player && canvasY > canvas.height / 2) {
            activateCounter();
        }
        // Activate ultimate if clicking near top
        else if (player && player.energy >= MAX_ENERGY && canvasY < canvas.height / 2) {
            activateUltimate();
        }
    });

    // Touch support for mobile
    let touchStartY = 0;
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        touchStartY = e.touches[0].clientY;
    });

    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        if (!gameStarted || isPaused) return;

        const touchEndY = e.changedTouches[0].clientY;
        const deltaY = touchStartY - touchEndY;

        // Swipe up for ultimate
        if (deltaY > 50 && player && player.energy >= MAX_ENERGY) {
            activateUltimate();
        }
        // Tap for counter
        else if (Math.abs(deltaY) < 30) {
            activateCounter();
        }
    });

    // Window focus/blur handling
    window.addEventListener('blur', () => {
        if (gameStarted && !isPaused) {
            togglePause();
        }
    });

    // Resize handling
    window.addEventListener('resize', () => {
        const container = document.querySelector('.game-container');
        const containerRect = container.getBoundingClientRect();

        // Maintain aspect ratio
        const aspectRatio = CANVAS_WIDTH / CANVAS_HEIGHT;
        let newWidth = containerRect.width * 0.9;
        let newHeight = newWidth / aspectRatio;

        if (newHeight > containerRect.height * 0.9) {
            newHeight = containerRect.height * 0.9;
            newWidth = newHeight * aspectRatio;
        }

        canvas.style.width = newWidth + 'px';
        canvas.style.height = newHeight + 'px';
    });

    // ---- Additional CSS for Loading Overlay ----
    const additionalStyles = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        input[type="range"] {
            width: 100px;
            margin: 0 10px;
        }

        select {
            background: #2a2a3e;
            color: #ff6b35;
            border: 1px solid #ff6b35;
            padding: 5px;
            border-radius: 5px;
        }
    `;

    // Add styles to document
    const styleSheet = document.createElement('style');
    styleSheet.textContent = additionalStyles;
    document.head.appendChild(styleSheet);

    // ---- Debug Functions ----
    if (typeof window !== 'undefined') {
        window.gameDebug = {
            player: () => player,
            enemy: () => enemy,
            bullets: () => bullets,
            particles: () => particles,
            stage: () => stage,
            stages: () => stages,
            currentAssets: () => ({
                bg: currentBgImg.src,
                player: currentPlayerImg.src,
                enemy: currentEnemyImg.src,
            }),
            godMode: () => {
                if (player) {
                    player.hp = player.maxHp;
                    player.energy = player.maxEnergy;
                }
            },
            skipStage: () => {
                if (enemy) enemy.hp = 0;
            },
            loadStage: (stageNum) => {
                if (stageNum >= 1 && stageNum <= totalStages) {
                    stage = stageNum;
                    loadStageAssets(stage, (success) => {
                        if (success) {
                            resetStage();
                        }
                    });
                }
            }
        };
    }

    // ---- Initialize Game ----
    console.log("🔥 Fu Hua - Phoenix Warrior with Custom Assets Initialized");
    console.log(`📁 Make sure your assets are in the 'fuhua-images' folder:`);
    console.log(`   - Background images: bg1.jpg to bg8.jpg`);
    console.log(`   - Player images: player1.png to player8.png`);
    console.log(`   - Enemy images: enemy1.png to enemy8.png`);
    console.log(`   - Music files: background-music.mp3`);

    // Start the game
    initializeGame();
});
