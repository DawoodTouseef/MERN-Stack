import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    TextField,
    Button,
    Avatar,
    Divider,
    Stack,
    CircularProgress,
    Alert,
    Chip
} from '@mui/material';
import {
    Save as SaveIcon,
    Store as StoreIcon,
    Business as BusinessIcon,
    ContactPhone as PhoneIcon,
    Email as EmailIcon,
} from '@mui/icons-material';
import { useGetVendorProfileQuery, useUpdateVendorMutation } from '../../redux/api/vendorApiSlice';
import { toast } from 'react-toastify';

const VendorShopSettings = () => {
    const { data: profile, isLoading, isError, refetch } = useGetVendorProfileQuery();
    const [updateVendor, { isLoading: isUpdating }] = useUpdateVendorMutation();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        phone: '',
        address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
        },
        businessType: '',
        taxId: '',
        contactPerson: {
            name: '',
            email: ''
        }
    });

    useEffect(() => {
        if (profile) {
            setFormData({
                name: profile.name || '',
                description: profile.description || '',
                phone: profile.phone || '',
                address: {
                    street: profile.address?.street || '',
                    city: profile.address?.city || '',
                    state: profile.address?.state || '',
                    zipCode: profile.address?.zipCode || '',
                    country: profile.address?.country || ''
                },
                businessType: profile.businessType || '',
                taxId: profile.taxId || '',
                contactPerson: {
                    name: profile.contactPerson?.name || '',
                    email: profile.contactPerson?.email || ''
                }
            });
        }
    }, [profile]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
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
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateVendor({
                vendorId: profile._id,
                ...formData
            }).unwrap();
            toast.success('Shop profile updated successfully');
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to update shop profile');
        }
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (isError) {
        return (
            <Alert severity="error" sx={{ m: 3 }}>
                Failed to load shop settings. Please try again.
            </Alert>
        );
    }

    return (
        <Box sx={{ p: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={900} color="#1e293b">
                    Shop Settings
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Manage your vendor identity and contact information
                </Typography>
            </Box>

            <form onSubmit={handleSubmit}>
                <Grid container spacing={4}>
                    {/* Brand Identity */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #e2e8f0', height: '100%' }}>
                            <Box sx={{ textAlign: 'center', mb: 3 }}>
                                <Avatar
                                    sx={{
                                        width: 100,
                                        height: 100,
                                        margin: '0 auto',
                                        bgcolor: 'primary.main',
                                        mb: 2,
                                        boxShadow: '0 8px 16px rgba(99, 102, 241, 0.2)'
                                    }}
                                >
                                    <StoreIcon sx={{ fontSize: 50 }} />
                                </Avatar>
                                <Typography variant="h6" fontWeight={700}>
                                    {formData.name || 'Your Shop'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Vendor ID: {profile._id}
                                </Typography>
                            </Box>
                            <Divider sx={{ mb: 3 }} />
                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, color: '#475569' }}>
                                Quick Info
                            </Typography>
                            <Stack spacing={2}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <BusinessIcon color="action" fontSize="small" />
                                    <Typography variant="body2">{formData.businessType || 'N/A'}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <EmailIcon color="action" fontSize="small" />
                                    <Typography variant="body2">{formData.contactPerson?.email || 'N/A'}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <PhoneIcon color="action" fontSize="small" />
                                    <Typography variant="body2">{formData.phone || 'N/A'}</Typography>
                                </Box>
                            </Stack>
                        </Paper>
                    </Grid>

                    {/* Form Fields */}
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #e2e8f0' }}>
                            <Typography variant="h6" fontWeight={800} sx={{ mb: 3, color: '#1e293b' }}>
                                Store Information
                            </Typography>
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Shop Name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Phone Number"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                    />
                                </Grid>
                                <Grid size={12}>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={3}
                                        label="Shop Description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                    />
                                </Grid>

                                <Grid size={12}>
                                    <Divider sx={{ my: 1 }}>
                                        <Chip label="Location Details" size="small" />
                                    </Divider>
                                </Grid>

                                <Grid size={12}>
                                    <TextField
                                        fullWidth
                                        label="Street Address"
                                        name="address.street"
                                        value={formData.address.street}
                                        onChange={handleChange}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="City"
                                        name="address.city"
                                        value={formData.address.city}
                                        onChange={handleChange}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="State / Province"
                                        name="address.state"
                                        value={formData.address.state}
                                        onChange={handleChange}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Zip / Postal Code"
                                        name="address.zipCode"
                                        value={formData.address.zipCode}
                                        onChange={handleChange}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Country"
                                        name="address.country"
                                        value={formData.address.country}
                                        onChange={handleChange}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                    />
                                </Grid>

                                <Grid size={12}>
                                    <Divider sx={{ my: 1 }}>
                                        <Chip label="Account Manager" size="small" />
                                    </Divider>
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Contact Name"
                                        name="contactPerson.name"
                                        value={formData.contactPerson.name}
                                        onChange={handleChange}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Contact Email"
                                        name="contactPerson.email"
                                        value={formData.contactPerson.email}
                                        onChange={handleChange}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                    />
                                </Grid>
                            </Grid>

                            <Box sx={{ mt: 5, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => refetch()}
                                    sx={{ borderRadius: 3, fontWeight: 700, textTransform: 'none', px: 4 }}
                                >
                                    Reset
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={isUpdating}
                                    startIcon={isUpdating ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                                    sx={{
                                        borderRadius: 3,
                                        fontWeight: 800,
                                        textTransform: 'none',
                                        px: 6,
                                        bgcolor: '#6366f1',
                                        '&:hover': { bgcolor: '#4f46e5' }
                                    }}
                                >
                                    {isUpdating ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </form>
        </Box>
    );
};

export default VendorShopSettings;
