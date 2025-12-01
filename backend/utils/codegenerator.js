// Utility function to create a code from any text (3 letters)
function createCode(str, length = 3) {
  if (!str) return "";
  return str.replace(/[^A-Za-z0-9]/g, "")
            .substring(0, length)
            .toUpperCase();
}

// Unique ID generator (incremental or timestamp based)
export function generateUniqueID() {
  return Date.now().toString().slice(-4); // last 4 digits of timestamp
}

/**
 * Generate Brand Code
 */
export function generateBrandCode(brand) {
  return createCode(brand, 3);
}

/**
 * Generate Category Code
 */
export function generateCategoryCode(category) {
  return createCode(category, 3);
}

/**
 * Generate Color Code
 */
export function generateColorCode(color) {
  return createCode(color, 3);
}

/**
 * Generate Size Code
 */
export function generateSizeCode(size) {
  if (!size) return "NA";
  return size.toString().toUpperCase();
}

/**
 * Generate Variant Code (optional)
 */
export function generateVariantCode(variant) {
  if (!variant) return "";  
  return createCode(variant, 3);
}

/**
 * Final SKU generator
 * SKU Format:
 * BRAND - CATEGORY - PRODUCTID - COLOR - SIZE - VARIANT
 */
export default function generateSKU(product) {
  const brandCode = generateBrandCode(product.brand);
  const categoryCode = generateCategoryCode(product.category);
  const colorCode = generateColorCode(product.color);
  const sizeCode = generateSizeCode(product.size);
  const variantCode = generateVariantCode(product.variant);
  const productID = generateUniqueID();

  // Build SKU
  let sku = `${brandCode}-${categoryCode}-${productID}-${colorCode}-${sizeCode}`;

  if (variantCode) {
    sku += `-${variantCode}`;
  }

  return sku;
}

