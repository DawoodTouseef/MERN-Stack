import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import Message from "../../components/Message";
import ProgressSteps from "../../components/ProgressSteps";
import Loader from "../../components/Loader";
import { useCreateOrderMutation, usePayOrderMutation, useGetPaypalClientIdQuery } from "../../redux/api/orderApiSlice";
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
  Stack,
  Chip,
} from "@mui/material";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { useFetchOffersQuery } from "../../redux/api/offerApiSlice";
const PlaceOrder = () => {
  const navigate = useNavigate();
  const cart = useSelector((state) => state.cart);
  const currency = useSelector((state) => state.currency.selectedCurrency);
  const [createOrder, { isLoading, error }] = useCreateOrderMutation();
  const [payOrder] = usePayOrderMutation();
  const { data: paypal, isLoading: loadingPayPal, error: errorPayPal } = useGetPaypalClientIdQuery();
  const dispatch = useDispatch();

  const { data: offers, isLoading: offersLoading } = useFetchOffersQuery();
    
  const [isPaid, setIsPaid] = useState(false); // Track payment status
  const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();

  // Redirect to shipping if no address is provided
  useEffect(() => {
    if (!cart.shippingAddress || !cart.shippingAddress.street) {
      navigate("/shipping");
    }
  }, [cart.shippingAddress, navigate]);
  const getCurrencySymbol = () => {
            try {
              const formatter = new Intl.NumberFormat('en', {
                style: 'currency',
                currency: currency,
                currencyDisplay: 'symbol',
              });
        
              const parts = formatter.formatToParts(1);
              const symbol = parts.find(part => part.type === 'currency')?.value;
              return symbol || currency;
            } catch (err) {
              return currency; // fallback if currency code is invalid
            }
          };
  // Load PayPal script if payment method is PayPal
  useEffect(() => {
    if (cart.paymentMethod === "PayPal" && paypal?.clientId) {
      const loadPayPalScript = async () => {
        paypalDispatch({
          type: "resetOptions",
          value: {
            "client-id": paypal.clientId,
            currency: "USD",
          },
        });
        paypalDispatch({ type: "setLoadingStatus", value: "pending" });
      };

      if (!window.paypal) {
        loadPayPalScript();
      }
    }
  }, [cart.paymentMethod, paypal, paypalDispatch]);

  // Handle PayPal payment
  const handlePayPalPayment = async (data, actions) => {

    return actions.order.capture().then(async (details) => {
      try {
        await payOrder({ orderId: cart.orderId, details }).unwrap();
        setIsPaid(true); // Mark payment as completed
        toast.success("Payment successful!");
      } catch (error) {

        toast.error(error?.data?.message || error.message || "Payment failed");
      }
    });
  };

  // Create order after payment or for COD
  const placeOrderHandler = async () => {
    if (cart.paymentMethod === "PayPal" && !isPaid) {
      toast.error("Please complete the payment first.");
      return;
    }

    try {

      const res = await createOrder({
        orderItems: cart.cartItems,
        shippingAddress: cart.shippingAddress,
        paymentMethod: cart.paymentMethod,
        itemsPrice: cart.itemsPrice ,
        shippingPrice: cart.shippingPrice ,
        taxPrice: cart.taxPrice,
        totalPrice: cart.totalPrice ,
      }).unwrap();
      dispatch(clearCartItems());
      navigate(`/order/${res._id}`);
    } catch (error) {
      toast.error(error?.data?.message || error.error || error);
    }
  };

  const calculateDiscountedPrice = (product, offers) => {
  if (!product || !product.price) return 0; // Return 0 if product or price is undefined
  if (!offers || offers.length === 0) return product.price; // Return original price if no offers

  let discountedPrice = product.price;

  // Iterate through all offers to find applicable discounts
  offers.forEach((offer) => {
    const isProductInOffer =
      offer.products.some((p) => p._id === product._id) ||
      offer.categories.some((c) => c._id === product.category) ||
      (offer.brand && offer.brand._id === product.brand);

    if (isProductInOffer) {
      if (offer.discountUnit === "percent" && offer.endTime !== Date()) {
        discountedPrice = Math.min(
          discountedPrice,
          product.price - product.price * (offer.discountValue / 100)
        );
      } else if (offer.discountUnit === "flat") {
        discountedPrice = Math.min(
          discountedPrice,
          product.price - offer.discountValue
        );
      }
    }
  });

  return discountedPrice;
};
  
  const discountPrice = (p) => {
    return calculateDiscountedPrice(p,offers)
  };
  
  const shipping = cart.shippingAddress || {};
  const addressLine = `${shipping.street || ""}, ${shipping.city || ""}, ${
    shipping.state || ""
  } ${shipping.postalCode || ""}, ${shipping.country || ""}`;

  return (
    <>
      <ProgressSteps step1 step2 step3 step4 />

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
                  <TableCell align="center">Quantity</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cart.cartItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <img
                        src={item.media[0].url}
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
                      <Link
                        to={`/product/${item.product}`}
                        style={{
                          textDecoration: "none",
                          color: "#6366f1",
                          fontWeight: "bold",
                        }}
                      >
                        {item.name}
                      </Link>
                    </TableCell>
                    <TableCell align="center">{item.qty}</TableCell>
                    <TableCell>{getCurrencySymbol()}{discountPrice(item)}</TableCell>
                    <TableCell>{getCurrencySymbol()}{(item.qty * discountPrice(item)).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 4,
            boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
            background: "linear-gradient(135deg, #fff 70%, #f3f4f6 100%)",
          }}
        >
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, color: "#6366f1" }}>
            Order Summary
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Shipping Address
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Address:</strong> {addressLine}
              </Typography>
              <Chip
                label={shipping.label || "Delivery"}
                color={shipping.isDefault ? "success" : "default"}
                sx={{
                  mt: 1,
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  borderRadius: "999px",
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Payment Method
              </Typography>
              <Typography variant="body2">
                <strong>Method:</strong> {cart.paymentMethod}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Price Details
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2">
                  <strong>Items:</strong> {getCurrencySymbol()}{Number(cart.itemsPrice || 0).toFixed(2)}
                </Typography>
                <Typography variant="body2">
                  <strong>Shipping:</strong> {getCurrencySymbol()}{Number(cart.shippingPrice || 0).toFixed(2)}
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  <strong>Total:</strong> {getCurrencySymbol()}{Number(cart.totalPrice || 0).toFixed(2)}
                </Typography>
              </Stack>
            </Grid>
          </Grid>
          <Divider sx={{ my: 3 }} />
          {error && (
            <Message variant="danger">{error.data?.message || error.error}</Message>
          )}
          {cart.paymentMethod === "PayPal" ? (
            <Box mt={2}>
              {isPending ? (
                <Loader />
              ) : (
                <PayPalButtons createOrder={handlePayPalPayment} onApprove={handlePayPalPayment} />
              )}
            </Box>
          ) : (
            <Button
              type="button"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              sx={{
                borderRadius: 4,
                fontWeight: "bold",
                fontSize: "1.1rem",
                mt: 2,
                background: "#6366f1",
                "&:hover": { background: "#4f46e5" },
              }}
              disabled={cart.paymentMethod === "PayPal" && !isPaid}
              onClick={placeOrderHandler}
            >
              Place Order
            </Button>
          )}
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