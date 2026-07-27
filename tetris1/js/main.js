/* ============================================================
   main.js — Entry point.  Bootstraps the game, waits for the
   DOM to be ready, then creates the TetrisGame instance and
   starts the loop.  Audio is initialized on first interaction.
   ============================================================ */

(function () {
  function boot() {
    const game = new TetrisGame();
    game.start();
    window.__tetris = game; // expose for debugging
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
