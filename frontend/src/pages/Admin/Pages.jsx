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
  MenuItem
} from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';
import { useFetchPagesQuery, useCreatePageMutation, useUpdatePageMutation, useDeletePageMutation } from "../../redux/api/PagesApiSlice";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  DeleteForever as DeleteForeverIcon,
  Article as ArticleIcon,
  Visibility as VisibilityIcon
} from "@mui/icons-material";
import { format } from "date-fns";
import DocumentTitle from "../../components/DocumentTitle";
import { APP_NAME } from "../../redux/constants";

const Pages = () => {
  const { data: pages = [], isLoading, isError, error, refetch } = useFetchPagesQuery();
  const [createPage, { isLoading: isCreating }] = useCreatePageMutation();
  const [updatePage, { isLoading: isUpdating }] = useUpdatePageMutation();
  const [deletePage] = useDeletePageMutation();

  // State management
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [addDialog, setAddDialog] = useState(false);
  const [editDialog, setEditDialog] = useState({ open: false, page: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, page: null });
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    route: "",
    content: "",
    status: "draft",
    publishDate: "",
    expiryDate: "",
  });

  // Dialog handlers
  const openAddDialog = () => {
    setFormData({
      title: "",
      slug: "",
      route: "",
      content: "",
      status: "draft",
      publishDate: "",
      expiryDate: "",
    });
    setAddDialog(true);
  };

  const closeAddDialog = () => {
    setAddDialog(false);
  };

  const openEditDialog = (pageData) => {
    setFormData({
      title: pageData.title || "",
      slug: pageData.slug || "",
      route: pageData.route || "",
      content: pageData.content || "",
      status: pageData.status || "draft",
      publishDate: pageData.publishDate ? pageData.publishDate.substring(0, 10) : "",
      expiryDate: pageData.expiryDate ? pageData.expiryDate.substring(0, 10) : "",
    });
    setEditDialog({ open: true, page: pageData });
  };

  const closeEditDialog = () => {
    setEditDialog({ open: false, page: null });
  };

  const openDeleteDialog = (pageData) => {
    setDeleteDialog({ open: true, page: pageData });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, page: null });
  };

  // CRUD operations
  const handleAdd = async () => {
    try {
      await createPage(formData).unwrap();
      toast.success("Page created successfully!");
      refetch();
      closeAddDialog();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to create page");
    }
  };

  const handleUpdate = async () => {
    try {
      await updatePage({ id: editDialog.page._id, pageData: formData }).unwrap();
      toast.success("Page updated successfully!");
      refetch();
      closeEditDialog();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update page");
    }
  };

  const handleDelete = async () => {
    const pageData = deleteDialog.page;
    if (!pageData) return;

    try {
      await deletePage(pageData._id).unwrap();
      toast.success("Page deleted successfully!");
      refetch();
      closeDeleteDialog();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete page");
    }
  };

  // Format date
  const formatDate = (date) => {
    return date ? format(new Date(date), 'MMM dd, yyyy') : 'N/A';
  };

  // DataGrid columns
  const columns = [
    {
      field: 'title',
      headerName: 'Page Title',
      flex: 1.5,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.route}
          </Typography>
        </Box>
      )
    },
    {
      field: 'slug',
      headerName: 'Slug',
      width: 150,
      renderCell: (params) => (
        <Chip label={params.value} size="small" variant="outlined" />
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value?.toUpperCase()}
          color={params.value === 'published' ? 'success' : 'default'}
          size="small"
          sx={{ fontWeight: 600 }}
        />
      )
    },
    {
      field: 'publishDate',
      headerName: 'Publish Date',
      width: 130,
      valueGetter: (params) => formatDate(params.value)
    },
    {
      field: 'expiryDate',
      headerName: 'Expiry Date',
      width: 130,
      valueGetter: (params) => formatDate(params.value)
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="View Page">
            <IconButton
              size="small"
              color="primary"
              onClick={() => window.open(params.row.route, '_blank')}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Edit Page">
            <IconButton
              size="small"
              onClick={() => openEditDialog(params.row)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Delete Page">
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
    <DocumentTitle title={`Pages Management | ${APP_NAME}`}>
      <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", py: 6, px: { xs: 1, md: 4 } }}>
        <Fade in>
          <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, borderRadius: 4, border: '1px solid #e2e8f0', bgcolor: "#fff" }}>
            {/* Header */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h4" fontWeight={800} color="text.primary">
                  Static Pages Management
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage static content pages (About, Terms, Privacy, etc.)
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={openAddDialog}
                sx={{ borderRadius: 2, fontWeight: 600 }}
              >
                Add Page
              </Button>
            </Box>

            {/* DataGrid */}
            <Box sx={{ height: 600, width: '100%', '& .MuiDataGrid-root': { border: 'none' } }}>
              {isError ? (
                <Alert severity="error" sx={{ mx: 'auto', mt: 4, maxWidth: 600 }}>
                  {error?.data?.message || "Failed to load pages. Please try again later."}
                </Alert>
              ) : (
                <DataGrid
                  rows={pages}
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

        {/* Add Page Dialog */}
        <Dialog open={addDialog} onClose={closeAddDialog} maxWidth="md" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}>Create New Page</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Page Title"
                  fullWidth
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Slug"
                  fullWidth
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  placeholder="about-us"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Route"
                  fullWidth
                  required
                  value={formData.route}
                  onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                  placeholder="/about"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Content"
                  fullWidth
                  multiline
                  rows={6}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Page content..."
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Status"
                  select
                  fullWidth
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="published">Published</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Publish Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={formData.publishDate}
                  onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Expiry Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={closeAddDialog}>Cancel</Button>
            <Button
              onClick={handleAdd}
              variant="contained"
              disabled={isCreating || !formData.title || !formData.slug}
              sx={{ borderRadius: 2 }}
            >
              {isCreating ? "Creating..." : "Create Page"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Page Dialog */}
        <Dialog open={editDialog.open} onClose={closeEditDialog} maxWidth="md" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}>Edit Page</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Page Title"
                  fullWidth
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Slug"
                  fullWidth
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Route"
                  fullWidth
                  required
                  value={formData.route}
                  onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Content"
                  fullWidth
                  multiline
                  rows={6}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Status"
                  select
                  fullWidth
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="published">Published</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Publish Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={formData.publishDate}
                  onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Expiry Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={closeEditDialog}>Cancel</Button>
            <Button
              onClick={handleUpdate}
              variant="contained"
              disabled={isUpdating || !formData.title || !formData.slug}
              sx={{ borderRadius: 2 }}
            >
              {isUpdating ? "Updating..." : "Update Page"}
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
              Are you sure you want to delete the page <strong>{deleteDialog.page?.title}</strong>?
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

export default Pages;