/**
 * Utility functions for handling product variants
 */

/**
 * Find a variant by its ID within a product
 * @param {Object} product - The product object
 * @param {String} variantId - The variant ID to find
 * @returns {Object|null} The variant object if found, null otherwise
 */
export const findVariantById = (product, variantId) => {
  if (!product || !product.variants || !variantId) {
    return null;
  }
  
  return product.variants.find(variant => 
    variant._id && variant._id.toString() === variantId.toString()
  ) || null;
};

/**
 * Get variant details for order items
 * @param {Object} product - The product object
 * @param {String} variantId - The variant ID
 * @returns {Object} Variant details for order items
 */
export const getVariantOrderDetails = (product, variantId) => {
  const variant = findVariantById(product, variantId);
  
  if (!variant) {
    throw new Error(`Variant not found: ${variantId}`);
  }
  
  return {
    variantId: variant._id,
    sku: variant.sku,
    price: variant.price,
    media: variant.images || product.media,
    selectedOptions: {
      color: variant.color,
      size: variant.size,
      storage: variant.storage
    }
  };
};

/**
 * Check if variant has sufficient stock
 * @param {Object} variant - The variant object
 * @param {Number} quantity - The requested quantity
 * @returns {Boolean} True if sufficient stock, false otherwise
 */
export const hasSufficientStock = (variant, quantity) => {
  if (!variant || typeof quantity !== 'number') {
    return false;
  }
  
  return variant.countInStock >= quantity;
};

/**
 * Format variant attributes for display
 * @param {Object} variant - The variant object
 * @returns {String} Formatted variant attributes
 */
export const formatVariantAttributes = (variant) => {
  if (!variant) return '';
  
  const attributes = [];
  if (variant.color) attributes.push(`Color: ${variant.color}`);
  if (variant.size) attributes.push(`Size: ${variant.size}`);
  if (variant.storage) attributes.push(`Storage: ${variant.storage}`);
  
  return attributes.join(', ');
};

export default {
  findVariantById,
  getVariantOrderDetails,
  hasSufficientStock,
  formatVariantAttributes
};