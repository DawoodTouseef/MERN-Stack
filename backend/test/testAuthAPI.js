// Test script for Auth API endpoints
const axios = require('axios');

// Base URL for the API
const BASE_URL = 'http://localhost:5501/api/auth';

// Test data
const testUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'Test123!',
};

const testLogin = {
  email: 'test@example.com',
  password: 'Test123!',
};

// Test the registration endpoint
const testRegistration = async () => {
  try {
    console.log('Testing user registration...');
    const response = await axios.post(`${BASE_URL}/`, testUser);
    console.log('Registration response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error.response?.data || error.message);
  }
};

// Test the login endpoint
const testLoginEndpoint = async () => {
  try {
    console.log('Testing user login...');
    const response = await axios.post(`${BASE_URL}/login`, testLogin);
    console.log('Login response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
  }
};

// Test the logout endpoint
const testLogoutEndpoint = async (token) => {
  try {
    console.log('Testing user logout...');
    const response = await axios.post(
      `${BASE_URL}/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log('Logout response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Logout error:', error.response?.data || error.message);
  }
};

// Test getting user auth logs
const testGetUserAuthLogs = async (token) => {
  try {
    console.log('Testing get user auth logs...');
    const response = await axios.get(`${BASE_URL}/logs`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('User auth logs response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Get user auth logs error:', error.response?.data || error.message);
  }
};

// Test getting all auth logs (admin only)
const testGetAllAuthLogs = async (token) => {
  try {
    console.log('Testing get all auth logs...');
    const response = await axios.get(`${BASE_URL}/logs/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('All auth logs response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Get all auth logs error:', error.response?.data || error.message);
  }
};

// Run all tests
const runAllTests = async () => {
  console.log('Starting Auth API tests...\n');
  
  // Test registration
  const registrationData = await testRegistration();
  
  // Test login
  const loginData = await testLoginEndpoint();
  
  if (loginData && loginData.token) {
    // Test logout
    await testLogoutEndpoint(loginData.token);
    
    // Test get user auth logs
    await testGetUserAuthLogs(loginData.token);
    
    // Test get all auth logs (would need admin token for this)
    // await testGetAllAuthLogs(adminToken);
  }
  
  console.log('\nAuth API tests completed.');
};

// Run the tests
runAllTests();