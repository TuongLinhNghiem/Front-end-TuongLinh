/**
 * js/api.js
 * Thin wrapper around fetch() for talking to the JSON API.
 *
 * All methods return Promises that resolve to parsed JSON.
 * On non-2xx responses the promise rejects with the server message.
 */

'use strict';

const Api = {
  async _request(url, options = {}) {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.error || 'Request failed.');
      err.status = res.status;
      throw err;
    }
    return data;
  },

  /* Profile */
  getMe() { return this._request('/api/me'); },
  updateMe(payload) {
    return this._request('/api/me', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  /* Outfits */
  listOutfits() { return this._request('/api/outfits'); },
  createOutfit(payload) {
    return this._request('/api/outfits', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  updateOutfit(id, payload) {
    return this._request(`/api/outfits/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },
  deleteOutfit(id) {
    return this._request(`/api/outfits/${id}`, { method: 'DELETE' });
  },
  duplicateOutfit(id) {
    return this._request(`/api/outfits/${id}/duplicate`, { method: 'POST' });
  },

  /* Static shops data */
  async getShops() {
    const res = await fetch('/data/shops.json');
    return res.json();
  }
};

window.Api = Api;
