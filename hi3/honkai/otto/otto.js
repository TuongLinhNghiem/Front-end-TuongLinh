// -------- Enhanced Stage Data ----------
const stages = [
    {
        name: "Prologue: The Genius Born",
        layout: [
            "0000000000000",
            "0111110111110",
            "0100010100010",
            "0111110111110",
            "0001000001000",
            "0111110111110",
            "0100010100010",
            "0111111111110",
            "0000000000000"
        ],
        playerStart: { x: 1, y: 1 },
        enemyStarts: [{ x: 11, y: 7 }],
        story: "Otto Apocalypse was born into nobility with an extraordinary genius for alchemy and science. His encounter with the pure-hearted Kallen Kaslana filled his world with light and purpose. But when fate cruelly took her away through execution, something fundamental broke within him. From that dark day forward, he cast aside conventional morality and swore to defy destiny itself, determined to bring back the only person who ever truly mattered to him.",
        bgColor: "#1a1a2e",
        difficulty: 1
    },
    {
        name: "Crossroads: The Overseer's Rise",
        layout: [
            "0000000000000",
            "0110111110110",
            "0100100100100",
            "0111110111110",
            "0001000001000",
            "0111110111110",
            "0100100100100",
            "0110111110110",
            "0000000000000"
        ],
        playerStart: { x: 1, y: 7 },
        enemyStarts: [{ x: 1, y: 1 }, { x: 11, y: 1 }],
        story: "Through cunning intellect and ruthless ambition, Otto climbed to become Schicksal's Overseer. To the world, he appeared as humanity's greatest shield against the Honkai threat. But in truth, every experiment he conducted, every war he orchestrated, and every betrayal he engineered served a single, obsessive purpose: paving the way for Kallen's resurrection, no matter the cost to others.",
        bgColor: "#2d1b69",
        difficulty: 2
    },
    {
        name: "Dark Palace: Clashing Philosophies",
        layout: [
            "0000000000000",
            "0111111111110",
            "0100100110100",
            "0111110111110",
            "0100010100010",
            "0111110111110",
            "0100100110100",
            "0111111111110",
            "0000000000000"
        ],
        playerStart: { x: 6, y: 1 },
        enemyStarts: [{ x: 3, y: 4 }, { x: 9, y: 4 }],
        story: "Otto's grand schemes inevitably brought him into conflict with Fu Hua, the immortal Sentinel bound by ancient duty to protect humanity. Their philosophies could not have been more opposed—Otto's ruthless pursuit of a single miracle against Fu Hua's unwavering defense of the many. These epic battles marked the first true cracks in Otto's seemingly untouchable authority.",
        bgColor: "#4a148c",
        difficulty: 4
    },
    {
        name: "Inner Halls: The Rebellion Grows",
        layout: [
            "0000000000000",
            "0111111111110",
            "0100100100100",
            "0111110111110",
            "0001000001000",
            "0111110111110",
            "0100100100100",
            "0111111111110",
            "0000000000000"
        ],
        playerStart: { x: 6, y: 1 },
        enemyStarts: [{ x: 1, y: 4 }, { x: 11, y: 4 }, { x: 6, y: 7 }],
        story: "Otto's increasingly desperate ambitions brought him into direct confrontation with Anti-Entropy, who opposed his cruel experiments and manipulation of Herrscher powers. These clashes tested the very foundations of his empire and pushed key figures like Bronya and Welt into open defiance, setting the stage for a rebellion that would challenge Schicksal's Overseer.",
        bgColor: "#6a1b9a",
        difficulty: 4
    },
    {
        name: "Final Trial: The Ultimate Sacrifice",
        layout: [
            "0000000000000",
            "0111111111110",
            "0100110100110",
            "0111110111110",
            "0100011110000",
            "0111110111110",
            "0110010100110",
            "0111111111110",
            "0000000000000"
        ],
        playerStart: { x: 6, y: 7 },
        enemyStarts: [{ x: 3, y: 1 }, { x: 9, y: 1 }, { x: 3, y: 7 }, { x: 9, y: 7 }],
        story: "After five centuries of lies, manipulation, and sacrifice, Otto enacted his ultimate plan: to use the power of the Imaginary Tree to alter reality itself. But standing at the end of his long, dark path, he made an unexpected choice. Rather than revive Kallen for his own sake, he chose to entrust a brighter future to Kiana and her companions. In his final moments, Otto Apocalypse passed from this world not as a conqueror, but as a man who could never let go of love.",
        bgColor: "#8e24aa",
        difficulty: 4
    }
];

