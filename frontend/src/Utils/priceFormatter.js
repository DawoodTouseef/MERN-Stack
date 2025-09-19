/**
 * Format price with currency
 * @param {number} price - Price to format
 * @param {string} currency - Currency code (default: 'USD')
 * @returns {string} Formatted price string
 */
export const formatPrice = (price, currency = 'USD') => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  } catch (error) {
    // Fallback if currency is invalid
    return `${currency} ${price.toFixed(2)}`;
  }
};

/**
 * Format price range
 * @param {number} minPrice - Minimum price
 * @param {number} maxPrice - Maximum price
 * @param {string} currency - Currency code (default: 'USD')
 * @returns {string} Formatted price range string
 */
export const formatPriceRange = (minPrice, maxPrice, currency = 'USD') => {
  const formattedMin = formatPrice(minPrice, currency);
  const formattedMax = formatPrice(maxPrice, currency);
  
  if (minPrice === maxPrice) {
    return formattedMin;
  }
  
  return `${formattedMin} - ${formattedMax}`;
};

/**
 * Calculate savings amount
 * @param {number} originalPrice - Original price
 * @param {number} discountedPrice - Discounted price
 * @returns {number} Savings amount
 */
export const calculateSavings = (originalPrice, discountedPrice) => {
  return Math.max(0, originalPrice - discountedPrice);
};

/**
 * Calculate savings percentage
 * @param {number} originalPrice - Original price
 * @param {number} discountedPrice - Discounted price
 * @returns {number} Savings percentage (rounded)
 */
export const calculateSavingsPercentage = (originalPrice, discountedPrice) => {
  if (originalPrice <= 0) return 0;
  const savings = calculateSavings(originalPrice, discountedPrice);
  return Math.round((savings / originalPrice) * 100);
};

/**
 * Format savings display
 * @param {number} originalPrice - Original price
 * @param {number} discountedPrice - Discounted price
 * @param {string} currency - Currency code (default: 'USD')
 * @returns {Object} Formatted savings information
 */
export const formatSavings = (originalPrice, discountedPrice, currency = 'USD') => {
  const savings = calculateSavings(originalPrice, discountedPrice);
  const percentage = calculateSavingsPercentage(originalPrice, discountedPrice);
  
  return {
    amount: formatPrice(savings, currency),
    percentage: percentage,
    hasSavings: savings > 0
  };
};

export default {
  formatPrice,
  formatPriceRange,
  calculateSavings,
  calculateSavingsPercentage,
  formatSavings
};