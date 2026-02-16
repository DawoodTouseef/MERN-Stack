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
    CircularProgress,
    FormControl,
    InputLabel,
    Select
} from '@mui/material';
import { toast } from 'react-toastify';
import OrdersTable from '../../components/Orders/OrdersTable';
import OrderDetailsModal from '../../components/Orders/OrderDetailsModal';
import { useGetVendorOrdersQuery, useUpdateOrderStatusMutation } from '../../redux/api/orderApiSlice';

const VendorOrders = () => {
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [statusNotes, setStatusNotes] = useState('');

    const { data, isLoading, refetch } = useGetVendorOrdersQuery({
        page,
        status: statusFilter
    });
    console.log(data);
    const [updateStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();

    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setDetailsOpen(true);
    };

    const handleStatusClick = (order) => {
        setSelectedOrder(order);
        setNewStatus(order.orderStatus);
        setStatusDialogOpen(true);
    };

    const handleUpdateStatus = async () => {
        try {
            await updateStatus({
                orderId: selectedOrder._id,
                status: newStatus,
                notes: statusNotes
            }).unwrap();

            toast.success('Order status updated successfully');
            setStatusDialogOpen(false);
            setStatusNotes('');
            refetch();
        } catch (error) {
            toast.error(error?.data?.error || 'Failed to update status');
        }
    };

    const statusOptions = [
        'Placed',
        'Confirmed',
        'Packed',
        'Shipped',
        'Out for Delivery',
        'Delivered'
    ];

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Stack spacing={3}>
                {/* Header */}
                <Box>
                    <Typography variant="h4" fontWeight={700} gutterBottom>
                        Vendor Orders
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage your store's orders
                    </Typography>
                </Box>

                {/* Filters */}
                <Paper sx={{ p: 3 }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                        <TextField
                            select
                            label="Filter by Status"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            size="small"
                            sx={{ minWidth: 200 }}
                        >
                            <MenuItem value="">All Orders</MenuItem>
                            <MenuItem value="Placed">Placed</MenuItem>
                            <MenuItem value="Confirmed">Confirmed</MenuItem>
                            <MenuItem value="Packed">Packed</MenuItem>
                            <MenuItem value="Shipped">Shipped</MenuItem>
                            <MenuItem value="Delivered">Delivered</MenuItem>
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
                            orders={data?.orders}
                            onViewDetails={handleViewDetails}
                            page={data?.page - 1 || 0}
                            rowsPerPage={data?.limit || 20}
                            totalCount={data?.total || 0}
                            onPageChange={(e, newPage) => setPage(newPage + 1)}
                            showCustomer={true}
                        />

                        {/* Update Status Buttons */}
                        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {data?.orders?.map(order => (
                                <Button
                                    key={order._id}
                                    variant="outlined"
                                    size="small"
                                    onClick={() => handleStatusClick(order)}
                                >
                                    Update Status - {order.orderNumber}
                                </Button>
                            ))}
                        </Box>
                    </Box>
                )}
            </Stack>

            {/* Order Details Modal */}
            <OrderDetailsModal
                open={detailsOpen}
                onClose={() => setDetailsOpen(false)}
                order={selectedOrder}
            />

            {/* Update Status Dialog */}
            <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Update Order Status</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <FormControl fullWidth>
                            <InputLabel>New Status</InputLabel>
                            <Select
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                label="New Status"
                            >
                                {statusOptions.map(status => (
                                    <MenuItem key={status} value={status}>{status}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            label="Notes (Optional)"
                            multiline
                            rows={3}
                            fullWidth
                            value={statusNotes}
                            onChange={(e) => setStatusNotes(e.target.value)}
                            placeholder="Add any notes about this status update..."
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setStatusDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleUpdateStatus}
                        variant="contained"
                        disabled={isUpdating || !newStatus}
                    >
                        {isUpdating ? 'Updating...' : 'Update Status'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default VendorOrders;
