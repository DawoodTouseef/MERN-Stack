import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../components/Loader";
import { useRegisterMutation } from "../../redux/api/usersApiSlice";
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
  alpha,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  stepConnectorClasses,
  styled
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Storefront,
  Person,
  Email,
  Phone,
  Business,
  Assignment,
  Badge,
  LocationOn,
  ArrowForward,
  ArrowBack,
  CheckCircle
} from "@mui/icons-material";

// Custom Styled Connector for Stepper
const QontoConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 10,
    left: 'calc(-50% + 16px)',
    right: 'calc(50% + 16px)',
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: theme.palette.primary.main,
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: theme.palette.primary.main,
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#eaeaf0',
    borderTopWidth: 3,
    borderRadius: 1,
  },
}));

const QontoStepIconRoot = styled('div')(({ theme, ownerState }) => ({
  color: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#eaeaf0',
  display: 'flex',
  height: 22,
  alignItems: 'center',
  ...(ownerState.active && {
    color: theme.palette.primary.main,
  }),
  '& .QontoStepIcon-completedIcon': {
    color: theme.palette.primary.main,
    zIndex: 1,
    fontSize: 18,
  },
  '& .QontoStepIcon-circle': {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: 'currentColor',
  },
}));

function QontoStepIcon(props) {
  const { active, completed, className } = props;

  return (
    <QontoStepIconRoot ownerState={{ active }} className={className}>
      {completed ? (
        <CheckCircle className="QontoStepIcon-completedIcon" />
      ) : (
        <div className="QontoStepIcon-circle" />
      )}
    </QontoStepIconRoot>
  );
}

const SellerRegister = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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

  const handleNext = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setActiveStep(1);
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await register({
        username,
        email,
        password,
        role: "seller",
        SellerProfile: {
          companyName,
          taxId,
          gstId,
          address: businessAddress,
        },
      }).unwrap();
      dispatch(setCredentials({ ...res }));
      navigate(redirect);
      toast.success("Seller successfully registered");
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
        <Grid item xs={12} md={6} sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: 'secondary.main',
          background: `linear-gradient(135deg, ${theme.palette.secondary.dark} 0%, ${theme.palette.primary.dark} 100%)`,
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
              Join the Network
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
              Start your business journey today. Set up your store, reach new customers, and grow with our modular platform.
            </Typography>

            <Box
              component="img"
              src="/placeholder-seller-reg.png"
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
            <Stack spacing={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="700" color="text.primary">
                  Seller Registration
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Complete two quick steps to launch your store
                </Typography>
              </Box>

              <Stepper
                activeStep={activeStep}
                alternativeLabel
                connector={<QontoConnector />}
                sx={{ mb: 0 }}
              >
                <Step>
                  <StepLabel StepIconComponent={QontoStepIcon}>Account</StepLabel>
                </Step>
                <Step>
                  <StepLabel StepIconComponent={QontoStepIcon}>Business</StepLabel>
                </Step>
              </Stepper>

              {activeStep === 0 ? (
                <form onSubmit={handleNext}>
                  <Stack spacing={2.5}>
                    <TextField
                      label="Full Name"
                      required
                      fullWidth
                      value={username}
                      onChange={(e) => setName(e.target.value)}
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person color="action" />
                          </InputAdornment>
                        ),
                        sx: { borderRadius: 2 }
                      }}
                    />
                    <TextField
                      label="Email Address"
                      type="email"
                      required
                      fullWidth
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email color="action" />
                          </InputAdornment>
                        ),
                        sx: { borderRadius: 2 }
                      }}
                    />
                    <TextField
                      label="Phone Number"
                      required
                      fullWidth
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone color="action" />
                          </InputAdornment>
                        ),
                        sx: { borderRadius: 2 }
                      }}
                    />
                    <Stack direction="row" spacing={2}>
                      <TextField
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        required
                        fullWidth
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        variant="outlined"
                        InputProps={{
                          sx: { borderRadius: 2 },
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={handleClickShowPassword} edge="end">
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                      <TextField
                        label="Confirm"
                        type={showPassword ? "text" : "password"}
                        required
                        fullWidth
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        variant="outlined"
                        InputProps={{ sx: { borderRadius: 2 } }}
                      />
                    </Stack>

                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      fullWidth
                      endIcon={<ArrowForward />}
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        fontWeight: 600,
                        boxShadow: 2,
                        textTransform: 'none',
                        fontSize: '1rem',
                        mt: 2
                      }}
                    >
                      Next: Business Details
                    </Button>
                  </Stack>
                </form>
              ) : (
                <form onSubmit={submitHandler}>
                  <Stack spacing={2.5}>
                    <TextField
                      label="Company Name"
                      required
                      fullWidth
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Business color="action" />
                          </InputAdornment>
                        ),
                        sx: { borderRadius: 2 }
                      }}
                    />
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Tax ID"
                          required
                          fullWidth
                          value={taxId}
                          onChange={(e) => setTaxId(e.target.value)}
                          variant="outlined"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Assignment color="action" />
                              </InputAdornment>
                            ),
                            sx: { borderRadius: 2 }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="GST ID"
                          required
                          fullWidth
                          value={gstId}
                          onChange={(e) => setGstId(e.target.value)}
                          variant="outlined"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Badge color="action" />
                              </InputAdornment>
                            ),
                            sx: { borderRadius: 2 }
                          }}
                        />
                      </Grid>
                    </Grid>
                    <TextField
                      label="Business Address"
                      required
                      fullWidth
                      multiline
                      rows={3}
                      value={businessAddress}
                      onChange={(e) => setBusinessAddress(e.target.value)}
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                            <LocationOn color="action" />
                          </InputAdornment>
                        ),
                        sx: { borderRadius: 2 }
                      }}
                    />

                    <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<ArrowBack />}
                        onClick={() => setActiveStep(0)}
                        sx={{ py: 1.5, borderRadius: 2, fontWeight: 600, textTransform: 'none' }}
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        disabled={isLoading}
                        sx={{
                          py: 1.5,
                          borderRadius: 2,
                          fontWeight: 600,
                          boxShadow: 2,
                          textTransform: 'none',
                          background: `linear-gradient(45deg, ${theme.palette.secondary.main} 30%, ${theme.palette.primary.main} 90%)`,
                          color: 'white'
                        }}
                      >
                        {isLoading ? <Loader size={24} color="inherit" /> : "Complete Registration"}
                      </Button>
                    </Stack>
                  </Stack>
                </form>
              )}

              <Box sx={{ textAlign: "center", mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Already a seller?{' '}
                  <Link
                    to={redirect ? `/seller/login?redirect=${redirect}` : "/seller/login"}
                    style={{
                      color: theme.palette.primary.main,
                      textDecoration: 'none',
                      fontWeight: 600
                    }}
                  >
                    Login to Portal
                  </Link>
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SellerRegister;