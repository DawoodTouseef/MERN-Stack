import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../components/Loader";
import { useRegisterMutation } from "../../redux/api/usersApiSlice";
import { setCredentials } from "../../redux/features/auth/authSlice";
import { toast } from "react-toastify";
import DocumentTitle from "../../components/DocumentTitle";
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
  alpha,
  FormControlLabel,
  Checkbox
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  PersonAdd as PersonAddIcon
} from "@mui/icons-material";

const Register = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [username, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [register, { isLoading }] = useRegisterMutation();

  const { userInfo } = useSelector((state) => state.auth);

  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const redirect = sp.get("redirect") || "/";

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const res = await register({
        username,
        email,
        password,
        phone,
        newsletterSubscribed,
      }).unwrap();

      dispatch(setCredentials({ ...res }));
      navigate(redirect);
      toast.success("User successfully registered");
    } catch (err) {
      toast.error(err?.data?.message || "Registration failed");
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
        {/* Left Side - Image/Brand */}
        <Grid size={{ xs: 12, md: 6 }} sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: 'secondary.main', // Different color for register
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
              Join Nexus Mart
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
              Create an account to start shopping, saving favorites, and receiving personalized recommendations.
            </Typography>

            <Box
              component="img"
              src="/placeholder-auth-reg.png"
              onError={(e) => { e.target.style.display = 'none' }} // Hide if missing
              sx={{ mt: 6, maxWidth: '80%', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))' }}
            />
          </Box>
        </Grid>

        {/* Right Side - Form */}
        <Grid size={{ xs: 12, md: 6 }} sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: { xs: 3, sm: 6, md: 8 },
          overflowY: 'auto'
        }}>
          <Paper elevation={0} sx={{
            width: '100%',
            maxWidth: 520,
            p: { xs: 3, sm: 4 },
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.divider, 0.5)}`
          }}>
            <Stack spacing={3}>
              <Box sx={{ textAlign: 'center', mb: 1 }}>
                <Typography variant="h4" fontWeight="700" color="text.primary">
                  Create Account
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Join thousands of shoppers and get the best deals
                </Typography>
              </Box>

              <form onSubmit={submitHandler}>
                <Stack spacing={2}>
                  <TextField
                    label="Full Name"
                    type="text"
                    fullWidth
                    required
                    value={username}
                    onChange={(e) => setName(e.target.value)}
                    variant="outlined"
                    InputProps={{ sx: { borderRadius: 2 } }}
                  />

                  <TextField
                    label="Email Address"
                    type="email"
                    fullWidth
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    variant="outlined"
                    InputProps={{ sx: { borderRadius: 2 } }}
                  />

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
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
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        label="Confirm Password"
                        type={showPassword ? "text" : "password"}
                        fullWidth
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        variant="outlined"
                        InputProps={{ sx: { borderRadius: 2 } }}
                      />
                    </Grid>
                  </Grid>

                  <TextField
                    label="Phone Number"
                    type="tel"
                    fullWidth
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    variant="outlined"
                    InputProps={{ sx: { borderRadius: 2 } }}
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={newsletterSubscribed}
                        onChange={(e) => setNewsletterSubscribed(e.target.checked)}
                        color="primary"
                      />
                    }
                    label={<Typography variant="body2" color="text.secondary">I would like to receive newsletters and promotional offers</Typography>}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={isLoading}
                    startIcon={!isLoading && <PersonAddIcon />}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 600,
                      boxShadow: 2,
                      textTransform: 'none',
                      fontSize: '1rem',
                      mt: 1
                    }}
                  >
                    {isLoading ? <Loader size={24} color="inherit" /> : "Register"}
                  </Button>
                </Stack>
              </form>

              <Divider sx={{ my: 1 }} />

              <Box sx={{ textAlign: "center", color: 'text.secondary' }}>
                Already have an account?{' '}
                <Link
                  to={redirect ? `/login?redirect=${redirect}` : "/login"}
                  style={{
                    color: theme.palette.primary.main,
                    textDecoration: 'none',
                    fontWeight: 600
                  }}
                >
                  Sign In
                </Link>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Register;
