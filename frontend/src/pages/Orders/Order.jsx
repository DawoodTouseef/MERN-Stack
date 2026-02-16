import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  Paper,
  Typography,
  Button,
  Box,
  CircularProgress,
  Chip,
  Divider,
  Stack,
  Grid,
  Avatar,
  alpha
} from "@mui/material";
import {
  LocalShipping as ShippingIcon,
  Payment as PaymentIcon,
  Receipt as OrderIcon,
  Home as HomeIcon,
  CheckCircle as CheckedIcon,
  HelpOutline as SupportIcon,
  ArrowBack as BackIcon
} from "@mui/icons-material";
import Message from "../../components/Message";
import Loader from "../../components/Loader";
import {
  useDeliverOrderMutation,
  useGetOrderDetailsQuery,
  useGetPaypalClientIdQuery,
  usePayOrderMutation,
} from "../../redux/api/orderApiSlice";
import { useFetchOffersQuery } from "../../redux/api/offerApiSlice";
import useCurrency from "../../hooks/useCurrency";
import DocumentTitle from "react-document-title";
import { APP_NAME } from "../../redux/constants";

const Order = () => {
  const { id: orderId } = useParams();
  const { format } = useCurrency();

  const {
    data: order,
    refetch,
    isLoading,
    error,
  } = useGetOrderDetailsQuery(orderId);

  const [payOrder, { isLoading: loadingPay }] = usePayOrderMutation();
  const [deliverOrder, { isLoading: loadingDeliver }] = useDeliverOrderMutation();
  const { userInfo } = useSelector((state) => state.auth);

  const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();
  const {
    data: paypal,
    isLoading: loadingPayPal,
    error: errorPayPal,
  } = useGetPaypalClientIdQuery();
  const { data: offers, isLoading: offersLoading } = useFetchOffersQuery();

  useEffect(() => {
    if (!errorPayPal && !loadingPayPal && paypal?.clientId) {
      const loadPayPalScript = async () => {
        paypalDispatch({
          type: "resetOptions",
          value: {
            "client-id": paypal.clientId,
            currency: order?.currency || "USD",
          },
        });
        paypalDispatch({ type: "setLoadingStatus", value: "pending" });
      };

      if (order && !order.isPaid) {
        if (!window.paypal) {
          loadPayPalScript();
        }
      }
    }
  }, [errorPayPal, loadingPayPal, order, paypal, paypalDispatch]);

  const onApprove = async (data, actions) => {
    return actions.order.capture().then(async (details) => {
      try {
        await payOrder({ orderId, details });
        refetch();
        toast.success("Order is paid");
      } catch (error) {
        toast.error(error?.data?.message || error.message);
      }
    });
  };

  const deliverHandler = async () => {
    await deliverOrder(orderId);
    refetch();
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return '#10b981';
      case 'shipped': return '#6366f1';
      case 'processing': return '#f59e0b';
      case 'cancelled': return '#ef4444';
      default: return '#64748b';
    }
  };

  return (
    <DocumentTitle title={`Order ${order?.orderNumber || ''} - ${APP_NAME}`}>
      <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", py: 6 }}>
        <Box sx={{ maxWidth: 1200, mx: "auto", px: 3 }}>
          {isLoading ? (
            <Loader />
          ) : error ? (
            <Message variant="danger">{error.data?.message || error.error}</Message>
          ) : (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                  <Button
                    component={Link}
                    to="/orders"
                    startIcon={<BackIcon />}
                    sx={{ color: '#64748b', mb: 1, textTransform: 'none', fontWeight: 600 }}
                  >
                    Back to Orders
                  </Button>
                  <Typography variant="h4" fontWeight={900} color="#1e293b">
                    Order #{order.orderNumber}
                  </Typography>
                </Box>
                <Chip
                  label={order.orderStatus}
                  sx={{
                    bgcolor: alpha(getStatusColor(order.orderStatus), 0.1),
                    color: getStatusColor(order.orderStatus),
                    fontWeight: 800,
                    px: 1
                  }}
                />
              </Box>

              <Grid container spacing={4}>
                <Grid item xs={12} lg={8}>
                  <Stack spacing={3}>
                    {/* Items Section */}
                    <Paper elevation={0} sx={{ p: 4, borderRadius: 5, border: '1px solid #e2e8f0', bgcolor: '#fff' }}>
                      <Typography variant="h6" fontWeight={800} sx={{ mb: 3, color: '#1e293b' }}>Order Items</Typography>
                      <Stack spacing={2}>
                        {order.orderItems.map((item, index) => (
                          <Box
                            key={index}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                              p: 2,
                              borderRadius: 3,
                              border: '1px solid #f1f5f9'
                            }}
                          >
                            <Avatar src={item.media?.[0]?.url} variant="rounded" sx={{ width: 64, height: 64, borderRadius: 2 }} />
                            <Box sx={{ flex: 1 }}>
                              <Link to={`/product/${item.product}`} style={{ textDecoration: 'none' }}>
                                <Typography variant="subtitle1" fontWeight={800} color="#1e293b">{item.name}</Typography>
                              </Link>
                              <Typography variant="body2" color="text.secondary">Quantity: {item.qty}</Typography>
                            </Box>
                            <Typography variant="subtitle1" fontWeight={900} color="#1e293b">
                              {format(item.qty * item.price, order.currency)}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Paper>

                    {/* Shipping & Payment Info */}
                    <Paper elevation={0} sx={{ p: 4, borderRadius: 5, border: '1px solid #e2e8f0', bgcolor: '#fff' }}>
                      <Grid container spacing={4}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" color="text.secondary" fontWeight={800} sx={{ mb: 2, textTransform: 'uppercase' }}>Shipping Details</Typography>
                          <Typography variant="body2" fontWeight={600} color="#1e293b">{order.user?.username}</Typography>
                          <Typography variant="body2" color="#475569" sx={{ mt: 1 }}>
                            {order.shippingAddress?.street}<br />
                            {order.shippingAddress?.city}, {order.shippingAddress?.state}<br />
                            {order.shippingAddress?.country} - {order.shippingAddress?.postalCode}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" color="text.secondary" fontWeight={800} sx={{ mb: 2, textTransform: 'uppercase' }}>Payment Info</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant="body2" fontWeight={800} color="#1e293b">Method:</Typography>
                            <Typography variant="body2" color="#475569">{order.paymentMethod}</Typography>
                          </Box>
                          <Chip
                            label={order.paymentStatus}
                            size="small"
                            sx={{
                              bgcolor: order.paymentStatus === 'Completed' ? alpha('#10b981', 0.1) : alpha('#f59e0b', 0.1),
                              color: order.paymentStatus === 'Completed' ? '#10b981' : '#f59e0b',
                              fontWeight: 800
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  </Stack>
                </Grid>

                <Grid item xs={12} lg={4}>
                  <Stack spacing={3}>
                    <Paper elevation={0} sx={{ p: 4, borderRadius: 5, border: '1px solid #e2e8f0', bgcolor: '#fff' }}>
                      <Typography variant="h6" fontWeight={800} sx={{ mb: 3, color: '#1e293b' }}>Summary</Typography>
                      <Stack spacing={2} sx={{ mb: 3 }}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">Items</Typography>
                          <Typography variant="body2" fontWeight={700}>{format(order.itemsPrice, order.currency)}</Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">Shipping</Typography>
                          <Typography variant="body2" fontWeight={700}>{format(order.shippingPrice, order.currency)}</Typography>
                        </Stack>
                        <Divider />
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="h6" fontWeight={900}>Total</Typography>
                          <Typography variant="h6" fontWeight={900} color="#6366f1">{format(order.totalPrice, order.currency)}</Typography>
                        </Stack>
                      </Stack>

                      {!order.isPaid && order.paymentMethod === 'PayPal' && (
                        <Box sx={{ mt: 2 }}>
                          {isPending ? <Loader /> : (
                            <PayPalButtons
                              style={{ layout: 'vertical', shape: 'rect' }}
                              createOrder={(data, actions) => {
                                return actions.order.create({
                                  purchase_units: [{ amount: { value: order.totalPrice.toString() } }]
                                });
                              }}
                              onApprove={onApprove}
                            />
                          )}
                        </Box>
                      )}

                      {userInfo?.role === 'vendor' && order.isPaid && !order.isDelivered && (
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={deliverHandler}
                          disabled={loadingDeliver}
                          sx={{
                            mt: 2,
                            borderRadius: 3,
                            py: 1.5,
                            fontWeight: 800,
                            bgcolor: '#6366f1',
                            '&:hover': { bgcolor: '#4f46e5' }
                          }}
                        >
                          {loadingDeliver ? <CircularProgress size={24} color="inherit" /> : 'Mark As Delivered'}
                        </Button>
                      )}
                    </Paper>

                    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, bgcolor: alpha('#6366f1', 0.05), border: '1px solid', borderColor: alpha('#6366f1', 0.1) }}>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <SupportIcon sx={{ color: '#6366f1' }} />
                        <Box>
                          <Typography variant="subtitle2" fontWeight={800} color="#1e293b">Need help?</Typography>
                          <Typography variant="caption" color="text.secondary">If you have any issues with your order, please contact our support team.</Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Stack>
                </Grid>
              </Grid>
            </>
          )}
        </Box>
      </Box>
    </DocumentTitle>
  );
};

export default Order;