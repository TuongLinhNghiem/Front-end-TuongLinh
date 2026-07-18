/**
 * assets.js
 * ----------------------------------------------------------------------------
 * Central asset registry and loader. Every image and sound is referenced by
 * a single string key here, and every other module asks AssetManager for an
 * asset by that key instead of hard-coding a path. This means you can swap
 * the placeholder files in `asset/images/` and `asset/sounds/` for real art
 * later WITHOUT touching any game code - just keep the same file names (or
 * edit the two path maps below).
 *
 * The manager loads everything up front and resolves a Promise once all
 * images are decoded and all audio buffers are ready (or failed, so the game
 * can still start with silent/invisible placeholders).
 */

import { AudioContextLoader } from "./audio.js";

// Map of asset key -> relative file path. Keep keys stable; these are what
// the rest of the codebase references.
const IMAGE_PATHS = {
  head: "asset/images/snake_head.png",
  follower: "asset/images/snake_follower.png",
  foodRegular: "asset/images/food_regular.png",
  foodBig: "asset/images/food_big.png",
  bomb: "asset/images/bomb.png",
  background: "asset/images/background.png",
  menuBackground: "asset/images/menu_background.png",
};

const SOUND_PATHS = {
  eatRegular: "asset/sounds/eat_regular.wav",
  eatBig: "asset/sounds/eat_big.wav",
  bomb: "asset/sounds/bomb.wav",
  click: "asset/sounds/click.wav",
  win: "asset/sounds/win.wav",
  gameOver: "asset/sounds/game_over.wav",
  music: "asset/sounds/music.wav",
};

/**
 * AssetManager loads images as HTMLImageElement and sounds as decoded
 * AudioBuffers (via the shared AudioContextLoader). It tolerates missing or
 * unreadable files so the game degrades gracefully when placeholders are
 * replaced with bad data.
 */
export class AssetManager {
  constructor() {
    this.images = {};
    this.sounds = {};
    this.imageErrors = new Set();
    this.soundErrors = new Set();
  }

  /**
   * Load all declared assets. Returns a Promise that resolves once every
   * asset has either loaded or errored (we never reject - the game should
   * still start even if a file is missing).
   */
  async loadAll(onProgress = null) {
    const imageEntries = Object.entries(IMAGE_PATHS);
    const soundEntries = Object.entries(SOUND_PATHS);
    const total = imageEntries.length + soundEntries.length;
    let done = 0;

    const tick = () => {
      done += 1;
      if (onProgress) onProgress(done, total);
    };

    const imagePromises = imageEntries.map(([key, path]) =>
      this.loadImage(key, path).finally(tick)
    );
    const soundPromises = soundEntries.map(([key, path]) =>
      this.loadSound(key, path).finally(tick)
    );

    await Promise.all([...imagePromises, ...soundPromises]);
  }

  /**
   * Load and decode a single image.
   */
  loadImage(key, path) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        this.images[key] = img;
        resolve();
      };
      img.onerror = () => {
        // Mark as missing; the renderer will draw a colored fallback.
        this.imageErrors.add(key);
        console.warn(`[assets] image failed to load: ${path}`);
        resolve();
      };
      img.src = path;
    });
  }

  /**
   * Load and decode a single sound into an AudioBuffer. Requires an
   * AudioContext (created lazily inside AudioContextLoader) so the buffer is
   * decoded against the right sample rate.
   */
  async loadSound(key, path) {
    try {
      const ctx = AudioContextLoader.getContext();
      const res = await fetch(path);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const arr = await res.arrayBuffer();
      const buffer = await ctx.decodeAudioData(arr.slice(0));
      this.sounds[key] = buffer;
    } catch (err) {
      this.soundErrors.add(key);
      console.warn(`[assets] sound failed to load: ${path}`, err);
    }
  }

  /** Get a loaded image, or null if missing. */
  getImage(key) {
    return this.images[key] || null;
  }

  /** Get a loaded AudioBuffer, or null if missing. */
  getSound(key) {
    return this.sounds[key] || null;
  }

  /** True if the image for a key loaded successfully. */
  hasImage(key) {
    return !!this.images[key];
  }

  /** True if the sound for a key loaded successfully. */
  hasSound(key) {
    return !!this.sounds[key];
  }
}

// A single shared instance the rest of the app imports.
export const assets = new AssetManager();
