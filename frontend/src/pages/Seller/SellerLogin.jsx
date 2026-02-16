import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../components/Loader";
import { useLoginMutation } from "../../redux/api/usersApiSlice";
import { setCredentials } from "../../redux/features/auth/authSlice";
import { toast } from "react-toastify";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  IconButton,
  InputAdornment,
  Divider,
  Paper,
  Stack,
  useTheme,
  useMediaQuery,
  alpha
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Storefront,
  Login as LoginIcon
} from "@mui/icons-material";
import { logout } from "../../redux/features/auth/authSlice";
import { useLogoutMutation } from "../../redux/api/usersApiSlice";

const SellerLogin = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [logoutApiCall] = useLogoutMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [login, { isLoading }] = useLoginMutation();

  const { userInfo } = useSelector((state) => state.auth);

  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const redirect = sp.get("redirect") || "/";

  useEffect(() => {
    if (userInfo?.role === "seller") {
      navigate("/");
    }
  }, [navigate, userInfo]);

  const handleLogout = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate('/seller/login');
    } catch (error) {
      console.error(error);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email, password }).unwrap();
      if (res.role !== "seller" && res.role !== "admin") {
        toast.error("Access denied. Sellers only.");
        handleLogout();
        return;
      }
      dispatch(setCredentials({ ...res }));
      toast.success("Login successful");
      navigate("/");
    } catch (err) {
      toast.error(err?.data?.message || "Invalid email or password");
    }
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  return (
    <Box sx={{
      minHeight: "100vh",
      display: "flex",
      bgcolor: theme.palette.background.default
    }}>
      <Grid container>
        {/* Left Side - Image/Brand (Indigo/Purple for Sellers) */}
        <Grid item xs={12} md={6} sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: 'indigo.700', // Assuming custom color or theme variation
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
          color: 'white',
          p: 4,
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Ambient Background Effect */}
          <Box sx={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%)',
            zIndex: 1
          }} />

          <Box sx={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: 480 }}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
              <Storefront sx={{ fontSize: 80, opacity: 0.9 }} />
            </Box>
            <Typography variant="h2" fontWeight="800" sx={{ mb: 2 }}>
              Seller Portal
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
              Manage your inventory, track store performance, and reach millions of customers worldwide.
            </Typography>

            <Box
              component="img"
              src="/placeholder-seller-auth.png"
              onError={(e) => { e.target.style.display = 'none' }}
              sx={{ mt: 6, maxWidth: '80%', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))' }}
            />
          </Box>
        </Grid>

        {/* Right Side - Form */}
        <Grid item xs={12} md={6} sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: { xs: 3, sm: 6, md: 8 }
        }}>
          <Paper elevation={0} sx={{
            width: '100%',
            maxWidth: 480,
            p: { xs: 3, sm: 4 },
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.divider, 0.5)}`
          }}>
            <Stack spacing={3}>
              <Box sx={{ textAlign: 'center', mb: 1 }}>
                <Typography variant="h4" fontWeight="700" color="text.primary">
                  Seller Login
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Welcome back! Access your store dashboard
                </Typography>
              </Box>

              <form onSubmit={submitHandler}>
                <Stack spacing={2.5}>
                  <TextField
                    label="Email Address"
                    type="email"
                    fullWidth
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    variant="outlined"
                    InputProps={{
                      sx: { borderRadius: 2 }
                    }}
                  />

                  <TextField
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    fullWidth
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    variant="outlined"
                    InputProps={{
                      sx: { borderRadius: 2 },
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={isLoading}
                    startIcon={!isLoading && <LoginIcon />}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 600,
                      boxShadow: 2,
                      textTransform: 'none',
                      fontSize: '1rem',
                      background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                      color: 'white'
                    }}
                  >
                    {isLoading ? <Loader size={24} color="inherit" /> : "Login to Portal"}
                  </Button>
                </Stack>
              </form>

              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ fontSize: '0.875rem', mt: 2 }}
              >
                <Link to={`/forgot-password?redirect=${redirect}`} style={{ color: theme.palette.primary.main, textDecoration: 'none', fontWeight: 500 }}>
                  Forgot Password?
                </Link>
                <Box sx={{ color: 'text.secondary' }}>
                  New seller?{' '}
                  <Link to={`/seller/register?redirect=${redirect}`} style={{ color: theme.palette.primary.main, textDecoration: 'none', fontWeight: 600 }}>
                    Register Business
                  </Link>
                </Box>
              </Stack>

              <Divider sx={{ my: 1 }} />

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Not a seller? <Link to="/login" style={{ color: theme.palette.primary.main, textDecoration: 'none' }}>Customer Login</Link>
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SellerLogin;