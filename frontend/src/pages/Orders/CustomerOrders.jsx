import { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Stack,
    TextField,
    MenuItem,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    CircularProgress
} from '@mui/material';
import { Cancel as CancelIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import OrdersTable from '../../components/Orders/OrdersTable';
import OrderDetailsModal from '../../components/Orders/OrderDetailsModal';
import { useGetMyOrdersQuery, useCancelOrderMutation } from '../../redux/api/orderApiSlice';

const CustomerOrders = () => {
    const [statusFilter, setStatusFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [orderToCancel, setOrderToCancel] = useState(null);

    const { data: orders, isLoading, refetch } = useGetMyOrdersQuery();
    const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();

    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setDetailsOpen(true);
    };

    const handleCancelClick = (order) => {
        setOrderToCancel(order);
        setCancelDialogOpen(true);
    };

    const handleCancelOrder = async () => {
        try {
            await cancelOrder({
                orderId: orderToCancel._id,
                reason: cancelReason || 'Customer requested cancellation'
            }).unwrap();

            toast.success('Order cancelled successfully');
            setCancelDialogOpen(false);
            setCancelReason('');
            setOrderToCancel(null);
            refetch();
        } catch (error) {
            toast.error(error?.data?.error || 'Failed to cancel order');
        }
    };

    const filteredOrders = orders?.filter(order => {
        const matchesStatus = statusFilter === 'All' || order.orderStatus === statusFilter;
        const matchesSearch = order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const canCancelOrder = (order) => {
        return ['Placed', 'Confirmed'].includes(order.orderStatus);
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Stack spacing={3}>
                {/* Header */}
                <Box>
                    <Typography variant="h4" fontWeight={700} gutterBottom>
                        My Orders
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        View and manage your orders
                    </Typography>
                </Box>

                {/* Filters */}
                <Paper sx={{ p: 3 }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                        <TextField
                            label="Search by Order Number"
                            variant="outlined"
                            size="small"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={{ flex: 1 }}
                        />
                        <TextField
                            select
                            label="Status"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            size="small"
                            sx={{ minWidth: 200 }}
                        >
                            <MenuItem value="All">All Orders</MenuItem>
                            <MenuItem value="Placed">Placed</MenuItem>
                            <MenuItem value="Confirmed">Confirmed</MenuItem>
                            <MenuItem value="Shipped">Shipped</MenuItem>
                            <MenuItem value="Delivered">Delivered</MenuItem>
                            <MenuItem value="Cancelled">Cancelled</MenuItem>
                        </TextField>
                    </Stack>
                </Paper>

                {/* Orders Table */}
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Box>
                        <OrdersTable
                            orders={filteredOrders}
                            onViewDetails={handleViewDetails}
                            totalCount={filteredOrders?.length || 0}
                        />

                        {/* Cancel Button for each order */}
                        {filteredOrders?.map(order => (
                            canCancelOrder(order) && (
                                <Box key={order._id} sx={{ mt: 1, textAlign: 'right' }}>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        size="small"
                                        startIcon={<CancelIcon />}
                                        onClick={() => handleCancelClick(order)}
                                    >
                                        Cancel Order
                                    </Button>
                                </Box>
                            )
                        ))}
                    </Box>
                )}
            </Stack>

            {/* Order Details Modal */}
            <OrderDetailsModal
                open={detailsOpen}
                onClose={() => setDetailsOpen(false)}
                order={selectedOrder}
            />

            {/* Cancel Order Dialog */}
            <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Cancel Order</DialogTitle>
                <DialogContent>
                    <Stack spacing={2}>
                        <Alert severity="warning">
                            Are you sure you want to cancel this order? This action cannot be undone.
                        </Alert>
                        <TextField
                            label="Reason for Cancellation (Optional)"
                            multiline
                            rows={3}
                            fullWidth
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="Please provide a reason for cancelling this order..."
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCancelDialogOpen(false)}>
                        Keep Order
                    </Button>
                    <Button
                        onClick={handleCancelOrder}
                        color="error"
                        variant="contained"
                        disabled={isCancelling}
                    >
                        {isCancelling ? 'Cancelling...' : 'Cancel Order'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default CustomerOrders;
