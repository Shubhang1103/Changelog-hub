const { z } = require('zod');

const signupSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Name is required' })
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(60, 'Name cannot exceed 60 characters'),
    email: z
      .string({ required_error: 'Email is required' })
      .trim()
      .email('Invalid email address')
      .toLowerCase(),
    password: z
      .string({ required_error: 'Password is required' })
      .min(6, 'Password must be at least 6 characters')
      .max(100, 'Password is too long'),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .trim()
      .email('Invalid email address')
      .toLowerCase(),
    password: z
      .string({ required_error: 'Password is required' })
      .min(1, 'Password is required'),
  }),
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .trim()
      .email('Invalid email address')
      .toLowerCase(),
  }),
});

const resetPasswordSchema = z.object({
  params: z.object({
    token: z.string({ required_error: 'Token parameter is required' }).min(10, 'Invalid token'),
  }),
  body: z.object({
    password: z
      .string({ required_error: 'New password is required' })
      .min(6, 'Password must be at least 6 characters')
      .max(100, 'Password is too long'),
  }),
});

const verifyEmailSchema = z.object({
  params: z.object({
    token: z.string({ required_error: 'Verification token is required' }).min(10, 'Invalid token'),
  }),
});

module.exports = {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
};
