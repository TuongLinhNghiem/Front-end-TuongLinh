/**
 * main.js
 * ----------------------------------------------------------------------------
 * Application entry point. It wires the DOM (sidebar HUD, menu overlay, the
 * canvas container) to the Game instance, handles window resizing, and loads
 * all assets before showing the menu. Nothing game-specific lives here - this
 * is purely bootstrap and glue.
 */

import { assets } from "./js/assets.js";
import { Game } from "./js/game.js";
import { MenuManager } from "./js/menu.js";
import { GAME_STATE } from "./js/utils.js";
import { AudioContextLoader } from "./js/audio.js";

// ---------------------------------------------------------------------------
// DOM references
// ---------------------------------------------------------------------------
const canvas = document.getElementById("game-canvas");
const canvasContainer = document.getElementById("canvas-container");
const menuRoot = document.getElementById("menu-root");

// HUD elements (sidebar).
const hud = {
  difficulty: document.getElementById("hud-difficulty"),
  snakeLength: document.getElementById("hud-snake-length"),
  score: document.getElementById("hud-score"),
  musicBtn: document.getElementById("btn-music"),
  pauseBtn: document.getElementById("btn-pause"),
  restartBtn: document.getElementById("btn-restart"),
  exitBtn: document.getElementById("btn-exit"),
};

// ---------------------------------------------------------------------------
// Loading screen handling
// ---------------------------------------------------------------------------
const loadingEl = document.getElementById("loading");
const loadingBar = document.getElementById("loading-bar");
const loadingText = document.getElementById("loading-text");

function showLoadingProgress(done, total) {
  const pct = total ? Math.round((done / total) * 100) : 100;
  if (loadingBar) loadingBar.style.width = pct + "%";
  if (loadingText) loadingText.textContent = `Loading assets… ${done}/${total}`;
}

// ---------------------------------------------------------------------------
// Menu
// ---------------------------------------------------------------------------
const menu = new MenuManager(menuRoot, {
  onPlay: (difficultyId) => {
    menu.hide();
    game.start(difficultyId);
  },
  onDifficultyChange: () => {
    // Selection is remembered by the menu; nothing else to do here.
  },
  onExit: () => {
    menu.showGoodbye();
    if (game) game.audio.playEffect("click");
  },
});

// ---------------------------------------------------------------------------
// Game
// ---------------------------------------------------------------------------
const game = new Game({
  canvas,
  assets,
  hud,
  onStateChange: (state) => {
    // Reflect pause button label based on state.
    if (state === GAME_STATE.PAUSED) {
      hud.pauseBtn.textContent = "Resume";
      hud.pauseBtn.dataset.state = "paused";
    } else if (state === GAME_STATE.PLAYING) {
      hud.pauseBtn.textContent = "Pause";
      hud.pauseBtn.dataset.state = "playing";
    } else {
      // Menu / won / lost: reset the label to its default.
      hud.pauseBtn.textContent = "Pause";
      delete hud.pauseBtn.dataset.state;
    }
    // Disable sidebar action buttons appropriately when not in an active game.
    const inGame =
      state === GAME_STATE.PLAYING ||
      state === GAME_STATE.PAUSED ||
      state === GAME_STATE.WON ||
      state === GAME_STATE.LOST;
    hud.pauseBtn.disabled = !inGame;
    hud.restartBtn.disabled = !inGame;
    hud.exitBtn.disabled = !inGame;
  },
  onStatsChange: (stats) => {
    hud.difficulty.textContent = stats.difficulty;
    hud.snakeLength.textContent = stats.snakeLength;
    hud.score.textContent = stats.score;
    hud.musicBtn.textContent = stats.musicOn ? "Music: ON" : "Music: OFF";
    hud.musicBtn.dataset.on = stats.musicOn ? "1" : "0";
  },
});

// ---------------------------------------------------------------------------
// Sidebar button wiring
// ---------------------------------------------------------------------------

// Any user gesture should resume the AudioContext (browser autoplay policy).
function unlockAudio() {
  AudioContextLoader.resume();
}
document.addEventListener("pointerdown", unlockAudio, { once: true });
document.addEventListener("keydown", unlockAudio, { once: true });

function clickSound() {
  game.audio.playEffect("click");
}

hud.musicBtn.addEventListener("click", () => {
  clickSound();
  game.toggleMusic();
});

hud.pauseBtn.addEventListener("click", () => {
  clickSound();
  game.togglePause();
});

hud.restartBtn.addEventListener("click", () => {
  clickSound();
  game.restart();
});

hud.exitBtn.addEventListener("click", () => {
  clickSound();
  game.exitToMenu();
  menu.show();
});

// Expose for debugging (handy in the browser console).
window.__game = game;
window.__menu = menu;

// ---------------------------------------------------------------------------
// Responsive canvas sizing
// ---------------------------------------------------------------------------
function resizeCanvas() {
  const rect = canvasContainer.getBoundingClientRect();
  game.resize(rect.width, rect.height);
}

window.addEventListener("resize", resizeCanvas);

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------
(async function boot() {
  try {
    await assets.loadAll(showLoadingProgress);
  } catch (e) {
    console.error("Asset loading error", e);
  }

  // Hide loading screen, show menu.
  if (loadingEl) loadingEl.classList.add("hidden");
  menu.show();

  // Initial sizing + a render of an empty board behind the menu.
  resizeCanvas();
})();
