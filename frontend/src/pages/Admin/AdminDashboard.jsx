import Chart from "react-apexcharts";
import { useGetUsersQuery } from "../../redux/api/usersApiSlice";
import {
  useGetTotalOrdersQuery,
  useGetTotalSalesByDateQuery,
  useGetTotalSalesQuery,
  useGetOrdersQuery
} from "../../redux/api/orderApiSlice";
import { useState, useEffect } from "react";
import Loader from "../../components/Loader";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  useTheme,
  Divider,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Fade,
  IconButton,
  Tooltip,
  LinearProgress,
  Button
} from "@mui/material";
import {
  PeopleAlt as UsersIcon,
  Inventory as ProductIcon,
  ShoppingCart as OrderIcon,
  MonetizationOn as SalesIcon,
  TrendingUp as TrendingIcon,
  MoreVert as MoreIcon,
  Refresh as RefreshIcon
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import DocumentTitle from "../../components/DocumentTitle";
import { useAllProductsQuery } from "../../redux/api/productApiSlice";
import { useGetCurrenciesQuery } from "../../redux/api/currencyApiSlice";
import { format } from "date-fns";
import useCurrency from "../../hooks/useCurrency";

const StatCard = ({ icon, label, value, subValue, color, delay }) => {
  const theme = useTheme();
  return (
    <Fade in timeout={400 + delay}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 4,
          bgcolor: '#fff',
          border: '1px solid #e2e8f0',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 24px -10px rgba(0,0,0,0.1)',
            borderColor: color
          }
        }}
      >
        <Box sx={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 100,
          height: 100,
          bgcolor: color,
          opacity: 0.05,
          borderRadius: '50%'
        }} />

        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            sx={{
              bgcolor: `${color}15`,
              color: color,
              width: 52,
              height: 52,
              boxShadow: 'none',
              borderRadius: 3
            }}
          >
            {icon}
          </Avatar>
          <Box>
            <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {label}
            </Typography>
            <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5, letterSpacing: '-1px' }}>
              {value}
            </Typography>
            {subValue && (
              <Typography variant="caption" color="success.main" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <TrendingIcon sx={{ fontSize: 14 }} /> {subValue}
              </Typography>
            )}
          </Box>
        </Stack>
      </Paper>
    </Fade>
  );
};

