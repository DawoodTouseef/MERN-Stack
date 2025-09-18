import mongoose from 'mongoose';

// Database indexing optimization utility
export class DatabaseIndexManager {
  
  // Create performance indexes for all models
  static async createOptimizedIndexes() {
    console.log('🔧 Creating optimized database indexes...');
    
    try {
      await this.createUserIndexes();
      await this.createProductIndexes();
      await this.createOrderIndexes();
      await this.createRecommendationIndexes();
      
      console.log('✅ Database indexes created successfully');
    } catch (error) {
      console.error('❌ Error creating database indexes:', error);
    }
  }
  
  // User model indexes
  static async createUserIndexes() {
    const User = mongoose.model('User');
    
    // Primary search indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ username: 1 });
    await User.collection.createIndex({ role: 1 });
    await User.collection.createIndex({ status: 1 });
    
    // Authentication indexes
    await User.collection.createIndex({ emailVerificationToken: 1 }, { sparse: true });
    await User.collection.createIndex({ passwordResetToken: 1 }, { sparse: true });
    await User.collection.createIndex({ lockUntil: 1 }, { sparse: true });
    
    // Compound indexes for common queries
    await User.collection.createIndex({ role: 1, status: 1 });
    await User.collection.createIndex({ createdAt: -1, role: 1 });
    
    // TTL indexes for cleanup
    await User.collection.createIndex(
      { emailVerificationExpires: 1 }, 
      { expireAfterSeconds: 0 }
    );
    await User.collection.createIndex(
      { passwordResetExpires: 1 }, 
      { expireAfterSeconds: 0 }
    );
    
    console.log('✅ User indexes created');
  }
  
  // Product model indexes
  static async createProductIndexes() {
    const Product = mongoose.model('Product');
    
    // Search and filter indexes
    await Product.collection.createIndex({ name: 'text', description: 'text' });
    await Product.collection.createIndex({ category: 1 });
    await Product.collection.createIndex({ brand: 1 });
    await Product.collection.createIndex({ price: 1 });
    await Product.collection.createIndex({ rating: -1 });
    await Product.collection.createIndex({ countInStock: 1 });
    await Product.collection.createIndex({ createdAt: -1 });
    
    // Compound indexes for common queries
    await Product.collection.createIndex({ category: 1, price: 1 });
    await Product.collection.createIndex({ category: 1, rating: -1 });
    await Product.collection.createIndex({ brand: 1, category: 1 });
    await Product.collection.createIndex({ countInStock: 1, status: 1 });
    await Product.collection.createIndex({ rating: -1, numReviews: -1 });
    
    // Performance indexes
    await Product.collection.createIndex({ 
      category: 1, 
      countInStock: 1, 
      rating: -1 
    });
    
    console.log('✅ Product indexes created');
  }
  
  // Order model indexes
  static async createOrderIndexes() {
    const Order = mongoose.model('Order');
    
    // Primary indexes
    await Order.collection.createIndex({ user: 1 });
    await Order.collection.createIndex({ orderNumber: 1 }, { unique: true });
    await Order.collection.createIndex({ orderStatus: 1 });
    await Order.collection.createIndex({ isPaid: 1 });
    await Order.collection.createIndex({ isDelivered: 1 });
    await Order.collection.createIndex({ createdAt: -1 });
    
    // Analytics indexes
    await Order.collection.createIndex({ paidAt: -1 }, { sparse: true });
    await Order.collection.createIndex({ deliveredAt: -1 }, { sparse: true });
    await Order.collection.createIndex({ totalPrice: -1 });
    
    // Compound indexes for reports
    await Order.collection.createIndex({ 
      isPaid: 1, 
      createdAt: -1 
    });
    await Order.collection.createIndex({ 
      user: 1, 
      createdAt: -1 
    });
    await Order.collection.createIndex({ 
      orderStatus: 1, 
      createdAt: -1 
    });
    
    // Order items indexes
    await Order.collection.createIndex({ 'orderItems.product': 1 });
    
    console.log('✅ Order indexes created');
  }
  
