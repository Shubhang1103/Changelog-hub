const mongoose = require('mongoose');
const { CHANGELOG_CATEGORIES, CHANGELOG_STATUSES } = require('../config/constants');
const { generateUniqueSlug } = require('../utils/slugUtils');

const changelogEntrySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an update title'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    contentMarkdown: {
      type: String,
      required: [true, 'Please provide markdown content for the changelog entry'],
    },
    category: {
      type: String,
      enum: CHANGELOG_CATEGORIES,
      required: [true, 'Please select a category (New, Improved, Fixed)'],
    },
    coverImage: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: CHANGELOG_STATUSES,
      default: 'Draft',
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'An author is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for reverse-chronological queries on published entries
changelogEntrySchema.index({ status: 1, publishedAt: -1 });

// Text index on title and contentMarkdown for keyword search
changelogEntrySchema.index({ title: 'text', contentMarkdown: 'text' });

// Ensure slug and publishedAt are properly maintained before saving
changelogEntrySchema.pre('save', async function (next) {
  // If slug is missing or title changed and slug wasn't manually altered
  if (!this.slug || this.isModified('title')) {
    if (!this.slug || this.slug.trim() === '') {
      this.slug = await generateUniqueSlug(this.constructor, this.title, this._id);
    }
  }

  // If status changed to Published and publishedAt is not yet set
  if (this.status === 'Published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  next();
});

module.exports = mongoose.model('ChangelogEntry', changelogEntrySchema);
