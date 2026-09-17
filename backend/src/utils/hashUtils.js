const crypto = require('crypto');

/**
 * Hash a string using SHA256.
 * @param {string} token
 * @returns {string}
 */
const hashToken = (token) => {
  if (!token) return null;
  return crypto.createHash('sha256').update(String(token)).digest('hex');
};

/**
 * Generate a cryptographically secure random hex token.
 * @param {number} bytes
 * @returns {string}
 */
const generateRandomToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};

module.exports = {
  hashToken,
  generateRandomToken,
};
