# Tetris Clone - Build Plan

## Phase 1: Project Structure & Core Files
- [x] Inspect existing project structure
- [x] Create tetris/ directory structure
- [x] index.html (canvas + UI containers)
- [x] style.css (menus, HUD, board, animations)
- [x] main.js (entry, boot)

## Phase 2: Core Gameplay Modules
- [x] constants.js (config: controls, colors, dimensions, speed table)
- [x] tetromino.js (piece definitions, SRS shapes, rotations)
- [x] board.js (grid, collision, line detection, line clear)
- [x] spawner.js (7-bag randomizer)
- [x] rotation.js (SRS rotation + wall kicks)
- [x] ghost.js (ghost piece projection)
- [x] hold.js (hold piece system)

## Phase 3: Game Systems
- [x] scoring.js (line-based scoring, combo, back-to-back)
- [x] levelSystem.js (level progression, gravity speed table)
- [x] audioManager.js (Web Audio API procedural sounds)
- [x] saveManager.js (localStorage high score)
- [x] inputManager.js (keyboard handling, DAS/ARR)
- [x] game.js (game loop, state machine, integration)

## Phase 4: UI & Integration
- [x] uiManager.js (HUD update, next/hold rendering, line flash, game over)
- [x] All game states (menu, playing, paused, game over)
- [x] Visual effects (line clear flash, screen shake, particles)

## Phase 5: Testing & Polish
- [x] Test all 7 pieces (spawn, move, rotate, lock)
- [x] Test collision detection
- [x] Test line clearing (single/double/triple/tetris)
- [x] Test hold, ghost, 7-bag
- [x] Test scoring, leveling, combo
- [x] Test pause/resume
- [x] Test game over, restart (Play Again button)
- [x] Test save/high score persistence
- [x] Syntax error check & bug fixes
- [x] Serve & verify end-to-end
- [x] Clean up test files
- [x] Create README documentation
- [x] Final delivery summary
