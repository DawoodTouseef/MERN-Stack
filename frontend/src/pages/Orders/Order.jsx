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
} from "@mui/material";
import Messsage from "../../components/Message";
import Loader from "../../components/Loader";
import {
  useDeliverOrderMutation,
  useGetOrderDetailsQuery,
  useGetPaypalClientIdQuery,
  usePayOrderMutation,
} from "../../redux/api/orderApiSlice";

const Order = () => {
  const { id: orderId } = useParams();

  const {
    data: order,
    refetch,
    isLoading,
    error,
  } = useGetOrderDetailsQuery(orderId);
  
  const [payOrder, { isLoading: loadingPay }] = usePayOrderMutation();
  const [deliverOrder, { isLoading: loadingDeliver }] =
    useDeliverOrderMutation();
  const { userInfo } = useSelector((state) => state.auth);
  
  const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();
  const {
    data: paypal,
    isLoading: loadingPaPal,
    error: errorPayPal,
  } = useGetPaypalClientIdQuery();


  useEffect(() => {
    if (!errorPayPal && !loadingPaPal && paypal.clientId) {
      const loadingPaPalScript = async () => {
        paypalDispatch({
          type: "resetOptions",
          value: {
            "client-id": paypal.clientId,
            currency: "USD",
          },
        });
        paypalDispatch({ type: "setLoadingStatus", value: "pending" });
      };

      if (order && !order.isPaid) {
        if (!window.paypal) {
          loadingPaPalScript();
        }
      }
    }
  }, [errorPayPal, loadingPaPal, order, paypal, paypalDispatch]);

  

  function onApprove(data, actions) {
    return actions.order.capture().then(async function (details) {
      try {
        await payOrder({ orderId, details });
        refetch();
        toast.success("Order is paid");
      } catch (error) {
        toast.error(error?.data?.message || error.message);
      }
    });
  }

  function createOrder(data, actions) {
    return actions.order
      .create({
        purchase_units: [{ amount: { value: order.totalPrice } }],
      })
      .then((orderID) => {
        return orderID;
      });
  }

  function onError(err) {
    toast.error(err.message);
  }

  const deliverHandler = async () => {
    await deliverOrder(orderId);
    refetch();
  };



  return isLoading ? (
    <Loader />
  ) : error ? (
    <Messsage variant="danger">{error.data.message}</Messsage>
  ) : (
    <Box display="flex" flexDirection={{ xs: "column", md: "row" }} p={4}>
      <Box flex={2} pr={4}>
        <Paper elevation={3} sx={{ p: 2, mb: 4 }}>
          {order.orderItems.length === 0 ? (
            <Messsage>Order is empty</Messsage>
          ) : (
            <TableContainer component={Paper}>
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
                          src={item.image}
                          alt={item.name}
                          style={{ width: "64px", height: "64px", objectFit: "cover" }}
                        />
                      </TableCell>
                      <TableCell>
                        <Link to={`/product/${item.product}`}>{item.name}</Link>
                      </TableCell>
                      <TableCell align="center">{item.qty}</TableCell>
                      <TableCell>${item.price}</TableCell>
                      <TableCell>${(item.qty * item.price).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>

      <Box flex={1}>
        <Paper elevation={3} sx={{ p: 2, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Shipping
          </Typography>
          <Typography>
            <strong>Order:</strong> {order._id}
          </Typography>
          <Typography>
            <strong>Name:</strong> {order.user?.username || "N/A"}
          </Typography>
          <Typography>
            <strong>Email:</strong> {order.user?.email || "N/A"}
          </Typography>
          <Typography>
            <strong>Address:</strong>{" "}
            {order.shippingAddress?.street}{" "}{order.shippingAddress?.city}{","}
            {order.shippingAddress?.state}{","}
            {order.shippingAddress?.country}{"-"}{order.shippingAddress?.postalCode}{" "}
          </Typography>
          <Typography>
            <strong>Method:</strong> {order.paymentMethod}
          </Typography>
          {order.isPaid ? (
            <Messsage variant="success">Paid on {order.paidAt}</Messsage>
          ) : (
            <Messsage variant="danger">Not paid</Messsage>
          )}
        </Paper>

        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Order Summary
          </Typography>
          <Box display="flex" justifyContent="space-between">
            <Typography>Items</Typography>
            <Typography>${order.itemsPrice}</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography>Shipping</Typography>
            <Typography>${order.shippingPrice}</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography>Tax</Typography>
            <Typography>${order.taxPrice}</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography>Total</Typography>
            <Typography>${order.totalPrice}</Typography>
          </Box>

          {!order.isPaid && (
            <Box mt={2}>
              {loadingPay && <CircularProgress />}
              {isPending ? (
                <CircularProgress />
              ) : (
                <>
                {order.paymentMethod === "PayPal" && (
                  <PayPalButtons
                  createOrder={createOrder}
                  onApprove={onApprove}
                  onError={onError}
                />
                  )}
                </>
              )}
            </Box>
          )}

          {loadingDeliver && <CircularProgress />}
          {userInfo && userInfo.isAdmin && order.isPaid && !order.isDelivered && (
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
  );
};

export default Order;
