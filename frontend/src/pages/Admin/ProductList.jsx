import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useCreateProductMutation,
  useUploadProductImageMutation,
} from "../../redux/api/productApiSlice";
import { useFetchCategoriesQuery } from "../../redux/api/categoryApiSlice";
import { toast } from "react-toastify";

import { useSelector } from "react-redux";
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";

const ProductList = () => {
  const [image, setImage] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [brand, setBrand] = useState("");
  const [stock, setStock] = useState(0);
  const [imageUrl, setImageUrl] = useState(null);
  const navigate = useNavigate();

  const [uploadProductImage] = useUploadProductImageMutation();
  const [createProduct] = useCreateProductMutation();
  const { data: categories } = useFetchCategoriesQuery();
  const { userInfo } = useSelector((state) => state.auth);
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const productData = new FormData();
      productData.append("image", image);
      productData.append("name", name);
      productData.append("description", description);
      productData.append("price", price);
      productData.append("category", category);
      productData.append("quantity", quantity);
      productData.append("brand", brand);
      productData.append("countInStock", stock);
      productData.append("user",userInfo._id);
      const { data } = await createProduct(productData);
      if (data.error) {
        toast.error("Product create failed. Try Again.");
      } else {
        toast.success(`${data.name} is created`);
        navigate("/");
      }
    } catch (error) {
      console.error(error);
      toast.error("Product create failed. Try Again.");
    }
  };

  const uploadFileHandler = async (e) => {
    const formData = new FormData();
    formData.append("image", e.target.files[0]);

    try {
      const res = await uploadProductImage(formData).unwrap();
      toast.success(res.message);
      setImage(res.image);
      setImageUrl(res.image);
    } catch (error) {
      toast.error(error?.data?.message || error.error);
    }
  };

  return (
    <Box sx={{ maxWidth: "100vw", px: { xs: 1, md: 4 }, py: 2 }}>
      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" } }}>
        <Paper
          elevation={3}
          sx={{
            flex: 1,
            bgcolor: "#151515",
            color: "#fff",
            p: 3,
            mt: 2,
            mb: 2,
            ml: { md: 4 },
            borderRadius: 3,
          }}
        >
          <Typography variant="h5" sx={{ mb: 3 }}>
            Create Product
          </Typography>

          {imageUrl && (
            <Box sx={{ textAlign: "center", mb: 2 }}>
              <img
                src={imageUrl}
                alt="product"
                style={{ display: "block", margin: "0 auto", maxHeight: 200 }}
              />
            </Box>
          )}

          <Button
            variant="outlined"
            component="label"
            fullWidth
            sx={{
              color: "#fff",
              borderColor: "#fff",
              bgcolor: "#222",
              mb: 3,
              py: 3,
              fontWeight: "bold",
              borderRadius: 2,
              "&:hover": { bgcolor: "#333", borderColor: "secondary.main" },
            }}
          >
            {image ? (image.name || "Image Selected") : "Upload Image"}
            <input
              type="file"
              name="image"
              accept="image/*"
              hidden
              onChange={uploadFileHandler}
            />
          </Button>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 3 }}
          >
            <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
              <TextField
                label="Name"
                variant="outlined"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                sx={{
                  bgcolor: "#101011",
                  input: { color: "#fff" },
                  label: { color: "#fff" },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#444" },
                    "&:hover fieldset": { borderColor: "secondary.main" },
                    "&.Mui-focused fieldset": { borderColor: "secondary.main" },
                  },
                }}
                InputLabelProps={{ style: { color: "#fff" } }}
              />
              <TextField
                label="Price"
                type="number"
                variant="outlined"
                fullWidth
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                sx={{
                  bgcolor: "#101011",
                  input: { color: "#fff" },
                  label: { color: "#fff" },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#444" },
                    "&:hover fieldset": { borderColor: "secondary.main" },
                    "&.Mui-focused fieldset": { borderColor: "secondary.main" },
                  },
                }}
                InputLabelProps={{ style: { color: "#fff" } }}
              />
            </Box>
            <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
              <TextField
                label="Quantity"
                type="number"
                variant="outlined"
                fullWidth
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                sx={{
                  bgcolor: "#101011",
                  input: { color: "#fff" },
                  label: { color: "#fff" },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#444" },
                    "&:hover fieldset": { borderColor: "secondary.main" },
                    "&.Mui-focused fieldset": { borderColor: "secondary.main" },
                  },
                }}
                InputLabelProps={{ style: { color: "#fff" } }}
              />
              <TextField
                label="Brand"
                variant="outlined"
                fullWidth
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                sx={{
                  bgcolor: "#101011",
                  input: { color: "#fff" },
                  label: { color: "#fff" },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#444" },
                    "&:hover fieldset": { borderColor: "secondary.main" },
                    "&.Mui-focused fieldset": { borderColor: "secondary.main" },
                  },
                }}
                InputLabelProps={{ style: { color: "#fff" } }}
              />
              <TextField
                label="Description"
                variant="outlined"
                fullWidth
                multiline
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                sx={{
                  bgcolor: "#101011",
                  input: { color: "#fff" },
                  label: { color: "#fff" },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#444" },
                    "&:hover fieldset": { borderColor: "secondary.main" },
                    "&.Mui-focused fieldset": { borderColor: "secondary.main" },
                  },
                }}
                InputLabelProps={{ style: { color: "#fff" } }}
              />
            </Box>
            <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
              <TextField
                label="Count In Stock"
                type="number"
                variant="outlined"
                fullWidth
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                sx={{
                  bgcolor: "#101011",
                  input: { color: "#fff" },
                  label: { color: "#fff" },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#444" },
                    "&:hover fieldset": { borderColor: "secondary.main" },
                    "&.Mui-focused fieldset": { borderColor: "secondary.main" },
                  },
                }}
                InputLabelProps={{ style: { color: "#fff" } }}
              />
              <FormControl fullWidth sx={{ bgcolor: "#101011" }}>
                <InputLabel sx={{ color: "#fff" }}>Category</InputLabel>
                <Select
                  value={category}
                  label="Category"
                  onChange={(e) => setCategory(e.target.value)}
                  sx={{
                    color: "#fff",
                    ".MuiOutlinedInput-notchedOutline": {
                      borderColor: "#444",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "secondary.main",
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: { bgcolor: "#222", color: "#fff" },
                    },
                  }}
                >
                  {categories?.map((c) => (
                    <MenuItem key={c._id} value={c._id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              sx={{
                py: 2,
                px: 6,
                mt: 2,
                borderRadius: 2,
                fontWeight: "bold",
                fontSize: "1.1rem",
              }}
            >
              Submit
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default ProductList;
