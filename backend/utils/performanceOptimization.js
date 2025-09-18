import mongoose from 'mongoose';
import Redis from 'redis';

// Database query optimization utilities
export class DatabaseOptimizer {
  
  // Create optimized aggregation pipelines
  static createOptimizedPipeline(baseQuery, options = {}) {
    const pipeline = [];
    
    // Add match stage first for better performance
    if (baseQuery) {
      pipeline.push({ $match: baseQuery });
    }
    
    // Add indexes hint if specified
    if (options.useIndex) {
      pipeline.push({ $hint: options.useIndex });
    }
    
    // Add efficient sorting
    if (options.sort) {
      pipeline.push({ $sort: options.sort });
    }
    
    // Add pagination with skip/limit
    if (options.skip) {
      pipeline.push({ $skip: options.skip });
    }
    
    if (options.limit) {
      pipeline.push({ $limit: options.limit });
    }
    
    return pipeline;
  }
  
  // Batch operations for better performance
  static async batchOperation(Model, operations, batchSize = 100) {
    const results = [];
    
    for (let i = 0; i < operations.length; i += batchSize) {
      const batch = operations.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(op => Model[op.method](...op.args))
      );
      results.push(...batchResults);
    }
    
    return results;
  }
  
  // Efficient counting with aggregation
  static async getOptimizedCount(Model, query = {}) {
    const result = await Model.aggregate([
      { $match: query },
      { $count: "total" }
    ]);
    
    return result[0]?.total || 0;
  }
  
  // Memory-efficient pagination
  static createCursorPagination(Model, query = {}, options = {}) {
    const { limit = 20, sortField = '_id', sortOrder = 1 } = options;
    
    return {
      async getPage(cursor = null) {
        const matchQuery = { ...query };
        
        if (cursor) {
          matchQuery[sortField] = sortOrder === 1 
            ? { $gt: cursor } 
            : { $lt: cursor };
        }
        
        const results = await Model.find(matchQuery)
          .sort({ [sortField]: sortOrder })
          .limit(limit + 1);
        
        const hasMore = results.length > limit;
        const items = hasMore ? results.slice(0, -1) : results;
        const nextCursor = hasMore ? items[items.length - 1][sortField] : null;
        
        return {
          items,
          hasMore,
          nextCursor
        };
      }
    };
  }
}

// Redis caching service
export class CacheService {
  constructor() {
    this.client = null;
    this.defaultTTL = 3600; // 1 hour
  }
  
  async connect() {
    if (!this.client) {
      this.client = Redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      });
      
      this.client.on('error', (err) => console.error('Redis Client Error', err));
      await this.client.connect();
    }
  }
  
  async get(key) {
    if (!this.client) await this.connect();
    
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }
  
  async set(key, value, ttl = this.defaultTTL) {
    if (!this.client) await this.connect();
    
    try {
      await this.client.setEx(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }
  
  async del(key) {
    if (!this.client) await this.connect();
    
    try {
      await this.client.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }
  
  async flush() {
    if (!this.client) await this.connect();
    
    try {
      await this.client.flushAll();
    } catch (error) {
      console.error('Cache flush error:', error);
    }
  }
  
  // Cache decorator for functions
  cache(ttl = this.defaultTTL) {
    return (target, propertyName, descriptor) => {
      const method = descriptor.value;
      
      descriptor.value = async function(...args) {
        const cacheKey = `${target.constructor.name}:${propertyName}:${JSON.stringify(args)}`;
        
        // Try to get from cache
        let result = await this.cacheService.get(cacheKey);
        
        if (!result) {
          // Execute original method
          result = await method.apply(this, args);
          
          // Cache the result
          await this.cacheService.set(cacheKey, result, ttl);
        }
        
        return result;
      };
    };
  }
}

// Performance monitoring utilities
export class PerformanceMonitor {
  static async measureExecutionTime(fn, label = 'Operation') {
    const start = process.hrtime.bigint();
    
    try {
      const result = await fn();
      const end = process.hrtime.bigint();
      const duration = Number(end - start) / 1000000; // Convert to ms
      
      console.log(`⚡ ${label}: ${duration.toFixed(2)}ms`);
      
      // Log slow operations
      if (duration > 1000) {
        console.warn(`🐌 Slow operation detected: ${label} took ${duration.toFixed(2)}ms`);
      }
      
      return { result, duration };
    } catch (error) {
      const end = process.hrtime.bigint();
      const duration = Number(end - start) / 1000000;
      
      console.error(`❌ ${label} failed after ${duration.toFixed(2)}ms:`, error.message);
      throw error;
    }
  }
  
  static createPerformanceMiddleware() {
    return (req, res, next) => {
      const start = process.hrtime.bigint();
      
      res.on('finish', () => {
        const end = process.hrtime.bigint();
        const duration = Number(end - start) / 1000000;
        
        // Log request performance
        console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration.toFixed(2)}ms`);
        
        // Log slow requests
        if (duration > 2000) {
          console.warn(`🐌 Slow request: ${req.method} ${req.path} took ${duration.toFixed(2)}ms`);
        }
      });
      
      next();
    };
  }
}

// Memory optimization utilities
export class MemoryOptimizer {
  static async streamLargeDataset(Model, query = {}, options = {}) {
    const { batchSize = 100, transform } = options;
    
    const cursor = Model.find(query).cursor({ batchSize });
    const results = [];
    
    for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
      const transformed = transform ? transform(doc) : doc;
      results.push(transformed);
      
      // Process in chunks to avoid memory issues
      if (results.length >= batchSize) {
        yield results.splice(0, batchSize);
      }
    }
    
    // Yield remaining results
    if (results.length > 0) {
      yield results;
    }
  }
  
  static optimizeMongooseQuery(query) {
    return query
      .lean() // Return plain objects instead of Mongoose documents
      .hint({ _id: 1 }) // Use index hint
      .maxTimeMS(30000) // Set query timeout
      .allowDiskUse(true); // Allow disk usage for large sorts
  }
}

// Connection pool optimization
export class ConnectionOptimizer {
  static optimizeMongooseConnection() {
    mongoose.set('strictQuery', false);
    
    // Optimize connection pool
    mongoose.connection.on('connected', () => {
      console.log('✅ MongoDB connection pool optimized');
    });
    
    // Monitor slow operations
    mongoose.set('debug', (collectionName, method, query, doc) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`📊 MongoDB: ${collectionName}.${method}`, query);
      }
    });
    
    return {
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferMaxEntries: 0,
      bufferCommands: false,
      useNewUrlParser: true,
      useUnifiedTopology: true
    };
  }
}

// Export singleton instances
export const cacheService = new CacheService();
export const performanceMonitor = new PerformanceMonitor();
export const memoryOptimizer = new MemoryOptimizer();
export const databaseOptimizer = new DatabaseOptimizer();
export const connectionOptimizer = new ConnectionOptimizer();