/**
 * menu.js
 * ----------------------------------------------------------------------------
 * The main menu overlay. It is a plain DOM overlay (not drawn on the canvas)
 * so it stays crisp and accessible. The menu offers:
 *   - Play          : start a game with the currently selected difficulty
 *   - Difficulty    : toggle between Normal and Hell
 *   - Exit          : show a goodbye / confirmation (browsers can't truly
 *                     close a tab scriptatically, so we show a message)
 *
 * MenuManager shows/hides the overlay and wires up its buttons, emitting
 * high-level intents (play, changeDifficulty, exit) through callbacks.
 */

import { DIFFICULTIES } from "./utils.js";

export class MenuManager {
  constructor(rootEl, { onPlay, onDifficultyChange, onExit }) {
    this.root = rootEl;
    this.onPlay = onPlay || (() => {});
    this.onDifficultyChange = onDifficultyChange || (() => {});
    this.onExit = onExit || (() => {});
    this.selectedDifficulty = "normal";
    this._buildDom();
  }

  /**
   * Build the menu DOM once. Styling comes from style.css via class names.
   */
  _buildDom() {
    this.root.innerHTML = "";
    this.root.classList.add("menu-overlay");

    const card = document.createElement("div");
    card.className = "menu-card";

    const title = document.createElement("h1");
    title.className = "menu-title";
    title.textContent = "🐍 SNAKE";
    card.appendChild(title);

    const subtitle = document.createElement("p");
    subtitle.className = "menu-subtitle";
    subtitle.textContent = "Head leads. Followers follow.";
    card.appendChild(subtitle);

    // Difficulty selector.
    const diffWrap = document.createElement("div");
    diffWrap.className = "menu-difficulty";
    const diffLabel = document.createElement("span");
    diffLabel.className = "menu-difficulty-label";
    diffLabel.textContent = "Difficulty";
    diffWrap.appendChild(diffLabel);

    const diffButtons = document.createElement("div");
    diffButtons.className = "menu-difficulty-buttons";
    this.diffButtons = {};
    for (const key of ["normal", "hell"]) {
      const b = document.createElement("button");
      b.className = "menu-btn menu-diff-btn";
      b.dataset.diff = key;
      b.textContent = DIFFICULTIES[key].label;
      b.addEventListener("click", () => this._selectDifficulty(key));
      this.diffButtons[key] = b;
      diffButtons.appendChild(b);
    }
    diffWrap.appendChild(diffButtons);
    card.appendChild(diffWrap);

    // Primary actions.
    const playBtn = document.createElement("button");
    playBtn.className = "menu-btn menu-btn-primary";
    playBtn.textContent = "Play";
    playBtn.addEventListener("click", () => this.onPlay(this.selectedDifficulty));
    card.appendChild(playBtn);

    const exitBtn = document.createElement("button");
    exitBtn.className = "menu-btn menu-btn-secondary";
    exitBtn.textContent = "Exit";
    exitBtn.addEventListener("click", () => this.onExit());
    card.appendChild(exitBtn);

    // Goodbye message area (hidden until Exit is pressed).
    const goodbye = document.createElement("div");
    goodbye.className = "menu-goodbye hidden";
    goodbye.textContent =
      "Thanks for playing! You can close this tab whenever you like.";
    card.appendChild(goodbye);
    this.goodbyeEl = goodbye;

    this.root.appendChild(card);

    // Highlight the default difficulty.
    this._selectDifficulty(this.selectedDifficulty);
  }

  /**
   * Select a difficulty and update button highlight + notify the game.
   */
  _selectDifficulty(key) {
    if (!DIFFICULTIES[key]) return;
    this.selectedDifficulty = key;
    for (const k of Object.keys(this.diffButtons)) {
      this.diffButtons[k].classList.toggle("active", k === key);
    }
    this.onDifficultyChange(key);
  }

  show() {
    this.root.classList.remove("hidden");
    this.goodbyeEl.classList.add("hidden");
  }

  hide() {
    this.root.classList.add("hidden");
  }

  showGoodbye() {
    this.goodbyeEl.classList.remove("hidden");
  }
}
