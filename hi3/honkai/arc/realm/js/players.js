/**
 * Player class and related functionality
 */
class Player {
    constructor(type, col, row) {
        this.type = type;
        this.config = CONFIG.players[type];
        this.col = col;
        this.row = row;
        this.health = this.config.health;
        this.lastAttackTime = 0;
        this.lastProductionTime = 0;
        this.element = null;
        this.isActive = true;
        this.targets = [];

        this.create();
    }

    create() {
        const position = gridToPixel(this.col, this.row);

        this.element = createElement('div', 'player', document.getElementById('game-grid'), {
            backgroundImage: `url(${this.config.image})`,
            left: `${position.x}px`,
            top: `${position.y}px`,
            width: `${CONFIG.cellSize - 10}px`,
            height: `${CONFIG.cellSize - 10}px`
        });

        this.element.dataset.type = this.type;
        this.element.dataset.col = this.col;
        this.element.dataset.row = this.row;

        // Add health bar
        this.healthBar = createElement('div', 'health-bar', this.element, {
            position: 'absolute',
            bottom: '0',
            left: '0',
            width: '100%',
            height: '5px',
            backgroundColor: '#333'
        });

        this.healthFill = createElement('div', 'health-fill', this.healthBar, {
            width: '100%',
            height: '100%',
            backgroundColor: '#4CAF50'
        });
    }

    update(deltaTime, enemies) {
        if (!this.isActive) return;

        // Update health bar
        const healthPercentage = (this.health / this.config.health) * 100;
        this.healthFill.style.width = `${healthPercentage}%`;

        // Handle different player types
        switch (this.config.type) {
            case 'Peashooter':
            case 'Snowpea':
                this.handleShooter(deltaTime, enemies);
                break;
            case 'Threepeater':
                this.handleThreepeater(deltaTime, enemies);
                break;
            case 'Sunflower':
                this.handleSunflower(deltaTime);
                break;
            case 'Wallnut':
                // Wallnut doesn't need to do anything actively
                break;
            case 'Torchwood':
                // Torchwood doesn't need to do anything actively
                break;
            case 'Ice Shroom':
                if (!this.activated) {
                    this.handleIceShroom(enemies);
                }
                break;
            case 'Cherry Bomb':
                if (!this.activated) {
                    this.handleCherryBomb(enemies);
                }
                break;
        }
    }

    handleShooter(deltaTime, enemies) {
        const now = Date.now();

        // Check if it's time to attack
        if (now - this.lastAttackTime >= this.config.attackRate) {
            // Find enemies in the same row
            const rowEnemies = enemies.filter(enemy =>
                enemy.row === this.row && enemy.col > this.col && enemy.isActive
            );

            if (rowEnemies.length > 0) {
                // Create a projectile
                const projectileType = this.config.projectileType;
                const position = gridToPixel(this.col, this.row);

                // Adjust position to center of player
                position.x += CONFIG.cellSize / 2;
                position.y += CONFIG.cellSize / 2;

                // Create the projectile
                game.createProjectile(
                    projectileType,
                    position.x,
                    position.y,
                    this.config.attackDamage,
                    this.row
                );

                // Update last attack time
                this.lastAttackTime = now;
            }
        }
    }

    handleThreepeater(deltaTime, enemies) {
        const now = Date.now();

        // Check if it's time to attack
        if (now - this.lastAttackTime >= this.config.attackRate) {
            // Check if there are any enemies in any of the three rows
            const rowsToCheck = [this.row - 1, this.row, this.row + 1].filter(
                row => row >= 0 && row < CONFIG.gridHeight
            );

            let hasEnemies = false;

            rowsToCheck.forEach(row => {
                const rowEnemies = enemies.filter(enemy =>
                    enemy.row === row && enemy.col > this.col && enemy.isActive
                );

                if (rowEnemies.length > 0) {
                    hasEnemies = true;

                    // Create a projectile for this row
                    const projectileType = this.config.projectileType;
                    const position = gridToPixel(this.col, this.row);

                    // Adjust position to center of player
                    position.x += CONFIG.cellSize / 2;
                    position.y += CONFIG.cellSize / 2;

                    // Adjust y position based on the row
                    const rowOffset = (row - this.row) * CONFIG.cellSize;

                    // Create the projectile
                    game.createProjectile(
                        projectileType,
                        position.x,
                        position.y + rowOffset,
                        this.config.attackDamage,
                        row
                    );
                }
            });

            if (hasEnemies) {
                // Update last attack time
                this.lastAttackTime = now;
            }
        }
    }

