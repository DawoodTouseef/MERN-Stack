import { useState } from "react";
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

const NavBar = ({
  placeholder = "Search products...",
  initialValue = "",
  onSearch,
}) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width:900px)");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);
  const [logoutApiCall] = useLogoutMutation();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm.trim());
    } else if (searchTerm.trim()) {
      navigate(`/search/${searchTerm.trim()}`);
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
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate("/login");
    } catch (error) {
      // handle error
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

  // Drawer content for mobile
  const drawerContent = (
    <Box sx={{ width: 260, pt: 2 }}>
      <List>
        <ListItem>
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
          >
            Nexus
          </Typography>
        </ListItem>
        <Divider sx={{ my: 1 }} />
        {userInfo && userInfo.isAdmin === false && (
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
        <Divider sx={{ my: 1 }} />
        {userInfo ? (
          <>
            {userInfo.isAdmin && (
              <>
                <ListItem button component={Link} to="/vendor/dashboard" onClick={() => setDrawerOpen(false)}>
                  <ListItemIcon>
                    <AiOutlineDashboard size={22} />
                  </ListItemIcon>
                  <ListItemText primary="Dashboard" />
                </ListItem>
                <ListItem button component={Link} to="/vendor/allproductslist" onClick={() => setDrawerOpen(false)}>
                  <ListItemIcon>
                    <MdProductionQuantityLimits size={22} />
                  </ListItemIcon>
                  <ListItemText primary="Products" />
                </ListItem>
                <ListItem button component={Link} to="/vendor/categorylist" onClick={() => setDrawerOpen(false)}>
                  <ListItemIcon>
                    <AiOutlineShoppingCart size={22} />
                  </ListItemIcon>
                  <ListItemText primary="Category" />
                </ListItem>
                <ListItem button component={Link} to="/vendor/orderlist" onClick={() => setDrawerOpen(false)}>
                  <ListItemIcon>
                    <FaList size={22} />
                  </ListItemIcon>
                  <ListItemText primary="Orders" />
                </ListItem>
                <ListItem button component={Link} to="/vendor/userlist" onClick={() => setDrawerOpen(false)}>
                  <ListItemIcon>
                    <FaUsers size={22} />
                  </ListItemIcon>
                  <ListItemText primary="Users" />
                </ListItem>
                <Divider sx={{ my: 1 }} />
              </>
            )}
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
            gap: 2,
            flexWrap: "wrap",
            minHeight: { xs: 60, md: 72 },
            px: { xs: 1, md: 3 },
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
          <Box sx={{ flex: 1 }}>
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
          {!isMobile && (
            <Box sx={{ flex: 2, display: "flex", justifyContent: "center" }}>
              <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: 500 }}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 1,
                    bgcolor: "#fff",
                    borderRadius: 4,
                    boxShadow: "0 2px 12px 0 rgba(0,0,0,0.08)",
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                  }}
                  className="shadow-md"
                >
                  <TextField
                    fullWidth
                    variant="standard"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      disableUnderline: true,
                      startAdornment: (
                        <InputAdornment position="start">
                          <IconButton edge="start" type="submit">
                            <SearchIcon sx={{ color: "secondary.main" }} />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      bgcolor: "#f3f4f6",
                      borderRadius: 2,
                      px: 1,
                      "& input": { color: "#222", fontWeight: 500 },
                    }}
                    className="transition-all"
                  />
                </Paper>
              </form>
            </Box>
          )}

          {/* Navigation & User Actions */}
          {!isMobile && (
            <Box
              sx={{
                flex: 1,
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: 1,
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
                    {userInfo.isAdmin && (
                      <>
                        <MenuItem component={Link} to="/vendor/dashboard" onClick={handleMenuClose}>
                          <AiOutlineDashboard size={28} style={{ marginRight: 4 }} />
                          Dashboard
                        </MenuItem>
                        <MenuItem component={Link} to="/vendor/allproductslist" onClick={handleMenuClose}>
                          <MdProductionQuantityLimits size={28} style={{ marginRight: 4 }} />
                          Products
                        </MenuItem>
                        <MenuItem component={Link} to="/vendor/categorylist" onClick={handleMenuClose}>
                          <AiOutlineShoppingCart size={28} style={{ marginRight: 4 }} />
                          Category
                        </MenuItem>
                        <MenuItem component={Link} to="/vendor/brand" onClick={handleMenuClose}>
                          <FaTag size={28} style={{ marginRight: 4 }} />
                          Brand
                        </MenuItem>
                        <MenuItem component={Link} to="/vendor/orderlist" onClick={handleMenuClose}>
                          <FaList size={28} style={{ marginRight: 4 }} />
                          Orders
                        </MenuItem>
                        <MenuItem component={Link} to="/vendor/userlist" onClick={handleMenuClose}>
                          <FaUsers size={28} style={{ marginRight: 4 }} />
                          Users
                        </MenuItem>
                        <Divider />
                      </>
                    )}
                    <MenuItem component={Link} to="/profile" onClick={handleMenuClose}>
                      <AiOutlineProfile size={28} style={{ marginRight: 4 }} />
                      Profile
                    </MenuItem>
                    <MenuItem component={Link} to="/orders" onClick={handleMenuClose}>
                      <FaList size={28} style={{ marginRight: 4 }} />
                      Orders
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