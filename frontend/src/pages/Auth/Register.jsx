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
  FormControlLabel,
  Checkbox
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const Register = () => {
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
    } else {
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
    }
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);

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
              Register
            </Typography>
            <form onSubmit={submitHandler}>
              <TextField
                label="Name"
                type="text"
                fullWidth
                required
                margin="normal"
                value={username}
                onChange={(e) => setName(e.target.value)}
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
              <TextField
                label="Confirm Password"
                type={showPassword ? "text" : "password"}
                fullWidth
                required
                margin="normal"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              <TextField
  label="Phone Number"
  type="tel"
  fullWidth
  margin="normal"
  value={phone}
  onChange={(e) => setPhone(e.target.value)}
  sx={{
    input: { color: "#fff" },
    label: { color: "#fff" },
    mb: 2,
    bgcolor: "#18181b",
    borderRadius: 2,
  }}
  InputLabelProps={{ style: { color: "#fff" } }}
/>

<FormControlLabel
  control={
    <Checkbox
      checked={newsletterSubscribed}
      onChange={(e) => setNewsletterSubscribed(e.target.checked)}
      sx={{ color: "#fff" }}
    />
  }
  label={<Typography sx={{ color: "#fff" }}>Subscribe to Newsletter</Typography>}
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
                {isLoading ? "Registering..." : "Register"}
              </Button>
              {isLoading && (
                <Box sx={{ mt: 2 }}>
                  <Loader />
                </Box>
              )}
            </form>
            <Divider sx={{ my: 3, bgcolor: "#bbb" }} />
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" color="#fff">
                Already have an account?{" "}
                <Link
                  to={redirect ? `/login?redirect=${redirect}` : "/login"}
                  style={{
                    color: "#f50057",
                    textDecoration: "underline",
                  }}
                >
                  Login
                </Link>
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid
          item
          md={6}
          sx={{
            display: { xs: "none", md: "block" },
            backgroundImage:
              "url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1964&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderRadius: "0 16px 16px 0",
          }}
        />
      </Grid>
    </Box>
  );
};

export default Register;
