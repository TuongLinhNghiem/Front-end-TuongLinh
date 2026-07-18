/**
 * js/pages/dashboard.js
 * Personalises the dashboard greeting using the logged-in user's name.
 */

'use strict';

(function () {
  document.addEventListener('DOMContentLoaded', async () => {
    const greeting = document.getElementById('greeting');
    const sub = document.getElementById('greetingSub');
    if (!greeting) return;

    try {
      const user = await Api.getMe();
      const hour = new Date().getHours();
      const part = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
      greeting.textContent = `${part}, ${user.username} 👋`;
      if (sub) sub.textContent = 'Pick up where you left off — design a new look today.';
    } catch (_) {
      // If not logged in, the server will have already redirected to /login.
    }
  });
})();
