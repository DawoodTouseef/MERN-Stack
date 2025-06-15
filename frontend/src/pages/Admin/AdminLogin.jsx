import { useState, useEffect } from "react";
import {
  Avatar,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  Paper,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useDispatch, useSelector } from "react-redux";
import { useLoginMutation } from "../../redux/api/usersApiSlice";
import { setCredentials } from "../../redux/features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [login, { isLoading }] = useLoginMutation();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo?.isAdmin) {
      navigate("/");
    }
  }, [navigate, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      const res = await login({ email, password }).unwrap();
      if (res.role!=="admin") {
        toast.error("Access denied. Admins only.");
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
    <Grid
      container
      component="main"
      sx={{ height: "100vh", background: "#f3f4f6" }}
      justifyContent="center"
      alignItems="center"
    >
      <Grid item xs={11} sm={8} md={4}>
        <Paper
          elevation={10}
          sx={{
            p: 4,
            borderRadius: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: "#18181b",
            color: "#fff",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "#1976d2" }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5" fontWeight={700}>
            Admin Login
          </Typography>
          <Box component="form" onSubmit={submitHandler} sx={{ mt: 3 }}>
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
                bgcolor: "#2e2e38",
                borderRadius: 2,
              }}
              InputLabelProps={{ style: { color: "#fff" } }}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              required
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{
                input: { color: "#fff" },
                label: { color: "#fff" },
                bgcolor: "#2e2e38",
                borderRadius: 2,
              }}
              InputLabelProps={{ style: { color: "#fff" } }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3, py: 1.5, fontWeight: 600 }}
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default AdminLogin;
