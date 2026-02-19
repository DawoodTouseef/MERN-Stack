import { useState, useEffect } from "react";
import {
  Avatar,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  Paper,
  Stack,
  InputAdornment,
  CircularProgress,
  Fade
} from "@mui/material";
import {
  LockOutlined as LockIcon,
  Email as EmailIcon,
  Security as SecurityIcon,
  Login as LoginIcon
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { useLoginMutation } from "../../redux/api/usersApiSlice";
import { setCredentials } from "../../redux/features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DocumentTitle from "../../components/DocumentTitle";
import { APP_NAME } from "../../redux/constants";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [login, { isLoading }] = useLoginMutation();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo?.isAdmin) {
      navigate("/admin/dashboard"); // Redirect to admin dashboard if already logged in
    }
  }, [navigate, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email, password }).unwrap();
      if (res.role !== "admin") {
        toast.error("Access denied. Administrative credentials required.");
        return;
      }
      dispatch(setCredentials({ ...res }));
      toast.success("Welcome, Administrator");
      navigate("/admin/dashboard");
    } catch (err) {
      toast.error(err?.data?.message || "Authentication failed. Check your credentials.");
    }
  };

  return (
    <DocumentTitle title={`${APP_NAME} | Admin Portal Access`}>
      <Box sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(circle at top right, #6366f1 0%, #1e1b4b 100%)",
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Abstract shapes for premium feel */}
        <Box sx={{ position: 'absolute', top: '-10%', right: '-10%', width: '40%', height: '40%', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.15)', filter: 'blur(80px)' }} />
        <Box sx={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '30%', height: '30%', borderRadius: '50%', background: 'rgba(79, 70, 229, 0.1)', filter: 'blur(60px)' }} />

        <Fade in timeout={800}>
          <Grid container justifyContent="center" sx={{ zIndex: 1 }}>
            <Grid item xs={11} sm={8} md={4.5} lg={3.5}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 4, md: 6 },
                  borderRadius: 6,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(20px)",
                  boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
                  border: '1px solid rgba(255,255,255,0.3)'
                }}
              >
                <Avatar sx={{
                  m: 1,
                  bgcolor: "primary.main",
                  width: 64,
                  height: 64,
                  boxShadow: '0 8px 16px rgba(99, 102, 241, 0.4)'
                }}>
                  <SecurityIcon fontSize="large" />
                </Avatar>

                <Box sx={{ textAlign: 'center', mb: 4, mt: 2 }}>
                  <Typography variant="h4" fontWeight={900} color="text.primary" sx={{ letterSpacing: '-1px' }}>
                    Control Center
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Authorized Personnel Only
                  </Typography>
                </Box>

                <Box component="form" onSubmit={submitHandler} sx={{ width: '100%' }}>
                  <Stack spacing={3}>
                    <TextField
                      label="Admin Email"
                      variant="outlined"
                      fullWidth
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        ),
                        sx: { borderRadius: 3, bgcolor: '#f8fafc' }
                      }}
                    />
                    <TextField
                      label="Access Key"
                      type="password"
                      variant="outlined"
                      fullWidth
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        ),
                        sx: { borderRadius: 3, bgcolor: '#f8fafc' }
                      }}
                    />

                    <Box sx={{ pt: 2 }}>
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={isLoading}
                        sx={{
                          py: 2,
                          borderRadius: 3,
                          fontWeight: 800,
                          fontSize: '1rem',
                          textTransform: 'none',
                          boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.4)',
                          '&:hover': { boxShadow: '0 20px 25px -5px rgba(99, 102, 241, 0.4)' }
                        }}
                      >
                        {isLoading ? <CircularProgress size={24} color="inherit" /> : "Authenticate Access"}
                      </Button>
                    </Box>
                  </Stack>
                </Box>

                <Box sx={{ mt: 5, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    {APP_NAME} Security Protocol v4.2.0
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Fade>
      </Box>
    </DocumentTitle>
  );
};

export default AdminLogin;
