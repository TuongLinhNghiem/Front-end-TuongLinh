// Game Constants
const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 600;
const SECTION_WIDTH = 800;
const TOTAL_SECTIONS = 5;

// Game Variables
let canvas, ctx;
let gameRunning = false;
let paused = false;
let keys = {};
let lastTime = 0;

// Game Objects
let player;
let enemyManager;
let comboSystem;
let attackSystem;
let gameState;
let uiManager;
let assets;

// Asset Management
class AssetManager {
    constructor() {
        this.images = {};
        this.sounds = {};
        this.loaded = 0;
        this.total = 0;
    }

    loadImage(name, src) {
        this.total++;
        const img = new Image();
        img.onload = () => {
            this.loaded++;
            console.log(`Loaded image: ${name}`);
        };
        img.onerror = () => {
            this.loaded++;
            console.warn(`Failed to load image: ${name}, using fallback`);
            // Create fallback colored rectangle
            const canvas = document.createElement('canvas');
            canvas.width = 100;
            canvas.height = 100;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = this.getFallbackColor(name);
            ctx.fillRect(0, 0, 100, 100);
            img.src = canvas.toDataURL();
        };
        img.src = src;
        this.images[name] = img;
    }

    loadSound(name, src) {
        this.total++;
        const audio = new Audio();
        audio.oncanplaythrough = () => {
            this.loaded++;
            console.log(`Loaded sound: ${name}`);
        };
        audio.onerror = () => {
            this.loaded++;
            console.warn(`Failed to load sound: ${name}`);
        };
        audio.src = src;
        audio.volume = 0.5;
        this.sounds[name] = audio;
    }

    getFallbackColor(name) {
        const colors = {
            'bg': '#2c3e50',
            'player': '#3498db',
            'enemy1': '#e74c3c',
            'enemy2': '#c0392b',
            'enemy3': '#8e44ad'
        };
        return colors[name] || '#95a5a6';
    }

    isLoaded() {
        return this.loaded >= this.total;
    }

    getProgress() {
        return this.total > 0 ? this.loaded / this.total : 0;
    }
}

// Player Class
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 80;
        this.height = 80;
        this.speed = 200;
        this.hp = 100;
        this.maxHp = 100;
        this.attacking = false;
        this.attackCooldown = 0;
        this.invulnerable = 0;
        this.stunned = 0;

        // Ult
        this.ultActive = false;
        this.ultTimer = 0;
    }

    update(deltaTime, keys) {
        if (this.attackCooldown > 0) this.attackCooldown -= deltaTime;
        if (this.invulnerable > 0) this.invulnerable -= deltaTime;
        if (this.stunned > 0) this.stunned -= deltaTime;

        // Chỉ di chuyển khi không bị choáng
        if (this.stunned <= 0) {
            if (keys['KeyD'] && this.x < CANVAS_WIDTH - this.width - 50) {
                this.x += this.speed * deltaTime;
            }
            if (keys['KeyA'] && this.x > 50) {
                this.x -= this.speed * deltaTime;
            }
        }

        // Giữ player trong màn hình
        this.x = Math.max(50, Math.min(CANVAS_WIDTH - this.width - 50, this.x));
    }

    takeDamage(amount, source = null) {
        if (this.invulnerable > 0) {
            return false;
        }

        this.hp -= amount;
        this.invulnerable = 1.0;
        this.stunned = 0.5;

        // Knockback effect
        if (source) {
            const knockbackDistance = 50;
            this.x = Math.max(50, this.x - knockbackDistance);
        }

        this.createScreenShake();
        uiManager.showCollisionEffect();

        return true;
    }

    createScreenShake() {
        const canvas = document.getElementById('gameCanvas');
        canvas.style.transform = 'translate(3px, 3px)';
        setTimeout(() => {
            canvas.style.transform = 'translate(-3px, -3px)';
            setTimeout(() => {
                canvas.style.transform = 'translate(0, 0)';
            }, 50);
        }, 50);
    }

    canAttack() {
        return this.attackCooldown <= 0 && !this.attacking && this.stunned <= 0;
    }

    // ==========================
    // ULTIMATE ATTACK
    // ==========================
    executeUltimate() {
        console.log('ULTIMATE ATTACK!');
        playSound('ult');

        this.ultActive = true;
        this.ultTimer = 1.0;

        // Reset combo immediately
        this.reset();

        // Laser active for duration
        this.isLaserActive = true;
        this.laserTimer = this.laserMaxDuration;

    }

    draw(ctx) {
        ctx.save();

        if (this.invulnerable > 0) {
            ctx.globalAlpha = 0.5 + 0.5 * Math.sin(Date.now() * 0.02);
        }

        const playerImage = assets.images.player;
        ctx.drawImage(playerImage, this.x, this.y, this.width, this.height);

        ctx.restore();
    }
}

