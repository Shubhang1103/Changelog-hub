const slugify = require('slugify');

/**
 * Generate a URL-safe slug from a string.
 * @param {string} text
 * @returns {string}
 */
const generateSlug = (text) => {
  return slugify(text || '', {
    lower: true,
    strict: true,
    trim: true,
    remove: /[*+~.()'"!:@]/g,
  });
};

/**
 * Generate a unique slug by checking against an existing Mongoose model.
 * Appends -1, -2, etc. if duplicates exist.
 * @param {import('mongoose').Model} model
 * @param {string} title
 * @param {string|null} currentDocId
 * @returns {Promise<string>}
 */
const generateUniqueSlug = async (model, title, currentDocId = null) => {
  const baseSlug = generateSlug(title) || 'update';
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const query = { slug };
    if (currentDocId) {
      query._id = { $ne: currentDocId };
    }
    const exists = await model.exists(query);
    if (!exists) {
      return slug;
    }
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
};

module.exports = {
  generateSlug,
  generateUniqueSlug,
};
