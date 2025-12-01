/**
 * Test file for SKU Generator
 * Demonstrates usage and example outputs
 */

import { generateSKU, generateBrandCode, generateCategoryCode, generateColorCode, generateSizeCode, generateVariantCode, generateUniqueID } from './skuGenerator.js';

// Example 1: Basic product
const product1 = {
  brand: 'Nike',
  category: 'Shoes',
  color: 'Black',
  size: 'M'
};

console.log('Example 1 - Basic Product:');
console.log('Product:', product1);
console.log('Generated SKU:', generateSKU(product1));
console.log('');

// Example 2: Product with variant
const product2 = {
  brand: 'Adidas',
  category: 'Shirt',
  color: 'Red',
  size: 'L',
  variant: 'Limited Edition'
};

console.log('Example 2 - Product with Variant:');
console.log('Product:', product2);
console.log('Generated SKU:', generateSKU(product2));
console.log('');

// Example 3: Product with special characters
const product3 = {
  brand: 'Levi\'s',
  category: 'Jeans',
  color: 'Dark Blue',
  size: '32W x 34L'
};

console.log('Example 3 - Product with Special Characters:');
console.log('Product:', product3);
console.log('Generated SKU:', generateSKU(product3));
console.log('');

// Example 4: Product with numeric codes
const product4 = {
  brand: 'Samsung',
  category: 'Phone',
  color: 'Midnight Black',
  size: '6.1',
  variant: '5G'
};

console.log('Example 4 - Product with Numeric Codes:');
console.log('Product:', product4);
console.log('Generated SKU:', generateSKU(product4));
console.log('');

// Individual component examples
console.log('Individual Component Examples:');
console.log('Brand Code (Apple):', generateBrandCode('Apple'));
console.log('Category Code (Electronics):', generateCategoryCode('Electronics'));
console.log('Color Code (Silver):', generateColorCode('Silver'));
console.log('Size Code (XL):', generateSizeCode('XL'));
console.log('Variant Code (Special):', generateVariantCode('Special'));
console.log('Unique ID:', generateUniqueID());