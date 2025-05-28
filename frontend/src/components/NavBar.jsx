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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
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

const NavBar = ({
  placeholder = "Search products...",
  initialValue = "",
  onSearch,
}) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [anchorEl, setAnchorEl] = useState(null);
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

  return (
    <AppBar
      position="static"
      color="default"
      sx={{
        mb: 2,
        boxShadow: 1,
        background: "linear-gradient(90deg, #f3e7e9 0%, #e3eeff 100%)",
      }}
      className="shadow"
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
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
            }}
            className="tracking-wider"
          >
            Nexus
          </Typography>
        </Box>

        {/* Search Bar */}
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

        {/* Navigation & User Actions */}
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
          {userInfo && userInfo.isAdmin === false && (
            <>
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
                    <MenuItem component={Link} to="/admin/dashboard" onClick={handleMenuClose}>
                      <AiOutlineDashboard size={28} style={{ marginRight: 4 }} />
                      Dashboard
                    </MenuItem>
                    <MenuItem component={Link} to="/admin/allproductslist" onClick={handleMenuClose}>
                      <MdProductionQuantityLimits size={28} style={{ marginRight: 4 }} />
                      Products
                    </MenuItem>
                    <MenuItem component={Link} to="/admin/categorylist" onClick={handleMenuClose}>
                      <AiOutlineShoppingCart size={28} style={{ marginRight: 4 }} />
                      Category
                    </MenuItem>
                    <MenuItem component={Link} to="/admin/orderlist" onClick={handleMenuClose}>
                      <FaList size={28} style={{ marginRight: 4 }} />
                      Orders
                    </MenuItem>
                    <MenuItem component={Link} to="/admin/userlist" onClick={handleMenuClose}>
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
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;