// Enemy Class
class Enemy {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;

        // Setup chỉ số cơ bản
        this.setupEnemyStats(type);
        this.ultDrainTimer = 0;

        // Combat / di chuyển
        this.attackRange = 80;
        this.attackCooldown = 0;
        this.state = 'moving';
        this.stunTimer = 0;
        this.moveSpeed = this.speed;
        this.collisionDamage = this.damage;
        this.lastCollisionTime = 0;

        // Trạng thái sống/chết
        this.isActive = true;
    }

    setupEnemyStats(type) {
        const enemyStats = {
            1: { width: 60, height: 60, hp: 2, speed: 80, damage: 1, spawnWeight: 0.6 },
            2: { width: 70, height: 70, hp: 4, speed: 60, damage: 2, spawnWeight: 0.35 },
            3: { width: 120, height: 120, hp: 15, speed: 40, damage: 3, spawnWeight: 0.05 }
        };

        const stats = enemyStats[type];
        this.width = stats.width;
        this.height = stats.height;
        this.hp = stats.hp;
        this.maxHp = stats.hp;
        this.speed = stats.speed;
        this.damage = stats.damage;
        this.spawnWeight = stats.spawnWeight;
        this.isBoss = type === 3;
    }

    update(deltaTime, player, gameState) {
        if (!this.isActive) return { collision: false, attack: false };

        // Update timers
        if (this.attackCooldown > 0) this.attackCooldown -= deltaTime;
        if (this.stunTimer > 0) {
            this.stunTimer -= deltaTime;
            this.state = 'stunned';
            return { collision: false, attack: false };
        }

        // Check collision với player
        const collision = this.checkCollision(player);
        let playerHit = false;

        if (collision && Date.now() - this.lastCollisionTime > 1000) {
            if (player.takeDamage(this.collisionDamage, this)) {
                this.lastCollisionTime = Date.now();
                playerHit = true;

                if (this.isBoss) {
                    this.createBossCollisionEffect();
                }
            }
        }

        // AI di chuyển
        const distanceToPlayer = Math.abs(this.x - player.x);

        if (!collision && distanceToPlayer > this.attackRange) {
            this.state = 'moving';
            const direction = this.x > player.x ? -1 : 1;
            this.x += direction * this.speed * deltaTime;

            if (this.isBoss) {
                this.updateBossMovement(deltaTime, player);
            }
        } else if (collision) {
            this.state = 'colliding';
        }

        // Nếu chết thì vô hiệu hóa
        if (this.hp <= 0 || this.state === 'dead') {
            this.isActive = false;
        }

        return { collision: collision, attack: playerHit };
    }

    checkCollision(player) {
        return (
            this.x < player.x + player.width &&
            this.x + this.width > player.x &&
            this.y < player.y + player.height &&
            this.y + this.height > player.y
        );
    }

    updateBossMovement(deltaTime, player) {
        const time = Date.now() * 0.001;
        const oscillation = Math.sin(time * 2) * 30;
        this.y = (CANVAS_HEIGHT / 2 - this.height / 2) + oscillation;

        // Boss charge ngẫu nhiên
        if (Math.random() < 0.001) {
            this.speed = 120;
            setTimeout(() => {
                this.speed = 40;
            }, 1000);
        }
    }

    createBossCollisionEffect() {
        const canvas = document.getElementById('gameCanvas');
        canvas.style.filter = 'brightness(1.5) contrast(1.2)';
        setTimeout(() => {
            canvas.style.filter = 'none';
        }, 200);
    }

    // Khi enemy chết
    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp <= 0) {
            this.isActive = false;

            if (this.isBoss) {
                uiManager.showWinScreen(); // Gọi cửa sổ thắng
            }
        }

        if (this.hp <= 0) {
            this.hp = 0;              // tránh âm máu
            this.state = 'dead';      // đánh dấu đã chết
            this.isActive = false;    // 👈 để EnemyManager filter ra ngoài
            return true;
        }
        return false;
    }

    draw(ctx) {
        if (!this.isActive) return; // 👈 không vẽ nếu đã chết

        ctx.save();

        // Hiệu ứng stun
        if (this.stunTimer > 0) {
            ctx.globalAlpha = 0.7;
            ctx.filter = 'brightness(1.5)';
        }

        // Hiệu ứng glow Boss
        if (this.isBoss) {
            ctx.shadowColor = '#ff4444';
            ctx.shadowBlur = 20;
        }

        // Vẽ enemy
        const enemyImage = assets.images[`enemy${this.type}`];
        ctx.drawImage(enemyImage, this.x, this.y, this.width, this.height);

        // HP bar
        if (this.hp > 0 && this.state !== 'dead') {
            const hpBarHeight = this.isBoss ? 10 : 6;
            const hpPercentage = (this.maxHp && this.maxHp > 0)
                ? Math.max(0, Math.min(1, this.hp / this.maxHp))
                : 0;

            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(this.x, this.y - 20, this.width, hpBarHeight);

            ctx.fillStyle = this.isBoss
                ? '#ff4444'
                : (hpPercentage > 0.5 ? '#4ecdc4' : '#ff6b6b');

            ctx.fillRect(this.x, this.y - 20, this.width * hpPercentage, hpBarHeight);
        }

        // Boss indicator
        if (this.isBoss) {
            ctx.fillStyle = '#ff4444';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('BOSS', this.x + this.width / 2, this.y - 25);
        }

        ctx.restore();
    }
}


