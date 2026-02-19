import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { useGetOrdersQuery, useDeleteOrderMutation, useGetMyOrdersQuery, useGetVendorOrdersQuery } from "../../redux/api/orderApiSlice";
import { DataGrid } from '@mui/x-data-grid';
import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  Tooltip,
  Avatar,
  Stack,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Fade
} from "@mui/material";
import {
  LocalShipping as LocalShippingIcon,
  Payment as PaymentIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  AttachMoney as AttachMoneyIcon,
  CreditCard as CreditCardIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  DeleteForever as DeleteForeverIcon
} from "@mui/icons-material";
import { FaSearch, FaFilter } from "react-icons/fa";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import DocumentTitle from "../../components/DocumentTitle";
import useCurrency from "../../hooks/useCurrency";
import { APP_NAME } from "../../redux/constants";

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
const StatCard = ({ title, count, icon, color, description }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      borderRadius: 4,
      bgcolor: '#fff',
      border: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
      }
    }}
  >
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
      <Avatar
        sx={{
          bgcolor: `${color}15`,
          color: color,
          width: 48,
          height: 48,
          borderRadius: 3,
        }}
      >
        {icon}
      </Avatar>
    </Box>
    <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mb: 0.5 }}>
      {title}
    </Typography>
    <Typography variant="h4" fontWeight={900} color="#1e293b" sx={{ mb: 1 }}>
      {count}
    </Typography>
    {description && (
      <Typography variant="caption" color="text.secondary">
        {description}
      </Typography>
    )}
  </Paper>
);

