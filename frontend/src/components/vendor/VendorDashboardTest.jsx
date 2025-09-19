import React from 'react';
import { Box, Typography, Button, Paper, CircularProgress } from '@mui/material';
import { useGetVendorDashboardQuery, useGetVendorSalesAnalyticsQuery } from '../../redux/api/vendorApiSlice';

const VendorDashboardTest = () => {
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

  const handleRefresh = () => {
    refetchDashboard();
    refetchSales();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Vendor Dashboard Test
      </Typography>
      
      <Button 
        variant="contained" 
        onClick={handleRefresh}
        sx={{ mb: 3 }}
      >
        Refresh Data
      </Button>
      
      {/* Dashboard Data */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Dashboard Status
        </Typography>
        <Typography>Loading: {isDashboardLoading ? 'Yes' : 'No'}</Typography>
        <Typography>Error: {dashboardError ? 'Yes' : 'No'}</Typography>
        <Typography>Data Available: {dashboardData ? 'Yes' : 'No'}</Typography>
        
        {dashboardData && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1">Dashboard Data:</Typography>
            <pre style={{ 
              backgroundColor: '#f5f5f5', 
              padding: '10px', 
              borderRadius: '4px',
              maxHeight: '200px',
              overflow: 'auto'
            }}>
              {JSON.stringify(dashboardData, null, 2)}
            </pre>
          </Box>
        )}
        
        {dashboardError && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1">Dashboard Error:</Typography>
            <pre style={{ 
              backgroundColor: '#ffebee', 
              padding: '10px', 
              borderRadius: '4px',
              maxHeight: '200px',
              overflow: 'auto'
            }}>
              {JSON.stringify(dashboardError, null, 2)}
            </pre>
          </Box>
        )}
      </Paper>
      
      {/* Sales Data */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Sales Status
        </Typography>
        <Typography>Loading: {isSalesLoading ? 'Yes' : 'No'}</Typography>
        <Typography>Error: {salesError ? 'Yes' : 'No'}</Typography>
        <Typography>Data Available: {salesData ? 'Yes' : 'No'}</Typography>
        
        {salesData && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1">Sales Data:</Typography>
            <pre style={{ 
              backgroundColor: '#f5f5f5', 
              padding: '10px', 
              borderRadius: '4px',
              maxHeight: '200px',
              overflow: 'auto'
            }}>
              {JSON.stringify(salesData, null, 2)}
            </pre>
          </Box>
        )}
        
        {salesError && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1">Sales Error:</Typography>
            <pre style={{ 
              backgroundColor: '#ffebee', 
              padding: '10px', 
              borderRadius: '4px',
              maxHeight: '200px',
              overflow: 'auto'
            }}>
              {JSON.stringify(salesError, null, 2)}
            </pre>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default VendorDashboardTest;