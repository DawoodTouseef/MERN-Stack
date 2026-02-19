import { useState } from "react";
import {
  useGetBrandsQuery,
  useAddBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
} from "../../redux/api/brandApiSlice";
import { DataGrid } from '@mui/x-data-grid';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Stack,
  Switch,
  FormControlLabel,
  Chip,
  Avatar,
  Tooltip,
  Alert,
  Fade,
  Grid
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DeleteForever as DeleteForeverIcon,
  LocalOffer as LocalOfferIcon,
  Image as ImageIcon
} from "@mui/icons-material";
import { FaSearch } from "react-icons/fa";
import { toast } from "react-toastify";
import { useUploadProductImageMutation, useDeleteProductImageMutation } from "../../redux/api/productApiSlice";
import DocumentTitle from "../../components/DocumentTitle";
import { APP_NAME } from "../../redux/constants";

const Brand = () => {
  const { data: brands = [], isLoading, refetch } = useGetBrandsQuery();
  const [addBrand, { isLoading: isAdding }] = useAddBrandMutation();
  const [updateBrand, { isLoading: isUpdating }] = useUpdateBrandMutation();
  const [deleteBrand] = useDeleteBrandMutation();
  const [uploadProductImage] = useUploadProductImageMutation();
  const [deleteProductImage] = useDeleteProductImageMutation();

  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [editDialog, setEditDialog] = useState({ open: false, brand: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, brand: null });
  const [addDialog, setAddDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    logo: "",
    website: "",
    description: "",
    isActive: true,
    imageFile: null,
  });
  const [imagePreview, setImagePreview] = useState("");

  // Filter brands
  const filteredBrands = brands.filter((brand) =>
    brand.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brand.website?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Dialog handlers
  const openAddDialog = () => {
    setFormData({
      name: "",
      logo: "",
      website: "",
      description: "",
      isActive: true,
      imageFile: null,
    });
    setImagePreview("");
    setAddDialog(true);
  };

  const closeAddDialog = () => {
    setAddDialog(false);
    setFormData({
      name: "",
      logo: "",
      website: "",
      description: "",
      isActive: true,
      imageFile: null,
    });
    setImagePreview("");
  };

  const openEditDialog = (brand) => {
    setFormData({
      name: brand.name,
      logo: brand.logo,
      website: brand.website || "",
      description: brand.description || "",
      isActive: brand.isActive ?? true,
      imageFile: null,
    });
    setImagePreview(brand.logo || "");
    setEditDialog({ open: true, brand });
  };

  const closeEditDialog = () => {
    setEditDialog({ open: false, brand: null });
    setFormData({
      name: "",
      logo: "",
      website: "",
      description: "",
      isActive: true,
      imageFile: null,
    });
    setImagePreview("");
  };

  const openDeleteDialog = (brand) => {
    setDeleteDialog({ open: true, brand });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, brand: null });
  };

  // Image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, imageFile: file });
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const uploadImage = async (file) => {
    const formDataObj = new FormData();
    formDataObj.append("image", file);
    try {
      const res = await uploadProductImage(formDataObj).unwrap();
      return res.images;
    } catch (error) {
      toast.error(error?.data?.message || "Image upload failed");
      return null;
    }
  };

  // Add brand
  const handleAdd = async () => {
    try {
      let logoUrl = formData.logo;

      if (formData.imageFile) {
        const uploaded = await uploadImage(formData.imageFile);
        if (!uploaded) return;
        logoUrl = uploaded;
      }

      const payload = {
        name: formData.name,
        logo: logoUrl,
        website: formData.website,
        description: formData.description,
        isActive: formData.isActive,
      };

      await addBrand(payload).unwrap();
      toast.success("Brand added successfully!");
      refetch();
      closeAddDialog();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to add brand");
    }
  };

  // Update brand
  const handleUpdate = async () => {
    try {
      let logoUrl = formData.logo;

      if (formData.imageFile) {
        const uploaded = await uploadImage(formData.imageFile);
        if (!uploaded) return;
        logoUrl = uploaded;
      }

      const payload = {
        _id: editDialog.brand._id,
        name: formData.name,
        logo: logoUrl,
        website: formData.website,
        description: formData.description,
        isActive: formData.isActive,
      };

      await updateBrand(payload).unwrap();
      toast.success("Brand updated successfully!");
      refetch();
      closeEditDialog();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update brand");
    }
  };

  // Delete brand
  const handleDelete = async () => {
    const brand = deleteDialog.brand;
    if (!brand) return;

    try {
      await deleteBrand(brand._id).unwrap();
      if (brand.logo) {
        await deleteProductImage({ imagePath: brand.logo }).unwrap();
      }
      toast.success("Brand deleted successfully!");
      refetch();
      closeDeleteDialog();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to delete brand");
    }
  };

  // DataGrid columns
  const columns = [
    {
      field: 'logo',
      headerName: 'Logo',
      width: 100,
      renderCell: (params) => (
        <Avatar
          src={params.value}
          alt={params.row.name}
          sx={{ width: 50, height: 50 }}
        >
          <LocalOfferIcon />
        </Avatar>
      )
    },
    {
      field: 'name',
      headerName: 'Brand Name',
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600}>
          {params.value}
        </Typography>
      )
    },
    {
      field: 'website',
      headerName: 'Website',
      flex: 1,
      renderCell: (params) => {
        if (params.value) {
          return (
            <a
              href={params.value}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#6366f1", textDecoration: "underline" }}
            >
              {params.value}
            </a>
          );
        }
        return <Typography variant="body2" color="text.secondary">N/A</Typography>;
      }
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1.5,
      renderCell: (params) => (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {params.value || 'No description'}
        </Typography>
      )
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value ? "Active" : "Inactive"}
          color={params.value ? "success" : "default"}
          size="small"
          sx={{ fontWeight: 600 }}
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Edit Brand">
            <IconButton
              size="small"
              onClick={() => openEditDialog(params.row)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Delete Brand">
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
    <DocumentTitle title={`Brand Management | ${APP_NAME}`}>
      <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", py: 6, px: { xs: 1, md: 4 } }}>
        <Fade in>
          <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, borderRadius: 4, border: '1px solid #e2e8f0', bgcolor: "#fff" }}>
            {/* Header */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h4" fontWeight={800} color="text.primary">
                  Brand Management
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage product brands and their information
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={openAddDialog}
                sx={{ borderRadius: 2, fontWeight: 600 }}
              >
                Add Brand
              </Button>
            </Box>

            {/* Search */}
            <Box sx={{ mb: 4, maxWidth: 400 }}>
              <TextField
                fullWidth
                placeholder="Search brands..."
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <FaSearch style={{ marginRight: 8, color: '#64748b' }} />,
                  sx: { borderRadius: 2, bgcolor: '#f1f5f9' }
                }}
              />
            </Box>

            {/* DataGrid */}
            <Box sx={{ height: 600, width: '100%', '& .MuiDataGrid-root': { border: 'none' } }}>
              {filteredBrands.length === 0 && !isLoading ? (
                <Alert severity="info" sx={{ mx: 'auto', mt: 4, maxWidth: 600 }}>
                  No brands found. Click "Add Brand" to create your first brand.
                </Alert>
              ) : (
                <DataGrid
                  rows={filteredBrands}
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

        {/* Add Brand Dialog */}
        <Dialog open={addDialog} onClose={closeAddDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}>Add New Brand</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid size={12}>
                <TextField
                  label="Brand Name"
                  fullWidth
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  label="Website"
                  fullWidth
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://example.com"
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  label="Description"
                  fullWidth
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                  }
                  label="Active"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Button variant="outlined" component="label" fullWidth startIcon={<ImageIcon />}>
                  Upload Logo
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImageChange}
                  />
                </Button>
              </Grid>
              {imagePreview && (
                <Grid size={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Avatar src={imagePreview} sx={{ width: 80, height: 80 }} />
                  </Box>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={closeAddDialog}>Cancel</Button>
            <Button
              onClick={handleAdd}
              variant="contained"
              disabled={isAdding || !formData.name}
              sx={{ borderRadius: 2 }}
            >
              {isAdding ? "Adding..." : "Add Brand"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Brand Dialog */}
        <Dialog open={editDialog.open} onClose={closeEditDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}>Edit Brand</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid size={12}>
                <TextField
                  label="Brand Name"
                  fullWidth
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  label="Website"
                  fullWidth
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://example.com"
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  label="Description"
                  fullWidth
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                  }
                  label="Active"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Button variant="outlined" component="label" fullWidth startIcon={<ImageIcon />}>
                  Change Logo
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImageChange}
                  />
                </Button>
              </Grid>
              {imagePreview && (
                <Grid size={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Avatar src={imagePreview} sx={{ width: 80, height: 80 }} />
                  </Box>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={closeEditDialog}>Cancel</Button>
            <Button
              onClick={handleUpdate}
              variant="contained"
              disabled={isUpdating || !formData.name}
              sx={{ borderRadius: 2 }}
            >
              {isUpdating ? "Updating..." : "Update Brand"}
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
              Are you sure you want to delete <strong>{deleteDialog.brand?.name}</strong>?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              This action cannot be undone. All brand data will be permanently removed.
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

export default Brand;
