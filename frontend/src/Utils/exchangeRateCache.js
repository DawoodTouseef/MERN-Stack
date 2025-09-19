// Exchange rate caching utility with enhanced features
class ExchangeRateCache {
  constructor() {
    this.cache = new Map();
    this.defaultTTL = 60 * 60 * 1000; // 1 hour default TTL
  }

  // Set a cached value with TTL
  set(key, value, ttl = this.defaultTTL) {
    const expiry = Date.now() + ttl;
    this.cache.set(key, { value, expiry });
  }

  // Get a cached value if it's still valid
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  // Check if a key exists and is valid
  has(key) {
    return this.get(key) !== null;
  }

  // Clear expired entries
  clearExpired() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }

  // Clear all cache
  clear() {
    this.cache.clear();
  }

  // Get cache size
  size() {
    return this.cache.size;
  }

  // Get all keys
  keys() {
    return Array.from(this.cache.keys());
  }

  // Remove specific key
  remove(key) {
    return this.cache.delete(key);
  }

  // Set multiple values
  setMultiple(items, ttl = this.defaultTTL) {
    Object.entries(items).forEach(([key, value]) => {
      this.set(key, value, ttl);
    });
  }

  // Get multiple values
  getMultiple(keys) {
    const result = {};
    keys.forEach(key => {
      const value = this.get(key);
      if (value !== null) {
        result[key] = value;
      }
    });
    return result;
  }
}

// Create a singleton instance
const exchangeRateCache = new ExchangeRateCache();

export default exchangeRateCache;