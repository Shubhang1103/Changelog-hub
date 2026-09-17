const express = require('express');
const router = express.Router();
const {
  signup,
  verifyEmail,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { authRateLimiter } = require('../middleware/rateLimiterMiddleware');
const {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} = require('../schemas/authSchemas');

// Public auth routes with rate limiting
router.post('/signup', authRateLimiter, validate(signupSchema), signup);
router.get('/verify-email/:token', validate(verifyEmailSchema), verifyEmail);
router.post('/login', authRateLimiter, validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/forgot-password', authRateLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password/:token', validate(resetPasswordSchema), resetPassword);

// Protected routes
router.get('/me', protect, getMe);

module.exports = router;
