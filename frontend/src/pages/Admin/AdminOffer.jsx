import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Paper,
  Tooltip,
  Chip,
  Stack,
  Grid,
  Alert,
  Fade,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete
} from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';
import {
  useFetchOffersQuery,
  useCreateOfferMutation,
  useUpdateOfferMutation,
  useDeleteOfferMutation,
} from "../../redux/api/offerApiSlice";
import { useFetchCategoriesQuery } from "../../redux/api/categoryApiSlice";
import { useAllProductsQuery } from "../../redux/api/productApiSlice";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  DeleteForever as DeleteForeverIcon,
  LocalOffer as LocalOfferIcon
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { format } from "date-fns";
import DocumentTitle from "react-document-title";
import { APP_NAME } from "../../redux/constants";

const AdminOffer = () => {
  const { data: offers = [], isLoading, isError, error, refetch } = useFetchOffersQuery();
  const { data: categories = [] } = useFetchCategoriesQuery();
  const { data: products = [] } = useAllProductsQuery();
  const [createOffer, { isLoading: isCreating }] = useCreateOfferMutation();
  const [updateOffer, { isLoading: isUpdating }] = useUpdateOfferMutation();
  const [deleteOffer] = useDeleteOfferMutation();

  // State management
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [addDialog, setAddDialog] = useState(false);
  const [editDialog, setEditDialog] = useState({ open: false, offer: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, offer: null });
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    offerType: "Today's Deals",
    discountValue: 0,
    discountUnit: "percent",
    products: [],
    categories: [],
    brand: "",
    bankName: "",
    promoCode: "",
    minCartValue: 0,
    startTime: "",
    endTime: "",
  });

  // Dialog handlers
  const openAddDialog = () => {
    setFormData({
      title: "",
      description: "",
      offerType: "Today's Deals",
      discountValue: 0,
      discountUnit: "percent",
      products: [],
      categories: [],
      brand: "",
      bankName: "",
      promoCode: "",
      minCartValue: 0,
      startTime: "",
      endTime: "",
    });
    setAddDialog(true);
  };

  const closeAddDialog = () => {
    setAddDialog(false);
  };

  const openEditDialog = (offer) => {
    setFormData({
      title: offer.title || "",
      description: offer.description || "",
      offerType: offer.offerType || "Today's Deals",
      discountValue: offer.discountValue || 0,
      discountUnit: offer.discountUnit || "percent",
      products: offer.products || [],
      categories: offer.categories || [],
      brand: offer.brand || "",
      bankName: offer.bankName || "",
      promoCode: offer.promoCode || "",
      minCartValue: offer.minCartValue || 0,
      startTime: offer.startTime ? offer.startTime.substring(0, 16) : "",
      endTime: offer.endTime ? offer.endTime.substring(0, 16) : "",
    });
    setEditDialog({ open: true, offer });
  };

  const closeEditDialog = () => {
    setEditDialog({ open: false, offer: null });
  };

  const openDeleteDialog = (offer) => {
    setDeleteDialog({ open: true, offer });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, offer: null });
  };

  // CRUD operations
  const handleAdd = async () => {
    try {
      await createOffer(formData).unwrap();
      toast.success("Offer created successfully!");
      refetch();
      closeAddDialog();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to create offer");
    }
  };

  const handleUpdate = async () => {
    try {
      await updateOffer({ id: editDialog.offer._id, offerData: formData }).unwrap();
      toast.success("Offer updated successfully!");
      refetch();
      closeEditDialog();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update offer");
    }
  };

  const handleDelete = async () => {
    const offer = deleteDialog.offer;
    if (!offer) return;

    try {
      await deleteOffer(offer._id).unwrap();
      toast.success("Offer deleted successfully!");
      refetch();
      closeDeleteDialog();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete offer");
    }
  };

  // Format date
  const formatDate = (date) => {
    return date ? format(new Date(date), 'MMM dd, yyyy HH:mm') : 'N/A';
  };

  // Check if offer is active
  const isOfferActive = (offer) => {
    const now = new Date();
    const start = offer.startTime ? new Date(offer.startTime) : null;
    const end = offer.endTime ? new Date(offer.endTime) : null;

    if (start && end) {
      return now >= start && now <= end;
    }
    return true;
  };

  // DataGrid columns
  const columns = [
    {
      field: 'title',
      headerName: 'Offer Title',
      flex: 1.5,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.offerType}
          </Typography>
        </Box>
      )
    },
    {
      field: 'discountValue',
      headerName: 'Discount',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={`${params.value}${params.row.discountUnit === 'percent' ? '%' : ' OFF'}`}
          color="secondary"
          size="small"
          sx={{ fontWeight: 600 }}
        />
      )
    },
    {
      field: 'promoCode',
      headerName: 'Promo Code',
      width: 130,
      renderCell: (params) => params.value ? (
        <Chip label={params.value} size="small" variant="outlined" />
      ) : <Typography variant="caption" color="text.secondary">N/A</Typography>
    },
    {
      field: 'minCartValue',
      headerName: 'Min Cart',
      width: 110,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600}>
          ${params.value || 0}
        </Typography>
      )
    },
    {
      field: 'startTime',
      headerName: 'Start Time',
      width: 160,
      valueGetter: (params) => formatDate(params.value)
    },
    {
      field: 'endTime',
      headerName: 'End Time',
      width: 160,
      valueGetter: (params) => formatDate(params.value)
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => {
        const active = isOfferActive(params.row);
        return (
          <Chip
            label={active ? "Active" : "Expired"}
            color={active ? "success" : "default"}
            size="small"
            sx={{ fontWeight: 600 }}
          />
        );
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Edit Offer">
            <IconButton
              size="small"
              onClick={() => openEditDialog(params.row)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Delete Offer">
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

  const OfferForm = ({ formData, setFormData }) => (
    <Grid container spacing={2} sx={{ mt: 0.5 }}>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Offer Title"
          fullWidth
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth required>
          <InputLabel>Offer Type</InputLabel>
          <Select
            value={formData.offerType}
            label="Offer Type"
            onChange={(e) => setFormData({ ...formData, offerType: e.target.value })}
          >
            <MenuItem value="Today's Deals">Today's Deals</MenuItem>
            <MenuItem value="Lightning">Lightning Deals</MenuItem>
            <MenuItem value="bank">Bank Offers</MenuItem>
            <MenuItem value="Festival">Festival Sales</MenuItem>
            <MenuItem value="flash">Flash Sale</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Description"
          fullWidth
          multiline
          rows={3}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Discount Value"
          type="number"
          fullWidth
          required
          value={formData.discountValue}
          onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
          inputProps={{ min: 0 }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth required>
          <InputLabel>Discount Unit</InputLabel>
          <Select
            value={formData.discountUnit}
            label="Discount Unit"
            onChange={(e) => setFormData({ ...formData, discountUnit: e.target.value })}
          >
            <MenuItem value="percent">Percent (%)</MenuItem>
            <MenuItem value="flat">Flat Amount ($)</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Promo Code"
          fullWidth
          value={formData.promoCode}
          onChange={(e) => setFormData({ ...formData, promoCode: e.target.value.toUpperCase() })}
          placeholder="SAVE20"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Min Cart Value"
          type="number"
          fullWidth
          value={formData.minCartValue}
          onChange={(e) => setFormData({ ...formData, minCartValue: parseFloat(e.target.value) || 0 })}
          inputProps={{ min: 0 }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Start Time"
          type="datetime-local"
          fullWidth
          InputLabelProps={{ shrink: true }}
          value={formData.startTime}
          onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="End Time"
          type="datetime-local"
          fullWidth
          InputLabelProps={{ shrink: true }}
          value={formData.endTime}
          onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
        />
      </Grid>
      <Grid item xs={12}>
        <Autocomplete
          multiple
          options={categories}
          getOptionLabel={(option) => option.name}
          value={categories.filter(cat => formData.categories.includes(cat._id))}
          onChange={(e, newValue) => setFormData({ ...formData, categories: newValue.map(v => v._id) })}
          renderInput={(params) => <TextField {...params} label="Categories" placeholder="Select categories" />}
        />
      </Grid>
      <Grid item xs={12}>
        <Autocomplete
          multiple
          options={products}
          getOptionLabel={(option) => option.name}
          value={products.filter(prod => formData.products.includes(prod._id))}
          onChange={(e, newValue) => setFormData({ ...formData, products: newValue.map(v => v._id) })}
          renderInput={(params) => <TextField {...params} label="Products" placeholder="Select products" />}
        />
      </Grid>
    </Grid>
  );

  return (
    <DocumentTitle title={`Offer Management | ${APP_NAME}`}>
      <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", py: 6, px: { xs: 1, md: 4 } }}>
        <Fade in>
          <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, borderRadius: 4, border: '1px solid #e2e8f0', bgcolor: "#fff" }}>
            {/* Header */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h4" fontWeight={800} color="text.primary">
                  Offer & Promotion Management
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Create and manage promotional offers and discount campaigns
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={openAddDialog}
                sx={{ borderRadius: 2, fontWeight: 600 }}
              >
                Add Offer
              </Button>
            </Box>

            {/* DataGrid */}
            <Box sx={{ height: 600, width: '100%', '& .MuiDataGrid-root': { border: 'none' } }}>
              {isError ? (
                <Alert severity="error" sx={{ mx: 'auto', mt: 4, maxWidth: 600 }}>
                  {error?.data?.message || "Failed to load offers. Please try again later."}
                </Alert>
              ) : (
                <DataGrid
                  rows={offers}
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

        {/* Add Offer Dialog */}
        <Dialog open={addDialog} onClose={closeAddDialog} maxWidth="md" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}>Create New Offer</DialogTitle>
          <DialogContent>
            <OfferForm formData={formData} setFormData={setFormData} />
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={closeAddDialog}>Cancel</Button>
            <Button
              onClick={handleAdd}
              variant="contained"
              disabled={isCreating || !formData.title}
              sx={{ borderRadius: 2 }}
            >
              {isCreating ? "Creating..." : "Create Offer"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Offer Dialog */}
        <Dialog open={editDialog.open} onClose={closeEditDialog} maxWidth="md" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}>Edit Offer</DialogTitle>
          <DialogContent>
            <OfferForm formData={formData} setFormData={setFormData} />
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={closeEditDialog}>Cancel</Button>
            <Button
              onClick={handleUpdate}
              variant="contained"
              disabled={isUpdating || !formData.title}
              sx={{ borderRadius: 2 }}
            >
              {isUpdating ? "Updating..." : "Update Offer"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog.open} onClose={closeDeleteDialog} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
            <DeleteForeverIcon /> Confirm Deletion
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1">
              Are you sure you want to delete the offer <strong>{deleteDialog.offer?.title}</strong>?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              This action cannot be undone.
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

export default AdminOffer;