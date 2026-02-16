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
import useCurrency from '../../hooks/useCurrency';
import moment from 'moment';

const StatCard = ({ title, value, icon, color, change, description }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      borderRadius: 4,
      bgcolor: '#fff',
      border: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
      height: '100%',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
      }
    }}
  >
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
      <Avatar
        sx={{
          bgcolor: `${color}15`,
          color: color,
          width: 48,
          height: 48,
          borderRadius: 3,
        }}
      >
        {icon}
      </Avatar>
      {change !== undefined && (
        <Chip
          label={`${change > 0 ? '+' : ''}${change}%`}
          size="small"
          sx={{
            bgcolor: change >= 0 ? '#ecfdf5' : '#fef2f2',
            color: change >= 0 ? '#10b981' : '#ef4444',
            fontWeight: 700,
            borderRadius: 1.5,
          }}
        />
      )}
    </Box>
    <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mb: 0.5 }}>
      {title}
    </Typography>
    <Typography variant="h4" fontWeight={900} color="#1e293b" sx={{ mb: 1 }}>
      {value}
    </Typography>
    <Typography variant="caption" color="text.secondary">
      {description}
    </Typography>
  </Paper>
);

const VendorAnalyticsDashboard = () => {
  const theme = useTheme();
  const { format, symbol } = useCurrency();
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
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value={format(sales.totalRevenue || 0)}
            icon={<AttachMoneyIcon />}
            color="#6366f1"
            change={performance.sales?.growth?.revenueGrowth}
            description="Lifetime store earnings"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Orders"
            value={(sales.totalOrders || 0).toLocaleString()}
            icon={<ShoppingCartIcon />}
            color="#10b981"
            change={performance.sales?.growth?.orderGrowth}
            description="Orders successfully placed"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Products"
            value={(products.totalProducts || validProductCount).toLocaleString()}
            icon={<InventoryIcon />}
            color="#f59e0b"
            description="Items currently in your catalog"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Customers"
            value={(customers.total || 0).toLocaleString()}
            icon={<PeopleIcon />}
            color="#ef4444"
            description={`Avg. value: ${format(customers.averageValue || 0)}`}
          />
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Sales Trend Chart */}
        <Grid item xs={12} lg={8}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 6, border: '1px solid #e2e8f0', bgcolor: '#fff' }}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" fontWeight={900} color="#1e293b">
                Sales Trend
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Track your revenue and order volume over time
              </Typography>
            </Box>
            {salesChartData && salesChartData.length > 0 ? (
              <ChartWrapper title="Sales Trend">
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={salesChartData}>
                    <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontWeight: 500, fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontWeight: 500, fontSize: 12 }}
                      tickFormatter={(val) => `${symbol}${val}`}
                    />
                    <TooltipChart
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                      formatter={(value, name) => [name === 'revenue' ? format(value) : value, name === 'revenue' ? 'Revenue' : 'Orders']}
                    />
                    <Legend verticalAlign="top" align="right" iconType="circle" />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#6366f1"
                      strokeWidth={4}
                      dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                      name="revenue"
                    />
                    <Line
                      type="monotone"
                      dataKey="orders"
                      stroke="#10b981"
                      strokeWidth={3}
                      strokeDasharray="5 5"
                      dot={false}
                      name="orders"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartWrapper>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography color="text.secondary">No sales data available for the selected period</Typography>
                {(isSalesLoading || isSalesFetching) && (
                  <CircularProgress sx={{ mt: 2 }} />
                )}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Customer Segments */}
        <Grid item xs={12} md={6} lg={4}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 6, border: '1px solid #e2e8f0', bgcolor: '#fff', height: '100%' }}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" fontWeight={900} color="#1e293b">
                Customer Segments
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Distribution of your customer base
              </Typography>
            </Box>
            {customerSegments && customerSegments.length > 0 ? (
              <ChartWrapper title="Customer Segments">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={customerSegments}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {customerSegments.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <TooltipChart
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                    />
                    <Legend iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </ChartWrapper>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography color="text.secondary">No customer data available</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Inventory and Recent Orders Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Inventory Status */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 6, border: '1px solid #e2e8f0', bgcolor: '#fff', height: '100%' }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h5" fontWeight={900} color="#1e293b">
                  Inventory Status
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Current stock levels across your products
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: '#f5f3ff', color: '#6366f1' }}>
                <InventoryIcon />
              </Avatar>
            </Box>

            {inventoryData && inventoryData.length > 0 ? (
              <ChartWrapper title="Inventory Status">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={inventoryData} margin={{ top: 20 }}>
                    <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontWeight: 500, fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontWeight: 500, fontSize: 12 }}
                    />
                    <TooltipChart
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                    />
                    <Bar
                      dataKey="value"
                      fill="#6366f1"
                      radius={[6, 6, 0, 0]}
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartWrapper>
            ) : (
              <Box sx={{ textAlign: 'center', py: 5 }}>
                <Typography color="text.secondary">No inventory data available</Typography>
              </Box>
            )}

            {/* Low Stock Alert */}
            {typeof inventory.lowStock === 'number' && inventory.lowStock > 0 && (
              <Alert
                severity="warning"
                icon={<WarningIcon />}
                sx={{ mt: 3, borderRadius: 3 }}
              >
                <Typography variant="body2" fontWeight={600}>
                  You have {inventory.lowStock} products with low stock. Consider restocking soon.
                </Typography>
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Recent Orders */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 6, border: '1px solid #e2e8f0', bgcolor: '#fff', height: '100%' }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h5" fontWeight={900} color="#1e293b">
                  Recent Orders
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Latest transactions from your customers
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: '#ecfdf5', color: '#10b981' }}>
                <ShoppingCartIcon />
              </Avatar>
            </Box>

            {recentOrders && recentOrders.length > 0 ? (
              <TableContainer component={Box}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: '#64748b', fontWeight: 700, borderBottom: '2px solid #f1f5f9' }}>Order ID</TableCell>
                      <TableCell sx={{ color: '#64748b', fontWeight: 700, borderBottom: '2px solid #f1f5f9' }}>Customer</TableCell>
                      <TableCell align="right" sx={{ color: '#64748b', fontWeight: 700, borderBottom: '2px solid #f1f5f9' }}>Amount</TableCell>
                      <TableCell sx={{ color: '#64748b', fontWeight: 700, borderBottom: '2px solid #f1f5f9' }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentOrders.slice(0, 5).map((order) => (
                      <TableRow key={order._id} sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                        <TableCell sx={{ py: 2 }}>
                          <Typography variant="body2" fontWeight={700} color="#1e293b">
                            #{order._id.substring(0, 8)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Typography variant="body2" color="#64748b">
                            {order.user?.username || 'Anonymous'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ py: 2 }}>
                          <Typography variant="body2" fontWeight={800} color="#1e293b">
                            {format(order.totalPrice || 0)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Chip
                            label={order.isPaid ? 'Paid' : 'Pending'}
                            size="small"
                            sx={{
                              bgcolor: order.isPaid ? '#ecfdf5' : '#fff7ed',
                              color: order.isPaid ? '#10b981' : '#f59e0b',
                              fontWeight: 700,
                              borderRadius: 1.5
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <InfoIcon sx={{ fontSize: 48, color: '#64748b', mb: 2, opacity: 0.5 }} />
                <Typography color="text.secondary">
                  No recent orders found
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Top Products */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 6, border: '1px solid #e2e8f0', bgcolor: '#fff' }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h5" fontWeight={900} color="#1e293b">
                  Top Selling Products
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Your best performing products by revenue
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: '#fff7ed', color: '#f59e0b' }}>
                <TrendingUpIcon />
              </Avatar>
            </Box>

            {products.topProducts && products.topProducts.length > 0 ? (
              <ChartWrapper title="Top Selling Products">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={products.topProducts.map(product => ({
                      name: product.productName && product.productName.length > 20 ?
                        `${product.productName.substring(0, 20)}...` :
                        product.productName || 'Unknown Product',
                      revenue: product.totalRevenue || 0,
                      quantity: product.totalQuantity || 0
                    }))}
                    layout="vertical"
                    margin={{ left: 40, right: 40 }}
                  >
                    <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" horizontal={false} />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={150}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#1e293b', fontWeight: 600, fontSize: 12 }}
                    />
                    <TooltipChart
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                      formatter={(value, name) => [name === 'revenue' ? format(value) : value, name === 'revenue' ? 'Revenue' : 'Quantity']}
                    />
                    <Legend iconType="circle" />
                    <Bar
                      dataKey="revenue"
                      fill="#6366f1"
                      name="revenue"
                      radius={[0, 4, 4, 0]}
                      barSize={20}
                    />
                    <Bar
                      dataKey="quantity"
                      fill="#10b981"
                      name="quantity"
                      radius={[0, 4, 4, 0]}
                      barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartWrapper>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography color="text.secondary">No product data available</Typography>
                {isDashboardLoading && (
                  <CircularProgress sx={{ mt: 2 }} />
                )}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default VendorAnalyticsDashboard;