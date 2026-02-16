import { Chip } from '@mui/material';

const OrderStatusBadge = ({ status }) => {
    const getStatusColor = (status) => {
        const statusColors = {
            'Placed': 'info',
            'Confirmed': 'primary',
            'Packed': 'secondary',
            'Shipped': 'warning',
            'Out for Delivery': 'warning',
            'Delivered': 'success',
            'Cancelled': 'error',
            'Returned': 'error',
            'Refunded': 'default'
        };
        return statusColors[status] || 'default';
    };

    return (
        <Chip
            label={status}
            color={getStatusColor(status)}
            size="small"
            sx={{
                fontWeight: 600,
                textTransform: 'capitalize'
            }}
        />
    );
};

export default OrderStatusBadge;
