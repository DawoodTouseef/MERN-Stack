import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useAllProductsQuery, useDeleteProductMutation } from "../../redux/api/productApiSlice";
import { DataGrid } from '@mui/x-data-grid';
import {
  Box,
  Typography,
  Button,
  Paper,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Fade,
  Alert,
  Grid
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  DeleteForever as DeleteForeverIcon,
  Inventory as InventoryIcon,
  Category as CategoryIcon,
  AttachMoney as MoneyIcon
} from "@mui/icons-material";
import { FaSearch, FaFilter } from "react-icons/fa";
import DocumentTitle from "react-document-title";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const AllProducts = () => {
  const { data: products = [], isLoading, isError, refetch } = useAllProductsQuery();
  const [deleteProduct] = useDeleteProductMutation();
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // State management
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, product: null });

  // Listen for product changes
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === "productChanged") {
        refetch();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [refetch]);

  // Filter products based on user role and filters
  useEffect(() => {
    let filtered = products;

    // Filter by user (seller/vendor only sees their own products)
    if (userInfo?.role !== "admin") {
      filtered = filtered.filter((p) => p.user === userInfo._id);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((p) =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((p) => p.category?._id === categoryFilter || p.category?.name === categoryFilter);
    }

    // Apply status filter
    if (statusFilter !== "all") {
      if (statusFilter === "in-stock") {
        filtered = filtered.filter((p) => p.countInStock > 0);
      } else if (statusFilter === "out-of-stock") {
        filtered = filtered.filter((p) => p.countInStock === 0);
      }
    }

    setFilteredProducts(filtered);
  }, [products, userInfo, searchTerm, categoryFilter, statusFilter]);

  // Refetch on focus
  useEffect(() => {
    const onFocus = () => refetch();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refetch]);

  // Dialog handlers
  const openDeleteDialog = (product) => {
    setDeleteDialog({ open: true, product });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, product: null });
  };

  const handleDelete = async () => {
    const product = deleteDialog.product;
    if (!product) return;

    try {
      await deleteProduct(product._id).unwrap();
      toast.success("Product deleted successfully");
      localStorage.setItem("productChanged", Date.now().toString());
      refetch();
      closeDeleteDialog();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete product");
    }
  };

  // Format date
  const formatDate = (date) => {
    return date ? format(new Date(date), 'MMM dd, yyyy') : 'N/A';
  };

  // Get unique categories for filter
  const categories = [...new Set(products.map(p => p.category?.name).filter(Boolean))];

  // DataGrid columns
  const columns = [
    {
      field: 'name',
      headerName: 'Product',
      flex: 2,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
          <Avatar
            variant="rounded"
            src={params.row.media?.[0]?.url}
            alt={params.row.name}
            sx={{ width: 50, height: 50, border: '2px solid #e2e8f0' }}
          >
            <InventoryIcon />
          </Avatar>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="body2" fontWeight={600} sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {params.row.name}
            </Typography>
            <Typography variant="caption" color="textSecondary" display="block">
              {params.row.brand || 'No brand'}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 150,
      valueGetter: (params) => params.value?.name || 'Uncategorized'
    },
    {
      field: 'price',
      headerName: 'Price',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600} color="primary.main">
          ${params.value?.toFixed(2)}
        </Typography>
      )
    },
    {
      field: 'countInStock',
      headerName: 'Stock',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value > 0 ? params.value : 'Out'}
          size="small"
          color={params.value > 0 ? 'success' : 'error'}
          sx={{ fontWeight: 600 }}
        />
      )
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 130,
      valueGetter: (params) => formatDate(params.value)
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 180,
      sortable: false,
      renderCell: (params) => {
        const updatePath = userInfo?.role === "vendor"
          ? `/vendor/product/update/${params.row._id}`
          : userInfo?.role === "seller"
            ? `/seller/product/update/${params.row._id}`
            : `/admin/product/update/${params.row._id}`;

        return (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="View Product">
              <IconButton
                size="small"
                color="primary"
                onClick={() => navigate(`/product/${params.row._id}`)}
              >
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Edit Product">
              <IconButton
                size="small"
                component={Link}
                to={updatePath}
                onClick={() => {
                  localStorage.setItem("productChanged", Date.now().toString());
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Delete Product">
              <IconButton
                size="small"
                color="error"
                onClick={() => openDeleteDialog(params.row)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        );
      }
    }
  ];

  // Determine add product path based on role
  const addProductPath = userInfo?.role === "vendor"
    ? "/vendor/product/add"
    : userInfo?.role === "seller"
      ? "/seller/product/add"
      : "/admin/product/add";

  return (
    <DocumentTitle title="Products | Nexus Mart">
      <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", py: 6, px: { xs: 1, md: 4 } }}>
        <Fade in>
          <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, borderRadius: 4, border: '1px solid #e2e8f0', bgcolor: "#fff" }}>
            {/* Header */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h4" fontWeight={800} color="text.primary">
                  Product Inventory
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage your product catalog and inventory
                </Typography>
              </Box>
              <Button
                component={Link}
                to={addProductPath}
                variant="contained"
                startIcon={<AddIcon />}
                sx={{ borderRadius: 2, fontWeight: 600 }}
              >
                Add Product
              </Button>
            </Box>

            {/* Filters */}
            <Box sx={{ mb: 4, p: 3, bgcolor: '#f1f5f9', borderRadius: 3, border: '1px solid #e2e8f0' }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    placeholder="Search products..."
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: <FaSearch style={{ marginRight: 8, color: '#64748b' }} />,
                      sx: { borderRadius: 2, bgcolor: 'white' }
                    }}
                  />
                </Grid>
                <Grid item xs={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={categoryFilter}
                      label="Category"
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      sx={{ borderRadius: 2, bgcolor: 'white' }}
                    >
                      <MenuItem value="all">All Categories</MenuItem>
                      {categories.map((cat) => (
                        <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Stock Status</InputLabel>
                    <Select
                      value={statusFilter}
                      label="Stock Status"
                      onChange={(e) => setStatusFilter(e.target.value)}
                      sx={{ borderRadius: 2, bgcolor: 'white' }}
                    >
                      <MenuItem value="all">All Status</MenuItem>
                      <MenuItem value="in-stock">In Stock</MenuItem>
                      <MenuItem value="out-of-stock">Out of Stock</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="text"
                    startIcon={<FaFilter />}
                    onClick={() => {
                      setSearchTerm("");
                      setCategoryFilter("all");
                      setStatusFilter("all");
                    }}
                  >
                    Reset
                  </Button>
                </Grid>
              </Grid>
            </Box>

            {/* DataGrid */}
            <Box sx={{ height: 650, width: '100%', '& .MuiDataGrid-root': { border: 'none' } }}>
              {isError ? (
                <Alert severity="error" sx={{ mx: 'auto', mt: 4, maxWidth: 600 }}>
                  Failed to load products. Please try again later.
                </Alert>
              ) : (
                <DataGrid
                  rows={filteredProducts}
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
              Are you sure you want to permanently delete <strong>{deleteDialog.product?.name}</strong>?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              This action cannot be undone. All product data will be removed.
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

export default AllProducts;