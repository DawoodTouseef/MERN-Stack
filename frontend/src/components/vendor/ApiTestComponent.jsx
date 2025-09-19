import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, CircularProgress } from '@mui/material';

const ApiTestComponent = () => {
  const [testResults, setTestResults] = useState({
    health: null,
    vendorHealth: null,
    dashboard: null,
    sales: null,
    products: null
  });
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const newResults = {};

    try {
      // Test general health endpoint
      const healthRes = await fetch('/api/health');
      newResults.health = {
        status: healthRes.status,
        ok: healthRes.ok,
        data: await healthRes.json()
      };
    } catch (error) {
      newResults.health = { error: error.message };
    }

    try {
      // Test vendor health endpoint
      const vendorHealthRes = await fetch('/api/vendors/health');
      newResults.vendorHealth = {
        status: vendorHealthRes.status,
        ok: vendorHealthRes.ok,
        data: await vendorHealthRes.json()
      };
    } catch (error) {
      newResults.vendorHealth = { error: error.message };
    }

    try {
      // Test vendor dashboard endpoint
      const dashboardRes = await fetch('/api/vendors/dashboard');
      newResults.dashboard = {
        status: dashboardRes.status,
        ok: dashboardRes.ok,
        data: await dashboardRes.json()
      };
    } catch (error) {
      newResults.dashboard = { error: error.message };
    }

    try {
      // Test vendor sales endpoint
      const salesRes = await fetch('/api/vendors/analytics/sales?startDate=2024-01-01&endDate=2024-12-31&groupBy=month');
      newResults.sales = {
        status: salesRes.status,
        ok: salesRes.ok,
        data: await salesRes.json()
      };
    } catch (error) {
      newResults.sales = { error: error.message };
    }

    try {
      // Test vendor products endpoint
      const productsRes = await fetch('/api/vendors/debug/products');
      newResults.products = {
        status: productsRes.status,
        ok: productsRes.ok,
        data: await productsRes.json()
      };
    } catch (error) {
      newResults.products = { error: error.message };
    }

    setTestResults(newResults);
    setLoading(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>API Endpoint Tests</Typography>
      
      <Box sx={{ mb: 3 }}>
        <Button 
          variant="contained" 
          onClick={runTests}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Run Tests'}
        </Button>
      </Box>

      {Object.entries(testResults).map(([key, result]) => (
        <Paper key={key} sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
          </Typography>
          
          {result === null ? (
            <Typography>Loading...</Typography>
          ) : result.error ? (
            <Typography color="error">
              Error: {result.error}
            </Typography>
          ) : (
            <Box>
              <Typography>Status: {result.status} {result.ok ? '✅' : '❌'}</Typography>
              <pre>{JSON.stringify(result.data, null, 2)}</pre>
            </Box>
          )}
        </Paper>
      ))}
    </Box>
  );
};

export default ApiTestComponent;