import { useState } from "react";
import {
  useGetAddressQuery,
  useAddAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
} from "../../redux/api/addressApiSlice";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  CircularProgress,
  IconButton,
  Stack,
  Divider,
  Chip,
  Tooltip,
  MenuItem,
  Avatar,
  alpha
} from "@mui/material";
import { toast } from "react-toastify";
import {
  Add as AddIcon,
  Home as HomeIcon,
  Business as BusinessIcon,
  MoreHoriz as OtherIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  CheckCircle as CheckedIcon,
  RadioButtonUnchecked as UncheckedIcon,
  LocationOn as LocationIcon
} from "@mui/icons-material";

const Address = () => {
  const { data: addresses = [], isLoading, refetch } = useGetAddressQuery();
  const [addAddress, { isLoading: isAdding }] = useAddAddressMutation();
  const [updateAddress, { isLoading: isUpdating }] = useUpdateAddressMutation();
  const [deleteAddress, { isLoading: isDeleting }] = useDeleteAddressMutation();

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    label: "Home",
    isDefault: false,
  });
  const [editId, setEditId] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleToggleDefault = () => {
    setForm({ ...form, isDefault: !form.isDefault });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateAddress({ ...form, _id: editId }).unwrap();
        toast.success("Address updated!");
      } else {
        await addAddress(form).unwrap();
        toast.success("Address added!");
      }
      setForm({
        fullName: "",
        phone: "",
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
        label: "Home",
        isDefault: false,
      });
      setEditId(null);
      refetch();
    } catch (error) {
      console.log(error)
      toast.error(error?.data?.message || error.error || "Failed to save address");
    }
  };

  const handleEdit = (address) => {
    setForm({
      fullName: address.fullName,
      phone: address.phone,
      street: address.street,
      city: address.city,
      state: address.state || "",
      postalCode: address.postalCode,
      country: address.country,
      label: address.label || "Home",
      isDefault: address.isDefault || false,
    });
    setEditId(address._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      try {
        await deleteAddress(id).unwrap();
        toast.success("Address deleted!");
        refetch();
      } catch (error) {
        toast.error(error?.data?.message || error.error || "Delete failed");
      }
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", py: 10 }}>
      <Box sx={{ maxWidth: 1000, mx: "auto", px: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 6 }}>
          <Box>
            <Typography variant="h4" fontWeight={900} color="#1e293b" sx={{ mb: 1 }}>
              Address Book
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your shipping and delivery addresses
            </Typography>
          </Box>
        </Stack>

        <Grid container spacing={4}>
          {/* Address List Section */}
          <Grid item xs={12} md={7}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 3, color: '#475569', display: 'flex', alignItems: 'center', gap: 1 }}>
              Saved Addresses <Chip label={addresses.length} size="small" sx={{ fontWeight: 800, bgcolor: '#e2e8f0' }} />
            </Typography>

            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={30} /></Box>
            ) : addresses.length === 0 ? (
              <Paper elevation={0} sx={{ p: 6, borderRadius: 5, border: '1px dashed #cbd5e1', bgcolor: 'transparent', textAlign: 'center' }}>
                <LocationIcon sx={{ fontSize: 60, color: '#e2e8f0', mb: 2 }} />
                <Typography variant="body1" fontWeight={700} color="#64748b">No addresses found</Typography>
                <Typography variant="body2" color="text.secondary">Add a new address to continue</Typography>
              </Paper>
            ) : (
              <Stack spacing={2}>
                {addresses.map((addr) => (
                  <Paper
                    key={addr._id}
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 4,
                      border: '1px solid',
                      borderColor: addr.isDefault ? '#6366f1' : '#e2e8f0',
                      bgcolor: '#fff',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        borderColor: '#6366f1'
                      },
                      position: 'relative'
                    }}
                  >
                    {addr.isDefault && (
                      <Chip
                        label="DEFAULT"
                        size="small"
                        color="primary"
                        sx={{ position: 'absolute', top: 12, right: 12, fontWeight: 900, borderRadius: 1.5, fontSize: '0.65rem' }}
                      />
                    )}
                    <Stack direction="row" spacing={2}>
                      <Avatar
                        sx={{
                          bgcolor: alpha(addr.label === 'Work' ? '#3b82f6' : addr.label === 'Home' ? '#10b981' : '#6366f1', 0.1),
                          color: addr.label === 'Work' ? '#3b82f6' : addr.label === 'Home' ? '#10b981' : '#6366f1'
                        }}
                      >
                        {addr.label === 'Work' ? <BusinessIcon /> : addr.label === 'Home' ? <HomeIcon /> : <LocationIcon />}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 0.5 }}>{addr.fullName}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{addr.phone}</Typography>
                        <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500 }}>
                          {addr.street}, {addr.city}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                          {addr.state}, {addr.postalCode}, {addr.country}
                        </Typography>

                        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                          <Button
                            size="small"
                            startIcon={<EditIcon fontSize="small" />}
                            onClick={() => handleEdit(addr)}
                            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            startIcon={<DeleteIcon fontSize="small" />}
                            onClick={() => handleDelete(addr._id)}
                            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                          >
                            Delete
                          </Button>
                        </Stack>
                      </Box>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            )}
          </Grid>

          {/* Form Section */}
          <Grid item xs={12} md={5}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 5, border: '1px solid #e2e8f0', bgcolor: '#fff', position: 'sticky', top: 20 }}>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 4, color: '#1e293b' }}>
                {editId ? "Update Address" : "Add New Address"}
              </Typography>
              <form onSubmit={handleSubmit}>
                <Stack spacing={2.5}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    required
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                  />
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                  />
                  <TextField
                    fullWidth
                    label="Street Address"
                    name="street"
                    value={form.street}
                    onChange={handleChange}
                    required
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                  />
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="City"
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        required
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="State"
                        name="state"
                        value={form.state}
                        onChange={handleChange}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                      />
                    </Grid>
                  </Grid>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Postal Code"
                        name="postalCode"
                        value={form.postalCode}
                        onChange={handleChange}
                        required
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Country"
                        name="country"
                        value={form.country}
                        onChange={handleChange}
                        required
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                      />
                    </Grid>
                  </Grid>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        select
                        fullWidth
                        label="Address Label"
                        name="label"
                        value={form.label}
                        onChange={handleChange}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                      >
                        <MenuItem value="Home"><Stack direction="row" alignItems="center" gap={1}><HomeIcon fontSize="small" /> Home</Stack></MenuItem>
                        <MenuItem value="Work"><Stack direction="row" alignItems="center" gap={1}><BusinessIcon fontSize="small" /> Work</Stack></MenuItem>
                        <MenuItem value="Other"><Stack direction="row" alignItems="center" gap={1}><OtherIcon fontSize="small" /> Other</Stack></MenuItem>
                      </TextField>
                    </Grid>
                  </Grid>

                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 2,
                      borderRadius: 3,
                      bgcolor: '#f8fafc',
                      cursor: 'pointer'
                    }}
                    onClick={handleToggleDefault}
                  >
                    <Typography variant="body2" fontWeight={700} color="#475569">Set as default address</Typography>
                    {form.isDefault ? <CheckedIcon color="primary" /> : <UncheckedIcon color="disabled" />}
                  </Box>

                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    disabled={isAdding || isUpdating}
                    sx={{
                      borderRadius: 3,
                      py: 1.5,
                      fontWeight: 800,
                      textTransform: 'none',
                      bgcolor: '#6366f1',
                      '&:hover': { bgcolor: '#4f46e5' }
                    }}
                  >
                    {(isAdding || isUpdating) ? <CircularProgress size={24} color="inherit" /> : (editId ? "Update Address" : "Save Address")}
                  </Button>

                  {editId && (
                    <Button
                      fullWidth
                      variant="text"
                      onClick={() => {
                        setEditId(null);
                        setForm({ fullName: "", phone: "", street: "", city: "", state: "", postalCode: "", country: "", label: "Home", isDefault: false });
                      }}
                      sx={{ textTransform: 'none', fontWeight: 700, color: 'text.secondary' }}
                    >
                      Cancel Editing
                    </Button>
                  )}
                </Stack>
              </form>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Address;