  // Recommendation model indexes
  static async createRecommendationIndexes() {
    try {
      const UserBehavior = mongoose.model('UserBehavior');
      const ProductSimilarity = mongoose.model('ProductSimilarity');
      const Recommendation = mongoose.model('Recommendation');
      
      // UserBehavior indexes
      await UserBehavior.collection.createIndex({ user: 1 });
      await UserBehavior.collection.createIndex({ 'events.timestamp': -1 });
      await UserBehavior.collection.createIndex({ 'events.product': 1 });
      await UserBehavior.collection.createIndex({ 'events.type': 1 });
      await UserBehavior.collection.createIndex({ 
        user: 1, 
        'events.timestamp': -1 
      });
      
      // ProductSimilarity indexes
      await ProductSimilarity.collection.createIndex({ product: 1 });
      await ProductSimilarity.collection.createIndex({ 'similarProducts.product': 1 });
      await ProductSimilarity.collection.createIndex({ lastUpdated: -1 });
      
      // Recommendation indexes
      await Recommendation.collection.createIndex({ user: 1 });
      await Recommendation.collection.createIndex({ generatedAt: -1 });
      await Recommendation.collection.createIndex({ expiresAt: 1 }, { 
        expireAfterSeconds: 0 
      });
      
      console.log('✅ Recommendation indexes created');
    } catch (error) {
      console.log('⚠️ Recommendation models not found, skipping indexes');
    }
  }
  
  // Category and Brand indexes
  static async createCategoryBrandIndexes() {
    try {
      const Category = mongoose.model('Category');
      const Brand = mongoose.model('Brand');
      
      // Category indexes
      await Category.collection.createIndex({ name: 1 }, { unique: true });
      await Category.collection.createIndex({ slug: 1 }, { unique: true });
      await Category.collection.createIndex({ parent: 1 }, { sparse: true });
      
      // Brand indexes
      await Brand.collection.createIndex({ name: 1 }, { unique: true });
      await Brand.collection.createIndex({ slug: 1 }, { unique: true });
      
      console.log('✅ Category and Brand indexes created');
    } catch (error) {
      console.log('⚠️ Category/Brand models not found, skipping indexes');
    }
  }
  
  // Analytics and performance monitoring
  static async analyzeIndexUsage() {
    const collections = await mongoose.connection.db.collections();
    
    for (const collection of collections) {
      try {
        const stats = await collection.stats();
        const indexes = await collection.indexes();
        
        console.log(`📊 Collection: ${collection.collectionName}`);
        console.log(`   Documents: ${stats.count}`);
        console.log(`   Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   Indexes: ${indexes.length}`);
        
        // Check for unused indexes (requires MongoDB 4.4+)
        try {
          const indexStats = await collection.aggregate([
            { $indexStats: {} }
          ]).toArray();
          
          const unusedIndexes = indexStats.filter(stat => 
            stat.accesses.ops === 0
          );
          
          if (unusedIndexes.length > 0) {
            console.log(`   ⚠️ Unused indexes: ${unusedIndexes.length}`);
          }
        } catch (error) {
          // Index stats not supported in this MongoDB version
        }
        
        console.log('');
      } catch (error) {
        console.error(`Error analyzing ${collection.collectionName}:`, error.message);
      }
    }
  }
  
  // Drop unused indexes
  static async optimizeIndexes() {
    console.log('🔧 Optimizing database indexes...');
    
    const collections = await mongoose.connection.db.collections();
    
    for (const collection of collections) {
      try {
        const indexStats = await collection.aggregate([
          { $indexStats: {} }
        ]).toArray();
        
        const unusedIndexes = indexStats.filter(stat => 
          stat.accesses.ops === 0 && 
          stat.name !== '_id_' // Never drop the _id index
        );
        
        for (const unusedIndex of unusedIndexes) {
          console.log(`Dropping unused index: ${collection.collectionName}.${unusedIndex.name}`);
          await collection.dropIndex(unusedIndex.name);
        }
      } catch (error) {
        // Index optimization not supported in this MongoDB version
        console.log(`⚠️ Index optimization not supported for ${collection.collectionName}`);
      }
    }
    
    console.log('✅ Index optimization completed');
  }
}

export default DatabaseIndexManager;