// Enemy Manager Class
class EnemyManager {
    constructor() {
        this.enemies = [];
        this.spawnTimer = 0;
        this.spawnInterval = 3.0;
        this.bossSpawned = false;
        this.bossDefeated = false;
    }

    update(deltaTime, player, gameState) {
        this.spawnTimer += deltaTime;

        // Spawn logic
        if (!this.bossSpawned && gameState.currentSection >= 5) {
            this.spawnBoss();
            gameState.bossActive = true;
        } else if (!this.bossSpawned && this.spawnTimer >= this.spawnInterval) {
            this.spawnNormalEnemy(gameState.currentSection);
            this.spawnTimer = 0;
        }

        // Update enemies
        let playerTookDamage = false;
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            const result = enemy.update(deltaTime, player, gameState);

            if (result.attack) {
                playerTookDamage = true;
            }

            // Remove dead enemies
            if (enemy.state === 'dead') {
                if (enemy.isBoss) {
                    this.bossDefeated = true;
                    gameState.bossActive = false;
                    gameState.levelComplete = true;
                }
                this.enemies.splice(i, 1);
            }
            // Remove enemies that moved too far left
            else if (enemy.x < -enemy.width - 100) {
                this.enemies.splice(i, 1);
            }
        }

        return playerTookDamage;
    }

    spawnBoss() {
        if (this.bossSpawned) return;

        const boss = new Enemy(
            CANVAS_WIDTH + 50,
            CANVAS_HEIGHT / 2 - 60,
            3
        );

        this.enemies.push(boss);
        this.bossSpawned = true;

        playSound('boss-appear');
    }

    spawnNormalEnemy(section) {
        const spawnX = CANVAS_WIDTH + 50;
        const spawnY = CANVAS_HEIGHT / 2 - 30;

        let enemyType = 1;
        const rand = Math.random();

        if (section >= 3) {
            if (rand < 0.35) enemyType = 2;
            else enemyType = 1;
        }

        if (section >= 4) {
            if (rand < 0.2) enemyType = 2;
            else enemyType = 1;
        }

        this.enemies.push(new Enemy(spawnX, spawnY, enemyType));

        this.spawnInterval = Math.max(1.0, 3.0 - (section * 0.3));
    }

    getBossStatus() {
        const boss = this.enemies.find(enemy => enemy.isBoss);
        return {
            exists: !!boss,
            defeated: this.bossDefeated,
            hp: boss ? boss.hp : 0,
            maxHp: boss ? boss.maxHp : 0
        };
    }

    clearAllEnemies() {
        this.enemies.forEach(enemy => {
            if (!enemy.isBoss) {
                enemy.state = 'dead';
            }
        });
    }

    draw(ctx) {
        this.enemies.forEach(enemy => enemy.draw(ctx));
    }
}

// Combo System Class
class ComboSystem {
    constructor() {
        this.sequence = [];
        this.maxCombo = 4;
        this.timer = 0;
        this.maxTime = 5.0;

        // Laser ultimate state
        this.isLaserActive = false;
        this.laserTimer = 0; // seconds remaining
        this.laserMaxDuration = 5.0; // default 5s
    }

