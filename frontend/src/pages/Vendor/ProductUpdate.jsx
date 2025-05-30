import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetProductByIdQuery,
  useUploadProductImageMutation,
} from "../../redux/api/productApiSlice";
import { useFetchCategoriesQuery } from "../../redux/api/categoryApiSlice";
import { toast } from "react-toastify";
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  TextField,
  MenuItem,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { PhotoCamera, Delete, Save } from "@mui/icons-material";

const AdminProductUpdate = () => {
  const params = useParams();
  const { data: productData, isLoading } = useGetProductByIdQuery(params._id);
  const [image, setImage] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [brand, setBrand] = useState("");
  const [stock, setStock] = useState("");
  const navigate = useNavigate();
  const { data: categories = [] } = useFetchCategoriesQuery();
  const [uploadProductImage] = useUploadProductImageMutation();
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: deleting }] = useDeleteProductMutation();

  useEffect(() => {
    if (productData && productData._id) {
      setName(productData.name || "");
      setDescription(productData.description || "");
      setPrice(productData.price || "");
      setCategory(productData.category?._id || "");
      setQuantity(productData.quantity || "");
      setBrand(productData.brand || "");
      setImage(productData.image || "");
      setStock(productData.countInStock || "");
    }
  }, [productData]);

  const uploadFileHandler = async (e) => {
    const formData = new FormData();
    formData.append("image", e.target.files[0]);
    try {
      const res = await uploadProductImage(formData).unwrap();
      toast.success("Image uploaded successfully", {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 2000,
      });
      setImage(res.image);
    } catch (err) {
      toast.error("Image upload failed", {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 2000,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("image", image);
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("quantity", quantity);
      formData.append("brand", brand);
      formData.append("countInStock", stock);

      const data = await updateProduct({ productId: params._id, formData });
      if (data?.error) {
        toast.error(data.error, {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 2000,
        });
      } else {
        toast.success(`Product successfully updated`, {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 2000,
        });
        navigate("/admin/allproductslist");
      }
    } catch (err) {
      toast.error("Product update failed. Try again.", {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 2000,
      });
    }
  };

  const handleDelete = async () => {
    try {
      let answer = window.confirm(
        "Are you sure you want to delete this product?"
      );
      if (!answer) return;
      const { data } = await deleteProduct(params._id);
      toast.success(`"${data.name}" is deleted`, {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 2000,
      });
      navigate("/admin/allproductslist");
    } catch (err) {
      toast.error("Delete failed. Try again.", {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 2000,
      });
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

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
      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} md={3}>
        </Grid>
        <Grid item xs={12} md={9}>
          <Paper
            elevation={6}
            sx={{
              p: { xs: 2, md: 5 },
              borderRadius: 4,
              bgcolor: "#fff",
              boxShadow: "0 8px 32px 0 rgba(236,72,153,0.10)",
              maxWidth: 700,
              mx: "auto",
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
              Update / Delete Product
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: 3,
              }}
            >
              {image && (
                <img
                  src={image}
                  alt="product"
                  style={{
                    maxWidth: "320px",
                    maxHeight: "220px",
                    borderRadius: "1rem",
                    marginBottom: "1rem",
                    boxShadow: "0 2px 16px 0 rgba(236,72,153,0.10)",
                  }}
                  className="shadow-lg"
                />
              )}
              <Button
                variant="contained"
                component="label"
                color="secondary"
                startIcon={<PhotoCamera />}
                sx={{
                  mb: 2,
                  borderRadius: 2,
                  fontWeight: 600,
                  bgcolor: "#ec4899",
                  "&:hover": { bgcolor: "#be185d" },
                }}
                className="hover:bg-pink-700"
              >
                Upload Image
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  hidden
                  onChange={uploadFileHandler}
                />
              </Button>
            </Box>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Name"
                    fullWidth
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Price"
                    type="number"
                    fullWidth
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">$</InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Quantity"
                    type="number"
                    fullWidth
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Brand"
                    fullWidth
                    required
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Description"
                    fullWidth
                    required
                    multiline
                    minRows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Count In Stock"
                    type="number"
                    fullWidth
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    label="Category"
                    fullWidth
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    sx={{ mb: 2 }}
                  >
                    {categories?.map((c) => (
                      <MenuItem key={c._id} value={c._id}>
                        {c.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
              <Box sx={{ display: "flex", justifyContent: "center", gap: 3, mt: 4 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="success"
                  size="large"
                  startIcon={<Save />}
                  disabled={updating}
                  sx={{
                    fontWeight: 700,
                    borderRadius: 2,
                    px: 4,
                    boxShadow: 2,
                    letterSpacing: 1,
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "scale(1.04)",
                      boxShadow: 6,
                    },
                  }}
                  className="hover:scale-105 hover:shadow-2xl transition-transform duration-200"
                >
                  {updating ? "Updating..." : "Update"}
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  size="large"
                  startIcon={<Delete />}
                  onClick={handleDelete}
                  disabled={deleting}
                  sx={{
                    fontWeight: 700,
                    borderRadius: 2,
                    px: 4,
                    boxShadow: 2,
                    letterSpacing: 1,
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "scale(1.04)",
                      boxShadow: 6,
                    },
                  }}
                  className="hover:scale-105 hover:shadow-2xl transition-transform duration-200"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </Button>
              </Box>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminProductUpdate;
