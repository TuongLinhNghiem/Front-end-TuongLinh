// Enhanced Game Variables
const player = document.getElementById("player");
const enemy = document.getElementById("enemy");
const playerHealthBar = document.querySelector(".player-health .bar-fill");
const enemyHealthBar = document.querySelector(".enemy-health .bar-fill");
const playerUltBar = document.querySelector(".player-ult .bar-fill");
const enemyUltBar = document.querySelector(".enemy-ult .bar-fill");
const playerHealthText = document.querySelector(".player-health .bar-text");
const enemyHealthText = document.querySelector(".enemy-health .bar-text");
const playerUltText = document.querySelector(".player-ult .bar-text");
const enemyUltText = document.querySelector(".enemy-ult .bar-text");
const playerPortrait = document.querySelector(".player-portrait");
const enemyPortrait = document.querySelector(".enemy-portrait");
const stageTitle = document.getElementById("stage-title");
const storyScreen = document.getElementById("story-screen");
const storyTitleEl = document.getElementById("story-title");
const storyText = document.getElementById("story-text");
const nextBtn = document.getElementById("next-btn");
const gameContainer = document.querySelector(".game-container");
const gameArea = document.querySelector(".game-area");
const loadingScreen = document.getElementById("loading-screen");

let currentStage = 0;
let gameState = "playing"; // playing, paused, story, gameover
let isAttacking = false;
let isPaused = false;

// Enhanced Stage Data with custom backgrounds and music
const stages = [
    {
        name: "Awakening",
        bg: "kiana-images/bg1.jpg",
        playerImg: "kiana-images/player1.png",
        enemyImg: "kiana-images/enemy1.png",
        music: "kiana-images/stage1.mp3",
        story: "Kiana Kaslana, born into the Kaslana clan, was raised by her father, Siegfried Kaslana, and her mother, Cecilia Schariac. After her mother's death, Kiana was raised alone by Siegfried and tried to avoid any encounter with Honkai. At 8-10 years old, Kiana and her father were caught in a Honkai outbreak, where Siegfried fought against the monsters to protect his daughter. This experience exposed Kiana to the terrifying power of the Honkai and the burden of the Kaslana clan. Despite being severely injured, Siegfried fought until exhausted, deeply imprinting his image on Kiana's memory. Kiana was determined to become a Valkyrie to fight and protect others, just like her father and mother."
    },
    {
        name: "Herrscher of the Void",
        bg: "kiana-images/bg2.jpg",
        playerImg: "kiana-images/player2.png",
        enemyImg: "kiana-images/enemy2.png",
        music: "kiana-images/stage2.mp3",
        story: "As Kiana grew into her teenage years, she trained at St. Freya Academy under the guidance of Himeko Murata and alongside her companions. However, destiny struck when the Honkai consciousness awakened within her. Kiana unwillingly became the vessel of the Herrscher of the Void, a destructive entity that threatened humanity itself. In her darkest moment, it was Himeko who stood against her. In a desperate battle, Himeko sacrificed her life to pull Kiana back from the abyss. This loss shattered Kiana, but it also awakened in her a deeper resolve: to control her power and never let the people she loved suffer because of her again."
    },
    {
        name: "Short Reunion",
        bg: "kiana-images/bg3.jpg",
        playerImg: "kiana-images/player3.png",
        enemyImg: "kiana-images/enemy3.png",
        music: "kiana-images/stage3.mp3",
        story: "After Himeko's death, Kiana wandered, burdened by guilt and the fear of her Herrscher identity. When she finally reunited with Mei, their bond as friends was tested to its limits. In Arc City, Mei had chosen a different path, siding with the World Serpent to gain strength for humanity's survival. Kiana confronted her in an emotional battle filled with both sorrow and determination. Though they clashed as enemies, their fight was not out of hatred, but out of their conflicting beliefs in how best to save the world."
    },
    {
        name: "Herrscher of Sentience",
        bg: "kiana-images/bg4.jpg",
        playerImg: "kiana-images/player4.png",
        enemyImg: "kiana-images/enemy4.png",
        music: "kiana-images/stage4.mp3",
        story: "In the uneasy calm after Arc City, another storm rose from within a familiar face. The ancient will dwelling in Fu Hua awakened as the Herrscher of Sentience—wearing Fu Hua's body but acting with playful cruelty and absolute confidence. HoS fractured the team, dragged Kiana into shifting mindscapes, and tried to reduce her resolve to a joke. Yet Kiana refused to be defined by a Herrscher's taunts. Holding onto her memories and the bonds she'd forged, she pushed through the illusions and reached for the real Fu Hua buried beneath the noise."
    },
    {
        name: "Herrscher of Domination",
        bg: "kiana-images/bg5.jpg",
        playerImg: "kiana-images/player5.png",
        enemyImg: "kiana-images/enemy5.png",
        music: "kiana-images/stage5.mp3",
        story: "Kiana's journey led her to face the Herrscher of Domination, a being capable of controlling minds and twisting reality. This battle was not only physical but also mental, as Kiana had to resist illusions and manipulations that preyed upon her deepest insecurities. With the support of her friends and her unwavering will, she triumphed, proving to herself that she was no longer just the powerless girl who once feared the Honkai, but a true Valkyrie who could stand against even the most cunning Herrschers."
    },
    {
        name: "Otto's Gambit",
        bg: "kiana-images/bg6.jpg",
        playerImg: "kiana-images/player6.png",
        enemyImg: "kiana-images/enemy6.png",
        music: "kiana-images/stage6.mp3",
        story: "Kiana's path inevitably brought her into conflict with Otto Apocalypse, the enigmatic Overseer of Schicksal. Otto's obsession with resurrecting Kallen Kaslana led to schemes that endangered the entire world. In the climactic battle within the Sea of Quanta, Kiana and her sister Durandal fought not just against Otto's machinations but also against the weight of their own destiny. Although Otto ultimately met his end through his own choices, Kiana emerged from the conflict stronger."
    },
    {
        name: "Kevin Kaslana",
        bg: "kiana-images/bg7.jpg",
        playerImg: "kiana-images/player7.png",
        enemyImg: "kiana-images/enemy7.png",
        music: "kiana-images/stage7.mp3",
        story: "In her pursuit of the truth and the salvation of humanity, Kiana confronted Kevin Kaslana, a warrior from the Previous Era and one of the mightiest soldiers against the Honkai. Their battle was a clash between ideals: Kevin's vision of sacrificing individuality for survival, and Kiana's belief in fighting for hope and human bonds. Despite Kevin's overwhelming strength, Kiana's determination and the legacy of her family's will allowed her to stand firm."
    },
    {
        name: "Herrscher of the End",
        bg: "kiana-images/bg8.jpg",
        playerImg: "kiana-images/player8.png",
        enemyImg: "kiana-images/enemy8.png",
        music: "kiana-images/stage8.mp3",
        story: "At the final chapter of her journey, Kiana stood before the ultimate adversary — the Herrscher of the End, the embodiment of humanity's destined destruction. This was the culmination of every struggle she had endured: the loss of her family, the sacrifice of her dearest teacher Himeko, the battles with friends and foes. Facing extinction itself, Kiana fought with all her heart, not for herself alone, but for her friends, her family, and the future of mankind."
    }
];