const AdminDashboard = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { convert, symbol, format: formatCurrency } = useCurrency();
  const theme = useTheme();
  const navigate = useNavigate();

  // Queries
  const { data: sales, isLoading: loadingSales } = useGetTotalSalesQuery();
  const { data: customersData, isLoading: loadingCustomers } = useGetUsersQuery();
  const { data: orders, isLoading: loadingOrders } = useGetTotalOrdersQuery();
  const { data: orderList } = useGetOrdersQuery();
  const { data: products, isLoading: loadingProducts } = useAllProductsQuery();
  const { data: salesDetail } = useGetTotalSalesByDateQuery();

  const [chartType, setChartType] = useState("area");

  useEffect(() => {
    if (userInfo?.role !== "admin") navigate("/");
  }, [userInfo, navigate]);

  // Data extraction
  const customers = customersData?.users || [];
  const customersCount = customers.filter((u) => u.role === "customer").length;
  const sellerCount = customers.filter((u) => u.role === "seller").length;
  const vendorsCount = customers.filter((u) => u.role === "vendor").length;

  const convertValue = (val) => {
    return convert(val || 0, 'USD').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const chartOptions = {
    chart: {
      type: chartType,
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: 'Inter, sans-serif'
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [20, 100, 100, 100]
      }
    },
    colors: [theme.palette.primary.main],
    xaxis: {
      categories: salesDetail?.map(item => item._id) || [],
      labels: { style: { colors: 'text.secondary', fontWeight: 500 } },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: {
        style: { colors: 'text.secondary', fontWeight: 500 },
        formatter: (val) => `${symbol}${val.toLocaleString()}`
      }
    },
    grid: {
      borderColor: '#f1f5f9',
      strokeDashArray: 4
    },
    tooltip: {
      theme: 'light',
      y: { formatter: (val) => `${symbol}${val.toLocaleString()}` }
    },
    dataLabels: { enabled: false }
  };

  const chartSeries = [{
    name: 'Total Revenue',
    data: salesDetail?.map(item => item.totalSales) || []
  }];

  if (loadingSales || loadingCustomers || loadingOrders || loadingProducts) {
    return (
      <Box sx={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', bgcolor: '#f8fafc' }}>
        <Loader />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontWeight: 600 }}>Syncing dashboard data...</Typography>
      </Box>
    );
  }

  return (
    <DocumentTitle title="Insights | Admin Dashboard">
      <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", py: { xs: 4, md: 6 }, px: { xs: 2, md: 4 } }}>
        <Box sx={{ maxWidth: "1400px", mx: "auto" }}>

          {/* Header */}
          <Box sx={{ mb: 6 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="h3" fontWeight={900} color="text.primary" sx={{ letterSpacing: '-1.5px', mb: 1 }}>
                  Business Overview
                </Typography>
                <Typography variant="body1" color="text.secondary" fontWeight={500}>
                  Welcome back, {userInfo?.username}. Here's what's happening today.
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }} sx={{ textAlign: { md: 'right' } }}>
                <Stack direction="row" spacing={2} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                  <Tooltip title="Refresh Data">
                    <IconButton sx={{ bgcolor: '#fff', border: '1px solid #e2e8f0', borderRadius: 2 }}>
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                  <Button
                    variant="contained"
                    startIcon={<OrderIcon />}
                    onClick={() => navigate('/admin/orderlist')}
                    sx={{ borderRadius: 2.5, px: 3, py: 1.2, fontWeight: 700, textTransform: 'none', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)' }}
                  >
                    View Orders
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Box>

          {/* Stats Grid */}
          <Grid container spacing={3} sx={{ mb: 6 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                icon={<SalesIcon />}
                label="Total Revenue"
                value={`${symbol}${convertValue(sales?.totalSales)}`}
                subValue="+12.5% from last month"
                color="#6366f1"
                delay={0}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                icon={<OrderIcon />}
                label="Total Orders"
                value={orders?.totalOrders || 0}
                subValue="+5.2% daily increase"
                color="#10b981"
                delay={100}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                icon={<UsersIcon />}
                label="Customers"
                value={customersCount}
                subValue="New 48 registrations"
                color="#f59e0b"
                delay={200}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                icon={<ProductIcon />}
                label="Active Products"
                value={products?.length || 0}
                subValue="12 items low in stock"
                color="#ef4444"
                delay={300}
              />
            </Grid>
          </Grid>

          {/* Middle Section: Chart & Detailed Metrics */}
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, lg: 8 }}>
              <Paper elevation={0} sx={{ p: 4, borderRadius: 5, border: '1px solid #e2e8f0', bgcolor: '#fff', height: '100%' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                  <Box>
                    <Typography variant="h6" fontWeight={800}>Revenue Forecast</Typography>
                    <Typography variant="body2" color="text.secondary">Daily transactions trend across all regions</Typography>
                  </Box>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                      value={chartType}
                      onChange={(e) => setChartType(e.target.value)}
                      sx={{ borderRadius: 2, fontWeight: 600, bgcolor: '#f8fafc' }}
                    >
                      <MenuItem value="area">Area Chart</MenuItem>
                      <MenuItem value="bar">Bar Chart</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
                <Box sx={{ height: 350 }}>
                  <Chart options={chartOptions} series={chartSeries} type={chartType} height="100%" />
                </Box>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, lg: 4 }}>
              <Paper elevation={0} sx={{ p: 4, borderRadius: 5, border: '1px solid #e2e8f0', bgcolor: '#fff', height: '100%' }}>
                <Typography variant="h6" fontWeight={800} sx={{ mb: 4 }}>Partner Distribution</Typography>

                <Stack spacing={4}>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                      <Typography variant="body2" fontWeight={700}>Sellers</Typography>
                      <Typography variant="body2" color="text.secondary">{sellerCount} Partners</Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={45} sx={{ height: 8, borderRadius: 5, bgcolor: '#f1f5f9', '& .MuiLinearProgress-bar': { bgcolor: '#6366f1' } }} />
                  </Box>

                  <Box>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                      <Typography variant="body2" fontWeight={700}>Vendors</Typography>
                      <Typography variant="body2" color="text.secondary">{vendorsCount} Partners</Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={35} sx={{ height: 8, borderRadius: 5, bgcolor: '#f1f5f9', '& .MuiLinearProgress-bar': { bgcolor: '#10b981' } }} />
                  </Box>

                  <Box>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                      <Typography variant="body2" fontWeight={700}>Platform Support</Typography>
                      <Typography variant="body2" color="text.secondary">89% Efficiency</Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={89} sx={{ height: 8, borderRadius: 5, bgcolor: '#f1f5f9', '& .MuiLinearProgress-bar': { bgcolor: '#f59e0b' } }} />
                  </Box>
                </Stack>

                <Divider sx={{ my: 4, borderStyle: 'dashed' }} />

                <Box>
                  <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 2 }}>AOV Analysis</Typography>
                  <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: '#f8fafc', borderStyle: 'dashed' }}>
                    <Typography variant="h4" fontWeight={900} color="primary.main">
                      {symbol}{convertValue(orders?.averageOrderValue)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      AVERAGE SPEND PER CUSTOMER
                    </Typography>
                  </Paper>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </DocumentTitle>
  );
};

export default AdminDashboard;
