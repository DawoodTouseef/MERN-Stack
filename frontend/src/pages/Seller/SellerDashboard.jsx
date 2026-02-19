import Chart from "react-apexcharts";
import { useGetUsersQuery } from "../../redux/api/usersApiSlice";
import {
  useGetTotalOrdersQuery,
  useGetTotalSalesByDateQuery,
  useGetTotalSalesQuery,
  useGetOrdersQuery
} from "../../redux/api/orderApiSlice";
import { useState, useEffect } from "react";
import OrderList from "./OrderList";
import Loader from "../../components/Loader";
import {
  Box,
  Grid,
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
} from "@mui/material";
import { FaUsers } from "react-icons/fa";
import { AiOutlineShoppingCart, AiOutlineDollarCircle } from "react-icons/ai";
import { MdOutlineBarChart, MdInventory2 as InventoryIcon } from "react-icons/md";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useAllProductsQuery } from "../../redux/api/productApiSlice";
import DocumentTitle from "../../components/DocumentTitle";
import { useGetCurrenciesQuery } from "../../redux/api/currencyApiSlice";
import useCurrency from "../../hooks/useCurrency";
import { APP_NAME } from "../../redux/constants";

const StatCard = ({ icon, label, value, color, bgColor }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      borderRadius: 4,
      bgcolor: bgColor || "#fff",
      border: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
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
          bgcolor: color,
          width: 48,
          height: 48,
          borderRadius: 3,
          boxShadow: `0 4px 12px ${color}40`,
        }}
      >
        {icon}
      </Avatar>
    </Box>
    <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mb: 0.5 }}>
      {label}
    </Typography>
    <Typography variant="h4" fontWeight={800} color="text.primary">
      {value}
    </Typography>
  </Paper>
);

const SellerDashBoard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { data: sales, isLoading } = useGetTotalSalesQuery();
  const { data: orders, isLoading: loadingOrders } = useGetTotalOrdersQuery();
  const { data: order, isLoading: loadingOrder } = useGetOrdersQuery()
  const { data: products, isLoading: loadingProducts } = useAllProductsQuery();
  const { data: salesDetail } = useGetTotalSalesByDateQuery();
  const { userInfo } = useSelector((state) => state.auth);
  const { convert, symbol } = useCurrency();

  const [chartType, setChartType] = useState("bar");
  const [chartData, setChartData] = useState({
    options: {
      chart: {
        type: "line",
        toolbar: { show: false },
        fontFamily: 'inherit',
      },
      tooltip: {
        theme: "light",
        y: {
          formatter: (val) => `${symbol}${val.toFixed(2)}`
        }
      },
      colors: ["#6366f1", "#10b981", "#f59e0b", "#ef4444"],
      dataLabels: { enabled: false },
      stroke: { curve: "smooth", width: 3 },
      grid: {
        borderColor: "#f1f5f9",
        strokeDashArray: 4,
      },
      markers: { size: 4 },
      xaxis: {
        categories: [],
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { style: { colors: "#64748b", fontWeight: 500 } },
      },
      yaxis: {
        labels: {
          style: { colors: "#64748b", fontWeight: 500 },
          formatter: (val) => `${symbol}${val.toFixed(0)}`
        },
      },
      legend: {
        position: "top",
        horizontalAlign: "right",
        fontWeight: 600,
        labels: { colors: "#1e293b" },
      },
    },
    series: [],
  });

  useEffect(() => {
    if (!userInfo?.role === "seller") navigate("/unauthorized");
  }, [userInfo, navigate]);

  useEffect(() => {
    if (salesDetail && products && order) {
      // Format sales data by product
      const productSales = products.map((product) => {
        const productSalesData = salesDetail.filter(
          (sale) => sale.productId === product._id
        );
        return {
          name: product.name,
          data: productSalesData.map((sale) => sale.totalSales),
        };
      });

      // Format sales data by order
      const orderSales = order.map((order) => ({
        name: `Order ${order.orderNumber}`,
        data: salesDetail
          .filter((sale) => sale.orderId === order._id)
          .map((sale) => sale.totalSales),
      }));

      // Combine product and order sales data
      const combinedSalesData = [...productSales, ...orderSales];

      setChartData((prevState) => ({
        ...prevState,
        options: {
          ...prevState.options,
          xaxis: {
            ...prevState.options.xaxis,
            categories: salesDetail.map((item) => item.date),
          },
        },
        series: combinedSalesData,
      }));
    }
  }, [salesDetail, products, order]);

  let customersCount = 0;
  if (userInfo?.role === "seller" && products) {
    customersCount = products.filter((u) => u.user === userInfo._id).length;

  }

  return (
    <DocumentTitle title={`Seller Dashboard | ${APP_NAME}`}>
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#f8fafc",
          py: 8,
          px: { xs: 2, md: 6 },
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" fontWeight={900} color="#1e293b">
            Seller Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your store performance and sales analytics
          </Typography>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              icon={<AiOutlineDollarCircle size={28} />}
              label="Total Sales"
              value={isLoading ? <Loader size={20} /> : `${symbol}${convert(sales?.totalSales, 'USD')?.toFixed(2) || 0}`}
              color="#6366f1"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              icon={<InventoryIcon size={28} sx={{ color: '#fff' }} />}
              label="Products"
              value={loadingProducts ? <Loader size={20} /> : customersCount}
              color="#10b981"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              icon={<AiOutlineShoppingCart size={28} />}
              label="All Orders"
              value={isLoading ? <Loader size={20} /> : orders?.totalOrders || 0}
              color="#f59e0b"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              icon={<MdOutlineBarChart size={28} />}
              label="Avg. Order Value"
              value={isLoading || loadingOrders ? <Loader size={20} /> : `${symbol}${convert(orders?.averageOrderValue, 'USD')?.toFixed(2) || 0}`}
              color="#ef4444"
            />
          </Grid>
        </Grid>

        {/* Charts Section */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 6,
            mb: 6,
            border: '1px solid #e2e8f0',
            bgcolor: "#fff"
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
            <Box>
              <Typography variant="h5" fontWeight={800} color="#1e293b">
                Sales Performance
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Detailed breakdown of product and order sales trends
              </Typography>
            </Box>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <Select
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                sx={{ borderRadius: 2, bgcolor: '#f1f5f9', border: 'none' }}
              >
                <MenuItem value="line">Line Chart</MenuItem>
                <MenuItem value="bar">Bar Chart</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          <Box sx={{ width: "100%", pt: 2 }}>
            {salesDetail ? (
              <Chart
                options={chartData.options}
                series={chartData.series}
                type={chartType}
                width="100%"
                height={400}
              />
            ) : (
              <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">No sales data available for the current period.</Typography>
              </Box>
            )}
          </Box>
        </Paper>

        {/* Recent Orders Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight={800} color="#1e293b" sx={{ mb: 3 }}>
            Recent Orders
          </Typography>
          <Paper elevation={0} sx={{ borderRadius: 6, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <OrderList isAdmin={userInfo?.role === "admin"} />
          </Paper>
        </Box>
      </Box>
    </DocumentTitle>
  );
};

export default SellerDashBoard;