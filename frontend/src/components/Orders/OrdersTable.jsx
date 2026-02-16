import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Tooltip,
    Box,
    Typography,
    TablePagination
} from '@mui/material';
import { Visibility as ViewIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import OrderStatusBadge from './OrderStatusBadge';

const OrdersTable = ({
    orders,
    onViewDetails,
    page = 0,
    rowsPerPage = 10,
    totalCount = 0,
    onPageChange,
    onRowsPerPageChange,
    showVendor = false,
    showCustomer = false
}) => {
    return (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer sx={{ maxHeight: 600 }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell>Order #</TableCell>
                            {showCustomer && <TableCell>Customer</TableCell>}
                            {showVendor && <TableCell>Vendor</TableCell>}
                            <TableCell>Date</TableCell>
                            <TableCell>Items</TableCell>
                            <TableCell align="right">Total</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={showCustomer || showVendor ? 8 : 7} align="center">
                                    <Box sx={{ py: 4 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            No orders found
                                        </Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders?.map((order) => (
                                <TableRow key={order._id} hover>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight={600}>
                                            {order.orderNumber}
                                        </Typography>
                                    </TableCell>
                                    {showCustomer && (
                                        <TableCell>
                                            <Typography variant="body2">
                                                {order.user?.username || order.user?.email}
                                            </Typography>
                                        </TableCell>
                                    )}
                                    {showVendor && (
                                        <TableCell>
                                            <Typography variant="body2">
                                                {order.vendor?.name || 'Platform'}
                                            </Typography>
                                        </TableCell>
                                    )}
                                    <TableCell>
                                        <Typography variant="body2">
                                            {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {order.orderItems?.length || 0} item(s)
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Typography variant="body2" fontWeight={600}>
                                            ${order.totalPrice?.toFixed(2)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <OrderStatusBadge status={order.orderStatus} />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="View Details">
                                            <IconButton
                                                size="small"
                                                onClick={() => onViewDetails(order)}
                                                color="primary"
                                            >
                                                <ViewIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            {totalCount > 0 && (
                <TablePagination
                    component="div"
                    count={totalCount}
                    page={page}
                    onPageChange={onPageChange}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={onRowsPerPageChange}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                />
            )}
        </Paper>
    );
};

export default OrdersTable;
