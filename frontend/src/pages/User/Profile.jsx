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
  Stack,
  Fade,
  Tooltip,
} from "@mui/material";
import { useProfileMutation } from "../../redux/api/usersApiSlice";
import { setCredentials } from "../../redux/features/auth/authSlice";
import { Link } from "react-router-dom";
import { Edit, Visibility, VisibilityOff, Save, Close, AssignmentInd } from "@mui/icons-material";
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
          elevation={8}
          sx={{
            padding: { xs: "1.5rem", md: "2.5rem" },
            borderRadius: 5,
            bgcolor: "#fff",
            boxShadow: "0 4px 32px 0 rgba(236,72,153,0.13)",
            position: "relative",
            overflow: "hidden",
          }}
          className="shadow-2xl"
        >
          <Box
            sx={{
              position: "absolute",
              top: -40,
              right: -40,
              width: 120,
              height: 120,
              bgcolor: "#f3e7e9",
              borderRadius: "50%",
              opacity: 0.25,
              zIndex: 0,
            }}
          />
          <Stack direction="row" alignItems="center" spacing={3} sx={{ mb: 2, zIndex: 1, position: "relative" }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: "secondary.main",
                fontSize: 40,
                boxShadow: 4,
                border: "3px solid #e3eeff",
              }}
            >
              {userInfo.username ? userInfo.username[0].toUpperCase() : <AssignmentInd fontSize="large" />}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold" sx={{ letterSpacing: 1 }}>
                {userInfo.username}
              </Typography>
              <Typography color="text.secondary">{userInfo.email}</Typography>
            </Box>
          </Stack>
          <Divider sx={{ mb: 3 }} />

          {!editMode ? (
            <Fade in>
              <Box>
                <Stack spacing={2}>
                  <Typography variant="body1">
                    <strong>Name:</strong> {userInfo.username}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Email:</strong> {userInfo.email}
                  </Typography>
                </Stack>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 4 }}>
                  <Tooltip title="Edit your profile">
                    <Button
                      variant="contained"
                      color="primary"
                      sx={{
                        textTransform: "none",
                        borderRadius: 3,
                        fontWeight: 700,
                        px: 4,
                        boxShadow: 3,
                        letterSpacing: 1,
                        fontSize: "1rem",
                        transition: "transform 0.2s, box-shadow 0.2s",
                        "&:hover": {
                          transform: "scale(1.05)",
                          boxShadow: 8,
                          bgcolor: "primary.dark",
                        },
                      }}
                      startIcon={<Edit />}
                      onClick={() => setEditMode(true)}
                    >
                      Edit Profile
                    </Button>
                  </Tooltip>
                  <Tooltip title="View your orders">
                    <Button
                      component={Link}
                      to="/orders"
                      variant="outlined"
                      color="secondary"
                      sx={{
                        textTransform: "none",
                        borderRadius: 3,
                        fontWeight: 700,
                        px: 4,
                        boxShadow: 2,
                        letterSpacing: 1,
                        fontSize: "1rem",
                        borderWidth: 2,
                        borderColor: "#ec4899",
                        transition: "transform 0.2s, box-shadow 0.2s",
                        "&:hover": {
                          transform: "scale(1.05)",
                          boxShadow: 6,
                          bgcolor: "#f3e8ff",
                          borderColor: "#d946ef",
                        },
                      }}
                      className="hover:scale-105 hover:shadow-2xl transition-transform duration-200"
                    >
                      My Orders
                    </Button>
                  </Tooltip>
                </Stack>
              </Box>
            </Fade>
          ) : (
            <Fade in>
              <form onSubmit={submitHandler}>
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    label="Name"
                    variant="outlined"
                    value={username}
                    onChange={(e) => setUserName(e.target.value)}
                    sx={{
                      bgcolor: "#f9fafb",
                      borderRadius: 2,
                      input: { fontWeight: 500, letterSpacing: 1 },
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    variant="outlined"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    sx={{
                      bgcolor: "#f9fafb",
                      borderRadius: 2,
                      input: { fontWeight: 500, letterSpacing: 1 },
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    variant="outlined"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    sx={{
                      bgcolor: "#f9fafb",
                      borderRadius: 2,
                      input: { fontWeight: 500, letterSpacing: 1 },
                    }}
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
                  <TextField
                    fullWidth
                    label="Confirm Password"
                    type={showConfirm ? "text" : "password"}
                    variant="outlined"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    sx={{
                      bgcolor: "#f9fafb",
                      borderRadius: 2,
                      input: { fontWeight: 500, letterSpacing: 1 },
                    }}
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
                  <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 1 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="success"
                      sx={{
                        textTransform: "none",
                        borderRadius: 3,
                        fontWeight: 700,
                        px: 4,
                        boxShadow: 2,
                        letterSpacing: 1,
                        fontSize: "1rem",
                        transition: "transform 0.2s, box-shadow 0.2s",
                        "&:hover": {
                          transform: "scale(1.05)",
                          boxShadow: 6,
                        },
                      }}
                      startIcon={<Save />}
                    >
                      Save
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      sx={{
                        textTransform: "none",
                        borderRadius: 3,
                        fontWeight: 700,
                        px: 4,
                        letterSpacing: 1,
                        fontSize: "1rem",
                        borderWidth: 2,
                        borderColor: "#ec4899",
                        transition: "transform 0.2s, box-shadow 0.2s",
                        "&:hover": {
                          bgcolor: "#f3e8ff",
                          borderColor: "#d946ef",
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
                  </Stack>
                  {loadingUpdateProfile && (
                    <Box sx={{ marginTop: "1.5rem", textAlign: "center" }}>
                      <CircularProgress color="secondary" />
                    </Box>
                  )}
                </Stack>
              </form>
            </Fade>
          )}
        </Paper>
      </Box>
    </DocumentTitle>
  );
};

export default Profile;