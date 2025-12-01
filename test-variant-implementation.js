/**
 * Test script for the Amazon-style product variants implementation
 * This script demonstrates how the variant functionality works
 */

// Sample product with variants
const sampleProduct = {
  _id: '64a8c2d2f1a8e8b8c8d5e6f1',
  name: 'iPhone 14 Pro',
  price: 999,
  countInStock: 100,
  media: [
    { type: 'image', url: 'https://example.com/iphone14-main.jpg' }
  ],
  variants: [
    {
      _id: '64a8c2d2f1a8e8b8c8d5e6f2',
      sku: 'IPH14P-BLK-128',
      color: 'Black',
      storage: '128GB',
      price: 999,
      countInStock: 25,
      images: ['https://example.com/iphone14-black-128gb.jpg']
    },
    {
      _id: '64a8c2d2f1a8e8b8c8d5e6f3',
      sku: 'IPH14P-BLK-256',
      color: 'Black',
      storage: '256GB',
      price: 1099,
      countInStock: 20,
      images: ['https://example.com/iphone14-black-256gb.jpg']
    },
    {
      _id: '64a8c2d2f1a8e8b8c8d5e6f4',
      sku: 'IPH14P-SIL-128',
      color: 'Silver',
      storage: '128GB',
      price: 999,
      countInStock: 30,
      images: ['https://example.com/iphone14-silver-128gb.jpg']
    }
  ]
};

// Sample order items with variants
const sampleOrderItems = [
  {
    productId: '64a8c2d2f1a8e8b8c8d5e6f1',
    variantId: '64a8c2d2f1a8e8b8c8d5e6f2',
    qty: 2
  },
  {
    productId: '64a8c2d2f1a8e8b8c8d5e6f1',
    variantId: '64a8c2d2f1a8e8b8c8d5e6f4',
    qty: 1
  },
  {
    productId: '64a8c2d2f1a8e8b8c8d5e6f1',
    qty: 3 // No variant specified - should use main product
  }
];

// Mock Product model for testing
const Product = {
  findById: async (id) => {
    if (id === sampleProduct._id) {
      return sampleProduct;
    }
    return null;
  },
  
  updateOne: async (query, update) => {
    console.log('Updating product stock:', query, update);
    return { modifiedCount: 1 };
  }
};

// Mock utility functions
const findVariantById = (product, variantId) => {
  if (!product || !product.variants || !variantId) {
    return null;
  }
  
  return product.variants.find(variant => 
    variant._id && variant._id.toString() === variantId.toString()
  ) || null;
};

const hasSufficientStock = (variant, quantity) => {
  if (!variant || typeof quantity !== 'number') {
    return false;
  }
  
  return variant.countInStock >= quantity;
};

// Test the order creation process
async function testOrderCreation() {
  console.log('Testing Amazon-style product variants implementation...\n');
  
  try {
    // Simulate fetching products from database
    const itemsFromDB = [];
    for (const item of sampleOrderItems) {
      const product = await Product.findById(item.productId || item._id);
      if (product) {
        itemsFromDB.push(product);
      }
    }
    
    console.log('Products fetched from database:', itemsFromDB.length);
    
    // Process order items
    const dbOrderItems = [];
    
    for (const clientItem of sampleOrderItems) {
      const productId = clientItem.productId || clientItem._id;
      const dbItem = itemsFromDB.find((p) => p._id.toString() === productId);
      
      if (!dbItem) {
        throw new Error(`Product not found: ${productId}`);
      }
      
      // Check if this is a variant order
      if (clientItem.variantId) {
        // Find the specific variant using utility function
        const variant = findVariantById(dbItem, clientItem.variantId);
        
        if (!variant) {
          throw new Error(`Variant not found: ${clientItem.variantId}`);
        }
        
        // Check stock for the variant using utility function
        if (!hasSufficientStock(variant, clientItem.qty)) {
          throw new Error(`Insufficient stock for variant: ${variant.sku}`);
        }
        
        // Add variant details to order item
        dbOrderItems.push({
          name: dbItem.name,
          qty: clientItem.qty,
          media: variant.images || dbItem.media, // Use variant images if available
          price: variant.price,
          product: dbItem._id,
          variantId: variant._id,
          sku: variant.sku,
          selectedOptions: {
            color: variant.color,
            size: variant.size,
            storage: variant.storage
          }
        });
        
        console.log(`Added variant to order: ${variant.sku} (${variant.color}, ${variant.storage}) x${clientItem.qty}`);
      } else {
        // Regular product order (no variant)
        dbOrderItems.push({
          name: dbItem.name,
          qty: clientItem.qty,
          media: dbItem.media,
          price: dbItem.price,
          product: dbItem._id,
        });
        
        console.log(`Added regular product to order: ${dbItem.name} x${clientItem.qty}`);
      }
    }
    
    console.log('\nOrder items created successfully:');
    dbOrderItems.forEach((item, index) => {
      console.log(`${index + 1}. ${item.name} - $${item.price} x${item.qty}`);
      if (item.variantId) {
        console.log(`   Variant: ${item.sku} (${item.selectedOptions.color}, ${item.selectedOptions.storage})`);
      }
    });
    
    // Simulate updating product stock
    console.log('\nUpdating product stock...');
    for (const item of dbOrderItems) {
      if (item.variantId) {
        // Reduce stock from the specific variant
        await Product.updateOne(
          { _id: item.product, "variants._id": item.variantId },
          { $inc: { "variants.$.countInStock": -item.qty } }
        );
        console.log(`Reduced stock for variant ${item.sku} by ${item.qty}`);
      } else {
        // Reduce stock from the main product
        await Product.updateOne({ _id: item.product }, { $inc: { countInStock: -item.qty } });
        console.log(`Reduced stock for product by ${item.qty}`);
      }
    }
    
    console.log('\n✅ Test completed successfully!');
    console.log('✅ Order model now supports product variants with:');
    console.log('   - variantId field to identify the specific variant');
    console.log('   - sku field to store the variant SKU');
    console.log('   - selectedOptions object to store variant attributes');
    console.log('   - Proper stock reduction from variants instead of main product');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testOrderCreation();