import Chart from "react-apexcharts";
import { useGetUsersQuery } from "../../redux/api/usersApiSlice";
import {
  useGetTotalOrdersQuery,
  useGetTotalSalesByDateQuery,
  useGetTotalSalesQuery,
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
} from "@mui/material";
import { FaUsers, FaProductHunt } from "react-icons/fa";
import { AiOutlineShoppingCart, AiOutlineDollarCircle } from "react-icons/ai";
import { MdOutlineBarChart } from "react-icons/md";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import DocumentTitle from "react-document-title";
import { useAllProductsQuery } from "../../redux/api/productApiSlice";
import {
  useGetOrdersQuery
} from "../../redux/api/orderApiSlice";
import { useGetCurrenciesQuery } from "../../redux/api/currencyApiSlice";

const StatCard = ({ icon, label, value, color }) => (
  <Paper
    elevation={6}
    sx={{
      p: 3,
      borderRadius: 4,
      bgcolor: "background.paper",
      minWidth: 220,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      boxShadow: "0 6px 32px 0 rgba(0,0,0,0.10)",
      transition: "transform 0.2s, box-shadow 0.2s",
      "&:hover": {
        transform: "translateY(-6px) scale(1.03)",
        boxShadow: 12,
      },
    }}
  >
    <Avatar
      sx={{
        bgcolor: color,
        width: 56,
        height: 56,
        mb: 2,
        boxShadow: 3,
      }}
    >
      {icon}
    </Avatar>
    <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
      {label}
    </Typography>
    <Typography variant="h5" fontWeight={700} sx={{ mt: 1 }}>
      {value}
    </Typography>
  </Paper>
);

