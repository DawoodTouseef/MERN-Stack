import React from 'react';
import { useGetVendorDashboardQuery, useGetVendorSalesAnalyticsQuery } from '../../redux/api/vendorApiSlice';
import { Box, Typography, Button, Paper } from '@mui/material';

const DebugVendorDashboard = () => {
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

  // Log everything to console
  React.useEffect(() => {
    console.log('=== Vendor Dashboard Debug Info ===');
    console.log('Dashboard Loading:', isDashboardLoading);
    console.log('Sales Loading:', isSalesLoading);
    console.log('Dashboard Data:', dashboardData);
    console.log('Sales Data:', salesData);
    console.log('Dashboard Error:', dashboardError);
    console.log('Sales Error:', salesError);
  }, [isDashboardLoading, isSalesLoading, dashboardData, salesData, dashboardError, salesError]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Vendor Dashboard Debug
      </Typography>
      
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Loading States
        </Typography>
        <Typography>Dashboard Loading: {isDashboardLoading ? 'Yes' : 'No'}</Typography>
        <Typography>Sales Loading: {isSalesLoading ? 'Yes' : 'No'}</Typography>
      </Paper>
      
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Data Status
        </Typography>
        <Typography>Dashboard Data: {dashboardData ? 'Available' : 'Not Available'}</Typography>
        <Typography>Sales Data: {salesData ? 'Available' : 'Not Available'}</Typography>
      </Paper>
      
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Error Status
        </Typography>
        <Typography>Dashboard Error: {dashboardError ? 'Yes' : 'No'}</Typography>
        <Typography>Sales Error: {salesError ? 'Yes' : 'No'}</Typography>
      </Paper>
      
      {(dashboardError || salesError) && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'error.light' }}>
          <Typography variant="h6" gutterBottom>
            Error Details
          </Typography>
          {dashboardError && (
            <Typography>
              Dashboard Error: {JSON.stringify(dashboardError, null, 2)}
            </Typography>
          )}
          {salesError && (
            <Typography>
              Sales Error: {JSON.stringify(salesError, null, 2)}
            </Typography>
          )}
        </Paper>
      )}
      
      <Button 
        variant="contained" 
        onClick={() => {
          refetchDashboard();
          refetchSales();
        }}
        sx={{ mr: 2 }}
      >
        Refetch Data
      </Button>
      
      <Button 
        variant="outlined" 
        onClick={() => {
          console.log('=== Manual Refresh Debug Info ===');
          console.log('Dashboard Data:', dashboardData);
          console.log('Sales Data:', salesData);
          console.log('Dashboard Error:', dashboardError);
          console.log('Sales Error:', salesError);
        }}
      >
        Log Current State
      </Button>
    </Box>
  );
};

export default DebugVendorDashboard;