/**
 * db/init.js
 * Database initialisation script.
 *
 * Run with:  npm run init-db   (or)   node db/init.js
 *
 * Creates the SQLite file (if missing) and the three tables required
 * by the platform:
 *   - users     : registered accounts (passwords hashed with bcrypt)
 *   - outfits   : saved outfits per user
 *   - sessions  : express-session persistent store
 *
 * This script is idempotent — re-running it is safe.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { db } = require('./connection');
const config = require('../config');

// Ensure the db directory exists.
const dbDir = path.dirname(config.dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const SCHEMA = `
-- USERS -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT NOT NULL UNIQUE,
  username      TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  avatar_url    TEXT,
  measurements  TEXT,            -- JSON string placeholder for body measurements
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- OUTFITS -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS outfits (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL,
  name       TEXT NOT NULL,
  shirt      TEXT NOT NULL,      -- color name: red | blue | yellow
  pants      TEXT NOT NULL,
  hat        TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- SESSIONS (express-session persistent store) -----------------------
CREATE TABLE IF NOT EXISTS sessions (
  sid  TEXT PRIMARY KEY,
  sess TEXT NOT NULL,
  expired INTEGER
);
`;

db.serialize(() => {
  db.exec(SCHEMA, (err) => {
    if (err) {
      console.error('[db] Schema creation failed:', err.message);
      process.exit(1);
    }
    console.log('[db] Schema initialised successfully.');
    console.log('[db] File:', config.dbPath);
    db.close();
  });
});