const AdminDashboard = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { selectedCurrency } = useSelector((state) => state.currency);
  const { data: currencies = [] } = useGetCurrenciesQuery();
  const theme = useTheme();
  const navigate = useNavigate();
  const { data: sales, isLoading } = useGetTotalSalesQuery();
  const { data: customersData, isLoading: loadingCustomers } = useGetUsersQuery();
  const { data: orders, isLoading: loadingOrders } = useGetTotalOrdersQuery();
  const { data: order, isLoading: loadingOrder } = useGetOrdersQuery();
  const { data: products, isLoading: loadingProducts } = useAllProductsQuery();
  const { data: salesDetail } = useGetTotalSalesByDateQuery();

  const [chartType, setChartType] = useState("bar");

  const [state, setState] = useState({
    options: {
      chart: { type: "line", toolbar: { show: false } },
      tooltip: { theme: "dark" },
      colors: [theme.palette.secondary.main],
      dataLabels: { enabled: true },
      stroke: { curve: "smooth" },
      title: {
        text: "Sales Trend",
        align: "left",
        style: { color: theme.palette.primary.main },
      },
      grid: { borderColor: "#ccc" },
      markers: { size: 1 },
      xaxis: {
        categories: [],
        title: { text: "Date", style: { color: theme.palette.text.primary } },
        labels: { style: { colors: theme.palette.text.secondary } },
      },
      yaxis: {
        title: { text: "Sales", style: { color: theme.palette.text.primary } },
        min: 0,
        labels: { style: { colors: theme.palette.text.secondary } },
      },
      legend: {
        position: "top",
        horizontalAlign: "right",
        floating: true,
        offsetY: -25,
        offsetX: -5,
        labels: { colors: theme.palette.text.primary },
      },
    },
    series: [{ name: "Sales", data: [] }],
  });

  useEffect(() => {
    if (userInfo?.role !== "admin") navigate("/");
  }, [userInfo, navigate]);

  useEffect(() => {
    if (salesDetail) {
      const formattedSalesDate = salesDetail.map((item) => ({
        x: item._id,
        y: item.totalSales,
      }));

      setState((prevState) => ({
        ...prevState,
        options: {
          ...prevState.options,
          xaxis: {
            ...prevState.options.xaxis,
            categories: formattedSalesDate.map((item) => item.x),
          },
        },
        series: [
          { name: "Sales", data: formattedSalesDate.map((item) => item.y) },
        ],
      }));
    }
  }, [salesDetail]);

  // Extract users array from the response object
  const customers = customersData?.users || [];
  const ordersData = order?.orders || [];
  // Calculate counts based on user roles
  const customersCount = customers.filter((u) => u.role === "customer").length;
  const sellerCount = customers.filter((u) => u.role === "seller").length;
  const vendorsCount = customers.filter((u) => u.role === "vendor").length;
  const pendingOrdersCount = ordersData.filter((o) => o.status === "pending").length;
  const completedOrdersCount = ordersData.filter((o) => o.status === "completed").length;
  const totalOrdersCount = ordersData.length;
  // Function to convert amount to selected currency
  const convertToSelectedCurrency = (amount, fromCurrency = 'USD') => {
    if (!selectedCurrency || selectedCurrency === fromCurrency) {
      return amount;
    }
    
    // Find currencies
    const fromCurrencyObj = currencies.find(c => c.code === fromCurrency);
    const toCurrencyObj = currencies.find(c => c.code === selectedCurrency);
    
    // If we don't have currency data, return original amount
    if (!fromCurrencyObj || !toCurrencyObj) {
      return amount;
    }
    
    // Convert using exchange rates
    // Formula: (amount / fromRate) * toRate
    const convertedAmount = (amount / fromCurrencyObj.rate) * toCurrencyObj.rate;
    if (isNaN(convertedAmount)) return 0;
    return convertedAmount;
  };

  // Function to get currency symbol
  const getCurrencySymbol = () => {
    try {
      const formatter = new Intl.NumberFormat('en', {
        style: 'currency',
        currency: selectedCurrency || 'USD',
        currencyDisplay: 'symbol',
      });

      const parts = formatter.formatToParts(1);
      const symbol = parts.find(part => part.type === 'currency')?.value;
      return symbol || (selectedCurrency || 'USD');
    } catch (err) {
      return selectedCurrency || 'USD'; // fallback if currency code is invalid
    }
  };
  
  return (
    <>
      <DocumentTitle title="Admin DashBoard | Nexus Mart" />
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f3e7e9 0%, #e3eeff 100%)",
          py: 6,
          px: { xs: 1, md: 8 },
        }}
      >
        <Typography
          variant="h3"
          fontWeight={900}
          color="primary.main"
          sx={{
            mb: 4,
            letterSpacing: 1,
            textShadow: "2px 2px 8px #e1bee7",
            textAlign: "center",
          }}
        >
          Admin Dashboard
        </Typography>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={3}
          justifyContent="center"
          alignItems="center"
          sx={{ mb: 4, display: "flex", flexWrap: "wrap", gap: 2 }}
        >
          <StatCard
            icon={<AiOutlineDollarCircle size={32} />}
            label="Total Sales"
            value={
              isLoading ? (
                <Loader size={24} />
              ) : (
                `${getCurrencySymbol()}${convertToSelectedCurrency(sales?.totalSales)?.toFixed(2) || 0}`
              )
            }
            color={theme.palette.secondary.main}
          />
          <StatCard
            icon={<FaProductHunt size={28} />}
            label="Products"
            value={loadingProducts ? <Loader size={24} /> : products?.length || 0}
            color={theme.palette.info.main}
          />
          <StatCard
            icon={<FaUsers size={28} />}
            label="Customers"
            value={loadingCustomers ? <Loader size={24} /> : customersCount}
            color={theme.palette.info.main}
          />
          <StatCard
            icon={<FaUsers size={28} />}
            label="Vendors"
            value={loadingCustomers ? <Loader size={24} /> : vendorsCount}
            color={theme.palette.info.main}
          />
          <StatCard
            icon={<FaUsers size={28} />}
            label="Sellers"
            value={loadingCustomers ? <Loader size={24} /> : sellerCount}
            color={theme.palette.info.main}
          />
          <StatCard
            icon={<AiOutlineShoppingCart size={32} />}
            label="All Orders"
            value={loadingOrders ? <Loader size={24} /> : orders?.totalOrders || 0}
            color={theme.palette.success.main}
          />
          <StatCard
            icon={<MdOutlineBarChart size={32} />}
            label="Avg. Order Value"
            value={
              isLoading || loadingOrders
                ? <Loader size={24} />
                : `${getCurrencySymbol()}${convertToSelectedCurrency(orders?.averageOrderValue)?.toFixed(2) || 0}`
            }
            color={theme.palette.warning.main}
          />
        </Stack>

        <Paper
          elevation={6}
          sx={{
            p: 4,
            borderRadius: 4,
            mb: 6,
            background: "linear-gradient(120deg, #e3eeff 60%, #f3e7e9 100%)",
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography
              variant="h5"
              fontWeight={700}
              color="primary.main"
              sx={{ mb: 3, letterSpacing: 1 }}
            >
              Sales Trend
            </Typography>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel id="chart-type-label">Chart</InputLabel>
              <Select
                labelId="chart-type-label"
                value={chartType}
                label="Chart"
                onChange={(e) => setChartType(e.target.value)}
              >
                <MenuItem value="line">Line</MenuItem>
                <MenuItem value="bar">Bar</MenuItem>
              </Select>
            </FormControl>
          </Stack>
          <Divider sx={{ mb: 3 }} />
          <Box sx={{ width: "100%", minHeight: 350 }}>
            {salesDetail ? (
              <Chart
                options={state.options}
                series={state.series}
                type={chartType}
                width="100%"
                height={350}
              />
            ) : (
              <Typography color="text.secondary" textAlign="center">
                No sales data available.
              </Typography>
            )}
          </Box>
        </Paper>
      </Box>
    </>
  );
};

export default AdminDashboard;
