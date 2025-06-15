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
  Stepper,
  Step,
  StepLabel,
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

// filepath: e:\Intern\MERN-E-Commerce-Store\frontend\src\pages\Vendor\VendorRegister.jsx
const VendorRegister = () => {
  // Stepper state
  const [activeStep, setActiveStep] = useState(0);

  // Step 1: User Info
  const [username, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Step 2: Business Info
  const [companyName, setCompanyName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [gstId, setGstId] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");

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

  // Step 1 validation
  const handleNext = (e) => {
    e.preventDefault();
    if (!username || !email || !phone || !password || !confirmPassword) {
      toast.error("Please fill all fields");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setActiveStep(1);
  };

  // Step 2 submit
  const submitHandler = async (e) => {
    e.preventDefault();
    if (!companyName || !taxId || !gstId || !businessAddress) {
      toast.error("Please fill all business fields");
      return;
    }
    try {
      const res = await register({
        username,
        email,
        password,
        role: "vendor",
        vendorProfile: {
          companyName,
          taxId,
          gstId,
          address: businessAddress,
        },
      }).unwrap();
      dispatch(setCredentials({ ...res }));
      navigate(redirect);
      toast.success("Vendor successfully registered");
    } catch (err) {
      toast.error(err?.data?.message || "Registration failed");
    }
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
      }}
    >
      <Grid container sx={{ maxWidth: 1100, boxShadow: 8, borderRadius: 4 }}>
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: { xs: 2, md: 5 },
            bgcolor: "rgba(24,24,27,0.98)",
            borderRadius: { xs: "16px 16px 0 0", md: "16px 0 0 16px" },
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative circle */}
          <Box
            sx={{
              position: "absolute",
              top: -60,
              left: -60,
              width: 180,
              height: 180,
              bgcolor: "#ec4899",
              opacity: 0.13,
              borderRadius: "50%",
              zIndex: 0,
            }}
          />
          <Fade in>
            <Paper
              elevation={12}
              sx={{
                p: { xs: 3, md: 5 },
                width: "100%",
                maxWidth: 440,
                bgcolor: "rgba(34,34,40,0.98)",
                color: "#fff",
                borderRadius: 4,
                boxShadow: "0 8px 32px 0 rgba(236,72,153,0.13)",
                zIndex: 1,
                position: "relative",
              }}
            >
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: "#fff",
                    width: 70,
                    height: 70,
                    boxShadow: 3,
                    border: "3px solid #ec4899",
                    mb: 1,
                  }}
                >
                  <Storefront sx={{ color: "#ec4899", fontSize: 40 }} />
                </Avatar>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  sx={{
                    mb: 1,
                    color: "#fff",
                    textAlign: "center",
                    letterSpacing: 2,
                    textShadow: "2px 2px 8px #ec4899",
                  }}
                >
                  Vendor Registration
                </Typography>
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: "#a1a1aa",
                    mb: 2,
                    fontWeight: 500,
                    textAlign: "center",
                  }}
                >
                  Join as a vendor and grow your business with us!
                </Typography>
              </Box>
              <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
                <Step>
                  <StepLabel sx={{ color: "#fff" }}>Account</StepLabel>
                </Step>
                <Step>
                  <StepLabel sx={{ color: "#fff" }}>Business</StepLabel>
                </Step>
              </Stepper>
              <Divider sx={{ mb: 2, bgcolor: "#ec4899", opacity: 0.3 }} />
              {activeStep === 0 && (
                <form onSubmit={handleNext}>
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
                          <Person sx={{ color: "#fff" }} />
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
                          <Email sx={{ color: "#fff" }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    label="Phone"
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
                          <Phone sx={{ color: "#fff" }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    label="Password"
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
                            sx={{ color: "#ec4899" }}
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
                    color="secondary"
                    fullWidth
                    sx={submitButtonStyle}
                  >
                    Next
                  </Button>
                </form>
              )}
              {activeStep === 1 && (
                <form onSubmit={submitHandler}>
                  <Typography variant="subtitle1" sx={{ color: "#ec4899", mb: 1, fontWeight: 700 }}>
                    Business Information
                  </Typography>
                  <TextField
                    label="Company Name"
                    fullWidth
                    required
                    margin="normal"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    sx={textFieldStyle}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Business sx={{ color: "#fff" }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    label="Tax ID"
                    fullWidth
                    required
                    margin="normal"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    sx={textFieldStyle}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Assignment sx={{ color: "#fff" }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    label="GST ID"
                    fullWidth
                    required
                    margin="normal"
                    value={gstId}
                    onChange={(e) => setGstId(e.target.value)}
                    sx={textFieldStyle}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Badge sx={{ color: "#fff" }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    label="Business Address"
                    fullWidth
                    required
                    margin="normal"
                    value={businessAddress}
                    onChange={(e) => setBusinessAddress(e.target.value)}
                    sx={textFieldStyle}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOn sx={{ color: "#fff" }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                    <Button
                      variant="outlined"
                      color="secondary"
                      fullWidth
                      sx={{
                        ...submitButtonStyle,
                        background: "none",
                        color: "#ec4899",
                        border: "2px solid #ec4899",
                        "&:hover": {
                          background: "#ec4899",
                          color: "#fff",
                        },
                      }}
                      onClick={() => setActiveStep(0)}
                      type="button"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color="secondary"
                      fullWidth
                      sx={submitButtonStyle}
                      disabled={isLoading}
                    >
                      {isLoading ? "Registering..." : "Submit"}
                    </Button>
                  </Box>
                  {isLoading && (
                    <Box sx={{ mt: 2 }}>
                      <Loader />
                    </Box>
                  )}
                </form>
              )}
              <Divider sx={{ my: 3, bgcolor: "#bbb" }} />
              <Typography variant="body2" color="#fff" sx={{ textAlign: "center" }}>
                Already have an account?{" "}
                <Link
                  to={redirect ? `/vendor/login?redirect=${redirect}` : "/vendor/login"}
                  style={{ color: "#ec4899", textDecoration: "underline", fontWeight: 600 }}
                >
                  Login
                </Link>
              </Typography>
            </Paper>
          </Fade>
        </Grid>
        <Grid
          item
          md={6}
          sx={{
            display: { xs: "none", md: "block" },
            backgroundImage:
              "url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=1964&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderRadius: "0 16px 16px 0",
            minHeight: 700,
            position: "relative",
            "&:after": {
              content: '""',
              position: "absolute",
              inset: 0,
              bgcolor: "rgba(99,102,241,0.25)",
              borderRadius: "0 16px 16px 0",
            },
          }}
        />
      </Grid>
    </Box>
  );
};

const textFieldStyle = {
  input: { color: "#fff" },
  label: { color: "#fff" },
  mb: 2,
  bgcolor: "#18181b",
  borderRadius: 2,
};

const submitButtonStyle = {
  mt: 2,
  fontWeight: "bold",
  fontSize: "1.1rem",
  borderRadius: 2,
  letterSpacing: 1,
  py: 1.3,
  boxShadow: 3,
  background: "linear-gradient(90deg, #6366f1 0%, #ec4899 100%)",
  textTransform: "none",
  transition: "transform 0.2s, box-shadow 0.2s",
  "&:hover": {
    transform: "scale(1.04)",
    boxShadow: 6,
    background: "linear-gradient(90deg, #ec4899 0%, #6366f1 100%)",
  },
};

export default VendorRegister;