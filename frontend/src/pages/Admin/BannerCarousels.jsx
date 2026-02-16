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
  Avatar,
  Stack,
  Grid,
  Alert,
  Fade
} from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';
import { useFetchBannersQuery, useCreateBannerMutation, useUpdateBannerMutation, useDeleteBannerMutation } from "../../redux/api/bannerApiSlice";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  DeleteForever as DeleteForeverIcon,
  Image as ImageIcon,
  Visibility as VisibilityIcon
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { format } from "date-fns";
import DocumentTitle from "react-document-title";
import { APP_NAME } from "../../redux/constants";

const BannerCarousels = () => {
  const { data: banners = [], isLoading, isError, error, refetch } = useFetchBannersQuery();
  const [createBanner, { isLoading: isCreating }] = useCreateBannerMutation();
  const [updateBanner, { isLoading: isUpdating }] = useUpdateBannerMutation();
  const [deleteBanner] = useDeleteBannerMutation();

  // State management
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [addDialog, setAddDialog] = useState(false);
  const [editDialog, setEditDialog] = useState({ open: false, banner: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, banner: null });
  const [previewDialog, setPreviewDialog] = useState({ open: false, banner: null });
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    image: "",
    ctaText: "",
    ctaLink: "",
    startDate: "",
    endDate: "",
    priority: 1,
  });

  // Dialog handlers
  const openAddDialog = () => {
    setFormData({
      title: "",
      subtitle: "",
      image: "",
      ctaText: "",
      ctaLink: "",
      startDate: "",
      endDate: "",
      priority: 1,
    });
    setAddDialog(true);
  };

  const closeAddDialog = () => {
    setAddDialog(false);
  };

  const openEditDialog = (banner) => {
    setFormData({
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      image: banner.image || "",
      ctaText: banner.ctaText || "",
      ctaLink: banner.ctaLink || "",
      startDate: banner.startDate ? banner.startDate.substring(0, 10) : "",
      endDate: banner.endDate ? banner.endDate.substring(0, 10) : "",
      priority: banner.priority || 1,
    });
    setEditDialog({ open: true, banner });
  };

  const closeEditDialog = () => {
    setEditDialog({ open: false, banner: null });
  };

  const openDeleteDialog = (banner) => {
    setDeleteDialog({ open: true, banner });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, banner: null });
  };

  const openPreviewDialog = (banner) => {
    setPreviewDialog({ open: true, banner });
  };

  const closePreviewDialog = () => {
    setPreviewDialog({ open: false, banner: null });
  };

  // CRUD operations
  const handleAdd = async () => {
    try {
      await createBanner(formData).unwrap();
      toast.success("Banner created successfully!");
      refetch();
      closeAddDialog();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to create banner");
    }
  };

  const handleUpdate = async () => {
    try {
      await updateBanner({ id: editDialog.banner._id, bannerData: formData }).unwrap();
      toast.success("Banner updated successfully!");
      refetch();
      closeEditDialog();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update banner");
    }
  };

  const handleDelete = async () => {
    const banner = deleteDialog.banner;
    if (!banner) return;

    try {
      await deleteBanner(banner._id).unwrap();
      toast.success("Banner deleted successfully!");
      refetch();
      closeDeleteDialog();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete banner");
    }
  };

  // Format date
  const formatDate = (date) => {
    return date ? format(new Date(date), 'MMM dd, yyyy') : 'N/A';
  };

  // Check if banner is active
  const isBannerActive = (banner) => {
    const now = new Date();
    const start = banner.startDate ? new Date(banner.startDate) : null;
    const end = banner.endDate ? new Date(banner.endDate) : null;

    if (start && end) {
      return now >= start && now <= end;
    }
    return true;
  };

  // DataGrid columns
  const columns = [
    {
      field: 'image',
      headerName: 'Preview',
      width: 120,
      renderCell: (params) => (
        <Avatar
          variant="rounded"
          src={params.value}
          alt={params.row.title}
          sx={{ width: 80, height: 50, cursor: 'pointer' }}
          onClick={() => openPreviewDialog(params.row)}
        >
          <ImageIcon />
        </Avatar>
      )
    },
    {
      field: 'title',
      headerName: 'Title',
      flex: 1,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.subtitle}
          </Typography>
        </Box>
      )
    },
    {
      field: 'priority',
      headerName: 'Priority',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={`#${params.value}`}
          size="small"
          color="primary"
          variant="outlined"
          sx={{ fontWeight: 600 }}
        />
      )
    },
    {
      field: 'startDate',
      headerName: 'Start Date',
      width: 130,
      valueGetter: (params) => formatDate(params.value)
    },
    {
      field: 'endDate',
      headerName: 'End Date',
      width: 130,
      valueGetter: (params) => formatDate(params.value)
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => {
        const active = isBannerActive(params.row);
        return (
          <Chip
            label={active ? "Active" : "Inactive"}
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
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Preview Banner">
            <IconButton
              size="small"
              color="primary"
              onClick={() => openPreviewDialog(params.row)}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Edit Banner">
            <IconButton
              size="small"
              onClick={() => openEditDialog(params.row)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Delete Banner">
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
    <DocumentTitle title={`Banner Management | ${APP_NAME}`}>
      <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", py: 6, px: { xs: 1, md: 4 } }}>
        <Fade in>
          <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, borderRadius: 4, border: '1px solid #e2e8f0', bgcolor: "#fff" }}>
            {/* Header */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h4" fontWeight={800} color="text.primary">
                  Banner & Carousel Management
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage homepage banners and promotional carousels
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={openAddDialog}
                sx={{ borderRadius: 2, fontWeight: 600 }}
              >
                Add Banner
              </Button>
            </Box>

            {/* DataGrid */}
            <Box sx={{ height: 600, width: '100%', '& .MuiDataGrid-root': { border: 'none' } }}>
              {isError ? (
                <Alert severity="error" sx={{ mx: 'auto', mt: 4, maxWidth: 600 }}>
                  {error?.data?.message || "Failed to load banners. Please try again later."}
                </Alert>
              ) : (
                <DataGrid
                  rows={banners}
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

        {/* Add Banner Dialog */}
        <Dialog open={addDialog} onClose={closeAddDialog} maxWidth="md" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}>Add New Banner</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Title"
                  fullWidth
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Subtitle"
                  fullWidth
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Image URL"
                  fullWidth
                  required
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://example.com/banner.jpg"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="CTA Text"
                  fullWidth
                  value={formData.ctaText}
                  onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                  placeholder="Shop Now"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="CTA Link"
                  fullWidth
                  value={formData.ctaLink}
                  onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                  placeholder="/shop"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Start Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="End Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Priority"
                  type="number"
                  fullWidth
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
                  inputProps={{ min: 1 }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={closeAddDialog}>Cancel</Button>
            <Button
              onClick={handleAdd}
              variant="contained"
              disabled={isCreating || !formData.title || !formData.image}
              sx={{ borderRadius: 2 }}
            >
              {isCreating ? "Creating..." : "Add Banner"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Banner Dialog */}
        <Dialog open={editDialog.open} onClose={closeEditDialog} maxWidth="md" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}>Edit Banner</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Title"
                  fullWidth
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Subtitle"
                  fullWidth
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Image URL"
                  fullWidth
                  required
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="CTA Text"
                  fullWidth
                  value={formData.ctaText}
                  onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="CTA Link"
                  fullWidth
                  value={formData.ctaLink}
                  onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Start Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="End Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Priority"
                  type="number"
                  fullWidth
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
                  inputProps={{ min: 1 }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={closeEditDialog}>Cancel</Button>
            <Button
              onClick={handleUpdate}
              variant="contained"
              disabled={isUpdating || !formData.title || !formData.image}
              sx={{ borderRadius: 2 }}
            >
              {isUpdating ? "Updating..." : "Update Banner"}
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
              Are you sure you want to delete the banner <strong>{deleteDialog.banner?.title}</strong>?
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

        {/* Preview Dialog */}
        <Dialog open={previewDialog.open} onClose={closePreviewDialog} maxWidth="md" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}>Banner Preview</DialogTitle>
          <DialogContent>
            {previewDialog.banner && (
              <Box>
                <img
                  src={previewDialog.banner.image}
                  alt={previewDialog.banner.title}
                  style={{ width: '100%', borderRadius: 8, marginBottom: 16 }}
                />
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  {previewDialog.banner.title}
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  {previewDialog.banner.subtitle}
                </Typography>
                {previewDialog.banner.ctaText && (
                  <Button variant="contained" sx={{ mt: 2 }}>
                    {previewDialog.banner.ctaText}
                  </Button>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={closePreviewDialog} variant="contained">Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DocumentTitle>
  );
};

export default BannerCarousels;