import React, { useState, useEffect } from 'react';
import { Box, Grid, Card, CardContent, Typography, CircularProgress, Alert, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useGetVendorDashboardQuery, useGetVendorSalesAnalyticsQuery } from '../../redux/api/vendorApiSlice';
import Loader from '../Loader';

const VendorAnalyticsDashboard = () => {
  const theme = useTheme();
  const [period, setPeriod] = useState('30d');
  
  const { data: dashboardData, isLoading: isDashboardLoading, error: dashboardError } = 
    useGetVendorDashboardQuery();
    
  const { data: salesData, isLoading: isSalesLoading, error: salesError } = 
    useGetVendorSalesAnalyticsQuery({ 
      startDate: new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date().toISOString(),
      groupBy: 'day'
    });

  // Format data for charts
  const formatSalesData = () => {
    if (!salesData?.data) return [];
    
    return salesData.data.map(item => ({
      date: item._id,
      revenue: item.totalSales,
      orders: item.totalOrders,
      quantity: item.totalQuantity
    }));
  };

  const formatCustomerSegments = () => {
    if (!dashboardData?.performance?.customers?.segments) return [];
    
    return Object.entries(dashboardData.performance.customers.segments).map(([name, value]) => ({
      name,
      value
    }));
  };

  const formatInventoryData = () => {
    if (!dashboardData?.performance?.inventory) return [];
    
    return [
      { name: 'In Stock', value: dashboardData.performance.inventory.inStock },
      { name: 'Low Stock', value: dashboardData.performance.inventory.lowStock },
      { name: 'Out of Stock', value: dashboardData.performance.inventory.outOfStock }
    ];
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (isDashboardLoading || isSalesLoading) {
    return <Loader />;
  }

  if (dashboardError || salesError) {
    return (
      <Alert severity="error">
        Error loading dashboard data: {dashboardError?.data?.message || salesError?.data?.message}
      </Alert>
    );
  }

  const salesChartData = formatSalesData();
  const customerSegments = formatCustomerSegments();
  const inventoryData = formatInventoryData();
  
  const performance = dashboardData?.performance || {};
  const sales = performance.sales?.total || {};
  const products = performance.products || {};
  const customers = performance.customers || {};
  const inventory = performance.inventory || {};

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" color="primary.main">
          Vendor Dashboard
        </Typography>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Period</InputLabel>
          <Select
            value={period}
            label="Period"
            onChange={(e) => setPeriod(e.target.value)}
          >
            <MenuItem value="7d">Last 7 Days</MenuItem>
            <MenuItem value="30d">Last 30 Days</MenuItem>
            <MenuItem value="90d">Last 90 Days</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Revenue
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                ${sales.totalRevenue?.toFixed(2) || '0.00'}
              </Typography>
              <Typography variant="body2">
                {performance.sales?.growth?.revenueGrowth >= 0 ? '+' : ''}
                {performance.sales?.growth?.revenueGrowth?.toFixed(2) || '0.00'}% from last period
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Orders
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {sales.totalOrders || 0}
              </Typography>
              <Typography variant="body2">
                {performance.sales?.growth?.orderGrowth >= 0 ? '+' : ''}
                {performance.sales?.growth?.orderGrowth?.toFixed(2) || '0.00'}% from last period
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Products
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {products.totalProducts || 0}
              </Typography>
              <Typography variant="body2">
                {products.activeProducts || 0} active products
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Customers
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {customers.total || 0}
              </Typography>
              <Typography variant="body2">
                Avg. value: ${(customers.averageValue || 0).toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Sales Trend Chart */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Sales Trend
              </Typography>
              {salesChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke={theme.palette.primary.main} 
                      name="Revenue" 
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="orders" 
                      stroke={theme.palette.secondary.main} 
                      name="Orders" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ textAlign: 'center', py: 5 }}>
                  <Typography>No sales data available</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Customer Segments */}
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Customer Segments
              </Typography>
              {customerSegments.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={customerSegments}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {customerSegments.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ textAlign: 'center', py: 5 }}>
                  <Typography>No customer data available</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Inventory Status */}
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Inventory Status
              </Typography>
              {inventoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={inventoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill={theme.palette.primary.main} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ textAlign: 'center', py: 5 }}>
                  <Typography>No inventory data available</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Top Products */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Selling Products
              </Typography>
              {products.topProducts?.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={products.topProducts.map(product => ({
                      name: product.productName.length > 15 ? 
                        `${product.productName.substring(0, 15)}...` : 
                        product.productName,
                      revenue: product.totalRevenue,
                      quantity: product.totalQuantity
                    }))}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={100} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="revenue" fill={theme.palette.primary.main} name="Revenue" />
                    <Bar dataKey="quantity" fill={theme.palette.secondary.main} name="Quantity" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ textAlign: 'center', py: 5 }}>
                  <Typography>No product data available</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default VendorAnalyticsDashboard;