// --------- Enhanced Config ----------
const TILE = 48;
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
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
          this.bgm = new Audio("otto-images/background-music.mp3");
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

// Enhanced visual effects
let particles = [];
let screenShake = 0;
let gameTime = 0;

// --------- Enhanced Images ----------
let bgImage = new Image();
let playerImage = new Image();
let enemyImage = new Image();
let assetsLoaded = 0;
let totalAssets = 3;

function loadStageImages(idx) {
    assetsLoaded = 0;

    bgImage = new Image();
    bgImage.onload = () => checkAssetsLoaded();
    bgImage.onerror = () => checkAssetsLoaded();
    bgImage.src = `otto-images/bg${idx + 1}.jpg`;

    playerImage = new Image();
    playerImage.onload = () => checkAssetsLoaded();
    playerImage.onerror = () => checkAssetsLoaded();
    playerImage.src = `otto-images/player${idx + 1}.png`;

    enemyImage = new Image();
    enemyImage.onload = () => checkAssetsLoaded();
    enemyImage.onerror = () => checkAssetsLoaded();
    enemyImage.src = `otto-images/enemy${idx + 1}.png`;
}

function checkAssetsLoaded() {
    assetsLoaded++;
    updateLoadingProgress();
}

function updateLoadingProgress() {
    const progress = (assetsLoaded / totalAssets) * 100;
    const progressBar = document.querySelector('.loading-progress');
    const loadingText = document.querySelector('.loading-text');

    if (progressBar) {
        progressBar.style.width = progress + '%';
    }

    if (loadingText) {
        const messages = [
            "Initializing Void Archives...",
            "Loading Schicksal Database...",
            "Accessing Imaginary Tree...",
            "Calibrating Soul Steel...",
            "The Overseer awaits..."
        ];
        const messageIndex = Math.min(Math.floor(assetsLoaded), messages.length - 1);
        loadingText.textContent = messages[messageIndex];
    }
}

// Enhanced drawing functions
function drawDefaultPlayer(ctx, x, y) {
    // Otto's golden aura
    ctx.save();
    ctx.shadowColor = '#d4af37';
    ctx.shadowBlur = 15;

    // Main body
    ctx.fillStyle = '#d4af37';
    ctx.beginPath();
    ctx.arc(x + TILE / 2, y + TILE / 2, TILE / 2 - 4, 0, Math.PI * 2);
    ctx.fill();

    // Inner glow
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(x + TILE / 2, y + TILE / 2, TILE / 3, 0, Math.PI * 2);
    ctx.fill();

    // Cross symbol
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 16px serif';
    ctx.textAlign = 'center';
    ctx.fillText('✠', x + TILE / 2, y + TILE / 2 + 6);

    ctx.restore();
}

