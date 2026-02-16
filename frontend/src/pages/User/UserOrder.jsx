import Message from "../../components/Message";
import Loader from "../../components/Loader";
import { Link } from "react-router-dom";
import { useGetMyOrdersQuery } from "../../redux/api/orderApiSlice";
import {
  Box,
  Typography,
  Paper,
  Button,
  Avatar,
  Chip,
  Fade,
  Stack,
  alpha,
  useTheme,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  Visibility as VisibilityIcon,
  ShoppingBag as ShoppingBagIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as PaidIcon,
  Error as PendingIcon,
} from "@mui/icons-material";
import DocumentTitle from "react-document-title";
import { useSelector } from "react-redux";
import { format } from "date-fns";
import { APP_NAME } from "../../redux/constants";
const UserOrder = () => {
  const theme = useTheme();
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
      return currency;
    }
  };

  const getStatusChip = (status, type) => {
    const isSuccess = status === true || status === "Completed" || status === "Delivered";
    return (
      <Chip
        icon={isSuccess ? (type === 'paid' ? <PaidIcon /> : <ShippingIcon />) : <PendingIcon />}
        label={isSuccess ? (type === 'paid' ? 'Paid' : 'Delivered') : (type === 'paid' ? 'Pending' : 'In Transit')}
        size="small"
        sx={{
          fontWeight: 700,
          borderRadius: 2,
          bgcolor: isSuccess ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.warning.main, 0.1),
          color: isSuccess ? theme.palette.success.dark : theme.palette.warning.dark,
          border: `1px solid ${isSuccess ? theme.palette.success.main : theme.palette.warning.main}`,
          px: 1
        }}
      />
    );
  };

  const columns = [
    {
      field: "image",
      headerName: "Product",
      width: 100,
      renderCell: (params) => (
        <Avatar
          variant="rounded"
          src={params.row.orderItems?.[0]?.media?.[0]?.url || '/placeholder.png'}
          sx={{ width: 45, height: 45, border: '1px solid #e2e8f0' }}
        />
      ),
    },
    {
      field: "_id",
      headerName: "Order ID",
      width: 220,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600} color="#1e293b">
          #{params.value.substring(params.value.length - 8).toUpperCase()}
        </Typography>
      )
    },
    {
      field: "createdAt",
      headerName: "Date",
      width: 150,
      valueGetter: (params) => params.value,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {format(new Error(params.value).getTime() ? new Date(params.value) : new Date(), 'MMM dd, yyyy')}
        </Typography>
      )
    },
    {
      field: "totalPrice",
      headerName: "Total",
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={700} color="primary.main">
          {getCurrencySymbol()}{(params.value * price).toFixed(2)}
        </Typography>
      )
    },
    {
      field: "isPaid",
      headerName: "Payment",
      width: 140,
      renderCell: (params) => getStatusChip(params.value, 'paid')
    },
    {
      field: "isDelivered",
      headerName: "Delivery",
      width: 140,
      renderCell: (params) => getStatusChip(params.value, 'delivery')
    },
    {
      field: "actions",
      headerName: "Action",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Button
          component={Link}
          to={`/order/${params.row._id}`}
          variant="outlined"
          size="small"
          startIcon={<VisibilityIcon />}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 700,
            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) }
          }}
        >
          Details
        </Button>
      )
    }
  ];

  return (
    <DocumentTitle title={`My Orders | ${APP_NAME}`}>
      <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", py: 10 }}>
        <Box sx={{ maxWidth: 1100, mx: "auto", px: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 6 }}>
            <Box>
              <Typography variant="h4" fontWeight={900} color="#1e293b" sx={{ mb: 1 }}>
                My Orders
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Track and manage your recent purchases
              </Typography>
            </Box>
            <ShoppingBagIcon sx={{ fontSize: 40, color: '#e2e8f0' }} />
          </Stack>

          {isLoading ? (
            <Loader />
          ) : error ? (
            <Message variant="danger">{error?.data?.message || error.error}</Message>
          ) : orders.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 10,
                textAlign: 'center',
                borderRadius: 6,
                border: '1px dashed #cbd5e1',
                bgcolor: 'transparent'
              }}
            >
              <ShoppingBagIcon sx={{ fontSize: 80, color: '#e2e8f0', mb: 2 }} />
              <Typography variant="h6" fontWeight={800} color="#64748b" sx={{ mb: 1 }}>
                No Orders Yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                It looks like you haven&apos;t placed any orders yet.
              </Typography>
              <Button
                component={Link}
                to="/shop"
                variant="contained"
                sx={{ borderRadius: 3, fontWeight: 800, px: 4, bgcolor: '#6366f1' }}
              >
                Start Shopping
              </Button>
            </Paper>
          ) : (
            <Fade in timeout={700}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 5,
                  overflow: 'hidden',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
                }}
              >
                <DataGrid
                  rows={orders}
                  columns={columns}
                  getRowId={(row) => row._id}
                  pageSize={10}
                  rowsPerPageOptions={[10, 25, 50]}
                  autoHeight
                  disableSelectionOnClick
                  sx={{
                    border: 'none',
                    '& .MuiDataGrid-columnHeaders': {
                      bgcolor: '#f8fafc',
                      borderBottom: '1px solid #e2e8f0',
                    },
                    '& .MuiDataGrid-cell': {
                      borderBottom: '1px solid #f1f5f9',
                      py: 2
                    },
                    '& .MuiDataGrid-footerContainer': {
                      borderTop: '1px solid #e2e8f0',
                      bgcolor: '#f8fafc'
                    },
                    '& .MuiDataGrid-columnHeaderTitle': {
                      fontWeight: 800,
                      color: '#475569',
                      fontSize: '0.85rem',
                      textTransform: 'uppercase',
                      letterSpacing: 1
                    }
                  }}
                />
              </Paper>
            </Fade>
          )}
        </Box>
      </Box>
    </DocumentTitle>
  );
};

export default UserOrder;