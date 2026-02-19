import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation, Link } from "react-router-dom";
import DocumentTitle from "../../components/DocumentTitle";
import VendorAnalyticsDashboard from "../../components/vendor/VendorAnalyticsDashboard";
import EnhancedVendorDashboard from "../../components/vendor/EnhancedVendorDashboard";
import VendorDebugTest from "../../components/vendor/VendorDebugTest";
import ApiTestComponent from "../../components/vendor/ApiTestComponent";
import { Box, Typography, Button, Tabs, Tab, Chip, Grid, Paper, Avatar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Fade, Zoom } from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Assessment as AssessmentIcon,
  ShoppingCart as ShoppingCartIcon,
  Inventory as InventoryIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Settings as SettingsIcon,
  Storefront as StoreIcon
} from "@mui/icons-material";
import VendorShopSettings from "../../components/vendor/VendorShopSettings";
import { useAllProductsQuery } from "../../redux/api/productApiSlice";
import { useGetMyOrdersQuery } from "../../redux/api/orderApiSlice";
import { IoAdd } from "react-icons/io5";
import moment from "moment";
import Loader from "../../components/Loader";
import Message from "../../components/Message";
import { useGetCurrenciesQuery } from "../../redux/api/currencyApiSlice";
import OrderList from "../../pages/Seller/OrderList";
import AllProducts from "../../pages/Seller/AllProducts";
import useCurrency from "../../hooks/useCurrency";
import { APP_NAME } from "../../redux/constants";

const VendorDashBoard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState(0);
  const { data: products = [], isLoading: isProductLoading, isError, refetch } = useAllProductsQuery();
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [filteredProducts, setfilteredProducts] = useState([]);
  // Listen for product add/update/delete events in localStorage
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === "productChanged") {
        setRefreshFlag((f) => !f);
        refetch();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [refetch]);
  useEffect(() => {
    if (userInfo && products) {
      const filter = products.filter((p) => (p.user === userInfo._id || p.user?._id === userInfo._id));
      setfilteredProducts(filter);
    }
  }, [products, userInfo]);

  useEffect(() => {
    if (userInfo && userInfo.role !== "vendor") {
      navigate("/unauthorized");
    }
  }, [userInfo, navigate]);
  const { data: orders = [], isLoading: isOrderLoading, error } = useGetMyOrdersQuery();
  const { convert, symbol } = useCurrency();

  // Show loading state while checking authentication
  if (!userInfo) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h6">Loading...</Typography>
      </Box>
    );
  }

  // Show unauthorized message if user is not a vendor
  if (userInfo.role !== "vendor") {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error">
          Access denied. Vendors only.
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/vendor/login")}
          sx={{ mt: 2 }}
        >
          Go to Vendor Login
        </Button>
      </Box>
    );
  }

  // Check URL parameters to determine which view to show
  const showDebugTest = location.search.includes('debug=test');
  const showApiTest = location.search.includes('debug=api');

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };


  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return <EnhancedVendorDashboard />;
      case 1:
        return <VendorAnalyticsDashboard />;
      case 2:
        return (
          <Box>
            <OrderList isAdmin={false} />
          </Box>
        );
      case 3:
        return (
          <Box>
            <AllProducts />
          </Box>
        );
      case 4:
        return <VendorShopSettings />;
      case 5:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 800 }}>
              Customer Insights
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Analyze customer behavior and improve engagement. (Advanced features coming soon)
            </Typography>
          </Box>
        );
      case 6:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Performance Reports
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Detailed reports on sales, traffic, and conversion metrics.
            </Typography>
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              href="/vendor/reports"
            >
              Generate Reports
            </Button>
          </Box>
        );
      default:
        return <EnhancedVendorDashboard />;
    }
  };


  return (
    <DocumentTitle title={`Vendor Dashboard | ${APP_NAME}`}>
      <Box sx={{ minHeight: '100vh', bgcolor: "#f8fafc" }}>
        <Box sx={{ borderBottom: 1, borderColor: '#e2e8f0', bgcolor: '#fff', px: { xs: 2, md: 6 }, pt: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" fontWeight={900} color="#1e293b">
              Vendor Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Analyze your business growth and manage store operations
            </Typography>
          </Box>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="vendor dashboard tabs"
            sx={{
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
                bgcolor: '#6366f1',
              },
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.95rem',
                color: '#64748b',
                minHeight: 48,
                '&.Mui-selected': {
                  color: '#6366f1',
                },
              },
            }}
          >
            <Tab icon={<DashboardIcon />} iconPosition="start" label="Overview" />
            <Tab icon={<AssessmentIcon />} iconPosition="start" label="Analytics" />
            <Tab icon={<ShoppingCartIcon />} iconPosition="start" label="Orders" />
            <Tab icon={<InventoryIcon />} iconPosition="start" label="Inventory" />
            <Tab icon={<StoreIcon />} iconPosition="start" label="Shop Profile" />
            <Tab icon={<PeopleIcon />} iconPosition="start" label="Customers" />
            <Tab icon={<TrendingUpIcon />} iconPosition="start" label="Reports" />
          </Tabs>
        </Box>

        <Box sx={{ py: 6, px: { xs: 2, md: 6 } }}>
          {renderTabContent()}
        </Box>
      </Box>
    </DocumentTitle>
  );
};

export default VendorDashBoard;