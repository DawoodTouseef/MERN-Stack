import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Tooltip,
} from "@mui/material";
import { useFetchBannersQuery, useCreateBannerMutation, useUpdateBannerMutation, useDeleteBannerMutation } from "../../redux/api/bannerApiSlice";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";

const BannerCarousels = () => {
  const { data: banners, isLoading, isError, error } = useFetchBannersQuery();
  const [createBanner] = useCreateBannerMutation();
  const [updateBanner] = useUpdateBannerMutation();
  const [deleteBanner] = useDeleteBannerMutation();

  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    image: "",
    ctaText: "",
    ctaLink: "",
    startDate: "",
    endDate: "",
    priority: 1,
    tags: [],
  });
  const [editMode, setEditMode] = useState(false);
  const [bannerId, setBannerId] = useState(null);

  const handleOpenDialog = (banner = null) => {
    if (banner) {
      setEditMode(true);
      setBannerId(banner._id);
      setFormData({ ...banner });
    } else {
      setEditMode(false);
      setFormData({
        title: "",
        subtitle: "",
        image: "",
        ctaText: "",
        ctaLink: "",
        startDate: "",
        endDate: "",
        priority: 1,
        tags: [],
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditMode(false);
    setBannerId(null);
    setFormData({
      title: "",
      subtitle: "",
      image: "",
      ctaText: "",
      ctaLink: "",
      startDate: "",
      endDate: "",
      priority: 1,
      tags: [],
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      if (editMode) {
        await updateBanner({ id: bannerId, bannerData: formData }).unwrap();
      } else {
        await createBanner(formData).unwrap();
      }
      handleCloseDialog();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteBanner = async (id) => {
    if (window.confirm("Are you sure you want to delete this banner?")) {
      try {
        await deleteBanner(id).unwrap();
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <Box sx={{ maxWidth: "1200px", mx: "auto", mt: 6, px: 2 }}>
      <Typography
        variant="h4"
        fontWeight="bold"
        sx={{ mb: 4, textAlign: "center", color: "primary.main" }}
      >
        Manage Banners
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            textTransform: "none",
            fontWeight: "bold",
            borderRadius: 2,
          }}
        >
          Add Banner
        </Button>
      </Box>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Typography variant="body1" color="error" sx={{ textAlign: "center" }}>
          {error?.data?.message || "Failed to load banners"}
        </Typography>
      ) : (
        <Stack spacing={3}>
          {banners.map((banner) => (
            <Paper
              key={banner._id}
              elevation={3}
              sx={{
                p: 3,
                borderRadius: 2,
                boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
                bgcolor: "background.paper",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                <img
                  src={banner.image}
                  alt={banner.title}
                  style={{ width: 100, height: 100, borderRadius: 8 }}
                />
                <Box>
                  <Typography variant="h6" fontWeight="bold" sx={{ color: "primary.main" }}>
                    {banner.title}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
                    {banner.subtitle}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
                    Priority: {banner.priority}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <Tooltip title="Edit Banner">
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenDialog(banner)}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Banner">
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteBanner(banner._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Paper>
          ))}
        </Stack>
      )}

      {/* Add/Edit Banner Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{editMode ? "Edit Banner" : "Add Banner"}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Subtitle"
            name="subtitle"
            value={formData.subtitle}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Image URL"
            name="image"
            value={formData.image}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="CTA Text"
            name="ctaText"
            value={formData.ctaText}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="CTA Link"
            name="ctaLink"
            value={formData.ctaLink}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Start Date"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="End Date"
            name="endDate"
            type="date"
            value={formData.endDate}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Priority"
            name="priority"
            type="number"
            value={formData.priority}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editMode ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BannerCarousels;