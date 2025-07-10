import { useState, useEffect } from "react";
import {
  useGetBrandsQuery,
  useAddBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
} from "../../redux/api/brandApiSlice";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  CircularProgress,
  IconButton,
  Stack,
  Divider,
  Tooltip,
  Switch,
  FormControlLabel,
  Chip,
} from "@mui/material";
import { toast } from "react-toastify";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import { useUploadProductImageMutation,useDeleteProductImageMutation } from "../../redux/api/productApiSlice";

const Brand = () => {
  const { data: brands = [], isLoading, refetch } = useGetBrandsQuery();
  const [addBrand, { isLoading: isAdding }] = useAddBrandMutation();
  const [updateBrand, { isLoading: isUpdating }] = useUpdateBrandMutation();
  const [deleteBrand, { isLoading: isDeleting }] = useDeleteBrandMutation();
  const [uploadProductImage] = useUploadProductImageMutation();
  const [deleteProductImage] = useDeleteProductImageMutation();
  const [form, setForm] = useState({
    name: "",
    logo: "",
    website: "",
    description: "",
    isActive: true,
    imageFile: null,
  });

  const [editId, setEditId] = useState(null);
  const [imageUrl, setImageUrl] = useState("");

  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    if (name === "image") {
      setForm({ ...form, imageFile: files[0] });
    } else if (type === "checkbox") {
      setForm({ ...form, [name]: checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await uploadProductImage(formData).unwrap();
      toast.success(res.message);
      setImageUrl(res.image);
      return res.images;
    } catch (error) {
      toast.error(error?.data?.message || error.error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let logoUrl = form.logo;

      if (form.imageFile) {
        const uploaded = await uploadImage(form.imageFile);
        if (!uploaded) return;
        logoUrl = uploaded;
      }
      const payload = {
        name: form.name,
        logo: logoUrl,
        website: form.website,
        description: form.description,
        isActive: form.isActive,
      };
      if (editId) {
        await updateBrand({ ...payload, _id: editId }).unwrap();
        toast.success("Brand updated!");
      } else {
        await addBrand(payload).unwrap();
        toast.success("Brand added!");
      }

      setForm({
        name: "",
        logo: "",
        website: "",
        description: "",
        isActive: true,
        imageFile: null,
      });
      setEditId(null);
      setImageUrl("");
      refetch();
    } catch (error) {
      console.error("Error saving brand:", error);
      toast.error(error?.data?.message || error.error || "Failed to save brand");
    }
  };

  const handleEdit = (brand) => {
    setForm({
      name: brand.name,
      logo: brand.logo,
      website: brand.website || "",
      description: brand.description || "",
      isActive: brand.isActive ?? true,
      imageFile: null,
    });
    setEditId(brand._id);
    setImageUrl(brand.logo || "");
  };

  const handleDelete = async (id,imagePath) => {
    if (window.confirm("Are you sure you want to delete this brand?")) {
      try {
        await deleteBrand(id).unwrap();
        if (imagePath) {
          await deleteProductImage({ imagePath }).unwrap();
        }

        toast.success("Brand deleted!");
        refetch();
      } catch (error) {
        toast.error(error?.data?.message || error.error || "Delete failed");
      }
    }
  };

  useEffect(() => {
    if (form.imageFile) {
      const url = URL.createObjectURL(form.imageFile);
      setImageUrl(url);
    }
  }, [form.imageFile]);

  return (
    <>
    <Box
      sx={{
        maxWidth: 800,
        mx: "auto",
        mt: 8,
        px: { xs: 1, md: 0 },
        pb: 8,
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f3e7e9 0%, #e3eeff 100%)",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: { xs: 2, md: 4 },
          mb: 4,
          borderRadius: 4,
          boxShadow: "0 8px 32px 0 rgba(236,72,153,0.10)",
          background: "linear-gradient(135deg, #fff 80%, #e3eeff 100%)",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <LocalOfferIcon style={{ color: "#ec4899", fontSize: 28 }} />
          <Typography variant="h5" fontWeight="bold" sx={{ color: "#18181b" }}>
            {editId ? "Edit Brand" : "Add Brand"}
          </Typography>
        </Stack>
        <Divider sx={{ mb: 3, bgcolor: "#e3eeff" }} />
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Brand Name"
                name="name"
                fullWidth
                required
                value={form.name}
                onChange={handleChange}
                sx={{
                  bgcolor: "#f9fafb",
                  borderRadius: 2,
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#e3eeff" },
                    "&:hover fieldset": { borderColor: "#ec4899" },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Website"
                name="website"
                fullWidth
                value={form.website}
                onChange={handleChange}
                sx={{
                  bgcolor: "#f9fafb",
                  borderRadius: 2,
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#e3eeff" },
                    "&:hover fieldset": { borderColor: "#ec4899" },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                name="description"
                fullWidth
                multiline
                minRows={3}
                maxRows={5}
                inputProps={{ maxLength: 500 }}
                value={form.description}
                onChange={handleChange}
                sx={{
                  bgcolor: "#f9fafb",
                  borderRadius: 2,
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#e3eeff" },
                    "&:hover fieldset": { borderColor: "#ec4899" },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.isActive}
                    onChange={handleChange}
                    name="isActive"
                    color="primary"
                  />
                }
                label="Active"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button variant="contained" component="label" fullWidth color="primary">
                Upload Logo
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  name="image"
                  onChange={handleChange}
                />
              </Button>
              {form.imageFile && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Selected: {form.imageFile.name}
                </Typography>
              )}
              {imageUrl && (
                <Box mt={2}>
                  <img
                    src={imageUrl}
                    alt="Preview"
                    style={{ width: 80, height: 80, borderRadius: "50%" }}
                  />
                </Box>
              )}
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="secondary"
                fullWidth
                size="large"
                sx={{
                  borderRadius: 3,
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                  mt: 2,
                  background: "#ec4899",
                  "&:hover": { background: "#be185d" },
                  boxShadow: 2,
                  textTransform: "none",
                }}
                disabled={isAdding || isUpdating}
              >
                {(isAdding || isUpdating) ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  editId ? "Update Brand" : "Add Brand"
                )}
              </Button>
              {editId && (
                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  sx={{
                    mt: 2,
                    borderRadius: 3,
                    fontWeight: 600,
                    textTransform: "none",
                  }}
                  onClick={() => {
                    setEditId(null);
                    setForm({
                      name: "",
                      logo: "",
                      website: "",
                      description: "",
                      isActive: true,
                      imageFile: null,
                    });
                    setImageUrl("");
                  }}
                >
                  Cancel Edit
                </Button>
              )}
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Paper
        elevation={4}
        sx={{
          p: { xs: 2, md: 4 },
          borderRadius: 4,
          boxShadow: "0 4px 24px 0 rgba(236,72,153,0.10)",
          background: "linear-gradient(135deg, #fff 90%, #e3eeff 100%)",
        }}
      >
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: "#6366f1" }}>
          Your Brands
        </Typography>
        <Divider sx={{ mb: 2, bgcolor: "#e3eeff" }} />
        {isLoading ? (
          <CircularProgress />
        ) : brands.length === 0 ? (
          <Typography color="text.secondary">No brands found.</Typography>
        ) : (
          brands.map((brand) => (
            <Box
              key={brand._id}
              sx={{
                mb: 2,
                p: 2,
                border: "1.5px solid #e3eeff",
                borderRadius: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                bgcolor: "#fafafa",
                boxShadow: "0 2px 8px #ec489933",
                transition: "box-shadow 0.2s, border 0.2s",
                "&:hover": {
                  boxShadow: "0 4px 16px #ec489955",
                  border: "1.5px solid #ec4899",
                },
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                {brand.logo && (
                  <img
                    src={brand.logo}
                    alt="logo"
                    style={{ width: 40, height: 40, borderRadius: "50%" }}
                  />
                )}
                <Box>
                  <Typography sx={{ color: "#18181b" }}>
                    <b>{brand.name}</b>
                  </Typography>
                  {brand.website && (
                    <Typography variant="body2" color="textSecondary">
                      {brand.website}
                    </Typography>
                  )}
                  {brand.description && (
                    <Typography variant="body2" color="textSecondary">
                      {brand.description}
                    </Typography>
                  )}
                  <Chip
                    label={brand.isActive ? "Active" : "Inactive"}
                    color={brand.isActive ? "success" : "default"}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Box>
              </Stack>
              <Box>
                <Tooltip title="Edit">
                  <IconButton color="primary" onClick={() => handleEdit(brand)}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton color="error" onClick={() => handleDelete(brand._id,brand.logo)}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          ))
        )}
      </Paper>
    </Box>
    </>
  );
};

export default Brand;
