import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
  Paper,
  Avatar,
  Divider,
  IconButton,
  InputAdornment,

} from "@mui/material";
import { useProfileMutation } from "../../redux/api/usersApiSlice";
import { setCredentials } from "../../redux/features/auth/authSlice";
import { Link } from "react-router-dom";
import { Edit, Visibility, VisibilityOff, Save, Close } from "@mui/icons-material";
import DocumentTitle from "react-document-title";

const Profile = () => {
  const [editMode, setEditMode] = useState(false);
  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { userInfo } = useSelector((state) => state.auth);

  const [updateProfile, { isLoading: loadingUpdateProfile }] =
    useProfileMutation();

  useEffect(() => {
    setUserName(userInfo.username);
    setEmail(userInfo.email);
  }, [userInfo.email, userInfo.username]);

  const dispatch = useDispatch();

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
    } else {
      try {
        const res = await updateProfile({
          _id: userInfo._id,
          username,
          email,
          password,
        }).unwrap();
        dispatch(setCredentials({ ...res }));
        toast.success("Profile updated successfully");
        setEditMode(false);
        setPassword("");
        setConfirmPassword("");
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  return (
    <DocumentTitle title="Profile | Nexus Mart">
    <Box
      sx={{
        maxWidth: "600px",
        margin: "8rem auto",
        padding: { xs: "1rem", md: "2rem" },
        minHeight: "80vh",
        background: "linear-gradient(135deg, #f3e7e9 0%, #e3eeff 100%)",
        borderRadius: 4,
        boxShadow: "0 8px 32px 0 rgba(236,72,153,0.10)",
      }}
      className="min-h-screen"
    >
      <Paper
        elevation={6}
        sx={{
          padding: { xs: "1.5rem", md: "2.5rem" },
          borderRadius: 4,
          bgcolor: "#fff",
          boxShadow: "0 4px 24px 0 rgba(236,72,153,0.10)",
        }}
        className="shadow-xl"
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Avatar
            sx={{
              width: 72,
              height: 72,
              mr: 3,
              bgcolor: "secondary.main",
              fontSize: 36,
              boxShadow: 3,
            }}
          >
            {userInfo.username ? userInfo.username[0].toUpperCase() : "U"}
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="bold" sx={{ letterSpacing: 1 }}>
              {userInfo.username}
            </Typography>
            <Typography color="text.secondary">{userInfo.email}</Typography>
          </Box>
        </Box>
        <Divider sx={{ mb: 3 }} />

        {!editMode ? (
          <>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>Name:</strong> {userInfo.username}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>Email:</strong> {userInfo.email}
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: 3,
              }}
            >
              <Button
                variant="contained"
                color="primary"
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  fontWeight: 600,
                  px: 4,
                  boxShadow: 2,
                  letterSpacing: 1,
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "scale(1.04)",
                    boxShadow: 6,
                  },
                }}
                startIcon={<Edit />}
                onClick={() => setEditMode(true)}
                className="hover:scale-105 hover:shadow-2xl transition-transform duration-200"
              >
                Edit Profile
              </Button>
              <Button
                component={Link}
                to="/admin/orderlist"
                variant="contained"
                color="secondary"
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  fontWeight: 600,
                  px: 4,
                  boxShadow: 2,
                  letterSpacing: 1,
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "scale(1.04)",
                    boxShadow: 6,
                  },
                }}
                className="hover:scale-105 hover:shadow-2xl transition-transform duration-200"
              >
                My Orders
              </Button>
            </Box>
          </>
        ) : (
          <form onSubmit={submitHandler}>
            <Box sx={{ marginBottom: "1.2rem" }}>
              <TextField
                fullWidth
                label="Name"
                variant="outlined"
                value={username}
                onChange={(e) => setUserName(e.target.value)}
                sx={{ bgcolor: "#f9fafb", borderRadius: 2 }}
              />
            </Box>
            <Box sx={{ marginBottom: "1.2rem" }}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ bgcolor: "#f9fafb", borderRadius: 2 }}
              />
            </Box>
            <Box sx={{ marginBottom: "1.2rem" }}>
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ bgcolor: "#f9fafb", borderRadius: 2 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((show) => !show)}
                        edge="end"
                        sx={{ color: "#ec4899" }}
                        aria-label="toggle password visibility"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <Box sx={{ marginBottom: "1.2rem" }}>
              <TextField
                fullWidth
                label="Confirm Password"
                type={showConfirm ? "text" : "password"}
                variant="outlined"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                sx={{ bgcolor: "#f9fafb", borderRadius: 2 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirm((show) => !show)}
                        edge="end"
                        sx={{ color: "#ec4899" }}
                        aria-label="toggle confirm password visibility"
                      >
                        {showConfirm ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: 2,
              }}
            >
              <Button
                type="submit"
                variant="contained"
                color="success"
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  fontWeight: 700,
                  px: 4,
                  boxShadow: 2,
                  letterSpacing: 1,
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "scale(1.04)",
                    boxShadow: 6,
                  },
                }}
                startIcon={<Save />}
                className="hover:scale-105 hover:shadow-2xl transition-transform duration-200"
              >
                Save
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  fontWeight: 700,
                  px: 4,
                  letterSpacing: 1,
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    bgcolor: "#f3e8ff",
                  },
                }}
                startIcon={<Close />}
                onClick={() => {
                  setEditMode(false);
                  setUserName(userInfo.username);
                  setEmail(userInfo.email);
                  setPassword("");
                  setConfirmPassword("");
                }}
              >
                Cancel
              </Button>
            </Box>
            {loadingUpdateProfile && (
              <Box sx={{ marginTop: "1.5rem", textAlign: "center" }}>
                <CircularProgress color="secondary" />
              </Box>
            )}
          </form>
        )}
      </Paper>
    </Box>
    </DocumentTitle>
  );
};

export default Profile;