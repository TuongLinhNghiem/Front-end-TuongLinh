/**
 * Enemy class and related functionality
 */
class Enemy {
    constructor(type, row) {
        this.type = type;
        this.config = CONFIG.enemies[type];
        this.col = CONFIG.gridWidth; // Start at the right edge
        this.row = row;
        this.health = this.config.health;
        this.damage = this.config.damage;
        this.speed = this.config.speed;
        this.element = null;
        this.isActive = true;
        this.isFrozen = false;
        this.slowFactor = 1; // 1 = normal speed, < 1 = slowed

        this.create();
    }

    create() {
        const position = gridToPixel(this.col, this.row);

        this.element = createElement('div', 'enemy', document.getElementById('game-grid'), {
            backgroundImage: `url(${this.config.image})`,
            left: `${position.x}px`,
            top: `${position.y}px`,
            width: `${CONFIG.cellSize - 10}px`,
            height: `${CONFIG.cellSize - 10}px`
        });

        this.element.dataset.type = this.type;

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
            backgroundColor: '#ff4444'
        });
    }

    update(deltaTime, players) {
        if (!this.isActive) return;

        // Update health bar
        const healthPercentage = (this.health / this.config.health) * 100;
        this.healthFill.style.width = `${healthPercentage}%`;

        // Check if frozen
        if (this.isFrozen) {
            return;
        }

        // Check for collision with players
        let isColliding = false;
        let collidingPlayer = null;

        for (const player of players) {
            if (player.isActive && player.col === Math.floor(this.col) && player.row === this.row) {
                isColliding = true;
                collidingPlayer = player;
                break;
            }
        }

        if (isColliding && collidingPlayer) {
            // Attack the player
            collidingPlayer.takeDamage(this.damage * (deltaTime / 1000));
        } else {
            // Move left
            const effectiveSpeed = this.speed * this.slowFactor;
            this.col -= effectiveSpeed * (deltaTime / 1000);

            // Update position
            const position = gridToPixel(this.col, this.row);
            this.element.style.left = `${position.x}px`;

            // Check if reached the left edge
            if (this.col <= 0) {
                // Check if there's an active cannon in this row
                const cannon = game.cannons.find(c => c.row === this.row && c.isActive);

                if (cannon) {
                    // Activate the cannon's laser beam
                    this.activateCannonLaser(cannon);
                } else {
                    // Game over condition if no cannon
                    game.gameOver();
                }
                return;
            }
        }
    }

    activateCannonLaser(cannon) {
        // Create laser beam effect
        const gameGrid = document.getElementById('game-grid');
        const laserBeam = createElement('div', 'laser-beam', gameGrid, {
            left: '40px',
            top: `${cannon.row * CONFIG.cellSize + CONFIG.cellSize / 2 - 5}px`,
            width: `${CONFIG.gridWidth * CONFIG.cellSize - 40}px`
        });

        // Play laser sound
        const laserSound = playSound('assets/images/laser.mp3', 0.5);

        // Kill all zombies in this row
        game.enemies.forEach(enemy => {
            if (enemy.isActive && enemy.row === cannon.row) {
                enemy.takeDamage(1000); // Instant kill
            }
        });

        // Deactivate the cannon
        cannon.isActive = false;
        cannon.element.style.opacity = '0.3';

        // Remove laser beam after animation
        setTimeout(() => {
            if (laserBeam.parentNode) {
                laserBeam.parentNode.removeChild(laserBeam);
            }
        }, 1000);
    }

    takeDamage(amount) {
        this.health -= amount;

        // Update health bar
        const healthPercentage = (this.health / this.config.health) * 100;
        this.healthFill.style.width = `${healthPercentage}%`;

        // Check if enemy is dead
        if (this.health <= 0) {
            this.die();
        } else {
            // Shake the enemy to indicate damage
            shakeElement(this.element);
        }
    }

    die() {
        this.isActive = false;

        // Add death animation
        this.element.style.opacity = '0';
        this.element.style.transform = 'scale(0.8) rotate(90deg)';
        this.element.style.transition = 'all 0.5s ease-out';

        // Increment zombie kill count
        game.zombiesKilled++;
        document.getElementById('zombies-killed').textContent = game.zombiesKilled;

        // Check if stage is complete
        if (game.zombiesKilled >= game.zombieTarget && game.enemiesRemaining === 0) {
            game.stageComplete();
        }

        // Remove the enemy after animation
        setTimeout(() => {
            this.remove();
        }, 500);
    }

    remove() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }

        // Remove from game's enemies array
        const index = game.enemies.indexOf(this);
        if (index !== -1) {
            game.enemies.splice(index, 1);
        }
    }

    slow(factor) {
        // Apply slow effect
        this.slowFactor = factor;

        // Add visual indicator
        this.element.style.filter = 'hue-rotate(180deg) brightness(0.8)';
    }

    freeze(duration) {
        // Freeze the enemy
        this.isFrozen = true;

        // Add visual indicator
        this.element.style.filter = 'brightness(0.7) sepia(1) hue-rotate(180deg)';

        // Unfreeze after duration
        setTimeout(() => {
            this.isFrozen = false;
            this.element.style.filter = '';
        }, duration);
    }
}

