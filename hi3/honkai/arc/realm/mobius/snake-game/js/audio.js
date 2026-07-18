/**
 * audio.js
 * ----------------------------------------------------------------------------
 * All sound playback lives here. The AudioContext is created lazily (browsers
 * block it until a user gesture) and shared process-wide through
 * AudioContextLoader. AudioManager exposes:
 *
 *   - playEffect(key)         : one-shot sound effect (eat, bomb, ...)
 *   - startMusic() / stopMusic(): looped background music
 *   - pauseMusic() / resumeMusic(): pause and resume from the SAME timestamp
 *   - setMusicEnabled(bool)  : master music on/off toggle (persists to localStorage)
 *
 * Everything is loaded through AssetManager so swapping audio files requires
 * no code changes. If a buffer is missing, the call is a silent no-op so the
 * game keeps running.
 */

// ---------------------------------------------------------------------------
// Shared AudioContext management.
// ---------------------------------------------------------------------------

/**
 * AudioContextLoader owns the single AudioContext used by the whole app.
 * Browsers require an AudioContext to be resumed after a user gesture, so we
 * create it lazily and expose a `resume()` helper to call on first input.
 */
export class AudioContextLoader {
  static _ctx = null;

  static getContext() {
    if (!AudioContextLoader._ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      AudioContextLoader._ctx = new Ctx();
    }
    return AudioContextLoader._ctx;
  }

  static resume() {
    const ctx = AudioContextLoader.getContext();
    if (ctx.state === "suspended") {
      return ctx.resume();
    }
    return Promise.resolve();
  }

  static get currentTime() {
    return AudioContextLoader.getContext().currentTime;
  }
}

// ---------------------------------------------------------------------------
// AudioManager
// ---------------------------------------------------------------------------

const MUSIC_ENABLED_KEY = "snake.musicEnabled";

export class AudioManager {
  constructor(assetManager) {
    this.assets = assetManager;
    this.ctx = AudioContextLoader.getContext();

    // Master gain so we have a single volume knob for everything.
    this.master = this.ctx.createGain();
    this.master.gain.value = 1.0;
    this.master.connect(this.ctx.destination);

    // The looping music source and the timestamp it was at when paused, so
    // resume() can pick up exactly where pause() left off.
    this.musicSource = null;
    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = 0.5;
    this.musicGain.connect(this.master);
    this._musicStartOffset = 0; // seconds into the track
    this._musicStartedAt = 0;   // ctx.currentTime when playback (re)started
    this._musicPlaying = false;

    // Master music toggle (ON by default), persisted across reloads.
    const stored = localStorage.getItem(MUSIC_ENABLED_KEY);
    this._musicEnabled = stored === null ? true : stored === "1";
  }

  // -- Sound effects --------------------------------------------------------

  /**
   * Play a one-shot effect by asset key. `vol` is 0..1.
   */
  playEffect(key, vol = 1.0) {
    const buffer = this.assets.getSound(key);
    if (!buffer) return;
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.value = vol;
    src.connect(gain).connect(this.master);
    src.start();
  }

  // -- Background music -----------------------------------------------------

  /**
   * Is the master music toggle currently on?
   */
  get musicEnabled() {
    return this._musicEnabled;
  }

  /**
   * Turn the master music toggle on/off and persist the choice. When turning
   * off, any playing music is stopped; when turning on while a game is in
   * progress, music restarts from the beginning (callers that want
   * pause/resume semantics use pauseMusic/resumeMusic instead).
   */
  setMusicEnabled(enabled) {
    this._musicEnabled = !!enabled;
    localStorage.setItem(MUSIC_ENABLED_KEY, this._musicEnabled ? "1" : "0");
    if (!this._musicEnabled) {
      this.stopMusic();
    }
    return this._musicEnabled;
  }

  /**
   * Begin looping the music track from the start. No-op if music is disabled
   * or already playing.
   */
  startMusic() {
    if (!this._musicEnabled) return;
    if (this._musicPlaying) return;
    const buffer = this.assets.getSound("music");
    if (!buffer) return;

    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    src.connect(this.musicGain);
    // Start from the beginning (offset 0).
    src.start(0, 0);
    this.musicSource = src;
    this._musicStartOffset = 0;
    this._musicStartedAt = this.ctx.currentTime;
    this._musicPlaying = true;
  }

  /**
   * Hard-stop music and reset the playhead to 0.
   */
  stopMusic() {
    if (this.musicSource) {
      try {
        this.musicSource.stop();
      } catch (e) {
        /* already stopped */
      }
      this.musicSource.disconnect();
      this.musicSource = null;
    }
    this._musicStartOffset = 0;
    this._musicPlaying = false;
  }

  /**
   * Pause music, remembering the exact timestamp so resume() continues from
   * the same spot.
   */
  pauseMusic() {
    if (!this._musicPlaying || !this.musicSource) return;
    // Compute how far into the loop we are, wrapping by the buffer duration.
    const buffer = this.assets.getSound("music");
    const duration = buffer ? buffer.duration : 0;
    const elapsed = this.ctx.currentTime - this._musicStartedAt;
    const offset = (this._musicStartOffset + elapsed) % (duration || 1);
    this._musicStartOffset = offset;

    try {
      this.musicSource.stop();
    } catch (e) {
      /* already stopped */
    }
    this.musicSource.disconnect();
    this.musicSource = null;
    this._musicPlaying = false;
  }

  /**
   * Resume music from the timestamp captured by pauseMusic().
   */
  resumeMusic() {
    if (!this._musicEnabled) return;
    if (this._musicPlaying) return;
    const buffer = this.assets.getSound("music");
    if (!buffer) return;

    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    src.connect(this.musicGain);
    src.start(0, this._musicStartOffset % buffer.duration);
    this.musicSource = src;
    this._musicStartedAt = this.ctx.currentTime;
    this._musicPlaying = true;
  }

  /**
   * Convenience: is music currently playing?
   */
  get musicPlaying() {
    return this._musicPlaying;
  }
}
