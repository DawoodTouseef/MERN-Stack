import { useState } from 'react';
import {
  Box, Button, TextField, Typography, Paper, CircularProgress, Alert
} from '@mui/material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {useChangePasswordMutation} from "../redux/api/usersApiSlice"

const PasswordReset = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const userId = searchParams.get("id");
  const request = useChangePasswordMutation();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      return setStatus({ type: 'error', message: "Passwords do not match" });
    }

    try {
      setLoading(true);
      const res = await request( {
        userId:userId,
        token:token,
        newPassword:newPassword
      });

      setStatus({ type: 'success', message: res.data.message });
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'Reset failed'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgcolor="#f0f2f5"
    >
      <Paper elevation={6} sx={{ p: 4, width: 400 }}>
        <Typography variant="h5" mb={2}>Reset Your Password</Typography>

        {status.message && (
          <Alert severity={status.type} sx={{ mb: 2 }}>
            {status.message}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            label="New Password"
            type="password"
            fullWidth
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Confirm Password"
            type="password"
            fullWidth
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            sx={{ mb: 3 }}
          />

          <Button
            variant="contained"
            color="primary"
            fullWidth
            type="submit"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Reset Password"}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default PasswordReset;
