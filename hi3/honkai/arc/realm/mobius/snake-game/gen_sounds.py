#!/usr/bin/env python3
"""Generate placeholder WAV sound effects and a short looping music track.
All files are written into snake-game/asset/sounds/ and referenced by
js/audio.js. Replace them with real audio later without touching the code.
No external libraries are required."""
import os
import wave
import struct
import math
import random

SND_DIR = os.path.join(os.path.dirname(__file__), "asset", "sounds")
os.makedirs(SND_DIR, exist_ok=True)

SR = 44100  # sample rate


def write_wav(name, samples):
    path = os.path.join(SND_DIR, name)
    with wave.open(path, "w") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        frames = b"".join(struct.pack("<h", max(-32767, min(32767, int(s * 32767)))) for s in samples)
        w.writeframes(frames)
    print("wrote", path)


def tone(freq, dur, vol=0.4, decay=6.0, wave_type="sine"):
    n = int(SR * dur)
    out = []
    for i in range(n):
        t = i / SR
        env = math.exp(-decay * t)
        if wave_type == "sine":
            v = math.sin(2 * math.pi * freq * t)
        elif wave_type == "square":
            v = 1.0 if math.sin(2 * math.pi * freq * t) >= 0 else -1.0
        elif wave_type == "saw":
            v = 2 * (t * freq - math.floor(t * freq + 0.5))
        else:
            v = math.sin(2 * math.pi * freq * t)
        out.append(v * env * vol)
    return out


def sweep(f0, f1, dur, vol=0.4, decay=3.0):
    n = int(SR * dur)
    out = []
    for i in range(n):
        t = i / SR
        f = f0 + (f1 - f0) * (t / dur)
        env = math.exp(-decay * t)
        v = math.sin(2 * math.pi * f * t)
        out.append(v * env * vol)
    return out


def noise_burst(dur, vol=0.4, decay=8.0, lp=0.3):
    n = int(SR * dur)
    out = []
    prev = 0.0
    for i in range(n):
        t = i / SR
        env = math.exp(-decay * t)
        w = random.uniform(-1, 1)
        prev = prev + lp * (w - prev)  # simple low-pass
        out.append(prev * env * vol)
    return out


def mix(*tracks):
    n = max(len(t) for t in tracks)
    out = [0.0] * n
    for t in tracks:
        for i, s in enumerate(t):
            out[i] += s
    # normalize to avoid clipping
    peak = max(abs(s) for s in out) or 1.0
    if peak > 1.0:
        out = [s / peak for s in out]
    return out


def concat(*tracks):
    out = []
    for t in tracks:
        out.extend(t)
    return out


# 1. Eat regular food - short blip
write_wav("eat_regular.wav", tone(660, 0.12, vol=0.5, decay=18))

# 2. Eat big food - rising chord
write_wav("eat_big.wav", mix(tone(523, 0.25, vol=0.35, decay=6),
                             tone(659, 0.25, vol=0.35, decay=6),
                             tone(784, 0.25, vol=0.35, decay=6)))

# 3. Bomb - noise burst + low boom
write_wav("bomb.wav", mix(noise_burst(0.4, vol=0.5, decay=6, lp=0.2),
                          tone(80, 0.5, vol=0.5, decay=5, wave_type="sine")))

# 4. Button click - quick tick
write_wav("click.wav", tone(1200, 0.05, vol=0.4, decay=40, wave_type="square"))

# 5. Win - ascending arpeggio
write_wav("win.wav", concat(tone(523, 0.15, vol=0.4, decay=6),
                            tone(659, 0.15, vol=0.4, decay=6),
                            tone(784, 0.15, vol=0.4, decay=6),
                            tone(1047, 0.4, vol=0.4, decay=3)))

# 6. Game over - descending tones
write_wav("game_over.wav", concat(tone(440, 0.2, vol=0.4, decay=5),
                                  tone(349, 0.2, vol=0.4, decay=5),
                                  tone(262, 0.5, vol=0.4, decay=3)))

# 7. Background music - a short looping arpeggio pattern (~8s)
def music_pattern():
    notes = [262, 330, 392, 523, 392, 330, 294, 330]  # C major-ish
    beat = 0.22
    out = []
    for rep in range(4):
        for f in notes:
            out.extend(tone(f, beat, vol=0.18, decay=8))
        # bass
    return out

music = music_pattern()
# add a soft bass layer
bass = []
for rep in range(4):
    for f in [131, 131, 196, 196]:
        bass.extend(tone(f, 0.44, vol=0.12, decay=4, wave_type="sine"))
# pad to same length
mlen = max(len(music), len(bass))
music += [0.0] * (mlen - len(music))
bass += [0.0] * (mlen - len(bass))
write_wav("music.wav", mix(music, bass))

print("All sounds generated.")