// Game Stats
let playerHP, enemyHP;
let playerUlt, enemyUlt;
const maxHP = 25;
const maxUlt = 5;

// Enhanced Audio System for background music
const audioManager = {
    backgroundMusic: null,
    currentTrack: null,
    isMuted: false,

    init() {
        this.backgroundMusic = new Audio();
        this.backgroundMusic.loop = true;
        this.backgroundMusic.volume = 0.3;
    },

    playTrack(stageIndex) {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            this.backgroundMusic.src = `kiana-images/stage${stageIndex + 1}.mp3`;
            this.backgroundMusic.play().catch(e => console.log('Audio play failed:', e));
            this.currentTrack = stageIndex;
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

// Initialize Game
function initGame() {
    showLoadingScreen();
    audioManager.init();
    setTimeout(() => {
        hideLoadingScreen();
        loadStage(currentStage);
        resetFight();
        setupEventListeners();
        startEnemyAI();
    }, 3000);
}

// Loading Screen
function showLoadingScreen() {
    loadingScreen.style.display = 'flex';
}

function hideLoadingScreen() {
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
        loadingScreen.style.display = 'none';
    }, 1000);
}

// Enhanced Stage Loading with music
function loadStage(stageIndex) {
    if (stageIndex >= stages.length) return;

    const stage = stages[stageIndex];

    // Update UI
    stageTitle.textContent = `Stage ${stageIndex + 1}: ${stage.name}`;

    // Update backgrounds and characters with smooth transition
    gameContainer.style.opacity = '0.7';

    setTimeout(() => {
        gameContainer.style.backgroundImage = `url(${stage.bg})`;
        player.style.backgroundImage = `url(${stage.playerImg})`;
        enemy.style.backgroundImage = `url(${stage.enemyImg})`;
        playerPortrait.style.backgroundImage = `url(${stage.playerImg})`;
        enemyPortrait.style.backgroundImage = `url(${stage.enemyImg})`;

        // Play stage-specific music
        if (stage.music) {
            audioManager.playTrack(stageIndex);
        }

        gameContainer.style.opacity = '1';
    }, 300);
}

