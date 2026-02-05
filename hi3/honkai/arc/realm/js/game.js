/**
 * Main game class and functionality
 */
class Game {
    constructor() {
        this.coins = CONFIG.initialCoins;
        this.currentStage = 1;
        this.players = [];
        this.enemies = [];
        this.projectiles = [];
        this.cannons = [];
        this.selectedPlayerType = null;
        this.isPaused = false;
        this.isGameOver = false;
        this.zombiesKilled = 0;
        this.zombieTarget = 0;
        this.enemiesRemaining = 0;
        this.enemyWaves = [];
        this.lastEnemySpawnTime = 0;
        this.nextEnemySpawnDelay = 0;
        this.lastUpdateTime = 0;
        this.backgroundMusic = null;

        // Initialize event listeners
        this.initEventListeners();
    }

    initEventListeners() {
        // Start game button
        document.getElementById('start-game').addEventListener('click', () => {
            this.start();
        });

        // Skip button
        document.getElementById('skip-btn').addEventListener('click', () => {
            this.skip();
        });

        // Pause button
        document.getElementById('pause-btn').addEventListener('click', () => {
            this.pause();
        });

        // Resume button
        document.getElementById('resume-btn').addEventListener('click', () => {
            this.resume();
        });

        // Resume game button (in pause screen)
        document.getElementById('resume-game-btn').addEventListener('click', () => {
            this.resume();
        });

        // Music toggle button
        document.getElementById('music-btn').addEventListener('click', () => {
            this.toggleMusic();
        });

        // Restart game button (in game over screen)
        document.getElementById('restart-game-btn').addEventListener('click', () => {
            this.restart();
        });


        // Instruction tool
        document.getElementById('instruction-tool').addEventListener('click', () => {
            this.toggleInstructions();
        });
    }

    toggleInstructions() {
        const instructionPanel = document.getElementById('instruction-panel');

        if (instructionPanel.style.display === 'block') {
            instructionPanel.style.display = 'none';
        } else {
            // Update instruction content
            this.updateInstructionPanel();
            instructionPanel.style.display = 'block';
        }
    }

    updateInstructionPanel() {
        const instructionContent = document.getElementById('instruction-content');
        instructionContent.innerHTML = '';

        // Get available players for the current stage
        const currentStage = this.currentStage;
        const availablePlayers = CONFIG.stages[currentStage - 1].availablePlayers;

        // Create player info elements
        availablePlayers.forEach(playerType => {
            const playerConfig = CONFIG.players[playerType];

            const playerInfo = document.createElement('div');
            playerInfo.className = 'player-info';

            // Create image
            const img = document.createElement('img');
            img.src = playerConfig.image;
            img.alt = playerConfig.name;
            playerInfo.appendChild(img);

            // Create info section
            const info = document.createElement('div');
            info.className = 'info';

            const name = document.createElement('div');
            name.className = 'name';
            name.textContent = playerConfig.name;
            info.appendChild(name);

            const cost = document.createElement('div');
            cost.className = 'cost';
            cost.textContent = `${playerConfig.cost} coins`;
            info.appendChild(cost);

            const description = document.createElement('div');
            description.className = 'description';
            description.textContent = playerConfig.description;
            info.appendChild(description);

            playerInfo.appendChild(info);
            instructionContent.appendChild(playerInfo);
        });
    }

    start() {
        // Initialize the first stage
        initializeStage(this.currentStage);

        // Start the game loop
        this.lastUpdateTime = Date.now();
        this.isPaused = false;
        this.isGameOver = false;

        // Start the game loop
        requestAnimationFrame(() => this.gameLoop());
    }

    gameLoop() {
        // Check if game is paused or over
        if (this.isPaused || this.isGameOver) {
            return;
        }

        // Calculate delta time
        const now = Date.now();
        const deltaTime = now - this.lastUpdateTime;
        this.lastUpdateTime = now;

        // Update enemy spawning
        updateEnemySpawning(deltaTime);

        // Update players
        for (const player of this.players) {
            player.update(deltaTime, this.enemies);
        }

        // Update enemies
        for (const enemy of this.enemies) {
            enemy.update(deltaTime, this.players);
        }

        // Update projectiles
        for (const projectile of this.projectiles) {
            projectile.update(deltaTime, this.enemies);

            // Check for Torchwood interaction
            checkTorchwoodInteraction(projectile, this.players);
        }

        // Continue the game loop
        requestAnimationFrame(() => this.gameLoop());

        // Check if stage is complete
        if (this.zombiesKilled >= this.zombieTarget && this.enemies.length === 0 && this.enemyWaves.length === 0) {
            this.stageComplete();
            return; // dừng loop vì đã hoàn thành stage
        }

    }