function drawDefaultEnemy(ctx, x, y) {
    // Enemy danger aura
    ctx.save();
    ctx.shadowColor = '#ff4444';
    ctx.shadowBlur = 12;

    // Main body
    ctx.fillStyle = '#ff4444';
    ctx.beginPath();
    ctx.arc(x + TILE / 2, y + TILE / 2, TILE / 2 - 4, 0, Math.PI * 2);
    ctx.fill();

    // Inner core
    ctx.fillStyle = '#cc0000';
    ctx.beginPath();
    ctx.arc(x + TILE / 2, y + TILE / 2, TILE / 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

// --------- Enhanced State ----------
let currentStage = 0;
let map = [];
let pellets = [];
let walls = [];
let player = {
    x: 0, y: 0,
    px: 0, py: 0,
    dir: { x: 0, y: 0 },
    speed: 6,
    lives: 3,
    trail: []
};
let enemies = [];
let keys = {};
let gameState = 'loading'; // loading, playing, paused, story, gameover
let isPaused = false;
let stageCompleted = false;

// --------- Enhanced Controls ----------
document.getElementById('skipBtn').onclick = () => openModalForStage();
document.getElementById('closeModal').onclick = () => closeModalWindow();
document.getElementById('modalNext').onclick = () => advanceStage();
document.getElementById('pauseBtn').onclick = () => togglePause();
document.getElementById("muteBtn").onclick = () => {
    const muteBtn = document.getElementById("muteBtn");
    const span = muteBtn.querySelector('span');

    audioManager.toggleMute();

    span.textContent = audioManager.isMuted ? "🔇" : "🔊";
  };

// Pause menu controls
document.getElementById('resumeBtn').onclick = () => togglePause();
document.getElementById('restartBtn').onclick = () => restartStage();
document.getElementById('menuBtn').onclick = () => goToMainMenu();

const modal = document.getElementById('modal');
const pauseMenu = document.getElementById('pauseMenu');

function openModalForStage() {
    gameState = 'story';
    const stage = stages[currentStage];

    if (currentStage < stages.length) {
        document.getElementById('chapterTitle').textContent = `Chapter ${romanNumerals[currentStage]}`;
        document.getElementById('modalContent').innerHTML = `<p>${stage.story}</p>`;
    } else {
        document.getElementById('chapterTitle').textContent = "The End";
        document.getElementById('modalContent').innerHTML = "<p><b>The Overseer's journey is complete. His legacy lives on in those who continue the fight.</b></p>";
    }

    modal.classList.remove('hidden');
}

function closeModalWindow() {
    modal.classList.add('hidden');
    advanceStage();
}

function advanceStage() {
    modal.classList.add('hidden');
    currentStage++;

    if (currentStage >= stages.length) {
        // Game complete
        showVictoryEffect();
        setTimeout(() => {
            document.getElementById('chapterTitle').textContent = "Legend Complete";
            document.getElementById('modalContent').innerHTML = "<p><b>Otto Apocalypse's story has reached its end. The Overseer's complex legacy of love, sacrifice, and redemption will be remembered forever.</b></p>";
            modal.classList.remove('hidden');
        }, 2000);
        return;
    }

    startStage(currentStage);
}

function togglePause() {
    if (gameState !== 'playing' && gameState !== 'paused') return;

    isPaused = !isPaused;
    gameState = isPaused ? 'paused' : 'playing';

    if (isPaused) {
        pauseMenu.classList.remove('hidden');
        audioManager.pause();
    } else {
        pauseMenu.classList.add('hidden');
        audioManager.play();
    }
}

function restartStage() {
    pauseMenu.classList.add('hidden');
    isPaused = false;
    gameState = 'playing';
    startStage(currentStage);
}

function goToMainMenu() {
    pauseMenu.classList.add('hidden');
    isPaused = false;
    currentStage = 0;
    startStage(currentStage);
    gameState = 'playing';
}

// Roman numerals for chapter display
const romanNumerals = ['I', 'II', 'III', 'IV', 'V'];

// --------- Enhanced Stage Initialization ----------
let offsetX = 0, offsetY = 0;

function startStage(idx) {
    stageCompleted = false;
    const s = stages[idx];

    // Show loading
    showLoadingScreen();

    loadStageImages(idx);

    // Wait for assets to load
    setTimeout(() => {
        initializeStage(s, idx);
        hideLoadingScreen();
        gameState = 'playing';
    }, 1500);
}

function initializeStage(s, idx) {
    map = s.layout.map(r => r.split('').map(Number));
    const h = map.length, w = map[0].length;

    // Canvas setup
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Center map
    offsetX = Math.floor((canvas.width - w * TILE) / 2);
    offsetY = Math.floor((canvas.height - h * TILE) / 2);

    // Initialize game objects
    pellets = [];
    walls = [];
    particles = [];

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            if (map[y][x] === 1) pellets.push({ x, y, glow: Math.random() * Math.PI * 2 });
            if (map[y][x] === 0) walls.push({ x, y });
        }
    }

    // Initialize player
    player.x = s.playerStart.x;
    player.y = s.playerStart.y;
    player.px = player.x * TILE;
    player.py = player.y * TILE;
    player.dir = { x: 0, y: 0 };
    player.trail = [];

    // Initialize enemies with enhanced AI
    enemies = s.enemyStarts.map((e, i) => ({
        x: e.x, y: e.y,
        px: e.x * TILE, py: e.y * TILE,
        dir: { x: 0, y: 0 },
        speed: 2 + s.difficulty,
        lastDirection: { x: 0, y: 0 },
        changeTimer: 0,
        id: i
    }));

    // Update UI
    updateStageUI(s, idx);
    updateProgressNodes(idx);
}

