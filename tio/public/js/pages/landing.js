/**
 * js/pages/landing.js
 * Landing-page logic:
 *   - renders the floating hero avatar
 *   - wires the interactive demo swatches to the live avatar
 */

'use strict';

(function () {
  // Default colours for both the hero and the demo.
  const state = { shirt: 'red', pants: 'blue', hat: 'yellow' };

  document.addEventListener('DOMContentLoaded', () => {
    // --- Hero avatar ---
    const heroHost = document.getElementById('heroAvatar');
    if (heroHost) heroHost.innerHTML = Avatar.render(state, 'sm');

    // --- Interactive demo ---
    const demoHost = document.getElementById('demoAvatar');
    if (demoHost) {
      demoHost.innerHTML = Avatar.render(state, 'md');

      // Delegate clicks on any swatch group.
      document.querySelectorAll('.demo__swatches').forEach((group) => {
        const layer = group.dataset.layer;
        group.addEventListener('click', (e) => {
          const btn = e.target.closest('.swatch-btn');
          if (!btn) return;
          // Toggle selected state within the group.
          group.querySelectorAll('.swatch-btn').forEach((b) => b.classList.remove('is-selected'));
          btn.classList.add('is-selected');

          state[layer] = btn.dataset.color;
          Avatar.setColor(demoHost, layer, btn.dataset.color);
        });
      });
    }
  });
})();
