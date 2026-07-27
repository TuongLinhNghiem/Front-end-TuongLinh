/* ============================================================
   audioManager.js — Procedural audio via Web Audio API.
   All sounds are synthesized in code (no audio files needed).
   Includes SFX and a simple looping background music track.
   ============================================================ */

const AudioManager = (function () {
  let ctx = null;
  let masterGain = null;
  let musicGain = null;
  let sfxGain = null;
  let muted = false;
  let musicTimer = null;

  function init() {
    if (ctx) return;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = ctx.createGain();
      masterGain.gain.value = 0.6;
      masterGain.connect(ctx.destination);
      sfxGain = ctx.createGain();
      sfxGain.gain.value = 0.7;
      sfxGain.connect(masterGain);
      musicGain = ctx.createGain();
      musicGain.gain.value = 0;
      musicGain.connect(masterGain);
    } catch (e) {
      console.warn("Audio init failed:", e);
    }
  }

  function resume() {
    if (ctx && ctx.state === "suspended") ctx.resume();
  }

  // Play a simple tone with envelope
  function tone(freq, duration, type, volume, whenOffset) {
    if (!ctx || muted) return;
    const t0 = ctx.currentTime + (whenOffset || 0);
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type || "sine";
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(volume || 0.3, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
    osc.connect(g);
    g.connect(sfxGain);
    osc.start(t0);
    osc.stop(t0 + duration + 0.05);
  }

  // Noise burst (for hard drop, line clear)
  function noise(duration, volume, filterFreq) {
    if (!ctx || muted) return;
    const t0 = ctx.currentTime;
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = filterFreq || 1000;
    const g = ctx.createGain();
    g.gain.value = volume || 0.3;
    src.connect(filter);
    filter.connect(g);
    g.connect(sfxGain);
    src.start(t0);
    src.stop(t0 + duration);
  }

  // Named sound effects — modular, easy to replace
  const sfx = {
    move()     { tone(200, 0.03, "square", 0.08); },
    rotate()   { tone(330, 0.05, "square", 0.12); },
    softDrop() { tone(150, 0.03, "sawtooth", 0.06); },
    hardDrop() { noise(0.15, 0.3, 800); tone(100, 0.15, "sawtooth", 0.2); },
    lock()     { tone(120, 0.08, "square", 0.15); },
    lineClear(){
      tone(523, 0.08, "triangle", 0.25);
      tone(659, 0.08, "triangle", 0.25, 0.06);
      tone(784, 0.12, "triangle", 0.25, 0.12);
    },
    tetris()   {
      tone(523, 0.08, "triangle", 0.3);
      tone(659, 0.08, "triangle", 0.3, 0.06);
      tone(784, 0.08, "triangle", 0.3, 0.12);
      tone(1047, 0.2, "triangle", 0.3, 0.18);
      noise(0.3, 0.2, 2000);
    },
    levelUp()  {
      tone(523, 0.1, "sine", 0.3);
      tone(659, 0.1, "sine", 0.3, 0.1);
      tone(784, 0.1, "sine", 0.3, 0.2);
      tone(1047, 0.3, "sine", 0.3, 0.3);
    },
    hold()     { tone(440, 0.06, "sine", 0.15); tone(660, 0.08, "sine", 0.15, 0.05); },
    gameOver() {
      tone(440, 0.15, "sawtooth", 0.25);
      tone(330, 0.15, "sawtooth", 0.25, 0.12);
      tone(220, 0.4, "sawtooth", 0.25, 0.24);
    },
    combo()    { tone(880, 0.06, "sine", 0.15); tone(1175, 0.08, "sine", 0.15, 0.05); },
    menuClick(){ tone(440, 0.05, "sine", 0.2); tone(660, 0.08, "sine", 0.2, 0.04); },
  };

  // Simple background music — a pleasant arpeggio loop
  function startMusic() {
    if (!ctx || muted) return;
    stopMusic();
    musicGain.gain.cancelScheduledValues(ctx.currentTime);
    musicGain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 1);
    scheduleMusicLoop();
  }

  function scheduleMusicLoop() {
    if (!ctx) return;
    // C minor pentatonic-ish loop
    const notes = [261.63, 311.13, 349.23, 392.00, 466.16, 392.00, 349.23, 311.13];
    let step = 0;
    function nextNote() {
      if (!musicGain || muted) return;
      const t0 = ctx.currentTime;
      const freq = notes[step % notes.length];
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, t0);
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(0.4, t0 + 0.03);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.35);
      osc.connect(g);
      g.connect(musicGain);
      osc.start(t0);
      osc.stop(t0 + 0.4);
      step++;
      musicTimer = setTimeout(nextNote, 300);
    }
    nextNote();
  }

  function stopMusic() {
    if (musicTimer) { clearTimeout(musicTimer); musicTimer = null; }
    if (musicGain && ctx) {
      musicGain.gain.cancelScheduledValues(ctx.currentTime);
      musicGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
    }
  }

  function setMuted(m) {
    muted = m;
    if (muted) stopMusic();
  }

  function isMuted() { return muted; }

  return {
    init, resume, sfx,
    startMusic, stopMusic, setMuted, isMuted,
  };
})();

window.AudioManager = AudioManager;
