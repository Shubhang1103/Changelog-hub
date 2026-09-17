const { z } = require('zod');
const { CHANGELOG_CATEGORIES, CHANGELOG_STATUSES, REACTION_EMOJIS } = require('../config/constants');

const createChangelogSchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: 'Title is required' })
      .trim()
      .min(3, 'Title must be at least 3 characters')
      .max(150, 'Title cannot exceed 150 characters'),
    slug: z
      .string()
      .trim()
      .max(160, 'Slug is too long')
      .optional()
      .nullable(),
    contentMarkdown: z
      .string({ required_error: 'Markdown content is required' })
      .min(5, 'Content must be at least 5 characters'),
    category: z.enum(CHANGELOG_CATEGORIES, {
      errorMap: () => ({ message: `Category must be one of: ${CHANGELOG_CATEGORIES.join(', ')}` }),
    }),
    coverImage: z.string().nullable().optional(),
    status: z.enum(CHANGELOG_STATUSES).optional().default('Draft'),
  }),
});

const updateChangelogSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Changelog ID format'),
  }),
  body: z.object({
    title: z
      .string()
      .trim()
      .min(3, 'Title must be at least 3 characters')
      .max(150, 'Title cannot exceed 150 characters')
      .optional(),
    slug: z.string().trim().optional().nullable(),
    contentMarkdown: z
      .string()
      .min(5, 'Content must be at least 5 characters')
      .optional(),
    category: z.enum(CHANGELOG_CATEGORIES).optional(),
    coverImage: z.string().nullable().optional(),
    status: z.enum(CHANGELOG_STATUSES).optional(),
  }),
});

const publishToggleSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Changelog ID format'),
  }),
  body: z.object({
    status: z.enum(CHANGELOG_STATUSES).optional(),
  }).optional(),
});

const reactionSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Changelog ID format'),
  }),
  body: z.object({
    emoji: z.enum(REACTION_EMOJIS, {
      errorMap: () => ({ message: `Emoji must be one of: ${REACTION_EMOJIS.join(', ')}` }),
    }),
  }),
});

module.exports = {
  createChangelogSchema,
  updateChangelogSchema,
  publishToggleSchema,
  reactionSchema,
};
