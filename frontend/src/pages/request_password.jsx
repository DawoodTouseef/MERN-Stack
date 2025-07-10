import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
} from "@mui/material";
import { toast } from "react-toastify";
import {   useChangePasswordMutation
 } from "../redux/api/usersApiSlice";
import { useSearchParams } from "react-router-dom";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const id = searchParams.get("id");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [change_password]=  useChangePasswordMutation();
  const handleReset = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const data  = await change_password( {
        userID:id,
        token:token,
        newPassword:password,
      }).unwrap();
      toast.success(data.message || "Password has been reset successfully.");
      setPassword("");
      setConfirmPassword("");
      if (data.role==="customer")
      {
        navigate("/login")
      }
      else if (data.role==="vendor")
      {
        navigate("/vendor/login")
      }
      else if (data.role==="admin")
      {
        navigate("/admin/login")
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
    
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "#f3f4f6",
        px: 2,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          borderRadius: 4,
          maxWidth: 400,
          width: "100%",
          boxShadow: "0 8px 32px 0 rgba(0,0,0,0.1)",
        }}
      >
        <Typography
          variant="h4"
          fontWeight="bold"
          sx={{ mb: 3, textAlign: "center" }}
        >
          Reset Password
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 3, textAlign: "center" }}
        >
          Enter your new password below.
        </Typography>
        <form onSubmit={handleReset}>
          <TextField
            label="New Password"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={{ mb: 3 }}
          />
          <TextField
            label="Confirm Password"
            type="password"
            fullWidth
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            sx={{ mb: 3 }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
            sx={{
              py: 1.5,
              fontWeight: "bold",
              textTransform: "none",
              fontSize: "1rem",
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Change Password"
            )}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default ResetPassword;