function showLoadingScreen() {
    document.getElementById('loadingScreen').style.display = 'flex';
    document.getElementById('loadingScreen').style.opacity = '1';
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
        loadingScreen.style.display = 'none';
    }, 500);
}

function updateStageUI(stage, idx) {
    document.getElementById('stageName').textContent = stage.name;
    document.getElementById('lives').textContent = `Lives: ${player.lives}`;
    document.getElementById('pelletCount').textContent = `Fragments: ${pellets.length}`;
}

function updateProgressNodes(currentIdx) {
    const nodes = document.querySelectorAll('.node');
    nodes.forEach((node, idx) => {
        node.classList.remove('active', 'completed');
        if (idx < currentIdx) {
            node.classList.add('completed');
        } else if (idx === currentIdx) {
            node.classList.add('active');
        }
    });

    // Update progress fill
    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
        const progress = (currentIdx / (stages.length - 1)) * 100;
        progressFill.style.width = progress + '%';
    }
}

// --------- Enhanced Input System ----------
window.addEventListener('keydown', e => {
    keys[e.key] = true;

    // Prevent default for game keys
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
        e.preventDefault();
    }

    // Pause with ESC or P
    if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        togglePause();
    }

});

window.addEventListener('keyup', e => {
    keys[e.key] = false;
});

function applyInput() {
    if (gameState !== 'playing') return;

    let dx = 0, dy = 0;

    // Movement input
    if (keys.ArrowLeft || keys.a || keys.A) dx = -1;
    if (keys.ArrowRight || keys.d || keys.D) dx = 1;
    if (keys.ArrowUp || keys.w || keys.W) dy = -1;
    if (keys.ArrowDown || keys.s || keys.S) dy = 1;

    // Prioritize horizontal movement
    if (dx !== 0) dy = 0;

    player.dir = { x: dx, y: dy };
}

// --------- Enhanced Game Logic ----------
function isWall(x, y) {
    return (y < 0 || x < 0 || y >= map.length || x >= map[0].length) ? true : map[y][x] === 0;
}

function update() {
    if (gameState !== 'playing') return;

    gameTime += 0.016; // Approximate 60fps

    applyInput();
    updatePlayer();
    updateEnemies();
    updateParticles();
    checkCollisions();
    checkWinCondition();

    // Update UI
    document.getElementById('pelletCount').textContent = `Fragments: ${pellets.length}`;

    // Reduce screen shake
    if (screenShake > 0) {
        screenShake *= 0.9;
        if (screenShake < 0.1) screenShake = 0;
    }
}

