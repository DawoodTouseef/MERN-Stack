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
  Google, 
  Microsoft,
  Login as LoginIcon
} from "@mui/icons-material";
import { logout } from "../../redux/features/auth/authSlice";
import { useLogoutMutation } from "../../redux/api/usersApiSlice";

// Read OAuth client IDs from env
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const MICROSOFT_CLIENT_ID = import.meta.env.VITE_MICROSOFT_CLIENT_ID;

const Login = () => {
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
    if (userInfo?.role === "customer") {
      navigate("/");
    }
  }, [navigate, userInfo]);

  const handleLogout = async () => {
    try {
      let api;
      if (userInfo.role === "vendor") {
        api = "/vendor/login"
      }
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate(api || '/login');
    } catch (error) {
      console.error(error);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email, password }).unwrap();
      if (res.role !== "customer") {
        toast.error("Access denied. Customer only.");
        handleLogout();
        return;
      }
      dispatch(setCredentials({ ...res }));
      navigate(redirect);
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleGoogleAuth = () => {
    if (!GOOGLE_CLIENT_ID) return;
    const redirectUri = window.location.origin + "/auth/google/callback";
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=openid%20email%20profile`;
  };

  const handleMicrosoftAuth = () => {
    if (!MICROSOFT_CLIENT_ID) return;
    const redirectUri = window.location.origin + "/auth/microsoft/callback";
    window.location.href = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${MICROSOFT_CLIENT_ID}&response_type=code&redirect_uri=${redirectUri}&scope=openid%20email%20profile%20User.Read`;
  };

  return (
    <Box sx={{ 
      minHeight: "100vh", 
      display: "flex",
      bgcolor: theme.palette.background.default
    }}>
      <Grid container>
        {/* Left Side - Image/Brand */}
        <Grid item xs={12} md={6} sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: 'primary.main',
          color: 'white',
          p: 4,
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Ambient Background Effect */}
          <Box sx={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 100%)',
            zIndex: 1
          }} />
          
          <Box sx={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: 480 }}>
            <Typography variant="h2" fontWeight="800" sx={{ mb: 2 }}>
              Welcome Back!
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
              Access your account to manage orders, track shipments, and explore the latest products.
            </Typography>
            
            <Box 
              component="img" 
              src="/placeholder-auth.png" 
              onError={(e) => { e.target.style.display = 'none' }} // Hide if missing
              sx={{ mt: 6, maxWidth: '80%', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))' }} 
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
                  Sign In
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Enter your credentials to access your account
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
                      fontSize: '1rem'
                    }}
                  >
                    {isLoading ? <Loader size={24} color="inherit" /> : "Sign In"}
                  </Button>
                </Stack>
              </form>

              {(GOOGLE_CLIENT_ID || MICROSOFT_CLIENT_ID) && (
                <Box>
                  <Divider sx={{ my: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
                      OR CONTINUE WITH
                    </Typography>
                  </Divider>
                  
                  <Stack spacing={1.5}>
                    {GOOGLE_CLIENT_ID && (
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<Google />}
                        onClick={handleGoogleAuth}
                        sx={{ 
                          py: 1.2, 
                          borderRadius: 2,
                          textTransform: 'none',
                          color: 'text.primary',
                          borderColor: alpha(theme.palette.divider, 0.8)
                        }}
                      >
                        Google
                      </Button>
                    )}
                    {MICROSOFT_CLIENT_ID && (
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<Microsoft />}
                        onClick={handleMicrosoftAuth}
                        sx={{ 
                          py: 1.2, 
                          borderRadius: 2,
                          textTransform: 'none',
                          color: 'text.primary',
                          borderColor: alpha(theme.palette.divider, 0.8)
                        }}
                      >
                        Microsoft
                      </Button>
                    )}
                  </Stack>
                </Box>
              )}

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
                  New here?{' '}
                  <Link to={`/register?redirect=${redirect}`} style={{ color: theme.palette.primary.main, textDecoration: 'none', fontWeight: 600 }}>
                    Create Account
                  </Link>
                </Box>
              </Stack>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Login;