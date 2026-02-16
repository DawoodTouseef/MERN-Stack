import { useState, useEffect } from "react";
import {
  Avatar,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
  Divider,
  Fade,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import StorefrontIcon from "@mui/icons-material/Storefront";
import { useDispatch, useSelector } from "react-redux";
import { useLoginMutation } from "../../redux/api/usersApiSlice";
import { setCredentials } from "../../redux/features/auth/authSlice";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { logout } from "../../redux/features/auth/authSlice";
import { useLogoutMutation } from "../../redux/api/usersApiSlice";

const VendorLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [logoutApiCall] = useLogoutMutation();
  const [login, { isLoading }] = useLoginMutation();
  const { userInfo } = useSelector((state) => state.auth);
  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const redirect = sp.get("redirect") || "/";

  useEffect(() => {
    if (userInfo?.role === "vendor") {
      navigate("/");
    }
  }, [navigate, userInfo]);

  const handleLogout = async () => {
    try {
      let api;
      if (userInfo.role === "vendor") {
        api = "/Vendor/login"
      }
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate(api || '/login');
    } catch (error) {
      // handle error
    }

  };
  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email, password }).unwrap();
      if (res.role !== "vendor" && res.role !== "admin") {
        toast.error("Access denied. Vendors only.");
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

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f8fafc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
        px: 2,
      }}
    >
      <Fade in>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 6 },
            borderRadius: 6,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            maxWidth: 450,
            bgcolor: "#fff",
            border: "1px solid #e2e8f0",
            position: "relative",
            overflow: "hidden",
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          }}
        >
          <Avatar
            sx={{
              mb: 2,
              bgcolor: "#f5f3ff",
              width: 72,
              height: 72,
              border: "2px solid #6366f1",
            }}
          >
            <StorefrontIcon sx={{ color: "#6366f1", fontSize: 40 }} />
          </Avatar>
          <Typography
            component="h1"
            variant="h4"
            fontWeight={900}
            sx={{
              color: "#1e293b",
              mb: 1,
              textAlign: "center",
            }}
          >
            Vendor Login
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "#64748b",
              mb: 4,
              textAlign: "center",
              fontWeight: 500,
            }}
          >
            Manage your store with modern analytics
          </Typography>

          <Box
            component="form"
            onSubmit={submitHandler}
            sx={{ width: "100%" }}
          >
            <TextField
              label="Email Address"
              fullWidth
              required
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  bgcolor: "#f8fafc",
                }
              }}
              autoComplete="email"
            />
            <TextField
              label="Password"
              type={showPass ? "text" : "password"}
              fullWidth
              required
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  bgcolor: "#f8fafc",
                },
                mt: 2,
              }}
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPass((show) => !show)}
                      edge="end"
                      sx={{ color: "#6366f1" }}
                    >
                      {showPass ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 4,
                py: 2,
                fontWeight: 800,
                fontSize: "1rem",
                borderRadius: 3,
                background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                boxShadow: "0 4px 12px rgba(99, 102, 241, 0.2)",
                textTransform: "none",
                "&:hover": {
                  background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
                  transform: "translateY(-1px)",
                },
                transition: "all 0.2s",
              }}
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Continue to Dashboard"}
            </Button>
            <Box sx={{ mt: 4, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                New Vendor?{" "}
                <Link
                  to={redirect ? `/vendor/register?redirect=${redirect}` : "/vendor/register"}
                  style={{
                    color: "#6366f1",
                    textDecoration: "none",
                    fontWeight: 700,
                  }}
                >
                  Create an account
                </Link>
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <Link
                  to={redirect ? `/forgot-password?redirect=${redirect}` : "/forgot-password"}
                  style={{
                    color: "#64748b",
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  Forgot password?
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Fade>
    </Box>
  );
};

export default VendorLogin;