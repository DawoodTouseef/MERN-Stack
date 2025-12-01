/**
 * Example of integrating SKU generator into product creation workflow
 * This shows how to use the SKU generator in a real product creation scenario
 */

import { generateSKU } from './skuGenerator.js';

/**
 * Example function to create a product with auto-generated SKU
 * @param {Object} productData - The product data from the request
 * @returns {Object} - The product object with generated SKU
 */
const createProductWithSKU = (productData) => {
  // Extract relevant fields for SKU generation
  const { brand, category, color, size, variant } = productData;
  
  // Generate SKU
  const sku = generateSKU({ brand, category, color, size, variant });
  
  // Return product data with generated SKU
  return {
    ...productData,
    sku
  };
};

// Example usage in a controller or service
const exampleProductCreation = () => {
  // Simulate product data from a request
  const requestData = {
    name: 'Air Jordan 1 Retro High',
    brand: 'Nike',
    category: 'Shoes',
    color: 'Chicago Red',
    size: 'US 10.5',
    price: 170.00,
    description: 'Classic basketball shoes with premium leather',
    // Note: No SKU provided - it will be auto-generated
  };
  
  // Create product with auto-generated SKU
  const productWithSKU = createProductWithSKU(requestData);
  
  console.log('Product with Auto-generated SKU:');
  console.log(JSON.stringify(productWithSKU, null, 2));
  
  return productWithSKU;
};

// Run example
exampleProductCreation();

export { createProductWithSKU };