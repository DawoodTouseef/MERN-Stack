import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  useCreateProductMutation,
  useUploadProductImageMutation,
  useDeleteProductImageMutation,
} from "../../redux/api/productApiSlice";
import { useFetchCategoriesQuery } from "../../redux/api/categoryApiSlice";
import { useGetBrandsQuery } from "../../redux/api/brandApiSlice";
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
  IconButton,
  Stack,
  Chip,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import EditIcon from "@mui/icons-material/Edit";
import axios from "axios";

const ProductList = () => {
  const { data: brands = [] } = useGetBrandsQuery();
  const { data: categories = [] } = useFetchCategoriesQuery();
  const [createProduct] = useCreateProductMutation();
  const [uploadProductImage] = useUploadProductImageMutation();
  const [deleteProductImage] = useDeleteProductImageMutation();

  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [brand, setBrand] = useState("");
  const [stock, setStock] = useState("");
  const [tags, setTags] = useState([]);
  const [variants, setVariants] = useState([]);
  const [variantForm, setVariantForm] = useState({
    sku: "",
    color: "",
    size: "",
    storage: "",
    price: "",
    countInStock: "",
    images: [],
  });
  const [warrantyPeriod, setWarrantyPeriod] = useState("");
  const [returnPolicy, setReturnPolicy] = useState("");
  const [specifications, setSpecifications] = useState({});
  const [specKey, setSpecKey] = useState("");
  const [specValue, setSpecValue] = useState("");
  const [editVariantIndex, setEditVariantIndex] = useState(null);
  const [editSpecKey, setEditSpecKey] = useState(null);
  const [countries, setCountries] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [pincodes, setPincodes] = useState([]); // Added missing state
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    axios.get("https://api.first.org/data/v1/countries").then((res) => {
      const countryList = Object.entries(res.data.data).map(([code, val]) => ({
        code,
        name: val.country,
      }));
      setCountries(countryList);
    });
  }, []);

  const uploadFileHandler = async (e) => {
    const files = e.target.files;
    if (files.length + images.length > 5) {
      toast.error("You can upload a maximum of 5 images.");
      return;
    }
    
    // Create a new FormData instance for each upload
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("image", files[i]);
    }
    
    try {
      const res = await uploadProductImage(formData).unwrap();
      toast.success(res.message);
      setImages([...images, ...res.images]);
      // Update imageFiles with the actual files, not the response
      setImageFiles([...imageFiles, ...Array.from(files)]);
    } catch (error) {
      console.log(error?.data?.message);
      toast.error(error?.data?.message || error.error || "Image upload failed");
    }
  };

  const deleteImageHandler = async (imagePath) => {
    try {
      await deleteProductImage({ imagePath }).unwrap();
      setImages(images.filter((img) => img !== imagePath));
      // Find the index of the image to delete from imageFiles
      const imageIndex = images.findIndex(img => img === imagePath);
      if (imageIndex !== -1) {
        const newImageFiles = [...imageFiles];
        newImageFiles.splice(imageIndex, 1);
        setImageFiles(newImageFiles);
      }
      toast.success("Image deleted successfully");
    } catch (err) {
      toast.error("Failed to delete image");
    }
  };

  const moveImage = (index, direction) => {
    const newImages = [...images];
    const newFiles = [...imageFiles];
    const targetIndex = index + direction;
    if (targetIndex >= 0 && targetIndex < newImages.length) {
      [newImages[index], newImages[targetIndex]] = [
        newImages[targetIndex],
        newImages[index],
      ];
      [newFiles[index], newFiles[targetIndex]] = [
        newFiles[targetIndex],
        newFiles[index],
      ];
      setImages(newImages);
      setImageFiles(newFiles);
    }
  };

  const handleAddTag = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const tag = e.target.value.trim();
      if (tag && !tags.includes(tag)) {
        setTags((prev) => [...prev, tag]);
      }
      e.target.value = "";
    }
  };

  const handleRemoveItem = (item, type) => {
    if (type === "pincode") {
      setPincodes((prev) => prev.filter((p) => p !== item));
    } else if (type === "tag") {
      setTags((prev) => prev.filter((t) => t !== item));
    } else if (type === "country") {
      setSelectedCountries((prev) => prev.filter((c) => c !== item));
    }
  };

  const handleAddOrUpdateVariant = () => {
    if (
      !variantForm.sku &&
      !variantForm.color &&
      !variantForm.size &&
      !variantForm.storage &&
      !variantForm.price &&
      !variantForm.countInStock
    ) {
      toast.error("Please fill at least one field for the variant.");
      return;
    }
    if (editVariantIndex !== null) {
      const updated = [...variants];
      updated[editVariantIndex] = { ...variantForm };
      setVariants(updated);
      setEditVariantIndex(null);
    } else {
      setVariants([...variants, { ...variantForm }]);
    }
    setVariantForm({
      sku: "",
      color: "",
      size: "",
      storage: "",
      price: "",
      countInStock: "",
      images: [],
    });
  };

  const handleEditVariant = (index) => {
    setVariantForm({ ...variants[index] });
    setEditVariantIndex(index);
  };

  const handleDeleteVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
    if (editVariantIndex === index) {
      setEditVariantIndex(null);
      setVariantForm({
        sku: "",
        color: "",
        size: "",
        storage: "",
        price: "",
        countInStock: "",
        images: [],
      });
    }
  };

  const handleAddOrUpdateSpecification = () => {
    if (!specKey || !specValue) {
      toast.error("Please enter both key and value for the specification.");
      return;
    }
    if (editSpecKey !== null) {
      setSpecifications((prev) => {
        const updated = { ...prev };
        delete updated[editSpecKey];
        updated[specKey] = specValue;
        return updated;
      });
      setEditSpecKey(null);
    } else {
      setSpecifications((prev) => ({ ...prev, [specKey]: specValue }));
    }
    setSpecKey("");
    setSpecValue("");
  };

  const handleEditSpecification = (key) => {
    setSpecKey(key);
    setSpecValue(specifications[key]);
    setEditSpecKey(key);
  };

  const handleDeleteSpecification = (key) => {
    setSpecifications((prev) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
    if (editSpecKey === key) {
      setEditSpecKey(null);
      setSpecKey("");
      setSpecValue("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!name.trim()) {
      toast.error("Please enter a product name.");
      return;
    }
    
    if (images.length === 0) {
      toast.error("Please upload at least one image.");
      return;
    }
    
    if (!price || isNaN(price) || Number(price) <= 0) {
      toast.error("Please enter a valid price.");
      return;
    }
    
    if (!quantity || isNaN(quantity) || Number(quantity) <= 0) {
      toast.error("Please enter a valid quantity.");
      return;
    }
    
    if (!description.trim()) {
      toast.error("Please enter a product description.");
      return;
    }
    
    if (!stock || isNaN(stock) || Number(stock) < 0) {
      toast.error("Please enter a valid stock count.");
      return;
    }
    
    if (tags.length === 0) {
      toast.error("Please add at least one tag.");
      return;
    }
    
    if (!category) {
      toast.error("Please select a category.");
      return;
    }
    
    if (!brand) {
      toast.error("Please select a brand.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("brand", brand);
      formData.append("category", category);
      formData.append("price", Number(price));
      formData.append("quantity", Number(quantity));
      formData.append("countries", JSON.stringify(selectedCountries));
      
      // Append tags
      tags.forEach((tag) => formData.append("tags[]", tag));
      
      formData.append("warrantyPeriod", warrantyPeriod);
      formData.append("returnPolicy", returnPolicy);
      
      // Append specifications
      Object.entries(specifications || {}).forEach(([key, value]) => {
        formData.append(`specifications[${key}]`, value);
      });
      
      // Append variants
      variants.forEach((variant, i) => {
        Object.entries(variant).forEach(([key, value]) => {
          if (key === "images") {
            value.forEach((img, j) => {
              formData.append(`variants[${i}][images][${j}]`, img);
            });
          } else {
            formData.append(
              `variants[${i}][${key}]`,
              key === "price" || key === "countInStock" ? Number(value) : value
            );
          }
        });
      });
      
      // Append media
      images.forEach((url, i) => {
        formData.append(`media[${i}][type]`, "image");
        formData.append(`media[${i}][url]`, url);
      });
      
      formData.append("countInStock", Number(stock));
      formData.append("user", userInfo._id);

      const result = await createProduct(formData).unwrap();
      toast.success(`${name} created successfully`);
      navigate("/vendor/allproductslist");
    } catch (error) {
      console.error("Product creation error:", error);
      toast.error(error?.data?.message || error?.message || "Product creation failed. Try Again.");
    }
  };

  return (
    <Box sx={{ maxWidth: "100vw", px: { xs: 1, md: 4 }, py: 2 }}>
      <Paper
        elevation={3}
        sx={{ bgcolor: "#151515", color: "#fff", p: 3, mt: 2, mb: 2, borderRadius: 3 }}
      >
        <Typography variant="h5" sx={{ mb: 3 }}>
          Add New Product
        </Typography>
        {images.length > 0 && (
          <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: "wrap" }}>
            {images.map((url, index) => (
              <Box key={index} sx={{ position: "relative" }}>
                <img
                  src={url}
                  alt={`img-${index}`}
                  style={{ height: 100, borderRadius: 8 }}
                />
                <Stack direction="row" spacing={0} sx={{ mt: 1 }}>
                  <IconButton size="small" onClick={() => moveImage(index, -1)}>
                    <ArrowUpwardIcon fontSize="small" sx={{ color: "#fff" }} />
                  </IconButton>
                  <IconButton size="small" onClick={() => moveImage(index, 1)}>
                    <ArrowDownwardIcon fontSize="small" sx={{ color: "#fff" }} />
                  </IconButton>
                  <IconButton size="small" onClick={() => deleteImageHandler(url)}>
                    <DeleteIcon fontSize="small" sx={{ color: "red" }} />
                  </IconButton>
                </Stack>
              </Box>
            ))}
          </Stack>
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
          }}
          startIcon={<AddPhotoAlternateIcon />}
        >
          Upload Images
          <input
            type="file"
            accept="image/*"
            hidden
            multiple
            onChange={uploadFileHandler}
          />
        </Button>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 3 }}
        >
          <TextField
            label="Name *"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ input: { color: "#fff" }, label: { color: "#fff" } }}
          />
          <TextField
            label="Price *"
            type="number"
            fullWidth
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            sx={{ input: { color: "#fff" }, label: { color: "#fff" } }}
          />
          <TextField
            label="Quantity *"
            type="number"
            fullWidth
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            sx={{ input: { color: "#fff" }, label: { color: "#fff" } }}
          />
          <TextField
            label="Description *"
            multiline
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{ input: { color: "#fff" }, label: { color: "#fff" } }}
          />
          <TextField
            label="Count In Stock *"
            type="number"
            fullWidth
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            sx={{ input: { color: "#fff" }, label: { color: "#fff" } }}
          />
          <FormControl fullWidth>
            <InputLabel sx={{ color: "#fff" }}>Brand *</InputLabel>
            <Select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              sx={{ color: "#fff" }}
              label="Brand *"
            >
              {brands.map((b) => (
                <MenuItem key={b._id} value={b._id}>
                  {b.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel sx={{ color: "#fff" }}>Countries</InputLabel>
            <Select
              multiple
              value={selectedCountries}
              onChange={(e) => setSelectedCountries(e.target.value)}
              sx={{ color: "#fff" }}
              label="Countries"
            >
              {countries.map((country) => (
                <MenuItem key={country.code} value={country.code}>
                  {country.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel sx={{ color: "#fff" }}>Category *</InputLabel>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              sx={{ color: "#fff" }}
              label="Category *"
            >
              {categories.map((c) => (
                <MenuItem key={c._id} value={c._id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Add Tags (Enter to Add) *"
            fullWidth
            onKeyDown={handleAddTag}
            sx={{ input: { color: "#fff" }, label: { color: "#fff" } }}
          />
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", mb: 2 }}>
            {tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                onDelete={() => handleRemoveItem(tag, "tag")}
                sx={{ bgcolor: "#222", color: "#fff" }}
              />
            ))}
          </Stack>
          <Divider sx={{ my: 2, bgcolor: "#fff" }} />
          <Typography variant="h6">Add Variant</Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            {["sku", "color", "size", "storage", "price", "countInStock"].map(
              (field) => (
                <TextField
                  key={field}
                  label={field.charAt(0).toUpperCase() + field.slice(1)}
                  value={variantForm[field]}
                  onChange={(e) =>
                    setVariantForm((prev) => ({ ...prev, [field]: e.target.value }))
                  }
                  sx={{ input: { color: "#fff" }, label: { color: "#fff" }, width: "150px" }}
                />
              )
            )}
            <Button
              onClick={handleAddOrUpdateVariant}
              variant="outlined"
              sx={{ color: "#fff", borderColor: "#fff" }}
            >
              {editVariantIndex !== null ? "Update Variant" : "Add Variant"}
            </Button>
            {editVariantIndex !== null && (
              <Button
                onClick={() => {
                  setEditVariantIndex(null);
                  setVariantForm({
                    sku: "",
                    color: "",
                    size: "",
                    storage: "",
                    price: "",
                    countInStock: "",
                    images: [],
                  });
                }}
                variant="outlined"
                color="secondary"
                sx={{ color: "#fff", borderColor: "#fff" }}
              >
                Cancel
              </Button>
            )}
          </Stack>
          <Stack spacing={1}>
            {variants.map((v, i) => (
              <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography sx={{ color: "#ccc" }}>{JSON.stringify(v)}</Typography>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => handleEditVariant(i)}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDeleteVariant(i)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Stack>
          <TextField
            label="Warranty Period"
            fullWidth
            value={warrantyPeriod}
            onChange={(e) => setWarrantyPeriod(e.target.value)}
            sx={{ input: { color: "#fff" }, label: { color: "#fff" } }}
          />
          <TextField
            label="Return Policy"
            fullWidth
            value={returnPolicy}
            onChange={(e) => setReturnPolicy(e.target.value)}
            sx={{ input: { color: "#fff" }, label: { color: "#fff" } }}
          />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Specifications
          </Typography>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Key"
              value={specKey}
              onChange={(e) => setSpecKey(e.target.value)}
              sx={{ input: { color: "#fff" }, label: { color: "#fff" } }}
            />
            <TextField
              label="Value"
              value={specValue}
              onChange={(e) => setSpecValue(e.target.value)}
              sx={{ input: { color: "#fff" }, label: { color: "#fff" } }}
            />
            <Button
              onClick={handleAddOrUpdateSpecification}
              variant="outlined"
              sx={{ color: "#fff", borderColor: "#fff" }}
            >
              {editSpecKey !== null ? "Update" : "Add"}
            </Button>
            {editSpecKey !== null && (
              <Button
                onClick={() => {
                  setEditSpecKey(null);
                  setSpecKey("");
                  setSpecValue("");
                }}
                variant="outlined"
                color="secondary"
                sx={{ color: "#fff", borderColor: "#fff" }}
              >
                Cancel
              </Button>
            )}
          </Stack>
          <Stack>
            {Object.entries(specifications).map(([k, v]) => (
              <Box key={k} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography sx={{ color: "#ccc" }}>
                  {k}: {v}
                </Typography>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => handleEditSpecification(k)}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDeleteSpecification(k)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Stack>
          <Button
            type="submit"
            variant="contained"
            color="secondary"
            sx={{ py: 2, borderRadius: 2, fontWeight: "bold" }}
          >
            Submit
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ProductList;