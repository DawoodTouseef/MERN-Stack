import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Divider,
    Grid,
    Stack,
    Chip
} from '@mui/material';
import { format } from 'date-fns';
import OrderStatusBadge from './OrderStatusBadge';

const OrderDetailsModal = ({ open, onClose, order }) => {
    if (!order) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">Order Details</Typography>
                    <OrderStatusBadge status={order.orderStatus} />
                </Stack>
            </DialogTitle>

            <DialogContent dividers>
                <Stack spacing={3}>
                    {/* Order Info */}
                    <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Order Information
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">Order Number</Typography>
                                <Typography variant="body1" fontWeight={600}>{order.orderNumber}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">Order Date</Typography>
                                <Typography variant="body1">
                                    {format(new Date(order.createdAt), 'MMM dd, yyyy HH:mm')}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Box>

                    <Divider />

                    {/* Items */}
                    <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Order Items
                        </Typography>
                        <Stack spacing={2}>
                            {order.orderItems?.map((item, index) => (
                                <Box key={index} sx={{ display: 'flex', gap: 2 }}>
                                    <Box
                                        component="img"
                                        src={item.media?.[0] || '/placeholder.png'}
                                        alt={item.name}
                                        sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 1 }}
                                    />
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="body2" fontWeight={600}>{item.name}</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Qty: {item.qty} × ${item.price}
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" fontWeight={600}>
                                        ${(item.qty * item.price).toFixed(2)}
                                    </Typography>
                                </Box>
                            ))}
                        </Stack>
                    </Box>

                    <Divider />

                    {/* Shipping Address */}
                    <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Shipping Address
                        </Typography>
                        <Typography variant="body2">
                            {order.shippingAddress?.street}<br />
                            {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}<br />
                            {order.shippingAddress?.country}
                        </Typography>
                    </Box>

                    <Divider />

                    {/* Price Summary */}
                    <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Price Summary
                        </Typography>
                        <Stack spacing={1}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2">Items Price</Typography>
                                <Typography variant="body2">${order.itemsPrice?.toFixed(2)}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2">Shipping</Typography>
                                <Typography variant="body2">${order.shippingPrice?.toFixed(2)}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2">Tax</Typography>
                                <Typography variant="body2">${order.taxPrice?.toFixed(2)}</Typography>
                            </Box>
                            <Divider />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body1" fontWeight={600}>Total</Typography>
                                <Typography variant="body1" fontWeight={600} color="primary">
                                    ${order.totalPrice?.toFixed(2)}
                                </Typography>
                            </Box>
                        </Stack>
                    </Box>
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default OrderDetailsModal;
