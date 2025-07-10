import { useState } from "react";
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useFetchCategoriesQuery,
} from "../../redux/api/categoryApiSlice";
import { toast } from "react-toastify";
import CategoryForm from "../../components/CategoryForm";
import Modal from "../../components/Modal";
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
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";

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

  const [modalVisible, setModalVisible] = useState(false);
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
        toast.success(`${result.name} is created.`);
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
        toast.success(`${result.name} is updated`);
        setSelectedCategory(null);
        setUpdatingName("");
        setUpdatingDescription("");
        setUpdatingImage("");
        setUpdatingParent("");
        setUpdatingIsActive(true);
        setModalVisible(false);
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
        toast.success("Category deleted.");
        setSelectedCategory(null);
        setModalVisible(false);
        refetch();
      }
    } catch (error) {
      toast.error("Category deletion failed. Try again.");
    }
  };

  // When editing, prefill modal fields
  const openEditModal = (category) => {
    setModalVisible(true);
    setSelectedCategory(category);
    setUpdatingName(category.name);
    setUpdatingDescription(category.description || "");
    setUpdatingImage(category.image || "");
    setUpdatingParent(category.parent ? category.parent._id || category.parent : "");
    setUpdatingIsActive(category.isActive ?? true);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f3e7e9 0%, #e3eeff 100%)",
        py: 6,
        px: { xs: 1, md: 8 },
      }}
      className="min-h-screen"
    >
      <Paper
        elevation={6}
        sx={{
          maxWidth: 900,
          mx: "auto",
          p: { xs: 2, md: 5 },
          borderRadius: 4,
          bgcolor: "#fff",
          boxShadow: "0 8px 32px 0 rgba(236,72,153,0.10)",
        }}
        className="shadow-xl"
      >
        <Typography
          variant="h4"
          fontWeight={800}
          color="primary.main"
          sx={{
            mb: 3,
            letterSpacing: 1,
            textAlign: "center",
            textShadow: "2px 2px 8px #f3e7e9",
          }}
        >
          Manage Categories
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Box sx={{ mb: 4 }}>
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
            buttonText={creating ? "Adding..." : "Add Category"}
            disabled={creating}
          />
        </Box>
        <Divider sx={{ mb: 3 }} />
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 6 }}>
            <CircularProgress color="secondary" />
          </Box>
        ) : (
          <Grid container spacing={2}>
            {categories.map((category) => (
              <Grid item xs={12} sm={6} md={4} key={category._id}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderRadius: 3,
                    bgcolor: "#f9fafb",
                    boxShadow: "0 2px 8px 0 rgba(236,72,153,0.08)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "scale(1.03)",
                      boxShadow: 8,
                      bgcolor: "#fce7f3",
                    },
                  }}
                  className="hover:scale-105 hover:shadow-2xl transition-transform duration-200"
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    {category.image && (
                      <Avatar
                        src={category.image}
                        alt={category.name}
                        sx={{ width: 40, height: 40, mr: 1 }}
                      />
                    )}
                    <Box>
                      <Chip
                        label={category.name}
                        color="secondary"
                        sx={{
                          fontWeight: 600,
                          fontSize: "1.1rem",
                          px: 2,
                          py: 1,
                          bgcolor: "#ec4899",
                          color: "#fff",
                          letterSpacing: 1,
                        }}
                        className="capitalize"
                      />
                      {category.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {category.description}
                        </Typography>
                      )}
                      {category.parent && (
                        <Typography variant="caption" color="primary" sx={{ display: "block" }}>
                          Parent: {category.parent.name || category.parent}
                        </Typography>
                      )}
                      <Typography variant="caption" sx={{ display: "block" }}>
                        Status:{" "}
                        <b style={{ color: category.isActive ? "#22c55e" : "#ef4444" }}>
                          {category.isActive ? "Active" : "Inactive"}
                        </b>
                      </Typography>
                    </Box>
                  </Stack>
                  <Box>
                    <Tooltip title="Edit">
                      <IconButton
                        onClick={() => openEditModal(category)}
                        sx={{
                          color: "#ec4899",
                          "&:hover": { bgcolor: "#f3e8ff" },
                        }}
                        className="hover:bg-pink-100"
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        onClick={() => {
                          setModalVisible(true);
                          setSelectedCategory(category);
                          setUpdatingName(category.name);
                          setUpdatingDescription(category.description || "");
                          setUpdatingImage(category.image || "");
                          setUpdatingParent(category.parent ? category.parent._id || category.parent : "");
                          setUpdatingIsActive(category.isActive ?? true);
                        }}
                        sx={{
                          color: "#ef4444",
                          "&:hover": { bgcolor: "#fee2e2" },
                        }}
                        className="hover:bg-red-100"
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
        <Modal isOpen={modalVisible} onClose={() => setModalVisible(false)}>
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
            buttonText={updating ? "Updating..." : "Update"}
            handleDelete={handleDeleteCategory}
            disabled={updating || deleting}
            isEdit
          />
        </Modal>
      </Paper>
    </Box>
  );
};

export default CategoryList;