import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useUploadProductImageMutation,
  useDeleteProductImageMutation,
  useGetProductByIdQuery,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from "../../redux/api/productApiSlice";
import { useFetchCategoriesQuery } from "../../redux/api/categoryApiSlice";
import { useGetBrandsQuery } from "../../redux/api/brandApiSlice";
import { useGetCurrenciesQuery, useConvertCurrencyMutation } from "../../redux/api/currencyApiSlice";
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
  Card,
  CardContent,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import EditIcon from "@mui/icons-material/Edit";

const ProductList = () => {
  const param = useParams()
  const { userInfo } = useSelector((state) => state.auth);
  const { data: brands = [] } = useGetBrandsQuery();
  const { data: categories = [] } = useFetchCategoriesQuery();
  const { data: currencies = [] } = useGetCurrenciesQuery();
  const { data: Product } = useGetProductByIdQuery(param._id);
  const [uploadProductImage] = useUploadProductImageMutation();
  const [deleteProductImage] = useDeleteProductImageMutation();
  const [Updatemutiation] = useUpdateProductMutation();
  const [convertCurrency] = useConvertCurrencyMutation();
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
    name: "",
    description: "",
    sku: "",
    price: "",
    countInStock: "",
    images: [],
    attributes: [],
    specifications: {},
  });

  const [attrKey, setAttrKey] = useState("");
  const [attrValue, setAttrValue] = useState("");

  // Currency state
  const [currency, setCurrency] = useState("USD");
  const [prices, setPrices] = useState({});
  const [convertedPrices, setConvertedPrices] = useState({});
  const [showTaxDetails, setShowTaxDetails] = useState(false);

  const [warrantyPeriod, setWarrantyPeriod] = useState("");
  const [returnPolicy, setReturnPolicy] = useState("");
  const [specifications, setSpecifications] = useState({});
  const [specKey, setSpecKey] = useState("");
  const [specValue, setSpecValue] = useState("");
  const [editVariantIndex, setEditVariantIndex] = useState(null);
  const [editSpecKey, setEditSpecKey] = useState(null);

  const navigate = useNavigate();
  useEffect(() => {
    if (Product) {
      setName(Product?.name || "");
      setBrand(Product?.brand?._id || "")
      setDescription(Product?.description || "");
      setCategory(Product?.category?._id || "");
      setStock(Product?.countInStock || "");
      setQuantity(Product?.quantity || "");
      setPrice(Product?.price || "");
      setCurrency(Product?.currency || "USD");
      setPrices(Product?.prices || {});
      setImages(Product?.media?.map((image) => image.url) || []);
      setTags(Product?.tags || []);
      setVariants(Product?.variant || []);
      setWarrantyPeriod(Product?.warrantyPeriod || "");
      setReturnPolicy(Product?.returnPolicy || '');
      setSpecifications(Product?.specifications || "");
    }
  }, [Product]);

  // Update prices when currency changes
  useEffect(() => {
    const updateConvertedPrices = async () => {
      if (currency && currencies.length > 0 && price) {
        const enabledCurrencies = currencies.filter(c => c.isEnabled);

        const conversionPromises = enabledCurrencies.map(async (targetCurrency) => {
          if (targetCurrency.code !== currency) {
            try {
              const result = await convertCurrency({
                from: currency,
                to: targetCurrency.code,
                amount: parseFloat(price)
              }).unwrap();

              return {
                code: targetCurrency.code,
                convertedAmount: result.convertedAmount,
              };
            } catch (error) {
              console.error(`Failed to convert to ${targetCurrency.code}:`, error);
              return {
                code: targetCurrency.code,
                convertedAmount: parseFloat(price),
              };
            }
          }
          return null;
        });

        const results = await Promise.all(conversionPromises);
        const newPrices = {};
        results.forEach(result => {
          if (result) {
            newPrices[result.code] = result.convertedAmount;
          }
        });

        setPrices(newPrices);
      }
    };

    updateConvertedPrices();
  }, [currency, price, currencies, convertCurrency]);

  // Tax and summary preview calculation (simple version for update page)
  useEffect(() => {
    if (Object.keys(prices).length > 0) {
      const taxRate = 8; // Default mock tax rate
      const convertedPricesWithTax = {};
      Object.entries(prices).forEach(([currencyCode, convertedPrice]) => {
        const taxAmount = (convertedPrice * taxRate) / 100;
        const totalPrice = convertedPrice + taxAmount;

        convertedPricesWithTax[currencyCode] = {
          basePrice: convertedPrice,
          taxAmount,
          taxRate,
          totalPrice
        };
      });
      setConvertedPrices(convertedPricesWithTax);
    }
  }, [prices]);

  const getCurrencySymbol = (currencyCode) => {
    const curr = currencies.find(c => c.code === currencyCode);
    return curr ? curr.symbol : '$';
  };

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
      setImageFiles([...imageFiles, ...files]);
    } catch (error) {
      toast.error(error?.data?.message || error.error);
    }
  };

  const deleteImageHandler = async (imagePath) => {
    try {
      await deleteProductImage({ imagePath });
      setImages(images.filter((img) => img !== imagePath));
      setImageFiles(imageFiles.filter((_, i) => images[i] !== imagePath));
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


  const handleRemoveItem = (item) => {
    setTags((prev) => prev.filter((t) => t !== item));

  };

  const handleAddOrUpdateVariant = () => {
    if (
      !variantForm.sku &&
      !variantForm.name &&
      !variantForm.price &&
      !variantForm.countInStock &&
      variantForm.attributes.length === 0
    ) {
      toast.error("Please fill at least name, price, or attributes for the variant.");
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
      name: "",
      description: "",
      sku: "",
      price: "",
      countInStock: "",
      images: [],
      attributes: [],
      specifications: {},
    });
  };

  const handleAddAttribute = () => {
    if (!attrKey || !attrValue) {
      toast.error("Please enter both attribute name and value.");
      return;
    }
    setVariantForm(prev => ({
      ...prev,
      attributes: [...prev.attributes, { name: attrKey, value: attrValue }]
    }));
    setAttrKey("");
    setAttrValue("");
  };

  const handleRemoveAttribute = (index) => {
    setVariantForm(prev => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index)
    }));
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
        name: "",
        description: "",
        sku: "",
        price: "",
        countInStock: "",
        images: [],
        attributes: [],
        specifications: {},
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
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("brand", brand);
      formData.append("category", category);
      formData.append("price", Number(price));
      formData.append("currency", currency);
      formData.append("prices", JSON.stringify(prices));
      formData.append("quantity", Number(quantity));
      tags.forEach((tag, i) => formData.append(`tags[${i}]`, tag));
      formData.append("warrantyPeriod", warrantyPeriod);
      formData.append("returnPolicy", returnPolicy);
      Object.entries(specifications || {}).forEach(([key, value]) => {
        formData.append(`specifications[${key}]`, value);
      });
      variants.forEach((variant, i) => {
        Object.entries(variant).forEach(([key, value]) => {
          if (key === "images") {
            if (Array.isArray(value)) {
              value.forEach((img, j) => {
                formData.append(`variants[${i}][images][${j}]`, img);
              });
            }
          } else if (key === "attributes") {
            if (Array.isArray(value)) {
              value.forEach((attr, j) => {
                formData.append(`variants[${i}][attributes][${j}][name]`, attr.name);
                formData.append(`variants[${i}][attributes][${j}][value]`, attr.value);
              });
            }
          } else if (key === "specifications") {
            Object.entries(value || {}).forEach(([specKey, specVal]) => {
              formData.append(`variants[${i}][specifications][${specKey}]`, specVal);
            });
          } else {
            formData.append(
              `variants[${i}][${key}]`,
              key === "price" || key === "countInStock" ? Number(value) : value
            );
          }
        });
      });
      images.forEach((url, i) => {
        formData.append(`media[${i}][type]`, "image");
        formData.append(`media[${i}][url]`, url);
      });
      formData.append("countInStock", Number(stock));

      //console.log([...formData.entries()])
      await Updatemutiation({ productId: param._id, formData: formData }).unwrap();
      toast.success(`${name} updated successfully`);
      // Determine redirect path based on role
      const redirectPath = userInfo?.role === "vendor"
        ? "/vendor/allproductslist"
        : userInfo?.role === "seller"
          ? "/seller/allproductslist"
          : "/admin/productlist";

      navigate(redirectPath);
    } catch (error) {
      console.log(error)
      toast.error("Product update failed. Try Again.");
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: "#f8fafc", py: 8, px: { xs: 2, md: 6 } }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 6 },
          borderRadius: 6,
          border: '1px solid #e2e8f0',
          bgcolor: "#fff"
        }}
      >
        <Box sx={{ mb: 5 }}>
          <Typography variant="h4" fontWeight={900} color="#1e293b">
            Update Product
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Modify the details of your existing product
          </Typography>
        </Box>
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
          variant="dashed"
          component="label"
          fullWidth
          sx={{
            color: "#6366f1",
            borderColor: "#6366f1",
            borderStyle: 'dashed',
            borderWidth: 2,
            bgcolor: "#f5f3ff",
            mb: 5,
            py: 4,
            fontWeight: 700,
            borderRadius: 4,
            '&:hover': {
              bgcolor: "#ede9fe",
              borderColor: "#4f46e5",
            }
          }}
          startIcon={<AddPhotoAlternateIcon />}
        >
          Click to Upload Product Images (Max 5)
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
            sx={{ input: { color: "#000" }, label: { color: "#000" } }}
          />
          <FormControl fullWidth>
            <InputLabel sx={{ color: "#000" }}>Base Currency *</InputLabel>
            <Select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              sx={{ color: "#000" }}
              label="Base Currency *"
            >
              {currencies.filter(c => c.isEnabled).map((c) => (
                <MenuItem key={c._id} value={c.code}>
                  {c.name} ({c.symbol})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label={`Price (in ${currency}) *`}
            type="number"
            fullWidth
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            sx={{ input: { color: "#000" }, label: { color: "#000" } }}
          />
          {price && Object.keys(convertedPrices).length > 0 && (
            <Card elevation={0} sx={{ bgcolor: "#f1f5f9", borderRadius: 4, border: '1px solid #e2e8f0' }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom fontWeight={700}>
                  Multi-Currency Price Preview (Inc. Est. Tax)
                </Typography>
                <Stack spacing={1}>
                  {Object.entries(convertedPrices).map(([code, info]) => (
                    <Stack key={code} direction="row" justifyContent="space-between">
                      <Typography variant="body2">{code}:</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {getCurrencySymbol(code)}{info.totalPrice.toFixed(2)}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          )}
          <TextField
            label="Quantity *"
            type="number"
            fullWidth
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            sx={{ input: { color: "#000" }, label: { color: "#000" } }}
          />
          <TextField
            label="Description *"
            multiline
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{ input: { color: "#000" }, label: { color: "#000" } }}
          />
          <TextField
            label="Count In Stock *"
            type="number"
            fullWidth
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            sx={{ input: { color: "#000" }, label: { color: "#000" } }}
          />
          <FormControl fullWidth>
            <InputLabel sx={{ color: "#000" }}>Brand *</InputLabel>
            <Select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              sx={{ color: "#000" }}
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
            <InputLabel sx={{ color: "#000" }}>Category *</InputLabel>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              sx={{ color: "#000" }}
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
            sx={{ input: { color: "#000" }, label: { color: "#000" } }}
          />
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", mb: 2 }}>
            {tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                onDelete={() => handleRemoveItem(tag)}
                sx={{ bgcolor: "#222", color: "#fff" }}
              />
            ))}
          </Stack>
          <Divider sx={{ my: 2, bgcolor: "#eee" }} />
          <Typography variant="h6" fontWeight="bold">Manage Product Variants</Typography>

          <Box sx={{ p: 3, border: "1px solid #e2e8f0", borderRadius: 4, bgcolor: "#f8fafc" }}>
            <Typography variant="subtitle1" gutterBottom fontWeight="bold">Variant Metadata</Typography>
            <Stack spacing={2} sx={{ mb: 3 }}>
              <TextField
                label="Variant Name"
                fullWidth
                value={variantForm.name}
                onChange={(e) => setVariantForm(prev => ({ ...prev, name: e.target.value }))}
                sx={{ input: { color: "black" }, label: { color: "#666" } }}
              />
              <TextField
                label="Variant Description"
                fullWidth
                multiline
                rows={2}
                value={variantForm.description}
                onChange={(e) => setVariantForm(prev => ({ ...prev, description: e.target.value }))}
                sx={{ textarea: { color: "black" }, label: { color: "#666" } }}
              />
            </Stack>

            <Typography variant="subtitle1" gutterBottom fontWeight="bold">Variant Attributes</Typography>
            <Stack direction="row" spacing={2} sx={{ mb: 2 }} alignItems="center">
              <TextField
                label="Attribute Name"
                value={attrKey}
                onChange={(e) => setAttrKey(e.target.value)}
                sx={{ input: { color: "black" }, label: { color: "#666" }, flex: 1 }}
              />
              <TextField
                label="Attribute Value"
                value={attrValue}
                onChange={(e) => setAttrValue(e.target.value)}
                sx={{ input: { color: "black" }, label: { color: "#666" }, flex: 1 }}
              />
              <Button variant="outlined" onClick={handleAddAttribute} sx={{ height: "56px" }}>
                Add
              </Button>
            </Stack>

            {variantForm.attributes.length > 0 && (
              <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: "wrap" }}>
                {variantForm.attributes.map((attr, idx) => (
                  <Chip
                    key={idx}
                    label={`${attr.name}: ${attr.value}`}
                    onDelete={() => handleRemoveAttribute(idx)}
                    sx={{ mb: 1 }}
                  />
                ))}
              </Stack>
            )}

            <Typography variant="subtitle1" gutterBottom fontWeight="bold">Pricing & Stock</Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              {["price", "countInStock", "sku"].map((field) => (
                <TextField
                  key={field}
                  label={field === "countInStock" ? "Stock" : field.toUpperCase()}
                  value={variantForm[field]}
                  onChange={(e) => setVariantForm(prev => ({ ...prev, [field]: e.target.value }))}
                  sx={{ input: { color: "black" }, label: { color: "#666" }, width: "180px", mb: 2 }}
                />
              ))}
            </Stack>

            <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
              <Button
                onClick={handleAddOrUpdateVariant}
                variant="contained"
                sx={{ bgcolor: "#6366f1", '&:hover': { bgcolor: "#4f46e5" }, fontWeight: "bold", px: 4 }}
              >
                {editVariantIndex !== null ? "Update Variant" : "Add Variant"}
              </Button>
              {(editVariantIndex !== null || variantForm.name || variantForm.attributes.length > 0) && (
                <Button
                  onClick={() => {
                    setEditVariantIndex(null);
                    setVariantForm({
                      name: "",
                      description: "",
                      sku: "",
                      price: "",
                      countInStock: "",
                      images: [],
                      attributes: [],
                      specifications: {},
                    });
                  }}
                  variant="outlined"
                  color="inherit"
                >
                  Clear
                </Button>
              )}
            </Stack>
          </Box>

          <Stack spacing={2} sx={{ mt: 3 }}>
            {variants.map((v, i) => (
              <Paper key={i} sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid #e2e8f0" }}>
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">{v.name || `Variant #${i + 1}`}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {v.attributes?.map(a => `${a.name}: ${a.value}`).join(', ') || 'No attributes'} • Price: {getCurrencySymbol(currency)}{v.price} • Stock: {v.countInStock}
                  </Typography>
                </Box>
                <Box>
                  <IconButton size="small" color="primary" onClick={() => handleEditVariant(i)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDeleteVariant(i)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Paper>
            ))}
          </Stack>
          <TextField
            label="Warranty Period"
            fullWidth
            value={warrantyPeriod}
            onChange={(e) => setWarrantyPeriod(e.target.value)}
            sx={{ input: { color: "#000" }, label: { color: "#000" } }}
          />
          <TextField
            label="Return Policy"
            fullWidth
            value={returnPolicy}
            onChange={(e) => setReturnPolicy(e.target.value)}
            sx={{ input: { color: "#000" }, label: { color: "#000" } }}
          />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Specifications
          </Typography>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Key"
              value={specKey}
              onChange={(e) => setSpecKey(e.target.value)}
              sx={{ input: { color: "#000" }, label: { color: "#000" } }}
            />
            <TextField
              label="Value"
              value={specValue}
              onChange={(e) => setSpecValue(e.target.value)}
              sx={{ input: { color: "#000" }, label: { color: "#000" } }}
            />
            <Button
              onClick={handleAddOrUpdateSpecification}
              variant="outlined"
              sx={{ color: "#6366f1", borderColor: "#6366f1" }}
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
                sx={{ color: "#6366f1", borderColor: "#6366f1" }}
              >
                Cancel
              </Button>
            )}
          </Stack>
          <Stack>
            {Object.entries(specifications).map(([k, v]) => (
              <Box key={k} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography sx={{ color: "text.secondary" }}>
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
          <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ justifyContent: "center" }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ py: 2, borderRadius: 2, fontWeight: "bold" }}
            >
              Update Product
            </Button>
            <Divider></Divider>
            <Button
              type="submit"
              variant="contained"
              color="error"
              sx={{ py: 2, borderRadius: 2, fontWeight: "bold" }}
            >
              Delete Product
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
};

export default ProductList;