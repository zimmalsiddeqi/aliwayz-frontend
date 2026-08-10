import { z } from 'zod';

// ─────────────────────────────────────────
// Reusable field schemas
// ─────────────────────────────────────────
const emailField = z
  .string()
  .min(1, 'Email is required')
  .email('Enter a valid email address')
  .max(255, 'Email too long')
  .toLowerCase()
  .trim();

const passwordField = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
    'Must contain uppercase, lowercase, number, and special character'
  );

const usernameField = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(50, 'Username too long')
  .regex(
    /^[a-zA-Z0-9_]+$/,
    'Only letters, numbers, and underscores allowed'
  )
  .toLowerCase()
  .trim();

// ─────────────────────────────────────────
// Auth schemas — match backend auth.schema.js
// ─────────────────────────────────────────
export const loginSchema = z.object({
  email:    emailField,
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email:     emailField,
  password:  passwordField,
  username:  usernameField,
  full_name: z.string().min(2, 'Full name required').max(100).trim().optional(),
  role:      z.enum(['buyer', 'seller', 'both']).default('buyer'),
});

export const forgotPasswordSchema = z.object({
  email: emailField,
});

export const resetPasswordSchema = z.object({
  token:        z.string().min(1, 'Reset token is required'),
  email:        emailField,
  new_password: passwordField,
}).refine((data) => data.new_password, {
  message: 'Password is required',
  path:    ['new_password'],
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
  email: emailField,
});

export const completeProfileSchema = z.object({
  username:      usernameField,
  full_name:     z.string().min(2).max(100).trim().optional(),
  role:          z.enum(['buyer', 'seller', 'both']),
  location_city: z.string().max(100).optional(),
  location_lat:  z.number().min(-90).max(90).optional(),
  location_lng:  z.number().min(-180).max(180).optional(),
});

export const phoneRequestSchema = z.object({
  phone: z
    .string()
    .regex(/^\+[1-9]\d{1,14}$/, 'Phone must be in E.164 format (+1234567890)'),
});

export const phoneConfirmSchema = z.object({
  phone: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Invalid phone format'),
  otp:   z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must be numeric'),
});

// ─────────────────────────────────────────
// Profile schemas — match backend user.schema.js
// ─────────────────────────────────────────
export const updateProfileSchema = z.object({
  full_name: z.string().min(2).max(100).trim().optional(),
  bio:       z.string().max(500).trim().optional(),
  username:  usernameField.optional(),
});

export const updateLocationSchema = z.object({
  location_city: z.string().min(2).max(100).trim(),
  location_lat:  z.number().min(-90).max(90),
  location_lng:  z.number().min(-180).max(180),
});

export const updateRoleSchema = z.object({
  role: z.enum(['buyer', 'seller', 'both']),
});

// ─────────────────────────────────────────
// Store schemas — match backend store.schema.js
// ─────────────────────────────────────────
export const createStoreSchema = z.object({
  store_name:       z.string().min(3, 'Store name must be at least 3 characters').max(100).trim(),
  description:      z.string().max(1000).trim().optional(),
  category_id:      z.string().uuid('Invalid category').optional(),
  location_city:    z.string().max(100).trim().optional(),
  location_lat:     z.number().min(-90).max(90).optional(),
  location_lng:     z.number().min(-180).max(180).optional(),
  social_instagram: z.string().url('Invalid URL').max(255).optional().or(z.literal('')),
  social_facebook:  z.string().url('Invalid URL').max(255).optional().or(z.literal('')),
  social_tiktok:    z.string().url('Invalid URL').max(255).optional().or(z.literal('')),
});

export const updateStoreSchema = createStoreSchema.partial();

// ─────────────────────────────────────────
// Product schemas — match backend product.schema.js
// ─────────────────────────────────────────
export const createProductSchema = z.object({
  title:         z.string().min(3, 'Title must be at least 3 characters').max(200).trim(),
  description:   z.string().max(5000).trim().optional(),
  category_id:   z.string().uuid('Select a valid category'),
  condition:     z.enum(['new', 'like_new', 'good', 'fair', 'poor'], {
    errorMap: () => ({ message: 'Select a condition' }),
  }),
  price:         z.coerce.number({ invalid_type_error: 'Enter a valid price' })
                   .positive('Price must be greater than 0')
                   .max(999999999),
  currency:      z.string().length(3).default('USD'),
  brand:         z.string().max(100).trim().optional(),
  color:         z.string().max(50).trim().optional(),
  quantity:      z.coerce.number().int().min(1).max(9999).default(1),
  location_city: z.string().max(100).trim().optional(),
  location_lat:  z.coerce.number().min(-90).max(90).optional(),
  location_lng:  z.coerce.number().min(-180).max(180).optional(),
  status:        z.enum(['available', 'draft']).default('available'),
});

export const updateProductSchema = createProductSchema.partial();

export const updateStatusSchema = z.object({
  status: z.enum(['available', 'reserved', 'hidden', 'draft']),
});

// ─────────────────────────────────────────
// Chat schemas — match backend chat.schema.js
// ─────────────────────────────────────────
export const createConversationSchema = z.object({
  product_id:      z.string().uuid('Invalid product'),
  initial_message: z.string().min(1, 'Message cannot be empty').max(2000).trim(),
});

export const sendMessageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(2000).trim(),
});

// ─────────────────────────────────────────
// Review schemas — match backend review.schema.js
// ─────────────────────────────────────────
export const createReviewSchema = z.object({
  qr_transaction_id:   z.string().uuid('Invalid transaction'),
  rating:              z.number().int().min(1, 'Rating required').max(5),
  comment:             z.string().max(1000).trim().optional(),
  tag_friendly:        z.boolean().default(false),
  tag_fast:            z.boolean().default(false),
  tag_accurate:        z.boolean().default(false),
  tag_great_comm:      z.boolean().default(false),
  tag_would_buy_again: z.boolean().default(false),
  tag_would_sell_again:z.boolean().default(false),
});

// ─────────────────────────────────────────
// Report schema — match backend report.schema.js
// ─────────────────────────────────────────
export const createReportSchema = z.object({
  target_type:  z.enum(['user', 'product', 'store']),
  target_id:    z.string().uuid('Invalid target'),
  reason:       z.enum(['spam', 'counterfeit', 'inappropriate', 'scam', 'harassment', 'other']),
  description:  z.string().max(500).trim().optional(),
});

// ─────────────────────────────────────────
// Search schema — match backend search.schema.js
// ─────────────────────────────────────────
export const searchQuerySchema = z.object({
  q:                 z.string().min(1).max(200).trim(),
  page:              z.number().int().min(1).default(1),
  limit:             z.number().int().min(1).max(50).default(20),
  category_id:       z.string().uuid().optional(),
  min_price:         z.number().min(0).optional(),
  max_price:         z.number().min(0).optional(),
  condition:         z.enum(['new', 'like_new', 'good', 'fair', 'poor']).optional(),
  sort:              z.enum(['relevance', 'newest', 'price_asc', 'price_desc', 'popular']).default('relevance'),
  city:              z.string().max(100).optional(),
  verified_sellers:  z.boolean().optional(),
  min_seller_rating: z.number().min(0).max(5).optional(),
});