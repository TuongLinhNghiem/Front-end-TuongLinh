/**
 * models/user.js
 * Data-access layer for the `users` table.
 *
 * All methods return Promises so controllers can use async/await.
 * Passwords are hashed with bcrypt before being stored — the model
 * never receives or holds the plain-text password after hashing.
 */

'use strict';

const bcrypt = require('bcrypt');
const { run, get } = require('../db/connection');
const config = require('../config');

const User = {
  /**
   * Create a new user.
   * @param {{email:string, username:string, password:string}} data
   * @returns {Promise<{id:number, email:string, username:string}>}
   */
  async create({ email, username, password }) {
    const hash = await bcrypt.hash(password, config.bcryptRounds);
    const { lastID } = await run(
      `INSERT INTO users (email, username, password_hash) VALUES (?, ?, ?)`,
      [email.toLowerCase().trim(), username.trim(), hash]
    );
    return { id: lastID, email: email.toLowerCase(), username: username.trim() };
  },

  /**
   * Find a user by email (case-insensitive).
   * @returns {Promise<object|undefined>}
   */
  findByEmail(email) {
    return get(`SELECT * FROM users WHERE email = ?`, [email.toLowerCase().trim()]);
  },

  /** Find a user by username. */
  findByUsername(username) {
    return get(`SELECT * FROM users WHERE username = ?`, [username.trim()]);
  },

  /** Find a user by primary key. */
  findById(id) {
    return get(`SELECT * FROM users WHERE id = ?`, [id]);
  },

  /** Public-safe projection (no password hash). */
  async publicProfile(id) {
    const row = await get(
      `SELECT id, email, username, avatar_url, measurements, created_at FROM users WHERE id = ?`,
      [id]
    );
    return row;
  },

  /**
   * Verify a password against the stored hash.
   * @returns {Promise<boolean>}
   */
  verifyPassword(plain, hash) {
    return bcrypt.compare(plain, hash);
  },

  /** Update editable profile fields. */
  async updateProfile(id, { username, avatar_url, measurements }) {
    await run(
      `UPDATE users SET username = COALESCE(?, username), avatar_url = COALESCE(?, avatar_url), measurements = COALESCE(?, measurements) WHERE id = ?`,
      [username, avatar_url, measurements, id]
    );
    return this.publicProfile(id);
  }
};

module.exports = User;
