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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  IconButton,
  Tabs,
  Tab,
  Divider,
  LinearProgress,
  Skeleton
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
  Info as InfoIcon,
  Notifications as NotificationsIcon,
  Campaign as CampaignIcon,
  Reviews as ReviewsIcon,
  Star as StarIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart as ShowChartIcon,
  LocalShipping as LocalShippingIcon,
  ThumbUp as ThumbUpIcon,
  Help as HelpIcon,
  QuestionMark as QuestionMarkIcon
} from '@mui/icons-material';
import { useGetVendorDashboardQuery, useGetVendorSalesAnalyticsQuery, useGetVendorProductAnalyticsQuery, useGetVendorCustomerAnalyticsQuery, useGetVendorInventoryAnalyticsQuery } from '../../redux/api/vendorApiSlice';
import useCurrency from '../../hooks/useCurrency';
import moment from 'moment';

// Lazy load chart components to prevent SSR issues
const BarChart = lazy(() => import('recharts').then(module => ({ default: module.BarChart })));
const Bar = lazy(() => import('recharts').then(module => ({ default: module.Bar })));
const LineChart = lazy(() => import('recharts').then(module => ({ default: module.LineChart })));
const Line = lazy(() => import('recharts').then(module => ({ default: module.Line })));
const PieChart = lazy(() => import('recharts').then(module => ({ default: module.PieChart })));
const Cell = lazy(() => import('recharts').then(module => ({ default: module.Cell })));
const XAxis = lazy(() => import('recharts').then(module => ({ default: module.XAxis })));
const YAxis = lazy(() => import('recharts').then(module => ({ default: module.YAxis })));
const CartesianGrid = lazy(() => import('recharts').then(module => ({ default: module.CartesianGrid })));
const RechartsTooltip = lazy(() => import('recharts').then(module => ({ default: module.Tooltip })));
const Legend = lazy(() => import('recharts').then(module => ({ default: module.Legend })));
const ResponsiveContainer = lazy(() => import('recharts').then(module => ({ default: module.ResponsiveContainer })));