function updatePlayer() {
    // Add trail effect
    if (player.dir.x !== 0 || player.dir.y !== 0) {
        player.trail.push({
            x: player.px,
            y: player.py,
            life: 1.0
        });

        // Limit trail length
        if (player.trail.length > 8) {
            player.trail.shift();
        }
    }

    // Update trail
    player.trail.forEach(t => {
        t.life -= 0.1;
    });
    player.trail = player.trail.filter(t => t.life > 0);

    // Movement
    if (player.dir.x || player.dir.y) {
        const tx = player.px + player.dir.x * player.speed;
        const ty = player.py + player.dir.y * player.speed;
        const nx = Math.round(tx / TILE);
        const ny = Math.round(ty / TILE);

        if (!isWall(nx, ny)) {
            player.px = tx;
            player.py = ty;
        }

        player.x = Math.round(player.px / TILE);
        player.y = Math.round(player.py / TILE);
    }
}

function updateEnemies() {
    enemies.forEach(enemy => {

        // Only decide direction when centered on a tile
        if (enemy.px % TILE === 0 && enemy.py % TILE === 0) {
            const options = [];
            const dirs = [
                { x: 1, y: 0 },
                { x: -1, y: 0 },
                { x: 0, y: 1 },
                { x: 0, y: -1 }
            ];

            dirs.forEach(d => {
                const nx = enemy.x + d.x;
                const ny = enemy.y + d.y;
                if (!isWall(nx, ny) &&
                    !(d.x === -enemy.lastDirection.x && d.y === -enemy.lastDirection.y)
                ) {
                    options.push(d);
                }

            });

            if (options.length > 0) {
                enemy.dir = options[Math.floor(Math.random() * options.length)];
            }
        }

        // 🔮 Predict next position
        const nextPx = enemy.px + enemy.dir.x * enemy.speed;
        const nextPy = enemy.py + enemy.dir.y * enemy.speed;

        const nextTileX = Math.floor(nextPx / TILE);
        const nextTileY = Math.floor(nextPy / TILE);

        // 🚧 Stop at walls
        if (!isWall(nextTileX, nextTileY)) {
            enemy.px = nextPx;
            enemy.py = nextPy;
        } else {
            // 🚧 blocked — force re-pick direction next frame
            enemy.changeTimer = 0;
        }


        // ✅ Safe tile position
        enemy.x = Math.floor(enemy.px / TILE);
        enemy.y = Math.floor(enemy.py / TILE);

        // 🧱 Clamp inside maze
        const mapW = stages[currentStage].layout[0].length;
        const mapH = stages[currentStage].layout.length;

        enemy.x = Math.max(0, Math.min(enemy.x, mapW - 1));
        enemy.y = Math.max(0, Math.min(enemy.y, mapH - 1));
    });
}


function updateParticles() {
    // Update existing particles
    particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;
        p.size *= p.shrink;
    });

    // Remove dead particles
    particles = particles.filter(p => p.life > 0 && p.size > 0.1);

    // Add ambient particles
    if (Math.random() < 0.1) {
        addAmbientParticle();
    }
}

function addAmbientParticle() {
    particles.push({
        x: Math.random() * canvas.width,
        y: canvas.height + 10,
        vx: (Math.random() - 0.5) * 2,
        vy: -Math.random() * 3 - 1,
        life: 1.0,
        decay: 0.01,
        size: Math.random() * 3 + 1,
        shrink: 0.99,
        color: `rgba(212, 175, 55, ${Math.random() * 0.5 + 0.2})`
    });
}

function addCollisionParticles(x, y, color = '#d4af37') {
    for (let i = 0; i < 8; i++) {
        particles.push({
            x: x + TILE / 2,
            y: y + TILE / 2,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            life: 1.0,
            decay: 0.05,
            size: Math.random() * 4 + 2,
            shrink: 0.95,
            color: color
        });
    }
}

