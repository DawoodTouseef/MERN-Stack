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
  Paper,
  Stack,
  Tooltip,
  IconButton,
} from "@mui/material";
import { useFetchPagesQuery, useCreatePageMutation, useUpdatePageMutation, useDeletePageMutation } from "../../redux/api/PagesApiSlice";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";

const Pages = () => {
  const { data: pages, isLoading, isError, error } = useFetchPagesQuery();
  const [createPage] = useCreatePageMutation();
  const [updatePage] = useUpdatePageMutation();
  const [deletePage] = useDeletePageMutation();

  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    route: "",
    content: "",
    status: "draft",
    publishDate: "",
    expiryDate: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [pageId, setPageId] = useState(null);

  const handleOpenDialog = (page = null) => {
    if (page) {
      setEditMode(true);
      setPageId(page._id);
      setFormData({ ...page });
    } else {
      setEditMode(false);
      setFormData({
        title: "",
        slug: "",
        route: "",
        content: "",
        status: "draft",
        publishDate: "",
        expiryDate: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditMode(false);
    setPageId(null);
    setFormData({
      title: "",
      slug: "",
      route: "",
      content: "",
      status: "draft",
      publishDate: "",
      expiryDate: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      if (editMode) {
        await updatePage({ id: pageId, pageData: formData }).unwrap();
      } else {
        await createPage(formData).unwrap();
      }
      handleCloseDialog();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeletePage = async (id) => {
    if (window.confirm("Are you sure you want to delete this page?")) {
      try {
        await deletePage(id).unwrap();
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
        Manage Pages
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
          Add Page
        </Button>
      </Box>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Typography variant="body1" color="error" sx={{ textAlign: "center" }}>
          {error?.data?.message || "Failed to load pages"}
        </Typography>
      ) : (
        <Stack spacing={3}>
          {pages.map((page) => (
            <Paper
              key={page._id}
              elevation={3}
              sx={{
                p: 3,
                borderRadius: 2,
                boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
                bgcolor: "background.paper",
              }}
            >
              <Box>
                <Typography variant="h6" fontWeight="bold" sx={{ color: "primary.main" }}>
                  {page.title}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
                  Route: {page.route}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
                  Status: {page.status}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <Tooltip title="Edit Page">
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenDialog(page)}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Page">
                  <IconButton
                    color="error"
                    onClick={() => handleDeletePage(page._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Paper>
          ))}
        </Stack>
      )}

      {/* Add/Edit Page Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{editMode ? "Edit Page" : "Add Page"}</DialogTitle>
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
            label="Slug"
            name="slug"
            value={formData.slug}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Route"
            name="route"
            value={formData.route}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Content"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            multiline
            rows={4}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            select
            sx={{ mb: 2 }}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </TextField>
          <TextField
            fullWidth
            label="Publish Date"
            name="publishDate"
            type="date"
            value={formData.publishDate}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Expiry Date"
            name="expiryDate"
            type="date"
            value={formData.expiryDate}
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

export default Pages;