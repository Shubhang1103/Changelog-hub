const rateLimit = require('express-rate-limit');

/**
 * Strict rate limiter for sensitive authentication endpoints:
 * 5 requests per 15 minutes window.
 */
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
  skip: (req) => {
    // Optional bypass during tests or if specified
    return process.env.NODE_ENV === 'test';
  },
});

/**
 * General rate limiter for standard API routes:
 * 200 requests per 15 minutes window.
 */
const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please slow down and try again shortly.',
  },
});

module.exports = {
  authRateLimiter,
  generalRateLimiter,
};
