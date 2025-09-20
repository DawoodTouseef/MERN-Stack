import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Typography,
  Tooltip,
  Button,
  Divider,
  Paper,
  Badge,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Slide,
  alpha,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import FavoriteIcon from "@mui/icons-material/Favorite";
import PersonIcon from "@mui/icons-material/Person";
import LoginIcon from "@mui/icons-material/Login";
import AppRegistrationIcon from "@mui/icons-material/AppRegistration";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CategoryIcon from "@mui/icons-material/Category";
import PeopleIcon from "@mui/icons-material/People";
import InventoryIcon from "@mui/icons-material/Inventory";
import ReceiptIcon from "@mui/icons-material/Receipt";
import StoreIcon from "@mui/icons-material/Store";
import SellIcon from "@mui/icons-material/Sell";
import LogoutIcon from "@mui/icons-material/Logout";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/features/auth/authSlice";
import { useLogoutMutation } from "../redux/api/usersApiSlice";
import { setSearchQuery } from "../redux/features/shop/shopSlice";
import { useAllProductsQuery } from "../redux/api/productApiSlice";
import Autosuggest from 'react-autosuggest';
import debounce from "lodash.debounce";
import HeaderCurrencySelector from "./HeaderCurrencySelector";

const NavBar = ({
  placeholder = "Search products...",
  initialValue = "",
  onSearch,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const { data: products = [], isLoading } = useAllProductsQuery();
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);
  const [logoutApiCall] = useLogoutMutation();

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedSearchTerm = searchTerm.trim();
    if (onSearch) {
      onSearch(trimmedSearchTerm);
    } else {
      dispatch(setSearchQuery(trimmedSearchTerm));
      navigate("/shop");
    }
    if (isMobile) setMobileSearchOpen(false);
  };

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      let redirectPath = '/login';
      if (userInfo.role === "seller") {
        redirectPath = "/seller/login";
      } else if (userInfo.role === "admin") {
        redirectPath = "/admin/login";
      } else if (userInfo.role === "vendor") {
        redirectPath = "/vendor/login";
      }
      
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate(redirectPath);
    } catch (error) {
      console.error('Logout error:', error);
      dispatch(logout());
      navigate('/login');
    }
    setAnchorEl(null);
  };

  function stringAvatar(name) {
    if (!name) return { children: "U" };
    const parts = name.split(" ");
    return {
      children:
        parts.length > 1
          ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
          : `${parts[0][0]}`.toUpperCase(),
    };
  }

  const getSuggestions = useMemo(
    () =>
      debounce((value, callback) => {
        const inputValue = value.trim().toLowerCase();
        const filtered =
          inputValue.length === 0
            ? []
            : products.filter(
                (product) =>
                  product.name.toLowerCase().includes(inputValue) ||
                  product.brand?.name?.toLowerCase().includes(inputValue) ||
                  product.description?.toLowerCase().includes(inputValue)
              );
        callback(filtered.slice(0, 6));
      }, 200),
    [products]
  );

  const onSuggestionsFetchRequested = ({ value }) => {
    getSuggestions(value, setSuggestions);
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const getSuggestionValue = (suggestion) => suggestion.name;

  const handleSuggestionSelected = (_, { suggestion }) => {
    navigate(`/product/${suggestion._id}`);
    if (isMobile) setMobileSearchOpen(false);
  };

  const renderSuggestion = (suggestion, { query }) => {
    const regex = new RegExp(`(${query})`, "gi");
    const highlightedName = suggestion.name.replace(
      regex,
      (match) => `<span style="color:${theme.palette.primary.main}; font-weight:bold;">${match}</span>`
    );
    
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, py: 1 }}>
        <Box
          component="img"
          src={suggestion.media?.[0]?.url || "/placeholder.png"}
          alt={suggestion.name}
          sx={{ 
            width: 45, 
            height: 45, 
            borderRadius: 2, 
            objectFit: "cover",
            border: `1px solid ${theme.palette.divider}`
          }}
        />
        <Typography
          variant="body2"
          sx={{ fontSize: 15 }}
          dangerouslySetInnerHTML={{ __html: highlightedName }}
        />
      </Box>
    );
  };

  const inputProps = {
    placeholder,
    value: searchTerm,
    onChange: (e, { newValue }) => setSearchTerm(newValue),
    onKeyDown: (e) => {
      if (e.key === "Enter") handleSubmit(e);
    },
  };

  // Navigation items based on user role
  const getNavItems = () => {
    if (userInfo) {
      if (userInfo.role === "admin") {
        return [
          { label: "Dashboard", icon: <DashboardIcon />, path: "/admin/settings" },
          { label: "Users", icon: <PeopleIcon />, path: "/admin/userlist" },
          { label: "Categories", icon: <CategoryIcon />, path: "/admin/categorylist" },
          { label: "Products", icon: <InventoryIcon />, path: "/admin/productlist" },
          { label: "Orders", icon: <ReceiptIcon />, path: "/admin/orderlist" },
          { label: "Banners", icon: <StoreIcon />, path: "/admin/banner" },
        ];
    }

    if (userInfo.role === "seller") {
      return [
        { label: "Dashboard", icon: <DashboardIcon />, path: "/" },
        { label: "Products", icon: <InventoryIcon />, path: "/seller/allproductslist" },
        { label: "Orders", icon: <ReceiptIcon />, path: "/seller/orderlist" },
      ];
    }

    if (userInfo.role === "vendor") {
      return [
        { label: "Brand", icon: <SellIcon />, path: "/vendor/brand" },
      ];
    }

    // Customer role
    return [
      { label: "Shop", icon: <StoreIcon />, path: "/shop" },
      { label: "Cart", icon: <ShoppingCartIcon />, path: "/cart" },
      { label: "Favorites", icon: <FavoriteIcon />, path: "/favorite" },
    ];
    }
  };

  const getUserMenuItems = () => {
    if (!userInfo) return [];
    
    const baseItems = [
      { label: "Profile", icon: <PersonIcon />, path: "/profile" },
      { label: "Orders", icon: <ReceiptIcon />, path: "/orders" },
    ];
    
    if (userInfo.role === "admin") {
      baseItems.unshift({ label: "Admin Dashboard", icon: <DashboardIcon />, path: "/admin/settings" });
    } else if (userInfo.role === "seller") {
      baseItems.unshift({ label: "Seller Dashboard", icon: <DashboardIcon />, path: "/" });
    } else if (userInfo.role === "vendor") {
      baseItems.unshift({ label: "Vendor Dashboard", icon: <DashboardIcon />, path: "/vendor/dashboard" });
    }
    
    baseItems.push({ label: "Logout", icon: <LogoutIcon />, action: handleLogout });
    
    return baseItems;
  };

  // Drawer content for mobile
  const drawerContent = (
    <Box sx={{ width: { xs: 280, sm: 320 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Drawer Header */}
      <Box sx={{ 
        p: 2, 
        bgcolor: 'primary.main', 
        color: 'white',
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Nexus Mart
        </Typography>
        <IconButton 
          onClick={() => setDrawerOpen(false)} 
          sx={{ color: 'white' }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      
      {/* Mobile Search */}
      <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                bgcolor: theme.palette.background.paper,
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton type="submit" size="small">
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </form>
      </Box>
      {/* User Section */}
      <Divider />
      <List>
        {userInfo ? (
          <>
            <ListItem 
              button 
              component={Link} 
              to="/profile" 
              onClick={() => setDrawerOpen(false)}
              sx={{ 
                borderRadius: 2, 
                mb: 0.5,
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Avatar 
                  {...stringAvatar(userInfo.username)} 
                  sx={{ width: 24, height: 24, fontSize: 12 }} 
                />
              </ListItemIcon>
              <ListItemText 
                primary={userInfo.username} 
                secondary={userInfo.email}
                primaryTypographyProps={{ fontWeight: 500 }}
                secondaryTypographyProps={{ fontSize: 12 }}
              />
            </ListItem>
            <ListItem 
              button 
              onClick={handleLogout}
              sx={{ 
                borderRadius: 2, 
                mb: 0.5,
                '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'error.main' }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Logout" 
                primaryTypographyProps={{ fontWeight: 500, color: 'error.main' }} 
              />
            </ListItem>
          </>
        ) : (
          <>
            <ListItem 
              button 
              component={Link} 
              to="/login" 
              onClick={() => setDrawerOpen(false)}
              sx={{ 
                borderRadius: 2, 
                mb: 0.5,
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}>
                <LoginIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Login" 
                primaryTypographyProps={{ fontWeight: 500 }} 
              />
            </ListItem>
            <ListItem 
              button 
              component={Link} 
              to="/register" 
              onClick={() => setDrawerOpen(false)}
              sx={{ 
                borderRadius: 2, 
                mb: 0.5,
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}>
                <AppRegistrationIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Register" 
                primaryTypographyProps={{ fontWeight: 500 }} 
              />
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );
  
  return (
    <Slide in direction="down">
      <AppBar
        position="sticky"
        sx={{
          bgcolor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          boxShadow: '0 2px 24px rgba(0,0,0,0.08)',
          borderBottom: `3px solid ${theme.palette.primary.main}`,
          py: { xs: 0, md: 0.5 },
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: { xs: 1, md: 2 },
            flexWrap: "nowrap",
            minHeight: { xs: 56, sm: 64, md: 72 },
            px: { xs: 1, sm: 2, md: 3 },
            position: "relative",
            width: "100%",
            maxWidth: "1400px",
            mx: "auto",
          }}
        >
          {/* Mobile Menu Icon */}
          {isMobile && (
            <IconButton
              edge="start"
              color="primary"
              aria-label="menu"
              onClick={() => setDrawerOpen(true)}
              sx={{ 
                mr: 1,
                width: { xs: 40, sm: 44 },
                height: { xs: 40, sm: 44 }
              }}
            >
              <MenuIcon fontSize="large" />
            </IconButton>
          )}

          {/* Logo/Brand */}
          <Box sx={{ flex: { xs: 1, md: "0 0 200px" }, minWidth: { xs: "auto", md: "150px" } }}>
            <Typography
              variant="h5"
              component={Link}
              to="/"
              sx={{
                color: "primary.main",
                textDecoration: "none",
                fontWeight: "800",
                letterSpacing: 1,
                fontFamily: "'Poppins', sans-serif",
                transition: "all 0.3s ease",
                "&:hover": { 
                  color: "secondary.main",
                  transform: "scale(1.02)"
                },
                fontSize: { xs: "1.4rem", sm: "1.6rem", md: "1.8rem" },
              }}
            >
              NexusMart
            </Typography>
          </Box>

          {/* Search Bar - Desktop */}
          {!isMobile && (
            <Box sx={{ 
              flex: { md: 2 }, 
              display: "flex", 
              justifyContent: "center",
              mx: { xs: 0, md: 2 },
              maxWidth: { md: "600px" },
              width: { md: "100%" },
            }}>
              <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: 500 }}>
                <Autosuggest
                  suggestions={suggestions}
                  onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                  onSuggestionsClearRequested={onSuggestionsClearRequested}
                  onSuggestionSelected={handleSuggestionSelected}
                  getSuggestionValue={getSuggestionValue}
                  renderSuggestion={renderSuggestion}
                  inputProps={inputProps}
                  theme={{
                    container: {
                      position: "relative",
                      width: "100%",
                    },
                    input: {
                      width: "100%",
                      padding: "12px 20px",
                      fontSize: "16px",
                      borderRadius: "50px",
                      border: `2px solid ${theme.palette.divider}`,
                      backgroundColor: theme.palette.background.paper,
                      transition: "all 0.3s ease",
                      outline: "none",
                      height: { xs: "40px", sm: "44px", md: "48px" },
                      '&:focus': {
                        borderColor: theme.palette.primary.main,
                        boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}`,
                      }
                    },
                    suggestionsContainer: {
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      zIndex: 20,
                      backgroundColor: theme.palette.background.paper,
                      boxShadow: theme.shadows[4],
                      borderRadius: "16px",
                      marginTop: "8px",
                      overflow: "hidden",
                      maxHeight: "360px",
                      overflowY: "auto",
                    },
                    suggestionsList: {
                      listStyle: "none",
                      margin: 0,
                      padding: 0,
                    },
                    suggestion: {
                      padding: "12px 20px",
                      cursor: "pointer",
                      transition: "background 0.2s ease",
                      fontSize: "15px",
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      '&:last-child': {
                        borderBottom: 'none'
                      },
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                      }
                    },
                    suggestionHighlighted: {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    },
                  }}
                />
              </form>
            </Box>
          )}

          {/* Mobile Search Icon */}
          {isMobile && !mobileSearchOpen && (
            <IconButton
              onClick={() => setMobileSearchOpen(true)}
              sx={{ 
                color: 'primary.main',
                width: { xs: 40, sm: 44 },
                height: { xs: 40, sm: 44 }
              }}
            >
              <SearchIcon fontSize="large" />
            </IconButton>
          )}

          {/* Mobile Search Bar */}
          {isMobile && mobileSearchOpen && (
            <Box sx={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'background.paper',
              p: 1,
              display: 'flex',
              alignItems: 'center',
              zIndex: 100
            }}>
              <form onSubmit={handleSubmit} style={{ width: "100%", display: 'flex' }}>
                <TextField
                  fullWidth
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "50px 0 0 50px",
                      height: 44,
                    },
                  }}
                />
                <Button 
                  type="submit"
                  variant="contained"
                  sx={{ 
                    borderRadius: "0 50px 50px 0",
                    minWidth: 60,
                    height: 44
                  }}
                >
                  <SearchIcon />
                </Button>
              </form>
              <IconButton
                onClick={() => setMobileSearchOpen(false)}
                sx={{ ml: 1 }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          )}

          {/* Navigation & User Actions */}
          {!isMobile && (
            <Box
              sx={{
                flex: { xs: 1, md: "0 0 auto" },
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: { xs: 0.5, sm: 1 },
                minWidth: "200px",
              }}
            >
              {/* Currency Selector */}
              <HeaderCurrencySelector />
              
              {/* Navigation Items */}
              {userInfo && getNavItems().map((item, index) => (
                <Tooltip key={index} title={item.label}>
                  <Button
                    component={Link}
                    to={item.path}
                    color="inherit"
                    sx={{
                      fontWeight: 600,
                      mr: { xs: 0.5, sm: 1 },
                      display: "flex",
                      alignItems: "center",
                      borderRadius: 3,
                      transition: "all 0.3s ease",
                      "&:hover": { 
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        transform: "translateY(-2px)"
                      },
                      px: { xs: 1, sm: 2 },
                      py: { xs: 0.5, sm: 1 },
                      minWidth: { xs: 40, sm: 60 }
                    }}
                    startIcon={item.icon}
                  >
                    <Box sx={{ display: { xs: "none", sm: "block" } }}>{item.label}</Box>
                  </Button>
                </Tooltip>
              ))}
              {/* User Menu */}
              {userInfo ? (
                <>
                  <Tooltip title={userInfo.username}>
                    <IconButton 
                      onClick={handleAvatarClick} 
                      sx={{ 
                        ml: 2, 
                        width: 44, 
                        height: 44,
                        border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "scale(1.05)",
                          borderColor: theme.palette.primary.main,
                          boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.1)}`
                        }
                      }}
                    >
                      <Avatar 
                        {...stringAvatar(userInfo.username)} 
                        sx={{ 
                          width: 36, 
                          height: 36,
                          bgcolor: 'primary.main',
                          color: 'white'
                        }} 
                      />
                    </IconButton>
                  </Tooltip>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "right",
                    }}
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                    PaperProps={{
                      sx: {
                        minWidth: { xs: 200, sm: 280 },
                        mt: 1.5,
                        borderRadius: 3,
                        boxShadow: theme.shadows[8],
                        border: `1px solid ${theme.palette.divider}`
                      }
                    }}
                  >
                    {getUserMenuItems().map((item, index) => (
                      <MenuItem 
                        key={index}
                        component={item.path ? Link : undefined}
                        to={item.path}
                        onClick={item.action || handleMenuClose}
                        sx={{ 
                          py: 1.5, 
                          px: 2,
                          borderRadius: 2,
                          mx: 1,
                          mb: 0.5,
                          transition: "all 0.2s ease",
                          "&:hover": {
                            bgcolor: alpha(
                              item.label === "Logout" ? theme.palette.error.main : theme.palette.primary.main, 
                              0.1
                            )
                          }
                        }}
                      >
                        <ListItemIcon sx={{ 
                          minWidth: 36,
                          color: item.label === "Logout" ? theme.palette.error.main : theme.palette.primary.main
                        }}>
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText 
                          primary={item.label} 
                          primaryTypographyProps={{ 
                            fontWeight: 600,
                            color: item.label === "Logout" ? theme.palette.error.main : 'inherit'
                          }} 
                        />
                      </MenuItem>
                    ))}
                  </Menu>
                </>
              ) : (
                <>
                  <Tooltip title="Login">
                    <Button
                      component={Link}
                      to="/login"
                      variant="outlined"
                      sx={{
                        fontWeight: 600,
                        ml: { xs: 0.5, sm: 1 },
                        borderRadius: 3,
                        transition: "all 0.3s ease",
                        "&:hover": { 
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          transform: "translateY(-2px)"
                        },
                        px: { xs: 1, sm: 2 },
                        py: { xs: 0.5, sm: 1 },
                        minWidth: { xs: 40, sm: 60 },
                        borderColor: alpha(theme.palette.primary.main, 0.5),
                        color: theme.palette.primary.main
                      }}
                      startIcon={<LoginIcon />}
                    >
                      <Box sx={{ display: { xs: "none", sm: "block" } }}>Login</Box>
                    </Button>
                  </Tooltip>
                  <Tooltip title="Register">
                    <Button
                      component={Link}
                      to="/register"
                      variant="contained"
                      sx={{
                        fontWeight: 600,
                        ml: { xs: 0.5, sm: 1 },
                        borderRadius: 3,
                        transition: "all 0.3s ease",
                        "&:hover": { 
                          transform: "translateY(-2px)",
                          boxShadow: theme.shadows[4]
                        },
                        px: { xs: 1, sm: 2 },
                        py: { xs: 0.5, sm: 1 },
                        minWidth: { xs: 40, sm: 60 },
                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
                      }}
                      startIcon={<AppRegistrationIcon />}
                    >
                      <Box sx={{ display: { xs: "none", sm: "block" } }}>Register</Box>
                    </Button>
                  </Tooltip>
                  <Tooltip title="Login">
                    <Button
                      component={Link}
                      to="/seller/login"
                      variant="outlined"
                      sx={{
                        fontWeight: 600,
                        ml: { xs: 0.5, sm: 1 },
                        borderRadius: 3,
                        transition: "all 0.3s ease",
                        "&:hover": { 
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          transform: "translateY(-2px)"
                        },
                        px: { xs: 1, sm: 2 },
                        py: { xs: 0.5, sm: 1 },
                        minWidth: { xs: 40, sm: 60 },
                        borderColor: alpha(theme.palette.primary.main, 0.5),
                        color: theme.palette.primary.main
                      }}
                      startIcon={<LoginIcon />}
                    >
                      <Box sx={{ display: { xs: "none", sm: "block" } }}>Become a Seller</Box>
                    </Button>
                  </Tooltip>
                </>
              )}
            </Box>
          )}
        </Toolbar>
        
        {/* Drawer for mobile */}
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          PaperProps={{
            sx: {
              bgcolor: theme.palette.background.paper,
              width: { xs: 280, sm: 320 },
              height: '100%',
              boxShadow: theme.shadows[10]
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </AppBar>
    </Slide>
  );
};

export default NavBar;