import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetUserDetailsQuery,
  useUpdateUserMutation,
} from "../../redux/api/usersApiSlice";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  MenuItem,
  Select,
  Button,
  Stack,
  Alert,
  TextField,
} from "@mui/material";
import { useSelector } from "react-redux";

const UserEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  const { data: user, isLoading, error } = useGetUserDetailsQuery(id);
  const [updateUser, { isLoading: updating, error: updateError, isSuccess }] =
    useUpdateUserMutation();

  // Editable fields
  const [status, setStatus] = useState("");
  const [role, setRole] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  // Only admin or the user themselves can edit
  const canEdit =
    userInfo &&
    (userInfo.role === "admin" || userInfo._id === id);

  useEffect(() => {
    if (user) {
      setStatus(user.status || "active");
      setRole(user.role || "customer");
      setUsername(user.username || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUser({
        userId: id,
        status,
        role,
        username,
        email,
      }).unwrap();
    } catch (err) {
      // error handled by updateError
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f3f4f6",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Paper sx={{ p: 4, maxWidth: 500, width: "100%", borderRadius: 4 }}>
        <Typography variant="h5" fontWeight={700} mb={2}>
          User Information
        </Typography>
        {isLoading ? (
          <CircularProgress />
        ) : error ? (
          <Alert severity="error">{error?.data?.message || "Error loading user"}</Alert>
        ) : (
          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                fullWidth
                disabled={!canEdit}
              />
              <TextField
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                disabled={!canEdit}
              />
              <Select
                label="Role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                fullWidth
                disabled={!canEdit}
              >
                <MenuItem value="customer">Customer</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="vendor">Vendor</MenuItem>
                <MenuItem value="seller">Seller</MenuItem>
              </Select>
              <Select
                label="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                fullWidth
                disabled={!canEdit}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="banned">Banned</MenuItem>
              </Select>
              {canEdit && (
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={updating}
                  sx={{ mt: 2 }}
                >
                  {updating ? <CircularProgress size={24} /> : "Update User"}
                </Button>
              )}
              {updateError && (
                <Alert severity="error">
                  {updateError?.data?.message || "Update failed"}
                </Alert>
              )}
              {isSuccess && (
                <Alert severity="success">User updated successfully!</Alert>
              )}
            </Stack>
          </form>
        )}
        <Button
          variant="text"
          sx={{ mt: 2 }}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
      </Paper>
    </Box>
  );
};

export default UserEditPage;