const OrderList = ({ isAdmin = false }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const { format } = useCurrency();

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
  } = useGetMyOrdersQuery({}, { skip: isAdmin || userInfo?.role === "vendor" });

  const {
    data: vendorData,
    isLoading: isLoadingVendor,
    error: errorVendor,
    refetch: refetchVendor
  } = useGetVendorOrdersQuery({}, { skip: userInfo?.role !== "vendor" });

  // Determine which orders to display
  let orders = [];
  let isLoading = false;
  let error = null;
  let refetch = null;

  if (isAdmin) {
    orders = allOrders;
    isLoading = isLoadingAll;
    error = errorAll;
    refetch = refetchAll;
  } else if (userInfo?.role === "vendor") {
    orders = vendorData?.orders || [];
    isLoading = isLoadingVendor;
    error = errorVendor;
    refetch = refetchVendor;
  } else {
    orders = myOrders;
    isLoading = isLoadingMy;
    error = errorMy;
    refetch = refetchMy;
  }

  const [deleteOrder] = useDeleteOrderMutation();
  const [deleteDialog, setDeleteDialog] = useState({ open: false, order: null });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

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
      if (order.orderStatus !== "Delivered") stats.pending += 1;
      if (order.orderStatus === "Delivered") stats.completed += 1;
      if (order.paymentMethod === "Cash on Delivery") stats.cod += 1;
      if (order.paymentMethod !== "Cash on Delivery") stats.online += 1;
      return stats;
    }, {
      pending: 0,
      completed: 0,
      cod: 0,
      online: 0,
      total: orders.length
    });
  }, [orders]);

  // Filter orders
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((order) =>
        order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.orderStatus === statusFilter);
    }

    // Payment filter
    if (paymentFilter !== "all") {
      filtered = filtered.filter((order) => order.paymentStatus === paymentFilter);
    }

    return filtered;
  }, [orders, searchTerm, statusFilter, paymentFilter]);

  // Dialog handlers
  const openDeleteDialog = (order) => {
    setDeleteDialog({ open: true, order });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, order: null });
  };

  const handleDelete = async () => {
    const order = deleteDialog.order;
    if (!order) return;

    try {
      await deleteOrder(order._id).unwrap();
      toast.success("Order deleted successfully");
      refetch();
      closeDeleteDialog();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete order");
    }
  };

  // Format date
  const formatDate = (date) => {
    return date ? format(new Date(date), 'MMM dd, yyyy') : 'N/A';
  };

  // DataGrid columns
  const columns = [
    {
      field: 'orderItems',
      headerName: 'Product',
      flex: 1.5,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
          <Avatar
            variant="rounded"
            src={params.row.orderItems?.[0]?.media?.[0]?.url}
            alt={params.row.orderItems?.[0]?.name}
            sx={{ width: 50, height: 50, border: '2px solid #e2e8f0' }}
          />
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="body2" fontWeight={600} sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {params.row.orderItems?.[0]?.name || 'N/A'}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Qty: {params.row.orderItems?.[0]?.qty || 0}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      field: 'orderNumber',
      headerName: 'Order #',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value || params.row._id.slice(-6)}
          size="small"
          color="secondary"
          sx={{ fontWeight: 600 }}
        />
      )
    },
    {
      field: 'user',
      headerName: 'Customer',
      width: 150,
      valueGetter: (params) => params.value?.username || 'N/A'
    },
    {
      field: 'createdAt',
      headerName: 'Date',
      width: 130,
      valueGetter: (params) => formatDate(params.value)
    },
    {
      field: 'totalPrice',
      headerName: 'Total',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={700} color="primary.main">
          {format(params.value, params.row.currency || 'USD')}
        </Typography>
      )
    },
    {
      field: 'paymentStatus',
      headerName: 'Payment',
      width: 140,
      renderCell: (params) => getPaymentChip(params.value)
    },
    {
      field: 'orderStatus',
      headerName: 'Status',
      width: 160,
      renderCell: (params) => (
        <Box>
          <Chip
            icon={<LocalShippingIcon />}
            label={params.value}
            color={getStatusColor(params.value)}
            size="small"
            sx={{
              fontWeight: 700,
              borderRadius: 1.5,
              textTransform: 'uppercase',
              fontSize: '0.65rem',
              letterSpacing: '0.05em'
            }}
          />
          {params.value === "Delivered" && params.row.deliveredAt && (
            <Typography variant="caption" color="success.main" sx={{ display: "block", mt: 0.5 }}>
              {formatDate(params.row.deliveredAt)}
            </Typography>
          )}
        </Box>
      )
    },
    {
      field: 'trackingNumber',
      headerName: 'Tracking',
      width: 130,
      renderCell: (params) => {
        if (params.value) {
          return (
            <Tooltip title={params.row.trackingCarrier || "Tracking"}>
              <a
                href={params.row.trackingUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#6366f1", textDecoration: "underline", fontWeight: 600 }}
              >
                {params.value}
              </a>
            </Tooltip>
          );
        }
        return <Chip icon={<InfoIcon />} label="N/A" size="small" />;
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              color="primary"
              component={Link}
              to={`/order/${params.row._id}`}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Delete Order">
            <IconButton
              size="small"
              color="error"
              onClick={() => openDeleteDialog(params.row)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      )
    }
  ];

  return (
    <DocumentTitle title={isAdmin ? `Order Management | ${APP_NAME}` : `My Orders | ${APP_NAME}`}>
      <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", py: 6, px: { xs: 1, md: 4 } }}>
        <Fade in>
          <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, borderRadius: 4, border: '1px solid #e2e8f0', bgcolor: "#fff" }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" fontWeight={800} color="text.primary">
                {isAdmin ? "Order Management" : "My Orders"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isAdmin ? "Manage all platform orders" : "Track and manage your orders"}
              </Typography>
            </Box>

            {/* Status Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="Pending Orders"
                  count={orderStats.pending}
                  icon={<PendingIcon />}
                  color="#ff9800"
                  description="Awaiting fulfillment"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="Completed Orders"
                  count={orderStats.completed}
                  icon={<CheckCircleIcon />}
                  color="#10b981"
                  description="Successfully delivered"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="COD Orders"
                  count={orderStats.cod}
                  icon={<AttachMoneyIcon />}
                  color="#ef4444"
                  description="Cash on delivery"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="Online Payments"
                  count={orderStats.online}
                  icon={<CreditCardIcon />}
                  color="#6366f1"
                  description="Paid electronically"
                />
              </Grid>
            </Grid>

            {/* Filters */}
            <Box sx={{ mb: 4, p: 3, bgcolor: '#f1f5f9', borderRadius: 3, border: '1px solid #e2e8f0' }}>
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    placeholder="Search by order #, customer..."
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: <FaSearch style={{ marginRight: 8, color: '#64748b' }} />,
                      sx: { borderRadius: 2, bgcolor: 'white' }
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Order Status</InputLabel>
                    <Select
                      value={statusFilter}
                      label="Order Status"
                      onChange={(e) => setStatusFilter(e.target.value)}
                      sx={{ borderRadius: 2, bgcolor: 'white' }}
                    >
                      <MenuItem value="all">All Status</MenuItem>
                      <MenuItem value="Placed">Placed</MenuItem>
                      <MenuItem value="Confirmed">Confirmed</MenuItem>
                      <MenuItem value="Packed">Packed</MenuItem>
                      <MenuItem value="Shipped">Shipped</MenuItem>
                      <MenuItem value="Out for Delivery">Out for Delivery</MenuItem>
                      <MenuItem value="Delivered">Delivered</MenuItem>
                      <MenuItem value="Cancelled">Cancelled</MenuItem>
                      <MenuItem value="Returned">Returned</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Payment Status</InputLabel>
                    <Select
                      value={paymentFilter}
                      label="Payment Status"
                      onChange={(e) => setPaymentFilter(e.target.value)}
                      sx={{ borderRadius: 2, bgcolor: 'white' }}
                    >
                      <MenuItem value="all">All Payments</MenuItem>
                      <MenuItem value="Completed">Completed</MenuItem>
                      <MenuItem value="Pending">Pending</MenuItem>
                      <MenuItem value="Failed">Failed</MenuItem>
                      <MenuItem value="Refunded">Refunded</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 2 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="text"
                    startIcon={<FaFilter />}
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                      setPaymentFilter("all");
                    }}
                  >
                    Reset
                  </Button>
                </Grid>
              </Grid>
            </Box>

            {/* DataGrid */}
            <Box sx={{ height: 650, width: '100%', '& .MuiDataGrid-root': { border: 'none' } }}>
              {error ? (
                <Alert severity="error" sx={{ mx: 'auto', mt: 4, maxWidth: 600 }}>
                  {error?.data?.message || "Failed to load orders. Please try again later."}
                </Alert>
              ) : (
                <DataGrid
                  rows={filteredOrders}
                  columns={columns}
                  getRowId={(row) => row._id}
                  loading={isLoading}
                  page={page}
                  pageSize={pageSize}
                  onPageChange={(newPage) => setPage(newPage)}
                  onPageSizeChange={(newSize) => setPageSize(newSize)}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  disableSelectionOnClick
                  density="comfortable"
                  sx={{
                    '& .MuiDataGrid-columnHeaders': {
                      bgcolor: '#f8fafc',
                      color: '#475569',
                      fontWeight: 700,
                      borderBottom: '1px solid #e2e8f0',
                    },
                    '& .MuiDataGrid-row': {
                      borderBottom: '1px solid #f1f5f9',
                      '&:hover': { bgcolor: '#f1f5f9' },
                    },
                    '& .MuiDataGrid-footerContainer': {
                      borderTop: '1px solid #e2e8f0',
                    },
                  }}
                />
              )}
            </Box>
          </Paper>
        </Fade>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog.open} onClose={closeDeleteDialog} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
            <DeleteForeverIcon /> Confirm Deletion
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1">
              Are you sure you want to delete order <strong>#{deleteDialog.order?.orderNumber || deleteDialog.order?._id?.slice(-6)}</strong>?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              This action cannot be undone. All order data will be permanently removed.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={closeDeleteDialog}>Cancel</Button>
            <Button onClick={handleDelete} variant="contained" color="error" sx={{ borderRadius: 2 }}>
              Confirm Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DocumentTitle>
  );
};

export default OrderList;