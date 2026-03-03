/**
 * Stage management functionality
 */

// Initialize a stage
function initializeStage(stageNumber) {
    // Get stage configuration
    const stageConfig = CONFIG.stages[stageNumber - 1];

    if (!stageConfig) {
        console.error(`Stage ${stageNumber} configuration not found!`);
        return;
    }

    // Update stage info
    document.getElementById('current-stage').textContent = stageNumber;

    // Set zombie target
    game.zombieTarget = stageConfig.zombieTarget;
    document.getElementById('zombies-target').textContent = stageConfig.zombieTarget;

    // Reset zombie kill count
    game.zombiesKilled = 0;
    document.getElementById('zombies-killed').textContent = '0';

    // Reset coins to 150 for each new stage
    game.coins = CONFIG.initialCoins;
    document.getElementById('coins').textContent = game.coins;

    // Clear existing players, enemies, projectiles, and cannons
    game.players.forEach(player => {
        if (player.element && player.element.parentNode) {
            player.element.parentNode.removeChild(player.element);
        }
    });
    game.players = [];

    game.enemies.forEach(enemy => {
        if (enemy.element && enemy.element.parentNode) {
            enemy.element.parentNode.removeChild(enemy.element);
        }
    });
    game.enemies = [];

    game.projectiles.forEach(projectile => {
        if (projectile.element && projectile.element.parentNode) {
            projectile.element.parentNode.removeChild(projectile.element);
        }
    });
    game.projectiles = [];

    game.cannons = [];

    // Set background
    document.getElementById('game-screen').style.backgroundImage = `url(${stageConfig.background})`;

    // Play music
    if (game.backgroundMusic) {
        game.backgroundMusic.pause();
        game.backgroundMusic = null;
    }

    game.backgroundMusic = playSound(stageConfig.music, 0.3, true);

    // Initialize player selection
    initializePlayerSelection();

    // Initialize enemy wave
    initializeEnemyWave(stageConfig);

    // Create game grid
    createGameGrid();

    // Add cannons to each row
    addCannonsToRows();

    // Show game screen
    showScreen('game-screen');
}

// Add cannons to each row
function addCannonsToRows() {
    const gameGrid = document.getElementById('game-grid');

    for (let row = 0; row < CONFIG.gridHeight; row++) {
        // Create cannon element
        const cannon = createElement('div', 'cannon', gameGrid, {
            backgroundImage: 'url(assets/images/phao.png)',
            left: '0px',
            top: `${row * CONFIG.cellSize + (CONFIG.cellSize - 40) / 2}px`
        });

        cannon.dataset.row = row;

        // Store cannon in game
        game.cannons.push({
            element: cannon,
            row: row,
            isActive: true
        });
    }
}

// Create the game grid
function createGameGrid() {
    const gameGrid = document.getElementById('game-grid');
    gameGrid.innerHTML = ''; // Clear existing grid

    // Create grid cells
    for (let row = 0; row < CONFIG.gridHeight; row++) {
        for (let col = 0; col < CONFIG.gridWidth; col++) {
            const cell = createElement('div', 'grid-cell', gameGrid);
            cell.dataset.row = row;
            cell.dataset.col = col;
        }
    }
}

// Show a specific screen
function showScreen(screenId) {
    // Hide all screens
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.classList.add('hidden');
    });

    // Show the specified screen
    const screen = document.getElementById(screenId);
    if (screen) {
        screen.classList.remove('hidden');
    }
}

// Show story screen
function showStoryScreen(stageNumber) {
    // Get stage configuration
    const stageConfig = CONFIG.stages[stageNumber - 1];

    if (!stageConfig) {
        console.error(`Stage ${stageNumber} configuration not found!`);
        return;
    }

    // Set story content
    const storyContent = document.getElementById('story-content');
    storyContent.innerHTML = `<h2>Stage ${stageNumber}: ${stageConfig.name}</h2><p>${stageConfig.story}</p>`;

    // Show story screen
    showScreen('story-screen');

    // Set up next stage button
    const nextStageBtn = document.getElementById('next-stage-btn');
    nextStageBtn.onclick = () => {
        // Check if this is the last stage
        if (stageNumber >= CONFIG.stages.length) {
            // Game complete
            gameComplete();
        } else {
            // Start next stage
            game.currentStage = stageNumber + 1;
            game.startNextStage();

        }
    };

    // Add skip button to the story screen (positioned at bottom left)
    const skipBtn = document.getElementById('story-skip-btn');
    if (!skipBtn) {
        const newSkipBtn = createElement('button', 'story-skip-btn', document.getElementById('story-screen'), {
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            zIndex: '101'
        });
        newSkipBtn.id = 'story-skip-btn';
        newSkipBtn.textContent = 'Skip';
        newSkipBtn.onclick = () => {
            // Check if this is the last stage
            if (stageNumber >= CONFIG.stages.length) {
                // Game complete
                gameComplete();
            } else {
                // Skip to next stage
                game.currentStage = stageNumber + 1;
                initializeStage(game.currentStage);
            }
        };
    }
}

// Game complete
function gameComplete() {
    // Create a game complete screen
    const gameCompleteScreen = createElement('div', 'screen', document.body);
    gameCompleteScreen.id = 'game-complete-screen';

    const content = createElement('div', 'game-complete-content', gameCompleteScreen);
    content.innerHTML = `
        <h1>Congratulations!</h1>
        <p>You have completed all stages and saved the world from the Honkai invasion!</p>
        <p>The Flame-Chasers are victorious!</p>
        <button id="restart-game-btn">Play Again</button>
    `;

    // Show the game complete screen
    showScreen('game-complete-screen');

    // Set up restart button
    document.getElementById('restart-game-btn').onclick = () => {
        // Restart the game
        game.restart();
    };
}

// Stage complete
function stageComplete() {
    // Stop the game loop
    game.isPaused = true;

    // Show story screen for the completed stage
    showStoryScreen(game.currentStage);
}