    // Gọi khi 1 đòn thực sự trúng (chỉ gọi từ AttackSystem khi enemy hp giảm)
    addAttack() {
        if (this.sequence.length < this.maxCombo) {
            this.sequence.push('hit');
            this.timer = this.maxTime;

            if (this.sequence.length === this.maxCombo) {
                this.executeUltimate();
            }
        }
    }

    executeUltimate() {
        console.log('ULTIMATE ATTACK!');
        playSound('ult');

        this.ultActive = true;
        this.ultTimer = 1.0;

        // Reset combo immediately
        this.reset();

        // Bật trạng thái laser (sẽ chịu trách nhiệm trừ HP dần trong update)
        this.isLaserActive = true;
        this.laserTimer = this.laserMaxDuration;
    }

    // deltaTime in seconds. Pass player + enemies from caller.
    update(deltaTime, player, enemies) {
        // combo timeout
        if (this.sequence.length > 0) {
            this.timer -= deltaTime;
            if (this.timer <= 0) this.reset();
        }

        // laser active -> apply damage over time to ALL enemies (boss too)
        if (this.isLaserActive) {
            this.laserTimer -= deltaTime;

            // Laser Y coordinate: center of player
            const laserY = player.y + player.height / 2;

            enemies.forEach(enemy => {
                if (!enemy.isActive) return;

                // Check vertical overlap with a thick laser band
                const enemyCenterY = enemy.y + enemy.height / 2;
                const verticalOverlap = Math.abs(enemyCenterY - laserY) <= 60; // 👈 thicker band

                // Only damage enemies in front of player
                const inFront = (enemy.x + enemy.width) > (player.x + player.width);

                if (verticalOverlap && inFront) {
                    // Drain HP gradually depending on if enemy was damaged
                    const duration = (enemy.hp < enemy.maxHp) ? 3.0 : 5.0;
                    const dps = Math.max(0.1, enemy.hp / duration);

                    enemy.takeDamage(dps * deltaTime);
                }
            });

            if (this.laserTimer <= 0) {
                this.isLaserActive = false;
            }
        }
    }

    // Draw laser line from player to right edge (transparent red)
    drawLaserEffect(ctx, player) {
        if (!this.isLaserActive) return;

        const startX = player.x + player.width;
        const y = player.y + player.height / 2;

        ctx.save();
        // Big thick red laser
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.6)';
        ctx.lineWidth = 25; // 👈 main beam thickness
        ctx.lineCap = 'round';
        ctx.shadowColor = 'rgba(255, 0, 0, 0.8)';
        ctx.shadowBlur = 30;

        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();

        // Add outer glow
        ctx.globalAlpha = 0.15;
        ctx.lineWidth = 60;
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();

        ctx.restore();
    }

    reset() {
        this.sequence = [];
        this.timer = 0;
    }

    getTimerPercentage() {
        return this.timer / this.maxTime * 100;
    }
}

class AttackSystem {
    constructor() {
        this.attacks = [];
        this.swingDirection = 1; // 1 = left→right, -1 = right→left
    }

    executeAttack(player) {
        if (!player.canAttack()) return;

        player.attacking = true;
        player.attackCooldown = 0.5;
        playSound('swing');

        // Alternate swing direction
        this.swingDirection *= -1;

        const attack = {
            cx: player.x + player.width / 2,
            cy: player.y + player.height / 2,
            radius: 100,
            startAngle: this.swingDirection === 1 ? -Math.PI / 3 : Math.PI / 3,
            endAngle: this.swingDirection === 1 ? Math.PI / 3 : -Math.PI / 3,
            currentAngle: this.swingDirection === 1 ? -Math.PI / 3 : Math.PI / 3,
            damage: 1,
            lifetime: 0.25, // full swing
            age: 0,
            hitEnemies: new Set()
        };

        this.attacks.push(attack);
    }

    checkHits(attack) {
        enemyManager.enemies.forEach(enemy => {
            if (!enemy.isActive) return;
            if (attack.hitEnemies.has(enemy)) return;

            // Enemy center
            const ex = enemy.x + enemy.width / 2;
            const ey = enemy.y + enemy.height / 2;

            // Sword tip position
            const tipX = attack.cx + Math.cos(attack.currentAngle) * attack.radius;
            const tipY = attack.cy + Math.sin(attack.currentAngle) * attack.radius;

            // Distance from enemy to sword tip
            const dx = ex - tipX;
            const dy = ey - tipY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Hitbox radius around sword tip (make it generous so hitting feels good)
            const tipHitRadius = 50; // 👈 tweak this (30–60 works best)

            if (dist <= tipHitRadius) {
                enemy.takeDamage(attack.damage);
                attack.hitEnemies.add(enemy);
                if (comboSystem) comboSystem.addAttack();
                playSound('hit');
            }
        });
    }


