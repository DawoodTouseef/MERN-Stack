// Simple test script to verify vendor API endpoints
// Run with: node testVendorAPI.js

import axios from 'axios';

// Configuration
const BASE_URL = process.env.VITE_API_URL || 'http://localhost:5500';
const TEST_VENDOR_TOKEN = process.env.TEST_VENDOR_TOKEN || 'your_vendor_jwt_token_here';

console.log('Testing Vendor API Endpoints...');
console.log('Base URL:', BASE_URL);

// Test endpoints
const testEndpoints = async () => {
  const config = {
    headers: {
      'Authorization': `Bearer ${TEST_VENDOR_TOKEN}`,
      'Content-Type': 'application/json'
    }
  };

  try {
    // Test vendor dashboard endpoint
    console.log('\n1. Testing /api/vendors/dashboard...');
    const dashboardResponse = await axios.get(`${BASE_URL}/api/vendors/dashboard`, config);
    console.log('   Status:', dashboardResponse.status);
    console.log('   Data keys:', Object.keys(dashboardResponse.data));
    
    // Test vendor sales analytics endpoint
    console.log('\n2. Testing /api/vendors/analytics/sales...');
    const salesResponse = await axios.get(`${BASE_URL}/api/vendors/analytics/sales`, config);
    console.log('   Status:', salesResponse.status);
    console.log('   Data keys:', Object.keys(salesResponse.data));
    
    // Test vendor product analytics endpoint
    console.log('\n3. Testing /api/vendors/analytics/products...');
    const productsResponse = await axios.get(`${BASE_URL}/api/vendors/analytics/products`, config);
    console.log('   Status:', productsResponse.status);
    console.log('   Data keys:', Object.keys(productsResponse.data));
    
    // Test vendor customer analytics endpoint
    console.log('\n4. Testing /api/vendors/analytics/customers...');
    const customersResponse = await axios.get(`${BASE_URL}/api/vendors/analytics/customers`, config);
    console.log('   Status:', customersResponse.status);
    console.log('   Data keys:', Object.keys(customersResponse.data));
    
    // Test vendor inventory analytics endpoint
    console.log('\n5. Testing /api/vendors/analytics/inventory...');
    const inventoryResponse = await axios.get(`${BASE_URL}/api/vendors/analytics/inventory`, config);
    console.log('   Status:', inventoryResponse.status);
    console.log('   Data keys:', Object.keys(inventoryResponse.data));
    
    console.log('\n✅ All vendor API endpoints are working correctly!');
    
  } catch (error) {
    console.error('\n❌ Error testing vendor API endpoints:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
      console.error('   Headers:', error.response.headers);
    } else if (error.request) {
      console.error('   No response received:', error.request);
    } else {
      console.error('   Error:', error.message);
    }
  }
};

// Run the tests
testEndpoints();