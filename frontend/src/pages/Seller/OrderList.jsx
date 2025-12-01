import Message from "../../components/Message";
import Loader from "../../components/Loader";
import { Link } from "react-router-dom";
import { useGetOrdersQuery, useDeleteOrderMutation, useGetMyOrdersQuery } from "../../redux/api/orderApiSlice";
import { styled } from '@mui/material/styles';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button,
  CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Slide,
  Chip, Tooltip, Box, Typography, Avatar, Stack, Grid, Card, CardContent
} from "@mui/material";
import { useState, useMemo } from "react";
import { toast } from "react-toastify";
import * as React from 'react';
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PaymentIcon from "@mui/icons-material/Payment";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import CancelIcon from "@mui/icons-material/Cancel";
import InfoIcon from "@mui/icons-material/Info";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import { useSelector } from "react-redux";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${TableCell.head}`]: {
    background: "linear-gradient(90deg, #6366f1 0%, #ec4899 100%)",
    color: "#fff",
    fontWeight: 700,
    fontSize: 16,
    letterSpacing: 1,
    border: 0,
  },
  [`&.${TableCell.body}`]: {
    fontSize: 14,
    border: 0,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  background: "#fff",
  "&:hover": {
    background: "linear-gradient(90deg, #e3eeff 60%, #f3e7e9 100%)",
    transition: "background 0.2s",
  },
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

const getStatusColor = (status) => {
  switch (status) {
    case "Placed": return "info";
    case "Confirmed": return "primary";
    case "Packed": return "secondary";
    case "Shipped": return "warning";
    case "Out for Delivery": return "warning";
    case "Delivered": return "success";
    case "Cancelled": return "error";
    case "Returned": return "default";
    default: return "default";
  }
};

const getPaymentChip = (status) => {
  switch (status) {
    case "Completed":
      return <Chip icon={<PaymentIcon />} label="Completed" color="success" size="small" />;
    case "Pending":
      return <Chip icon={<PaymentIcon />} label="Pending" color="warning" size="small" />;
    case "Failed":
      return <Chip icon={<CancelIcon />} label="Failed" color="error" size="small" />;
    case "Refunded":
      return <Chip icon={<AssignmentTurnedInIcon />} label="Refunded" color="info" size="small" />;
    default:
      return <Chip label={status} size="small" />;
  }
};

// Status card component for order statistics
const StatusCard = ({ title, count, icon, color, bgColor }) => (
  <Card 
    sx={{ 
      bgcolor: bgColor, 
      borderRadius: 3, 
      boxShadow: 3,
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}
  >
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h6" sx={{ color: color, fontWeight: 600 }}>
            {title}
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 700, color: '#fff', mt: 1 }}>
            {count}
          </Typography>
        </Box>
        <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

const OrderList = ({ isAdmin = false }) => {
  // Get user info from Redux store
  const { userInfo } = useSelector((state) => state.auth);
  
  // Use different hooks based on user role
  const { 
    data: allOrders = [], 
    isLoading: isLoadingAll, 
    error: errorAll, 
    refetch: refetchAll 
  } = useGetOrdersQuery({}, { skip: !isAdmin });
  
  const { 
    data: myOrders = [], 
    isLoading: isLoadingMy, 
    error: errorMy, 
    refetch: refetchMy 
  } = useGetMyOrdersQuery({}, { skip: isAdmin });
  
  // Determine which orders to display
  const orders = isAdmin ? allOrders : myOrders;
  const isLoading = isAdmin ? isLoadingAll : isLoadingMy;
  const error = isAdmin ? errorAll : errorMy;
  const refetch = isAdmin ? refetchAll : refetchMy;
  
  const [deleteOrder, { isLoading: isDeleting }] = useDeleteOrderMutation();
  const [deletingId, setDeletingId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  
  // Calculate order statistics
  const orderStats = useMemo(() => {
    if (!orders || orders.length === 0) return {
      pending: 0,
      completed: 0,
      cod: 0,
      online: 0,
      total: 0
    };

    return orders.reduce((stats, order) => {
      // Count pending orders (not delivered)
      if (order.orderStatus !== "Delivered") {
        stats.pending += 1;
      }
      
      // Count completed orders (delivered)
      if (order.orderStatus === "Delivered") {
        stats.completed += 1;
      }
      
      // Count COD orders
      if (order.paymentMethod === "Cash on Delivery") {
        stats.cod += 1;
      }
      
      // Count online payment orders
      if (order.paymentMethod !== "Cash on Delivery") {
        stats.online += 1;
      }
      
      return stats;
    }, {
      pending: 0,
      completed: 0,
      cod: 0,
      online: 0,
      total: orders.length
    });
  }, [orders]);

  const handleDialogOpen = (orderId) => {
    setSelectedOrderId(orderId);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedOrderId(null);
  };

  const handleDelete = async () => {
    setDeletingId(selectedOrderId);
    try {
      await deleteOrder(selectedOrderId).unwrap();
      toast.success("Order deleted successfully");
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.error || "Delete failed");
    }
    setDeletingId(null);
    setDialogOpen(false);
    setSelectedOrderId(null);
  };

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700} color="primary.main" sx={{ mb: 3, letterSpacing: 1 }}>
          {isAdmin ? "Order Management" : "My Orders"}
        </Typography>
        
        {/* Status Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatusCard 
              title="Pending Orders" 
              count={orderStats.pending} 
              icon={<PendingIcon />} 
              color="#ff9800" 
              bgColor="#2d2d2d" 
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatusCard 
              title="Completed Orders" 
              count={orderStats.completed} 
              icon={<CheckCircleIcon />} 
              color="#4caf50" 
              bgColor="#2d2d2d" 
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatusCard 
              title="COD Orders" 
              count={orderStats.cod} 
              icon={<AttachMoneyIcon />} 
              color="#f44336" 
              bgColor="#2d2d2d" 
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatusCard 
              title="Online Payments" 
              count={orderStats.online} 
              icon={<CreditCardIcon />} 
              color="#2196f3" 
              bgColor="#2d2d2d" 
            />
          </Grid>
        </Grid>
      </Box>
      
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: 6 }}>
          <Table sx={{ minWidth: 1100 }} aria-label="customized table">
            <TableHead>
              <TableRow>
                <StyledTableCell align="center">Order</StyledTableCell>
                <StyledTableCell align="center">Order No.</StyledTableCell>
                <StyledTableCell align="center">User</StyledTableCell>
                <StyledTableCell align="center">Date</StyledTableCell>
                <StyledTableCell align="center">Total</StyledTableCell>
                <StyledTableCell align="center">Payment</StyledTableCell>
                <StyledTableCell align="center">Status</StyledTableCell>
                <StyledTableCell align="center">Tracking</StyledTableCell>
                <StyledTableCell align="center">Action</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <StyledTableRow key={order._id}>
                  <StyledTableCell align="center">
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                      <Avatar
                        src={order.orderItems[0]?.media[0].url}
                        alt={order.orderItems[0]?.name}
                        sx={{ width: 48, height: 48, border: "2px solid #ec4899" }}
                        variant="rounded"
                      />
                      <Box>
                        <Typography fontWeight={600} fontSize={14}>
                          {order.orderItems[0]?.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          x{order.orderItems[0]?.qty}
                        </Typography>
                      </Box>
                    </Stack>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Chip
                      label={order.orderNumber || order._id.slice(-6)}
                      color="secondary"
                      size="small"
                      sx={{ fontWeight: 700, fontSize: 13 }}
                    />
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {order.user ? (
                      <Tooltip title={order.user.email}>
                        <span>{order.user.username}</span>
                      </Tooltip>
                    ) : (
                      "N/A"
                    )}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {order.createdAt ? order.createdAt.substring(0, 10) : "N/A"}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Typography fontWeight={700} color="primary">
                      ${order.totalPrice?.toFixed(2)}
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {getPaymentChip(order.paymentStatus)}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Chip
                      icon={<LocalShippingIcon />}
                      label={order.orderStatus}
                      color={getStatusColor(order.orderStatus)}
                      size="small"
                      sx={{ fontWeight: 600, fontSize: 13 }}
                    />
                    {order.orderStatus === "Delivered" && order.deliveredAt && (
                      <Typography variant="caption" color="success.main" sx={{ display: "block" }}>
                        {order.deliveredAt.substring(0, 10)}
                      </Typography>
                    )}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {order.trackingNumber ? (
                      <Tooltip title={order.trackingCarrier || "Tracking"}>
                        <a
                          href={order.trackingUrl || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "#6366f1", textDecoration: "underline", fontWeight: 600 }}
                        >
                          {order.trackingNumber}
                        </a>
                      </Tooltip>
                    ) : (
                      <Chip icon={<InfoIcon />} label="N/A" size="small" />
                    )}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Link to={`/order/${order._id}`}>
                      <Button variant="outlined" color="primary" size="small" sx={{ mr: 1 }}>
                        More
                      </Button>
                    </Link>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      onClick={() => handleDialogOpen(order._id)}
                      disabled={isDeleting && deletingId === order._id}
                    >
                      {isDeleting && deletingId === order._id ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        "Delete"
                      )}
                    </Button>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={dialogOpen}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleDialogClose}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>{"Delete Order"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            Are you sure you want to delete this order?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            disabled={isDeleting}
          >
            {isDeleting ? <CircularProgress size={20} color="inherit" /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default OrderList;