import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, CircularProgress } from '@mui/material';
import { useGetVendorDashboardQuery, useGetVendorSalesAnalyticsQuery, useCheckVendorProductsQuery } from '../../redux/api/vendorApiSlice';

const VendorDebugTest = () => {
  const [period, setPeriod] = useState('30d');
  
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
    startDate: new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date().toISOString(),
    groupBy: 'day'
  });
  
  const { 
    data: productsData, 
    isLoading: isProductsLoading, 
    error: productsError,
    refetch: refetchProducts
  } = useCheckVendorProductsQuery();

  const handleRefresh = () => {
    refetchDashboard();
    refetchSales();
    refetchProducts();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Vendor API Debug Test</Typography>
      
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Button variant="contained" onClick={handleRefresh}>
          Refresh All Data
        </Button>
        
        <select value={period} onChange={(e) => setPeriod(e.target.value)}>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
        </select>
      </Box>

      {/* Products Data */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Vendor Products</Typography>
        {isProductsLoading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={20} />
            <Typography>Loading...</Typography>
          </Box>
        ) : productsError ? (
          <Typography color="error">
            Error: {JSON.stringify(productsError)}
          </Typography>
        ) : (
          <pre>{JSON.stringify(productsData, null, 2)}</pre>
        )}
      </Paper>

      {/* Dashboard Data */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Dashboard Data</Typography>
        {isDashboardLoading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={20} />
            <Typography>Loading...</Typography>
          </Box>
        ) : dashboardError ? (
          <Typography color="error">
            Error: {JSON.stringify(dashboardError)}
          </Typography>
        ) : (
          <pre>{JSON.stringify(dashboardData, null, 2)}</pre>
        )}
      </Paper>

      {/* Sales Data */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>Sales Data</Typography>
        {isSalesLoading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={20} />
            <Typography>Loading...</Typography>
          </Box>
        ) : salesError ? (
          <Typography color="error">
            Error: {JSON.stringify(salesError)}
          </Typography>
        ) : (
          <pre>{JSON.stringify(salesData, null, 2)}</pre>
        )}
      </Paper>
    </Box>
  );
};

export default VendorDebugTest;