import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import {
  saveShippingAddress,
  savePaymentMethod,
} from "../../redux/features/cart/cartSlice";
import ProgressSteps from "../../components/ProgressSteps";
import {
  useGetAddressQuery,
  useDeleteAddressMutation,
} from "../../redux/api/addressApiSlice";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  IconButton,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Stack,
  Divider,
  Tooltip,
  Chip,
  Grid,
} from "@mui/material";
import { alpha } from "@mui/system";
import { toast } from "react-toastify";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Home as HomeIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Payment as PaymentIcon,
  LocalShipping as ShippingIcon
} from "@mui/icons-material";
import { APP_NAME } from "../../redux/constants";

const Shipping = () => {
  const cart = useSelector((state) => state.cart);
  const { data: addresses = [], isLoading, refetch } = useGetAddressQuery();
  const [deleteAddress, { isLoading: isDeleting }] = useDeleteAddressMutation();

  const { shippingAddress } = cart;
  const [paymentMethod, setPaymentMethod] = useState("PayPal");
  const [selectedAddressId, setSelectedAddressId] = useState(shippingAddress?._id || "");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Delete address
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      try {
        await deleteAddress(id).unwrap();
        toast.success("Address deleted!");
        refetch();
        if (selectedAddressId === id) setSelectedAddressId("");
      } catch (error) {
        toast.error(error?.data?.message || error.error || "Delete failed");
      }
    }
  };

  // Select address radio
  const handleSelectAddress = (e) => {
    setSelectedAddressId(e.target.value);
  };

  // Continue to place order
  const handleContinue = (e) => {
    e.preventDefault();
    const selected = addresses.find((addr) => addr._id === selectedAddressId);
    if (!selected) {
      toast.error("Please select a shipping address.");
      return;
    }
    dispatch(saveShippingAddress(selected));
    dispatch(savePaymentMethod(paymentMethod));

    navigate("/placeorder");
  };

  useEffect(() => {
    if (addresses.length && !selectedAddressId) {
      setSelectedAddressId(addresses[0]._id);
    }
  }, [addresses, selectedAddressId]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", py: 10 }}>
      <Box sx={{ maxWidth: 1000, mx: "auto", px: 3 }}>
        <Box sx={{ mb: 6 }}>
          <ProgressSteps step1 step2 />
        </Box>

        <Grid container spacing={4}>
          {/* Address Selection Section */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight={800} sx={{ color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
                <ShippingIcon color="primary" /> Shipping Address
              </Typography>
              <Button
                component={Link}
                to="/address"
                size="small"
                startIcon={<AddIcon />}
                sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
              >
                Manage Addresses
              </Button>
            </Stack>

            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={30} /></Box>
            ) : addresses.length === 0 ? (
              <Paper elevation={0} sx={{ p: 6, borderRadius: 5, border: '1px dashed #cbd5e1', bgcolor: 'transparent', textAlign: 'center' }}>
                <LocationIcon sx={{ fontSize: 60, color: '#e2e8f0', mb: 2 }} />
                <Typography variant="body1" fontWeight={700} color="#64748b">No addresses found</Typography>
                <Button
                  component={Link}
                  to="/address"
                  variant="contained"
                  sx={{ mt: 3, borderRadius: 3, fontWeight: 800, bgcolor: '#6366f1' }}
                >
                  Add New Address
                </Button>
              </Paper>
            ) : (
              <FormControl component="fieldset" sx={{ width: "100%" }}>
                <RadioGroup name="selectedAddress" value={selectedAddressId} onChange={handleSelectAddress}>
                  <Stack spacing={2}>
                    {addresses.map((addr) => (
                      <Paper
                        key={addr._id}
                        elevation={0}
                        sx={{
                          p: 3,
                          borderRadius: 4,
                          border: '1px solid',
                          borderColor: selectedAddressId === addr._id ? '#6366f1' : '#e2e8f0',
                          bgcolor: selectedAddressId === addr._id ? alpha('#6366f1', 0.02) : '#fff',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: '#6366f1',
                            bgcolor: alpha('#6366f1', 0.04)
                          }
                        }}
                        onClick={() => setSelectedAddressId(addr._id)}
                      >
                        <Stack direction="row" alignItems="flex-start" spacing={2}>
                          <Radio
                            value={addr._id}
                            checked={selectedAddressId === addr._id}
                            sx={{ p: 0, mt: 0.5 }}
                          />
                          <Box sx={{ flex: 1 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Typography variant="subtitle1" fontWeight={800}>{addr.fullName}</Typography>
                                <Chip
                                  label={addr.label}
                                  size="small"
                                  variant="outlined"
                                  sx={{
                                    fontWeight: 800,
                                    fontSize: '0.65rem',
                                    height: 20,
                                    color: addr.label === 'Work' ? '#3b82f6' : addr.label === 'Home' ? '#10b981' : '#6366f1',
                                    borderColor: alpha(addr.label === 'Work' ? '#3b82f6' : addr.label === 'Home' ? '#10b981' : '#6366f1', 0.2)
                                  }}
                                />
                                {addr.isDefault && (
                                  <Chip label="DEFAULT" size="small" color="primary" sx={{ fontWeight: 900, borderRadius: 1.5, fontSize: '0.6rem', height: 20 }} />
                                )}
                              </Stack>
                              <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleDelete(addr._id); }}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>{addr.phone}</Typography>
                            <Typography variant="body2" sx={{ color: '#475569' }}>
                              {addr.street}, {addr.city}, {addr.state}, {addr.postalCode}, {addr.country}
                            </Typography>
                          </Box>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                </RadioGroup>
              </FormControl>
            )}
          </Grid>

          {/* Payment & Action Section */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 5, border: '1px solid #e2e8f0', bgcolor: '#fff', position: 'sticky', top: 20 }}>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 3, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
                <PaymentIcon color="primary" /> Payment Method
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <form onSubmit={handleContinue}>
                <RadioGroup
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  sx={{ mb: 4 }}
                >
                  <Stack spacing={2}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: paymentMethod === 'PayPal' ? '#6366f1' : '#e2e8f0',
                        bgcolor: paymentMethod === 'PayPal' ? alpha('#6366f1', 0.02) : '#f8fafc',
                        cursor: 'pointer'
                      }}
                      onClick={() => setPaymentMethod('PayPal')}
                    >
                      <FormControlLabel
                        value="PayPal"
                        control={<Radio size="small" />}
                        label={<Typography variant="body2" fontWeight={700}>PayPal or Credit Card</Typography>}
                        sx={{ m: 0, width: '100%' }}
                      />
                    </Paper>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: paymentMethod === 'COD' ? '#6366f1' : '#e2e8f0',
                        bgcolor: paymentMethod === 'COD' ? alpha('#6366f1', 0.02) : '#f8fafc',
                        cursor: 'pointer'
                      }}
                      onClick={() => setPaymentMethod('COD')}
                    >
                      <FormControlLabel
                        value="COD"
                        control={<Radio size="small" />}
                        label={<Typography variant="body2" fontWeight={700}>Cash on Delivery</Typography>}
                        sx={{ m: 0, width: '100%' }}
                      />
                    </Paper>
                  </Stack>
                </RadioGroup>

                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  size="large"
                  sx={{
                    borderRadius: 3,
                    py: 2,
                    fontWeight: 800,
                    textTransform: 'none',
                    bgcolor: '#6366f1',
                    '&:hover': { bgcolor: '#4f46e5' },
                    boxShadow: '0 8px 20px rgba(99, 102, 241, 0.2)'
                  }}
                >
                  Continue to Review
                </Button>

                <Typography variant="caption" align="center" display="block" color="text.secondary" sx={{ mt: 2 }}>
                  Secure checkout powered by {APP_NAME}
                </Typography>
              </form>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Shipping;