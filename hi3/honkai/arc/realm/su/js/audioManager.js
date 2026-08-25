/* ============================================================
   audioManager.js — Procedural audio via the Web Audio API.
   All sound effects and background music are synthesized —
   no external audio files needed.  Must be initialized after
   a user interaction (browser autoplay policy).
   ============================================================ */

const AudioManager = (function () {
  let ctx = null;
  let masterGain = null;
  let musicGain = null;
  let sfxGain = null;
  let muted = false;
  let musicTimer = null;
  let musicPlaying = false;

  // A simple ascending melody loop for background music
  const MUSIC_NOTES = [
    [523.25, 0.3], [659.25, 0.3], [783.99, 0.3], [659.25, 0.3],
    [523.25, 0.3], [659.25, 0.3], [783.99, 0.3], [880.00, 0.3],
    [698.46, 0.3], [587.33, 0.3], [523.25, 0.3], [587.33, 0.3],
    [659.25, 0.3], [587.33, 0.3], [523.25, 0.3], [493.88, 0.3],
  ];
  let musicIndex = 0;

  function init() {
    if (ctx) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      masterGain = ctx.createGain();
      masterGain.gain.value = muted ? 0 : 0.6;
      masterGain.connect(ctx.destination);

      musicGain = ctx.createGain();
      musicGain.gain.value = 0.15;
      musicGain.connect(masterGain);

      sfxGain = ctx.createGain();
      sfxGain.gain.value = 0.5;
      sfxGain.connect(masterGain);
    } catch (e) {
      console.warn('AudioManager init failed', e);
    }
  }

  // Play a single tone with an envelope
  function tone(freq, duration, type = 'square', vol = 0.5, dest = null) {
    if (!ctx || muted) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(dest || sfxGain);
    osc.start();
    osc.stop(ctx.currentTime + duration + 0.05);
  }

  // ---- Public SFX ----
  function move()       { tone(440, 0.05, 'square', 0.15); }
  function rotate()     { tone(550, 0.08, 'square', 0.2); }
  function softDrop()   { tone(220, 0.04, 'sine', 0.1); }
  function hardDrop()   {
    tone(150, 0.15, 'sawtooth', 0.3);
    tone(100, 0.2, 'sine', 0.2);
  }
  function lock()       { tone(300, 0.1, 'triangle', 0.2); }
  function hold()       { tone(600, 0.1, 'square', 0.2); }

  function lineClear(lines) {
    const freqs = { 1: [659], 2: [659, 784], 3: [659, 784, 988], 4: [523, 659, 784, 1047] };
    const f = freqs[lines] || freqs[1];
    f.forEach((fr, i) => {
      setTimeout(() => tone(fr, 0.15, 'sine', 0.3), i * 60);
    });
  }

  function tetris() {
    [523, 659, 784, 988, 1319].forEach((f, i) => {
      setTimeout(() => tone(f, 0.2, 'square', 0.3), i * 50);
    });
  }

  function levelUp() {
    [392, 523, 659, 784, 1047].forEach((f, i) => {
      setTimeout(() => tone(f, 0.2, 'square', 0.3), i * 80);
    });
  }

  function combo(n) {
    tone(800 + n * 100, 0.1, 'square', 0.25);
  }

  function gameOver() {
    [392, 349, 311, 262].forEach((f, i) => {
      setTimeout(() => tone(f, 0.4, 'triangle', 0.3), i * 150);
    });
  }

  function menuClick() { tone(600, 0.08, 'square', 0.2); }

  // ---- Background music loop ----
  function playMusicNote() {
    if (!musicPlaying || muted) return;
    const [freq, dur] = MUSIC_NOTES[musicIndex % MUSIC_NOTES.length];
    tone(freq, dur, 'triangle', 0.6, musicGain);
    musicIndex++;
    musicTimer = setTimeout(playMusicNote, dur * 1000);
  }

  function startMusic() {
    if (!ctx) init();
    if (!ctx || musicPlaying) return;
    musicPlaying = true;
    musicIndex = 0;
    playMusicNote();
  }

  function stopMusic() {
    musicPlaying = false;
    if (musicTimer) {
      clearTimeout(musicTimer);
      musicTimer = null;
    }
  }

  // ---- Mute ----
  function setMuted(m) {
    muted = m;
    if (masterGain) {
      masterGain.gain.value = m ? 0 : 0.6;
    }
  }

  function isMuted() { return muted; }

  return {
    init,
    move, rotate, softDrop, hardDrop, lock, hold,
    lineClear, tetris, levelUp, combo, gameOver, menuClick,
    startMusic, stopMusic,
    setMuted, isMuted,
  };
})();

window.AudioManager = AudioManager;
