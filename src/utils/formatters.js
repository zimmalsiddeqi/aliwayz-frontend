import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import updateLocale from 'dayjs/plugin/updateLocale';

dayjs.extend(relativeTime);
dayjs.extend(updateLocale);

dayjs.updateLocale('en', {
  relativeTime: {
    future: 'in %s',
    past:   '%s ago',
    s:      'just now',
    m:      '1m',
    mm:     '%dm',
    h:      '1h',
    hh:     '%dh',
    d:      '1d',
    dd:     '%dd',
    M:      '1mo',
    MM:     '%dmo',
    y:      '1y',
    yy:     '%dy',
  },
});

/**
 * Format price display
 */
export function formatPrice(amount, currency = 'USD') {
  if (amount === null || amount === undefined) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style:                 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(amount));
}

/**
 * Format compact numbers (1.2K, 3.4M)
 */
export function formatCompactNumber(num) {
  if (!num) return '0';
  return new Intl.NumberFormat('en-US', {
    notation:             'compact',
    maximumFractionDigits: 1,
  }).format(num);
}

/**
 * Format relative time using dayjs
 */
export function formatRelativeTime(dateString) {
  if (!dateString) return '';
  return dayjs(dateString).fromNow(true);
}

/**
 * Format full date
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  return dayjs(dateString).format('MMM D, YYYY');
}

/**
 * Format date + time
 */
export function formatDateTime(dateString) {
  if (!dateString) return '';
  return dayjs(dateString).format('MMM D, YYYY h:mm A');
}

/**
 * Format chat message timestamp
 */
export function formatChatTime(dateString) {
  if (!dateString) return '';
  const date = dayjs(dateString);
  const now  = dayjs();

  if (date.isSame(now, 'day'))         return date.format('h:mm A');
  if (date.isSame(now.subtract(1, 'day'), 'day')) return 'Yesterday';
  if (date.isAfter(now.subtract(7, 'day')))       return date.format('ddd');
  return date.format('MMM D');
}

/**
 * Format member since (joined date)
 */
export function formatMemberSince(dateString) {
  if (!dateString) return '';
  return `Member since ${dayjs(dateString).format('MMMM YYYY')}`;
}

/**
 * Format QR expiry countdown
 */
export function formatQRExpiry(expiresAt) {
  if (!expiresAt) return '0:00';
  const diff = dayjs(expiresAt).diff(dayjs(), 'second');
  if (diff <= 0) return 'Expired';
  const minutes = Math.floor(diff / 60);
  const seconds = diff % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Format rating to 1 decimal
 */
export function formatRating(rating) {
  if (!rating) return '0.0';
  return Number(rating).toFixed(1);
}

/**
 * Format phone number for display
 */
export function formatPhone(phone) {
  if (!phone) return '';
  return phone.replace(/(\+\d{1,2})(\d{3})(\d{3})(\d{4})/, '$1 ($2) $3-$4');
}