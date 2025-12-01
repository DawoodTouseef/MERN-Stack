/**
 * SKU Generator Utility
 * Generates standardized SKUs for products following the structure:
 * BRANDCODE-CATEGORYCODE-UNIQUEID-COLORCODE-SIZECODE-VARIANTCODE(optional)
 */

/**
 * Creates a standardized code from text
 * @param {string} text - The input text
 * @param {number} length - The desired length of the code
 * @returns {string} - The generated code
 */
const createCode = (text, length) => {
  if (!text) return 'XXX';
  
  // Remove special characters and spaces, convert to uppercase
  const cleanedText = text.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  
  // Take first N characters or pad with X if shorter
  if (cleanedText.length >= length) {
    return cleanedText.substring(0, length);
  } else {
    return cleanedText.padEnd(length, 'X');
  }
};

/**
 * Generates a brand code (first 3 alphanumeric characters)
 * @param {string} brand - The brand name
 * @returns {string} - The brand code
 */
const generateBrandCode = (brand) => {
  return createCode(brand, 3);
};

/**
 * Generates a category code (first 3 alphanumeric characters)
 * @param {string} category - The category name
 * @returns {string} - The category code
 */
const generateCategoryCode = (category) => {
  return createCode(category, 3);
};

/**
 * Generates a color code (first 3 alphanumeric characters)
 * @param {string} color - The color name
 * @returns {string} - The color code
 */
const generateColorCode = (color) => {
  return createCode(color, 3);
};

/**
 * Generates a size code (full size label)
 * @param {string} size - The size label
 * @returns {string} - The size code
 */
const generateSizeCode = (size) => {
  if (!size) return 'OS';
  return size.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
};

/**
 * Generates a variant code (first 3 alphanumeric characters)
 * @param {string} variant - The variant name
 * @returns {string} - The variant code
 */
const generateVariantCode = (variant) => {
  if (!variant) return '';
  return createCode(variant, 3);
};

/**
 * Generates a unique ID (last 4 digits of timestamp)
 * @returns {string} - The unique ID
 */
const generateUniqueID = () => {
  // Using last 4 digits of current timestamp
  return Date.now().toString().slice(-4);
};

/**
 * Generates a complete SKU for a product
 * Format: BRANDCODE-CATEGORYCODE-UNIQUEID-COLORCODE-SIZECODE-VARIANTCODE(optional)
 * @param {Object} product - The product object
 * @param {string} product.brand - The brand name
 * @param {string} product.category - The category name
 * @param {string} product.color - The color name
 * @param {string} product.size - The size label
 * @param {string} [product.variant] - The variant name (optional)
 * @returns {string} - The complete SKU
 */
const generateSKU = ({ brand, category, color, size, variant }) => {
  // Generate all required components
  const brandCode = generateBrandCode(brand);
  const categoryCode = generateCategoryCode(category);
  const uniqueID = generateUniqueID();
  const colorCode = generateColorCode(color);
  const sizeCode = generateSizeCode(size);
  const variantCode = generateVariantCode(variant);
  
  // Construct the SKU
  let sku = `${brandCode}-${categoryCode}-${uniqueID}-${colorCode}-${sizeCode}`;
  
  // Add variant code if it exists
  if (variantCode) {
    sku += `-${variantCode}`;
  }
  
  return sku;
};

// Export all functions for modular use
export {
  createCode,
  generateBrandCode,
  generateCategoryCode,
  generateColorCode,
  generateSizeCode,
  generateVariantCode,
  generateUniqueID,
  generateSKU
};