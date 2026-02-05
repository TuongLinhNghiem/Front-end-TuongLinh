/**
 * Projectile class and related functionality
 */
class Projectile {
    constructor(type, x, y, damage, row) {
        this.type = type;
        this.config = CONFIG.projectiles[type];
        this.x = x;
        this.y = y;
        this.row = row;
        this.damage = damage;
        this.speed = this.config.speed;
        this.element = null;
        this.isActive = true;

        this.create();
    }

    create() {
        // triple-pea giữ size nhỏ, các loại khác to hơn
        const size = this.type === 'triplepea' ? 20 : 35;

        this.element = createElement('div', 'projectile', document.getElementById('game-grid'), {
            backgroundImage: `url(${this.config.image})`,
            left: `${this.x - size / 2}px`, // căn giữa theo size
            top: `${this.y - size / 2}px`,
            width: `${size}px`,
            height: `${size}px`
        });

        this.element.dataset.type = this.type;
    }


    update(deltaTime, enemies) {
        if (!this.isActive) return;

        // Move right
        this.x += this.speed * (deltaTime / 1000);

        // Update position
        this.element.style.left = `${this.x - 10}px`; // Center the projectile

        // Check for collision with enemies
        for (const enemy of enemies) {
            if (enemy.isActive && enemy.row === this.row &&
                Math.abs(enemy.col * CONFIG.cellSize - this.x) < CONFIG.cellSize / 2) {

                // Apply damage
                enemy.takeDamage(this.damage);

                // Apply slow effect if it's a snow pea
                if (this.type === 'snowpea' && this.config.slowEffect) {
                    enemy.slow(this.config.slowEffect);
                }

                // Deactivate the projectile
                this.isActive = false;
                this.remove();
                break;
            }
        }

        // Check if projectile is out of bounds
        if (this.x > CONFIG.gridWidth * CONFIG.cellSize) {
            this.isActive = false;
            this.remove();
        }
    }

    remove() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }

        // Remove from game's projectiles array
        const index = game.projectiles.indexOf(this);
        if (index !== -1) {
            game.projectiles.splice(index, 1);
        }
    }
}

// Check if a projectile passes through a Torchwood
function checkTorchwoodInteraction(projectile, players) {
    // Only check for pea projectiles
    if (projectile.type !== 'pea') return;

    for (const player of players) {
        // Check if the player is a Torchwood
        if (player.isActive && player.config.type === 'Torchwood') {
            // Check if the projectile is passing through the Torchwood
            const torchwoodX = player.col * CONFIG.cellSize + CONFIG.cellSize / 2;
            const torchwoodRow = player.row;

            if (projectile.row === torchwoodRow &&
                Math.abs(projectile.x - torchwoodX) < 10 &&
                projectile.x > torchwoodX) {

                // Transform the projectile to a fire pea
                transformToFirePea(projectile);
                break;
            }
        }
    }
}

// Transform a pea projectile to a fire pea
function transformToFirePea(projectile) {
    // Change the projectile type
    projectile.type = 'firepea';

    // Update the config
    projectile.config = CONFIG.projectiles['firepea'];

    // Update the damage
    projectile.damage *= 2;

    // Update the visual
    projectile.element.style.backgroundImage = `url(${projectile.config.image})`;
    projectile.element.dataset.type = 'firepea';

    // Add a fire effect
    projectile.element.style.filter = 'brightness(1.5) hue-rotate(-50deg)';
}