// Enhanced Fight Reset
function resetFight() {
    playerHP = enemyHP = maxHP;
    playerUlt = enemyUlt = 0;
    gameState = "playing";
    isPaused = false;

    // Reset character states
    player.classList.remove("attack-move", "hit", "ultimate");
    enemy.classList.remove("attack-move", "hit", "ultimate");

    // Reset glows
    const playerGlow = player.querySelector('.character-glow');
    const enemyGlow = enemy.querySelector('.character-glow');
    if (playerGlow) playerGlow.style.opacity = '0';
    if (enemyGlow) enemyGlow.style.opacity = '0';

    updateBars();
    updateUI();
}

// Enhanced Bar Updates
function updateBars() {
    // Health bars
    const playerHealthPercent = (playerHP / maxHP) * 100;
    const enemyHealthPercent = (enemyHP / maxHP) * 100;

    playerHealthBar.style.width = playerHealthPercent + "%";
    enemyHealthBar.style.width = enemyHealthPercent + "%";

    // Ultimate bars
    const playerUltPercent = (playerUlt / maxUlt) * 100;
    const enemyUltPercent = (enemyUlt / maxUlt) * 100;

    playerUltBar.style.width = playerUltPercent + "%";
    enemyUltBar.style.width = enemyUltPercent + "%";

    // Update text
    playerHealthText.textContent = `${playerHP}/${maxHP}`;
    enemyHealthText.textContent = `${enemyHP}/${maxHP}`;
    playerUltText.textContent = `${playerUlt}/${maxUlt}`;
    enemyUltText.textContent = `${enemyUlt}/${maxUlt}`;

    // Ultimate ready effects
    if (playerUlt === maxUlt) {
        playerUltBar.parentElement.classList.add('ult-ready');
    } else {
        playerUltBar.parentElement.classList.remove('ult-ready');
    }

    if (enemyUlt === maxUlt) {
        enemyUltBar.parentElement.classList.add('ult-ready');
    } else {
        enemyUltBar.parentElement.classList.remove('ult-ready');
    }
}

// Enhanced Damage System
function dealDamage(target, damage, isCrit = false, isUltimate = false) {
    // Create damage number
    createDamageNumber(target, damage, isCrit, isUltimate);

    // Apply screen shake for big hits
    if (isCrit || isUltimate) {
        gameContainer.classList.add('screen-shake');
        setTimeout(() => {
            gameContainer.classList.remove('screen-shake');
        }, 500);
    }

    // Character glow effect
    const glow = target.querySelector('.character-glow');
    if (glow) {
        glow.style.opacity = '1';
        setTimeout(() => {
            glow.style.opacity = '0';
        }, 300);
    }
}

// Create Damage Numbers
function createDamageNumber(target, damage, isCrit = false, isUltimate = false) {
    const damageContainer = target.querySelector('.damage-numbers');
    const damageEl = document.createElement('div');
    damageEl.className = 'damage-number';

    if (isCrit) damageEl.classList.add('crit');
    if (isUltimate) damageEl.classList.add('ultimate');

    damageEl.textContent = `-${damage}`;
    damageEl.style.left = (Math.random() * 40 - 20) + 'px';

    if (damageContainer) {
        damageContainer.appendChild(damageEl);
        setTimeout(() => {
            if (damageEl.parentNode) {
                damageEl.remove();
            }
        }, 1500);
    }
}

// Enhanced Player Attack
function playerAttack() {
    if (gameState !== "playing" || isAttacking || enemyHP <= 0) return;

    isAttacking = true;
    player.classList.add("attack-move");

    player.addEventListener("animationend", () => {
        player.classList.remove("attack-move");
        isAttacking = false;
    }, { once: true });

    // Enemy hit effect
    enemy.classList.add("hit");
    enemy.addEventListener("animationend", () => {
        enemy.classList.remove("hit");
    }, { once: true });

    // Calculate damage
    const isCrit = Math.random() < 0.2;
    const damage = isCrit ? 2 : 1;

    enemyHP = Math.max(0, enemyHP - damage);
    playerUlt = Math.min(maxUlt, playerUlt + 1);

    dealDamage(enemy, damage, isCrit);
    updateBars();
    checkWin();
}