    normalizeAngle(angle) {
        while (angle > Math.PI) angle -= 2 * Math.PI;
        while (angle < -Math.PI) angle += 2 * Math.PI;
        return angle;
    }

    update(deltaTime) {
        for (let i = this.attacks.length - 1; i >= 0; i--) {
            const attack = this.attacks[i];
            attack.age += deltaTime;

            const t = attack.age / attack.lifetime;
            attack.currentAngle = attack.startAngle + (attack.endAngle - attack.startAngle) * t;

            this.checkHits(attack);

            if (attack.age >= attack.lifetime) {
                this.attacks.splice(i, 1);
            }
        }

        if (player.attacking && player.attackCooldown <= 0) {
            player.attacking = false;
        }
    }

    draw(ctx) {
        ctx.save();

        this.attacks.forEach(attack => {
            const t = attack.age / attack.lifetime;
            const alpha = 1 - t;

            // Glowing sword trail
            ctx.strokeStyle = `rgba(255, 200, 50, ${alpha})`;
            ctx.lineWidth = 12;
            ctx.shadowColor = 'rgba(255, 200, 100, 0.8)';
            ctx.shadowBlur = 15;

            ctx.beginPath();
            ctx.arc(
                attack.cx,
                attack.cy,
                attack.radius,
                attack.startAngle,
                attack.currentAngle,
                attack.startAngle > attack.endAngle // ensure correct direction
            );
            ctx.stroke();

            // Actual hitbox stick (thin line for debug)
            ctx.strokeStyle = 'rgba(255,255,255,0.6)';
            ctx.lineWidth = 3;
            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.moveTo(attack.cx, attack.cy);
            ctx.lineTo(
                attack.cx + Math.cos(attack.currentAngle) * attack.radius,
                attack.cy + Math.sin(attack.currentAngle) * attack.radius
            );
            ctx.stroke();
        });

        ctx.restore();
    }
}


// Game State Manager Class
class GameStateManager {
    constructor() {
        this.currentSection = 1;
        this.sectionProgress = 0;
        this.backgroundOffset = 0;
        this.bossActive = false;
        this.levelComplete = false;
    }

    update(deltaTime, player, keys) {
        const threshold = CANVAS_WIDTH * 0.75; // vị trí 3/4 màn hình
        const scrollSpeed = player.speed * deltaTime;

        // Nếu nhấn D (đi sang phải)
        if (keys['KeyD'] && player.stunned <= 0) {
            if (player.x < threshold) {
                // Player di chuyển bình thường cho đến khi đạt 3/4 màn hình
                player.x += scrollSpeed;
            } else {
                // Khi vượt 3/4 màn hình thì giữ player cố định
                player.x = threshold;
                // Và cho màn hình tự trượt
                this.backgroundOffset += scrollSpeed;
            }

            // Cập nhật tiến trình section
            const newSection = Math.floor(this.backgroundOffset / SECTION_WIDTH) + 1;
            if (newSection > this.currentSection && newSection <= TOTAL_SECTIONS) {
                this.currentSection = newSection;
                this.onSectionEnter(newSection);
            }
            this.sectionProgress = (this.backgroundOffset % SECTION_WIDTH) / SECTION_WIDTH * 100;
        }

        // Giữ backgroundOffset không vượt quá phần cuối stage
        const maxOffset = TOTAL_SECTIONS * SECTION_WIDTH;
        this.backgroundOffset = Math.min(this.backgroundOffset, maxOffset);

    }

    onSectionEnter(section) {
        console.log(`Entered section ${section}`);

        // Sự kiện theo section
        switch (section) {
            case 4:
                uiManager.showBossWarning();
                break;
            case 5:
                this.enterBossSection();
                break;
        }
    }

    enterBossSection() {
        // UI thông báo boss
        const bossUI = document.createElement('div');
        bossUI.id = 'bossUI';
        bossUI.className = 'boss-ui';
        bossUI.innerHTML = `
            <div class="boss-title">FINAL BOSS</div>
            <div class="boss-subtitle">Defeat the boss to win!</div>
        `;
        document.querySelector('.ui-overlay').appendChild(bossUI);

        setTimeout(() => {
            const bossUIElement = document.getElementById('bossUI');
            if (bossUIElement) bossUIElement.remove();
        }, 3000);
    }

