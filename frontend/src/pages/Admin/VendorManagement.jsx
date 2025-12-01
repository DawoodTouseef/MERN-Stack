import React, { useState } from 'react';
import { Box, Typography, Button, Paper, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, Grid, Alert, Tooltip, Avatar, Divider, Badge } from '@mui/material';
import { useGetVendorsQuery, useCreateVendorMutation, useUpdateVendorMutation, useDeleteVendorMutation, useVerifyVendorMutation, useRejectVendorMutation } from '../../redux/api/vendorApiSlice';
import { DataGrid } from '@mui/x-data-grid';
import { Add, Edit, Delete, Visibility, CheckCircle, Cancel, VerifiedUser, Business, Warning, Info } from '@mui/icons-material';
import Loader from '../../components/Loader';
import { useTheme } from '@mui/material/styles';

const VendorManagement = () => {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // create or edit
  const [currentVendor, setCurrentVendor] = useState(null);
  const [verificationDialog, setVerificationDialog] = useState({ open: false, vendor: null, action: '' }); // For verification confirmation
  
  const { data: vendorsData, isLoading, error, refetch } = useGetVendorsQuery({ 
    pageNumber: page + 1, 
    pageSize 
  });
  
  const [createVendor, { isLoading: isCreating }] = useCreateVendorMutation();
  const [updateVendor, { isLoading: isUpdating }] = useUpdateVendorMutation();
  const [deleteVendor, { isLoading: isDeleting }] = useDeleteVendorMutation();
  const [verifyVendor, { isLoading: isVerifying }] = useVerifyVendorMutation();
  const [rejectVendor, { isLoading: isRejecting }] = useRejectVendorMutation();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    businessType: 'Individual',
    taxId: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA'
    },
    contactPerson: {
      name: '',
      email: '',
      phone: ''
    },
    bankDetails: {
      accountName: '',
      accountNumber: '',
      bankName: '',
      routingNumber: ''
    }
  });
  
  const [errors, setErrors] = useState({});

  const handleOpenCreate = () => {
    setDialogMode('create');
    setCurrentVendor(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      businessType: 'Individual',
      taxId: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA'
      },
      contactPerson: {
        name: '',
        email: '',
        phone: ''
      },
      bankDetails: {
        accountName: '',
        accountNumber: '',
        bankName: '',
        routingNumber: ''
      }
    });
    setErrors({});
    setOpenDialog(true);
  };

  const handleOpenEdit = (vendor) => {
    setDialogMode('edit');
    setCurrentVendor(vendor);
    setFormData({
      name: vendor.name || '',
      email: vendor.email || '',
      phone: vendor.phone || '',
      businessType: vendor.businessType || 'Individual',
      taxId: vendor.taxId || '',
      address: {
        street: vendor.address?.street || '',
        city: vendor.address?.city || '',
        state: vendor.address?.state || '',
        zipCode: vendor.address?.zipCode || '',
        country: vendor.address?.country || 'USA'
      },
      contactPerson: {
        name: vendor.contactPerson?.name || '',
        email: vendor.contactPerson?.email || '',
        phone: vendor.contactPerson?.phone || ''
      },
      bankDetails: {
        accountName: vendor.bankDetails?.accountName || '',
        accountNumber: vendor.bankDetails?.accountNumber || '',
        bankName: vendor.bankDetails?.bankName || '',
        routingNumber: vendor.bankDetails?.routingNumber || ''
      }
    });
    setErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentVendor(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested fields like address.street
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
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
    
    if (!formData.name.trim()) {
      newErrors.name = 'Vendor name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    }
    
    if (!formData.address.street.trim()) {
      newErrors['address.street'] = 'Street is required';
    }
    
    if (!formData.address.city.trim()) {
      newErrors['address.city'] = 'City is required';
    }
    
    if (!formData.address.state.trim()) {
      newErrors['address.state'] = 'State is required';
    }
    
    if (!formData.address.zipCode.trim()) {
      newErrors['address.zipCode'] = 'ZIP code is required';
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
      if (dialogMode === 'create') {
        await createVendor(formData).unwrap();
      } else {
        await updateVendor({ vendorId: currentVendor._id, ...formData }).unwrap();
      }
      
      refetch();
      handleCloseDialog();
    } catch (err) {
      // Handle API errors
      if (err.data?.message) {
        setErrors({ submit: err.data.message });
      }
    }
  };

  const handleDelete = async (vendorId) => {
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      try {
        await deleteVendor(vendorId).unwrap();
        refetch();
      } catch (err) {
        alert('Failed to delete vendor: ' + (err.data?.message || 'Unknown error'));
      }
    }
  };

  // Open verification confirmation dialog
  const openVerificationDialog = (vendor, action) => {
    setVerificationDialog({ open: true, vendor, action });
  };

  // Close verification confirmation dialog
  const closeVerificationDialog = () => {
    setVerificationDialog({ open: false, vendor: null, action: '' });
  };

  // Handle verification/rejection
  const handleVerificationAction = async () => {
    try {
      let result;
      if (verificationDialog.action === 'verify') {
        result = await verifyVendor(verificationDialog.vendor._id).unwrap();
        alert(`Vendor verified successfully!

Company: ${result.vendor.name}
Tax ID: ${result.vendor.taxId || 'N/A'}
Address: ${result.vendor.address?.street}, ${result.vendor.address?.city}, ${result.vendor.address?.state} ${result.vendor.address?.zipCode}
Contact Person: ${result.vendor.contactPerson?.name} (${result.vendor.contactPerson?.email})`);
      } else if (verificationDialog.action === 'reject') {
        result = await rejectVendor(verificationDialog.vendor._id).unwrap();
        alert(`Vendor rejected successfully!

Company: ${result.vendor.name}
Tax ID: ${result.vendor.taxId || 'N/A'}
Address: ${result.vendor.address?.street}, ${result.vendor.address?.city}, ${result.vendor.address?.state} ${result.vendor.address?.zipCode}
Contact Person: ${result.vendor.contactPerson?.name} (${result.vendor.contactPerson?.email})`);
      }
      refetch();
      closeVerificationDialog();
    } catch (err) {
      alert(`Failed to ${verificationDialog.action} vendor: ` + (err.data?.message || 'Unknown error'));
    }
  };

  const columns = [
    { 
      field: 'name', 
      headerName: 'Vendor Name', 
      flex: 1.5,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              params.row.isVerified ? (
                <VerifiedUser sx={{ width: 16, height: 16, color: 'success.main' }} />
              ) : (
                <Warning sx={{ width: 16, height: 16, color: 'warning.main' }} />
              )
            }
          >
            <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
              <Business />
            </Avatar>
          </Badge>
          <Box>
            <Typography variant="body2" fontWeight="bold">{params.row.name}</Typography>
            <Typography variant="caption" color="textSecondary">{params.row.email}</Typography>
            {params.row.user && (
              <Typography variant="caption" display="block">
                User: {params.row.user.username} ({params.row.user.email})
              </Typography>
            )}
          </Box>
        </Box>
      )
    },
    { 
      field: 'businessType', 
      headerName: 'Business Type', 
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.row.businessType} 
          size="small" 
          color={params.row.businessType === 'Corporation' ? 'primary' : 'default'} 
        />
      )
    },
    { 
      field: 'phone', 
      headerName: 'Phone', 
      width: 150 
    },
    { 
      field: 'address', 
      headerName: 'Location', 
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.row.address?.city}, {params.row.address?.state}
        </Typography>
      )
    },
    { 
      field: 'verificationStatus', 
      headerName: 'Verification', 
      width: 180,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {params.row.isVerified ? (
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
          {params.row.user && params.row.user.vendorVerified && (
            <Chip 
              label="User Verified" 
              size="small" 
              color="success" 
              variant="outlined"
            />
          )}
        </Box>
      )
    },
    { 
      field: 'isActive', 
      headerName: 'Status', 
      width: 100,
      renderCell: (params) => (
        <Chip 
          label={params.row.isActive ? 'Active' : 'Inactive'} 
          size="small" 
          color={params.row.isActive ? 'success' : 'default'} 
        />
      )
    },
    {
      field: 'userStatus',
      headerName: 'User Status',
      width: 120,
      renderCell: (params) => (
        params.row.user ? (
          <Chip 
            label={params.row.user.status} 
            size="small" 
            color={
              params.row.user.status === 'active' ? 'success' : 
              params.row.user.status === 'inactive' ? 'warning' : 'error'
            } 
          />
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
          {!params.row.isVerified ? (
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
              <Tooltip title="Reject Vendor - Reject this vendor and deactivate their account">
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
          ) : (
            <Tooltip title="View Details">
              <IconButton 
                size="small" 
                onClick={() => handleOpenEdit(params.row)}
                sx={{ mr: 1 }}
              >
                <Visibility fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Edit Vendor">
            <IconButton 
              size="small" 
              onClick={() => handleOpenEdit(params.row)}
              sx={{ mr: 1 }}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Vendor">
            <IconButton 
              size="small" 
              onClick={() => handleDelete(params.row._id)}
              color="error"
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
        Error loading vendors: {error.data?.message || 'Unknown error'}
      </Alert>
    );
  }

  return (
    <>
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" color="primary.main">
          Vendor Management
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />} 
          onClick={handleOpenCreate}
          sx={{ 
            background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
            boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
          }}
        >
          Add Vendor
        </Button>
      </Box>

      <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 3 }}>
        <DataGrid
          rows={vendorsData?.vendors || []}
          columns={columns}
          pageSize={pageSize}
          rowsPerPageOptions={[5, 10, 20]}
          rowCount={vendorsData?.total || 0}
          pagination
          paginationMode="server"
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

      {/* Vendor Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogMode === 'create' ? 'Create Vendor' : 'Edit Vendor'}
        </DialogTitle>
        <DialogContent>
          {errors.submit && (
            <Alert severity="error" sx={{ mb: 2 }}>{errors.submit}</Alert>
          )}
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Basic Information</Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Vendor Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
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
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                error={!!errors.phone}
                helperText={errors.phone}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Business Type</InputLabel>
                <Select
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleChange}
                  label="Business Type"
                >
                  <MenuItem value="Individual">Individual</MenuItem>
                  <MenuItem value="Corporation">Corporation</MenuItem>
                  <MenuItem value="Partnership">Partnership</MenuItem>
                  <MenuItem value="LLC">LLC</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tax ID"
                name="taxId"
                value={formData.taxId}
                onChange={handleChange}
              />
            </Grid>
            
            {/* Address */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Address</Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street"
                name="address.street"
                value={formData.address.street}
                onChange={handleChange}
                error={!!errors['address.street']}
                helperText={errors['address.street']}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="City"
                name="address.city"
                value={formData.address.city}
                onChange={handleChange}
                error={!!errors['address.city']}
                helperText={errors['address.city']}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="State"
                name="address.state"
                value={formData.address.state}
                onChange={handleChange}
                error={!!errors['address.state']}
                helperText={errors['address.state']}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="ZIP Code"
                name="address.zipCode"
                value={formData.address.zipCode}
                onChange={handleChange}
                error={!!errors['address.zipCode']}
                helperText={errors['address.zipCode']}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Country"
                name="address.country"
                value={formData.address.country}
                onChange={handleChange}
              />
            </Grid>
            
            {/* Contact Person */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Contact Person</Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                name="contactPerson.name"
                value={formData.contactPerson.name}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="contactPerson.email"
                type="email"
                value={formData.contactPerson.email}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                name="contactPerson.phone"
                value={formData.contactPerson.phone}
                onChange={handleChange}
              />
            </Grid>
            
            {/* Bank Details */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Bank Details</Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Account Name"
                name="bankDetails.accountName"
                value={formData.bankDetails.accountName}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Account Number"
                name="bankDetails.accountNumber"
                value={formData.bankDetails.accountNumber}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Bank Name"
                name="bankDetails.bankName"
                value={formData.bankDetails.bankName}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Routing Number"
                name="bankDetails.routingNumber"
                value={formData.bankDetails.routingNumber}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={isCreating || isUpdating}
          >
            {isCreating || isUpdating ? <Loader size={20} /> : (dialogMode === 'create' ? 'Create' : 'Update')}
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
                ? `Are you sure you want to verify ${verificationDialog.vendor?.name}?` 
                : `Are you sure you want to reject ${verificationDialog.vendor?.name}? This will deactivate their account.`}
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            {/* Vendor Information Display */}
            {verificationDialog.vendor && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Vendor Details
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">Company Name</Typography>
                    <Typography variant="body1">{verificationDialog.vendor.name}</Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">Email</Typography>
                    <Typography variant="body1">{verificationDialog.vendor.email}</Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">Phone</Typography>
                    <Typography variant="body1">{verificationDialog.vendor.phone}</Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">Business Type</Typography>
                    <Typography variant="body1">{verificationDialog.vendor.businessType}</Typography>
                  </Grid>
                  
                  {verificationDialog.vendor.taxId && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="textSecondary">Tax ID</Typography>
                      <Typography variant="body1">{verificationDialog.vendor.taxId}</Typography>
                    </Grid>
                  )}
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">Address</Typography>
                    <Typography variant="body1">
                      {verificationDialog.vendor.address?.street}<br />
                      {verificationDialog.vendor.address?.city}, {verificationDialog.vendor.address?.state} {verificationDialog.vendor.address?.zipCode}<br />
                      {verificationDialog.vendor.address?.country}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">Contact Person</Typography>
                    <Typography variant="body1">
                      {verificationDialog.vendor.contactPerson?.name}<br />
                      {verificationDialog.vendor.contactPerson?.email}<br />
                      {verificationDialog.vendor.contactPerson?.phone}
                    </Typography>
                  </Grid>
                  
                  {verificationDialog.vendor.bankDetails && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="textSecondary">Bank Details</Typography>
                      <Typography variant="body1">
                        {verificationDialog.vendor.bankDetails.accountName && `Account: ${verificationDialog.vendor.bankDetails.accountName}`}<br />
                        {verificationDialog.vendor.bankDetails.bankName && `Bank: ${verificationDialog.vendor.bankDetails.bankName}`}<br />
                        {verificationDialog.vendor.bankDetails.accountNumber && `Account #: ${verificationDialog.vendor.bankDetails.accountNumber}`}<br />
                        {verificationDialog.vendor.bankDetails.routingNumber && `Routing #: ${verificationDialog.vendor.bankDetails.routingNumber}`}
                      </Typography>
                    </Grid>
                  )}
                  
                  {verificationDialog.vendor.user && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary">Associated User</Typography>
                      <Typography variant="body1">
                        Username: {verificationDialog.vendor.user.username}<br />
                        Email: {verificationDialog.vendor.user.email}<br />
                        Status: {verificationDialog.vendor.user.status}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  verificationDialog.vendor?.isVerified ? (
                    <VerifiedUser sx={{ width: 16, height: 16, color: 'success.main' }} />
                  ) : (
                    <Warning sx={{ width: 16, height: 16, color: 'warning.main' }} />
                  )
                }
              >
                <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
                  <Business />
                </Avatar>
              </Badge>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {verificationDialog.vendor?.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {verificationDialog.vendor?.email}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <Chip 
                    label={verificationDialog.vendor?.businessType || 'Individual'} 
                    size="small" 
                    color={verificationDialog.vendor?.businessType === 'Corporation' ? 'primary' : 'default'} 
                  />
                  <Chip 
                    label={verificationDialog.vendor?.isVerified ? 'Verified' : 'Pending'} 
                    size="small" 
                    color={verificationDialog.vendor?.isVerified ? 'success' : 'warning'} 
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
                  : 'This will deactivate the vendor account and prevent them from listing products.'}
              </Typography>
              {verificationDialog.vendor?.user && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  The associated user account ({verificationDialog.vendor.user.username}) will also be {verificationDialog.action === 'verify' ? 'activated' : 'banned'}.
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
    
    </>
  );
};

export default VendorManagement;