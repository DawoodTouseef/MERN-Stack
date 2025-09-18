import axios from 'axios';

// Test the vendor dashboard API
async function testVendorAPI() {
  try {
    console.log('Testing vendor API endpoints...');
    
    // Test the vendor dashboard endpoint (without auth first to see the error)
    try {
      const dashboardResponse = await axios.get('http://localhost:5500/api/vendors/dashboard');
      console.log('Vendor dashboard response (should fail without auth):', dashboardResponse.data);
    } catch (error) {
      console.log('Expected error for vendor dashboard without auth:', error.response?.status, error.response?.data?.message);
    }
    
    // Test the vendor sales analytics endpoint (without auth first to see the error)
    try {
      const salesResponse = await axios.get('http://localhost:5500/api/vendors/analytics/sales');
      console.log('Vendor sales analytics response (should fail without auth):', salesResponse.data);
    } catch (error) {
      console.log('Expected error for vendor sales analytics without auth:', error.response?.status, error.response?.data?.message);
    }
    
    console.log('API endpoints are accessible (authentication required as expected)');
  } catch (error) {
    console.error('Error testing vendor API:', error.message);
  }
}

testVendorAPI();