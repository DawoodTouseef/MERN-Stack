import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../components/Loader";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Tab,
  Tabs,
  Grid,
  Chip,
  alpha
} from "@mui/material";
import { useProfileMutation } from "../../redux/api/usersApiSlice";
import { setCredentials } from "../../redux/features/auth/authSlice";
import { Link } from "react-router-dom";
import {
  Edit,
  Visibility,
  VisibilityOff,
  Save,
  Close,
  AssignmentInd,
  VerifiedOutlined,
  Person as PersonIcon,
  Security as SecurityIcon,
  Business as BusinessIcon,
  ShoppingBag as ShoppingBagIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckCircleIcon,
  History as HistoryIcon
} from "@mui/icons-material";
import DocumentTitle from "react-document-title";
import { useUpgradeToVendorMutation } from "../../redux/api/usersApiSlice";
import { useGetVendorProfileQuery } from "../../redux/api/vendorApiSlice";
import { APP_NAME } from "../../redux/constants";

const Profile = () => {
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);

  // Upgrade to vendor form state
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [taxId, setTaxId] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankRoutingNumber, setBankRoutingNumber] = useState("");
  const [contactPersonName, setContactPersonName] = useState("");
  const [contactPersonEmail, setContactPersonEmail] = useState("");

  const { userInfo } = useSelector((state) => state.auth);

  const [updateProfile, { isLoading: loadingUpdateProfile }] =
    useProfileMutation();

  const [upgradeToVendor, { isLoading: loadingUpgrade }] =
    useUpgradeToVendorMutation();

  const { data: vendorData, isLoading: loadingVendorData } = useGetVendorProfileQuery(undefined, {
    skip: userInfo.role !== "vendor"
  });

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

  const handleUpgradeToVendor = async (e) => {
    e.preventDefault();
    try {
      const res = await upgradeToVendor({
        companyName,
        phone,
        address,
        businessType,
        taxId,
        bankAccountNumber,
        bankRoutingNumber,
        contactPersonName,
        contactPersonEmail
      }).unwrap();

      toast.success(res.message);
      setUpgradeDialogOpen(false);
      // Reset form fields
      setCompanyName("");
      setPhone("");
      setAddress("");
      setBusinessType("");
      setTaxId("");
      setBankAccountNumber("");
      setBankRoutingNumber("");
      setContactPersonName("");
      setContactPersonEmail("");
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setEditMode(false);
  };

  const renderOverview = () => (
    <Box>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <Avatar
              sx={{
                width: 100,
                height: 100,
                margin: '0 auto',
                bgcolor: 'primary.main',
                fontSize: 40,
                mb: 2,
                boxShadow: '0 8px 16px rgba(99, 102, 241, 0.2)'
              }}
            >
              {userInfo.username ? userInfo.username[0].toUpperCase() : <PersonIcon />}
            </Avatar>
            <Typography variant="h6" fontWeight={800} color="#1e293b">
              {userInfo.username}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {userInfo.email}
            </Typography>
            <Chip
              label={userInfo.role.toUpperCase()}
              size="small"
              color="primary"
              sx={{ fontWeight: 700, borderRadius: 2 }}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 3, color: '#1e293b' }}>
            Account Details
          </Typography>
          <Stack spacing={3}>
            <Box>
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                Full Name
              </Typography>
              <Typography variant="body1" fontWeight={500}>{userInfo.username}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                Email Address
              </Typography>
              <Typography variant="body1" fontWeight={500}>{userInfo.email}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                Account Status
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <CheckCircleIcon color="success" fontSize="small" />
                <Typography variant="body1" fontWeight={500}>{userInfo.status || 'Active'}</Typography>
              </Box>
            </Box>
          </Stack>

          <Box sx={{ mt: 5 }}>
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={() => {
                setTabValue(1); // Link to Security/Settings tab
                setEditMode(true);
              }}
              sx={{
                borderRadius: 3,
                fontWeight: 800,
                textTransform: 'none',
                px: 4,
                bgcolor: '#6366f1',
                '&:hover': { bgcolor: '#4f46e5' }
              }}
            >
              Edit Account Info
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );

  const renderSecurity = () => (
    <Box>
      <Typography variant="h6" fontWeight={800} sx={{ mb: 3, color: '#1e293b' }}>
        Security & Password
      </Typography>
      {!editMode ? (
        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Manage your account's security settings and password.
          </Typography>
          <Button
            variant="outlined"
            onClick={() => setEditMode(true)}
            sx={{ borderRadius: 3, fontWeight: 700, textTransform: 'none' }}
          >
            Update Security Settings
          </Button>
        </Paper>
      ) : (
        <form onSubmit={submitHandler}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Name"
                value={username}
                onChange={(e) => setUserName(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="New Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Confirm Password"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowConfirm(!showConfirm)}>
                        {showConfirm ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loadingUpdateProfile}
              sx={{
                borderRadius: 3,
                fontWeight: 800,
                px: 4,
                bgcolor: '#6366f1',
                '&:hover': { bgcolor: '#4f46e5' }
              }}
            >
              {loadingUpdateProfile ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => setEditMode(false)}
              sx={{ borderRadius: 3, fontWeight: 700 }}
            >
              Cancel
            </Button>
          </Box>
        </form>
      )}
    </Box>
  );

  const renderBusiness = () => (
    <Box>
      {userInfo.role === "vendor" ? (
        <Box>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 3, color: '#1e293b' }}>
            Vendor Profile
          </Typography>
          {loadingVendorData ? (
            <Loader />
          ) : vendorData ? (
            <Grid container spacing={4}>
              <Grid item xs={12} sm={6}>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="caption" fontWeight={700} color="text.secondary">COMPANY NAME</Typography>
                    <Typography variant="body1" fontWeight={500}>{vendorData.name}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" fontWeight={700} color="text.secondary">BUSINESS TYPE</Typography>
                    <Typography variant="body1" fontWeight={500}>{vendorData.businessType}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" fontWeight={700} color="text.secondary">TAX ID</Typography>
                    <Typography variant="body1" fontWeight={500}>{vendorData.taxId || 'N/A'}</Typography>
                  </Box>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="caption" fontWeight={700} color="text.secondary">CONTACT PERSON</Typography>
                    <Typography variant="body1" fontWeight={500}>{vendorData.contactPerson?.name}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" fontWeight={700} color="text.secondary">PHONE</Typography>
                    <Typography variant="body1" fontWeight={500}>{vendorData.phone}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" fontWeight={700} color="text.secondary">VERIFICATION</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <CheckCircleIcon color={vendorData.isVerified ? "success" : "warning"} fontSize="small" />
                      <Typography variant="body1" fontWeight={500}>
                        {vendorData.isVerified ? "Verified" : "Pending Approval"}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="caption" fontWeight={700} color="text.secondary">BUSINESS ADDRESS</Typography>
                <Typography variant="body1" fontWeight={500}>
                  {vendorData.address?.street}, {vendorData.address?.city}, {vendorData.address?.state} {vendorData.address?.zipCode}, {vendorData.address?.country}
                </Typography>
              </Grid>
            </Grid>
          ) : (
            <Typography color="text.secondary">No vendor profile found.</Typography>
          )}
        </Box>
      ) : userInfo.role === "seller" ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <BusinessIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
            Upgrade to Vendor
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
            Elevate your business profile to become a verified vendor. Unlock advanced analytics, bulk management, and premium store features.
          </Typography>
          <Button
            variant="contained"
            startIcon={<VerifiedOutlined />}
            onClick={() => setUpgradeDialogOpen(true)}
            sx={{
              borderRadius: 3,
              fontWeight: 800,
              px: 6,
              bgcolor: '#6366f1',
              '&:hover': { bgcolor: '#4f46e5' }
            }}
          >
            Upgrade Now
          </Button>
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <ShoppingBagIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" fontWeight={800}>
            Personal Account
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You are currently using a standard customer account.
          </Typography>
        </Box>
      )}
    </Box>
  );

  return (
    <DocumentTitle title={`My Profile | ${APP_NAME}`}>
      <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", py: 10 }}>
        <Box sx={{ maxWidth: 1000, mx: "auto", px: 3 }}>
          <Box sx={{ mb: 6 }}>
            <Typography variant="h4" fontWeight={900} color="#1e293b" sx={{ mb: 1 }}>
              Personal Profile
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your account information and preferences
            </Typography>
          </Box>

          <Paper elevation={0} sx={{ borderRadius: 6, overflow: 'hidden', border: '1px solid #e2e8f0', bgcolor: '#fff' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#f8fafc' }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                sx={{
                  px: 3,
                  '& .MuiTab-root': {
                    py: 3,
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '1rem',
                  }
                }}
              >
                <Tab icon={<PersonIcon fontSize="small" />} iconPosition="start" label="Overview" />
                <Tab icon={<SecurityIcon fontSize="small" />} iconPosition="start" label="Security" />
                <Tab icon={<BusinessIcon fontSize="small" />} iconPosition="start" label="Business" />
              </Tabs>
            </Box>

            <Box sx={{ p: 4 }}>
              {tabValue === 0 && renderOverview()}
              {tabValue === 1 && renderSecurity()}
              {tabValue === 2 && renderBusiness()}
            </Box>
          </Paper>

          {/* Quick Shortcuts */}
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <Paper
                component={Link}
                to="/orders"
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 4,
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: '#6366f1',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                  }
                }}
              >
                <Avatar sx={{ bgcolor: alpha('#6366f1', 0.1), color: '#6366f1' }}>
                  <HistoryIcon />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight={800}>Order History</Typography>
                  <Typography variant="body2" color="text.secondary">View and track your past orders</Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper
                component={Link}
                to="/address"
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 4,
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: '#6366f1',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                  }
                }}
              >
                <Avatar sx={{ bgcolor: alpha('#ec4899', 0.1), color: '#ec4899' }}>
                  <SettingsIcon />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight={800}>Address Book</Typography>
                  <Typography variant="body2" color="text.secondary">Manage your shipping addresses</Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* Upgrade to Vendor Dialog */}
        <Dialog
          open={upgradeDialogOpen}
          onClose={() => setUpgradeDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 5, p: 2 } }}
        >
          <DialogTitle sx={{ fontWeight: 900, fontSize: '1.5rem', pb: 1 }}>Upgrade to Vendor</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Fill in your business details below. Our team will review your application and notify you once approved.
            </Typography>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Company Name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}>
                    <InputLabel>Business Type</InputLabel>
                    <Select
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                      label="Business Type"
                      required
                    >
                      <MenuItem value="Individual">Individual</MenuItem>
                      <MenuItem value="Partnership">Partnership</MenuItem>
                      <MenuItem value="Corporation">Corporation</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              <TextField
                fullWidth
                label="Business Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                multiline
                rows={2}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Tax ID / Registration"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Account Manager Name"
                    value={contactPersonName}
                    onChange={(e) => setContactPersonName(e.target.value)}
                    required
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                  />
                </Grid>
              </Grid>
              <TextField
                fullWidth
                label="Account Manager Email"
                type="email"
                value={contactPersonEmail}
                onChange={(e) => setContactPersonEmail(e.target.value)}
                required
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <Button onClick={() => setUpgradeDialogOpen(false)} sx={{ fontWeight: 700, color: 'text.secondary' }}>
              Cancel
            </Button>
            <Button
              onClick={handleUpgradeToVendor}
              variant="contained"
              disabled={loadingUpgrade}
              sx={{
                borderRadius: 3,
                fontWeight: 800,
                px: 4,
                bgcolor: '#6366f1',
                '&:hover': { bgcolor: '#4f46e5' }
              }}
            >
              {loadingUpgrade ? <CircularProgress size={24} color="inherit" /> : "Submit Application"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DocumentTitle>
  );
};

export default Profile;