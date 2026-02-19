import { useState, useMemo } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
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
  Stack
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { Money } from "@mui/icons-material";
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
import SettingsIcon from "@mui/icons-material/Settings";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/features/auth/authSlice";
import { useLogoutMutation } from "../redux/api/usersApiSlice";
import { setSearchQuery } from "../redux/features/shop/shopSlice";
import { useAllProductsQuery } from "../redux/api/productApiSlice";
import Autosuggest from 'react-autosuggest';
import debounce from "lodash.debounce";
import HeaderCurrencySelector from "./HeaderCurrencySelector";
import { APP_NAME } from "../redux/constants";

const NavBar = ({
  placeholder = "Search products...",
  initialValue = "",
  onSearch,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();

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

  const [isSearchFocused, setIsSearchFocused] = useState(false);

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
    onFocus: () => setIsSearchFocused(true),
    onBlur: () => setIsSearchFocused(false),
    onChange: (e, { newValue }) => setSearchTerm(newValue),
    onKeyDown: (e) => {
      if (e.key === "Enter") handleSubmit(e);
    },
  };

  const getNavItems = () => {
    if (userInfo) {
      if (userInfo.role === "admin") {
        return [
          { label: "Users", icon: <PeopleIcon />, path: "/admin/userlist" },
          { label: "Categories", icon: <CategoryIcon />, path: "/admin/categorylist" },
          { label: "Inventory", icon: <InventoryIcon />, path: "/admin/productlist" },
          { label: "Banners", icon: <StoreIcon />, path: "/admin/banner" },
          { label: "Brands", icon: <SellIcon />, path: "/admin/brand" },
          { label: "Offers", icon: <DashboardIcon />, path: "/admin/offer" },
        ];
      }

      if (userInfo.role === "seller") {
        return [
          { label: "Inventory", icon: <InventoryIcon />, path: "/seller/allproductslist" },
          { label: "Orders", icon: <ReceiptIcon />, path: "/seller/orderlist" },
        ];
      }

      if (userInfo.role === "vendor") {
        return [
          { label: "Inventory", icon: <InventoryIcon />, path: "/vendor/allproductslist" },
          { label: "Orders", icon: <ReceiptIcon />, path: "/vendor/orders" },
        ];
      }

      return [
        { label: "Shop", icon: <StoreIcon />, path: "/shop" },
        { label: "Cart", icon: <ShoppingCartIcon />, path: "/cart", badge: cartItems?.length },
        { label: "Favorites", icon: <FavoriteIcon />, path: "/favorite" },
      ];
    }
    return [
      { label: "Shop", icon: <StoreIcon />, path: "/shop" },
    ];
  };

  const getUserMenuItems = () => {
    if (!userInfo) return [];

    const baseItems = [
      { label: "Profile", icon: <PersonIcon />, path: "/profile" },
    ];

    if (userInfo.role === "admin") {
      baseItems.push({ label: "Orders", icon: <ReceiptIcon />, path: "/admin/orderlist" });
      baseItems.push({ label: "Currencies", icon: <Money />, path: "/admin/currencies" });
      baseItems.push({ label: "Settings", icon: <SettingsIcon />, path: "/admin/settings" });
    } else {
      baseItems.push({ label: "Orders", icon: <ReceiptIcon />, path: "/orders" });
    }

    baseItems.push({ label: "Logout", icon: <LogoutIcon />, action: handleLogout });
    return baseItems;
  };

  const drawerContent = (
    <Box sx={{ width: { xs: 280, sm: 320 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{
        p: 3,
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 1 }}>
          {APP_NAME}
        </Typography>
        <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ p: 2, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                "& fieldset": { border: 'none' }
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton type="submit" size="small"><SearchIcon /></IconButton>
                </InputAdornment>
              ),
            }}
          />
        </form>
      </Box>

      <List sx={{ px: 1, py: 2 }}>
        {getNavItems().map((item, index) => (
          <ListItem
            key={index}
            button
            component={Link}
            to={item.path}
            onClick={() => setDrawerOpen(false)}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              color: location.pathname === item.path ? 'primary.main' : 'text.primary',
              bgcolor: location.pathname === item.path ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 600 }} />
            {item.badge > 0 && <Badge badgeContent={item.badge} color="primary" sx={{ mr: 2 }} />}
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 1, opacity: 0.5 }} />

      <List sx={{ px: 1 }}>
        {userInfo ? (
          <>
            <ListItem
              button
              component={Link}
              to="/profile"
              onClick={() => setDrawerOpen(false)}
              sx={{ borderRadius: 2, mb: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Avatar {...stringAvatar(userInfo.username)} sx={{ width: 24, height: 24, fontSize: 12 }} />
              </ListItemIcon>
              <ListItemText
                primary={userInfo.username}
                secondary={userInfo.email}
                primaryTypographyProps={{ fontWeight: 600 }}
                secondaryTypographyProps={{ fontSize: 11 }}
              />
            </ListItem>
            <ListItem
              button
              onClick={handleLogout}
              sx={{ borderRadius: 2, mb: 0.5, color: 'error.main', '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) } }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}><LogoutIcon /></ListItemIcon>
              <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 600 }} />
            </ListItem>
          </>
        ) : (
          <>
            <ListItem button component={Link} to="/login" onClick={() => setDrawerOpen(false)} sx={{ borderRadius: 2, mb: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}><LoginIcon /></ListItemIcon>
              <ListItemText primary="Login" primaryTypographyProps={{ fontWeight: 600 }} />
            </ListItem>
            <ListItem button component={Link} to="/register" onClick={() => setDrawerOpen(false)} sx={{ borderRadius: 2, mb: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}><AppRegistrationIcon /></ListItemIcon>
              <ListItemText primary="Register" primaryTypographyProps={{ fontWeight: 600 }} />
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
        elevation={0}
        sx={{
          bgcolor: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: "blur(20px)",
          color: theme.palette.text.primary,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          zIndex: theme.zIndex.appBar + 1
        }}
      >
        <Toolbar sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          minHeight: { xs: 64, md: 80 },
          px: { xs: 2, md: 4 },
          maxWidth: "1600px",
          width: "100%",
          mx: "auto"
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isMobile && (
              <IconButton edge="start" color="primary" onClick={() => setDrawerOpen(true)} sx={{ mr: 1 }}>
                <MenuIcon />
              </IconButton>
            )}
            <Typography
              variant="h5"
              component={Link}
              to="/"
              sx={{
                color: "primary.main",
                textDecoration: "none",
                fontWeight: 900,
                letterSpacing: -0.5,
                fontFamily: "'Outfit', sans-serif",
                fontSize: { xs: "1.2rem", md: "1.6rem" }
              }}
            >
              {APP_NAME}
            </Typography>
          </Box>

          {!isMobile && (
            <Box sx={{ flex: 1, display: "flex", justifyContent: "center", maxWidth: 600 }}>
              <form onSubmit={handleSubmit} style={{ width: "100%" }}>
                <Autosuggest
                  suggestions={suggestions}
                  onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                  onSuggestionsClearRequested={onSuggestionsClearRequested}
                  onSuggestionSelected={handleSuggestionSelected}
                  getSuggestionValue={getSuggestionValue}
                  renderSuggestion={renderSuggestion}
                  inputProps={inputProps}
                  theme={{
                    container: { position: "relative", width: "100%" },
                    input: {
                      width: "100%",
                      padding: "10px 20px",
                      fontSize: "15px",
                      borderRadius: "12px",
                      border: `1px solid ${isSearchFocused ? theme.palette.primary.main : alpha(theme.palette.divider, 0.2)}`,
                      backgroundColor: isSearchFocused ? 'white' : alpha(theme.palette.action.hover, 0.5),
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      outline: "none",
                      boxShadow: isSearchFocused ? `0 0 0 4px ${alpha(theme.palette.primary.main, 0.1)}` : 'none'
                    },
                    suggestionsContainer: {
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      zIndex: 2000,
                      backgroundColor: "white",
                      boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                      borderRadius: "12px",
                      marginTop: "12px",
                      overflow: "hidden",
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                    },
                    suggestionsList: { listStyle: "none", margin: 0, padding: 0 },
                    suggestion: {
                      padding: "12px 20px",
                      cursor: "pointer",
                      borderBottom: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
                      '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.05) }
                    }
                  }}
                />
              </form>
            </Box>
          )}

          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, md: 1.5 } }}>
            {!isMobile && (
              <>
                <HeaderCurrencySelector />
                {getNavItems().map((item, index) => (
                  <Tooltip key={index} title={item.label}>
                    <IconButton
                      component={Link}
                      to={item.path}
                      sx={{
                        color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
                        bgcolor: location.pathname === item.path ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05), color: 'primary.main' },
                        transition: 'all 0.2s'
                      }}
                    >
                      <Badge badgeContent={item.badge} color="primary">{item.icon}</Badge>
                    </IconButton>
                  </Tooltip>
                ))}
              </>
            )}

            {userInfo ? (
              <>
                <IconButton onClick={handleAvatarClick} sx={{ p: 0.5, border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}` }}>
                  <Avatar {...stringAvatar(userInfo.username)} sx={{ width: 32, height: 32, fontSize: 13, bgcolor: 'primary.main' }} />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  PaperProps={{
                    sx: {
                      minWidth: 240,
                      mt: 1.5,
                      borderRadius: 3,
                      boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      p: 1
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
                        borderRadius: 2,
                        py: 1.2,
                        mb: 0.5,
                        '&:hover': { bgcolor: item.label === "Logout" ? alpha(theme.palette.error.main, 0.08) : alpha(theme.palette.primary.main, 0.08) }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36, color: item.label === "Logout" ? 'error.main' : 'primary.main' }}>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }} />
                    </MenuItem>
                  ))}
                </Menu>
              </>
            ) : (
              !isMobile && (
                <Stack direction="row" spacing={1}>
                  <Button component={Link} to="/login" variant="text" sx={{ fontWeight: 700 }}>Login</Button>
                  <Button component={Link} to="/register" variant="contained" sx={{ borderRadius: 2, px: 3 }}>Join</Button>
                </Stack>
              )
            )}

            {isMobile && !mobileSearchOpen && (
              <IconButton onClick={() => setMobileSearchOpen(true)} color="primary"><SearchIcon /></IconButton>
            )}
          </Box>

          <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)} PaperProps={{ sx: { borderTopRightRadius: 20, borderBottomRightRadius: 20 } }}>
            {drawerContent}
          </Drawer>

          {isMobile && mobileSearchOpen && (
            <Slide in direction="down">
              <Box sx={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                bgcolor: 'background.paper', px: 2, display: 'flex', alignItems: 'center', zIndex: 1100
              }}>
                <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex' }}>
                  <TextField
                    fullWidth
                    autoFocus
                    placeholder="Type to search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      sx: { borderRadius: '12px 0 0 12px', bgcolor: alpha(theme.palette.action.hover, 0.5) },
                      startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                    }}
                  />
                  <Button type="submit" variant="contained" sx={{ borderRadius: '0 12px 12px 0', px: 3 }}>Go</Button>
                </form>
                <IconButton onClick={() => setMobileSearchOpen(false)} sx={{ ml: 1 }}><CloseIcon /></IconButton>
              </Box>
            </Slide>
          )}
        </Toolbar>
      </AppBar>
    </Slide>
  );
};

export default NavBar;