    handleSunflower(deltaTime) {
        const now = Date.now();

        // Check if it's time to produce coins
        if (now - this.lastProductionTime >= this.config.productionRate) {
            // Produce coins
            game.addCoins(this.config.productionAmount);

            // Create a visual coin effect
            const position = gridToPixel(this.col, this.row);
            const coinElement = createElement('div', 'coin', document.getElementById('game-grid'), {
                left: `${position.x + CONFIG.cellSize / 2 - 15}px`,
                top: `${position.y + CONFIG.cellSize / 2 - 15}px`,
                width: '30px',
                height: '30px',
                backgroundColor: '#ffd700',
                borderRadius: '50%',
                zIndex: '30',
                textAlign: 'center',
                lineHeight: '30px',
                fontWeight: 'bold',
                color: '#000',
                animation: 'coinFloat 1s ease-out'
            });

            coinElement.textContent = '+' + this.config.productionAmount;

            // Add animation
            const keyframes = `
                @keyframes coinFloat {
                    0% { transform: translateY(0); opacity: 1; }
                    100% { transform: translateY(-50px); opacity: 0; }
                }
            `;

            const styleSheet = document.createElement('style');
            styleSheet.textContent = keyframes;
            document.head.appendChild(styleSheet);

            // Remove the coin element after animation
            setTimeout(() => {
                coinElement.remove();
                styleSheet.remove();
            }, 1000);

            // Update last production time
            this.lastProductionTime = now;
        }
    }

    handleIceShroom(enemies) {
        // Freeze all enemies on screen
        enemies.forEach(enemy => {
            if (enemy.isActive) {
                enemy.freeze(this.config.freezeDuration);
            }
        });

        // Mark as activated
        this.activated = true;

        // Add visual effect
        const position = gridToPixel(this.col, this.row);
        const iceEffect = createElement('div', 'ice-effect', document.getElementById('game-grid'), {
            left: '0',
            top: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(135, 206, 250, 0.5)',
            zIndex: '5',
            pointerEvents: 'none'
        });

        // Remove the effect after the freeze duration
        setTimeout(() => {
            iceEffect.remove();
            this.remove(); // Remove the Ice Shroom after use
        }, this.config.freezeDuration);
    }

