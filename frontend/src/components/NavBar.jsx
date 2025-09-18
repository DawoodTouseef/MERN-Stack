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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MenuIcon from "@mui/icons-material/Menu";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/features/auth/authSlice";
import { useLogoutMutation } from "../redux/api/usersApiSlice";
import {
  AiOutlineShopping,
  AiOutlineLogin,
  AiOutlineShoppingCart,
  AiOutlineHeart,
  AiOutlineUserAdd,
  AiOutlineDashboard,
  AiOutlineProfile,
} from "react-icons/ai";
import { MdProductionQuantityLimits } from "react-icons/md";
import { FaUsers, FaList } from "react-icons/fa";
import { IoIosLogOut } from "react-icons/io";
import { FaTag} from 'react-icons/fa';
import {setSearchQuery} from "../redux/features/shop/shopSlice"
import { useAllProductsQuery } from "../redux/api/productApiSlice";
import Autosuggest from 'react-autosuggest';
import debounce from "lodash.debounce";

const NavBar = ({
  placeholder = "Search products...",
  initialValue = "",
  onSearch,
}) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { data: products = [], isLoading } = useAllProductsQuery();
  const [suggestions, setSuggestions] = useState([]);
  const isMobile = useMediaQuery("(max-width:900px)");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);
  const { cart } = useSelector((state) => state.shop);
  const [logoutApiCall] = useLogoutMutation();

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedSearchTerm = searchTerm.trim();
    if (onSearch) {
      onSearch(trimmedSearchTerm);
    } else {
      dispatch(setSearchQuery(trimmedSearchTerm)); // Update search query in Redux
      navigate("/shop")

    }
  };

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      let api;
      if (userInfo.role==="seller"){
          api="/seller/login"
      }
      if (userInfo.role==="admin"){
          api="/admin/login"
      }
      if (userInfo.role==="vendor"){
          api="/vendor/login"
      }
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate(api || '/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout API fails, clear local state
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
  };

  const renderSuggestion = (suggestion, { query }) => {
  const regex = new RegExp(`(${query})`, "gi");
  const highlightedName = suggestion.name.replace(
    regex,
    (match) => `<span style="color:#2563eb; font-weight:bold;">${match}</span>`
  );
  
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <img
        src={suggestion.media?.[0]?.url || "/placeholder.png"}
        alt={suggestion.name}
        style={{ width: 45, height: 45, borderRadius: 8, objectFit: "cover" }}
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
  // Drawer content for mobile
  const drawerContent = (
    <Box sx={{ width: 280, pt: 2, pb: 2 }}>
      <List>
        <ListItem sx={{ mb: 1 }}>
          <Typography
            variant="h5"
            component={Link}
            to="/"
            sx={{
              color: "primary.main",
              textDecoration: "none",
              fontWeight: "bold",
              letterSpacing: 2,
              fontFamily: "Montserrat, sans-serif",
            }}
            onClick={() => setDrawerOpen(false)}
          >
            Nexus
          </Typography>
        </ListItem>
        
        {/* Mobile Search Bar */}
        <ListItem sx={{ px: 2, mb: 2 }}>
          <form onSubmit={handleSubmit} style={{ width: "100%" }}>
            <TextField
              fullWidth
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: "#f8fafc",
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
        </ListItem>
        
        <Divider sx={{ my: 1 }} />
        {userInfo && userInfo.role==="customer" && (
          <>
            <ListItem button component={Link} to="/shop" onClick={() => setDrawerOpen(false)}>
              <ListItemIcon>
                <AiOutlineShopping size={22} />
              </ListItemIcon>
              <ListItemText primary="Shop" />
            </ListItem>
            <ListItem button component={Link} to="/cart" onClick={() => setDrawerOpen(false)}>
              <ListItemIcon>
                <Badge badgeContent={cartItems.length} color="secondary">
                  <AiOutlineShoppingCart size={22} />
                </Badge>
              </ListItemIcon>
              <ListItemText primary="Cart" />
            </ListItem>
            <ListItem button component={Link} to="/favorite" onClick={() => setDrawerOpen(false)}>
              <ListItemIcon>
                <AiOutlineHeart size={22} />
              </ListItemIcon>
              <ListItemText primary="Favorites" />
            </ListItem>
          </>
        )}
        { userInfo && userInfo.role==="vendor" && (
          <>
            <ListItem button component={Link} to="/vendor/brand" onClick={() => setDrawerOpen(false)}>
              <ListItemIcon>
                <FaTag size={22} />
              </ListItemIcon>
              <ListItemText primary="Brand" />
            </ListItem>
          </> 
        )}
        {userInfo && userInfo.role==="admin" && (
          <>
            <ListItem button component={Link} to="/admin/settings" onClick={() => setDrawerOpen(false)}>
              <ListItemIcon>
                <AiOutlineDashboard size={22} />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItem>
            <ListItem button component={Link} to="/admin/banner" onClick={() => setDrawerOpen(false)}>
              <ListItemIcon>
                <AiOutlineShoppingCart size={22} />
              </ListItemIcon>
              <ListItemText primary="Banner" />
            </ListItem>
            <ListItem button component={Link} to="/admin/userlist" onClick={() => setDrawerOpen(false)}>  
              <ListItemIcon>
                <FaUsers size={22} />
              </ListItemIcon>
              <ListItemText primary="Users" />
            </ListItem>
            <ListItem button component={Link} to="/admin/categorylist" onClick={() => setDrawerOpen(false)}>
              <ListItemIcon>
                <AiOutlineShopping size={22} />
              </ListItemIcon>
              <ListItemText primary="Category" />
            </ListItem>
          </>
        )}
        {userInfo && userInfo.role==="seller" && (
          <>
          <ListItem button component={Link} to="/" onClick={() => setDrawerOpen(false)}>
                  <ListItemIcon>
                    <AiOutlineDashboard size={22} />
                  </ListItemIcon>
                  <ListItemText primary="Dashboard" />
                </ListItem>
                <ListItem button component={Link} to="/seller/allproductslist" onClick={() => setDrawerOpen(false)}>
                  <ListItemIcon>
                    <MdProductionQuantityLimits size={22} />
                  </ListItemIcon>
                  <ListItemText primary="Products" />
                </ListItem>
                <ListItem button component={Link} to="/seller/orderlist" onClick={() => setDrawerOpen(false)}>
                  <ListItemIcon>
                    <FaList size={22} />
                  </ListItemIcon>
                  <ListItemText primary="Orders" />
                </ListItem>
          </>)}
        <Divider sx={{ my: 1 }} />
        {userInfo ? (
          <>
            <ListItem button component={Link} to="/profile" onClick={() => setDrawerOpen(false)}>
              <ListItemIcon>
                <AiOutlineProfile size={22} />
              </ListItemIcon>
              <ListItemText primary="Profile" />
            </ListItem>
            <ListItem button component={Link} to="/orders" onClick={() => setDrawerOpen(false)}>
              <ListItemIcon>
                <FaList size={22} />
              </ListItemIcon>
              <ListItemText primary="Orders" />
            </ListItem>
            <ListItem button onClick={handleLogout}>
              <ListItemIcon>
                <IoIosLogOut size={22} />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </>
        ) : (
          <>
            <ListItem button component={Link} to="/login" onClick={() => setDrawerOpen(false)}>
              <ListItemIcon>
                <AiOutlineLogin size={22} />
              </ListItemIcon>
              <ListItemText primary="Login" />
            </ListItem>
            <ListItem button component={Link} to="/register" onClick={() => setDrawerOpen(false)}>
              <ListItemIcon>
                <AiOutlineUserAdd size={22} />
              </ListItemIcon>
              <ListItemText primary="Register" />
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );
  
  return (
    <Slide in direction="down">
      <AppBar
        position="static"
        sx={{
          bgcolor: "#fff",
          color: "#222",
          boxShadow: "0 2px 16px rgba(0,0,0,0.13)",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          borderBottom: "3px solid #ec4899",
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: { xs: 1, md: 2 },
            flexWrap: "nowrap",
            minHeight: { xs: 64, md: 72 },
            px: { xs: 2, md: 3 },
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
              sx={{ mr: 1 }}
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
                fontWeight: "bold",
                letterSpacing: 2,
                fontFamily: "Montserrat, sans-serif",
                transition: "color 0.2s",
                "&:hover": { color: "secondary.main" },
                fontSize: { xs: "1.3rem", md: "2rem" },
              }}
              className="tracking-wider"
            >
              Nexus
            </Typography>
          </Box>

          {/* Search Bar */}
          <Box sx={{ 
            flex: { xs: 0, md: 2 }, 
            display: "flex", 
            justifyContent: "center",
            mx: { xs: 0, md: 2 },
            maxWidth: { xs: 0, md: "600px" },
            width: { xs: 0, md: "100%" },
            ...(isMobile && { display: "none" })
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
                    borderRadius: "10px",
                    border: "2px solid #d1d5db",
                    backgroundColor: "#ffffff",
                    transition: "border 0.3s, box-shadow 0.3s",
                    outline: "none",
                  },
                  suggestionsContainer: {
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    zIndex: 20,
                    backgroundColor: "#ffffff",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    borderRadius: "12px",
                    marginTop: "8px",
                    overflow: "hidden",
                    maxHeight: "360px",
                    overflowY: "auto",
                    transition: "all 0.3s ease-in-out",
                  },
                  suggestionsList: {
                    listStyle: "none",
                    margin: 0,
                    padding: 0,
                  },
                  suggestion: {
                    padding: "14px 20px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    transition: "background 0.3s ease-in-out",
                    fontSize: "15px",
                    borderBottom: "1px solid #f3f4f6",
                  },
                  suggestionHighlighted: {
                    backgroundColor: "#f0f9ff",
                  },
                }}
                className="transition-all"
              />
            </form>
          </Box>

          {/* Navigation & User Actions */}
          {!isMobile && (
            <Box
              sx={{
                flex: { xs: 1, md: "0 0 auto" },
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: 1,
                minWidth: "200px",
              }}
            >
              {/* Show Shop, Cart, Favorites only if user is logged in and not admin */}
              {userInfo && (userInfo.isAdmin === false || userInfo.role==="customer") && (
                <>
                  <Tooltip title="Shop">
                    <Button
                      component={Link}
                      to="/shop"
                      color="inherit"
                      sx={{
                        fontWeight: "bold",
                        mr: 1,
                        display: "flex",
                        alignItems: "center",
                        borderRadius: 2,
                        transition: "background 0.2s, color 0.2s",
                        "&:hover": { bgcolor: "secondary.main", color: "#fff" },
                      }}
                      startIcon={<AiOutlineShopping size={28} />}
                    >
                      Shop
                    </Button>
                  </Tooltip>
                  <Tooltip title="Cart">
                    <Button
                      component={Link}
                      to="/cart"
                      color="inherit"
                      sx={{
                        fontWeight: "bold",
                        mr: 1,
                        display: "flex",
                        alignItems: "center",
                        borderRadius: 2,
                        transition: "background 0.2s, color 0.2s",
                        "&:hover": { bgcolor: "secondary.main", color: "#fff" },
                      }}
                      startIcon={
                        <Badge
                          badgeContent={cartItems.length}
                          color="secondary"
                          overlap="circular"
                          sx={{
                            "& .MuiBadge-badge": {
                              fontSize: "0.75rem",
                              minWidth: 18,
                              height: 18,
                            },
                          }}
                        >
                          <AiOutlineShoppingCart size={28} />
                        </Badge>
                      }
                    >
                      Cart
                    </Button>
                  </Tooltip>
                  <Tooltip title="Favorites">
                    <Button
                      component={Link}
                      to="/favorite"
                      color="inherit"
                      sx={{
                        fontWeight: "bold",
                        mr: 1,
                        display: "flex",
                        alignItems: "center",
                        borderRadius: 2,
                        transition: "background 0.2s, color 0.2s",
                        "&:hover": { bgcolor: "secondary.main", color: "#fff" },
                      }}
                      startIcon={<AiOutlineHeart size={28} />}
                    >
                      Favorites
                    </Button>
                  </Tooltip>
                </>
              )}

              {userInfo ? (
                <>
                  <Tooltip title={userInfo.username}>
                    <IconButton onClick={handleAvatarClick} sx={{ ml: 2 }}>
                      <Avatar {...stringAvatar(userInfo.username)} />
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
                  >
                    {userInfo.role==="seller" ? (
                      <>
                        <MenuItem component={Link} to="/" onClick={handleMenuClose}>
                          <AiOutlineDashboard size={28} style={{ marginRight: 4 }} />
                          Dashboard
                        </MenuItem>
                        <MenuItem component={Link} to="/seller/allproductslist" onClick={handleMenuClose}>
                          <MdProductionQuantityLimits size={28} style={{ marginRight: 4 }} />
                          Products
                        </MenuItem>
                        <MenuItem component={Link} to="/seller/orderlist" onClick={handleMenuClose}>
                          <FaList size={28} style={{ marginRight: 4 }} />
                          Orders
                        </MenuItem>
                      </>
                    ):(
                      <>
                      {userInfo.role === "admin"  && (
                        <>
                        <MenuItem component={Link} to="/admin/categorylist" onClick={handleMenuClose}>
                          <AiOutlineShoppingCart size={28} style={{ marginRight: 4 }} />
                          Category
                        </MenuItem>
                
                        <MenuItem component={Link} to="/admin/userlist" onClick={handleMenuClose}>
                          <FaUsers size={28} style={{ marginRight: 4 }} />
                          Users
                        </MenuItem>
                        
                        <MenuItem component={Link} to="/admin/banner" onClick={handleMenuClose}>
                          <AiOutlineShopping size={28} style={{ marginRight: 4 }} />
                          Banner
                        </MenuItem>
                        <MenuItem component={Link} to="/admin/settings" onClick={handleMenuClose}>
                          <AiOutlineDashboard size={28} style={{ marginRight: 4 }} />
                          Settings
                        </MenuItem>
                        <MenuItem component={Link} to="/admin/offer" onClick={handleMenuClose}>
                          <FaTag size={28} style={{ marginRight: 4 }} />
                          Offer
                        </MenuItem>
                        <MenuItem component={Link} to="/admin/pages" onClick={handleMenuClose}>
                          <AiOutlineShopping size={28} style={{ marginRight: 4 }} />
                          Pages
                        </MenuItem>

                        </>
                        )}
                        {userInfo.role === "vendor" && (
                          <MenuItem component={Link} to="/vendor/brand" onClick={handleMenuClose}>
                            <FaTag size={28} style={{ marginRight: 4 }} />
                            Brand
                          </MenuItem>

                        )}

                        <Divider />
                      </>
                    )}
                    <MenuItem component={Link} to="/profile" onClick={handleMenuClose}>
                      <AiOutlineProfile size={28} style={{ marginRight: 4 }} />
                      Profile
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
                      <IoIosLogOut size={28} style={{ marginRight: 4 }} />
                      Logout
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <Tooltip title="Login">
                    <Button
                      component={Link}
                      to="/login"
                      color="primary"
                      sx={{
                        fontWeight: "bold",
                        ml: 2,
                        borderRadius: 2,
                        transition: "background 0.2s, color 0.2s",
                        "&:hover": { bgcolor: "secondary.main", color: "#fff" },
                      }}
                      startIcon={<AiOutlineLogin size={28} />}
                    >
                      Login
                    </Button>
                  </Tooltip>
                  <Tooltip title="Register">
                    <Button
                      component={Link}
                      to="/register"
                      color="primary"
                      sx={{
                        fontWeight: "bold",
                        ml: 1,
                        borderRadius: 2,
                        transition: "background 0.2s, color 0.2s",
                        "&:hover": { bgcolor: "secondary.main", color: "#fff" },
                      }}
                      startIcon={<AiOutlineUserAdd size={28} />}
                    >
                      Register
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
              bgcolor: "#fff",
              borderTopRightRadius: 24,
              borderBottomRightRadius: 24,
              boxShadow: "0 8px 32px 0 rgba(236,72,153,0.10)",
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