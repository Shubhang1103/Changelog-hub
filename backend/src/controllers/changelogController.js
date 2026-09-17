const ChangelogEntry = require('../models/ChangelogEntry');
const Reaction = require('../models/Reaction');
const { getReactionsSummary } = require('./reactionController');

/**
 * @desc    Get all published changelog entries (with category filtering, search, pagination, reactions)
 * @route   GET /api/v1/changelog
 * @access  Public (Optional auth for user reactions)
 */
const getPublicChangelogs = async (req, res, next) => {
  try {
    const { category, q, page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const query = { status: 'Published' };

    // Category filter
    if (category && category !== 'All' && ['New', 'Improved', 'Fixed'].includes(category)) {
      query.category = category;
    }

    // Search query using regex (flexible) or text search
    if (q && q.trim()) {
      const searchRegex = new RegExp(q.trim(), 'i');
      query.$or = [{ title: searchRegex }, { contentMarkdown: searchRegex }];
    }

    const [entries, total] = await Promise.all([
      ChangelogEntry.find(query)
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('author', 'name email role'),
      ChangelogEntry.countDocuments(query),
    ]);

    // Attach reaction summary for each entry
    const userId = req.user?._id || null;
    const entriesWithReactions = await Promise.all(
      entries.map(async (entry) => {
        const reactions = await getReactionsSummary(entry._id, userId);
        return {
          ...entry.toObject(),
          reactions: reactions.counts,
          userReactions: reactions.userReactions,
        };
      })
    );

    const totalPages = Math.ceil(total / limitNum) || 1;

    res.status(200).json({
      success: true,
      data: entriesWithReactions,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasMore: pageNum < totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single published changelog entry by slug
 * @route   GET /api/v1/changelog/:slug
 * @access  Public (Optional auth for user reactions)
 */
const getPublicChangelogBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const userId = req.user?._id || null;

    const entry = await ChangelogEntry.findOne({
      slug,
      status: 'Published',
    }).populate('author', 'name email role');

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: `Changelog entry with slug '${slug}' not found or not published.`,
      });
    }

    const reactions = await getReactionsSummary(entry._id, userId);

    res.status(200).json({
      success: true,
      data: {
        ...entry.toObject(),
        reactions: reactions.counts,
        userReactions: reactions.userReactions,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Public JSON feed of published entries for external widgets / integrations
 * @route   GET /api/v1/changelog/feed
 * @access  Public
 */
const getPublicFeed = async (req, res, next) => {
  try {
    const limit = Math.min(50, parseInt(req.query.limit, 10) || 20);

    const entries = await ChangelogEntry.find({ status: 'Published' })
      .sort({ publishedAt: -1 })
      .limit(limit)
      .select('title slug contentMarkdown category coverImage publishedAt author')
      .populate('author', 'name');

    const feed = entries.map((entry) => ({
      id: entry._id,
      title: entry.title,
      slug: entry.slug,
      url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/changelog/${entry.slug}`,
      category: entry.category,
      coverImage: entry.coverImage,
      contentMarkdown: entry.contentMarkdown,
      publishedAt: entry.publishedAt,
      author: entry.author?.name || 'Changelog Team',
    }));

    res.status(200).json({
      title: 'Product Updates & Changelog Feed',
      description: 'The latest features, improvements, and fixes.',
      home_page_url: process.env.CLIENT_URL || 'http://localhost:5173',
      feed_url: `${req.protocol}://${req.get('host')}/api/v1/changelog/feed`,
      count: feed.length,
      items: feed,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublicChangelogs,
  getPublicChangelogBySlug,
  getPublicFeed,
};
