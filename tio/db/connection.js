/**
 * db/connection.js
 * Singleton SQLite connection used by all models.
 *
 * Wraps the sqlite3 driver so the rest of the codebase interacts
 * with Promises instead of callbacks, keeping controllers clean.
 */

'use strict';

const sqlite3 = require('sqlite3');
const config = require('../config');

// Use verbose mode in development for richer stack traces.
const db = new sqlite3.Database(
  config.dbPath,
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (err) => {
    if (err) {
      console.error('[db] Connection error:', err.message);
    }
  }
);

/**
 * Run a statement that does not return rows (INSERT/UPDATE/DELETE).
 * @param {string} sql  SQL with optional (?) placeholders.
 * @param {Array}  params Bind values.
 * @returns {Promise<{lastID:number, changes:number}>}
 */
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

/**
 * Fetch a single row.
 * @returns {Promise<object|undefined>}
 */
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

/**
 * Fetch many rows.
 * @returns {Promise<Array<object>>}
 */
function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

module.exports = { db, run, get, all };
