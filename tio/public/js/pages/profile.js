/**
 * js/pages/profile.js
 * Loads the authenticated user's profile, renders it, and wires the
 * edit modal so the user can update their username and measurements.
 */

'use strict';

(function () {
  document.addEventListener('DOMContentLoaded', async () => {
    const $ = (id) => document.getElementById(id);

    const usernameEl = $('profileUsername');
    const emailEl = $('profileEmail');
    const avatarEl = $('profileAvatar');
    const sinceEl = $('profileSince');
    const outfitsEl = $('profileOutfits');
    const measurementsEl = $('profileMeasurements');

    const editBtn = $('editBtn');
    const editModal = $('editModal');
    const editForm = $('editForm');
    const editUsername = $('editUsername');

    let currentUser = null;

    /* ---- Load profile ---- */
    try {
      currentUser = await Api.getMe();
    } catch (e) {
      Utils.toast('Could not load profile.', 'error');
      return;
    }

    renderProfile(currentUser);

    // Fetch outfit count separately.
    try {
      const outfits = await Api.listOutfits();
      if (outfitsEl) outfitsEl.textContent = `${outfits.length} saved`;
    } catch (_) { /* non-fatal */ }

    /* ---- Render helpers ---- */
    function renderProfile(user) {
      if (usernameEl) usernameEl.textContent = user.username;
      if (emailEl) emailEl.textContent = user.email;
      if (avatarEl) avatarEl.textContent = Utils.escape(user.username.charAt(0).toUpperCase());
      if (sinceEl) sinceEl.textContent = Utils.formatDate(user.created_at) || 'Recently';
      if (measurementsEl) {
        const m = parseMeasurements(user.measurements);
        measurementsEl.textContent = m ? formatMeasurements(m) : 'Not set';
      }
    }

    function parseMeasurements(raw) {
      if (!raw) return null;
      try {
        const obj = JSON.parse(raw);
        if (!obj || typeof obj !== 'object') return null;
        return obj;
      } catch (_) { return null; }
    }

    function formatMeasurements(m) {
      const parts = [];
      if (m.chest) parts.push(`Chest ${m.chest}cm`);
      if (m.waist) parts.push(`Waist ${m.waist}cm`);
      if (m.hip) parts.push(`Hip ${m.hip}cm`);
      return parts.length ? parts.join(' · ') : 'Not set';
    }

    /* ---- Edit modal ---- */
    if (editBtn && editModal) {
      editBtn.addEventListener('click', () => openModal());

      // Close handlers (backdrop + any [data-close] element).
      editModal.querySelectorAll('[data-close]').forEach((el) => {
        el.addEventListener('click', () => closeModal());
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !editModal.hidden) closeModal();
      });
    }

    function openModal() {
      if (!currentUser) return;
      editUsername.value = currentUser.username || '';
      const m = parseMeasurements(currentUser.measurements) || {};
      $('m_chest').value = m.chest || '';
      $('m_waist').value = m.waist || '';
      $('m_hip').value = m.hip || '';
      editModal.hidden = false;
      setTimeout(() => editUsername.focus(), 50);
    }

    function closeModal() {
      editModal.hidden = true;
    }

    /* ---- Save profile ---- */
    if (editForm) {
      editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = editUsername.value.trim();
        if (username.length < 3) {
          Utils.toast('Username must be at least 3 characters.', 'error');
          return;
        }

        const measurements = {
          chest: $('m_chest').value.trim() || null,
          waist: $('m_waist').value.trim() || null,
          hip: $('m_hip').value.trim() || null
        };
        // Drop nulls so the stored object stays clean.
        Object.keys(measurements).forEach((k) => measurements[k] == null && delete measurements[k]);

        try {
          const updated = await Api.updateMe({ username, measurements });
          currentUser = updated;
          renderProfile(updated);
          closeModal();
          Utils.toast('Profile updated.', 'success');
        } catch (err) {
          Utils.toast(err.message || 'Could not save profile.', 'error');
        }
      });
    }
  });
})();
