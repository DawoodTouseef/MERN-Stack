import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useCreateOrderMutation } from "../../redux/api/orderApiSlice";
import { useGetPaypalClientIdQuery } from "../../redux/api/orderApiSlice";
import { useFetchOffersQuery } from "../../redux/api/offerApiSlice";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { toast } from "react-toastify";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Button,
  Grid,
  Divider,
  Chip,
} from "@mui/material";
import Message from "../../components/Message";
import Loader from "../../components/Loader";
import { formatVariantAttributes, getVariantSku } from "../../Utils/variantUtils";

const PlaceOrder = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cart = useSelector((state) => state.cart);
  const currency = useSelector((state) => state.currency.selectedCurrency);
  const price = useSelector((state) => state.currency.price);

  const [createOrder, { isLoading, error }] = useCreateOrderMutation();
  const { data: paypal } = useGetPaypalClientIdQuery();
  const { data: offers } = useFetchOffersQuery();
  
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
      // Prepare order items with variant information
      const orderItems = cart.cartItems.map(item => ({
        // For variants, send productId and variantId
        ...(item.variantId ? {
          productId: item._id.split('-')[0], // Extract product ID from variant ID
          variantId: item.variantId,
          sku: item.sku || getVariantSku(item),
          qty: item.qty
        } : {
          // For regular products
          productId: item._id,
          qty: item.qty
        })
      }));

      const res = await createOrder({
        orderItems,
        shippingAddress: cart.shippingAddress,
        paymentMethod: cart.paymentMethod,
        itemsPrice: cart.itemsPrice,
        shippingPrice: cart.shippingPrice,
        taxPrice: cart.taxPrice,
        totalPrice: cart.totalPrice,
      }).unwrap();

      // Clear cart
      dispatch({ type: "cart/clearCartItems" });
      navigate(`/order/${res._id}`);
    } catch (err) {
      toast.error(err?.data?.message || err.error || "Failed to place order");
    }
  };

  return (
    <>
      <Box sx={{ maxWidth: 1200, mx: "auto", p: 2 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
          Place Order
        </Typography>
        <Paper elevation={3} sx={{ p: 3, borderRadius: 4 }}>
          <Grid container spacing={3}>
            {/* Shipping Info */}
            <Grid item xs={12} md={8}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Shipping
              </Typography>
              <Typography>
                <strong>Address:</strong> {cart.shippingAddress?.street}, {cart.shippingAddress?.city},{" "}
                {cart.shippingAddress?.state}, {cart.shippingAddress?.country} -{" "}
                {cart.shippingAddress?.postalCode}
              </Typography>
              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" sx={{ mb: 2 }}>
                Payment Method
              </Typography>
              <Typography>
                <strong>Method:</strong> {cart.paymentMethod}
              </Typography>
              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" sx={{ mb: 2 }}>
                Order Items
              </Typography>
              {cart.cartItems.map((item) => (
                <Box
                  key={item._id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 2,
                    pb: 2,
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <img
                    src={item.media?.[0]?.url}
                    alt={item.name}
                    style={{
                      width: 60,
                      height: 60,
                      objectFit: "cover",
                      borderRadius: 4,
                      marginRight: 16,
                    }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Link
                      to={`/product/${item.product || item.productId || item._id.split('-')[0]}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <Typography variant="body1" fontWeight="bold">
                        {item.name}
                      </Typography>
                    </Link>
                    
                    {/* Variant Information */}
                    {item.variantId && (
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          {formatVariantAttributes({ 
                            color: item.selectedOptions?.color,
                            size: item.selectedOptions?.size,
                            storage: item.selectedOptions?.storage
                          })}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                          SKU: {item.sku || getVariantSku(item)}
                        </Typography>
                      </Box>
                    )}
                    
                    <Typography variant="body2">
                      {item.qty} x {getCurrencySymbol()}{(item.price * price).toFixed(2)} ={" "}
                      {getCurrencySymbol()}{(item.qty * item.price * price).toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Grid>

            {/* Order Summary */}
            <Grid item xs={12} md={4}>
              <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Order Summary
                </Typography>
                <Typography variant="body2">
                  <strong>Items:</strong> {getCurrencySymbol()}{Number(cart.itemsPrice || 0).toFixed(2)}
                </Typography>
                <Typography variant="body2">
                  <strong>Shipping:</strong> {getCurrencySymbol()}{Number(cart.shippingPrice || 0).toFixed(2)}
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  <strong>Total:</strong> {getCurrencySymbol()}{Number(cart.totalPrice || 0).toFixed(2)}
                </Typography>
              </Paper>
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