    checkWinCondition(enemyManager) {
        const bossStatus = enemyManager.getBossStatus();
        if (bossStatus.defeated && !this.levelComplete) {
            this.levelComplete = true;
            this.onLevelComplete();
            return true;
        }
        return false;
    }

    onLevelComplete() {
        setTimeout(() => {
            this.showVictoryScreen();
        }, 1000);
    }

    showVictoryScreen() {
        const victoryDiv = document.createElement('div');
        victoryDiv.className = 'victory-screen';
        victoryDiv.innerHTML = `
            <div class="victory-content">
                <h1>🎉 VICTORY! 🎉</h1>
                <p>You have defeated the boss!</p>
                <button onclick="location.reload()">Play Again</button>
            </div>
        `;
        document.body.appendChild(victoryDiv);
    }
}

// UI Manager Class
class UIManager {
    constructor() {
        this.hpFill = document.getElementById('hpFill');
        this.hpText = document.getElementById('hpText');
        this.sectionText = document.getElementById('sectionText');
        this.comboSequence = document.getElementById('comboSequence');
        this.comboTimerBar = document.getElementById('comboTimerBar');
        this.bossWarningShown = false;
        this.winScreen = document.getElementById('winScreen');
        this.restartBtn = document.getElementById('restartBtn');

        this.restartBtn.addEventListener('click', () => {
            location.reload(); // restart game
        });
    }

    updateGameStats(player, section, progress, comboSystem) {
        // Update HP
        const hpPercentage = (player.hp / player.maxHp) * 100;
        this.hpFill.style.width = hpPercentage + '%';
        this.hpText.textContent = `${Math.max(0, player.hp)}/${player.maxHp}`;

        // Update HP bar color
        if (hpPercentage > 60) {
            this.hpFill.style.background = 'linear-gradient(90deg, #4ecdc4, #44a08d)';
        } else if (hpPercentage > 30) {
            this.hpFill.style.background = 'linear-gradient(90deg, #f39c12, #e67e22)';
        } else {
            this.hpFill.style.background = 'linear-gradient(90deg, #e74c3c, #c0392b)';
        }

        // Update section
        this.sectionText.textContent = `${section}/${TOTAL_SECTIONS}`;

        // Update combo display
        this.updateComboDisplay(comboSystem);


        // Show boss warning
        if (section >= 4 && !this.bossWarningShown) {
            this.showBossWarning();
            this.bossWarningShown = true;
        }

        // Update boss HP if boss exists
        this.updateBossHP();
    }

    updateComboDisplay(comboSystem) {
        this.comboSequence.innerHTML = '';

        comboSystem.sequence.forEach(comboType => {
            const orb = document.createElement('div');
            orb.className = `combo-orb ${comboType}`;
            orb.textContent = comboSystem.sequence.indexOf(comboType) + 1;
            this.comboSequence.appendChild(orb);
        });

        // Update timer bar
        const timerPercentage = comboSystem.getTimerPercentage();
        this.comboTimerBar.style.width = timerPercentage + '%';
    }

    updateBossHP() {
        const bossStatus = enemyManager.getBossStatus();
        let bossHPBar = document.getElementById('bossHPBar');

        if (bossStatus.exists && !bossHPBar) {
            // Create boss HP bar
            bossHPBar = document.createElement('div');
            bossHPBar.id = 'bossHPBar';
            bossHPBar.className = 'boss-hp-bar';
            bossHPBar.innerHTML = `
                <div class="boss-hp-label">BOSS HP</div>
                <div class="boss-hp-container">
                    <div id="bossHPFill" class="boss-hp-fill"></div>
                </div>
            `;
            document.querySelector('.ui-overlay').appendChild(bossHPBar);
        }

        if (bossHPBar && bossStatus.exists) {
            const hpPercentage = (bossStatus.hp / bossStatus.maxHp) * 100;
            document.getElementById('bossHPFill').style.width = hpPercentage + '%';
        }

        if (bossHPBar && bossStatus.defeated) {
            bossHPBar.remove();
        }
    }

    showBossWarning() {
        const warningDiv = document.createElement('div');
        warningDiv.className = 'boss-warning';
        warningDiv.innerHTML = `
            <h2>⚠️ BOSS AHEAD ⚠️</h2>
            <p>You cannot retreat once the boss appears!</p>
        `;
        document.body.appendChild(warningDiv);

        setTimeout(() => {
            warningDiv.remove();
        }, 4000);
    }

