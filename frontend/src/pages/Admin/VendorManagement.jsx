import React, { useState } from 'react';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, Grid, Alert } from '@mui/material';
import { useGetVendorsQuery, useCreateVendorMutation, useUpdateVendorMutation, useDeleteVendorMutation } from '../../redux/api/vendorApiSlice';
import { DataGrid } from '@mui/x-data-grid';
import { Add, Edit, Delete, Visibility } from '@mui/icons-material';
import Loader from '../../components/Loader';
import { useTheme } from '@mui/material/styles';

const VendorManagement = () => {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // create or edit
  const [currentVendor, setCurrentVendor] = useState(null);
  
  const { data: vendorsData, isLoading, error, refetch } = useGetVendorsQuery({ 
    pageNumber: page + 1, 
    pageSize 
  });
  
  const [createVendor, { isLoading: isCreating }] = useCreateVendorMutation();
  const [updateVendor, { isLoading: isUpdating }] = useUpdateVendorMutation();
  const [deleteVendor, { isLoading: isDeleting }] = useDeleteVendorMutation();
  
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

  const columns = [
    { 
      field: 'name', 
      headerName: 'Vendor Name', 
      flex: 1,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="bold">{params.row.name}</Typography>
          <Typography variant="caption" color="textSecondary">{params.row.email}</Typography>
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
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Box>
          <IconButton 
            size="small" 
            onClick={() => handleOpenEdit(params.row)}
            sx={{ mr: 1 }}
          >
            <Edit fontSize="small" />
          </IconButton>
          <IconButton 
            size="small" 
            onClick={() => handleDelete(params.row._id)}
            color="error"
          >
            <Delete fontSize="small" />
          </IconButton>
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

      <Paper sx={{ p: 2, borderRadius: 2 }}>
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
    </Box>
  );
};

export default VendorManagement;