/* ============================================================
   main.js - Entry point. Bootstraps the Game instance.
   ============================================================ */

(function () {
  const canvas = document.getElementById("game-canvas");
  const game = new Game(canvas);

  // Expose for debugging in browser console
  window.__game = game;

  // Ensure audio is initialized on first user interaction (browser autoplay policy)
  const initAudioOnce = () => {
    AudioManager.init();
    AudioManager.resume();
    document.removeEventListener("click", initAudioOnce);
    document.removeEventListener("keydown", initAudioOnce);
  };
  document.addEventListener("click", initAudioOnce);
  document.addEventListener("keydown", initAudioOnce);

  // Set initial menu state
  game.state = GameState.MENU;
  document.getElementById("menu-screen").classList.remove("hidden");
  game.updateMenuSaveInfo();

  console.log("Gold Miner game initialized. Enjoy!");
})();
