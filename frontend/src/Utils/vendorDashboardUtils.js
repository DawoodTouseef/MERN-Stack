// Utility functions for vendor dashboard debugging

/**
 * Check if vendor is properly authenticated
 * @returns {Object} Authentication status and user info
 */
export const checkVendorAuth = () => {
  try {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    return {
      isAuthenticated: !!userInfo,
      isVendor: userInfo?.role === 'vendor',
      userInfo: userInfo,
      token: userInfo?.token
    };
  } catch (error) {
    console.error('Error checking vendor auth:', error);
    return {
      isAuthenticated: false,
      isVendor: false,
      userInfo: null,
      token: null
    };
  }
};

/**
 * Test vendor API endpoints
 * @param {string} token - JWT token
 * @returns {Promise<Object>} Test results
 */
export const testVendorAPI = async (token) => {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5500';
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  const endpoints = [
    { name: 'Dashboard', url: '/api/vendors/dashboard' },
    { name: 'Sales Analytics', url: '/api/vendors/analytics/sales?startDate=2023-01-01&endDate=2023-12-31&groupBy=day' },
    { name: 'Product Analytics', url: '/api/vendors/analytics/products' },
    { name: 'Customer Analytics', url: '/api/vendors/analytics/customers' },
    { name: 'Inventory Analytics', url: '/api/vendors/analytics/inventory' }
  ];

  const results = {};

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${baseUrl}${endpoint.url}`, {
        headers: headers
      });
      
      results[endpoint.name] = {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      };

      if (response.ok) {
        const data = await response.json();
        results[endpoint.name].data = data;
      } else {
        results[endpoint.name].error = await response.text();
      }
    } catch (error) {
      results[endpoint.name] = {
        status: 'error',
        error: error.message
      };
    }
  }

  return results;
};

/**
 * Format vendor dashboard data for display
 * @param {Object} data - Raw dashboard data
 * @returns {Object} Formatted data
 */
export const formatVendorData = (data) => {
  if (!data) return null;

  return {
    performance: data.performance || {},
    products: data.products || 0,
    recentOrders: data.recentOrders || [],
    formatted: true
  };
};

/**
 * Validate vendor dashboard data structure
 * @param {Object} data - Dashboard data
 * @returns {Object} Validation results
 */
export const validateVendorData = (data) => {
  const results = {
    isValid: true,
    errors: []
  };

  if (!data) {
    results.isValid = false;
    results.errors.push('No data received');
    return results;
  }

  // Check required fields
  if (!data.performance) {
    results.isValid = false;
    results.errors.push('Missing performance data');
  }

  if (!data.products && data.products !== 0) {
    results.isValid = false;
    results.errors.push('Missing products count');
  }

  // Check performance sub-objects
  if (data.performance) {
    if (!data.performance.sales) {
      results.errors.push('Missing sales data');
    }
    
    if (!data.performance.products) {
      results.errors.push('Missing products performance data');
    }
    
    if (!data.performance.customers) {
      results.errors.push('Missing customers data');
    }
    
    if (!data.performance.inventory) {
      results.errors.push('Missing inventory data');
    }
  }

  if (results.errors.length > 0) {
    results.isValid = false;
  }

  return results;
};

/**
 * Get vendor dashboard troubleshooting info
 * @returns {Object} Troubleshooting information
 */
export const getTroubleshootingInfo = () => {
  const authInfo = checkVendorAuth();
  
  return {
    auth: authInfo,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language
  };
};

export default {
  checkVendorAuth,
  testVendorAPI,
  formatVendorData,
  validateVendorData,
  getTroubleshootingInfo
};