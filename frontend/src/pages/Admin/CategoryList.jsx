import { useState } from "react";
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useFetchCategoriesQuery,
} from "../../redux/api/categoryApiSlice";
import { toast } from "react-toastify";
import CategoryForm from "../../components/CategoryForm";
import { useSelector } from "react-redux";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  CircularProgress,
  Avatar,
  Switch,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Container,
  Fade,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Category as CategoryIcon,
  Warning as WarningIcon
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";

const CategoryList = () => {
  const { data: categories = [], isLoading, refetch } = useFetchCategoriesQuery();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [parent, setParent] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [updatingName, setUpdatingName] = useState("");
  const [updatingDescription, setUpdatingDescription] = useState("");
  const [updatingImage, setUpdatingImage] = useState("");
  const [updatingParent, setUpdatingParent] = useState("");
  const [updatingIsActive, setUpdatingIsActive] = useState(true);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { userInfo } = useSelector((state) => state.auth);

  const [createCategory, { isLoading: creating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: updating }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: deleting }] = useDeleteCategoryMutation();

  // Create
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!name) {
      toast.error("Category name is required");
      return;
    }
    try {
      const user = userInfo._id;
      const result = await createCategory({
        name,
        description,
        image,
        parent: parent || null,
        isActive,
        user,
      }).unwrap();

      if (result.error) {
        toast.error(result.error);
      } else {
        setName("");
        setDescription("");
        setImage("");
        setParent("");
        setIsActive(true);
        toast.success(`Category "${result.name}" created successfully!`);
        refetch();
      }
    } catch (error) {
      toast.error("Creating category failed, try again.");
    }
  };

  // Update
  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!updatingName) {
      toast.error("Category name is required");
      return;
    }
    try {
      const result = await updateCategory({
        categoryId: selectedCategory._id,
        updatedCategory: {
          name: updatingName,
          description: updatingDescription,
          image: updatingImage,
          parent: updatingParent || null,
          isActive: updatingIsActive,
        },
      }).unwrap();

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Category "${result.name}" updated successfully!`);
        setEditDialogOpen(false);
        refetch();
      }
    } catch (error) {
      toast.error("Updating category failed, try again.");
    }
  };

  // Delete
  const handleDeleteCategory = async () => {
    try {
      const result = await deleteCategory(selectedCategory._id).unwrap();
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Category deleted successfully.");
        setDeleteDialogOpen(false);
        setEditDialogOpen(false);
        refetch();
      }
    } catch (error) {
      toast.error("Category deletion failed. Try again.");
    }
  };

  // Toggle category active status
  const handleToggleActiveStatus = async (category) => {
    try {
      const result = await updateCategory({
        categoryId: category._id,
        updatedCategory: {
          isActive: !category.isActive,
        },
      }).unwrap();
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Category ${result.isActive ? 'activated' : 'deactivated'}`);
        refetch();
      }
    } catch (error) {
      toast.error("Failed to update category status.");
    }
  };

  const openEditDialog = (category) => {
    setSelectedCategory(category);
    setUpdatingName(category.name);
    setUpdatingDescription(category.description || "");
    setUpdatingImage(category.image || "");
    setUpdatingParent(category.parent ? category.parent._id || category.parent : "");
    setUpdatingIsActive(category.isActive ?? true);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (category) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  const EmptyState = () => (
    <Box sx={{
      textAlign: 'center',
      py: 10,
      bgcolor: 'rgba(255,255,255,0.5)',
      borderRadius: 4,
      border: '2px dashed #cbd5e1'
    }}>
      <CategoryIcon sx={{ fontSize: 60, color: '#94a3b8', mb: 2 }} />
      <Typography variant="h6" color="text.secondary">No categories found</Typography>
      <Typography variant="body2" color="text.secondary">Start by adding your first category above.</Typography>
    </Box>
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
        py: 8,
      }}
    >
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: 6,
              bgcolor: "#fff",
              border: "1px solid #e2e8f0",
              boxShadow: "0 10px 40px -10px rgba(0,0,0,0.05)",
            }}
          >
            <Box sx={{ mb: 5, textAlign: 'center' }}>
              <Typography
                variant="h3"
                fontWeight={900}
                sx={{
                  background: "linear-gradient(45deg, #6366f1 30%, #ec4899 90%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  mb: 1
                }}
              >
                Category Intelligence
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Organize your products with enterprise-grade hierarchy and status management.
              </Typography>
            </Box>

            <Paper
              elevation={0}
              sx={{
                p: 4,
                mb: 6,
                borderRadius: 4,
                bgcolor: '#f8fafc',
                border: '1px solid #f1f5f9'
              }}
            >
              <Typography variant="h6" fontWeight={700} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CategoryIcon color="primary" /> Add New Category
              </Typography>
              <CategoryForm
                value={name}
                setValue={setName}
                description={description}
                setDescription={setDescription}
                image={image}
                setImage={setImage}
                parent={parent}
                setParent={setParent}
                isActive={isActive}
                setIsActive={setIsActive}
                categories={categories}
                handleSubmit={handleCreateCategory}
                buttonText={creating ? "Creating..." : "Create Category"}
                disabled={creating}
              />
            </Paper>

            <Divider sx={{ mb: 5 }}>
              <Chip label="Existing Categories" sx={{ fontWeight: 700, px: 2 }} />
            </Divider>

            {isLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
                <CircularProgress thickness={5} size={60} sx={{ color: '#6366f1' }} />
              </Box>
            ) : categories.length === 0 ? (
              <EmptyState />
            ) : (
              <Grid container spacing={3}>
                <AnimatePresence>
                  {categories.map((category) => (
                    <Grid item xs={12} sm={6} lg={4} key={category._id}>
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        whileHover={{ y: -5 }}
                      >
                        <Paper
                          elevation={0}
                          sx={{
                            p: 3,
                            height: '100%',
                            display: "flex",
                            flexDirection: 'column',
                            borderRadius: 4,
                            bgcolor: category.isActive ? "#fff" : "#f1f5f9",
                            border: "1px solid #e2e8f0",
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            "&:hover": {
                              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                              borderColor: "#6366f1",
                            },
                          }}
                        >
                          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                            <Avatar
                              src={category.image}
                              alt={category.name}
                              variant="rounded"
                              sx={{
                                width: 56,
                                height: 56,
                                bgcolor: '#e0e7ff',
                                color: '#6366f1',
                                border: '1px solid #c7d2fe'
                              }}
                            >
                              <CategoryIcon fontSize="large" />
                            </Avatar>
                            <Box sx={{ overflow: 'hidden' }}>
                              <Typography
                                variant="h6"
                                fontWeight={800}
                                noWrap
                                sx={{ color: '#1e293b' }}
                              >
                                {category.name}
                              </Typography>
                              <Chip
                                size="small"
                                label={category.isActive ? "Active" : "Inactive"}
                                color={category.isActive ? "success" : "default"}
                                sx={{ height: 20, fontSize: '0.65rem', fontWeight: 900 }}
                              />
                            </Box>
                          </Stack>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mb: 2,
                              flexGrow: 1,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              minHeight: '2.5rem'
                            }}
                          >
                            {category.description || "No description provided."}
                          </Typography>

                          {category.parent && (
                            <Box sx={{ mb: 2, px: 1.5, py: 0.5, bgcolor: '#f8fafc', borderRadius: 1.5, border: '1px solid #f1f5f9' }}>
                              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                Parent: <span style={{ color: '#6366f1' }}>{category.parent.name || category.parent}</span>
                              </Typography>
                            </Box>
                          )}

                          <Divider sx={{ mb: 2, opacity: 0.5 }} />

                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Box>
                              <Tooltip title="Edit Category">
                                <IconButton
                                  size="small"
                                  onClick={() => openEditDialog(category)}
                                  sx={{ color: '#6366f1', '&:hover': { bgcolor: '#e0e7ff' } }}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete Category">
                                <IconButton
                                  size="small"
                                  onClick={() => openDeleteDialog(category)}
                                  sx={{ color: '#ef4444', '&:hover': { bgcolor: '#fee2e2' } }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                            <Switch
                              size="small"
                              checked={category.isActive}
                              onChange={() => handleToggleActiveStatus(category)}
                              color="primary"
                            />
                          </Stack>
                        </Paper>
                      </motion.div>
                    </Grid>
                  ))}
                </AnimatePresence>
              </Grid>
            )}
          </Paper>
        </motion.div>
      </Container>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Fade}
        PaperProps={{
          sx: { borderRadius: 4, p: 1 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          Edit Category
        </DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          <CategoryForm
            value={updatingName}
            setValue={setUpdatingName}
            description={updatingDescription}
            setDescription={setUpdatingDescription}
            image={updatingImage}
            setImage={setUpdatingImage}
            parent={updatingParent}
            setParent={setUpdatingParent}
            isActive={updatingIsActive}
            setIsActive={setUpdatingIsActive}
            categories={categories}
            handleSubmit={handleUpdateCategory}
            buttonText={updating ? "Updating..." : "Update Changes"}
            disabled={updating}
            isEdit
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setEditDialogOpen(false)} sx={{ fontWeight: 600, color: 'text.secondary' }}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 4, p: 1 }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#ef4444' }}>
          <WarningIcon /> Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete <strong>{selectedCategory?.name}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone and may affect products linked to this category.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: 'text.secondary' }}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteCategory}
            variant="contained"
            color="error"
            disabled={deleting}
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            {deleting ? "Deleting..." : "Delete Permanently"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoryList;