// Enemy spawning system
function spawnEnemy(type, row) {
    const enemy = new Enemy(type, row);
    game.enemies.push(enemy);
    return enemy;
}

// Initialize enemy wave for a stage
function initializeEnemyWave(stageConfig) {
    game.enemyWaves = [];
    game.enemiesRemaining = 0;

    // Calculate total enemies for this stage
    Object.keys(stageConfig.zombieTypes).forEach(zombieType => {
        game.enemiesRemaining += stageConfig.zombieTypes[zombieType].count;
    });

    // Set up initial wave (enemies that appear first)
    const initialWave = [];

    Object.keys(stageConfig.zombieTypes).forEach(zombieType => {
        const zombieConfig = stageConfig.zombieTypes[zombieType];

        if (zombieConfig.appearFirst) {
            for (let i = 0; i < zombieConfig.appearFirst; i++) {
                initialWave.push({
                    type: zombieType,
                    delay: randomInt(1000, 5000) // Random delay between 1-5 seconds
                });
            }
        }
    });

    // Set up remaining waves
    const remainingWaves = [];

    Object.keys(stageConfig.zombieTypes).forEach(zombieType => {
        const zombieConfig = stageConfig.zombieTypes[zombieType];
        const remaining = zombieConfig.count - (zombieConfig.appearFirst || 0);

        for (let i = 0; i < remaining; i++) {
            remainingWaves.push({
                type: zombieType,
                delay: randomInt(5000, 15000) // Random delay between 5-15 seconds
            });
        }
    });

    // Shuffle the remaining waves for randomness
    for (let i = remainingWaves.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [remainingWaves[i], remainingWaves[j]] = [remainingWaves[j], remainingWaves[i]];
    }

    // Combine waves
    game.enemyWaves = [...initialWave, ...remainingWaves];

    // Start spawning
    game.lastEnemySpawnTime = Date.now();
    game.nextEnemySpawnDelay = 0;
}

// Update enemy spawning
function updateEnemySpawning(deltaTime) {
    const now = Date.now();

    // Check if it's time to spawn a new enemy
    if (game.enemyWaves.length > 0 && now - game.lastEnemySpawnTime >= game.nextEnemySpawnDelay) {
        // Get the next enemy to spawn
        const nextEnemy = game.enemyWaves.shift();

        // Spawn the enemy in a random row
        const randomRow = randomInt(0, CONFIG.gridHeight - 1);
        spawnEnemy(nextEnemy.type, randomRow);

        // Update spawn time and delay
        game.lastEnemySpawnTime = now;
        game.nextEnemySpawnDelay = nextEnemy.delay;
    }
}
