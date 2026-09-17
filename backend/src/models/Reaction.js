const mongoose = require('mongoose');
const { REACTION_EMOJIS } = require('../config/constants');

const reactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required for a reaction'],
      index: true,
    },
    changelogEntry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChangelogEntry',
      required: [true, 'Changelog entry is required for a reaction'],
      index: true,
    },
    emoji: {
      type: String,
      enum: {
        values: REACTION_EMOJIS,
        message: '{VALUE} is not a supported reaction emoji',
      },
      required: [true, 'Emoji is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index ensuring a user can only react once per emoji per changelog entry
reactionSchema.index({ user: 1, changelogEntry: 1, emoji: 1 }, { unique: true });

module.exports = mongoose.model('Reaction', reactionSchema);
