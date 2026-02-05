document.addEventListener("DOMContentLoaded", () => {
    console.log("⚔️ Durandal - Strongest Valkyrie Starting...");

    // ===== DOM ELEMENTS =====
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    const loadingScreen = document.getElementById("loadingScreen");
    const gameContainer = document.getElementById("gameContainer");

    // Modal elements
    const storyModal = document.getElementById("storyModal");
    const storyText = document.getElementById("storyText");
    const storyTitle = document.getElementById("storyTitle");
    const nextStageBtn = document.getElementById("nextStageBtn");
    const storyPortrait = document.getElementById("storyPortrait");

    // UI elements
    const stageNumber = document.getElementById("stageNumber");
    const stageName = document.getElementById("stageName");
    const scoreValue = document.getElementById("scoreValue");
    const throwsValue = document.getElementById("throwsValue");

    // Control buttons
    const skipBtn = document.getElementById("skipBtn");
    const pauseBtn = document.getElementById("pauseBtn");
    const muteBtn = document.getElementById('muteBtn');

    muteBtn.addEventListener('click', () => {
        audioManager.toggleMute();
        muteBtn.textContent = audioManager.isMuted ? '🔇' : '🔊';
    });

    const victoryEffects = document.getElementById("victoryEffects");

    // ===== GAME CONSTANTS =====
    const CANVAS_WIDTH = 2500;
    const CANVAS_HEIGHT = 800;
    const PLAYER_WIDTH = 100;
    const PLAYER_HEIGHT = 100;
    const ENEMY_WIDTH = 100;
    const ENEMY_HEIGHT = 100;
    const DART_WIDTH = 70;
    const DART_HEIGHT = 90;

    // ===== GAME STATE =====
    let gameState = {
        stage: 1,
        score: 0,
        throwsLeft: 10,
        gameRunning: false,
        isPaused: false,
        gameStarted: false,
        assetsLoaded: false,
        isLoadingStage: false
    };

    let gameObjects = {
        player: {
            x: 0,
            y: 0,
            width: PLAYER_WIDTH,
            height: PLAYER_HEIGHT
        },
        darts: [],
        enemies: []
    };

    // ===== ASSETS =====
    let assets = {
        playerImg: new Image(),
        dartImg: new Image(),
        bgImg: new Image(),
        enemyImg: new Image(),
    };

    // ===== STAGE DATA =====
    const stageData = {
        names: [
            "",
            "Child of Schicksal",
            "Descent into the Bubble",
            "Trial of Rita",
            "Void's Shadow",
            "Awakening in the Imaginary",
            "Duel with Raiden Mei",
            "Kaslana Sisters vs Otto",
            "Final Spear Against Kevin"
        ],
        stories: [
            "",
            "Stage 1 — Child of Schicksal\n\nRaised as a prodigy, Durandal quickly became Schicksal's strongest Valkyrie, cutting down Honkai beasts and traitors alike with unmatched discipline and mastery of stigmata resonance.",
            "Stage 2 — Descent into the Bubble\n\nCast into a collapsing Bubble Universe, Durandal adapted to distorted laws of reality, fighting twisted echoes and learning to exploit unstable dimensions for survival.",
            "Stage 3 — Trial of Rita\n\nFacing a false image of her closest ally, Rita, she proved her loyalty and resolve unshaken, developing counter-resonance techniques to outmaneuver mirrored tactics.",
            "Stage 4 — Void's Shadow\n\nWhen confronted by an echo of the Herrscher of the Void, Durandal pushed her stigmata resonance to new limits, shattering spatial distortions with precise, Imaginary-infused strikes.",
            "Stage 5 — Awakening in the Imaginary\n\nThrough trials in the Bubble, Durandal awakened new resonance with her stigmata, mastering Imaginary energy manipulation and emerging stronger than Otto's design ever intended.",
            "Stage 6 — Duel with Raiden Mei\n\nReturning to reality, she fought Raiden Mei at full Herrscher strength, clashing thunder against spear and proving she could stand toe-to-toe with powers once thought untouchable.",
            "Stage 7 — Kaslana Sisters vs Otto\n\nIn the clash between Otto and the Kaslanas, Durandal turned her spear against her own Overseer, tearing through his alchemical tricks and rejecting the blind loyalty that bound her.",
            "Stage 8 — Final Spear Against Kevin\n\nAt the end, she faced Kevin Kaslana, the fusion warrior of Fire Moth, matching his overwhelming might with her perfected resonance and standing as humanity's unbreakable spear."
        ],
        enemySpeeds: [2, 4, 6]
    };

    // ===== INITIALIZATION =====
    function initializeGame() {
        console.log("🎮 Initializing game...");

        setupCanvas();
        audioManager.init();

        // Load first stage assets
        loadStageAssets(1, (success) => {
            if (success) {
                hideLoadingScreen();
                setupInitialStage();
                startGameLoop();
            } else {
                showError("Failed to load game assets");
            }
        });
    }

    function setupCanvas() {
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
    }

    function resizeCanvas() {
        const containerRect = gameContainer.getBoundingClientRect();
        const hudHeight = 160;
        const availableHeight = Math.max(100, containerRect.height - hudHeight);
        const availableWidth = Math.max(300, containerRect.width);

        const aspectRatio = CANVAS_WIDTH / CANVAS_HEIGHT;
        let displayWidth = Math.floor(availableWidth * 0.95);
        let displayHeight = Math.floor(displayWidth / aspectRatio);

        if (displayHeight > availableHeight) {
            displayHeight = Math.floor(availableHeight);
            displayWidth = Math.floor(displayHeight * aspectRatio);
        }

        canvas.style.width = displayWidth + 'px';
        canvas.style.height = displayHeight + 'px';
    }

    // ===== AUDIO MANAGER =====
    const audioManager = {
        backgroundMusic: null,
        isMuted: false,
        hasUserInteracted: false,

        init() {
            const unlockAudio = (e) => {
                // ONLY Space starts music
                if (e.type === 'keydown' && e.code !== 'Space') return;

                this.hasUserInteracted = true;

                if (!this.backgroundMusic) {
                    this.backgroundMusic = new Audio('dudu-images/background-music.mp3');
                    this.backgroundMusic.loop = true;
                    this.backgroundMusic.volume = 0.3;
                    this.backgroundMusic.muted = this.isMuted;
                }

                this.play();

                document.removeEventListener('keydown', unlockAudio);
            };

            document.addEventListener('keydown', unlockAudio);
        },

        play() {
            if (!this.backgroundMusic || !this.hasUserInteracted) return;

            this.backgroundMusic
                .play()
                .catch(e => console.log('Audio play blocked:', e));
        },

        pause() {
            if (this.backgroundMusic) {
                this.backgroundMusic.pause();
            }
        },

        stop() {
            if (this.backgroundMusic) {
                this.backgroundMusic.pause();
                this.backgroundMusic.currentTime = 0;
            }
        },

        toggleMute() {
            this.isMuted = !this.isMuted;
            if (this.backgroundMusic) {
                this.backgroundMusic.muted = this.isMuted;
            }
        }
    };

    // ===== ASSET LOADING =====
    function loadStageAssets(stageNum, callback) {
        console.log(`📦 Loading assets for stage ${stageNum}`);

        let loadedCount = 0;
        const totalAssets = 4;
        let hasError = false;

        function onAssetLoaded() {
            loadedCount++;
            updateLoadingProgress(loadedCount, totalAssets);

            if (loadedCount >= totalAssets) {
                gameState.assetsLoaded = true;
                console.log(`✅ Stage ${stageNum} assets loaded`);
                callback(!hasError);
            }
        }

        function onAssetError(assetType) {
            console.warn(`❌ Failed to load ${assetType} for stage ${stageNum}`);
            hasError = true;
            onAssetLoaded();
        }

        // Load player image
        assets.playerImg = new Image();
        assets.playerImg.onload = onAssetLoaded;
        assets.playerImg.onerror = () => onAssetError('player');
        assets.playerImg.src = `dudu-images/dudu${stageNum}/player.png`;

        // Load dart image
        assets.dartImg = new Image();
        assets.dartImg.onload = onAssetLoaded;
        assets.dartImg.onerror = () => onAssetError('dart');
        assets.dartImg.src = `dudu-images/dudu${stageNum}/dart.png`;

        // Load enemy image
        assets.enemyImg = new Image();
        assets.enemyImg.onload = onAssetLoaded;
        assets.enemyImg.onerror = () => onAssetError('enemy');
        assets.enemyImg.src = `dudu-images/dudu${stageNum}/enemy.png`;

        // Load background image
        assets.bgImg = new Image();
        assets.bgImg.onload = onAssetLoaded;
        assets.bgImg.onerror = () => onAssetError('background');
        assets.bgImg.src = `dudu-images/dudu${stageNum}/bg.jpg`;
    }

    function updateLoadingProgress(loaded, total) {
        const percentage = (loaded / total) * 100;
        const loadingFill = document.querySelector('.loading-fill');
        const loadingText = document.querySelector('.loading-text');

        if (loadingFill) {
            loadingFill.style.width = percentage + '%';
        }

        if (loadingText) {
            const messages = [
                "Preparing Abyss Flower...",
                "Loading Stigmata Data...",
                "Initializing Bubble Universe...",
                "Calibrating Spear Trajectory...",
                "Ready for Battle!"
            ];
            const messageIndex = Math.min(Math.floor(loaded), messages.length - 1);
            loadingText.textContent = messages[messageIndex];
        }
    }

    function hideLoadingScreen() {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            gameContainer.style.display = 'flex';
        }, 500);
    }

    function showError(message) {
        console.error(message);
        alert(message + ". Please check if the dudu-images folder exists.");
    }

    // ===== STAGE MANAGEMENT =====
    function setupInitialStage() {
        gameState.stage = 1;
        loadStage(gameState.stage);
        gameState.gameStarted = true;
        console.log("🚀 Game ready!");
    }

    function loadStage(stageNum) {
        if (gameState.isLoadingStage) {
            console.log("⚠️ Already loading stage, skipping...");
            return;
        }

        gameState.isLoadingStage = true;
        console.log(`📍 Loading stage ${stageNum}`);

        // Reset game state
        resetGameState();
        gameState.stage = stageNum;

        // Setup player position
        setupPlayer();

        // Create enemies for this stage
        createEnemies();

        // Update UI
        updateStageDisplay();
        updateUI();

        gameState.isLoadingStage = false;
        console.log(`✅ Stage ${stageNum} loaded with ${gameObjects.enemies.length} enemies`);
    }

    function resetGameState() {
        gameObjects.darts = [];
        gameObjects.enemies = [];
        gameState.score = 0;
        gameState.throwsLeft = 10;
        gameState.gameRunning = true;
        gameState.isPaused = false;
    }

    function setupPlayer() {
        gameObjects.player.x = CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2;
        gameObjects.player.y = CANVAS_HEIGHT - PLAYER_HEIGHT - 20;
    }

    function createEnemies() {
        console.log("🔧 Creating enemies...");
        gameObjects.enemies = [];

        // Bottom row - 5 enemies (1 point each)
        for (let i = 0; i < 5; i++) {
            gameObjects.enemies.push({
                x: i * (ENEMY_WIDTH + 20) + 50,
                y: CANVAS_HEIGHT * 0.35,
                width: ENEMY_WIDTH,
                height: ENEMY_HEIGHT,
                row: 0,
                points: 1,
                speed: stageData.enemySpeeds[0]
            });
        }

        // Middle row - 3 enemies (2 points each)
        for (let i = 0; i < 3; i++) {
            gameObjects.enemies.push({
                x: i * (ENEMY_WIDTH + 40) + 100,
                y: CANVAS_HEIGHT * 0.2,
                width: ENEMY_WIDTH,
                height: ENEMY_HEIGHT,
                row: 1,
                points: 2,
                speed: stageData.enemySpeeds[1]
            });
        }

        // Top row - 1 enemy (3 points)
        gameObjects.enemies.push({
            x: CANVAS_WIDTH / 2 - ENEMY_WIDTH / 2,
            y: CANVAS_HEIGHT * 0.08,
            width: ENEMY_WIDTH,
            height: ENEMY_HEIGHT,
            row: 2,
            points: 3,
            speed: stageData.enemySpeeds[2]
        });

        console.log(`✅ Created ${gameObjects.enemies.length} enemies`);
    }

    // ===== GAME LOOP =====
    let lastTime = 0;

    function startGameLoop() {
        gameLoop();
    }

    function gameLoop(currentTime = 0) {
        if (!lastTime) lastTime = currentTime;
        const deltaTime = Math.min((currentTime - lastTime) / 1000, 1/30);
        lastTime = currentTime;

        update(deltaTime);
        render();

        requestAnimationFrame(gameLoop);
    }

    // ===== UPDATE LOGIC =====
    function update(deltaTime) {
        if (!gameState.gameRunning || gameState.isPaused) return;

        updateDarts(deltaTime);
        updateEnemies(deltaTime);
        checkCollisions();
        checkWinLoseConditions();
    }

    function updateDarts(deltaTime) {
        // Move darts up
        gameObjects.darts.forEach(dart => {
            dart.y -= 400 * deltaTime;
        });

        // Remove off-screen darts
        gameObjects.darts = gameObjects.darts.filter(dart => dart.y + dart.height > 0);
    }

    function updateEnemies(deltaTime) {
        gameObjects.enemies.forEach(enemy => {
            enemy.x += enemy.speed * 60 * deltaTime;

            // Bounce off walls
            if (enemy.x + enemy.width > CANVAS_WIDTH || enemy.x < 0) {
                enemy.speed *= -1;
            }
        });
    }

    function checkCollisions() {
        for (let di = gameObjects.darts.length - 1; di >= 0; di--) {
            const dart = gameObjects.darts[di];

            for (let ei = gameObjects.enemies.length - 1; ei >= 0; ei--) {
                const enemy = gameObjects.enemies[ei];

                if (isColliding(dart, enemy)) {
                    // Hit detected
                    gameState.score += enemy.points;
                    gameObjects.darts.splice(di, 1);
                    gameObjects.enemies.splice(ei, 1);

                    updateUI();
                    createHitEffect(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                    break;
                }
            }
        }
    }

    function isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    function checkWinLoseConditions() {
        if (gameState.score >= 10 || gameObjects.enemies.length === 0) {
            // Victory
            gameState.gameRunning = false;
            showVictoryEffect();
            setTimeout(() => showStory(), 1000);
        } else if (gameState.throwsLeft <= 0) {
            // Game over
            gameState.gameRunning = false;
            showGameOver();
        }
    }

    // ===== RENDERING =====
    function render() {
        clearCanvas();
        drawBackground();
        drawPlayer();
        drawDarts();
        drawEnemies();
        drawOverlay();
    }

    function clearCanvas() {
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    function drawBackground() {
        if (assets.bgImg.complete && assets.bgImg.naturalWidth > 0) {
            ctx.drawImage(assets.bgImg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        } else {
            // Fallback gradient
            const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
            gradient.addColorStop(0, '#1a1a2e');
            gradient.addColorStop(1, '#16213e');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        }
    }

    function drawPlayer() {
        const player = gameObjects.player;

        if (assets.playerImg.complete && assets.playerImg.naturalWidth > 0) {
            ctx.drawImage(assets.playerImg, player.x, player.y, player.width, player.height);
        } else {
            // Fallback rectangle
            ctx.fillStyle = '#4a9eff';
            ctx.fillRect(player.x, player.y, player.width, player.height);
        }

        // Add glow effect
        ctx.shadowColor = '#4a9eff';
        ctx.shadowBlur = 10;
        ctx.strokeStyle = 'rgba(74, 158, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.strokeRect(player.x, player.y, player.width, player.height);
        ctx.shadowBlur = 0;
    }

    function drawDarts() {
        gameObjects.darts.forEach(dart => {
            if (assets.dartImg.complete && assets.dartImg.naturalWidth > 0) {
                ctx.drawImage(assets.dartImg, dart.x, dart.y, dart.width, dart.height);
            } else {
                ctx.fillStyle = '#87ceeb';
                ctx.fillRect(dart.x, dart.y, dart.width, dart.height);
            }

            // Add trail effect
            ctx.shadowColor = '#87ceeb';
            ctx.shadowBlur = 5;
            ctx.fillStyle = 'rgba(135, 206, 235, 0.7)';
            ctx.fillRect(dart.x + 5, dart.y + dart.height, dart.width - 10, 20);
            ctx.shadowBlur = 0;
        });
    }

    function drawEnemies() {
        gameObjects.enemies.forEach(enemy => {
            ctx.save();

            if (assets.enemyImg.complete && assets.enemyImg.naturalWidth > 0) {
                ctx.drawImage(assets.enemyImg, enemy.x, enemy.y, enemy.width, enemy.height);
            } else {
                const colors = ['#ff6b6b', '#ffa500', '#ff1493'];
                ctx.fillStyle = colors[enemy.row] || '#ff6b6b';
                ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            }

            // Add glow and points
            ctx.shadowColor = '#ff6b6b';
            ctx.shadowBlur = 8;
            ctx.strokeStyle = 'rgba(255, 107, 107, 0.6)';
            ctx.lineWidth = 1;
            ctx.strokeRect(enemy.x, enemy.y, enemy.width, enemy.height);

            ctx.shadowBlur = 0;
            ctx.fillStyle = 'white';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(enemy.points.toString(),
                enemy.x + enemy.width / 2,
                enemy.y + enemy.height / 2 + 6
            );

            ctx.restore();
        });
    }

    function drawOverlay() {
        // Draw targeting line
        if (gameState.gameRunning && !gameState.isPaused) {
            const player = gameObjects.player;
            ctx.strokeStyle = 'rgba(74, 158, 255, 0.3)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(player.x + player.width / 2, player.y);
            ctx.lineTo(player.x + player.width / 2, 0);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Draw pause overlay
        if (gameState.isPaused) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            ctx.fillStyle = '#4a9eff';
            ctx.font = 'bold 48px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        }
    }

    // ===== GAME ACTIONS =====
    function throwDart() {
        if (!gameState.gameRunning || gameState.isPaused || gameState.throwsLeft <= 0) return;

        const player = gameObjects.player;
        gameObjects.darts.push({
            x: player.x + player.width / 2 - DART_WIDTH / 2,
            y: player.y,
            width: DART_WIDTH,
            height: DART_HEIGHT
        });

        gameState.throwsLeft--;
        updateUI();

        // Add throw animation
        canvas.style.transform = 'translateY(-5px)';
        setTimeout(() => {
            canvas.style.transform = 'translateY(0)';
        }, 100);
    }

    function createHitEffect(x, y) {
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.style.cssText = `
                    position: absolute;
                    width: 4px;
                    height: 4px;
                    background: #4a9eff;
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 100;
                `;

                const rect = canvas.getBoundingClientRect();
                const scaleX = rect.width / CANVAS_WIDTH;
                const scaleY = rect.height / CANVAS_HEIGHT;

                particle.style.left = (rect.left + x * scaleX) + 'px';
                particle.style.top = (rect.top + y * scaleY) + 'px';

                document.body.appendChild(particle);

                const angle = (i / 8) * Math.PI * 2;
                const distance = 30;
                const endX = x + Math.cos(angle) * distance;
                const endY = y + Math.sin(angle) * distance;

                particle.animate([
                    { transform: 'translate(0, 0)', opacity: 1 },
                    { transform: `translate(${(endX - x) * scaleX}px, ${(endY - y) * scaleY}px)`, opacity: 0 }
                ], {
                    duration: 500,
                    easing: 'ease-out'
                }).onfinish = () => {
                    if (document.body.contains(particle)) {
                        document.body.removeChild(particle);
                    }
                };
            }, i * 50);
        }
    }

    // ===== UI UPDATES =====
    function updateUI() {
        if (scoreValue) scoreValue.textContent = gameState.score;
        if (throwsValue) throwsValue.textContent = gameState.throwsLeft;
    }

    function updateStageDisplay() {
        if (stageNumber) stageNumber.textContent = `Stage ${gameState.stage}`;
        if (stageName) stageName.textContent = stageData.names[gameState.stage] || "Unknown Stage";

        // Update progress dots
        const dots = document.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
            if (index < gameState.stage) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });

        if (storyPortrait) {
            storyPortrait.textContent = '⚔️';
        }
    }

    // ===== STORY SYSTEM =====
    function showStory() {
        if (storyTitle) {
            if (gameState.stage >= 8) {
                storyTitle.textContent = "Legend Complete!";
            } else {
                storyTitle.textContent = `Stage ${gameState.stage} Complete!`;
            }
        }

        if (storyText) {
            storyText.textContent = stageData.stories[gameState.stage] || "Stage complete!";
        }

        storyModal.classList.remove('hidden');

        if (nextStageBtn) {
            if (gameState.stage >= 8) {
                nextStageBtn.innerHTML = '<span>New Legend</span><div class="btn-glow"></div>';
            } else {
                nextStageBtn.innerHTML = '<span>Continue Journey</span><div class="btn-glow"></div>';
            }
        }
    }

    function showGameOver() {
        if (storyTitle) storyTitle.textContent = "Mission Failed";
        if (storyText) {
            storyText.textContent = "The strongest Valkyrie has fallen short this time. But Durandal's resolve is unbreakable. Rise again and prove your mastery of the Abyss Flower!";
        }

        if (nextStageBtn) {
            nextStageBtn.innerHTML = '<span>Try Again</span><div class="btn-glow"></div>';
        }

        storyModal.classList.remove('hidden');
    }

    function showVictoryEffect() {
        victoryEffects.classList.remove('hidden');
        setTimeout(() => {
            victoryEffects.classList.add('hidden');
        }, 1000);
    }

    function nextStage() {
        if (gameState.isLoadingStage) return;

        storyModal.classList.add('hidden');

        if (gameState.score < 10 && gameState.throwsLeft <= 0) {
            // Game over - restart current stage
            loadStage(gameState.stage);
        } else if (gameState.stage < 8) {
            // Next stage
            const nextStageNum = gameState.stage + 1;
            loadStageAssets(nextStageNum, (success) => {
                if (success) {
                    loadStage(nextStageNum);
                } else {
                    alert('Failed to load next stage assets.');
                }
            });
        } else {
            // Game complete - restart from beginning
            loadStageAssets(1, (success) => {
                if (success) {
                    loadStage(1);
                }
            });
        }
    }

    // ===== CONTROLS =====
    function togglePause() {
        gameState.isPaused = !gameState.isPaused;

        const pauseMenu = document.getElementById('pauseMenu');

        if (gameState.isPaused) {
            pauseMenu.classList.remove('hidden');
            audioManager.pause();
        } else {
            pauseMenu.classList.add('hidden');
            audioManager.play();
        }
    }

    function restartStage() {
        if (gameState.isLoadingStage) return;

        loadStage(gameState.stage);
        document.getElementById('pauseMenu').classList.add('hidden');
        gameState.isPaused = false;
    }

    function goToMainMenu() {
        if (gameState.isLoadingStage) return;

        loadStageAssets(1, (success) => {
            if (success) {
                loadStage(1);
                document.getElementById('pauseMenu').classList.add('hidden');
                gameState.isPaused = false;
            }
        });
    }

    // ===== EVENT LISTENERS =====

    // Keyboard controls
    document.addEventListener("keydown", (e) => {
        switch (e.code) {
            case "Space":
                e.preventDefault();
                throwDart();
                break;
            case "Escape":
                e.preventDefault();
                if (gameState.gameStarted) togglePause();
                break;
        }
    });

    // Button controls
    if (nextStageBtn) nextStageBtn.addEventListener("click", nextStage);
    if (skipBtn) skipBtn.addEventListener("click", () => {
        if (confirm('Skip to story? This will end the current stage.')) {
            gameState.gameRunning = false;
            showStory();
        }
    });
    if (pauseBtn) pauseBtn.addEventListener("click", togglePause);

    // Pause menu buttons
    const resumeBtn = document.getElementById('resumeBtn');
    const restartBtn = document.getElementById('restartBtn');
    const mainMenuBtn = document.getElementById('mainMenuBtn');

    if (resumeBtn) resumeBtn.addEventListener('click', togglePause);
    if (restartBtn) restartBtn.addEventListener('click', () => {
        if (confirm('Restart current stage?')) {
            restartStage();
        }
    });
    if (mainMenuBtn) mainMenuBtn.addEventListener('click', () => {
        if (confirm('Return to Stage 1?')) {
            goToMainMenu();
        }
    });

    // Canvas click/touch
    canvas.addEventListener('click', (e) => {
        if (gameState.gameRunning && !gameState.isPaused) {
            throwDart();
        }
    });

    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (gameState.gameRunning && !gameState.isPaused) {
            throwDart();
        }
    });

    // Window focus handling
    window.addEventListener('blur', () => {
        if (gameState.gameStarted && gameState.gameRunning && !gameState.isPaused) {
            togglePause();
        }
    });

    // ===== START GAME =====
    console.log("⚔️ Durandal - Strongest Valkyrie Initialized");
    console.log("📁 Make sure your assets are in the 'dudu-images' folder:");
    console.log("   - dudu1/ to dudu8/ folders with player.png, dart.png, enemy.png, bg.jpg");
    console.log("   - background-music.mp3 in dudu-images/ folder");

    initializeGame();
});
