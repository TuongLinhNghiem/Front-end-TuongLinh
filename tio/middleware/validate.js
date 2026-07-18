/**
 * middleware/validate.js
 * Lightweight request-body validation helpers.
 *
 * Validation is intentionally framework-free (no `express-validator`)
 * to keep the dependency surface minimal and the rules transparent.
 *
 * Each helper returns an array of human-readable error strings. An
 * empty array means the input is valid.
 */

'use strict';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Minimum password policy for the PoC.
const MIN_PASSWORD_LENGTH = 8;

/** Validate the registration payload. */
function registration({ email, username, password, confirmPassword }) {
  const errors = [];

  if (!email || !EMAIL_RE.test(email)) {
    errors.push('Please enter a valid email address.');
  }
  if (!username || username.trim().length < 3) {
    errors.push('Username must be at least 3 characters long.');
  }
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    errors.push(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
  }
  if (password !== confirmPassword) {
    errors.push('Passwords do not match.');
  }
  return errors;
}

/** Validate the login payload. */
function login({ email, password }) {
  const errors = [];
  if (!email || !EMAIL_RE.test(email)) errors.push('Please enter a valid email address.');
  if (!password) errors.push('Please enter your password.');
  return errors;
}

/**
 * Validate an outfit payload.
 * Allowed colours are restricted to the three used across the platform.
 */
const ALLOWED_COLORS = ['red', 'blue', 'yellow'];

function outfit({ name, shirt, pants, hat }) {
  const errors = [];
  if (!name || name.trim().length === 0) errors.push('Outfit name is required.');
  if (!ALLOWED_COLORS.includes(shirt)) errors.push('Invalid shirt colour.');
  if (!ALLOWED_COLORS.includes(pants)) errors.push('Invalid pants colour.');
  if (!ALLOWED_COLORS.includes(hat)) errors.push('Invalid hat colour.');
  return errors;
}

module.exports = { registration, login, outfit, ALLOWED_COLORS };
