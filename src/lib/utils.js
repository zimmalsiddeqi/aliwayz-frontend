import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes safely
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format price with currency
 */
export function formatPrice(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style:    'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(dateString) {
  const date = new Date(dateString);
  const now  = new Date();
  const diff = Math.floor((now - date) / 1000); // seconds

  if (diff < 60)                    return 'just now';
  if (diff < 3600)                  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)                 return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800)                return `${Math.floor(diff / 86400)}d ago`;
  if (diff < 2592000)               return `${Math.floor(diff / 604800)}w ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Format date string
 */
export function formatDate(dateString, options = {}) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day:   'numeric',
    year:  'numeric',
    ...options,
  });
}

/**
 * Format chat timestamp
 */
export function formatChatTime(dateString) {
  const date = new Date(dateString);
  const now  = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString('en-US', {
      hour:   '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }


  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Truncate text
 */
export function truncate(text, maxLength = 100) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength).trim()}...`;
}

/**
 * Generate avatar initials
 */
export function getInitials(name = '') {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

/**
 * Format file size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Slugify text
 */
export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}

/**
 * Deep merge objects
 */
export function deepMerge(target, source) {
  const result = { ...target };
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

/**
 * Format seller rating — shows "New Seller" if no ratings
 */
export function formatSellerRating(rating, reviewCount = 0) {
  if (!rating || rating === 0 || reviewCount === 0) {
    return { label: 'New Seller', isNew: true };
  }
  return {
    label: Number(rating).toFixed(1),
    isNew: false,
  };
}

/**
 * Extract error message from API response
 */
export function getErrorMessage(error) {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response?.data?.errors?.[0]?.message) return error.response.data.errors[0].message;
  if (error?.message) return error.message;
  return 'Something went wrong. Please try again.';
}

/**
 * Check if user has seller capability
 */
export function isSeller(role) {
  return ['seller', 'both', 'admin'].includes(role);
}

/**
 * Check if user has buyer capability
 */
export function isBuyer(role) {
  return ['buyer', 'both', 'admin'].includes(role);
}

/**
 * Check if user is admin
 */
export function isAdmin(role) {
  return role === 'admin';
}

/**
 * Build CDN image URL
 */
export function buildImageUrl(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${import.meta.env.VITE_API_BASE_URL}${url}`;
}

/**
 * Debounce function
 */
export function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Parse pagination from API response
 */
export function parsePagination(pagination) {
  return {
    page:        pagination?.page        || 1,
    limit:       pagination?.limit       || 20,
    total:       pagination?.total       || 0,
    totalPages:  pagination?.total_pages || 1,
    hasNext:     pagination?.has_next    || false,
    hasPrev:     pagination?.has_prev    || false,
  };
}

/**
 * Get product condition label
 */
export function getConditionLabel(condition) {
  const labels = {
    new:       'New',
    like_new:  'Like New',
    good:      'Good',
    fair:      'Fair',
    poor:      'Poor',
  };
  return labels[condition] || condition;
}

/**
 * Get condition color class
 */
export function getConditionColor(condition) {
  const colors = {
    new:       'text-accent-green bg-accent-green/10',
    like_new:  'text-accent-cyan bg-accent-cyan/10',
    good:      'text-brand-400 bg-brand-400/10',
    fair:      'text-accent-orange bg-accent-orange/10',
    poor:      'text-accent-red bg-accent-red/10',
  };
  return colors[condition] || 'text-slate-400 bg-slate-400/10';
}

/**
 * Get product status color class
 */
export function getStatusColor(status) {
  const colors = {
    available: 'text-accent-green bg-accent-green/10',
    reserved:  'text-accent-orange bg-accent-orange/10',
    sold:      'text-accent-red bg-accent-red/10',
    hidden:    'text-slate-400 bg-slate-400/10',
    draft:     'text-slate-500 bg-slate-500/10',
  };
  return colors[status] || 'text-slate-400 bg-slate-400/10';
}

/**
 * Get notification icon by type
 */
export function getNotificationIcon(type) {
  const icons = {
    new_message:      '💬',
    new_follower:     '👤',
    price_update:     '📉',
    product_sold:     '🎉',
    review_received:  '⭐',
    admin_message:    '📢',
    qr_generated:     '📱',
    badge_earned:     '🏆',
    report_resolved:  '✅',
  };
  return icons[type] || '🔔';
}

/**
 * Safe JSON parse
 */
export function safeJsonParse(str, fallback = null) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

/**
 * Check if value is empty
 */
export function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}