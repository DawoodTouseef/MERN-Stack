import axios from 'axios';

// Test the user search and filter API
async function testUserAPI() {
  try {
    // First, let's login to get a token
    const loginResponse = await axios.post('http://localhost:5502/api/users/auth', {
      email: 'admin@nexusmart.com',
      password: 'NexusAdmin2024!'
    });
    
    const token = loginResponse.data.token;
    console.log('Login successful, token received');
    
    // Now test the user search and filter endpoint
    const response = await axios.get('http://localhost:5502/api/users?search=admin&role=admin&status=active', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('User search response:', response.data);
  } catch (error) {
    console.error('Error testing API:', error.response ? error.response.data : error.message);
  }
}

testUserAPI();