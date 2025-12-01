import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation, Link } from "react-router-dom";
import DocumentTitle from "react-document-title";
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
  Settings as SettingsIcon
} from "@mui/icons-material";
import { useAllProductsQuery } from "../../redux/api/productApiSlice";
import { useGetMyOrdersQuery } from "../../redux/api/orderApiSlice";
import { IoAdd } from "react-icons/io5";
import moment from "moment";
import Loader from "../../components/Loader";
import Message from "../../components/Message";
import { useGetCurrenciesQuery } from "../../redux/api/currencyApiSlice";
import OrderList from "../../pages/Seller/OrderList";

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
    // Optionally, trigger refetch on focus (for single tab)
    useEffect(() => {
      const onFocus = () => refetch();
      window.addEventListener("focus", onFocus);
      return () => window.removeEventListener("focus", onFocus);
    }, [refetch]);
  useEffect(() => {
    if (userInfo && userInfo.role !== "vendor") {
      navigate("/unauthorized");
    }
  }, [userInfo, navigate]);
  const { data: orders = [], isLoading: isOrderLoading, error } = useGetMyOrdersQuery();
    const currency = useSelector((state) => state.currency.selectedCurrency);
        const price = useSelector((state) => state.currency.price);
        const getCurrencySymbol = () => {
                try {
                  const formatter = new Intl.NumberFormat('en', {
                    style: 'currency',
                    currency: currency,
                    currencyDisplay: 'symbol',
                  });
            
                  const parts = formatter.formatToParts(1);
                  const symbol = parts.find(part => part.type === 'currency')?.value;
                  return symbol || currency;
                } catch (err) {
                  return currency; // fallback if currency code is invalid
                }
              };
  const { selectedCurrency } = useSelector((state) => state.currency);
  const { data: currencies = [] } = useGetCurrenciesQuery();
  
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
    return convertedAmount;
  };
  
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
          <Box sx={{ p: 3 }}>
            <OrderList isAdmin={userInfo?.role === "admin"} />
          </Box>
        );
      case 3:
        return (
          <Box sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 4,
                    }}
                  >
                    <Box>
                      <Typography variant="h4" fontWeight={700} color="primary.main">
                        My Products
                      </Typography>
                      <Chip
                        label={`Total: ${filteredProducts.length}`}
                        color="secondary"
                        sx={{ ml: 2, fontWeight: 600, fontSize: "1rem" }}
                      />
                    </Box>
                    <Button
                      component={Link}
                      to="/vendor/product/add"
                      variant="contained"
                      color="secondary"
                      startIcon={<IoAdd />}
                      sx={{
                        borderRadius: 2,
                        fontWeight: 600,
                        boxShadow: 3,
                        letterSpacing: 1,
                        px: 3,
                        py: 1,
                        fontSize: "1.05rem",
                        transition: "transform 0.2s, box-shadow 0.2s",
                        "&:hover": {
                          transform: "scale(1.04)",
                          boxShadow: 6,
                        },
                      }}
                      className="transition-transform"
                    >
                      Create Product
                    </Button>
                  </Box>
                  {filteredProducts.length === 0 ? (
                    <Box sx={{ textAlign: "center", mt: 8 }}>
                      <Typography variant="h6" color="text.secondary">
                        You have not added any products yet.
                      </Typography>
                    </Box>
                  ) : (
                    <Grid container spacing={4}>
                      {filteredProducts.map((product) => (
                        <Grid item xs={12} md={6} key={product._id}>
                          <Paper
                            elevation={6}
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              p: 3,
                              borderRadius: 4,
                              bgcolor: "#fff",
                              boxShadow: "0 6px 32px 0 rgba(0,0,0,0.12)",
                              transition: "transform 0.2s, box-shadow 0.2s",
                              "&:hover": {
                                transform: "translateY(-8px) scale(1.03)",
                                boxShadow: 12,
                              },
                            }}
                            className="hover:scale-105 hover:shadow-2xl transition-transform duration-200"
                          >
                            <Avatar
                              variant="rounded"
                              src={product.media[0]?.url}
                              alt={product.name}
                              sx={{
                                width: 120,
                                height: 120,
                                mr: 3,
                                bgcolor: "#eee",
                                border: "2px solid #e3eeff",
                              }}
                            />
                            <Box sx={{ flex: 1 }}>
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                <Typography variant="h6" fontWeight={700} color="primary.main">
                                  {product.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {moment(product.createdAt).format("MMM Do, YYYY")}
                                </Typography>
                              </Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ my: 1, maxWidth: { xs: "100%", md: 400 } }}
                              >
                                {product.description?.substring(0, 160)}...
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  mt: 2,
                                }}
                              >
                                <Button
                                  component={Link}
                                  to={`/vendor/product/update/${product._id}`}
                                  variant="contained"
                                  color="primary"
                                  sx={{
                                    borderRadius: 2,
                                    fontWeight: 600,
                                    px: 3,
                                    letterSpacing: 1,
                                    boxShadow: 2,
                                    "&:hover": {
                                      bgcolor: "secondary.main",
                                      color: "#fff",
                                    },
                                  }}
                                  // Add a callback to set localStorage flag on update
                                  onClick={() => {
                                    localStorage.setItem("productChanged", Date.now().toString());
                                  }}
                                >
                                  Update Product
                                </Button>
                                <Typography variant="h6" color="secondary.main">
                                  {getCurrencySymbol()}{convertToSelectedCurrency(product.price, product.currency)?.toFixed(2)}
                                </Typography>
                              </Box>
                            </Box>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  )}
          </Box>
        );
      case 4:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Inventory Tracking
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Monitor stock levels and receive low inventory alerts.
            </Typography>
            <Button 
              variant="contained" 
              sx={{ mt: 2 }}
              href="/vendor/inventory"
            >
              View Inventory
            </Button>
          </Box>
        );
      case 5:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Customer Insights
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Analyze customer behavior and improve engagement.
            </Typography>
            <Button 
              variant="contained" 
              sx={{ mt: 2 }}
              href="/vendor/customers"
            >
              View Customer Data
            </Button>
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
    <DocumentTitle title="Vendor Dashboard | Nexus Mart">
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            variant="scrollable"
            scrollButtons="auto"
            aria-label="vendor dashboard tabs"
          >
            <Tab 
              icon={<DashboardIcon />} 
              label="Enhanced Dashboard" 
              wrapped 
            />
            <Tab 
              icon={<AssessmentIcon />} 
              label="Analytics" 
              wrapped 
            />
            <Tab 
              icon={<ShoppingCartIcon />} 
              label="Orders" 
              wrapped 
            />
            <Tab 
              icon={<InventoryIcon />} 
              label="Products" 
              wrapped 
            />
            <Tab 
              icon={<AssessmentIcon />} 
              label="Inventory" 
              wrapped 
            />
            <Tab 
              icon={<PeopleIcon />} 
              label="Customers" 
              wrapped 
            />
            <Tab 
              icon={<TrendingUpIcon />} 
              label="Reports" 
              wrapped 
            />
          </Tabs>
        </Box>
        
        {renderTabContent()}
      </Box>
    </DocumentTitle>
  );
};

export default VendorDashBoard;