// Enhanced Ultimate Attack
function playerUltimate() {
    if (gameState !== "playing" || playerUlt < maxUlt) return;

    player.classList.add("ultimate");
    shootUltimate();
    playerUlt = 0;
    updateBars();

    setTimeout(() => {
        player.classList.remove("ultimate");
    }, 1000);
}

// Enhanced Ultimate Projectile
function shootUltimate() {
    const playerRect = player.getBoundingClientRect();
    const gameRect = gameArea.getBoundingClientRect();

    const ball = document.createElement("div");
    ball.classList.add("energy-ball");
    ball.style.left = (playerRect.right - gameRect.left - 30) + "px";
    ball.style.top = (playerRect.top - gameRect.top + 100) + "px";

    gameArea.appendChild(ball);

    ball.addEventListener("animationend", () => {
        enemy.classList.add("hit");
        const damage = 3;
        enemyHP = Math.max(0, enemyHP - damage);

        dealDamage(enemy, damage, false, true);
        updateBars();
        checkWin();

        enemy.addEventListener("animationend", () => {
            enemy.classList.remove("hit");
        }, { once: true });

        ball.remove();
    });
}

// Enhanced Enemy AI
function startEnemyAI() {
    setInterval(() => {
        if (gameState === "playing" && enemyHP > 0 && playerHP > 0) {
            enemyAttack();
        }
    }, 3000);

    // Enemy ultimate AI
    setInterval(() => {
        if (gameState === "playing" && enemyHP > 0 && enemyUlt === maxUlt) {
            enemyUltimate();
        }
    }, 5000);
}

function enemyAttack() {
    enemy.classList.add("attack-move");

    setTimeout(() => {
        player.classList.add("hit");
        const damage = 1;
        playerHP = Math.max(0, playerHP - damage);
        enemyUlt = Math.min(maxUlt, enemyUlt + 1);

        dealDamage(player, damage);
        updateBars();
        checkLose();

        player.addEventListener("animationend", () => {
            player.classList.remove("hit");
        }, { once: true });

        enemy.classList.remove("attack-move");
    }, 600);
}

function enemyUltimate() {
    enemy.classList.add("ultimate");

    setTimeout(() => {
        player.classList.add("hit");
        const damage = 3;
        playerHP = Math.max(0, playerHP - damage);
        enemyUlt = 0;

        dealDamage(player, damage, false, true);
        updateBars();
        checkLose();

        player.addEventListener("animationend", () => {
            player.classList.remove("hit");
        }, { once: true });

        enemy.classList.remove("ultimate");
    }, 800);
}

// Win/Lose Conditions
function checkWin() {
    if (enemyHP <= 0) {
        gameState = "story";
        showStoryScreen();
    }
}

function checkLose() {
    if (playerHP <= 0) {
        gameState = "gameover";
        showGameOver();
    }
}

// Enhanced Story Screen
function showStoryScreen() {
    const stage = stages[currentStage];
    storyTitleEl.textContent = `Stage ${currentStage + 1} Complete: ${stage.name}`;
    storyText.textContent = stage.story;
    storyScreen.classList.remove("hidden");

    // Update next button text
    if (currentStage >= stages.length - 1) {
        nextBtn.innerHTML = '<span>Finish Game</span><div class="btn-glow"></div>';
    } else {
        nextBtn.innerHTML = '<span>Next Stage</span><div class="btn-glow"></div>';
    }
}

function hideStoryScreen() {
    storyScreen.classList.add("hidden");
}

// Game Over Screen
function showGameOver() {
    setTimeout(() => {
        if (confirm("Game Over! Would you like to restart this stage?")) {
            resetFight();
        } else {
            currentStage = 0;
            loadStage(currentStage);
            resetFight();
        }
    }, 1000);
}

// Next Stage
function nextStage() {
    hideStoryScreen();

    if (currentStage >= stages.length - 1) {
        showFinalScreen();
        return;
    }

    currentStage++;
    loadStage(currentStage);
    resetFight();
}

function showFinalScreen() {
    storyTitleEl.textContent = "Congratulations!";
    storyText.textContent = "You have completed Kiana's entire journey! From a young Valkyrie to the savior of humanity, you've witnessed her growth and determination. Thank you for playing!";
    nextBtn.innerHTML = '<span>Play Again</span><div class="btn-glow"></div>';
    nextBtn.onclick = () => {
        currentStage = 0;
        loadStage(currentStage);
        resetFight();
        hideStoryScreen();
        nextBtn.onclick = nextStage; // Reset the onclick
    };
    storyScreen.classList.remove("hidden");
}

