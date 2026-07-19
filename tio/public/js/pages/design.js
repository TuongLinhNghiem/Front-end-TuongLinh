/**
 * js/pages/design.js
 * Outfit Designer page logic:
 *   - renders a live avatar preview
 *   - wires the three colour swatch groups (shirt / pants / hat)
 *   - on submit, saves the outfit (name + colours) via POST /api/outfits
 *   - supports edit mode via ?edit=<id> — loads an existing outfit,
 *     lets the user change it, and PUTs the update.
 *
 * After a successful save the user is redirected to the Wardrobe.
 */

'use strict';

(function () {
  const LABELS = { red: 'Red', blue: 'Blue', yellow: 'Yellow' };
  const STORAGE_KEY = 'tryiton.avatar';

  // Restore colours saved from the Avatar Designer (or defaults).
  const saved = loadSaved();
  const state = saved || { shirt: 'red', pants: 'blue', hat: 'yellow' };

  // Edit mode — if ?edit=<id> is present we load that outfit.
  const editId = Utils.param('edit');
  let editing = null;

  document.addEventListener('DOMContentLoaded', async () => {
    const previewHost = document.getElementById('outfitPreview');
    if (!previewHost) return;

    // If editing, load the outfit first and override the state.
    if (editId) {
      try {
        const outfits = await Api.listOutfits();
        editing = outfits.find((o) => String(o.id) === String(editId));
        if (editing) {
          state.shirt = editing.shirt;
          state.pants = editing.pants;
          state.hat   = editing.hat;
          const nameInput = document.getElementById('outfitName');
          if (nameInput) nameInput.value = editing.name;
          showEditBanner(editing.name);
        }
      } catch (_) { /* ignore — fall through to create mode */ }
    }

    // Render the avatar with the (possibly loaded) state.
    previewHost.innerHTML = Avatar.render(state, 'lg');
    syncReadout();
    syncSwatches();

    // Swatch delegation.
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

    // Save / update form submission.
    const form = document.getElementById('saveForm');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('outfitName').value.trim();
        if (!name) {
          Utils.toast('Please name your outfit.', 'error');
          return;
        }

        const payload = {
          name,
          shirt: state.shirt,
          pants: state.pants,
          hat: state.hat
        };

        const btn = document.getElementById('saveBtn');
        const original = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Saving…';

        try {
          if (editing) {
            await Api.updateOutfit(editing.id, payload);
            Utils.toast('Outfit updated.', 'success');
          } else {
            await Api.createOutfit(payload);
            Utils.toast('Outfit saved to your wardrobe.', 'success');
          }
          setTimeout(() => { window.location.href = '/wardrobe'; }, 700);
        } catch (err) {
          Utils.toast(err.message || 'Could not save outfit.', 'error');
        } finally {
          btn.disabled = false;
          btn.textContent = original;
        }
      });
    }

    // Cancel-edit button.
    const cancelBtn = document.getElementById('cancelEditBtn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        window.location.href = '/wardrobe';
      });
    }
  });

  /* ---------- Helpers ---------- */

  function showEditBanner(name) {
    const banner = document.getElementById('editBanner');
    const label  = document.getElementById('editName');
    const saveBtn = document.getElementById('saveBtn');
    if (banner) banner.hidden = false;
    if (label)  label.textContent = name;
    if (saveBtn) saveBtn.textContent = 'Update outfit';
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
    } catch (_) { /* ignore */ }
  }
})();
