/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} username
 * @property {string} [full_name]
 * @property {string} [avatar_url]
 * @property {string} [bio]
 * @property {string} role - 'guest'|'buyer'|'seller'|'both'|'admin'
 * @property {string} account_status
 * @property {boolean} email_verified
 * @property {boolean} phone_verified
 * @property {string} [location_city]
 * @property {string} auth_provider
 * @property {string} created_at
 */

/**
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} title
 * @property {string} slug
 * @property {string} [description]
 * @property {number} price
 * @property {string} currency
 * @property {string} condition
 * @property {string} [brand]
 * @property {string} status
 * @property {string} [location_city]
 * @property {number} view_count
 * @property {number} favorite_count
 * @property {boolean} is_featured
 * @property {string} created_at
 * @property {Object[]} product_images
 * @property {Object} stores
 * @property {Object} users
 */

/**
 * @typedef {Object} Conversation
 * @property {string} id
 * @property {string} product_id
 * @property {string} buyer_id
 * @property {string} seller_id
 * @property {string} status
 * @property {string} [last_message_at]
 * @property {string} [last_message_preview]
 * @property {number} buyer_unread_count
 * @property {number} seller_unread_count
 * @property {Object} products
 * @property {Object} buyer
 * @property {Object} seller
 */

export {};