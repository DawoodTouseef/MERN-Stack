import React, { useState } from 'react';
import { Box, Typography, Button, Paper, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, Grid, Alert, Tooltip, Avatar, Divider, Badge } from '@mui/material';
import { useGetUsersQuery, useDeleteUserMutation, useUpdateUserMutation, useVerifyVendorMutation, useRejectVendorMutation } from '../../redux/api/usersApiSlice';
import { DataGrid } from '@mui/x-data-grid';
import { Edit, Delete, CheckCircle, Cancel, VerifiedUser, Person, Warning, Info } from '@mui/icons-material';
import Loader from '../../components/Loader';
import { useTheme } from '@mui/material/styles';

const UserManagement = () => {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [verificationDialog, setVerificationDialog] = useState({ open: false, user: null, action: '' }); // For verification confirmation
  const [currentUserId, setCurrentUserId] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'customer',
    status: 'active',
    vendorVerified: false
  });
  
  const { data: usersData, isLoading, error, refetch } = useGetUsersQuery();
  
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [verifyVendor, { isLoading: isVerifying }] = useVerifyVendorMutation();
  const [rejectVendor, { isLoading: isRejecting }] = useRejectVendorMutation();
  
  const [errors, setErrors] = useState({});

  const handleOpenEdit = (user) => {
    setCurrentUserId(user._id);
    setFormData({
      username: user.username || '',
      email: user.email || '',
      role: user.role || 'customer',
      status: user.status || 'active',
      vendorVerified: user.vendorVerified || false
    });
    setErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentUserId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await updateUser({ userId: currentUserId, ...formData }).unwrap();
      refetch();
      handleCloseDialog();
    } catch (err) {
      // Handle API errors
      if (err.data?.message) {
        setErrors({ submit: err.data.message });
      }
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId).unwrap();
        refetch();
      } catch (err) {
        alert('Failed to delete user: ' + (err.data?.message || 'Unknown error'));
      }
    }
  };

  // Open verification confirmation dialog
  const openVerificationDialog = (user, action) => {
    setVerificationDialog({ open: true, user, action });
  };

  // Close verification confirmation dialog
  const closeVerificationDialog = () => {
    setVerificationDialog({ open: false, user: null, action: '' });
  };

  // Handle verification/rejection
  const handleVerificationAction = async () => {
    try {
      if (verificationDialog.action === 'verify') {
        await verifyVendor(verificationDialog.user._id).unwrap();
        alert('Vendor verified successfully!');
      } else if (verificationDialog.action === 'reject') {
        await rejectVendor(verificationDialog.user._id).unwrap();
        alert('Vendor rejected successfully!');
      }
      refetch();
      closeVerificationDialog();
    } catch (err) {
      alert(`Failed to ${verificationDialog.action} vendor: ` + (err.data?.message || 'Unknown error'));
    }
  };

  const columns = [
    { 
      field: 'username', 
      headerName: 'Username', 
      flex: 1.5,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              params.row.role === 'vendor' && params.row.vendorVerified ? (
                <VerifiedUser sx={{ width: 16, height: 16, color: 'success.main' }} />
              ) : params.row.role === 'vendor' && !params.row.vendorVerified ? (
                <Warning sx={{ width: 16, height: 16, color: 'warning.main' }} />
              ) : null
            }
          >
            <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
              <Person />
            </Avatar>
          </Badge>
          <Box>
            <Typography variant="body2" fontWeight="bold">{params.row.username}</Typography>
            <Typography variant="caption" color="textSecondary">{params.row.email}</Typography>
          </Box>
        </Box>
      )
    },
    { 
      field: 'role', 
      headerName: 'Role', 
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.row.role} 
          size="small" 
          color={params.row.role === 'admin' ? 'error' : params.row.role === 'vendor' ? 'primary' : 'default'} 
        />
      )
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.row.status} 
          size="small" 
          color={
            params.row.status === 'active' ? 'success' : 
            params.row.status === 'inactive' ? 'warning' : 'error'
          } 
        />
      )
    },
    { 
      field: 'vendorVerification', 
      headerName: 'Vendor Verification', 
      width: 180,
      renderCell: (params) => (
        params.row.role === 'vendor' ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {params.row.vendorVerified ? (
              <Chip 
                icon={<VerifiedUser />}
                label="Verified" 
                size="small" 
                color="success" 
              />
            ) : (
              <Chip 
                icon={<Warning />}
                label="Pending" 
                size="small" 
                color="warning" 
              />
            )}
          </Box>
        ) : (
          <Typography variant="body2" color="textSecondary">N/A</Typography>
        )
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 250,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {params.row.role === 'vendor' && !params.row.vendorVerified && (
            <>
              <Tooltip title="Verify Vendor - Approve this vendor to allow them to sell products">
                <IconButton 
                  size="small" 
                  onClick={() => openVerificationDialog(params.row, 'verify')}
                  color="success"
                  disabled={isVerifying}
                >
                  <CheckCircle fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Reject Vendor - Reject this vendor and ban their account">
                <IconButton 
                  size="small" 
                  onClick={() => openVerificationDialog(params.row, 'reject')}
                  color="error"
                  disabled={isRejecting}
                >
                  <Cancel fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
          <Tooltip title="Edit User">
            <IconButton 
              size="small" 
              onClick={() => handleOpenEdit(params.row)}
              sx={{ mr: 1 }}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete User">
            <IconButton 
              size="small" 
              onClick={() => handleDelete(params.row._id)}
              color="error"
              disabled={params.row.role === 'admin'}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <Alert severity="error">
        Error loading users: {error.data?.message || 'Unknown error'}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" color="primary.main">
          User Management
        </Typography>
      </Box>

      <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 3 }}>
        <DataGrid
          rows={usersData || []}
          columns={columns}
          pageSize={pageSize}
          rowsPerPageOptions={[5, 10, 20]}
          pagination
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          loading={isLoading}
          autoHeight
          disableSelectionOnClick
          sx={{
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: theme.palette.grey[100],
              fontWeight: 'bold',
            },
            '& .MuiDataGrid-cell': {
              borderBottom: `1px solid ${theme.palette.grey[200]}`,
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: theme.palette.grey[50],
            },
          }}
        />
      </Paper>

      {/* User Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Edit User
        </DialogTitle>
        <DialogContent>
          {errors.submit && (
            <Alert severity="error" sx={{ mb: 2 }}>{errors.submit}</Alert>
          )}
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                error={!!errors.username}
                helperText={errors.username}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  label="Role"
                >
                  <MenuItem value="customer">Customer</MenuItem>
                  <MenuItem value="vendor">Vendor</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status"
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="banned">Banned</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {formData.role === 'vendor' && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Vendor Verification</InputLabel>
                  <Select
                    name="vendorVerified"
                    value={formData.vendorVerified}
                    onChange={handleChange}
                    label="Vendor Verification"
                  >
                    <MenuItem value={true}>Verified</MenuItem>
                    <MenuItem value={false}>Not Verified</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={isUpdating}
          >
            {isUpdating ? <Loader size={20} /> : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Verification Confirmation Dialog */}
      <Dialog open={verificationDialog.open} onClose={closeVerificationDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {verificationDialog.action === 'verify' ? 'Verify Vendor' : 'Reject Vendor'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <Typography variant="body1" gutterBottom>
              {verificationDialog.action === 'verify' 
                ? `Are you sure you want to verify ${verificationDialog.user?.username}?` 
                : `Are you sure you want to reject ${verificationDialog.user?.username}? This will ${verificationDialog.action === 'reject' ? 'ban their account' : 'deactivate their account'}.`}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  verificationDialog.user?.vendorVerified ? (
                    <VerifiedUser sx={{ width: 16, height: 16, color: 'success.main' }} />
                  ) : (
                    <Warning sx={{ width: 16, height: 16, color: 'warning.main' }} />
                  )
                }
              >
                <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
                  <Person />
                </Avatar>
              </Badge>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {verificationDialog.user?.username}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {verificationDialog.user?.email}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <Chip 
                    label={verificationDialog.user?.role} 
                    size="small" 
                    color={verificationDialog.user?.role === 'admin' ? 'error' : verificationDialog.user?.role === 'vendor' ? 'primary' : 'default'} 
                  />
                  <Chip 
                    label={verificationDialog.user?.status} 
                    size="small" 
                    color={
                      verificationDialog.user?.status === 'active' ? 'success' : 
                      verificationDialog.user?.status === 'inactive' ? 'warning' : 'error'
                    } 
                  />
                </Box>
              </Box>
            </Box>
            
            <Box sx={{ bgcolor: theme.palette.grey[100], p: 2, borderRadius: 1, mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Info fontSize="small" color="primary" />
                {verificationDialog.action === 'verify' ? 'Verification Effects' : 'Rejection Effects'}
              </Typography>
              <Typography variant="body2">
                {verificationDialog.action === 'verify' 
                  ? 'This will activate the vendor account and allow them to list products for sale.'
                  : 'This will ban the vendor account and prevent them from accessing the platform.'}
              </Typography>
              {verificationDialog.user?.role === 'vendor' && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  The vendor's associated profile will also be {verificationDialog.action === 'verify' ? 'activated' : 'deactivated'}.
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeVerificationDialog} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleVerificationAction} 
            variant="contained"
            color={verificationDialog.action === 'verify' ? 'success' : 'error'}
            disabled={isVerifying || isRejecting}
            startIcon={verificationDialog.action === 'verify' ? <CheckCircle /> : <Cancel />}
          >
            {isVerifying || isRejecting ? <Loader size={20} /> : 
             verificationDialog.action === 'verify' ? 'Verify Vendor' : 'Reject Vendor'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;