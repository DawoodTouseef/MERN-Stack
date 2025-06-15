import  { useState } from "react";
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
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import {
  useFetchOffersQuery,
  useCreateOfferMutation,
  useUpdateOfferMutation,
  useDeleteOfferMutation,
} from "../../redux/api/offerApiSlice";
import { useFetchCategoriesQuery } from "../../redux/api/categoryApiSlice";
import { useAllProductsQuery } from "../../redux/api/productApiSlice";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";

const AdminOffer = () => {
  const { data: offers, isLoading, isError, error } = useFetchOffersQuery();
  const { data: categories } = useFetchCategoriesQuery();
  const { data: products } = useAllProductsQuery();
  const [createOffer] = useCreateOfferMutation();
  const [updateOffer] = useUpdateOfferMutation();
  const [deleteOffer] = useDeleteOfferMutation();

  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    offerType: "Today’s Deals",
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
  const [editMode, setEditMode] = useState(false);
  const [offerId, setOfferId] = useState(null);

  const handleOpenDialog = (offer = null) => {
    if (offer) {
      setEditMode(true);
      setOfferId(offer._id);
      setFormData({ ...offer });
    } else {
      setEditMode(false);
      setFormData({
        title: "",
        description: "",
        offerType: "Today’s Deals",
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
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditMode(false);
    setOfferId(null);
    setFormData({
      title: "",
      description: "",
      offerType: "Today’s Deals",
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
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      if (editMode) {
        await updateOffer({ id: offerId, offerData: formData }).unwrap();
      } else {
        await createOffer(formData).unwrap();
      }
      handleCloseDialog();
    } catch (error) {
      console.error(error?.data?.message);
    }
  };

  const handleDeleteOffer = async (id) => {
    if (window.confirm("Are you sure you want to delete this offer?")) {
      try {
        await deleteOffer(id).unwrap();
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
        Manage Offers
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
          Add Offer
        </Button>
      </Box>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Typography variant="body1" color="error" sx={{ textAlign: "center" }}>
          {error?.data?.message || "Failed to load offers"}
        </Typography>
      ) : (
        <Stack spacing={3}>
          {offers.map((offer) => (
            <Paper
              key={offer._id}
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
                  {offer.title}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
                  Type: {offer.offerType}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
                  Discount: {offer.discountValue} {offer.discountUnit}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <Tooltip title="Edit Offer">
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenDialog(offer)}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Offer">
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteOffer(offer._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Paper>
          ))}
        </Stack>
      )}

      {/* Add/Edit Offer Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{editMode ? "Edit Offer" : "Add Offer"}</DialogTitle>
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
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            multiline
            rows={4}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Offer Type"
            name="offerType"
            value={formData.offerType}
            onChange={handleInputChange}
            select
            sx={{ mb: 2 }}
          >
            <MenuItem value="today">Today’s Deals</MenuItem>
            <MenuItem value="Lightning">Lightning Deals</MenuItem>
            <MenuItem value="bank">Bank Offers</MenuItem>
            <MenuItem value="Festival">Festival Sales</MenuItem>
            <MenuItem value="flash">Flash Sale</MenuItem>
          </TextField>
          <TextField
            fullWidth
            label="Discount Value"
            name="discountValue"
            type="number"
            value={formData.discountValue}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Discount Unit"
            name="discountUnit"
            value={formData.discountUnit}
            onChange={handleInputChange}
            select
            sx={{ mb: 2 }}
          >
            <MenuItem value="percent">Percent</MenuItem>
            <MenuItem value="flat">Flat</MenuItem>
          </TextField>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Products</InputLabel>
            <Select
              multiple
              value={formData.products}
              onChange={(e) => handleSelectChange("products", e.target.value)}
            >
              {products?.map((product) => (
                <MenuItem key={product._id} value={product._id}>
                  {product.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Categories</InputLabel>
            <Select
              multiple
              value={formData.categories}
              onChange={(e) => handleSelectChange("categories", e.target.value)}
            >
              {categories?.map((category) => (
                <MenuItem key={category._id} value={category._id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Start Time"
            name="startTime"
            type="datetime-local"
            value={formData.startTime}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="End Time"
            name="endTime"
            type="datetime-local"
            value={formData.endTime}
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

export default AdminOffer;