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
} from "@mui/material";
import { toast } from "react-toastify";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { FaHome, FaBriefcase, FaMapPin } from "react-icons/fa";

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
    <Box sx={{ maxWidth: 800, mx: "auto", mt: 6, pb: 6 }}>
      <ProgressSteps step1 step2 />

      {/* Address Selection */}
      <Paper
        elevation={3}
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 4,
          boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
          background: "linear-gradient(135deg, #fff 70%, #f3f4f6 100%)",
        }}
      >
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: "#6366f1" }}>
          Select Shipping Address
        </Typography>
        <Divider sx={{ mb: 3 }} />
        {isLoading ? (
          <CircularProgress />
        ) : addresses.length === 0 ? (
          <>
            <Typography>No addresses found.</Typography>
            <Button
              variant="contained"
              color="secondary"
              fullWidth
              size="large"
              sx={{
                borderRadius: 4,
                fontWeight: "bold",
                fontSize: "1.1rem",
                mt: 2,
                background: "#ec4899",
                "&:hover": { background: "#be185d" },
              }}
              component={Link}
              to="/address"
            >
              <AddIcon sx={{ mr: 1 }} />
              Add New Address
            </Button>
          </>
        ) : (
          <FormControl component="fieldset" sx={{ width: "100%" }}>
            <RadioGroup
              name="selectedAddress"
              value={selectedAddressId}
              onChange={handleSelectAddress}
            >
              {addresses.map((addr) => (
                <Box
                  key={addr._id}
                  sx={{
                    mb: 2,
                    p: 2,
                    border: "1px solid #e5e7eb",
                    borderRadius: 3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    bgcolor: "#f9fafb",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    transition: "box-shadow 0.2s, border 0.2s",
                    "&:hover": {
                      boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                      border: "1px solid #ec4899",
                    },
                  }}
                >
                  <FormControlLabel
                    value={addr._id}
                    control={<Radio color="secondary" />}
                    label={
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Chip
                          icon={
                            addr.label === "Home" ? (
                              <FaHome style={{ color: "#ec4899" }} />
                            ) : addr.label === "Work" ? (
                              <FaBriefcase style={{ color: "#ec4899" }} />
                            ) : (
                              <FaMapPin style={{ color: "#ec4899" }} />
                            )
                          }
                          label={addr.label}
                          sx={{
                            bgcolor: addr.isDefault ? "#f8bbd0" : "#e3eeff",
                            color: addr.isDefault ? "#ad1457" : "#6366f1",
                            fontWeight: 700,
                            borderRadius: "999px",
                            px: 1.5,
                            fontSize: "0.95rem",
                          }}
                        />
                        <Typography>
                          <b>{addr.fullName}</b> ({addr.phone})<br />
                          {addr.street}, {addr.city}, {addr.state && `${addr.state}, `}
                          {addr.postalCode}, {addr.country}
                        </Typography>
                      </Stack>
                    }
                  />
                  <Box>
                    <Tooltip title="Delete">
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(addr._id)}
                        disabled={isDeleting}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              ))}
            </RadioGroup>
            <Button
              variant="contained"
              color="secondary"
              fullWidth
              size="large"
              sx={{
                borderRadius: 4,
                fontWeight: "bold",
                fontSize: "1.1rem",
                mt: 2,
                background: "#ec4899",
                "&:hover": { background: "#be185d" },
              }}
              component={Link}
              to="/address"
            >
              <AddIcon sx={{ mr: 1 }} />
              Add New Address
            </Button>
          </FormControl>
        )}
      </Paper>

      {/* Payment Method */}
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 4,
          boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
          background: "linear-gradient(135deg, #fff 70%, #f3f4f6 100%)",
        }}
      >
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: "#6366f1" }}>
          Select Payment Method
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <form onSubmit={handleContinue}>
          <FormControl component="fieldset" sx={{ width: "100%" }}>
            <RadioGroup
              row
              name="paymentMethod"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <FormControlLabel
                value="PayPal"
                control={<Radio color="secondary" />}
                label="PayPal or Credit Card"
              />
              <FormControlLabel
                value="COD"
                control={<Radio color="secondary" />}
                label="Cash on Delivery"
              />
            </RadioGroup>
          </FormControl>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            type="submit"
            sx={{
              borderRadius: 4,
              fontWeight: "bold",
              fontSize: "1.1rem",
              mt: 3,
              background: "#6366f1",
              "&:hover": { background: "#4f46e5" },
            }}
          >
            Continue
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default Shipping;