    handleCherryBomb(enemies) {
        // Get the explosion area
        const explosionRadius = this.config.explosionRadius;
        const minCol = Math.max(0, this.col - Math.floor(explosionRadius / 2));
        const maxCol = Math.min(CONFIG.gridWidth - 1, this.col + Math.floor(explosionRadius / 2));
        const minRow = Math.max(0, this.row - Math.floor(explosionRadius / 2));
        const maxRow = Math.min(CONFIG.gridHeight - 1, this.row + Math.floor(explosionRadius / 2));

        // Damage all enemies in the explosion area
        enemies.forEach(enemy => {
            if (enemy.isActive &&
                enemy.col >= minCol && enemy.col <= maxCol &&
                enemy.row >= minRow && enemy.row <= maxRow) {
                enemy.takeDamage(this.config.attackDamage);
            }
        });

        // Mark as activated
        this.activated = true;

        // Add visual effect
        const position = gridToPixel(this.col, this.row);
        const explosionEffect = createElement('div', 'explosion-effect', document.getElementById('game-grid'), {
            left: `${position.x - CONFIG.cellSize}px`,
            top: `${position.y - CONFIG.cellSize}px`,
            width: `${CONFIG.cellSize * 3}px`,
            height: `${CONFIG.cellSize * 3}px`,
            backgroundColor: 'rgba(255, 69, 0, 0.7)',
            borderRadius: '50%',
            zIndex: '25',
            animation: 'explode 0.5s ease-out'
        });

        // Add animation
        const keyframes = `
            @keyframes explode {
                0% { transform: scale(0); opacity: 1; }
                100% { transform: scale(1.5); opacity: 0; }
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = keyframes;
        document.head.appendChild(styleSheet);

        // Remove the explosion effect after animation
        setTimeout(() => {
            explosionEffect.remove();
            styleSheet.remove();
            this.remove(); // Remove the Cherry Bomb after use
        }, 500);
    }

    takeDamage(amount) {
        this.health -= amount;

        // Update health bar
        const healthPercentage = (this.health / this.config.health) * 100;
        this.healthFill.style.width = `${healthPercentage}%`;

        // Check if player is dead
        if (this.health <= 0) {
            this.die();
        } else {
            // Shake the player to indicate damage
            shakeElement(this.element);
        }
    }

    die() {
        this.isActive = false;

        // Add death animation
        this.element.style.opacity = '0.5';
        this.element.style.transform = 'scale(0.8)';
        this.element.style.transition = 'all 0.5s ease-out';

        // Remove the player after animation
        setTimeout(() => {
            this.remove();
        }, 500);
    }

    remove() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }

        // Remove from game's players array
        const index = game.players.indexOf(this);
        if (index !== -1) {
            game.players.splice(index, 1);
        }
    }
}

// Player selection and placement functionality
function initializePlayerSelection() {
    const playerSelection = document.getElementById('player-selection');
    playerSelection.innerHTML = ''; // Clear existing content

    // Get available players for the current stage
    const currentStage = game.currentStage;
    const availablePlayers = CONFIG.stages[currentStage - 1].availablePlayers;

    // Create player cards
    availablePlayers.forEach(playerType => {
        const playerConfig = CONFIG.players[playerType];

        const playerCard = createElement('div', 'player-card', playerSelection);
        playerCard.dataset.type = playerType;

        // Add player image
        const playerImage = createElement('img', 'player-image', playerCard);
        playerImage.src = playerConfig.image;
        playerImage.alt = playerConfig.name;

        // Add cost label
        const costLabel = createElement('div', 'player-cost', playerCard);
        costLabel.textContent = `${playerConfig.cost} coins`;

        // Add event listener
        playerCard.addEventListener('click', () => {
            // Check if player has enough coins
            if (game.coins >= playerConfig.cost) {
                // Select this player
                selectPlayer(playerType);
            } else {
                showMessage(`Not enough coins! Need ${playerConfig.cost} coins.`);
            }
        });
    });

    // Update player card availability based on coins
    updatePlayerCardAvailability();
}

// Select a player for placement
function selectPlayer(playerType) {
    // Deselect any previously selected player
    const selectedCard = document.querySelector('.player-card.selected');
    if (selectedCard) {
        selectedCard.classList.remove('selected');
    }

    // Select the new player
    const playerCard = document.querySelector(`.player-card[data-type="${playerType}"]`);
    playerCard.classList.add('selected');

    // Set the selected player type
    game.selectedPlayerType = playerType;

    // Add event listeners to grid cells for placement
    addGridCellListeners();
}

// Add event listeners to grid cells for player placement
function addGridCellListeners() {
    const gridCells = document.querySelectorAll('.grid-cell');

    gridCells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });
}

// Handle grid cell click for player placement
function handleCellClick(event) {
    const cell = event.currentTarget;
    const col = parseInt(cell.dataset.col);
    const row = parseInt(cell.dataset.row);

    // Check if a player is selected
    if (!game.selectedPlayerType) {
        return;
    }

    // Check if the cell is already occupied
    if (cell.querySelector('.player')) {
        showMessage('This cell is already occupied!');
        return;
    }

    // Check if player has enough coins
    const playerConfig = CONFIG.players[game.selectedPlayerType];
    if (game.coins < playerConfig.cost) {
        showMessage(`Not enough coins! Need ${playerConfig.cost} coins.`);
        return;
    }

    // Place the player
    const player = new Player(game.selectedPlayerType, col, row);
    game.players.push(player);

    // Deduct coins
    game.addCoins(-playerConfig.cost);

    // Deselect the player
    const selectedCard = document.querySelector('.player-card.selected');
    if (selectedCard) {
        selectedCard.classList.remove('selected');
    }

    game.selectedPlayerType = null;

    // Remove event listeners
    removeGridCellListeners();
}

// Remove event listeners from grid cells
function removeGridCellListeners() {
    const gridCells = document.querySelectorAll('.grid-cell');

    gridCells.forEach(cell => {
        cell.removeEventListener('click', handleCellClick);
    });
}
