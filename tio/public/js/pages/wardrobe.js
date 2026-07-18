/**
 * js/pages/wardrobe.js
 * Wardrobe page logic:
 *   - fetches all outfits for the logged-in user via GET /api/outfits
 *   - renders each outfit as a card (preview + name + date + swatches + actions)
 *   - wires Edit, Duplicate and Delete buttons per card
 *
 * Actions:
 *   Edit      → navigates to /design?edit=<id>
 *   Duplicate → POST /api/outfits/:id/duplicate, then refreshes
 *   Delete    → confirms, DELETE /api/outfits/:id, then refreshes
 */

'use strict';

(function () {
  document.addEventListener('DOMContentLoaded', () => {
    loadOutfits();
  });

  async function loadOutfits() {
    const grid    = document.getElementById('wardrobeGrid');
    const empty   = document.getElementById('wardrobeEmpty');
    const countEl = document.getElementById('outfitCount');
    if (!grid) return;

    let outfits = [];
    try {
      outfits = await Api.listOutfits();
    } catch (err) {
      if (err.status === 401) {
        window.location.href = '/login';
        return;
      }
      grid.innerHTML = '<p class="text-muted">Could not load outfits.</p>';
      return;
    }

    // Update count + empty state.
    if (countEl) {
      countEl.textContent = outfits.length === 0
        ? 'No outfits yet.'
        : `${outfits.length} outfit${outfits.length === 1 ? '' : 's'} saved`;
    }

    if (outfits.length === 0) {
      grid.hidden = true;
      if (empty) empty.hidden = false;
      return;
    }

    grid.hidden = false;
    if (empty) empty.hidden = true;
    grid.innerHTML = outfits.map(renderCard).join('');

    // Bind action buttons (event delegation on the grid).
    grid.addEventListener('click', onGridClick);
  }

  /* ---------- Rendering ---------- */

  function renderCard(outfit) {
    const colors = { shirt: outfit.shirt, pants: outfit.pants, hat: outfit.hat };
    const preview = Avatar.render(colors, 'sm');
    const date = Utils.formatDate(outfit.created_at) || 'Recently';

    return `
      <article class="outfit-card" data-id="${outfit.id}">
        <div class="outfit-card__preview">${preview}</div>
        <div class="outfit-card__body">
          <div class="outfit-card__name">${Utils.escape(outfit.name)}</div>
          <div class="outfit-card__date">${date}</div>
          <div class="outfit-card__swatches">
            <span class="swatch swatch--${outfit.shirt}"  title="Shirt: ${outfit.shirt}"></span>
            <span class="swatch swatch--${outfit.pants}"  title="Pants: ${outfit.pants}"></span>
            <span class="swatch swatch--${outfit.hat}"    title="Hat: ${outfit.hat}"></span>
          </div>
          <div class="outfit-card__actions">
            <button class="btn btn--ghost btn--sm" data-action="edit">Edit</button>
            <button class="btn btn--ghost btn--sm" data-action="duplicate">Duplicate</button>
            <button class="btn btn--danger btn--sm" data-action="delete">Delete</button>
          </div>
        </div>
      </article>`;
  }

  /* ---------- Actions (event delegation) ---------- */

  async function onGridClick(e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const card = btn.closest('.outfit-card');
    if (!card) return;
    const id = card.dataset.id;
    const action = btn.dataset.action;

    if (action === 'edit') {
      window.location.href = `/design?edit=${id}`;
      return;
    }

    if (action === 'duplicate') {
      btn.disabled = true;
      try {
        await Api.duplicateOutfit(id);
        Utils.toast('Outfit duplicated.', 'success');
        await loadOutfits();
      } catch (err) {
        Utils.toast(err.message || 'Could not duplicate.', 'error');
        btn.disabled = false;
      }
      return;
    }

    if (action === 'delete') {
      if (!confirm('Delete this outfit? This cannot be undone.')) return;
      btn.disabled = true;
      try {
        await Api.deleteOutfit(id);
        Utils.toast('Outfit deleted.', 'success');
        await loadOutfits();
      } catch (err) {
        Utils.toast(err.message || 'Could not delete.', 'error');
        btn.disabled = false;
      }
    }
  }
})();
