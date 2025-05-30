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

const VendorLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [login, { isLoading }] = useLoginMutation();
  const { userInfo } = useSelector((state) => state.auth);
  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const redirect = sp.get("redirect") || "/";

  useEffect(() => {
    if (userInfo?.isAdmin) {
      navigate("/vendor/dashboard");
    }
  }, [navigate, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email, password }).unwrap();
      if (!res.isAdmin) {
        toast.error("Access denied. Admins only.");
        return;
      }
      dispatch(setCredentials({ ...res }));
      toast.success("Login successful");
      navigate("/vendor/dashboard");
    } catch (err) {
      toast.error(err?.data?.message || "Invalid email or password");
    }
  };

  return (
    <Grid
      container
      component="main"
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Grid item xs={11} sm={8} md={4}>
        <Fade in>
          <Paper
            elevation={12}
            sx={{
              p: 4,
              borderRadius: 5,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              background: "rgba(24,24,27,0.98)",
              color: "#fff",
              boxShadow: "0 8px 32px 0 rgba(236,72,153,0.18)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: -60,
                left: -60,
                width: 160,
                height: 160,
                bgcolor: "#ec4899",
                opacity: 0.15,
                borderRadius: "50%",
                zIndex: 0,
              }}
            />
            <Avatar
              sx={{
                m: 1,
                bgcolor: "#fff",
                width: 64,
                height: 64,
                boxShadow: 3,
                border: "3px solid #ec4899",
                zIndex: 1,
              }}
            >
              <StorefrontIcon sx={{ color: "#ec4899", fontSize: 38 }} />
            </Avatar>
            <Typography
              component="h1"
              variant="h4"
              fontWeight={800}
              sx={{
                letterSpacing: 2,
                color: "#fff",
                mt: 1,
                mb: 1,
                zIndex: 1,
                textShadow: "2px 2px 8px #ec4899",
              }}
            >
              Vendor Login
            </Typography>
            <Typography
              variant="subtitle2"
              sx={{
                color: "#a1a1aa",
                mb: 2,
                zIndex: 1,
                fontWeight: 500,
                textAlign: "center",
              }}
            >
              Welcome back! Please login to your vendor dashboard.
            </Typography>
            <Divider sx={{ width: "100%", mb: 2, bgcolor: "#ec4899", opacity: 0.3 }} />
            <Box
              component="form"
              onSubmit={submitHandler}
              sx={{ mt: 1, width: "100%", zIndex: 1 }}
            >
              <TextField
                label="Email Address"
                fullWidth
                required
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{
                  input: { color: "#fff" },
                  label: { color: "#fff" },
                  bgcolor: "#232336",
                  borderRadius: 2,
                  mb: 2,
                }}
                InputLabelProps={{ style: { color: "#fff" } }}
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
                  input: { color: "#fff" },
                  label: { color: "#fff" },
                  bgcolor: "#232336",
                  borderRadius: 2,
                  mb: 2,
                }}
                InputLabelProps={{ style: { color: "#fff" } }}
                autoComplete="current-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPass((show) => !show)}
                        edge="end"
                        sx={{ color: "#ec4899" }}
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
                color="secondary"
                sx={{
                  mt: 3,
                  py: 1.5,
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  borderRadius: 3,
                  background: "linear-gradient(90deg, #6366f1 0%, #ec4899 100%)",
                  boxShadow: 2,
                  letterSpacing: 1,
                  textTransform: "none",
                  "&:hover": {
                    background: "linear-gradient(90deg, #ec4899 0%, #6366f1 100%)",
                  },
                }}
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
              <Box sx={{ mt: 3, textAlign: "center" }}>
                <Typography variant="body2" color="#fff">
                  New Vendor?{" "}
                  <Link
                    to={redirect ? `/vendor/register?redirect=${redirect}` : "/vendor/register"}
                    style={{
                      color: "#ec4899",
                      textDecoration: "underline",
                      fontWeight: 600,
                    }}
                  >
                    Register
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Fade>
      </Grid>
    </Grid>
  );
};

export default VendorLogin;