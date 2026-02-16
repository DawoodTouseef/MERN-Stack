import { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Stack,
    TextField,
    MenuItem,
    Grid,
    Card,
    CardContent,
    CircularProgress
} from '@mui/material';
import { TrendingUp, ShoppingCart, AttachMoney } from '@mui/icons-material';
import OrdersTable from '../../components/Orders/OrdersTable';
import OrderDetailsModal from '../../components/Orders/OrderDetailsModal';
import { useGetAdminOrdersQuery } from '../../redux/api/orderApiSlice';

const AdminOrders = () => {
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    const { data, isLoading } = useGetAdminOrdersQuery({
        page,
        status: statusFilter,
        limit: 20
    });

    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setDetailsOpen(true);
    };

    const stats = data?.stats || { totalRevenue: 0, averageOrderValue: 0, totalOrders: 0 };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Stack spacing={3}>
                {/* Header */}
                <Box>
                    <Typography variant="h4" fontWeight={700} gutterBottom>
                        All Orders
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Admin view of all platform orders
                    </Typography>
                </Box>

                {/* Stats Cards */}
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Box
                                        sx={{
                                            bgcolor: 'primary.main',
                                            color: 'white',
                                            p: 1.5,
                                            borderRadius: 2
                                        }}
                                    >
                                        <ShoppingCart />
                                    </Box>
                                    <Box>
                                        <Typography variant="h5" fontWeight={700}>
                                            {stats.totalOrders}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Total Orders
                                        </Typography>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Box
                                        sx={{
                                            bgcolor: 'success.main',
                                            color: 'white',
                                            p: 1.5,
                                            borderRadius: 2
                                        }}
                                    >
                                        <AttachMoney />
                                    </Box>
                                    <Box>
                                        <Typography variant="h5" fontWeight={700}>
                                            ${stats.totalRevenue.toFixed(2)}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Total Revenue
                                        </Typography>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Box
                                        sx={{
                                            bgcolor: 'warning.main',
                                            color: 'white',
                                            p: 1.5,
                                            borderRadius: 2
                                        }}
                                    >
                                        <TrendingUp />
                                    </Box>
                                    <Box>
                                        <Typography variant="h5" fontWeight={700}>
                                            ${stats.averageOrderValue.toFixed(2)}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Avg Order Value
                                        </Typography>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

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
                    <OrdersTable
                        orders={data?.orders}
                        onViewDetails={handleViewDetails}
                        page={data?.pagination?.page - 1 || 0}
                        rowsPerPage={data?.pagination?.limit || 20}
                        totalCount={data?.pagination?.total || 0}
                        onPageChange={(e, newPage) => setPage(newPage + 1)}
                        showCustomer={true}
                        showVendor={true}
                    />
                )}
            </Stack>

            {/* Order Details Modal */}
            <OrderDetailsModal
                open={detailsOpen}
                onClose={() => setDetailsOpen(false)}
                order={selectedOrder}
            />
        </Container>
    );
};

export default AdminOrders;
