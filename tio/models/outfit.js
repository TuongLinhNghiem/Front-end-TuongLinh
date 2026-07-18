/**
 * models/outfit.js
 * Data-access layer for the `outfits` table.
 *
 * An outfit stores the three colour choices (shirt, pants, hat) plus a
 * user-given name and timestamp. Each outfit belongs to exactly one user.
 */

'use strict';

const { run, get, all } = require('../db/connection');

const Outfit = {
  /** Create an outfit for a user. */
  async create({ user_id, name, shirt, pants, hat }) {
    const { lastID } = await run(
      `INSERT INTO outfits (user_id, name, shirt, pants, hat) VALUES (?, ?, ?, ?, ?)`,
      [user_id, name.trim(), shirt, pants, hat]
    );
    return this.findById(lastID);
  },

  /** Find one outfit by id (scoped to a user). */
  findById(id) {
    return get(`SELECT * FROM outfits WHERE id = ?`, [id]);
  },

  /** All outfits owned by a user, newest first. */
  findByUser(user_id) {
    return all(
      `SELECT * FROM outfits WHERE user_id = ? ORDER BY datetime(created_at) DESC`,
      [user_id]
    );
  },

  /** Update an outfit's colours / name. */
  async update(id, { name, shirt, pants, hat }) {
    await run(
      `UPDATE outfits SET name = ?, shirt = ?, pants = ?, hat = ? WHERE id = ?`,
      [name.trim(), shirt, pants, hat, id]
    );
    return this.findById(id);
  },

  /** Remove an outfit. */
  remove(id) {
    return run(`DELETE FROM outfits WHERE id = ?`, [id]);
  }
};

module.exports = Outfit;
