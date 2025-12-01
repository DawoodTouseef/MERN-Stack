import Message from "../../components/Message";
import Loader from "../../components/Loader";
import { Link } from "react-router-dom";
import { useGetMyOrdersQuery } from "../../redux/api/orderApiSlice";
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
  Avatar,
  Chip,
  Fade,
  Zoom,
} from "@mui/material";
import DocumentTitle from "react-document-title";
import { useSelector } from "react-redux";
const UserOrder = () => {
  const { data: orders = [], isLoading, error } = useGetMyOrdersQuery();
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
  return (
    <DocumentTitle title="My Orders | Nexus Mart">
    <Box sx={{ maxWidth: "1000px", mx: "auto", mt: 6, p: 2 }}>
      <Fade in timeout={700}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 4 }}>
          My Orders
        </Typography>
      </Fade>
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error?.data?.message || error.error}</Message>
      ) : (
        <Zoom in timeout={500}>
          <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>IMAGE</TableCell>
                  <TableCell>ID</TableCell>
                  <TableCell>DATE</TableCell>
                  <TableCell>TOTAL</TableCell>
                  <TableCell>PAID</TableCell>
                  <TableCell>DELIVERED</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order, idx) => (
                  <Fade in timeout={400 + idx * 100} key={order._id}>
                    <TableRow>
                      <TableCell>
                        <Avatar
                          variant="rounded"
                          src={order.orderItems[0]?.media?.[0]?.url || '/placeholder.png'}
                          alt={order.orderItems[0]?.name}
                          sx={{ width: 56, height: 56 }}
                        />
                      </TableCell>
                      <TableCell>{order._id}</TableCell>
                      <TableCell>{order.createdAt.substring(0, 10)}</TableCell>
                      <TableCell>{getCurrencySymbol()}{(order.totalPrice*price).toFixed(2)}</TableCell>
                      <TableCell>
                        {order.isPaid ? (
                          <Chip label="Completed" color="success" sx={{ width: 90 }} />
                        ) : (
                          <Chip label="Pending" color="error" sx={{ width: 90 }} />
                        )}
                      </TableCell>
                      <TableCell>
                        {order.isDelivered ? (
                          <Chip label="Completed" color="success" sx={{ width: 90 }} />
                        ) : (
                          <Chip label="Pending" color="error" sx={{ width: 90 }} />
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          component={Link}
                          to={`/order/${order._id}`}
                          variant="contained"
                          color="secondary"
                          size="small"
                          sx={{ borderRadius: 2, fontWeight: "bold" }}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  </Fade>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Zoom>
      )}
    </Box>
    </DocumentTitle>
  );
};

export default UserOrder;