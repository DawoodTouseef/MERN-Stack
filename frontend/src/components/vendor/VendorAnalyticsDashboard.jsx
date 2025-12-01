import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Button,
  CircularProgress,
  Chip,
  Avatar,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  IconButton
} from '@mui/material';

// Icons
import {
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  ShoppingCart as ShoppingCartIcon,
  Inventory as InventoryIcon,
  People as PeopleIcon,
  AttachMoney as AttachMoneyIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';

// Lazy load chart components to prevent SSR issues
const BarChart = lazy(() => import('recharts').then(module => ({ default: module.BarChart })));
const Bar = lazy(() => import('recharts').then(module => ({ default: module.Bar })));
const XAxis = lazy(() => import('recharts').then(module => ({ default: module.XAxis })));
const YAxis = lazy(() => import('recharts').then(module => ({ default: module.YAxis })));
const CartesianGrid = lazy(() => import('recharts').then(module => ({ default: module.CartesianGrid })));
const TooltipChart = lazy(() => import('recharts').then(module => ({ default: module.Tooltip })));
const Legend = lazy(() => import('recharts').then(module => ({ default: module.Legend })));
const ResponsiveContainer = lazy(() => import('recharts').then(module => ({ default: module.ResponsiveContainer })));
const LineChart = lazy(() => import('recharts').then(module => ({ default: module.LineChart })));
const Line = lazy(() => import('recharts').then(module => ({ default: module.Line })));
const PieChart = lazy(() => import('recharts').then(module => ({ default: module.PieChart })));
const Pie = lazy(() => import('recharts').then(module => ({ default: module.Pie })));
const Cell = lazy(() => import('recharts').then(module => ({ default: module.Cell })));

import { useGetVendorDashboardQuery, useGetVendorSalesAnalyticsQuery } from '../../redux/api/vendorApiSlice';

const VendorAnalyticsDashboard = () => {
  const theme = useTheme();
  const [period, setPeriod] = useState('30d');
  const [forceRefresh, setForceRefresh] = useState(false);
  
  const { 
    data: dashboardData, 
    isLoading: isDashboardLoading, 
    error: dashboardError,
    refetch: refetchDashboard,
    isFetching: isDashboardFetching
  } = useGetVendorDashboardQuery(undefined, { 
    refetchOnMountOrArgChange: true
  });
    
  const { 
    data: salesData, 
    isLoading: isSalesLoading, 
    error: salesError,
    refetch: refetchSales,
    isFetching: isSalesFetching
  } = useGetVendorSalesAnalyticsQuery({ 
    startDate: new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date().toISOString(),
    groupBy: 'day'
  }, {
    refetchOnMountOrArgChange: true
  });

  // Log API responses for debugging
  useEffect(() => {
    console.log('=== Vendor Dashboard Component Debug ===');
    console.log('Dashboard Loading:', isDashboardLoading);
    console.log('Dashboard Fetching:', isDashboardFetching);
    console.log('Sales Loading:', isSalesLoading);
    console.log('Sales Fetching:', isSalesFetching);
    console.log('Dashboard Data:', dashboardData);
    console.log('Sales Data:', salesData);
    console.log('Dashboard Error:', dashboardError);
    console.log('Sales Error:', salesError);
    
    // Log detailed error information
    if (dashboardError) {
      console.log('Dashboard Error Details:', {
        status: dashboardError?.status,
        data: dashboardError?.data,
        error: dashboardError?.error
      });
    }
    
    if (salesError) {
      console.log('Sales Error Details:', {
        status: salesError?.status,
        data: salesError?.data,
        error: salesError?.error
      });
    }
    
    // Log product count specifically
    if (dashboardData) {
      console.log('Product Count:', dashboardData.products);
      console.log('Product Count Type:', typeof dashboardData.products);
    }
  }, [isDashboardLoading, isDashboardFetching, isSalesLoading, isSalesFetching, dashboardData, salesData, dashboardError, salesError]);

  // Format data for charts
  const formatSalesData = () => {
    if (!salesData || !Array.isArray(salesData.data)) return [];
    
    return salesData.data.map(item => ({
      date: item._id || '',
      revenue: item.totalSales || 0,
      orders: item.totalOrders || 0,
      quantity: item.totalQuantity || 0
    }));
  };

  const formatCustomerSegments = () => {
    if (!dashboardData?.performance?.customers?.segments) return [];
    
    return Object.entries(dashboardData.performance.customers.segments).map(([name, value]) => ({
      name,
      value: value || 0
    }));
  };

  const formatInventoryData = () => {
    if (!dashboardData?.performance?.inventory) return [];
    
    const inventory = dashboardData.performance.inventory;
    return [
      { name: 'In Stock', value: typeof inventory.inStock === 'number' && !isNaN(inventory.inStock) ? inventory.inStock : 0 },
      { name: 'Low Stock', value: typeof inventory.lowStock === 'number' && !isNaN(inventory.lowStock) ? inventory.lowStock : 0 },
      { name: 'Out of Stock', value: typeof inventory.outOfStock === 'number' && !isNaN(inventory.outOfStock) ? inventory.outOfStock : 0 }
    ];
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Handle force refresh
  const handleRefresh = () => {
    setForceRefresh(true);
    refetchDashboard();
    refetchSales();
    // Reset force refresh after a short delay
    setTimeout(() => setForceRefresh(false), 1000);
  };

  // Show loading state with more detailed information
  if ((isDashboardLoading || isSalesLoading || forceRefresh) && !dashboardData && !dashboardError && !salesError) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', p: 3 }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
          Loading Vendor Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          {isDashboardLoading ? 'Loading dashboard data...' : ''}
          {isSalesLoading ? 'Loading sales analytics...' : ''}
        </Typography>
        <Button 
          variant="outlined" 
          onClick={handleRefresh}
          sx={{ mt: 2 }}
          disabled={forceRefresh}
          startIcon={<RefreshIcon />}
        >
          {forceRefresh ? 'Refreshing...' : 'Force Refresh'}
        </Button>
      </Box>
    );
  }

  // Handle errors with more detailed information
  if (dashboardError || salesError) {
    console.error('Vendor Dashboard Error:', { dashboardError, salesError });
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="error"
          action={
            <Button 
              color="inherit" 
              size="small"
              onClick={handleRefresh}
              startIcon={<RefreshIcon />}
            >
              Retry
            </Button>
          }
        >
          <Typography variant="h6" gutterBottom>
            Error loading dashboard data
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {dashboardError ? `Dashboard Error: ${dashboardError?.data?.message || dashboardError?.error || dashboardError?.status || 'Unknown error'}` : ''}
            {salesError ? `Sales Error: ${salesError?.data?.message || salesError?.error || salesError?.status || 'Unknown error'}` : ''}
          </Typography>
          <Typography variant="body2">
            Status: {dashboardError?.status || salesError?.status || 'Unknown'}
          </Typography>
          {(dashboardError?.data || salesError?.data) && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Details: {JSON.stringify(dashboardError?.data || salesError?.data)}
            </Typography>
          )}
          <Typography variant="body2" sx={{ mt: 1 }}>
            Please try again or contact support if the problem persists.
          </Typography>
        </Alert>
        
        {/* Show raw error details for debugging */}
        {(dashboardError || salesError) && (
          <details style={{ marginTop: '20px' }}>
            <summary>Debug Information</summary>
            <pre style={{ 
              backgroundColor: '#f5f5f5', 
              padding: '10px', 
              borderRadius: '4px',
              maxHeight: '200px',
              overflow: 'auto',
              marginTop: '10px'
            }}>
              {JSON.stringify({ dashboardError, salesError }, null, 2)}
            </pre>
          </details>
        )}
        
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button 
            variant="contained" 
            onClick={handleRefresh}
            startIcon={<RefreshIcon />}
          >
            Try Again
          </Button>
        </Box>
      </Box>
    );
  }

  // Check if we have dashboard data
  if (!dashboardData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="info"
          action={
            <Button 
              color="inherit" 
              size="small"
              onClick={handleRefresh}
              startIcon={<RefreshIcon />}
            >
              Retry
            </Button>
          }
        >
          <Typography variant="h6" gutterBottom>
            No dashboard data available
          </Typography>
          <Typography variant="body2">
            It seems you don't have any vendor data yet. Start by adding products to your store.
          </Typography>
        </Alert>
      </Box>
    );
  }

  // Check if vendor has products - with additional debugging
  const productCount = dashboardData?.products || 0;
  
  // Additional check to ensure productCount is a valid number
  const validProductCount = (typeof productCount === 'number' && !isNaN(productCount) && isFinite(productCount)) ? productCount : 0;
  
  if (validProductCount === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="info"
          action={
            <Button 
              color="inherit" 
              size="small"
              onClick={handleRefresh}
              startIcon={<RefreshIcon />}
            >
              Refresh
            </Button>
          }
        >
          <Typography variant="h6" gutterBottom>
            No Products Found
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            You haven't added any products to your store yet. Sales analytics will appear once you have products and orders.
          </Typography>
          <Button 
            variant="contained" 
            href="/vendor/productlist"
            sx={{ mt: 1 }}
          >
            Add Products
          </Button>
        </Alert>
      </Box>
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

  // Chart component with error boundary
  const ChartWrapper = ({ children, title }) => (
    <Suspense fallback={
      <Box sx={{ textAlign: 'center', py: 5 }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 1 }}>Loading {title}...</Typography>
      </Box>
    }>
      {children}
    </Suspense>
  );

  // Recent orders data
  const recentOrders = dashboardData.recentOrders || [];

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" color="primary.main">
          Vendor Dashboard
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button 
            variant="outlined" 
            size="small"
            onClick={handleRefresh}
            disabled={isDashboardFetching || isSalesFetching}
            startIcon={<RefreshIcon />}
          >
            {isDashboardFetching || isSalesFetching ? <CircularProgress size={20} /> : 'Refresh'}
          </Button>
          <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel>Period</InputLabel>
            <Select
              value={period}
              label="Period"
              onChange={(e) => {
                setPeriod(e.target.value);
                // Refetch sales data when period changes
                setTimeout(() => refetchSales(), 100);
              }}
            >
              <MenuItem value="7d">Last 7 Days</MenuItem>
              <MenuItem value="30d">Last 30 Days</MenuItem>
              <MenuItem value="90d">Last 90 Days</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AttachMoneyIcon sx={{ fontSize: 32, mr: 1 }} />
                <Typography variant="h6" gutterBottom>
                  Total Revenue
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                ${typeof sales.totalRevenue === 'number' ? sales.totalRevenue.toFixed(2) : '0.00'}
              </Typography>
              <Typography variant="body2">
                {typeof performance.sales?.growth?.revenueGrowth === 'number' && performance.sales?.growth?.revenueGrowth >= 0 ? '+' : ''}
                {typeof performance.sales?.growth?.revenueGrowth === 'number' ? performance.sales?.growth?.revenueGrowth.toFixed(2) : '0.00'}% from last period
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ShoppingCartIcon sx={{ fontSize: 32, mr: 1 }} />
                <Typography variant="h6" gutterBottom>
                  Total Orders
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {typeof sales.totalOrders === 'number' ? sales.totalOrders : 0}
              </Typography>
              <Typography variant="body2">
                {typeof performance.sales?.growth?.orderGrowth === 'number' && performance.sales?.growth?.orderGrowth >= 0 ? '+' : ''}
                {typeof performance.sales?.growth?.orderGrowth === 'number' ? performance.sales?.growth?.orderGrowth.toFixed(2) : '0.00'}% from last period
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <InventoryIcon sx={{ fontSize: 32, mr: 1 }} />
                <Typography variant="h6" gutterBottom>
                  Products
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {typeof products.totalProducts === 'number' ? products.totalProducts : validProductCount}
              </Typography>
              <Typography variant="body2">
                {typeof products.activeProducts === 'number' ? products.activeProducts : 0} active products
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PeopleIcon sx={{ fontSize: 32, mr: 1 }} />
                <Typography variant="h6" gutterBottom>
                  Customers
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {typeof customers.total === 'number' ? customers.total : 0}
              </Typography>
              <Typography variant="body2">
                Avg. value: ${typeof customers.averageValue === 'number' ? customers.averageValue.toFixed(2) : '0.00'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Sales Trend Chart */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardHeader
              title="Sales Trend"
              subheader="Track your revenue and order volume over time"
              avatar={<TrendingUpIcon />}
            />
            <CardContent>
              {salesChartData && salesChartData.length > 0 ? (
                <ChartWrapper title="Sales Trend">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={salesChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <TooltipChart />
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
                </ChartWrapper>
              ) : (
                <Box sx={{ textAlign: 'center', py: 5 }}>
                  <Typography>No sales data available for the selected period</Typography>
                  {(isSalesLoading || isSalesFetching) && (
                    <CircularProgress sx={{ mt: 2 }} />
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Customer Segments */}
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardHeader
              title="Customer Segments"
              subheader="Distribution of your customer base"
              avatar={<PeopleIcon />}
            />
            <CardContent>
              {customerSegments && customerSegments.length > 0 ? (
                <ChartWrapper title="Customer Segments">
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
                      <TooltipChart />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartWrapper>
              ) : (
                <Box sx={{ textAlign: 'center', py: 5 }}>
                  <Typography>No customer data available</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Inventory and Recent Orders Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Inventory Status */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Inventory Status"
              subheader="Current stock levels across your products"
              avatar={<InventoryIcon />}
            />
            <CardContent>
              {inventoryData && inventoryData.length > 0 ? (
                <ChartWrapper title="Inventory Status">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={inventoryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <TooltipChart />
                      <Bar dataKey="value" fill={theme.palette.primary.main} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartWrapper>
              ) : (
                <Box sx={{ textAlign: 'center', py: 5 }}>
                  <Typography>No inventory data available</Typography>
                </Box>
              )}
              
              {/* Low Stock Alert */}
              {typeof inventory.lowStock === 'number' && inventory.lowStock > 0 && (
                <Alert 
                  severity="warning" 
                  icon={<WarningIcon />}
                  sx={{ mt: 2 }}
                >
                  <Typography variant="body2">
                    You have {inventory.lowStock} products with low stock. Consider restocking soon.
                  </Typography>
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Recent Orders */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Recent Orders"
              subheader="Latest orders from your customers"
              avatar={<ShoppingCartIcon />}
            />
            <CardContent>
              {recentOrders && recentOrders.length > 0 ? (
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Order ID</TableCell>
                        <TableCell>Customer</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentOrders.slice(0, 5).map((order) => (
                        <TableRow key={order._id}>
                          <TableCell>
                            <Typography variant="body2" noWrap>
                              #{order._id.substring(0, 8)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {order.user?.username || 'Anonymous'}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="bold">
                              ${order.totalPrice?.toFixed(2) || '0.00'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={order.isPaid ? 'Paid' : 'Pending'} 
                              size="small" 
                              color={order.isPaid ? 'success' : 'warning'} 
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <InfoIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                  <Typography color="text.secondary">
                    No recent orders found
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Top Products */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Top Selling Products"
              subheader="Your best performing products by revenue"
              avatar={<TrendingUpIcon />}
            />
            <CardContent>
              {products.topProducts && products.topProducts.length > 0 ? (
                <ChartWrapper title="Top Selling Products">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={products.topProducts.map(product => ({
                        name: product.productName && product.productName.length > 15 ? 
                          `${product.productName.substring(0, 15)}...` : 
                          product.productName || 'Unknown Product',
                        revenue: product.totalRevenue || 0,
                        quantity: product.totalQuantity || 0
                      }))}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" width={100} />
                      <TooltipChart />
                      <Legend />
                      <Bar dataKey="revenue" fill={theme.palette.primary.main} name="Revenue" />
                      <Bar dataKey="quantity" fill={theme.palette.secondary.main} name="Quantity" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartWrapper>
              ) : (
                <Box sx={{ textAlign: 'center', py: 5 }}>
                  <Typography>No product data available</Typography>
                  {isDashboardLoading && (
                    <CircularProgress sx={{ mt: 2 }} />
                  )}
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