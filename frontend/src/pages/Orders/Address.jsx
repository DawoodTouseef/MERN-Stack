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
  Switch,
  MenuItem
} from "@mui/material";
import { toast } from "react-toastify";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { FaMapMarkerAlt, FaHome, FaBriefcase, FaMapPin } from "react-icons/fa";

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
    <Box
      sx={{
        maxWidth: 800,
        mx: "auto",
        mt: 8,
        px: { xs: 1, md: 0 },
        pb: 8,
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f3e7e9 0%, #e3eeff 100%)",
      }}
    >
      {/* Address Form */}
      <Paper
        elevation={6}
        sx={{
          p: { xs: 2, md: 4 },
          mb: 4,
          borderRadius: 4,
          boxShadow: "0 8px 32px 0 rgba(236,72,153,0.10)",
          background: "linear-gradient(135deg, #fff 80%, #e3eeff 100%)",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <FaMapMarkerAlt style={{ color: "#ec4899", fontSize: 28 }} />
          <Typography variant="h5" fontWeight="bold" sx={{ color: "#18181b" }}>
            {editId ? "Edit Address" : "Add Address"}
          </Typography>
        </Stack>
        <Divider sx={{ mb: 3, bgcolor: "#e3eeff" }} />
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Full Name"
                name="fullName"
                fullWidth
                required
                value={form.fullName}
                onChange={handleChange}
                sx={{
                  bgcolor: "#f9fafb",
                  borderRadius: 2,
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#e3eeff" },
                    "&:hover fieldset": { borderColor: "#ec4899" },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone"
                name="phone"
                fullWidth
                required
                value={form.phone}
                onChange={handleChange}
                sx={{
                  bgcolor: "#f9fafb",
                  borderRadius: 2,
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#e3eeff" },
                    "&:hover fieldset": { borderColor: "#6366f1" },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Street"
                name="street"
                fullWidth
                required
                value={form.street}
                onChange={handleChange}
                sx={{
                  bgcolor: "#f9fafb",
                  borderRadius: 2,
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#e3eeff" },
                    "&:hover fieldset": { borderColor: "#ec4899" },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="City"
                name="city"
                fullWidth
                required
                value={form.city}
                onChange={handleChange}
                sx={{
                  bgcolor: "#f9fafb",
                  borderRadius: 2,
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#e3eeff" },
                    "&:hover fieldset": { borderColor: "#6366f1" },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="State"
                name="state"
                fullWidth
                value={form.state}
                onChange={handleChange}
                sx={{
                  bgcolor: "#f9fafb",
                  borderRadius: 2,
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#e3eeff" },
                    "&:hover fieldset": { borderColor: "#6366f1" },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Postal Code"
                name="postalCode"
                fullWidth
                required
                value={form.postalCode}
                onChange={handleChange}
                sx={{
                  bgcolor: "#f9fafb",
                  borderRadius: 2,
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#e3eeff" },
                    "&:hover fieldset": { borderColor: "#ad1457" },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Country"
                name="country"
                fullWidth
                required
                value={form.country}
                onChange={handleChange}
                sx={{
                  bgcolor: "#f9fafb",
                  borderRadius: 2,
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#e3eeff" },
                    "&:hover fieldset": { borderColor: "#ad1457" },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Label"
                name="label"
                fullWidth
                value={form.label}
                onChange={handleChange}
                sx={{
                  bgcolor: "#f9fafb",
                  borderRadius: 2,
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#e3eeff" },
                    "&:hover fieldset": { borderColor: "#ec4899" },
                  },
                }}
              >
                <MenuItem value="Home">
                  <FaHome style={{ marginRight: 8 }} />
                  Home
                </MenuItem>
                <MenuItem value="Work">
                  <FaBriefcase style={{ marginRight: 8 }} />
                  Work
                </MenuItem>
                <MenuItem value="Other">
                  <FaMapPin style={{ marginRight: 8 }} />
                  Other
                </MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography>Set as Default</Typography>
                <Switch
                  checked={form.isDefault}
                  onChange={handleToggleDefault}
                  color="secondary"
                />
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="secondary"
                fullWidth
                size="large"
                sx={{
                  borderRadius: 3,
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                  mt: 2,
                  background: "#ec4899",
                  "&:hover": { background: "#be185d" },
                  boxShadow: 2,
                  textTransform: "none",
                }}
                disabled={isAdding || isUpdating}
              >
                {(isAdding || isUpdating) ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  editId ? "Update Address" : "Add Address"
                )}
              </Button>
              {editId && (
                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  sx={{
                    mt: 2,
                    borderRadius: 3,
                    fontWeight: 600,
                    textTransform: "none",
                  }}
                  onClick={() => {
                    setEditId(null);
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
                  }}
                >
                  Cancel Edit
                </Button>
              )}
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Address List */}
      <Paper
        elevation={4}
        sx={{
          p: { xs: 2, md: 4 },
          borderRadius: 4,
          boxShadow: "0 4px 24px 0 rgba(236,72,153,0.10)",
          background: "linear-gradient(135deg, #fff 90%, #e3eeff 100%)",
        }}
      >
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: "#6366f1" }}>
          Your Addresses
        </Typography>
        <Divider sx={{ mb: 2, bgcolor: "#e3eeff" }} />
        {isLoading ? (
          <CircularProgress />
        ) : addresses.length === 0 ? (
          <Typography color="text.secondary">No addresses found.</Typography>
        ) : (
          addresses.map((addr) => (
            <Box
              key={addr._id}
              sx={{
                mb: 2,
                p: 2,
                border: "1.5px solid #e3eeff",
                borderRadius: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                bgcolor: "#fafafa",
                boxShadow: "0 2px 8px #ec489933",
                transition: "box-shadow 0.2s, border 0.2s",
                "&:hover": {
                  boxShadow: "0 4px 16px #ec489955",
                  border: "1.5px solid #ec4899",
                },
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Chip
                  icon={<FaMapMarkerAlt style={{ color: "#ec4899" }} />}
                  label={addr.label || "Delivery"}
                  sx={{
                    bgcolor: addr.isDefault ? "#f8bbd0" : "#e3eeff",
                    color: addr.isDefault ? "#ad1457" : "#6366f1",
                    fontWeight: 700,
                    borderRadius: "999px",
                    px: 1.5,
                    fontSize: "0.95rem",
                  }}
                />
                <Typography sx={{ color: "#18181b" }}>
                  <b>{addr.fullName}</b> ({addr.phone})<br />
                  <b>{addr.street}</b>, {addr.city}, {addr.state && `${addr.state}, `}
                  {addr.postalCode}, {addr.country}
                </Typography>
              </Stack>
              <Box>
                <Tooltip title="Edit">
                  <IconButton color="primary" onClick={() => handleEdit(addr)}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton color="error" onClick={() => handleDelete(addr._id)}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          ))
        )}
      </Paper>
    </Box>
  );
};

export default Address;