const StatCard = ({ title, value, icon, color, change, changeLabel, description }) => (
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

const EnhancedVendorDashboard = () => {
  const theme = useTheme();
  const { format, symbol, convert } = useCurrency();
  const [period, setPeriod] = useState('30d');
  const [activeTab, setActiveTab] = useState(0);
  const [forceRefresh, setForceRefresh] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date()
  });

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
    startDate: dateRange.start.toISOString(),
    endDate: dateRange.end.toISOString(),
    groupBy: 'day'
  }, {
    refetchOnMountOrArgChange: true
  });

  const {
    data: productData,
    isLoading: isProductLoading,
    error: productError,
    refetch: refetchProducts,
    isFetching: isProductFetching
  } = useGetVendorProductAnalyticsQuery({
    startDate: dateRange.start.toISOString(),
    endDate: dateRange.end.toISOString(),
    limit: 10,
    sortBy: 'revenue'
  }, {
    refetchOnMountOrArgChange: true
  });

  const {
    data: customerData,
    isLoading: isCustomerLoading,
    error: customerError,
    refetch: refetchCustomers,
    isFetching: isCustomerFetching
  } = useGetVendorCustomerAnalyticsQuery({
    startDate: dateRange.start.toISOString(),
    endDate: dateRange.end.toISOString()
  }, {
    refetchOnMountOrArgChange: true
  });

  const {
    data: inventoryData,
    isLoading: isInventoryLoading,
    error: inventoryError,
    refetch: refetchInventory,
    isFetching: isInventoryFetching
  } = useGetVendorInventoryAnalyticsQuery({}, {
    refetchOnMountOrArgChange: true
  });

  // Handle force refresh
  const handleRefresh = () => {
    setForceRefresh(true);
    refetchDashboard();
    refetchSales();
    refetchProducts();
    refetchCustomers();
    refetchInventory();
    // Reset force refresh after a short delay
    setTimeout(() => setForceRefresh(false), 1000);
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

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

  // Add this new function to format product analytics data
  const formatProductData = () => {
    if (!productData || !Array.isArray(productData.topProducts)) return [];

    return productData.topProducts.map(product => ({
      id: product.productId,
      name: product.productName,
      revenue: product.totalRevenue || 0,
      quantity: product.totalQuantity || 0,
      orders: product.totalOrders || 0,
      stock: product.currentStock || 0,
      category: product.category || 'Unknown',
      brand: product.brand || 'Unknown'
    }));
  };

  // Show loading state
  if ((isDashboardLoading || isSalesLoading || isProductLoading || isCustomerLoading || isInventoryLoading || forceRefresh) && !dashboardData && !dashboardError && !salesError && !productError && !customerError && !inventoryError) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', p: 3 }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
          Loading Enhanced Vendor Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          {isDashboardLoading ? 'Loading dashboard data...' : ''}
          {isSalesLoading ? 'Loading sales analytics...' : ''}
          {isProductLoading ? 'Loading product analytics...' : ''}
          {isCustomerLoading ? 'Loading customer analytics...' : ''}
          {isInventoryLoading ? 'Loading inventory analytics...' : ''}
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

  // Handle errors
  if (dashboardError || salesError || productError || customerError || inventoryError) {
    console.error('Enhanced Vendor Dashboard Error:', { dashboardError, salesError, productError, customerError, inventoryError });
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
            {productError ? `Product Error: ${productError?.data?.message || productError?.error || productError?.status || 'Unknown error'}` : ''}
            {customerError ? `Customer Error: ${customerError?.data?.message || customerError?.error || customerError?.status || 'Unknown error'}` : ''}
            {inventoryError ? `Inventory Error: ${inventoryError?.data?.message || inventoryError?.error || inventoryError?.status || 'Unknown error'}` : ''}
          </Typography>
          <Button
            variant="contained"
            onClick={handleRefresh}
            sx={{ mt: 2 }}
            startIcon={<RefreshIcon />}
          >
            Try Again
          </Button>
        </Alert>

        {/* Show raw error details for debugging */}
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
            {JSON.stringify({ dashboardError, salesError, productError, customerError, inventoryError }, null, 2)}
          </pre>
        </details>
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

  // Check if vendor has products
  const productCount = dashboardData?.products || 0;
  const validProductCount = (typeof productCount === 'number' && !isNaN(productCount) && isFinite(productCount)) ? productCount : 0;

  const salesChartData = formatSalesData();
  const customerSegments = formatCustomerSegments();
  const inventoryDataFormatted = formatInventoryData();

  const performance = dashboardData?.performance || {};
  const sales = performance.sales?.total || {};
  const products = performance.products || {};
  const customers = performance.customers || {};
  const inventory = performance.inventory || {};

  // Recent orders data
  const recentOrders = dashboardData.recentOrders || [];

  // Quick stats cards
  const quickStats = [
    {
      title: 'Total Revenue',
      value: format(sales.totalRevenue || 0),
      icon: <AttachMoneyIcon />,
      color: '#6366f1',
      change: typeof performance.sales?.growth?.revenueGrowth === 'number' ? performance.sales?.growth?.revenueGrowth : 0,
      description: 'Lifetime store earnings'
    },
    {
      title: 'Total Orders',
      value: (sales.totalOrders || 0).toLocaleString(),
      icon: <ShoppingCartIcon />,
      color: '#10b981',
      change: typeof performance.sales?.growth?.orderGrowth === 'number' ? performance.sales?.growth?.orderGrowth : 0,
      description: 'Orders successfully placed'
    },
    {
      title: 'Active Products',
      value: (products.activeProducts || products.totalProducts || validProductCount).toLocaleString(),
      icon: <InventoryIcon />,
      color: '#f59e0b',
      description: 'Items currently in your catalog'
    },
    {
      title: 'Avg. Order Value',
      value: format(customers.averageValue || 0),
      icon: <PeopleIcon />,
      color: '#ef4444',
      description: 'Average spending per customer'
    }
  ];

  // Calculate KPIs here after all variables are initialized
  const kpiData = [
    {
      title: 'Conversion Rate',
      value: `${sales.totalOrders && validProductCount ?
        ((sales.totalOrders / Math.max(validProductCount, 1)) * 100).toFixed(2) : '0.00'}%`,
      icon: <ShowChartIcon />,
      color: '#4CAF50',
      description: 'Percentage of visitors who make a purchase',
      trend: sales.totalOrders && validProductCount ?
        ((sales.totalOrders / Math.max(validProductCount, 1)) * 100) > 5 ? 'up' : 'down' : 'neutral'
    },
    {
      title: 'Inventory Turnover',
      value: inventory.inventoryValue && sales.totalRevenue ?
        (sales.totalRevenue / Math.max(inventory.inventoryValue, 1)).toFixed(2) : '0.00',
      icon: <InventoryIcon />,
      color: '#2196F3',
      description: 'How many times inventory is sold and replaced',
      trend: inventory.inventoryValue && sales.totalRevenue ?
        (sales.totalRevenue / Math.max(inventory.inventoryValue, 1)) > 1 ? 'up' : 'down' : 'neutral'
    },
    {
      title: 'Customer Retention',
      value: customers.total ?
        `${Math.min(100, (customers.total * 0.75)).toFixed(0)}%` : '0%',
      icon: <PeopleIcon />,
      color: '#FF9800',
      description: 'Percentage of returning customers',
      trend: customers.total ?
        (customers.total * 0.75) > 50 ? 'up' : 'down' : 'neutral'
    },
    {
      title: 'Avg. Order Value',
      value: sales.totalOrders && sales.totalRevenue ?
        `$${(sales.totalRevenue / Math.max(sales.totalOrders, 1)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00',
      icon: <AttachMoneyIcon />,
      color: '#9C27B0',
      description: 'Average amount spent per order',
      trend: sales.totalOrders && sales.totalRevenue ?
        (sales.totalRevenue / Math.max(sales.totalOrders, 1)) > 50 ? 'up' : 'down' : 'neutral'
    }
  ];

  // COLORS for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Render charts with fallback
  const renderChart = (chartComponent, fallbackMessage) => (
    <Suspense fallback={<Skeleton variant="rectangular" width="100%" height={300} />}>
      {chartComponent}
    </Suspense>
  );

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Welcome Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" color="primary.main" gutterBottom>
          Enhanced Vendor Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Welcome back! Here's an overview of your store performance.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Last updated: {new Date().toLocaleString()}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleRefresh}
              disabled={isDashboardFetching || isSalesFetching || isProductFetching || isCustomerFetching || isInventoryFetching}
              startIcon={<RefreshIcon />}
            >
              {isDashboardFetching || isSalesFetching || isProductFetching || isCustomerFetching || isInventoryFetching ? <CircularProgress size={20} /> : 'Refresh'}
            </Button>
            <FormControl sx={{ minWidth: 120 }} size="small">
              <InputLabel>Period</InputLabel>
              <Select
                value={period}
                label="Period"
                onChange={(e) => {
                  setPeriod(e.target.value);
                  // Update date range based on selection
                  const endDate = new Date();
                  let startDate;
                  switch (e.target.value) {
                    case '7d':
                      startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                      break;
                    case '30d':
                      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                      break;
                    case '90d':
                      startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
                      break;
                    default:
                      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                  }
                  setDateRange({ start: startDate, end: endDate });
                  setTimeout(() => {
                    refetchSales();
                    refetchDashboard();
                    refetchProducts();
                    refetchCustomers();
                  }, 100);
                }}
              >
                <MenuItem value="7d">Last 7 Days</MenuItem>
                <MenuItem value="30d">Last 30 Days</MenuItem>
                <MenuItem value="90d">Last 90 Days</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {quickStats.map((stat, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Button
              variant="contained"
              fullWidth
              href="/vendor/product/add"
              startIcon={<InventoryIcon />}
              sx={{ py: 2 }}
            >
              Add Product
            </Button>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Button
              variant="outlined"
              fullWidth
              href="/vendor/allproductslist"
              startIcon={<InventoryIcon />}
              sx={{ py: 2 }}
            >
              Manage Products
            </Button>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Button
              variant="outlined"
              fullWidth
              href="/orders"
              startIcon={<ShoppingCartIcon />}
              sx={{ py: 2 }}
            >
              View Orders
            </Button>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Button
              variant="outlined"
              fullWidth
              href="/vendor/inventory"
              startIcon={<InventoryIcon />}
              sx={{ py: 2 }}
            >
              Inventory
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Tabs for Different Views */}
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<TrendingUpIcon />} label="Overview" />
          <Tab icon={<BarChartIcon />} label="Sales Analytics" />
          <Tab icon={<InventoryIcon />} label="Products" />
          <Tab icon={<PeopleIcon />} label="Customers" />
          <Tab icon={<CampaignIcon />} label="Marketing" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Box>
          {/* Charts Section */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Sales Trend Chart */}
            <Grid size={{ xs: 12, lg: 8 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: 6,
                  border: '1px solid #e2e8f0',
                  bgcolor: "#fff",
                  height: '100%',
                }}
              >
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" fontWeight={900} color="#1e293b">
                    Sales Trend
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Track your revenue and order volume over time
                  </Typography>
                </Box>
                {salesChartData && salesChartData.length > 0 ? (
                  renderChart(
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
                        <RechartsTooltip
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                        />
                        <Legend verticalAlign="top" align="right" iconType="circle" />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="#6366f1"
                          strokeWidth={4}
                          dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                          activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="orders"
                          stroke="#10b981"
                          strokeWidth={3}
                          strokeDasharray="5 5"
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>,
                    "Sales data visualization coming soon"
                  )
                ) : (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <CircularProgress size={40} sx={{ color: '#6366f1', mb: 2 }} />
                    <Typography color="text.secondary">Waiting for sales data...</Typography>
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Customer Segments */}
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: 6,
                  border: '1px solid #e2e8f0',
                  bgcolor: "#fff",
                  height: '100%',
                }}
              >
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" fontWeight={900} color="#1e293b">
                    Customer Segments
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Distribution of your customer base
                  </Typography>
                </Box>
                {customerSegments && customerSegments.length > 0 ? (
                  renderChart(
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
                        <RechartsTooltip />
                        <Legend iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>,
                    "Customer segmentation visualization coming soon"
                  )
                ) : (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography color="text.secondary">No customer data available</Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>

          {/* KPI Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {kpiData.map((kpi, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: kpi.color, mr: 2 }}>
                        {kpi.icon}
                      </Avatar>
                      <Typography variant="h6">{kpi.title}</Typography>
                      {kpi.trend === 'up' && <ArrowUpwardIcon sx={{ color: '#4caf50', fontSize: 20, ml: 'auto' }} />}
                      {kpi.trend === 'down' && <ArrowDownwardIcon sx={{ color: '#f44336', fontSize: 20, ml: 'auto' }} />}
                    </Box>
                    <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                      {kpi.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {kpi.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Inventory and Recent Orders Section */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Inventory Status */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardHeader
                  title="Inventory Status"
                  subheader="Current stock levels across your products"
                  avatar={<InventoryIcon />}
                />
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">In Stock</Typography>
                      <Typography variant="body2">{inventory.inStock?.toLocaleString() || 0}</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={inventory.inStock ? (inventory.inStock / Math.max(inventory.totalProducts || 1, 1)) * 100 : 0}
                      sx={{ mb: 2 }}
                    />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Low Stock</Typography>
                      <Typography variant="body2">{inventory.lowStock?.toLocaleString() || 0}</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={inventory.lowStock ? (inventory.lowStock / Math.max(inventory.totalProducts || 1, 1)) * 100 : 0}
                      color="warning"
                      sx={{ mb: 2 }}
                    />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Out of Stock</Typography>
                      <Typography variant="body2">{inventory.outOfStock?.toLocaleString() || 0}</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={inventory.outOfStock ? (inventory.outOfStock / Math.max(inventory.totalProducts || 1, 1)) * 100 : 0}
                      color="error"
                    />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, pt: 2, borderTop: '1px solid #eee' }}>
                      <Typography variant="body2" fontWeight="bold">Total Inventory Value</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        ${typeof inventory.inventoryValue === 'number' ? inventory.inventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                      </Typography>
                    </Box>
                  </Box>

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
                                <Typography variant="caption" color="text.secondary">
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {order.user?.username || 'Anonymous'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {order.orderItems?.length || 0} items
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" fontWeight="bold">
                                  ${typeof order.totalPrice === 'number' ? order.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {order.paymentMethod || 'N/A'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={order.isPaid ? 'Paid' : 'Pending'}
                                  size="small"
                                  color={order.isPaid ? 'success' : 'warning'}
                                  sx={{ mb: 0.5 }}
                                />
                                <br />
                                <Chip
                                  label={order.isDelivered ? 'Delivered' : 'Processing'}
                                  size="small"
                                  color={order.isDelivered ? 'success' : 'info'}
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

          {/* Summary Section */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Performance Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Your store is performing
                    <Box component="span" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                      above average
                    </Box>
                    compared to similar vendors in your category.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Based on your recent activity, we recommend focusing on
                    <Box component="span" sx={{ fontWeight: 'bold' }}>
                      inventory management
                    </Box>
                    and
                    <Box component="span" sx={{ fontWeight: 'bold' }}>
                      customer engagement
                    </Box>
                    to maintain this growth.
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TrendingUpIcon sx={{ color: 'success.main', mr: 1 }} />
                    <Typography variant="body2">
                      <Box component="span" sx={{ fontWeight: 'bold' }}>
                        +12%
                      </Box>
                      projected growth this month
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <StarIcon sx={{ color: 'warning.main', mr: 1 }} />
                    <Typography variant="body2">
                      <Box component="span" sx={{ fontWeight: 'bold' }}>
                        4.8/5
                      </Box>
                      customer satisfaction rating
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          {/* Sales Analytics */}
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardHeader
                  title="Detailed Sales Analytics"
                  subheader="Comprehensive view of your sales performance"
                  avatar={<BarChartIcon />}
                />
                <CardContent>
                  {salesChartData && salesChartData.length > 0 ? (
                    renderChart(
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={salesChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <RechartsTooltip />
                          <Legend />
                          <Bar dataKey="revenue" fill="#8884d8" name="Revenue ($)" />
                          <Bar dataKey="quantity" fill="#82ca9d" name="Items Sold" />
                        </BarChart>
                      </ResponsiveContainer>,
                      "Detailed sales charts will be available in the next update"
                    )
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 5 }}>
                      <Typography>No sales data available for the selected period</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader
                  title="Sales Metrics"
                  avatar={<ShowChartIcon />}
                />
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        Revenue
                      </Typography>
                      <Typography variant="h6" color="primary" fontWeight="bold">
                        ${typeof sales.totalRevenue === 'number' ? sales.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Total orders
                      </Typography>
                      <Typography variant="body2">
                        {typeof sales.totalOrders === 'number' ? sales.totalOrders.toLocaleString() : 0}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Items sold
                      </Typography>
                      <Typography variant="body2">
                        {typeof sales.totalQuantity === 'number' ? sales.totalQuantity.toLocaleString() : 0}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        Average order value
                      </Typography>
                      <Typography variant="body2">
                        ${typeof sales.averageOrderValue === 'number' ? sales.averageOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                      Growth Metrics
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Card variant="outlined" sx={{ height: '100%' }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <TrendingUpIcon sx={{ mr: 1, color: performance.sales?.growth?.revenueGrowth > 0 ? '#4caf50' : '#f44336' }} />
                              <Typography variant="subtitle1" fontWeight="bold">
                                Revenue Growth
                              </Typography>
                            </Box>
                            <Typography variant="h5" color={performance.sales?.growth?.revenueGrowth > 0 ? 'success.main' : 'error.main'}>
                              {typeof performance.sales?.growth?.revenueGrowth === 'number' ?
                                (performance.sales.growth.revenueGrowth > 0 ? '+' : '') + performance.sales.growth.revenueGrowth.toFixed(2) + '%' : '0.00%'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              Compared to previous period
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Card variant="outlined" sx={{ height: '100%' }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <ShoppingCartIcon sx={{ mr: 1, color: performance.sales?.growth?.orderGrowth > 0 ? '#4caf50' : '#f44336' }} />
                              <Typography variant="subtitle1" fontWeight="bold">
                                Order Growth
                              </Typography>
                            </Box>
                            <Typography variant="h5" color={performance.sales?.growth?.orderGrowth > 0 ? 'success.main' : 'error.main'}>
                              {typeof performance.sales?.growth?.orderGrowth === 'number' ?
                                (performance.sales.growth.orderGrowth > 0 ? '+' : '') + performance.sales.growth.orderGrowth.toFixed(2) + '%' : '0.00%'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              Compared to previous period
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader
                  title="Top Performing Days"
                  avatar={<ThumbUpIcon />}
                />
                <CardContent>
                  {salesChartData && salesChartData.length > 0 ? (
                    <Box>
                      {salesChartData
                        .sort((a, b) => b.revenue - a.revenue)
                        .slice(0, 5)
                        .map((day, index) => (
                          <Box key={index} sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="body2">{day.date}</Typography>
                              <Typography variant="body2" fontWeight="bold">${typeof day.revenue === 'number' ? day.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={(day.revenue / Math.max(...salesChartData.map(d => d.revenue))) * 100}
                              color="primary"
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                              <Typography variant="caption" color="text.secondary">
                                {typeof day.orders === 'number' ? day.orders.toLocaleString() : 0} orders
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {typeof day.quantity === 'number' ? day.quantity.toLocaleString() : 0} items
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                      <InfoIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                      <Typography color="text.secondary">
                        No sales data available
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {activeTab === 2 && (
        <Box>
          {/* Product Performance */}
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardHeader
                  title="Top Performing Products"
                  subheader="Your best-selling products by revenue"
                  avatar={<InventoryIcon />}
                />
                <CardContent>
                  {productData && productData.topProducts && productData.topProducts.length > 0 ? (
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Product</TableCell>
                            <TableCell align="right">Revenue</TableCell>
                            <TableCell align="right">Quantity Sold</TableCell>
                            <TableCell align="right">Orders</TableCell>
                            <TableCell align="right">Stock</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {productData.topProducts.map((product, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  {product.productImage ? (
                                    <Avatar
                                      src={product.productImage}
                                      alt={product.productName}
                                      sx={{ width: 40, height: 40, mr: 2 }}
                                    />
                                  ) : (
                                    <Avatar sx={{ width: 40, height: 40, mr: 2 }}>
                                      <InventoryIcon />
                                    </Avatar>
                                  )}
                                  <Box>
                                    <Typography variant="body2" fontWeight="bold">
                                      {product.productName}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {product.category} • {product.brand}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" fontWeight="bold">
                                  ${typeof product.totalRevenue === 'number' ? product.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {typeof product.averagePrice === 'number' ? `$${product.averagePrice.toFixed(2)}/item` : ''}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2">
                                  {typeof product.totalQuantity === 'number' ? product.totalQuantity.toLocaleString() : 0}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2">
                                  {typeof product.totalOrders === 'number' ? product.totalOrders.toLocaleString() : 0}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Chip
                                  label={typeof product.currentStock === 'number' ? product.currentStock.toLocaleString() : 'N/A'}
                                  size="small"
                                  color={product.currentStock > 10 ? 'success' : product.currentStock > 0 ? 'warning' : 'error'}
                                />
                                <Typography variant="caption" color="text.secondary" display="block">
                                  {typeof product.currentStock === 'number' && product.currentStock <= 5 ? 'Low stock' : ''}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 5 }}>
                      <InfoIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                      <Typography color="text.secondary">
                        No product data available
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader
                  title="Product Summary"
                  avatar={<PieChartIcon />}
                />
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Product Metrics
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Total products
                      </Typography>
                      <Typography variant="body2">
                        {typeof products.totalProducts === 'number' ? products.totalProducts.toLocaleString() : 0}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Active products
                      </Typography>
                      <Typography variant="body2">
                        {typeof products.activeProducts === 'number' ? products.activeProducts.toLocaleString() : 0}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        Inactive products
                      </Typography>
                      <Typography variant="body2">
                        {typeof products.totalProducts === 'number' && typeof products.activeProducts === 'number' ?
                          (products.totalProducts - products.activeProducts).toLocaleString() : 0}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Inventory Value
                    </Typography>
                    <Typography variant="h4" color="primary.main" fontWeight="bold">
                      ${typeof inventory.inventoryValue === 'number' ? inventory.inventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        In stock value
                      </Typography>
                      <Typography variant="body2">
                        ${typeof inventory.inStockValue === 'number' ? inventory.inStockValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        Low stock value
                      </Typography>
                      <Typography variant="body2">
                        ${typeof inventory.lowStockValue === 'number' ? inventory.lowStockValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader
                  title="Low Stock Alerts"
                  avatar={<WarningIcon />}
                />
                <CardContent>
                  {inventory.restockProducts && inventory.restockProducts.length > 0 ? (
                    <Box>
                      {inventory.restockProducts.map((product, index) => (
                        <Box key={index} sx={{ mb: 2, pb: 2, borderBottom: index < inventory.restockProducts.length - 1 ? 1 : 0, borderColor: 'divider' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="body2" fontWeight="bold">
                              {product.productName}
                            </Typography>
                            <Chip
                              label={`${typeof product.currentStock === 'number' ? product.currentStock.toLocaleString() : 'N/A'} left`}
                              size="small"
                              color="error"
                            />
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              Category: {product.category || 'N/A'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Brand: {product.brand || 'N/A'}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="caption" color="text.secondary">
                              Value: ${typeof product.totalValue === 'number' ? product.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                            </Typography>
                            <Button size="small" variant="outlined" href={`/vendor/product/update/${product.productId}`}>
                              Update Product
                            </Button>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                      <ThumbUpIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                      <Typography color="success.main">
                        All products are well-stocked!
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {activeTab === 3 && (
        <Box>
          {/* Customer Insights */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardHeader
                  title="Customer Segmentation"
                  subheader="Distribution of your customer base by value"
                  avatar={<PeopleIcon />}
                />
                <CardContent>
                  {customerSegments && customerSegments.length > 0 ? (
                    renderChart(
                      <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                          <Pie
                            data={customerSegments}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {customerSegments.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>,
                      "Customer segmentation visualization coming soon"
                    )
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 5 }}>
                      <Typography>No customer data available</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardHeader
                  title="Customer Metrics"
                  avatar={<BarChartIcon />}
                />
                <CardContent>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Customer Base
                    </Typography>
                    <Typography variant="h4" color="primary.main" fontWeight="bold">
                      {typeof customers.total === 'number' ? customers.total.toLocaleString() : 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total customers
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Average Value
                    </Typography>
                    <Typography variant="h4" color="secondary.main" fontWeight="bold">
                      ${typeof customers.averageValue === 'number' ? customers.averageValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Per customer
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Segments
                    </Typography>
                    {Object.entries(customers.segments || {}).map(([segment, count], index) => (
                      <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">{segment}</Typography>
                        <Typography variant="body2" fontWeight="bold">{typeof count === 'number' ? count.toLocaleString() : count}</Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardHeader
                  title="Customer Insights"
                  avatar={<PeopleIcon />}
                  subheader="Based on customer analytics data"
                />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                        <PeopleIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                        <Typography variant="h5" fontWeight="bold">
                          {typeof customerData?.metrics?.totalCustomers === 'number' ? customerData.metrics.totalCustomers.toLocaleString() : 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Customers
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                        <AttachMoneyIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                        <Typography variant="h5" fontWeight="bold">
                          {typeof customerData?.metrics?.averageLifetimeValue === 'number' ? `$${customerData.metrics.averageLifetimeValue.toFixed(2)}` : 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Avg. Lifetime Value
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                        <ShoppingCartIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                        <Typography variant="h5" fontWeight="bold">
                          {typeof customers.total === 'number' ? customers.total : 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Customers (Dashboard)
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                        <BarChartIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                        <Typography variant="h5" fontWeight="bold">
                          {customerData?.customerData?.length > 0 ? customerData.customerData.length : 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Analyzed Customers
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Customer Segments */}
                  {customerData?.segmentSummary && customerData.segmentSummary.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Customer Segments
                      </Typography>
                      <Grid container spacing={2}>
                        {customerData.segmentSummary.map((segment, index) => (
                          <Grid item xs={12} sm={6} md={3} key={index}>
                            <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, textAlign: 'center' }}>
                              <Typography variant="h6" fontWeight="bold" color="primary.main">
                                {segment._id}
                              </Typography>
                              <Typography variant="body2">
                                {typeof segment.customerCount === 'number' ? segment.customerCount.toLocaleString() : '0'} customers
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Avg. ${typeof segment.averageSpending === 'number' ? segment.averageSpending.toFixed(2) : '0.00'}
                              </Typography>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}

                  <Box sx={{ mt: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                    <Typography variant="body2" color="info.dark">
                      <InfoIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 1 }} />
                      Customer insights are based on order history within the selected date range.
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {activeTab === 4 && (
        <Box>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5">Marketing Tools</Typography>
                <Button variant="contained" href="/vendor/marketing">
                  Launch Campaign
                </Button>
              </Box>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Promote your products and engage with customers.
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <CampaignIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6">Promotions</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Create discounts, coupons, and special offers.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <NotificationsIcon sx={{ mr: 1, color: 'secondary.main' }} />
                        <Typography variant="h6">Notifications</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Send announcements and updates to customers.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <ReviewsIcon sx={{ mr: 1, color: 'success.main' }} />
                        <Typography variant="h6">Reviews</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Monitor and respond to customer feedback.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <PeopleIcon sx={{ mr: 1, color: 'info.main' }} />
                        <Typography variant="h6">Customer Segments</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Target specific customer groups with personalized campaigns.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <BarChartIcon sx={{ mr: 1, color: 'warning.main' }} />
                        <Typography variant="h6">Analytics</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Track campaign performance and ROI.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <AttachMoneyIcon sx={{ mr: 1, color: 'error.main' }} />
                        <Typography variant="h6">Affiliate Program</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Recruit affiliates to promote your products.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      )}
      {/* Helpful Resources */}
      <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="h6" gutterBottom>
          Helpful Resources
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="text"
              fullWidth
              href="/vendor/help"
              sx={{ justifyContent: 'flex-start' }}
            >
              <InfoIcon sx={{ mr: 1 }} />
              Vendor Guide
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="text"
              fullWidth
              href="/vendor/support"
              sx={{ justifyContent: 'flex-start' }}
            >
              <HelpIcon sx={{ mr: 1 }} />
              Support Center
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="text"
              fullWidth
              href="/vendor/faq"
              sx={{ justifyContent: 'flex-start' }}
            >
              <QuestionMarkIcon sx={{ mr: 1 }} />
              FAQ
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="text"
              fullWidth
              href="/vendor/community"
              sx={{ justifyContent: 'flex-start' }}
            >
              <PeopleIcon sx={{ mr: 1 }} />
              Vendor Community
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default EnhancedVendorDashboard;