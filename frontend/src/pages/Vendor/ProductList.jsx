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
  OutlinedInput,
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
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [brand, setBrand] = useState("");
  const [stock, setStock] = useState(0);
  const [tags, setTags] = useState([]);
  const [countries, setCountries] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState([]);
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
  const [discount, setDiscount] = useState({ percentage: "", validUntil: "" });
  const [specifications, setSpecifications] = useState({});
  const [specKey, setSpecKey] = useState("");
  const [specValue, setSpecValue] = useState("");

  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  // Fetch countries on mount
  useEffect(() => {
    axios.get("https://api.first.org/data/v1/countries")
      .then(res => {
        const countryList = Object.entries(res.data.data).map(([code, val]) => ({ code, name: val.country }));
        setCountries(countryList);
      });
  }, []);

  // Image upload handler
  const uploadFileHandler = async (e) => {
    const files = e.target.files;
    if (files.length + images.length > 5) {
      toast.error("You can upload a maximum of 5 images.");
      return;
    }
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("image", files[i]);
    }
    try {
      const res = await uploadProductImage(formData).unwrap();
      toast.success(res.message);
      setImages([...images, ...res.images]);
    } catch (error) {
      toast.error(error?.data?.message || error.error);
    }
  };

  // Image delete handler
  const deleteImageHandler = async (imagePath) => {
    try {
      await deleteProductImage({ imagePath });
      setImages(images.filter((img) => img !== imagePath));
      toast.success("Image deleted successfully");
    } catch (err) {
      toast.error("Failed to delete image");
    }
  };

  // Move image order
  const moveImage = (index, direction) => {
    const newImages = [...images];
    const targetIndex = index + direction;
    if (targetIndex >= 0 && targetIndex < newImages.length) {
      [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
      setImages(newImages);
    }
  };

  // Tag/country/pincode handlers
  const handleAddTag = (e) => {
    if (e.key === "Enter") {
      const tag = e.target.value.trim();
      if (tag && !tags.includes(tag)) {
        setTags((prev) => [...prev, tag]);
      }
      e.target.value = "";
    }
  };
  const handleRemoveItem = (item, type) => {
    if (type === "pincode") {
      setDeliverablePincodes((prev) => prev.filter((p) => p !== item));
    } else if (type === "tag") {
      setTags((prev) => prev.filter((t) => t !== item));
    } else if (type === "country") {
      setSelectedCountries((prev) => prev.filter((c) => c !== item));
    }
  };

  // Add variant
  const [editVariantIndex, setEditVariantIndex] = useState(null);
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
      // Update
      const updated = [...variants];
      updated[editVariantIndex] = { ...variantForm };
      setVariants(updated);
      setEditVariantIndex(null);
    } else {
      // Add
      setVariants([...variants, { ...variantForm }]);
    }
    setVariantForm({ sku: "", color: "", size: "", storage: "", price: "", countInStock: "", images: [] });
  };

  // Edit variant handler
  const handleEditVariant = (index) => {
    setVariantForm({ ...variants[index] });
    setEditVariantIndex(index);
  };

  // Delete variant handler
  const handleDeleteVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
    if (editVariantIndex === index) {
      setEditVariantIndex(null);
      setVariantForm({ sku: "", color: "", size: "", storage: "", price: "", countInStock: "", images: [] });
    }
  };

  // Add specification
  const [editSpecKey, setEditSpecKey] = useState(null);
  const handleAddOrUpdateSpecification = () => {
    if (!specKey || !specValue) {
      toast.error("Please enter both key and value for the specification.");
      return;
    }
    if (editSpecKey !== null) {
      // Update
      setSpecifications((prev) => {
        const updated = { ...prev };
        delete updated[editSpecKey];
        updated[specKey] = specValue;
        return updated;
      });
      setEditSpecKey(null);
    } else {
      // Add
      setSpecifications((prev) => ({ ...prev, [specKey]: specValue }));
    }
    setSpecKey("");
    setSpecValue("");
  };

  // Edit specification handler
  const handleEditSpecification = (key) => {
    setSpecKey(key);
    setSpecValue(specifications[key]);
    setEditSpecKey(key);
  };

  // Delete specification handler
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

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        name,
        description,
        price,
        category,
        quantity,
        brand,
        countInStock: stock,
        user: userInfo._id,
        images,
        tags,
        deliverablePincodes,
        variants,
        warrantyPeriod,
        returnPolicy,
        discount,
        specifications,
      };
      await createProduct(productData).unwrap();
      toast.success(`${name} is created`);
      navigate("/admin/allproductslist");
    } catch (error) {
      toast.error("Product create failed. Try Again.");
    }
  };

  return (
    <Box sx={{ maxWidth: "100vw", px: { xs: 1, md: 4 }, py: 2 }}>
      <Paper elevation={3} sx={{ bgcolor: "#151515", color: "#fff", p: 3, mt: 2, mb: 2, borderRadius: 3 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>Add New Product</Typography>
        {/* Images */}
        {images.length > 0 && (
          <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: "wrap" }}>
            {images.map((url, index) => (
              <Box key={index} sx={{ position: "relative" }}>
                <img src={url} alt={`img-${index}`} style={{ height: 100, borderRadius: 8 }} />
                <Stack direction="row" spacing={0} sx={{ mt: 1 }}>
                  <IconButton size="small" onClick={() => moveImage(index, -1)}><ArrowUpwardIcon fontSize="small" sx={{ color: "#fff" }} /></IconButton>
                  <IconButton size="small" onClick={() => moveImage(index, 1)}><ArrowDownwardIcon fontSize="small" sx={{ color: "#fff" }} /></IconButton>
                  <IconButton size="small" onClick={() => deleteImageHandler(url)}><DeleteIcon fontSize="small" sx={{ color: "red" }} /></IconButton>
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
        <Button
          variant="outlined"
          component="label"
          fullWidth
          sx={{ color: "#fff", borderColor: "#fff", bgcolor: "#222", mb: 3, py: 3, fontWeight: "bold", borderRadius: 2 }}
          startIcon={<AddPhotoAlternateIcon />}
        >
          Upload Images
          <input type="file" accept="image/*" hidden multiple onChange={uploadFileHandler} />
        </Button>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <TextField label="Name" fullWidth value={name} onChange={(e) => setName(e.target.value)} sx={{ input: { color: "#fff" }, label: { color: "#fff" } }} />
          <TextField label="Price" type="number" fullWidth value={price} onChange={(e) => setPrice(e.target.value)} sx={{ input: { color: "#fff" }, label: { color: "#fff" } }} />
          <TextField label="Quantity" type="number" fullWidth value={quantity} onChange={(e) => setQuantity(e.target.value)} sx={{ input: { color: "#fff" }, label: { color: "#fff" } }} />
          <TextField label="Description" multiline fullWidth value={description} onChange={(e) => setDescription(e.target.value)} sx={{ input: { color: "#fff" }, label: { color: "#fff" } }} />
          <TextField label="Count In Stock" type="number" fullWidth value={stock} onChange={(e) => setStock(e.target.value)} sx={{ input: { color: "#fff" }, label: { color: "#fff" } }} />

          <FormControl fullWidth>
            <InputLabel sx={{ color: "#fff" }}>Brand</InputLabel>
            <Select value={brand} onChange={(e) => setBrand(e.target.value)} sx={{ color: "#fff" } } label="Brand">
              {brands.map((b) => (<MenuItem key={b._id} value={b._id}>{b.name}</MenuItem>))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel sx={{ color: "#fff" }}>Category</InputLabel>
            <Select value={category} onChange={(e) => setCategory(e.target.value)} sx={{ color: "#fff" }} label="Category">
              {categories.map((c) => (<MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>))}
            </Select>
          </FormControl>

          {/* Tags */}
          <TextField label="Add Tags (Enter to Add)" fullWidth onKeyDown={handleAddTag} sx={{ input: { color: "#fff" }, label: { color: "#fff" } }} />
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", mb: 2 }}>
            {tags.map((tag) => (
              <Chip key={tag} label={tag} onDelete={() => handleRemoveItem(tag, "tag")} sx={{ bgcolor: "#222", color: "#fff" }} />
            ))}
          </Stack>

          {/* Deliverable Countries */}
          <FormControl fullWidth>
            <InputLabel sx={{ color: "#fff" }}>Deliverable Countries</InputLabel>
            <Select
              multiple
              value={selectedCountries}
              onChange={e => setSelectedCountries(e.target.value)}
              input={<OutlinedInput label="Deliverable Countries" />}
              sx={{ color: "#fff" }}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip
                      key={value}
                      label={value}
                      onDelete={() => setSelectedCountries(selectedCountries.filter(c => c !== value))}
                      sx={{ bgcolor: "#222", color: "#fff" }}
                    />
                  ))}
                </Box>
              )}
            >
              {countries.map(c => (
                <MenuItem key={c.code} value={c.name}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Show selected countries as chips below the select for extra visibility */}
          {selectedCountries.length > 0 && (
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", mb: 2 }}>
              {selectedCountries.map((country) => (
                <Chip
                  key={country}
                  label={country}
                  onDelete={() => setSelectedCountries(selectedCountries.filter(c => c !== country))}
                  sx={{ bgcolor: "#222", color: "#fff" }}
                />
              ))}
            </Stack>
          )}

          {/* Variants */}
          <Divider sx={{ my: 2, bgcolor: "#fff" }} />
          <Typography variant="h6">Add Variant</Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            {["sku", "color", "size", "storage", "price", "countInStock"].map((field) => (
              <TextField
                key={field}
                label={field}
                value={variantForm[field]}
                onChange={(e) => setVariantForm(prev => ({ ...prev, [field]: e.target.value }))}
                sx={{ input: { color: "#fff" }, label: { color: "#fff" }, width: "150px" }}
              />
            ))}
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
                  setVariantForm({ sku: "", color: "", size: "", storage: "", price: "", countInStock: "", images: [] });
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
                <IconButton size="small" color="primary" onClick={() => handleEditVariant(i)}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" color="error" onClick={() => handleDeleteVariant(i)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Stack>

          {/* Warranty, Return, Discount */}
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
          <Typography variant="h6" sx={{ mt: 2 }}>Discount</Typography>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Percentage"
              type="number"
              value={discount.percentage}
              onChange={(e) => setDiscount(prev => ({ ...prev, percentage: e.target.value }))}
              sx={{ input: { color: "#fff" }, label: { color: "#fff" } }}
            />
            <TextField
              label="Valid Until"
              type="date"
              value={discount.validUntil}
              onChange={(e) => setDiscount(prev => ({ ...prev, validUntil: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              sx={{ input: { color: "#fff" }, label: { color: "#fff" } }}
            />
          </Stack>

          {/* Specifications */}
          <Typography variant="h6" sx={{ mt: 2 }}>Specifications</Typography>
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
                <Typography sx={{ color: "#ccc" }}>{k}: {v}</Typography>
                <IconButton size="small" color="primary" onClick={() => handleEditSpecification(k)}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" color="error" onClick={() => handleDeleteSpecification(k)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Stack>

          <Button type="submit" variant="contained" color="secondary" sx={{ py: 2, borderRadius: 2, fontWeight: "bold" }}>
            Submit
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ProductList;