    pause() {
        this.isPaused = true;

        // Show pause screen
        showScreen('pause-screen');

        // Update button visibility
        document.getElementById('pause-btn').classList.add('hidden');
        document.getElementById('resume-btn').classList.remove('hidden');

        // Pause background music
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
        }
    }

    resume() {
        this.isPaused = false;

        // Hide pause screen
        document.getElementById('pause-screen').classList.add('hidden');

        // Show game screen
        showScreen('game-screen');

        // Update button visibility
        document.getElementById('pause-btn').classList.remove('hidden');
        document.getElementById('resume-btn').classList.add('hidden');

        // Resume background music
        if (this.backgroundMusic && !window.gameMuted) {
            this.backgroundMusic.play().catch(error => {
                console.warn("Audio play failed:", error);
            });
        }

        // Resume game loop
        this.lastUpdateTime = Date.now();
        requestAnimationFrame(() => this.gameLoop());
    }

    skip() {
        // Nếu đang ở stage cuối → kết thúc game luôn
        if (this.currentStage >= CONFIG.stages.length) {
            gameComplete();
        } else {
            // Pause game
            this.isPaused = true;

            // Hiện story screen của stage hiện tại
            showStoryScreen(this.currentStage);
        }
    }


    toggleMusic() {
        const musicBtn = document.getElementById('music-btn');

        if (window.gameMuted) {
            // Unmute
            window.gameMuted = false;
            musicBtn.textContent = 'Music: On';

            if (this.backgroundMusic) {
                this.backgroundMusic.muted = false;
            }
        } else {
            // Mute
            window.gameMuted = true;
            musicBtn.textContent = 'Music: Off';

            if (this.backgroundMusic) {
                this.backgroundMusic.muted = true;
            }
        }
    }

    restart() {
        // Reset game state
        this.coins = CONFIG.initialCoins;
        this.currentStage = 1;
        this.players = [];
        this.enemies = [];
        this.projectiles = [];
        this.selectedPlayerType = null;
        this.isPaused = false;
        this.isGameOver = false;
        this.zombiesKilled = 0;

        // Update coin display
        document.getElementById('coins').textContent = this.coins;

        // Start the game
        this.start();
    }

    gameOver() {
        this.isGameOver = true;

        // Show game over screen
        showScreen('game-over-screen');

        // Stop background music
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            this.backgroundMusic = null;
        }
    }

    stageComplete() {
        // Stop the game loop
        this.isPaused = true;

        // Show story screen for the completed stage
        showStoryScreen(this.currentStage);
    }

    startNextStage() {
        initializeStage(this.currentStage);
        this.isPaused = false;
        this.isGameOver = false;
        this.lastUpdateTime = Date.now();
        requestAnimationFrame(() => this.gameLoop());
    }


    addCoins(amount) {
        this.coins += amount;

        // Update coin display
        document.getElementById('coins').textContent = this.coins;

        // Update player card availability
        updatePlayerCardAvailability();
    }

    createProjectile(type, x, y, damage, row) {
        const projectile = new Projectile(type, x, y, damage, row);
        this.projectiles.push(projectile);
        return projectile;
    }
}

// Update player card availability based on coins
function updatePlayerCardAvailability() {
    const playerCards = document.querySelectorAll('.player-card');

    playerCards.forEach(card => {
        const playerType = card.dataset.type;
        const playerCost = CONFIG.players[playerType].cost;

        if (game.coins < playerCost) {
            card.classList.add('unavailable');
        } else {
            card.classList.remove('unavailable');
        }
    });
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize global variables
    window.gameMuted = false;

    // Create the game instance
    window.game = new Game();
});
