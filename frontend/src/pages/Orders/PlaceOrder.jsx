import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import Message from "../../components/Message";
import ProgressSteps from "../../components/ProgressSteps";
import Loader from "../../components/Loader";
import { useCreateOrderMutation } from "../../redux/api/orderApiSlice";
import { clearCartItems } from "../../redux/features/cart/cartSlice";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Divider,
  Grid,
} from "@mui/material";

const PlaceOrder = () => {
  const navigate = useNavigate();
  const cart = useSelector((state) => state.cart);
  const [createOrder, { isLoading, error }] = useCreateOrderMutation();
  const dispatch = useDispatch();

  // Fix: Check for both address and street fields
  useEffect(() => {
    const addr = cart.shippingAddress;
    if (
      !addr ||
      (!addr.address && !addr.street)
    ) {
      navigate("/shipping");
    }
  }, [cart.shippingAddress, navigate]);

  const placeOrderHandler = async () => {
    try {
      const res = await createOrder({
        orderItems: cart.cartItems,
        shippingAddress: cart.shippingAddress,
        paymentMethod: cart.paymentMethod,
        itemsPrice: cart.itemsPrice,
        shippingPrice: cart.shippingPrice,
        taxPrice: cart.taxPrice,
        totalPrice: cart.totalPrice,
      }).unwrap();
      dispatch(clearCartItems());
      navigate(`/order/${res._id}`);
    } catch (error) {
      toast.error(error?.data?.message || error.error || error);
    }
  };

  // Helper to display address
  const shipping = cart.shippingAddress || {};
  const addressLine =
    shipping.address ||
    shipping.street ||
    "";
  const city = shipping.city || "";
  const state = shipping.state ? `${shipping.state}, ` : "";
  const postalCode = shipping.postalCode || "";
  const country = shipping.country || "";

  return (
    <>
      <ProgressSteps step1 step2 step3 />

      <Box sx={{ maxWidth: "1200px", mx: "auto", mt: 8 }}>
        {cart.cartItems.length === 0 ? (
          <Message>Your cart is empty</Message>
        ) : (
          <TableContainer component={Paper} sx={{ borderRadius: 3, mb: 4 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Image</TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cart.cartItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{
                          width: 64,
                          height: 64,
                          objectFit: "cover",
                          borderRadius: 8,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Link to={`/product/${item.product}`}>{item.name}</Link>
                    </TableCell>
                    <TableCell>{item.qty}</TableCell>
                    <TableCell>${item.price.toFixed(2)}</TableCell>
                    <TableCell>${(item.qty * item.price).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Paper sx={{ p: 4, bgcolor: "#181818", color: "#fff" }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
            Order Summary
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Items:</strong> ${cart.itemsPrice}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Shipping:</strong> ${cart.shippingPrice}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Tax:</strong> ${cart.taxPrice}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Total:</strong> ${cart.totalPrice}
                </Typography>
              </Box>
              {error && (
                <Box sx={{ mt: 2 }}>
                  <Message variant="danger">
                    {error.data?.message || error.error || error}
                  </Message>
                </Box>
              )}
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Shipping
              </Typography>
              <Typography variant="body2">
                <strong>Address:</strong> {addressLine}, {city}, {state}
                {postalCode}, {country}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Payment Method
              </Typography>
              <Typography variant="body2">
                <strong>Method:</strong> {cart.paymentMethod}
              </Typography>
            </Grid>
          </Grid>
          <Divider sx={{ my: 3, bgcolor: "#333" }} />
          <Button
            type="button"
            variant="contained"
            color="secondary"
            fullWidth
            size="large"
            sx={{
              borderRadius: 4,
              fontWeight: "bold",
              fontSize: "1.1rem",
              mt: 2,
            }}
            disabled={cart.cartItems.length === 0}
            onClick={placeOrderHandler}
          >
            Place Order
          </Button>
          {isLoading && (
            <Box sx={{ mt: 2 }}>
              <Loader />
            </Box>
          )}
        </Paper>
      </Box>
    </>
  );
};

export default PlaceOrder;
