import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../components/Loader";
import { useRegisterMutation } from "../../redux/api/usersApiSlice";
import { setCredentials } from "../../redux/features/auth/authSlice";
import { toast } from "react-toastify";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  IconButton,
  InputAdornment,
  Divider,
  Fade,
  Avatar,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Business,
  LocationOn,
  Assignment,
  Badge,
  Phone,
  Storefront,
  Email,
  Person,
} from "@mui/icons-material";
import { APP_NAME } from "../../redux/constants";

const VendorRegister = () => {
  // Basic user info
  const [username, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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

    // Validation
    if (!username || !email || !phone || !password || !confirmPassword) {
      toast.error("Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const res = await register({
        username,
        email,
        phone,
        password,
        role: "vendor",
      }).unwrap();

      dispatch(setCredentials({ ...res }));
      toast.success("Registration successful! Please create your organization.");

      // Redirect to create organization page
      navigate("/vendor/create-organization");
    } catch (err) {
      toast.error(err?.data?.message || "Registration failed");
    }
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f8fafc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 8,
        px: 2,
      }}
    >
      <Grid container sx={{ maxWidth: 1100, borderRadius: 6, overflow: 'hidden', border: '1px solid #e2e8f0', bgcolor: '#fff', boxShadow: '0 10px 40px rgba(0,0,0,0.04)' }}>
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: { xs: 3, md: 6 },
            position: "relative",
          }}
        >
          <Fade in>
            <Box sx={{ width: "100%", maxWidth: 440 }}>
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 4 }}>
                <Avatar
                  sx={{
                    bgcolor: "#f5f3ff",
                    width: 72,
                    height: 72,
                    border: "2px solid #6366f1",
                    mb: 2,
                  }}
                >
                  <Storefront sx={{ color: "#6366f1", fontSize: 40 }} />
                </Avatar>
                <Typography
                  variant="h4"
                  fontWeight={900}
                  sx={{
                    mb: 1,
                    color: "#1e293b",
                    textAlign: "center",
                  }}
                >
                  Become a Vendor
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "#64748b",
                    mb: 2,
                    fontWeight: 500,
                    textAlign: "center",
                  }}
                >
                  Join {APP_NAME} and start selling today
                </Typography>
              </Box>

              <form onSubmit={submitHandler}>
                <TextField
                  label="Full Name"
                  fullWidth
                  required
                  margin="normal"
                  value={username}
                  onChange={(e) => setName(e.target.value)}
                  sx={textFieldStyle}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: "#6366f1" }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Email Address"
                  type="email"
                  fullWidth
                  required
                  margin="normal"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  sx={textFieldStyle}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: "#6366f1" }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Phone Number"
                  type="tel"
                  fullWidth
                  required
                  margin="normal"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  sx={textFieldStyle}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone sx={{ color: "#6366f1" }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Create Password"
                  type={showPassword ? "text" : "password"}
                  fullWidth
                  required
                  margin="normal"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  sx={textFieldStyle}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleClickShowPassword}
                          edge="end"
                          sx={{ color: "#6366f1" }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Confirm Password"
                  type={showPassword ? "text" : "password"}
                  fullWidth
                  required
                  margin="normal"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  sx={textFieldStyle}
                />
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={submitButtonStyle}
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Register as Vendor"}
                </Button>
                {isLoading && (
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Setting up your vendor account...
                    </Typography>
                  </Box>
                )}
              </form>

              <Divider sx={{ my: 4, borderColor: "#f1f5f9" }} />
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", fontWeight: 500 }}>
                Already a vendor?{" "}
                <Link
                  to={redirect ? `/vendor/login?redirect=${redirect}` : "/vendor/login"}
                  style={{ color: "#6366f1", textDecoration: "none", fontWeight: 700 }}
                >
                  Sign in here
                </Link>
              </Typography>
            </Box>
          </Fade>
        </Grid>
        <Grid
          item
          md={6}
          sx={{
            display: { xs: "none", md: "block" },
            backgroundImage:
              "url('https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "relative",
            "&:after": {
              content: '""',
              position: "absolute",
              inset: 0,
              background: "linear-gradient(180deg, rgba(99,102,241,0.2) 0%, rgba(99,102,241,0.4) 100%)",
            },
          }}
        >
          <Box
            sx={{
              position: "absolute",
              bottom: 40,
              left: 40,
              right: 40,
              zIndex: 2,
              color: "#fff",
              p: 3,
              bgcolor: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(12px)",
              borderRadius: 4,
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <Typography variant="h5" fontWeight={800} gutterBottom>
              Start Your Business Journey
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              After registration, you'll create your organization and verify your business documents to unlock full access.
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

const textFieldStyle = {
  mb: 2,
  '& .MuiOutlinedInput-root': {
    borderRadius: 3,
    bgcolor: "#f8fafc",
  }
};

const submitButtonStyle = {
  mt: 2,
  fontWeight: 800,
  fontSize: "1rem",
  borderRadius: 3,
  py: 1.5,
  boxShadow: "0 4px 12px rgba(99, 102, 241, 0.2)",
  background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
  textTransform: "none",
  transition: "all 0.2s",
  "&:hover": {
    background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
    transform: "translateY(-1px)",
  },
};

export default VendorRegister;