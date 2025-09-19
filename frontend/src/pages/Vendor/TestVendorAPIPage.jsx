import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, CircularProgress, TextField } from '@mui/material';
import { useGetVendorDashboardQuery, useGetVendorSalesAnalyticsQuery } from '../../redux/api/vendorApiSlice';

const TestVendorAPIPage = () => {
  const [testResults, setTestResults] = useState({});
  const [isTesting, setIsTesting] = useState(false);

  const { 
    data: dashboardData, 
    isLoading: isDashboardLoading, 
    error: dashboardError,
    refetch: refetchDashboard
  } = useGetVendorDashboardQuery();
    
  const { 
    data: salesData, 
    isLoading: isSalesLoading, 
    error: salesError,
    refetch: refetchSales
  } = useGetVendorSalesAnalyticsQuery({ 
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date().toISOString(),
    groupBy: 'day'
  });

  const testAPIEndpoints = async () => {
    setIsTesting(true);
    setTestResults({});
    
    // Test dashboard endpoint
    try {
      await refetchDashboard();
      setTestResults(prev => ({
        ...prev,
        dashboard: {
          status: 'success',
          message: 'Dashboard endpoint is accessible'
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        dashboard: {
          status: 'error',
          message: `Dashboard error: ${error.message}`,
          details: error
        }
      }));
    }
    
    // Add a small delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test sales endpoint
    try {
      await refetchSales();
      setTestResults(prev => ({
        ...prev,
        sales: {
          status: 'success',
          message: 'Sales endpoint is accessible'
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        sales: {
          status: 'error',
          message: `Sales error: ${error.message}`,
          details: error
        }
      }));
    }
    
    setIsTesting(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Vendor API Test Page
      </Typography>
      
      <Button 
        variant="contained" 
        onClick={testAPIEndpoints}
        disabled={isTesting}
        sx={{ mb: 3 }}
      >
        {isTesting ? <CircularProgress size={24} /> : 'Test Vendor API Endpoints'}
      </Button>
      
      {/* Test Results */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Test Results
        </Typography>
        
        {Object.entries(testResults).map(([key, result]) => (
          <Box key={key} sx={{ mb: 2, p: 1, bgcolor: result.status === 'success' ? 'success.light' : 'error.light' }}>
            <Typography variant="subtitle1">
              {key.charAt(0).toUpperCase() + key.slice(1)}: {result.message}
            </Typography>
          </Box>
        ))}
      </Paper>
      
      {/* Current State */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Current API State
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1">Dashboard:</Typography>
          <Typography>Loading: {isDashboardLoading ? 'Yes' : 'No'}</Typography>
          <Typography>Error: {dashboardError ? 'Yes' : 'No'}</Typography>
          <Typography>Data Available: {dashboardData ? 'Yes' : 'No'}</Typography>
        </Box>
        
        <Box>
          <Typography variant="subtitle1">Sales:</Typography>
          <Typography>Loading: {isSalesLoading ? 'Yes' : 'No'}</Typography>
          <Typography>Error: {salesError ? 'Yes' : 'No'}</Typography>
          <Typography>Data Available: {salesData ? 'Yes' : 'No'}</Typography>
        </Box>
      </Paper>
      
      {/* Raw Data Display */}
      {(dashboardData || salesData) && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Raw API Data
          </Typography>
          
          {dashboardData && (
            <details>
              <summary>Dashboard Data</summary>
              <pre style={{ 
                backgroundColor: '#f5f5f5', 
                padding: '10px', 
                borderRadius: '4px',
                maxHeight: '300px',
                overflow: 'auto',
                marginTop: '10px'
              }}>
                {JSON.stringify(dashboardData, null, 2)}
              </pre>
            </details>
          )}
          
          {salesData && (
            <details>
              <summary>Sales Data</summary>
              <pre style={{ 
                backgroundColor: '#f5f5f5', 
                padding: '10px', 
                borderRadius: '4px',
                maxHeight: '300px',
                overflow: 'auto',
                marginTop: '10px'
              }}>
                {JSON.stringify(salesData, null, 2)}
              </pre>
            </details>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default TestVendorAPIPage;