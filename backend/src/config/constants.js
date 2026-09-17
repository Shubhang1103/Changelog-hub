const REACTION_EMOJIS = ['❤️', '🎉', '🚀'];
const CHANGELOG_CATEGORIES = ['New', 'Improved', 'Fixed'];
const CHANGELOG_STATUSES = ['Draft', 'Published'];
const USER_ROLES = ['user', 'admin'];

const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  path: '/',
};

module.exports = {
  REACTION_EMOJIS,
  CHANGELOG_CATEGORIES,
  CHANGELOG_STATUSES,
  USER_ROLES,
  REFRESH_COOKIE_NAME,
  REFRESH_COOKIE_OPTIONS,
};