// Skip Battle
function skipBattle() {
    if (gameState === "playing") {
        gameState = "story";
        showStoryScreen();
    }
}

// Enhanced UI Updates
function updateUI() {
    // Add any additional UI updates here
    // Could include combo counters, special effects, etc.
}

// Event Listeners
function setupEventListeners() {
    // Keyboard controls
    document.addEventListener("keydown", (e) => {
        if (e.code === "Space") {
            e.preventDefault();
            playerAttack();
        }

        if (e.code === "KeyU") {
            e.preventDefault();
            playerUltimate();
        }

        if (e.code === "KeyP") {
            e.preventDefault();
            togglePause();
        }

        if (e.code === "Escape") {
            e.preventDefault();
            if (gameState === "story") {
                hideStoryScreen();
                gameState = "playing";
            }
        }
    });

    // Button events
    nextBtn.addEventListener("click", nextStage);

    const skipBtn = document.getElementById("skipBtn");
    if (skipBtn) {
        skipBtn.addEventListener("click", skipBattle);
    }

    const pauseBtn = document.getElementById("pauseBtn");
    if (pauseBtn) {
        pauseBtn.addEventListener("click", togglePause);
    }

    const muteBtn = document.getElementById("muteBtn");
    if (muteBtn) {
        muteBtn.addEventListener("click", () => {
            audioManager.toggleMute();
            muteBtn.querySelector('span').textContent = audioManager.isMuted ? "🔇" : "🔊";
        });
    }

    // Click to attack (mobile friendly)
    gameArea.addEventListener("click", (e) => {
        if (e.target === gameArea || e.target === player) {
            playerAttack();
        }
    });

    // Double click for ultimate (mobile friendly)
    let clickCount = 0;
    gameArea.addEventListener("click", () => {
        clickCount++;
        setTimeout(() => {
            if (clickCount === 2) {
                playerUltimate();
            }
            clickCount = 0;
        }, 300);
    });
}

// Initialize game when page loads
document.addEventListener("DOMContentLoaded", initGame);

// Prevent context menu on right click
document.addEventListener("contextmenu", (e) => e.preventDefault());

// Handle window focus/blur for auto-pause
window.addEventListener("blur", () => {
    if (gameState === "playing") {
        togglePause();
    }
});

// Performance optimization
function optimizePerformance() {
    // Reduce animations on low-end devices
    if (navigator.hardwareConcurrency < 4) {
        document.body.classList.add('low-performance');
    }
}

// Pause Game
function togglePause() {
    if (gameState === "playing" || gameState === "paused") {
        isPaused = !isPaused;
        gameState = isPaused ? "paused" : "playing";

        const pauseBtn = document.getElementById("pauseBtn");
        if (pauseBtn) {
            pauseBtn.querySelector('span').textContent = isPaused ? "Resume" : "Pause";
        }

        // Visual pause effect
        if (isPaused) {
            gameContainer.style.filter = "grayscale(0.5) blur(2px)";
            // Add pause overlay with resume button
            const pauseOverlay = document.createElement('div');
            pauseOverlay.id = 'pause-overlay';
            pauseOverlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                z-index: 1000;
                color: white;
                font-family: 'Orbitron', monospace;
            `;
            pauseOverlay.innerHTML = `
                <div style="font-size: 48px; text-shadow: 0 0 20px #00ffff; margin-bottom: 30px;">PAUSED</div>
                <button id="resume-btn" class="resume-button" style="
                    padding: 15px 30px;
                    background: linear-gradient(45deg, #00ffff, #0088ff);
                    color: white;
                    border: none;
                    border-radius: 25px;
                    font-size: 18px;
                    font-family: 'Orbitron', monospace;
                    cursor: pointer;
                    box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
                ">
                    <span>Resume Game</span>
                </button>
            `;
            document.body.appendChild(pauseOverlay);

            // Add click handler for resume button
            const resumeBtn = document.getElementById('resume-btn');
            if (resumeBtn) {
                resumeBtn.addEventListener('click', togglePause);
            }
        } else {
            gameContainer.style.filter = "none";
            // Remove pause overlay
            const pauseOverlay = document.getElementById('pause-overlay');
            if (pauseOverlay) {
                pauseOverlay.remove();
            }
        }
    }
}

const resumeButtonStyle = `
.resume-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 25px rgba(0, 255, 255, 0.7);
}

.resume-button:active {
    transform: translateY(0);
    box-shadow: 0 2px 15px rgba(0, 255, 255, 0.5);
}
`;

// Call performance optimization
optimizePerformance();
