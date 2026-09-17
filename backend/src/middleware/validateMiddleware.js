const { ZodError } = require('zod');

/**
 * Express middleware for validating request against a Zod schema.
 * Supports validating body, params, and query.
 * @param {import('zod').ZodSchema} schema
 */
const validate = (schema) => async (req, res, next) => {
  try {
    const parsed = await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    // Assign sanitized / coerced values back to request
    if (parsed.body) req.body = parsed.body;
    if (parsed.query) req.query = parsed.query;
    if (parsed.params) req.params = parsed.params;

    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedErrors = error.errors.map((err) => ({
        field: err.path.slice(1).join('.') || err.path[0] || 'field',
        message: err.message,
      }));

      return res.status(400).json({
        success: false,
        message: formattedErrors[0]?.message || 'Validation failed',
        errors: formattedErrors,
      });
    }

    next(error);
  }
};

module.exports = validate;
