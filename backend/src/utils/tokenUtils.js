const jwt = require('jsonwebtoken');
const { REFRESH_COOKIE_NAME, REFRESH_COOKIE_OPTIONS } = require('../config/constants');
const { hashToken } = require('./hashUtils');

/**
 * Generate short-lived access token (15 minutes).
 * @param {object} payload
 * @returns {string}
 */
const generateAccessToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_ACCESS_SECRET || 'default_access_secret_for_dev_min32chars',
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    }
  );
};

/**
 * Generate long-lived refresh token (7 days).
 * Includes unique jti nonce so every rotated token is uniquely distinct.
 * @param {object} payload
 * @returns {string}
 */
const generateRefreshToken = (payload) => {
  const { generateRandomToken } = require('./hashUtils');
  return jwt.sign(
    {
      ...payload,
      jti: generateRandomToken(16),
    },
    process.env.JWT_REFRESH_SECRET || 'default_refresh_secret_for_dev_min32chars',
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    }
  );
};

/**
 * Verify Access Token
 * @param {string} token
 * @returns {object}
 */
const verifyAccessToken = (token) => {
  return jwt.verify(
    token,
    process.env.JWT_ACCESS_SECRET || 'default_access_secret_for_dev_min32chars'
  );
};

/**
 * Verify Refresh Token
 * @param {string} token
 * @returns {object}
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(
    token,
    process.env.JWT_REFRESH_SECRET || 'default_refresh_secret_for_dev_min32chars'
  );
};

/**
 * Helper to set refresh token cookie on Express response
 * @param {import('express').Response} res
 * @param {string} refreshToken
 */
const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);
};

/**
 * Helper to clear refresh token cookie
 * @param {import('express').Response} res
 */
const clearRefreshTokenCookie = (res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
};
