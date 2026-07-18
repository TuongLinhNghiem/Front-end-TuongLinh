/**
 * js/pages/avatar.js
 * Avatar Designer page logic:
 *   - renders a live avatar preview
 *   - wires the three colour swatch groups (shirt / pants / hat)
 *   - keeps a colour readout (badges) in sync
 *   - "Randomise" button shuffles the colours
 *
 * The chosen colours are persisted to localStorage so they become the
 * defaults when the user opens the Outfit Designer next.
 */

'use strict';

(function () {
  const COLORS = ['red', 'blue', 'yellow'];
  const LABELS = { red: 'Red', blue: 'Blue', yellow: 'Yellow' };
  const LAYERS = ['shirt', 'pants', 'hat'];
  const STORAGE_KEY = 'tryiton.avatar';

  // Default state (falls back to saved preferences if present).
  const saved = loadSaved();
  const state = saved || { shirt: 'red', pants: 'blue', hat: 'yellow' };

  document.addEventListener('DOMContentLoaded', () => {
    const previewHost = document.getElementById('avatarPreview');
    if (!previewHost) return;

    // Render the initial avatar.
    previewHost.innerHTML = Avatar.render(state, 'lg');

    // Sync the readout badges + swatch selected states.
    syncReadout();
    syncSwatches();

    // Delegate swatch clicks across all groups.
    document.querySelectorAll('.swatch-row').forEach((row) => {
      const layer = row.dataset.layer;
      row.addEventListener('click', (e) => {
        const btn = e.target.closest('.swatch-btn');
        if (!btn) return;
        row.querySelectorAll('.swatch-btn').forEach((b) => b.classList.remove('is-selected'));
        btn.classList.add('is-selected');
        state[layer] = btn.dataset.color;
        Avatar.setColor(previewHost, layer, btn.dataset.color);
        syncReadout();
        saveState();
      });
    });

    // Randomise button.
    const randomBtn = document.getElementById('randomBtn');
    if (randomBtn) {
      randomBtn.addEventListener('click', () => {
        LAYERS.forEach((layer) => { state[layer] = pick(); });
        previewHost.innerHTML = Avatar.render(state, 'lg');
        syncReadout();
        syncSwatches();
        saveState();
      });
    }
  });

  /* ---------- Helpers ---------- */
  function pick() {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
  }

  function syncReadout() {
    const s = document.getElementById('readShirt');
    const p = document.getElementById('readPants');
    const h = document.getElementById('readHat');
    if (s) s.textContent = `${LABELS[state.shirt]} shirt`;
    if (p) p.textContent = `${LABELS[state.pants]} pants`;
    if (h) h.textContent = `${LABELS[state.hat]} hat`;
  }

  function syncSwatches() {
    document.querySelectorAll('.swatch-row').forEach((row) => {
      const layer = row.dataset.layer;
      row.querySelectorAll('.swatch-btn').forEach((btn) => {
        btn.classList.toggle('is-selected', btn.dataset.color === state[layer]);
      });
    });
  }

  function loadSaved() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (obj && obj.shirt && obj.pants && obj.hat) return obj;
    } catch (_) { /* ignore */ }
    return null;
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_) { /* localStorage may be unavailable */ }
  }
})();
