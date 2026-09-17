const User = require('../models/User');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} = require('../utils/tokenUtils');
const { hashToken, generateRandomToken } = require('../utils/hashUtils');
const { sendSimulatedEmail } = require('../utils/emailSimulator');
const { REFRESH_COOKIE_NAME } = require('../config/constants');

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/signup
 * @access  Public
 */
const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
        errors: [{ field: 'email', message: 'Email is already registered' }],
      });
    }

    // Generate email verification token
    const verificationToken = generateRandomToken(32);
    const verificationTokenHash = hashToken(verificationToken);
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      role: 'user',
      isEmailVerified: false,
      emailVerificationTokenHash: verificationTokenHash,
      emailVerificationExpires: verificationExpires,
    });

    // Generate tokens
    const accessToken = generateAccessToken({ id: user._id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user._id });

    // Store hash of initial refresh token
    user.refreshTokenHash = hashToken(refreshToken);
    await user.save();

    // Set HTTP-only refresh cookie
    setRefreshTokenCookie(res, refreshToken);

    // Send simulated verification email
    const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email/${verificationToken}`;
    const emailData = sendSimulatedEmail({
      to: user.email,
      subject: 'Verify your Changelog Hub email address',
      template: 'Email Verification',
      token: verificationToken,
      url: verificationUrl,
    });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully. Please verify your email.',
      user: user.toSafeObject(),
      accessToken,
      ...(process.env.NODE_ENV === 'development' || process.env.EMAIL_SIMULATION === 'true'
        ? { simulatedVerification: emailData }
        : {}),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify user email
 * @route   GET /api/v1/auth/verify-email/:token
 * @access  Public
 */
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    const tokenHash = hashToken(token);

    const user = await User.findOne({
      emailVerificationTokenHash: tokenHash,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired email verification token.',
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationTokenHash = null;
    user.emailVerificationExpires = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You now have full access.',
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user & issue access + refresh tokens
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken({ id: user._id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user._id });

    // Store hash of refresh token
    user.refreshTokenHash = hashToken(refreshToken);
    await user.save();

    // Set HTTP-only refresh cookie
    setRefreshTokenCookie(res, refreshToken);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      user: user.toSafeObject(),
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Rotate access + refresh token (with reuse & theft detection)
 * @route   POST /api/v1/auth/refresh
 * @access  Public (Cookie/Body based)
 */
const refresh = async (req, res, next) => {
  try {
    const incomingRefreshToken =
      req.cookies?.[REFRESH_COOKIE_NAME] || req.body?.refreshToken;

    if (!incomingRefreshToken) {
      return res.status(401).json({
        success: false,
        message: 'No refresh token provided. Please log in again.',
      });
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(incomingRefreshToken);
    } catch (err) {
      clearRefreshTokenCookie(res);
      return res.status(401).json({
        success: false,
        message: 'Refresh token expired or invalid. Please log in again.',
        code: 'REFRESH_EXPIRED',
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      clearRefreshTokenCookie(res);
      return res.status(401).json({
        success: false,
        message: 'User no longer exists.',
      });
    }

    const incomingHash = hashToken(incomingRefreshToken);

    // REUSE DETECTION:
    // If incoming refresh token hash does not match current valid stored hash,
    // it means an old/compromised refresh token is being reused!
    if (!user.refreshTokenHash || user.refreshTokenHash !== incomingHash) {
      console.warn(
        `🚨 [SECURITY ALERT] Refresh token reuse detected for user ${user.email} (${user._id})! Invalidating all sessions.`
      );

      // Invalidate stored token hash completely to force full re-login
      user.refreshTokenHash = null;
      await user.save();

      clearRefreshTokenCookie(res);

      return res.status(401).json({
        success: false,
        message:
          'Security alert: Detected invalid or reused refresh token. All active sessions have been terminated. Please log in again.',
        code: 'TOKEN_REUSE_DETECTED',
      });
    }

    // ROTATION:
    // Issue brand new access token and brand new refresh token
    const newAccessToken = generateAccessToken({ id: user._id, role: user.role });
    const newRefreshToken = generateRefreshToken({ id: user._id });

    // Store new hash
    user.refreshTokenHash = hashToken(newRefreshToken);
    await user.save();

    // Set new cookie
    setRefreshTokenCookie(res, newRefreshToken);

    res.status(200).json({
      success: true,
      message: 'Tokens rotated successfully.',
      accessToken: newAccessToken,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user & invalidate refresh token
 * @route   POST /api/v1/auth/logout
 * @access  Public
 */
const logout = async (req, res, next) => {
  try {
    const incomingRefreshToken =
      req.cookies?.[REFRESH_COOKIE_NAME] || req.body?.refreshToken;

    if (incomingRefreshToken) {
      try {
        const decoded = verifyRefreshToken(incomingRefreshToken);
        if (decoded?.id) {
          await User.findByIdAndUpdate(decoded.id, { refreshTokenHash: null });
        }
      } catch (e) {
        // Token was invalid, proceed with clearing cookie
      }
    } else if (req.user) {
      await User.findByIdAndUpdate(req.user._id, { refreshTokenHash: null });
    }

    clearRefreshTokenCookie(res);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Forgot password - generate reset token & simulate email
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });

    let simulatedEmailData = null;

    if (user) {
      const resetToken = generateRandomToken(32);
      user.resetPasswordTokenHash = hashToken(resetToken);
      user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await user.save();

      const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
      simulatedEmailData = sendSimulatedEmail({
        to: user.email,
        subject: 'Reset your Changelog Hub password',
        template: 'Password Reset',
        token: resetToken,
        url: resetUrl,
      });
    }

    // Always return success to prevent email enumeration
    res.status(200).json({
      success: true,
      message:
        'If an account exists with this email address, password reset instructions have been sent.',
      ...(simulatedEmailData &&
      (process.env.NODE_ENV === 'development' || process.env.EMAIL_SIMULATION === 'true')
        ? { simulatedReset: simulatedEmailData }
        : {}),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset password with token
 * @route   POST /api/v1/auth/reset-password/:token
 * @access  Public
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const tokenHash = hashToken(token);

    const user = await User.findOne({
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token.',
      });
    }

    // Update password (will trigger pre-save bcrypt hook)
    user.password = password;
    user.resetPasswordTokenHash = null;
    user.resetPasswordExpires = null;
    user.refreshTokenHash = null; // Invalidate previous sessions
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now log in.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current authenticated user
 * @route   GET /api/v1/auth/me
 * @access  Private (Protected)
 */
const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  verifyEmail,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
};
