const Reaction = require('../models/Reaction');
const ChangelogEntry = require('../models/ChangelogEntry');
const { REACTION_EMOJIS } = require('../config/constants');

/**
 * Helper to aggregate reaction counts and user reacted list for an entry
 */
const getReactionsSummary = async (changelogId, userId = null) => {
  const counts = {
    '❤️': 0,
    '🎉': 0,
    '🚀': 0,
  };

  const reactionCounts = await Reaction.aggregate([
    { $match: { changelogEntry: changelogId } },
    { $group: { _id: '$emoji', count: { $sum: 1 } } },
  ]);

  reactionCounts.forEach((r) => {
    if (counts[r._id] !== undefined) {
      counts[r._id] = r.count;
    }
  });

  let userReactions = [];
  if (userId) {
    const userDocs = await Reaction.find({
      changelogEntry: changelogId,
      user: userId,
    }).select('emoji');
    userReactions = userDocs.map((doc) => doc.emoji);
  }

  return { counts, userReactions };
};

/**
 * @desc    Toggle emoji reaction on a changelog entry
 * @route   POST /api/v1/changelog/:id/react
 * @access  Private (Authenticated users)
 */
const toggleReaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    const changelog = await ChangelogEntry.findById(id);
    if (!changelog) {
      return res.status(404).json({
        success: false,
        message: 'Changelog entry not found.',
      });
    }

    // Check if reaction already exists
    const existing = await Reaction.findOne({
      user: userId,
      changelogEntry: id,
      emoji,
    });

    let action;
    if (existing) {
      await Reaction.findByIdAndDelete(existing._id);
      action = 'removed';
    } else {
      await Reaction.create({
        user: userId,
        changelogEntry: id,
        emoji,
      });
      action = 'added';
    }

    const { counts, userReactions } = await getReactionsSummary(changelog._id, userId);

    res.status(200).json({
      success: true,
      action,
      emoji,
      counts,
      userReactions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get reactions summary for a changelog entry
 * @route   GET /api/v1/changelog/:id/reactions
 * @access  Public (Optional Auth)
 */
const getReactions = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id || null;

    const changelog = await ChangelogEntry.findById(id);
    if (!changelog) {
      return res.status(404).json({
        success: false,
        message: 'Changelog entry not found.',
      });
    }

    const { counts, userReactions } = await getReactionsSummary(changelog._id, userId);

    res.status(200).json({
      success: true,
      counts,
      userReactions,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  toggleReaction,
  getReactions,
  getReactionsSummary,
};
