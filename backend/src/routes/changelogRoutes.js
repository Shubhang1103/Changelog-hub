const express = require('express');
const router = express.Router();
const {
  getPublicChangelogs,
  getPublicChangelogBySlug,
  getPublicFeed,
} = require('../controllers/changelogController');
const {
  toggleReaction,
  getReactions,
} = require('../controllers/reactionController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { reactionSchema } = require('../schemas/changelogSchemas');

// Feed route must be before :slug route to avoid collision
router.get('/feed', getPublicFeed);

// Public timeline & single slug view
router.get('/', optionalProtect, getPublicChangelogs);
router.get('/:slug', optionalProtect, getPublicChangelogBySlug);

// Reaction routes
router.post('/:id/react', protect, validate(reactionSchema), toggleReaction);
router.get('/:id/reactions', optionalProtect, getReactions);

module.exports = router;
