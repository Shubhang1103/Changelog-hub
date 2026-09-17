const ChangelogEntry = require('../models/ChangelogEntry');
const Reaction = require('../models/Reaction');
const { generateUniqueSlug } = require('../utils/slugUtils');
const { getReactionsSummary } = require('./reactionController');

/**
 * @desc    Get all changelog entries (Draft + Published) for admin studio
 * @route   GET /api/v1/admin/changelog
 * @access  Private/Admin
 */
const getAllChangelogs = async (req, res, next) => {
  try {
    const { status, category, q, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (q && q.trim()) {
      const searchRegex = new RegExp(q.trim(), 'i');
      query.$or = [{ title: searchRegex }, { contentMarkdown: searchRegex }, { slug: searchRegex }];
    }

    const [entries, total] = await Promise.all([
      ChangelogEntry.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('author', 'name email role'),
      ChangelogEntry.countDocuments(query),
    ]);

    const entriesWithReactions = await Promise.all(
      entries.map(async (entry) => {
        const reactions = await getReactionsSummary(entry._id);
        return {
          ...entry.toObject(),
          reactions: reactions.counts,
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
 * @desc    Create a new changelog entry (draft or published)
 * @route   POST /api/v1/admin/changelog
 * @access  Private/Admin
 */
const createChangelog = async (req, res, next) => {
  try {
    const { title, slug, contentMarkdown, category, coverImage, status = 'Draft' } = req.body;

    // Generate unique slug
    const finalSlug = slug && slug.trim() !== ''
      ? await generateUniqueSlug(ChangelogEntry, slug)
      : await generateUniqueSlug(ChangelogEntry, title);

    const publishedAt = status === 'Published' ? new Date() : null;

    const entry = await ChangelogEntry.create({
      title,
      slug: finalSlug,
      contentMarkdown,
      category,
      coverImage: coverImage || null,
      status,
      publishedAt,
      author: req.user._id,
    });

    const populated = await ChangelogEntry.findById(entry._id).populate('author', 'name email role');

    res.status(201).json({
      success: true,
      message: `Changelog entry created successfully as ${status}.`,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single changelog entry by ID for editing
 * @route   GET /api/v1/admin/changelog/:id
 * @access  Private/Admin
 */
const getChangelogById = async (req, res, next) => {
  try {
    const entry = await ChangelogEntry.findById(req.params.id).populate('author', 'name email role');

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Changelog entry not found.',
      });
    }

    const reactions = await getReactionsSummary(entry._id);

    res.status(200).json({
      success: true,
      data: {
        ...entry.toObject(),
        reactions: reactions.counts,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing changelog entry
 * @route   PUT /api/v1/admin/changelog/:id
 * @access  Private/Admin
 */
const updateChangelog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, slug, contentMarkdown, category, coverImage, status } = req.body;

    const entry = await ChangelogEntry.findById(id);
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Changelog entry not found.',
      });
    }

    if (title !== undefined) entry.title = title;
    if (contentMarkdown !== undefined) entry.contentMarkdown = contentMarkdown;
    if (category !== undefined) entry.category = category;
    if (coverImage !== undefined) entry.coverImage = coverImage;

    // Handle slug updates
    if (slug !== undefined && slug !== entry.slug) {
      entry.slug = await generateUniqueSlug(ChangelogEntry, slug, entry._id);
    } else if (title && !slug && title !== entry.title) {
      entry.slug = await generateUniqueSlug(ChangelogEntry, title, entry._id);
    }

    // Handle status change
    if (status !== undefined && status !== entry.status) {
      entry.status = status;
      if (status === 'Published' && !entry.publishedAt) {
        entry.publishedAt = new Date();
      }
    }

    await entry.save();
    const updated = await ChangelogEntry.findById(entry._id).populate('author', 'name email role');

    res.status(200).json({
      success: true,
      message: 'Changelog entry updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle or set publish status of changelog entry
 * @route   PATCH /api/v1/admin/changelog/:id/publish
 * @access  Private/Admin
 */
const togglePublishStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const requestedStatus = req.body?.status;

    const entry = await ChangelogEntry.findById(id);
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Changelog entry not found.',
      });
    }

    const nextStatus = requestedStatus || (entry.status === 'Published' ? 'Draft' : 'Published');
    entry.status = nextStatus;

    if (nextStatus === 'Published' && !entry.publishedAt) {
      entry.publishedAt = new Date();
    }

    await entry.save();
    const updated = await ChangelogEntry.findById(entry._id).populate('author', 'name email role');

    res.status(200).json({
      success: true,
      message: `Changelog entry is now ${nextStatus}.`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a changelog entry and all its reactions
 * @route   DELETE /api/v1/admin/changelog/:id
 * @access  Private/Admin
 */
const deleteChangelog = async (req, res, next) => {
  try {
    const { id } = req.params;

    const entry = await ChangelogEntry.findById(id);
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Changelog entry not found.',
      });
    }

    // Delete associated reactions
    await Reaction.deleteMany({ changelogEntry: id });

    // Delete changelog entry
    await ChangelogEntry.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Changelog entry and associated reactions deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllChangelogs,
  createChangelog,
  getChangelogById,
  updateChangelog,
  togglePublishStatus,
  deleteChangelog,
};
