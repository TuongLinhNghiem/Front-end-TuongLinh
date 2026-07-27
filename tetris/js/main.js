/* ============================================================
   main.js — Entry point.
   Instantiates the Game, initializes audio on first interaction,
   and starts the main menu.
   ============================================================ */

(function () {
  const canvas = document.getElementById("game-canvas");
  const game = new Game(canvas);

  // Expose for debugging
  window.__game = game;

  // Initialize audio on first user interaction (browser autoplay policy)
  const initAudioOnce = () => {
    AudioManager.init();
    AudioManager.resume();
    document.removeEventListener("click", initAudioOnce);
    document.removeEventListener("keydown", initAudioOnce);
  };
  document.addEventListener("click", initAudioOnce);
  document.addEventListener("keydown", initAudioOnce);

  // Enable keyboard input
  game.enableInput();

  // Start at the menu
  game.start();

  console.log("Tetris initialized. Enjoy!");
})();
