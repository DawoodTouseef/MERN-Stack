/**
 * Safe property access utilities to prevent null/undefined errors
 */

/**
 * Safely access nested object properties
 * @param {Object} obj - The object to access
 * @param {string} path - Dot-separated path (e.g., 'user.profile.name')
 * @param {*} defaultValue - Default value if path doesn't exist
 * @returns {*} The value at path or defaultValue
 */
export const safeGet = (obj, path, defaultValue = null) => {
  if (!obj || typeof obj !== 'object') return defaultValue;
  
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result === null || result === undefined || !(key in result)) {
      return defaultValue;
    }
    result = result[key];
  }
  
  return result;
};

/**
 * Safe array access with bounds checking
 * @param {Array} array - The array to access
 * @param {number} index - Index to access
 * @param {*} defaultValue - Default value if index is out of bounds
 * @returns {*} The value at index or defaultValue
 */
export const safeArrayGet = (array, index, defaultValue = null) => {
  if (!Array.isArray(array) || index < 0 || index >= array.length) {
    return defaultValue;
  }
  return array[index];
};

/**
 * Safe string operations
 */
export const safeString = {
  /**
   * Safely convert to string with fallback
   * @param {*} value - Value to convert
   * @param {string} defaultValue - Default if conversion fails
   * @returns {string}
   */
  toString: (value, defaultValue = '') => {
    if (value === null || value === undefined) return defaultValue;
    return String(value);
  },
  
  /**
   * Safely truncate string with ellipsis
   * @param {string} str - String to truncate
   * @param {number} maxLength - Maximum length
   * @param {string} suffix - Suffix to add (default: '...')
   * @returns {string}
   */
  truncate: (str, maxLength, suffix = '...') => {
    if (!str || typeof str !== 'string') return '';
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - suffix.length) + suffix;
  },
  
  /**
   * Safely lowercase string
   * @param {string} str - String to lowercase
   * @returns {string}
   */
  toLower: (str) => {
    if (!str || typeof str !== 'string') return '';
    return str.toLowerCase();
  }
};

/**
 * Safe number operations
 */
export const safeNumber = {
  /**
   * Safely parse number with fallback
   * @param {*} value - Value to parse
   * @param {number} defaultValue - Default if parsing fails
   * @returns {number}
   */
  parseFloat: (value, defaultValue = 0) => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  },
  
  /**
   * Safely parse integer with fallback
   * @param {*} value - Value to parse
   * @param {number} defaultValue - Default if parsing fails
   * @returns {number}
   */
  parseInt: (value, defaultValue = 0) => {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  },
  
  /**
   * Format currency with safe fallback
   * @param {number} value - Number to format
   * @param {string} currency - Currency code
   * @param {string} fallback - Fallback string
   * @returns {string}
   */
  formatCurrency: (value, currency = 'USD', fallback = '0') => {
    try {
      const formatter = new Intl.NumberFormat('en', {
        style: 'currency',
        currency: currency,
        currencyDisplay: 'symbol',
      });
      return formatter.format(safeNumber.parseFloat(value));
    } catch (err) {
      return `${currency} ${safeNumber.parseFloat(value).toFixed(2)}`;
    }
  }
};

/**
 * Safe array operations
 */
export const safeArray = {
  /**
   * Ensure value is array
   * @param {*} value - Value to check
   * @param {Array} defaultValue - Default array
   * @returns {Array}
   */
  ensure: (value, defaultValue = []) => {
    return Array.isArray(value) ? value : defaultValue;
  },
  
  /**
   * Safe array map with error handling
   * @param {Array} array - Array to map
   * @param {Function} fn - Mapping function
   * @param {Array} defaultValue - Default if error occurs
   * @returns {Array}
   */
  safeMap: (array, fn, defaultValue = []) => {
    try {
      if (!Array.isArray(array)) return defaultValue;
      return array.map(fn);
    } catch (error) {
      console.warn('Safe map error:', error);
      return defaultValue;
    }
  },
  
  /**
   * Safe array filter with error handling
   * @param {Array} array - Array to filter
   * @param {Function} fn - Filter function
   * @param {Array} defaultValue - Default if error occurs
   * @returns {Array}
   */
  safeFilter: (array, fn, defaultValue = []) => {
    try {
      if (!Array.isArray(array)) return defaultValue;
      return array.filter(fn);
    } catch (error) {
      console.warn('Safe filter error:', error);
      return defaultValue;
    }
  }
};

/**
 * Safe object operations
 */
export const safeObject = {
  /**
   * Ensure value is object
   * @param {*} value - Value to check
   * @param {Object} defaultValue - Default object
   * @returns {Object}
   */
  ensure: (value, defaultValue = {}) => {
    return value && typeof value === 'object' && !Array.isArray(value) ? value : defaultValue;
  },
  
  /**
   * Safe object key access
   * @param {Object} obj - Object to access
   * @param {string} key - Key to access
   * @param {*} defaultValue - Default value
   * @returns {*}
   */
  get: (obj, key, defaultValue = null) => {
    if (!obj || typeof obj !== 'object') return defaultValue;
    return obj.hasOwnProperty(key) ? obj[key] : defaultValue;
  }
};

/**
 * Higher-order component for safe rendering
 */
export const withSafeRender = (Component, fallback = null) => {
  return (props) => {
    try {
      return <Component {...props} />;
    } catch (error) {
      console.error('Safe render error:', error);
      return fallback;
    }
  };
};

/**
 * Safe async operation wrapper
 */
export const safeAsync = async (asyncFn, fallback = null) => {
  try {
    return await asyncFn();
  } catch (error) {
    console.error('Safe async error:', error);
    return fallback;
  }
};

export default {
  get: safeGet,
  arrayGet: safeArrayGet,
  string: safeString,
  number: safeNumber,
  array: safeArray,
  object: safeObject,
  withSafeRender,
  safeAsync
};