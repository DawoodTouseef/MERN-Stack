import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
  Box,
  CircularProgress,
  Chip,
  Divider,
} from "@mui/material";
import Message from "../../components/Message";
import Loader from "../../components/Loader";
import {
  useDeliverOrderMutation,
  useGetOrderDetailsQuery,
  useGetPaypalClientIdQuery,
  usePayOrderMutation,
} from "../../redux/api/orderApiSlice";
import DocumentTitle from "react-document-title";


const Order = () => {
  const { id: orderId } = useParams();

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
  const currency = useSelector((state) => state.currency.selectedCurrency);
  const price = useSelector((state) => state.currency.price);
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
  useEffect(() => {
    if (!errorPayPal && !loadingPayPal && paypal.clientId) {
      const loadPayPalScript = async () => {
        paypalDispatch({
          type: "resetOptions",
          value: {
            "client-id": paypal.clientId,
            currency: currency,
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

  const createOrder = (data, actions) => {
    return actions.order
      .create({
        purchase_units: [{ amount: { value: order.totalPrice } }],
      })
      .then((orderID) => {
        return orderID;
      });
  };

  const onError = (err) => {
    toast.error(err.message);
  };

  const deliverHandler = async () => {
    await deliverOrder(orderId);
    refetch();
  };

  return (
    <>
    <DocumentTitle title= "Orders | Nexus Mart">
    {
      isLoading ? (
    <Loader />
  ) : error ? (
    <Message variant="danger">{error.data.message}</Message>
  ) : (
    <Box display="flex" flexDirection={{ xs: "column", md: "row" }} p={4}>
      {/* Order Items Section */}
      <Box flex={2} pr={4}>
        <Paper elevation={3} sx={{ p: 2, mb: 4, borderRadius: 4 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: "#6366f1" }}>
            Order Items
          </Typography>
          {order.orderItems.length === 0 ? (
            <Message>Order is empty</Message>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Image</TableCell>
                    <TableCell>Product</TableCell>
                    <TableCell align="center">Quantity</TableCell>
                    <TableCell>Unit Price</TableCell>
                    <TableCell>Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.orderItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <img
                          src={item.media[0].url}
                          alt={item.name}
                          style={{
                            width: "64px",
                            height: "64px",
                            objectFit: "cover",
                            borderRadius: "8px",
                            border: "1px solid #e3e3e3",
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Link
                          to={`/product/${item.product}`}
                          style={{ textDecoration: "none", color: "#6366f1" }}
                        >
                          {item.name}
                        </Link>
                      </TableCell>
                      <TableCell align="center">{item.qty}</TableCell>
                      <TableCell>{getCurrencySymbol()}{(item.price*price).toFixed(2)}</TableCell>
                      <TableCell>{getCurrencySymbol()}{((item.qty * item.price)*price).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>

      {/* Order Summary Section */}
      <Box flex={1}>
        <Paper elevation={3} sx={{ p: 2, mb: 4, borderRadius: 4 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: "#6366f1" }}>
            Order Details
          </Typography>
          <Typography>
            <strong>Order Number:</strong> {order.orderNumber}
          </Typography>
          <Typography>
            <strong>Order ID:</strong> {order._id}
          </Typography>
          <Typography>
            <strong>Name:</strong> {order.user?.username || "N/A"}
          </Typography>
          <Typography>
            <strong>Email:</strong> {order.user?.email || "N/A"}
          </Typography>
          <Typography>
            <strong>Address:</strong> {order.shippingAddress?.street}, {order.shippingAddress?.city},{" "}
            {order.shippingAddress?.state}, {order.shippingAddress?.country} -{" "}
            {order.shippingAddress?.postalCode}
          </Typography>
          <Typography>
            <strong>Payment Method:</strong> {order.paymentMethod}
          </Typography>
          <Typography>
            <strong>Payment Status:</strong>{" "}
            <Chip
              label={order.paymentStatus}
              color={
                order.paymentStatus === "Completed"
                  ? "success"
                  : order.paymentStatus === "Failed"
                  ? "error"
                  : "warning"
              }
              sx={{ fontWeight: 600 }}
            />
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          <Typography>
            <strong>Order Status:</strong>{" "}
            <Chip
              label={order.orderStatus}
              color={
                order.orderStatus === "Delivered"
                  ? "success"
                  : order.orderStatus === "Cancelled"
                  ? "error"
                  : "warning"
              }
              sx={{ fontWeight: 600 }}
            />
          </Typography>
          {order.trackingNumber && (
            <Typography>
              <strong>Tracking Number:</strong> {order.trackingNumber}
            </Typography>
          )}
          {order.shippingCarrier && (
            <Typography>
              <strong>Shipping Carrier:</strong> {order.shippingCarrier}
            </Typography>
          )}
          {order.trackingUrl && (
            <Typography>
              <strong>Tracking URL:</strong>{" "}
              <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#6366f1" }}>
                Track your order
              </a>
            </Typography>
          )}
          {order.notes && (
            <Typography>
              <strong>Notes:</strong> {order.notes}
            </Typography>
          )}
        </Paper>

        <Paper elevation={3} sx={{ p: 2, borderRadius: 4 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: "#6366f1" }}>
            Order Summary
          </Typography>
          <Box display="flex" justifyContent="space-between">
            <Typography>Items</Typography>
            <Typography>{getCurrencySymbol()}{(order.itemsPrice*price).toFixed(2)}</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography>Shipping</Typography>
            <Typography>{getCurrencySymbol()}{(order.shippingPrice*price).toFixed(2)}</Typography>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Box display="flex" justifyContent="space-between" fontWeight="bold">
            <Typography>Total</Typography>
            <Typography>{getCurrencySymbol()}{(order.totalPrice*price).toFixed(2)}</Typography>
          </Box>

          

          {loadingDeliver && <CircularProgress />}
          {userInfo && userInfo.role === "vendor" && order.isPaid && !order.isDelivered && (
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={deliverHandler}
              sx={{ mt: 2 }}
            >
              Mark As Delivered
            </Button>
          )}
        </Paper>
      </Box>
    </Box>
  )
    }
    </DocumentTitle>
    </>
  )
};

export default Order;