function checkCollisions() {
    // Collect pellets
    for (let i = pellets.length - 1; i >= 0; i--) {
        const pellet = pellets[i];
        if (pellet.x === player.x && pellet.y === player.y) {
            pellets.splice(i, 1);
            addCollisionParticles(pellet.x * TILE, pellet.y * TILE, '#ffd54f');

            // Screen flash effect
            createScreenFlash('#d4af37', 0.1);
        }
    }

    // Enemy collisions
    enemies.forEach(enemy => {
        const dx = (enemy.px + TILE / 2) - (player.px + TILE / 2);
        const dy = (enemy.py + TILE / 2) - (player.py + TILE / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < TILE * 0.7) {
            playerHit();
        }
    });
}

function playerHit() {
    player.lives--;
    document.getElementById('lives').textContent = `Lives: ${player.lives}`;

    // Screen shake and flash
    screenShake = 20;
    createScreenFlash('#ff4444', 0.3);

    // Add explosion particles
    addCollisionParticles(player.px, player.py, '#ff4444');

    if (player.lives <= 0) {
        gameOver();
    } else {
        // Reset player position
        const stage = stages[currentStage];
        player.x = stage.playerStart.x;
        player.y = stage.playerStart.y;
        player.px = player.x * TILE;
        player.py = player.y * TILE;
        player.dir = { x: 0, y: 0 };
        player.trail = [];

        // Brief invincibility
        setTimeout(() => {
            // Player can move again
        }, 1000);
    }
}

function checkWinCondition() {
    if (pellets.length === 0 && !stageCompleted) {
        stageCompleted = true;
        gameState = 'story';

        showVictoryEffect();
        setTimeout(() => {
            openModalForStage();
        }, 1500);
    }
}


function gameOver() {
    gameState = 'gameover';
    showGameOverEffect();

    setTimeout(() => {
        player.lives = 3;
        startStage(currentStage);
    }, 3000);
}

// --------- Enhanced Visual Effects ----------
function createScreenFlash(color, intensity) {
    const flash = document.createElement('div');
    flash.style.position = 'fixed';
    flash.style.top = '0';
    flash.style.left = '0';
    flash.style.width = '100%';
    flash.style.height = '100%';
    flash.style.backgroundColor = color;
    flash.style.opacity = intensity;
    flash.style.pointerEvents = 'none';
    flash.style.zIndex = '1000';
    flash.style.transition = 'opacity 0.2s ease-out';

    document.body.appendChild(flash);

    setTimeout(() => {
        flash.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(flash);
        }, 200);
    }, 50);
}

function showVictoryEffect() {
    const victoryEffect = document.getElementById('victoryEffect');
    victoryEffect.classList.remove('hidden');

    setTimeout(() => {
        victoryEffect.classList.add('hidden');
    }, 2000);
}

function showGameOverEffect() {
    const gameOverEffect = document.getElementById('gameOverEffect');
    gameOverEffect.classList.remove('hidden');

    setTimeout(() => {
        gameOverEffect.classList.add('hidden');
    }, 3000);
}

// --------- Enhanced Drawing System ----------
function draw() {
    // Clear canvas with shake effect
    ctx.save();
    if (screenShake > 0) {
        const shakeX = (Math.random() - 0.5) * screenShake;
        const shakeY = (Math.random() - 0.5) * screenShake;
        ctx.translate(shakeX, shakeY);
    }

    drawBackground();
    drawWalls();
    drawPellets();
    drawPlayerTrail();
    drawPlayer();
    drawEnemies();
    drawParticles();
    drawUI();

    ctx.restore();
}

