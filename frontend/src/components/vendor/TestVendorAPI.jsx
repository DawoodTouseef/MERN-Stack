import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, TextField, CircularProgress } from '@mui/material';
import axios from 'axios';

const TestVendorAPI = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');

  // Get token from localStorage on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem('userInfo') ? 
      JSON.parse(localStorage.getItem('userInfo')).token : '';
    setToken(storedToken);
  }, []);

  const testAPIEndpoint = async (endpoint, name) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/vendors${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setResults(prev => ({
        ...prev,
        [name]: {
          status: 'success',
          data: response.data,
          statusText: response.statusText,
          status: response.status
        }
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [name]: {
          status: 'error',
          error: error.response ? error.response.data : error.message,
          statusText: error.response?.statusText || 'Unknown',
          status: error.response?.status || 'Unknown'
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  const testAllEndpoints = async () => {
    const endpoints = [
      { path: '/dashboard', name: 'Dashboard' },
      { path: '/analytics/sales', name: 'Sales Analytics' },
      { path: '/analytics/products', name: 'Product Analytics' },
      { path: '/analytics/customers', name: 'Customer Analytics' },
      { path: '/analytics/inventory', name: 'Inventory Analytics' }
    ];

    for (const endpoint of endpoints) {
      await testAPIEndpoint(endpoint.path, endpoint.name);
      // Add a small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Vendor API Test
      </Typography>
      
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Authentication Token
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={3}
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Enter your JWT token here"
          variant="outlined"
        />
        <Typography variant="body2" sx={{ mt: 1 }}>
          Note: Token is automatically loaded from localStorage
        </Typography>
      </Paper>
      
      <Button 
        variant="contained" 
        onClick={testAllEndpoints}
        disabled={loading}
        sx={{ mb: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Test All Endpoints'}
      </Button>
      
      {Object.entries(results).map(([name, result]) => (
        <Paper 
          key={name} 
          sx={{ 
            p: 2, 
            mb: 2, 
            bgcolor: result.status === 'success' ? 'success.light' : 'error.light'
          }}
        >
          <Typography variant="h6" gutterBottom>
            {name} Endpoint
          </Typography>
          <Typography>Status: {result.status}</Typography>
          <Typography>HTTP Status: {result.status}</Typography>
          <Typography>Status Text: {result.statusText}</Typography>
          
          {result.status === 'success' ? (
            <pre style={{ 
              backgroundColor: '#f5f5f5', 
              padding: '10px', 
              borderRadius: '4px',
              maxHeight: '200px',
              overflow: 'auto'
            }}>
              {JSON.stringify(result.data, null, 2)}
            </pre>
          ) : (
            <pre style={{ 
              backgroundColor: '#ffebee', 
              padding: '10px', 
              borderRadius: '4px',
              maxHeight: '200px',
              overflow: 'auto'
            }}>
              {JSON.stringify(result.error, null, 2)}
            </pre>
          )}
        </Paper>
      ))}
    </Box>
  );
};

export default TestVendorAPI;