import { useState } from "react";
import { Box, TextField, Button, Typography, Paper, CircularProgress } from "@mui/material";
import { toast } from "react-toastify";
import { useRequestPasswordMutation } from "../redux/api/usersApiSlice";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [requestPassword] = useRequestPasswordMutation(); // Fixed variable name
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);

      // Send request to backend
      const response = await requestPassword({email: email}).unwrap(); // Fixed error handling
      
      // Check if response has error property
      if (response && response.error) {
        toast.error(response.error.data?.message || "Failed to send reset email.");
      } else {
        toast.success(response?.message || "Password reset email sent successfully.");
        setEmail(""); // Move inside success case
      }
    } catch (error) {
      toast.error(
        error?.data?.message || "Something went wrong. Please try again."
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
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 3, textAlign: "center" }}>
          Forgot Password
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, textAlign: "center" }}>
          Enter your email address to receive a password reset link.
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email Address"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            {loading ? <CircularProgress size={24} color="inherit" /> : "Send Reset Link"}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default ForgotPassword;