import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../components/Loader";
import { useLoginMutation } from "../../redux/api/usersApiSlice";
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
} from "@mui/material";
import { Visibility, VisibilityOff, Google, Microsoft } from "@mui/icons-material";
import { logout } from "../../redux/features/auth/authSlice";
import { useLogoutMutation } from "../../redux/api/usersApiSlice";

// Read OAuth client IDs from env
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const MICROSOFT_CLIENT_ID = import.meta.env.VITE_MICROSOFT_CLIENT_ID;

const Login = () => {
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
      if (userInfo?.role==="customer") {
        navigate("/");
      }
    }, [navigate, userInfo]);
  
  const handleLogout = async () => {
        try {
          let api;
          if (userInfo.role==="vendor"){
              api="/vendor/login"
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

  // Google Auth Handler
  const handleGoogleAuth = () => {
    if (!GOOGLE_CLIENT_ID) return;
    const redirectUri = window.location.origin + "/auth/google/callback";
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=openid%20email%20profile`;
  };

  // Microsoft Auth Handler
  const handleMicrosoftAuth = () => {
    if (!MICROSOFT_CLIENT_ID) return;
    const redirectUri = window.location.origin + "/auth/microsoft/callback";
    window.location.href = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${MICROSOFT_CLIENT_ID}&response_type=code&redirect_uri=${redirectUri}&scope=openid%20email%20profile%20User.Read`;
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#181818",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      className="min-h-screen"
    >
      <Grid container sx={{ maxWidth: 1000, boxShadow: 6, borderRadius: 4, overflow: "hidden" }}>
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 4,
            bgcolor: "#181818",
          }}
        >
          <Paper
            elevation={6}
            sx={{
              p: 5,
              width: "100%",
              maxWidth: 420,
              bgcolor: "#222",
              color: "#fff",
              borderRadius: 4,
              boxShadow: "0 8px 32px 0 rgba(236,72,153,0.10)",
            }}
            className="shadow-xl"
          >
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{
                mb: 3,
                color: "#fff",
                letterSpacing: 1,
                textAlign: "center",
                textShadow: "2px 2px 8px #f3e7e9",
              }}
            >
              Sign In
            </Typography>
            <form onSubmit={submitHandler}>
              <TextField
                label="Email Address"
                type="email"
                fullWidth
                required
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{
                  input: { color: "#fff" },
                  label: { color: "#fff" },
                  mb: 2,
                  bgcolor: "#18181b",
                  borderRadius: 2,
                }}
                InputLabelProps={{ style: { color: "#fff" } }}
              />
              <TextField
                label="Password"
                type={showPassword ? "text" : "password"}
                fullWidth
                required
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{
                  input: { color: "#fff" },
                  label: { color: "#fff" },
                  mb: 2,
                  bgcolor: "#18181b",
                  borderRadius: 2,
                }}
                InputLabelProps={{ style: { color: "#fff" } }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        onClick={handleClickShowPassword}
                        edge="end"
                        sx={{ color: "#fff" }}
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
                color="secondary"
                fullWidth
                sx={{
                  mt: 2,
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                  borderRadius: 2,
                  letterSpacing: 1,
                  py: 1.3,
                  boxShadow: 3,
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "scale(1.04)",
                    boxShadow: 6,
                  },
                }}
                className="hover:scale-105 hover:shadow-2xl transition-transform duration-200"
                disabled={isLoading}
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
              {isLoading && (
                <Box sx={{ mt: 2 }}>
                  <Loader />
                </Box>
              )}
            </form>
            {(GOOGLE_CLIENT_ID || MICROSOFT_CLIENT_ID) && (
              <>
                <Divider sx={{ my: 3, bgcolor: "#bbb" }}>
                  <Typography color="#bbb" fontWeight={600} fontSize="1rem">
                    OR
                  </Typography>
                </Divider>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {GOOGLE_CLIENT_ID && (
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<Google />}
                      onClick={handleGoogleAuth}
                      sx={{
                        borderRadius: 2,
                        fontWeight: 700,
                        color: "#fff",
                        borderColor: "#fff",
                        bgcolor: "#18181b",
                        "&:hover": {
                          bgcolor: "#fff",
                          color: "#18181b",
                          borderColor: "#ec4899",
                        },
                        transition: "all 0.2s",
                      }}
                      className="hover:bg-white hover:text-black"
                    >
                      Sign in with Google
                    </Button>
                  )}
                  {MICROSOFT_CLIENT_ID && (
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<Microsoft />}
                      onClick={handleMicrosoftAuth}
                      sx={{
                        borderRadius: 2,
                        fontWeight: 700,
                        color: "#fff",
                        borderColor: "#fff",
                        bgcolor: "#18181b",
                        "&:hover": {
                          bgcolor: "#fff",
                          color: "#18181b",
                          borderColor: "#6366f1",
                        },
                        transition: "all 0.2s",
                      }}
                      className="hover:bg-white hover:text-black"
                    >
                      Sign in with Microsoft
                    </Button>
                  )}
                </Box>
              </>
            )}
            <Box sx={{ mt: 3, textAlign: "center" }}>
              <Typography variant="body2" color="#ccc">
                Don't have an account?{" "}
                <Link to={`/register?redirect=${redirect}`} style={{ color: "#ec4899", textDecoration: "underline" }}>
                  Register
                </Link>
              </Typography>
              <Typography variant="body2" color="#ccc" mt={1}>
                <Link to={`/forgot-password?redirect=${redirect}`} style={{ color: "#ec4899", textDecoration: "underline" }}>
                  Forgot Password
                </Link>
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Login;