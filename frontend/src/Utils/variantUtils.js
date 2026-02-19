/**
 * Utility functions for handling product variants
 */

/**
 * Get variant by selected options
 * @param {Object} product - The product object
 * @param {Object} selectedOptions - The selected options { [attributeName]: value }
 * @returns {Object|null} The matching variant or null if not found
 */
export const getVariant = (product, selectedOptions) => {
  if (!product || !product.variants || !selectedOptions) {
    return null;
  }

  // Find the variant that matches all selected options
  return product.variants.find(variant => {
    // Check dynamic attributes
    if (variant.attributes && variant.attributes.length > 0) {
      return variant.attributes.every(attr => {
        return selectedOptions[attr.name] === attr.value;
      });
    }

    // Fallback to old structure (color, size, storage)
    return (
      (selectedOptions.color === undefined || variant.color === selectedOptions.color) &&
      (selectedOptions.size === undefined || variant.size === selectedOptions.size) &&
      (selectedOptions.storage === undefined || variant.storage === selectedOptions.storage)
    );
  }) || null;
};

/**
 * Get available options for a product
 * @param {Object} product - The product object
 * @returns {Object} Available options { [attributeName]: [values] }
 */
export const getAvailableOptions = (product) => {
  if (!product || !product.variants) {
    return {};
  }

  const options = {};

  product.variants.forEach(variant => {
    // Collect from attributes array
    if (variant.attributes && variant.attributes.length > 0) {
      variant.attributes.forEach(attr => {
        if (!options[attr.name]) options[attr.name] = new Set();
        options[attr.name].add(attr.value);
      });
    }

    // Fallback/Legacy collectors
    if (variant.color) {
      if (!options.color) options.color = new Set();
      options.color.add(variant.color);
    }
    if (variant.size) {
      if (!options.size) options.size = new Set();
      options.size.add(variant.size);
    }
    if (variant.storage) {
      if (!options.storage) options.storage = new Set();
      options.storage.add(variant.storage);
    }
  });

  // Convert Sets to Arrays
  const formattedOptions = {};
  Object.keys(options).forEach(key => {
    formattedOptions[key] = Array.from(options[key]);
  });

  return formattedOptions;
};

/**
 * Format variant attributes for display
 * @param {Object} variant - The variant object
 * @returns {String} Formatted variant attributes
 */
export const formatVariantAttributes = (variant) => {
  if (!variant) return '';

  const attributes = [];

  if (variant.attributes && variant.attributes.length > 0) {
    variant.attributes.forEach(attr => {
      attributes.push(`${attr.name}: ${attr.value}`);
    });
  } else {
    // Fallback
    if (variant.color) attributes.push(`Color: ${variant.color}`);
    if (variant.size) attributes.push(`Size: ${variant.size}`);
    if (variant.storage) attributes.push(`Storage: ${variant.storage}`);
  }

  return attributes.join(', ');
};

/**
 * Get field from variant or product (fallback)
 * @param {Object} variant - The variant object
 * @param {Object} product - The product object
 * @param {String} fieldName - The field name to retrieve
 * @returns {any} The field value
 */
export const getVariantField = (variant, product, fieldName) => {
  // Try variant first
  if (variant && variant[fieldName] !== undefined && variant[fieldName] !== null && variant[fieldName] !== '') {
    // For nested objects like specifications, merge or choose
    if (fieldName === 'specifications' && product?.specifications) {
      return { ...product.specifications, ...variant.specifications };
    }
    return variant[fieldName];
  }
  // Fallback to product
  return product ? product[fieldName] : null;
};

/**
 * Check if variant is in stock
 * @param {Object} variant - The variant object
 * @returns {Boolean} True if in stock, false otherwise
 */
export const isVariantInStock = (variant) => {
  if (!variant) return false;
  return variant.countInStock > 0;
};

/**
 * Get variant price
 * @param {Object} variant - The variant object
 * @returns {Number} The variant price
 */
export const getVariantPrice = (variant) => {
  if (!variant) return 0;
  return variant.price || 0;
};

/**
 * Get variant images
 * @param {Object} variant - The variant object
 * @param {Object} product - The product object (fallback)
 * @returns {Array} Array of image URLs
 */
export const getVariantImages = (variant, product) => {
  if (!variant && !product) return [];

  // Use variant images if available, otherwise fall back to product media
  let images = (variant?.images?.length > 0) ? variant.images : (product?.media?.map(m => m.url) || []);

  // Filter out any falsy values and ensure we have strings
  return images.filter(img => typeof img === 'string' && img.length > 0);
};

/**
 * Get all available variants for a product
 * @param {Object} product - The product object
 * @returns {Array} Array of variant objects
 */
export const getAllVariants = (product) => {
  if (!product || !product.variants) return [];
  return product.variants;
};

/**
 * Check if product has variants
 * @param {Object} product - The product object
 * @returns {Boolean} True if product has variants, false otherwise
 */
export const hasVariants = (product) => {
  if (!product || !product.variants) return false;
  return product.variants.length > 0;
};

/**
 * Get variant by ID
 * @param {Object} product - The product object
 * @param {String} variantId - The variant ID
 * @returns {Object|null} The matching variant or null if not found
 */
export const getVariantById = (product, variantId) => {
  if (!product || !product.variants || !variantId) return null;
  return product.variants.find(variant => variant._id === variantId) || null;
};

/**
 * Get variant SKU
 * @param {Object} variant - The variant object
 * @returns {String} The variant SKU
 */
export const getVariantSku = (variant) => {
  if (!variant) return '';
  return variant.sku || '';
};

/**
 * Get variant shipping details
 * @param {Object} variant - The variant object
 * @returns {Object} The variant shipping details
 */
export const getVariantShippingDetails = (variant) => {
  if (!variant) return {};
  return variant.shipping || {};
};

export default {
  getVariant,
  getAvailableOptions,
  formatVariantAttributes,
  getVariantField,
  isVariantInStock,
  getVariantPrice,
  getVariantImages,
  getAllVariants,
  hasVariants,
  getVariantById,
  getVariantSku,
  getVariantShippingDetails
};