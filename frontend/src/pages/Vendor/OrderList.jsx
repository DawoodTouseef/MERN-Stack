import Message from "../../components/Message";
import Loader from "../../components/Loader";
import { Link } from "react-router-dom";
import { useGetOrdersQuery, useDeleteOrderMutation } from "../../redux/api/orderApiSlice";
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import { useState } from "react";
import { CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Slide } from "@mui/material";
import { toast } from "react-toastify";
import * as React from 'react';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const OrderList = () => {
  const { data: orders = [], isLoading, error, refetch } = useGetOrdersQuery();
  const [deleteOrder, { isLoading: isDeleting }] = useDeleteOrderMutation();
  const [deletingId, setDeletingId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

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
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 700 }} aria-label="customized table">
            <TableHead>
              <TableRow >
                <StyledTableCell align="center">ITEMS</StyledTableCell>
                <StyledTableCell align="center" >ID</StyledTableCell>
                <StyledTableCell align="center">USER</StyledTableCell>
                <StyledTableCell align="center" >DATE</StyledTableCell>
                <StyledTableCell align="center" >TOTAL</StyledTableCell>
                <StyledTableCell align="center" >PAID</StyledTableCell>
                <StyledTableCell align="center" >DELIVERED</StyledTableCell>
                <StyledTableCell align="center">Action</StyledTableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {orders.map((order) => (
                <StyledTableRow key={order._id}>
                  <StyledTableCell align="center">
                    <img
                      src={order.orderItems[0]?.image}
                      alt={order._id}
                      style={{ width: "5rem", paddingTop: "1rem" }}
                    />
                  </StyledTableCell>
                  <StyledTableCell align="center">{order._id}</StyledTableCell>
                  <StyledTableCell align="center">{order.user ? order.user.username : "N/A"}</StyledTableCell>
                  <StyledTableCell align="center">
                    {order.createdAt ? order.createdAt.substring(0, 10) : "N/A"}
                  </StyledTableCell>
                  <StyledTableCell align="center">$ {order.totalPrice}</StyledTableCell>
                  <StyledTableCell align="center">
                    {order.isPaid ? (
                      <span style={{ background: "#22c55e", color: "#fff", borderRadius: 16, padding: "2px 12px" }}>
                        Completed
                      </span>
                    ) : (
                      <span style={{ background: "#ef4444", color: "#fff", borderRadius: 16, padding: "2px 12px" }}>
                        Pending
                      </span>
                    )}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {order.isDelivered ? (
                      <span style={{ background: "#22c55e", color: "#fff", borderRadius: 16, padding: "2px 12px" }}>
                        Completed
                      </span>
                    ) : (
                      <span style={{ background: "#ef4444", color: "#fff", borderRadius: 16, padding: "2px 12px" }}>
                        Pending
                      </span>
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
            Disagree
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            disabled={isDeleting}
          >
            {isDeleting ? <CircularProgress size={20} color="inherit" /> : "Agree"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default OrderList;