function drawBackground() {
    // Background image or gradient
    if (bgImage.complete && bgImage.naturalWidth > 0) {
        ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

        // Overlay with stage color
        const stage = stages[currentStage];
        if (stage && stage.bgColor) {
            ctx.fillStyle = stage.bgColor + '40'; // Add transparency
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Dark overlay for better contrast
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
        // Fallback gradient
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#0a0a0a');
        gradient.addColorStop(0.5, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

function drawWalls() {
    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[0].length; x++) {
            if (map[y][x] === 0) {
                const wallX = offsetX + x * TILE;
                const wallY = offsetY + y * TILE;

                // Wall shadow
                ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
                ctx.fillRect(wallX + 4, wallY + 4, TILE - 4, TILE - 4);

                // Main wall
                const gradient = ctx.createLinearGradient(wallX, wallY, wallX + TILE, wallY + TILE);
                gradient.addColorStop(0, '#333');
                gradient.addColorStop(1, '#111');
                ctx.fillStyle = gradient;
                ctx.fillRect(wallX + 2, wallY + 2, TILE - 4, TILE - 4);

                // Wall highlight
                ctx.fillStyle = 'rgba(212, 175, 55, 0.1)';
                ctx.fillRect(wallX + 2, wallY + 2, TILE - 4, 2);
            }
        }
    }
}

function drawPellets() {
    pellets.forEach(pellet => {
        const pelletX = offsetX + pellet.x * TILE + TILE / 2;
        const pelletY = offsetY + pellet.y * TILE + TILE / 2;

        // Animated glow
        pellet.glow += 0.1;
        const glowIntensity = Math.sin(pellet.glow) * 0.3 + 0.7;

        // Outer glow
        ctx.save();
        ctx.shadowColor = '#ffd54f';
        ctx.shadowBlur = 15 * glowIntensity;

        // Main pellet
        ctx.fillStyle = `rgba(255, 213, 79, ${glowIntensity})`;
        ctx.beginPath();
        ctx.arc(pelletX, pelletY, 6 * glowIntensity, 0, Math.PI * 2);
        ctx.fill();

        // Inner core
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(pelletX, pelletY, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    });
}

function drawPlayerTrail() {
    player.trail.forEach((trail, index) => {
        const alpha = trail.life * 0.3;
        ctx.fillStyle = `rgba(212, 175, 55, ${alpha})`;
        ctx.fillRect(
            offsetX + trail.x + TILE / 4,
            offsetY + trail.y + TILE / 4,
            TILE / 2,
            TILE / 2
        );
    });
}

function drawPlayer() {
    const playerX = offsetX + player.px;
    const playerY = offsetY + player.py;

    if (playerImage.complete && playerImage.naturalWidth > 0) {
        // Add glow effect
        ctx.save();
        ctx.shadowColor = '#d4af37';
        ctx.shadowBlur = 20;
        ctx.drawImage(playerImage, playerX, playerY, TILE, TILE);
        ctx.restore();
    } else {
        drawDefaultPlayer(ctx, playerX, playerY);
    }
}

function drawEnemies() {
    enemies.forEach(enemy => {
        const enemyX = offsetX + enemy.px;
        const enemyY = offsetY + enemy.py;

        if (enemyImage.complete && enemyImage.naturalWidth > 0) {
            // Add danger glow
            ctx.save();
            ctx.shadowColor = '#ff4444';
            ctx.shadowBlur = 15;
            ctx.drawImage(enemyImage, enemyX, enemyY, TILE, TILE);
            ctx.restore();
        } else {
            drawDefaultEnemy(ctx, enemyX, enemyY);
        }
    });
}

function drawParticles() {
    particles.forEach(particle => {
        ctx.save();
        ctx.globalAlpha = particle.life;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
}

function drawUI() {
    // Additional UI elements can be drawn here
    // For now, most UI is handled by HTML/CSS
}

// --------- Game Loop ----------
function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

// --------- Initialization ----------
function initializeGame() {
    // Hide loading screen after initial setup
    setTimeout(() => {
        hideLoadingScreen();
        startStage(0);
        audioManager.init();
    }, 2000);

    // Start game loop
    requestAnimationFrame(loop);
}

// --------- Window Events ----------
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Recalculate offsets
    if (map.length > 0) {
        const h = map.length, w = map[0].length;
        offsetX = Math.floor((canvas.width - w * TILE) / 2);
        offsetY = Math.floor((canvas.height - h * TILE) / 2);
    }
});

// Prevent context menu on right click
canvas.addEventListener('contextmenu', e => e.preventDefault());

// --------- Boot Game ----------
initializeGame();