    showCollisionEffect() {
        // Screen flash effect for collisions
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 0, 0, 0.3);
            pointer-events: none;
            z-index: 1000;
            animation: flashEffect 0.2s ease-out;
        `;

        // Add flash animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes flashEffect {
                0% { opacity: 1; }
                100% { opacity: 0; }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(flash);
        setTimeout(() => {
            flash.remove();
            style.remove();
        }, 200);
    }
    showWinScreen() {
        this.winScreen.style.display = 'block';
    }
}

// Sound Management
function playSound(soundName) {
    if (assets.sounds[soundName]) {
        const sound = assets.sounds[soundName].cloneNode();
        sound.volume = 0.3;
        sound.play().catch(e => console.log('Sound play failed:', e));
    }
}

// Input Handling
function handleKeyDown(event) {
    keys[event.code] = true;

    // Attack
    if (event.code === 'Space') {
        event.preventDefault();
        attackSystem.executeAttack(player);
    }

    // Pause
    if (event.code === 'Escape') {
        togglePause();
    }
}

function handleKeyUp(event) {
    keys[event.code] = false;
}

function togglePause() {
    paused = !paused;
    const pauseOverlay = document.getElementById('pauseOverlay');
    if (paused) {
        pauseOverlay.classList.remove('hidden');
    } else {
        pauseOverlay.classList.add('hidden');
    }
}

// Game Loop
function gameLoop(currentTime) {
    if (!gameRunning) return;

    const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.016);
    lastTime = currentTime;

    if (!paused) {
        update(deltaTime);
        render();
    }

    requestAnimationFrame(gameLoop);
}

function update(deltaTime) {
    // Update game objects
    player.update(deltaTime, keys, gameState);
    enemyManager.update(deltaTime, player, gameState);
    attackSystem.update(deltaTime);
    if (comboSystem && player && enemyManager) {
        comboSystem.update(deltaTime, player, enemyManager.enemies);
    }
    gameState.update(deltaTime, player, keys);

    // Check win condition
    gameState.checkWinCondition(enemyManager);

    // Update UI
    uiManager.updateGameStats(
        player,
        gameState.currentSection,
        gameState.sectionProgress,
        comboSystem
    );

    // Check game over
    if (player.hp <= 0) {
        gameOver();
    }
}

function render() {
    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw background
    drawBackground();

    // Draw game objects
    if (player) player.draw(ctx);
    if (enemyManager) enemyManager.draw(ctx);
    if (attackSystem) attackSystem.draw(ctx);

    // === VẼ LASER ULT (nếu có) ===
    if (comboSystem && player) {
        comboSystem.drawLaserEffect(ctx, player);
    }

    // Draw UI elements on canvas
    drawCanvasUI();

}

function drawBackground() {
    const bgImage = assets.images.bg;

    // Calculate background position
    const bgX = -(gameState.backgroundOffset % bgImage.width);

    // Draw repeating background
    for (let x = bgX; x < CANVAS_WIDTH; x += bgImage.width) {
        ctx.drawImage(bgImage, x, 0, bgImage.width, CANVAS_HEIGHT);
    }

    // Draw section indicators
    drawSectionIndicators();
}

function drawSectionIndicators() {
    ctx.save();
    ctx.fillStyle = 'rgba(74, 158, 255, 0.3)';
    ctx.strokeStyle = '#4a9eff';
    ctx.lineWidth = 2;

    for (let i = 1; i <= TOTAL_SECTIONS; i++) {
        const sectionX = (i * SECTION_WIDTH) - gameState.backgroundOffset;

        if (sectionX > -50 && sectionX < CANVAS_WIDTH + 50) {
            ctx.setLineDash([10, 10]);
            ctx.beginPath();
            ctx.moveTo(sectionX, 0);
            ctx.lineTo(sectionX, CANVAS_HEIGHT);
            ctx.stroke();

            // Section number
            ctx.fillStyle = '#4a9eff';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`Section ${i}`, sectionX, 40);
        }
    }

    ctx.restore();
}

function drawCanvasUI() {
    // Draw screen lock indicator
    if (gameState.screenLocked) {
        ctx.save();
        ctx.fillStyle = 'rgba(255, 68, 68, 0.2)';
        ctx.fillRect(0, 0, 100, CANVAS_HEIGHT);

        ctx.fillStyle = '#ff4444';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.save();
        ctx.translate(50, CANVAS_HEIGHT / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('LOCKED', 0, 0);
        ctx.restore();
        ctx.restore();
    }
}

function gameOver() {
    gameRunning = false;

    const gameOverDiv = document.createElement('div');
    gameOverDiv.className = 'victory-screen';
    gameOverDiv.innerHTML = `
        <div class="victory-content" style="background: linear-gradient(135deg, rgba(231, 76, 60, 0.9), rgba(192, 57, 43, 0.9));">
            <h1>💀 GAME OVER 💀</h1>
            <p>You were defeated!</p>
            <button onclick="location.reload()">Try Again</button>
        </div>
    `;
    document.body.appendChild(gameOverDiv);
}

// Initialization
function initGame() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');

    // Set canvas size
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    // Initialize game objects
    player = new Player(100, CANVAS_HEIGHT / 2 - 40);
    enemyManager = new EnemyManager();
    comboSystem = new ComboSystem();
    attackSystem = new AttackSystem();
    gameState = new GameStateManager();
    uiManager = new UIManager();

    // Load assets
    assets = new AssetManager();
    loadAssets();
}

function loadAssets() {
    // Load images
    assets.loadImage('bg', 'HG-assets/images/bg.jpg');
    assets.loadImage('player', 'HG-assets/images/player.png');
    assets.loadImage('enemy1', 'HG-assets/images/enemy1.png');
    assets.loadImage('enemy2', 'HG-assets/images/enemy2.png');
    assets.loadImage('enemy3', 'HG-assets/images/enemy3.png');

    // Load sounds
    assets.loadSound('bg-music', 'HG-assets/sounds/bg-music.mp3');
    assets.loadSound('hit', 'HG-assets/sounds/hit.mp3');
    assets.loadSound('swing', 'HG-assets/sounds/swing.mp3');
    assets.loadSound('ult', 'HG-assets/sounds/ult.mp3');
    assets.loadSound('boss-appear', 'HG-assets/sounds/boss-appear.mp3');

    // Wait for assets to load
    const checkLoaded = setInterval(() => {
        if (assets.isLoaded()) {
            clearInterval(checkLoaded);
            startGame();
        }
    }, 100);
}

function startGame() {
    console.log('Game starting...');
    gameRunning = true;
    lastTime = performance.now();

    // Setup event listeners
    setupEventListeners();

    // Start game loop
    requestAnimationFrame(gameLoop);

    // Start background music
    if (assets.sounds['bg-music']) {
        assets.sounds['bg-music'].loop = true;
        assets.sounds['bg-music'].volume = 0.2;
        assets.sounds['bg-music'].play().catch(e => console.log('Music autoplay blocked'));
    }
}

function setupEventListeners() {
    // Keyboard events
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // Music button
    const musicBtn = document.getElementById('musicBtn');
    let musicPlaying = false;
    musicBtn.addEventListener('click', () => {
        const bgMusic = assets.sounds['bg-music'];
        if (bgMusic) {
            if (musicPlaying) {
                bgMusic.pause();
                musicBtn.classList.add('muted');
            } else {
                bgMusic.play().catch(e => console.log('Music play failed'));
                musicBtn.classList.remove('muted');
            }
            musicPlaying = !musicPlaying;
        }
    });

    // Instruction button
    const instructionBtn = document.getElementById('instructionBtn');
    const instructionPanel = document.getElementById('instructionPanel');
    instructionBtn.addEventListener('click', () => {
        instructionPanel.classList.toggle('hidden');
        instructionBtn.classList.toggle('active');
    });

    // Pause overlay click
    const pauseOverlay = document.getElementById('pauseOverlay');
    pauseOverlay.addEventListener('click', () => {
        if (paused) {
            togglePause();
        }
    });

    // Canvas focus for keyboard input
    canvas.addEventListener('click', () => {
        canvas.focus();
    });

    canvas.tabIndex = 1;
    canvas.focus();
}

// Start the game when page loads
document.addEventListener('DOMContentLoaded', () => {
    initGame();
});

// Handle window resize
window.addEventListener('resize', () => {
    // Maintain aspect ratio and center canvas
    const container = document.querySelector('.game-container');
    const containerRect = container.getBoundingClientRect();
    const aspectRatio = CANVAS_WIDTH / CANVAS_HEIGHT;

    let newWidth = containerRect.width - 40;
    let newHeight = newWidth / aspectRatio;

    if (newHeight > containerRect.height - 40) {
        newHeight = containerRect.height - 40;
        newWidth = newHeight * aspectRatio;
    }

    canvas.style.width = newWidth + 'px';
    canvas.style.height = newHeight + 'px';
});

// Handle visibility change (pause when tab is not active)
document.addEventListener('visibilitychange', () => {
    if (document.hidden && gameRunning && !paused) {
        togglePause();
    }
});

