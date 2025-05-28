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
} from "@mui/material";
import { toast } from "react-toastify";
import DeleteIcon from "@mui/icons-material/Delete";


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
    <Box sx={{ maxWidth: 700, mx: "auto", mt: 6 }}>
      <ProgressSteps step1 step2 />

      {/* Address Selection (not in form) */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          Select Shipping Address
        </Typography>
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
              sx={{ borderRadius: 4, fontWeight: "bold", fontSize: "1.1rem", mt: 2 }}
              component={Link}
              to="/address"
            >
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
                    border: "1px solid #eee",
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    bgcolor: "#fafafa",
                  }}
                >
                  <FormControlLabel
                    value={addr._id}
                    control={<Radio color="secondary" />}
                    label={
                      <Typography>
                        <b>{addr.address}</b>, {addr.city}, {addr.state && `${addr.state}, `}
                        {addr.postalCode}, {addr.country}
                      </Typography>
                    }
                  />
                  <Box>
                    <IconButton color="error" onClick={() => handleDelete(addr._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </RadioGroup>
            <Button
              variant="contained"
              color="secondary"
              fullWidth
              size="large"
              sx={{ borderRadius: 4, fontWeight: "bold", fontSize: "1.1rem", mt: 2 }}
              component={Link}
              to="/address"
            >
              Add New Address
            </Button>
          </FormControl>
        )}
      </Paper>

      {/* Payment Method and Continue Button in Form */}
      <Paper sx={{ p: 4 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          Select Payment Method
        </Typography>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const selected = addresses.find((addr) => addr._id === selectedAddressId);
            if (!selected) {
              toast.error("Please select a shipping address.");
              return;
            }
            dispatch(saveShippingAddress(selected));
            dispatch(savePaymentMethod(paymentMethod));
            navigate("/placeorder");
          }}
        >
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
            sx={{ borderRadius: 4, fontWeight: "bold", fontSize: "1.1rem", mt: 3 }}
          >
            Continue
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default Shipping;
