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
  Stack,
  Avatar,
  IconButton,
  alpha
} from "@mui/material";
import {
  LocalShipping as ShippingIcon,
  Payment as PaymentIcon,
  Receipt as OrderIcon,
  Home as HomeIcon,
  CheckCircle as CheckedIcon
} from "@mui/icons-material";
import Message from "../../components/Message";
import Loader from "../../components/Loader";
import { formatVariantAttributes, getVariantSku } from "../../Utils/variantUtils";
import useCurrency from "../../hooks/useCurrency";

const PlaceOrder = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cart = useSelector((state) => state.cart);
  const { format, symbol, selectedCurrency: currentCurrencyCode } = useCurrency();

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
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", py: 6 }}>
      <Box sx={{ maxWidth: 1200, mx: "auto", px: 3 }}>
        <Typography variant="h4" fontWeight={900} color="#1e293b" sx={{ mb: 4 }}>
          Final Review
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} lg={8}>
            <Stack spacing={3}>
              {/* Shipping & Payment Section */}
              <Paper elevation={0} sx={{ p: 4, borderRadius: 5, border: '1px solid #e2e8f0', bgcolor: '#fff' }}>
                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1.5 }}>
                      <ShippingIcon sx={{ color: '#6366f1' }} />
                      <Typography variant="h6" fontWeight={800} color="#1e293b">Shipping Address</Typography>
                    </Box>
                    <Typography variant="body2" color="#475569" sx={{ lineHeight: 1.7 }}>
                      {cart.shippingAddress?.street}<br />
                      {cart.shippingAddress?.city}, {cart.shippingAddress?.state}<br />
                      {cart.shippingAddress?.country} - {cart.shippingAddress?.postalCode}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1.5 }}>
                      <PaymentIcon sx={{ color: '#6366f1' }} />
                      <Typography variant="h6" fontWeight={800} color="#1e293b">Payment Method</Typography>
                    </Box>
                    <Chip
                      label={cart.paymentMethod}
                      variant="outlined"
                      sx={{
                        fontWeight: 800,
                        color: '#6366f1',
                        borderColor: alpha('#6366f1', 0.5),
                        bgcolor: alpha('#6366f1', 0.05)
                      }}
                    />
                  </Grid>
                </Grid>
              </Paper>

              {/* Order Items */}
              <Paper elevation={0} sx={{ p: 4, borderRadius: 5, border: '1px solid #e2e8f0', bgcolor: '#fff' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1.5 }}>
                  <OrderIcon sx={{ color: '#6366f1' }} />
                  <Typography variant="h6" fontWeight={800} color="#1e293b">Order Items</Typography>
                </Box>
                <Stack spacing={2}>
                  {cart.cartItems.map((item) => (
                    <Box
                      key={item._id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 2,
                        borderRadius: 3,
                        border: '1px solid #f1f5f9',
                        '&:hover': { bgcolor: '#f8fafc' }
                      }}
                    >
                      <Avatar
                        src={item.media?.[0]?.url}
                        variant="rounded"
                        sx={{ width: 64, height: 64, borderRadius: 2 }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Link to={`/product/${item.product || item.productId || item._id.split('-')[0]}`} style={{ textDecoration: 'none' }}>
                          <Typography variant="subtitle1" fontWeight={800} color="#1e293b" sx={{ '&:hover': { color: '#6366f1' } }}>
                            {item.name}
                          </Typography>
                        </Link>
                        {item.variantId && (
                          <Typography variant="caption" color="text.secondary">
                            {formatVariantAttributes(item.selectedOptions)}
                          </Typography>
                        )}
                        <Typography variant="body2" color="primary.main" fontWeight={700} sx={{ mt: 0.5 }}>
                          {item.qty} x {format(item.price)}
                        </Typography>
                      </Box>
                      <Typography variant="subtitle1" fontWeight={900} color="#1e293b">
                        {format(item.qty * item.price)}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Stack>
          </Grid>

          {/* summary Panel */}
          <Grid item xs={12} lg={4}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 5, border: '1px solid #e2e8f0', bgcolor: '#fff', position: 'sticky', top: 20 }}>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 3, color: '#1e293b' }}>Order Summary</Typography>
              <Stack spacing={2} sx={{ mb: 4 }}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Items Subtotal</Typography>
                  <Typography variant="body2" fontWeight={700}>{format(Number(cart.itemsPrice || 0))}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Shipping Fee</Typography>
                  <Typography variant="body2" fontWeight={700} color="#10b981">{Number(cart.shippingPrice) === 0 ? 'FREE' : format(Number(cart.shippingPrice))}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Estimated Tax</Typography>
                  <Typography variant="body2" fontWeight={700}>{format(Number(cart.taxPrice || 0))}</Typography>
                </Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="h6" fontWeight={900}>Total Amount</Typography>
                  <Typography variant="h6" fontWeight={900} color="#6366f1">{format(Number(cart.totalPrice || 0))}</Typography>
                </Stack>
              </Stack>

              {error && (
                <Box sx={{ mb: 3 }}>
                  <Message variant="danger">{error.data?.message || error.error}</Message>
                </Box>
              )}

              {cart.paymentMethod === "PayPal" ? (
                <Box>
                  {isPending ? <Loader /> : (
                    <PayPalButtons
                      style={{ layout: 'vertical', shape: 'rect', label: 'pay' }}
                      createOrder={(data, actions) => {
                        return actions.order.create({
                          purchase_units: [{
                            amount: {
                              value: cart.totalPrice.toString(),
                              currency_code: 'USD'
                            }
                          }]
                        });
                      }}
                      onApprove={handlePayPalPayment}
                    />
                  )}
                </Box>
              ) : (
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={isLoading}
                  onClick={placeOrderHandler}
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
                  {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Confirm & Place Order'}
                </Button>
              )}

              <Box sx={{ mt: 3, p: 2, borderRadius: 3, bgcolor: '#f8fafc', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CheckedIcon color="success" fontSize="small" />
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  By placing this order, you agree to our terms of service
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default PlaceOrder;