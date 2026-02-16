import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  useCreateProductMutation,
  useUploadProductImageMutation,
  useDeleteProductImageMutation,
} from "../../redux/api/productApiSlice";
import { useFetchCategoriesQuery } from "../../redux/api/categoryApiSlice";
import { useGetBrandsQuery } from "../../redux/api/brandApiSlice";
import { useCalculateAdvancedTaxMutation } from "../../redux/api/taxApiSlice";
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Tooltip,
  Alert,
  Card,
  CardContent,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InfoIcon from "@mui/icons-material/Info";
import EditIcon from "@mui/icons-material/Edit";
import { APP_NAME } from "../../redux/constants";

const AddProduct = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { data: brands = [] } = useGetBrandsQuery();
  const { data: categories = [] } = useFetchCategoriesQuery();
  const { data: currencies = [] } = useGetCurrenciesQuery();
  const [createProduct] = useCreateProductMutation();
  const [uploadProductImage] = useUploadProductImageMutation();
  const [deleteProductImage] = useDeleteProductImageMutation();
  const [calculateTax] = useCalculateAdvancedTaxMutation();
  const [convertCurrency] = useConvertCurrencyMutation();

  // Product state
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
    color: "",
    size: "",
    storage: "",
    price: "",
    countInStock: "",
    images: [],
  });

  // State for variant image uploads
  const [variantImageFiles, setVariantImageFiles] = useState([]);

  // Currency state
  const [currency, setCurrency] = useState("USD");
  const [prices, setPrices] = useState({});
  const [convertedPrices, setConvertedPrices] = useState({});

  // Additional product information
  const [warrantyPeriod, setWarrantyPeriod] = useState("");
  const [returnPolicy, setReturnPolicy] = useState("");
  const [specifications, setSpecifications] = useState({});
  const [specKey, setSpecKey] = useState("");
  const [specValue, setSpecValue] = useState("");
  const [editVariantIndex, setEditVariantIndex] = useState(null);
  const [editSpecKey, setEditSpecKey] = useState(null);

  // Shipping details state
  const [shippingDetails, setShippingDetails] = useState({
    weight: "",
    dimensions: { length: "", width: "", height: "" },
    shippingClass: "standard",
  });

  // Tax state
  const [taxSettings, setTaxSettings] = useState({
    isTaxable: true,
    taxCategory: "general",
    taxExempt: false,
    taxCode: "",
  });
  const [taxCalculation, setTaxCalculation] = useState({
    basePrice: 0,
    taxAmount: 0,
    taxRate: 0,
    totalPrice: 0,
  });
  const [taxBreakdown, setTaxBreakdown] = useState(null);
  const [showTaxDetails, setShowTaxDetails] = useState(false);

  const navigate = useNavigate();

  // Tax categories for selection
  const taxCategories = [
    { value: "general", label: "General" },
    { value: "food", label: "Food & Groceries" },
    { value: "clothing", label: "Clothing & Accessories" },
    { value: "electronics", label: "Electronics" },
    { value: "books", label: "Books & Media" },
    { value: "digital", label: "Digital Goods" },
    { value: "services", label: "Services" },
  ];

  // Shipping classes
  const shippingClasses = [
    { value: "standard", label: "Standard Shipping" },
    { value: "express", label: "Express Shipping" },
    { value: "overnight", label: "Overnight Shipping" },
    { value: "economy", label: "Economy Shipping" },
  ];

  // Calculate tax when price or currency changes
  useEffect(() => {
    if (price && taxSettings.isTaxable && !taxSettings.taxExempt) {
      calculateTaxForProduct();
    } else if (price) {
      setTaxCalculation({
        basePrice: parseFloat(price) || 0,
        taxAmount: 0,
        taxRate: 0,
        totalPrice: parseFloat(price) || 0,
      });
    }
  }, [price, taxSettings, currency]);

  const calculateTaxForProduct = async () => {
    try {
      // Mock tax calculation for demonstration
      // In a real implementation, this would call the backend API
      const basePrice = parseFloat(price) || 0;
      const taxRate = taxSettings.taxCategory === "food" ? 0 :
        taxSettings.taxCategory === "clothing" ? 5 :
          taxSettings.taxCategory === "electronics" ? 10 : 8;

      const taxAmount = taxSettings.taxExempt ? 0 : (basePrice * taxRate) / 100;
      const totalPrice = basePrice + taxAmount;

      setTaxCalculation({
        basePrice,
        taxAmount,
        taxRate,
        totalPrice,
      });

      setTaxBreakdown({
        jurisdiction: "Default Tax Region",
        taxType: "Sales Tax",
        rate: taxRate,
        breakdown: [
          { name: "State Tax", rate: taxRate * 0.7, amount: taxAmount * 0.7 },
          { name: "Local Tax", rate: taxRate * 0.3, amount: taxAmount * 0.3 },
        ]
      });
    } catch (error) {
      console.error("Tax calculation error:", error);
      toast.error("Failed to calculate tax");
    }
  };

  // Update prices when currency changes
  useEffect(() => {
    const updateConvertedPrices = async () => {
      if (currency && currencies.length > 0 && price) {
        // Get all enabled currencies for conversion
        const enabledCurrencies = currencies.filter(c => c.isEnabled);

        // Convert to all enabled currencies
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
                rate: result.rate
              };
            } catch (error) {
              console.error(`Failed to convert to ${targetCurrency.code}:`, error);
              // Fallback to same amount with rate 1
              return {
                code: targetCurrency.code,
                convertedAmount: parseFloat(price),
                rate: 1
              };
            }
          }
          return null;
        });

        // Wait for all conversions
        const results = await Promise.all(conversionPromises);

        // Filter out null results and create prices object
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

  // Calculate tax for each converted currency
  useEffect(() => {
    if (Object.keys(prices).length > 0 && taxSettings.isTaxable && !taxSettings.taxExempt) {
      // For each converted price, calculate tax
      const convertedPricesWithTax = {};
      Object.entries(prices).forEach(([currencyCode, convertedPrice]) => {
        const taxRate = taxSettings.taxCategory === "food" ? 0 :
          taxSettings.taxCategory === "clothing" ? 5 :
            taxSettings.taxCategory === "electronics" ? 10 : 8;

        const taxAmount = taxSettings.taxExempt ? 0 : (convertedPrice * taxRate) / 100;
        const totalPrice = convertedPrice + taxAmount;

        convertedPricesWithTax[currencyCode] = {
          basePrice: convertedPrice,
          taxAmount,
          taxRate,
          totalPrice
        };
      });

      setConvertedPrices(convertedPricesWithTax);
    } else if (Object.keys(prices).length > 0) {
      // If not taxable, just show base prices
      const convertedPricesWithoutTax = {};
      Object.entries(prices).forEach(([currencyCode, convertedPrice]) => {
        convertedPricesWithoutTax[currencyCode] = {
          basePrice: convertedPrice,
          taxAmount: 0,
          taxRate: 0,
          totalPrice: convertedPrice
        };
      });

      setConvertedPrices(convertedPricesWithoutTax);
    }
  }, [prices, taxSettings]);

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

  const uploadVariantImageHandler = async (e, variantIndex = null) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      toast.error("No files selected.");
      return;
    }

    if (files.length > 5) {
      toast.error("You can upload a maximum of 5 images per variant.");
      return;
    }

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("image", files[i]);
    }

    try {
      const res = await uploadProductImage(formData).unwrap();
      toast.success(res.message);

      if (variantIndex !== null) {
        // Update specific variant
        const updatedVariants = [...variants];
        const variantImages = updatedVariants[variantIndex].images || [];
        updatedVariants[variantIndex].images = [...variantImages, ...res.images];
        setVariants(updatedVariants);

        // Update variant image files state
        const updatedVariantImageFiles = [...variantImageFiles];
        if (!updatedVariantImageFiles[variantIndex]) {
          updatedVariantImageFiles[variantIndex] = [];
        }
        updatedVariantImageFiles[variantIndex] = [...updatedVariantImageFiles[variantIndex], ...files];
        setVariantImageFiles(updatedVariantImageFiles);
      } else {
        // Update variant form (for new variants)
        setVariantForm(prev => ({
          ...prev,
          images: [...prev.images, ...res.images]
        }));
      }
    } catch (error) {
      console.error("Error uploading variant images:", error);
      toast.error(error?.data?.message || error.error || "Failed to upload images");
    }
  };

  const deleteVariantImageHandler = async (imagePath, variantIndex) => {
    try {
      // Only delete from server if it's a server-stored image (starts with /uploads)
      if (imagePath && imagePath.startsWith('/uploads')) {
        await deleteProductImage({ imagePath });
      }

      if (variantIndex !== null) {
        // Update specific variant
        const updatedVariants = [...variants];
        const variantImages = updatedVariants[variantIndex].images || [];
        updatedVariants[variantIndex].images = variantImages.filter(img => img !== imagePath);
        setVariants(updatedVariants);

        // Update variant image files state
        const updatedVariantImageFiles = [...variantImageFiles];
        if (updatedVariantImageFiles[variantIndex]) {
          updatedVariantImageFiles[variantIndex] = updatedVariantImageFiles[variantIndex].filter((_, i) =>
            updatedVariants[variantIndex].images[i] !== imagePath
          );
        }
        setVariantImageFiles(updatedVariantImageFiles);
      } else {
        // Update variant form (for new variants)
        setVariantForm(prev => ({
          ...prev,
          images: prev.images.filter(img => img !== imagePath)
        }));
      }

      toast.success("Variant image deleted successfully");
    } catch (err) {
      toast.error("Failed to delete variant image");
    }
  };

  const moveVariantImage = (variantIndex, imageIndex, direction) => {
    if (variantIndex !== null) {
      const updatedVariants = [...variants];
      const variantImages = [...(updatedVariants[variantIndex].images || [])];
      const targetIndex = imageIndex + direction;

      if (targetIndex >= 0 && targetIndex < variantImages.length) {
        [variantImages[imageIndex], variantImages[targetIndex]] = [
          variantImages[targetIndex],
          variantImages[imageIndex]
        ];
        updatedVariants[variantIndex].images = variantImages;
        setVariants(updatedVariants);

        // Update variant image files state
        const updatedVariantImageFiles = [...variantImageFiles];
        if (updatedVariantImageFiles[variantIndex]) {
          const variantFiles = [...updatedVariantImageFiles[variantIndex]];
          [variantFiles[imageIndex], variantFiles[targetIndex]] = [
            variantFiles[targetIndex],
            variantFiles[imageIndex]
          ];
          updatedVariantImageFiles[variantIndex] = variantFiles;
          setVariantImageFiles(updatedVariantImageFiles);
        }
      }
    } else {
      // Handle moving images in the variant form
      const newImages = [...variantForm.images];
      const targetIndex = imageIndex + direction;
      if (targetIndex >= 0 && targetIndex < newImages.length) {
        [newImages[imageIndex], newImages[targetIndex]] = [
          newImages[targetIndex],
          newImages[imageIndex]
        ];
        setVariantForm(prev => ({
          ...prev,
          images: newImages
        }));
      }
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
      !variantForm.color &&
      !variantForm.size &&
      !variantForm.storage &&
      !variantForm.price &&
      !variantForm.countInStock
    ) {
      toast.error("Please fill at least one field for the variant.");
      return;
    }

    // Ensure images array exists
    const variantWithImages = { ...variantForm };
    if (!variantWithImages.images) {
      variantWithImages.images = [];
    }

    if (editVariantIndex !== null) {
      const updated = [...variants];
      updated[editVariantIndex] = variantWithImages;
      setVariants(updated);
      setEditVariantIndex(null);
    } else {
      setVariants([...variants, variantWithImages]);
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
    // Make sure images array exists
    const variant = { ...variants[index] };
    if (!variant.images) {
      variant.images = [];
    }
    setVariantForm(variant);
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
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("brand", brand);
      formData.append("category", category);
      formData.append("price", Number(price));
      formData.append("quantity", Number(quantity));
      formData.append("currency", currency);
      formData.append("prices", JSON.stringify(prices));
      tags.forEach((tag, i) => formData.append(`tags[${i}]`, tag));
      formData.append("warrantyPeriod", warrantyPeriod);
      formData.append("returnPolicy", returnPolicy);
      Object.entries(specifications || {}).forEach(([key, value]) => {
        formData.append(`specifications[${key}]`, value);
      });
      variants.forEach((variant, i) => {
        Object.entries(variant).forEach(([key, value]) => {
          if (key === "images") {
            // Handle images array
            if (Array.isArray(value)) {
              value.forEach((img, j) => {
                formData.append(`variants[${i}][images][${j}]`, img);
              });
            }
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

      // Add shipping details
      formData.append("shippingWeight", shippingDetails.weight);
      formData.append("shippingLength", shippingDetails.dimensions.length);
      formData.append("shippingWidth", shippingDetails.dimensions.width);
      formData.append("shippingHeight", shippingDetails.dimensions.height);
      formData.append("shippingClass", shippingDetails.shippingClass);

      // Add tax settings
      formData.append("taxProductCode", taxSettings.taxCode);
      formData.append("isTaxable", taxSettings.isTaxable);
      formData.append("taxCategory", taxSettings.taxCategory);
      formData.append("taxExempt", taxSettings.taxExempt);

      // Add vendor reference
      formData.append("user", userInfo._id);

      await createProduct(formData).unwrap();
      toast.success(`${name} created successfully`);
      // Signal that a product has been created
      localStorage.setItem("productChanged", Date.now().toString());
      navigate("/vendor/allproductslist");
    } catch (error) {
      console.log(error);
      toast.error("Product creation failed. Try Again.");
    }
  };

  // Get currency symbol for display
  const getCurrencySymbol = (currencyCode) => {
    const currency = currencies.find(c => c.code === currencyCode);
    return currency ? currency.symbol : '$';
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
            Add New Product
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Fill in the details to list a new product on {APP_NAME}
          </Typography>
        </Box>

        {/* Tax Calculation Preview */}
        {price && (
          <Card elevation={0} sx={{ mb: 5, bgcolor: "#f1f5f9", borderRadius: 4, border: '1px solid #e2e8f0' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tax Calculation Preview
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box>
                  <Typography variant="body2">Base Price:</Typography>
                  <Typography variant="h6">
                    {getCurrencySymbol(currency)}{taxCalculation.basePrice.toFixed(2)} {currency}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2">Tax ({taxCalculation.taxRate}%):</Typography>
                  <Typography variant="h6" color={taxCalculation.taxAmount > 0 ? "success.main" : "text.primary"}>
                    {getCurrencySymbol(currency)}{taxCalculation.taxAmount.toFixed(2)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2">Total Price:</Typography>
                  <Typography variant="h6">
                    {getCurrencySymbol(currency)}{taxCalculation.totalPrice.toFixed(2)}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setShowTaxDetails(!showTaxDetails)}
                  sx={{ ml: "auto" }}
                >
                  {showTaxDetails ? "Hide Details" : "Show Details"}
                </Button>
              </Stack>

              {showTaxDetails && taxBreakdown && (
                <Box sx={{ mt: 2, p: 2, bgcolor: "#2a2a2a", borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Tax Breakdown:
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    Jurisdiction: {taxBreakdown.jurisdiction}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    Tax Type: {taxBreakdown.taxType}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  {taxBreakdown.breakdown.map((item, index) => (
                    <Stack key={index} direction="row" justifyContent="space-between">
                      <Typography variant="body2">{item.name} ({item.rate}%):</Typography>
                      <Typography variant="body2">
                        {getCurrencySymbol(currency)}{item.amount.toFixed(2)}
                      </Typography>
                    </Stack>
                  ))}
                </Box>
              )}

              {/* Converted Prices with Tax */}
              {Object.keys(convertedPrices).length > 0 && (
                <Box sx={{ mt: 2, p: 2, bgcolor: "#2a2a2a", borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Converted Prices with Tax:
                  </Typography>
                  <Stack spacing={1}>
                    {Object.entries(convertedPrices).map(([code, priceInfo]) => (
                      <Stack key={code} direction="row" justifyContent="space-between">
                        <Typography variant="body2">
                          {code} ({getCurrencySymbol(code)}):
                        </Typography>
                        <Typography variant="body2">
                          {getCurrencySymbol(code)}{priceInfo.totalPrice.toFixed(2)}
                          {priceInfo.taxAmount > 0 && (
                            <span style={{ fontSize: '0.8em', color: '#aaa' }}>
                              {" "}(Base: {getCurrencySymbol(code)}{priceInfo.basePrice.toFixed(2)},
                              Tax: {getCurrencySymbol(code)}{priceInfo.taxAmount.toFixed(2)})
                            </span>
                          )}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>
              )}
            </CardContent>
          </Card>
        )}

        {/* Product Images */}
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
                    <ArrowUpwardIcon fontSize="small" sx={{ color: "black" }} />
                  </IconButton>
                  <IconButton size="small" onClick={() => moveImage(index, 1)}>
                    <ArrowDownwardIcon fontSize="small" sx={{ color: "black" }} />
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
          {/* Basic Product Information */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "black" }} />}>
              <Typography>Basic Product Information</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={3}>
                <TextField
                  label="Product Name *"
                  fullWidth
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  sx={{
                    input: { color: "black" },
                    label: { color: "#bbb" },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#555',
                      },
                      '&:hover fieldset': {
                        borderColor: '#888',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#1976d2',
                      },
                    },
                  }}
                  required
                />

                <FormControl fullWidth>
                  <InputLabel sx={{ color: "black" }}>Currency *</InputLabel>
                  <Select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    sx={{ color: "black" }}
                    label="Currency *"
                    required
                  >
                    {currencies.filter(c => c.isEnabled).map((c) => (
                      <MenuItem key={c.code} value={c.code}>
                        {c.code} - {c.name} ({c.symbol})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Price *"
                  type="number"
                  fullWidth
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  sx={{
                    input: { color: "black" },
                    label: { color: "#bbb" },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#555',
                      },
                      '&:hover fieldset': {
                        borderColor: '#888',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#1976d2',
                      },
                    },
                  }}
                  required
                  InputProps={{
                    startAdornment: <span>{getCurrencySymbol(currency)}</span>,
                  }}
                />
                <TextField
                  label="Quantity *"
                  type="number"
                  fullWidth
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  sx={{
                    input: { color: "black" },
                    label: { color: "#bbb" },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#555',
                      },
                      '&:hover fieldset': {
                        borderColor: '#888',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#1976d2',
                      },
                    },
                  }}
                  required
                />
                <TextField
                  label="Description *"
                  multiline
                  rows={4}
                  fullWidth
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  sx={{
                    textarea: { color: "black" },
                    label: { color: "#bbb" },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#555',
                      },
                      '&:hover fieldset': {
                        borderColor: '#888',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#1976d2',
                      },
                    },
                  }}
                  required
                />
                <TextField
                  label="Stock Count *"
                  type="number"
                  fullWidth
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  sx={{
                    input: { color: "black" },
                    label: { color: "#bbb" },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#555',
                      },
                      '&:hover fieldset': {
                        borderColor: '#888',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#1976d2',
                      },
                    },
                  }}
                  required
                />
                <FormControl fullWidth>
                  <InputLabel sx={{ color: "black" }}>Brand *</InputLabel>
                  <Select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    sx={{ color: "black" }}
                    label="Brand "
                  >
                    {brands.map((b) => (
                      <MenuItem key={b._id} value={b._id}>
                        {b.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: "black" }}>Category *</InputLabel>
                  <Select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    sx={{ color: "black" }}
                    label="Category *"
                    required
                  >
                    {categories.map((c) => (
                      <MenuItem key={c._id} value={c._id}>
                        {c.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* Tax Settings */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "black" }} />}>
              <Typography>Tax Settings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={3}>
                <Alert severity="info">
                  Configure tax settings for this product. Tax will be automatically calculated based on your location and product category.
                </Alert>

                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={taxSettings.isTaxable}
                        onChange={(e) => setTaxSettings({ ...taxSettings, isTaxable: e.target.checked })}
                        sx={{ color: "black" }}
                      />
                    }
                    label="Product is taxable"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={taxSettings.taxExempt}
                        onChange={(e) => setTaxSettings({ ...taxSettings, taxExempt: e.target.checked })}
                        sx={{ color: "black" }}
                      />
                    }
                    label="Product is tax exempt"
                  />
                </FormGroup>

                <FormControl fullWidth>
                  <InputLabel sx={{ color: "black" }}>Tax Category</InputLabel>
                  <Select
                    value={taxSettings.taxCategory}
                    onChange={(e) => setTaxSettings({ ...taxSettings, taxCategory: e.target.value })}
                    sx={{ color: "black" }}
                    label="Tax Category"
                    disabled={taxSettings.taxExempt}
                  >
                    {taxCategories.map((cat) => (
                      <MenuItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="Tax Product Code (Optional)"
                  fullWidth
                  value={taxSettings.taxCode}
                  onChange={(e) => setTaxSettings({ ...taxSettings, taxCode: e.target.value })}
                  sx={{
                    input: { color: "black" },
                    label: { color: "#bbb" },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#555',
                      },
                      '&:hover fieldset': {
                        borderColor: '#888',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#1976d2',
                      },
                    },
                  }}
                  helperText="HSN/SAC code or other tax classification code"
                />
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* Shipping Details */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "black" }} />}>
              <Typography>Shipping Details</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={3}>
                <TextField
                  label="Weight (kg)"
                  type="number"
                  fullWidth
                  value={shippingDetails.weight}
                  onChange={(e) => setShippingDetails({
                    ...shippingDetails,
                    weight: e.target.value
                  })}
                  sx={{
                    input: { color: "black" },
                    label: { color: "#bbb" },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#555',
                      },
                      '&:hover fieldset': {
                        borderColor: '#888',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#1976d2',
                      },
                    },
                  }}
                />

                <Typography variant="subtitle1">Dimensions (cm)</Typography>
                <Stack direction="row" spacing={2}>
                  <TextField
                    label="Length"
                    type="number"
                    fullWidth
                    value={shippingDetails.dimensions.length}
                    onChange={(e) => setShippingDetails({
                      ...shippingDetails,
                      dimensions: {
                        ...shippingDetails.dimensions,
                        length: e.target.value
                      }
                    })}
                    sx={{
                      input: { color: "black" },
                      label: { color: "#bbb" },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: '#555',
                        },
                        '&:hover fieldset': {
                          borderColor: '#888',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#1976d2',
                        },
                      },
                    }}
                  />
                  <TextField
                    label="Width"
                    type="number"
                    fullWidth
                    value={shippingDetails.dimensions.width}
                    onChange={(e) => setShippingDetails({
                      ...shippingDetails,
                      dimensions: {
                        ...shippingDetails.dimensions,
                        width: e.target.value
                      }
                    })}
                    sx={{
                      input: { color: "black" },
                      label: { color: "#bbb" },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: '#555',
                        },
                        '&:hover fieldset': {
                          borderColor: '#888',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#1976d2',
                        },
                      },
                    }}
                  />
                  <TextField
                    label="Height"
                    type="number"
                    fullWidth
                    value={shippingDetails.dimensions.height}
                    onChange={(e) => setShippingDetails({
                      ...shippingDetails,
                      dimensions: {
                        ...shippingDetails.dimensions,
                        height: e.target.value
                      }
                    })}
                    sx={{
                      input: { color: "black" },
                      label: { color: "#bbb" },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: '#555',
                        },
                        '&:hover fieldset': {
                          borderColor: '#888',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#1976d2',
                        },
                      },
                    }}
                  />
                </Stack>

                <FormControl fullWidth>
                  <InputLabel sx={{ color: "black" }}>Shipping Class</InputLabel>
                  <Select
                    value={shippingDetails.shippingClass}
                    onChange={(e) => setShippingDetails({
                      ...shippingDetails,
                      shippingClass: e.target.value
                    })}
                    sx={{ color: "black" }}
                    label="Shipping Class"
                  >
                    {shippingClasses.map((cls) => (
                      <MenuItem key={cls.value} value={cls.value}>
                        {cls.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* Product Tags */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "black" }} />}>
              <Typography>Product Tags</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <TextField
                  label="Add Tags (Enter to Add) *"
                  fullWidth
                  onKeyDown={handleAddTag}
                  sx={{
                    input: { color: "black" },
                    label: { color: "#bbb" },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#555',
                      },
                      '&:hover fieldset': {
                        borderColor: '#888',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#1976d2',
                      },
                    },
                  }}
                  helperText="Press Enter after each tag"
                />
                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                  {tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      onDelete={() => handleRemoveItem(tag)}
                      sx={{ bgcolor: "#222", color: "black" }}
                    />
                  ))}
                </Stack>
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* Product Variants */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "black" }} />}>
              <Typography>Product Variants</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={3}>
                <Typography variant="h6">Add New Variant</Typography>

                {/* Variant Images Upload Section */}
                <Box sx={{ p: 2, border: "1px dashed #ccc", borderRadius: 2, bgcolor: "#f9f9f9" }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Variant Images
                  </Typography>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    sx={{
                      color: "#333",
                      borderColor: "#999",
                      bgcolor: "#fff",
                      mb: 2,
                      py: 2,
                      fontWeight: "bold",
                      borderRadius: 2,
                    }}
                    startIcon={<AddPhotoAlternateIcon />}
                  >
                    Upload Images for This Variant (Max 5)
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      multiple
                      onChange={(e) => uploadVariantImageHandler(e, null)}
                    />
                  </Button>

                  {/* Display variant images preview */}
                  {variantForm.images && variantForm.images.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" gutterBottom>
                        Selected Images ({variantForm.images.length}/5):
                      </Typography>
                      <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: "wrap" }}>
                        {variantForm.images.map((url, imgIndex) => (
                          <Box key={imgIndex} sx={{ position: "relative" }}>
                            <img
                              src={url}
                              alt={`variant-img-${imgIndex}`}
                              style={{ height: 100, borderRadius: 8, border: "1px solid #ddd" }}
                            />
                            <Stack direction="row" spacing={0} sx={{ mt: 1 }}>
                              <IconButton
                                size="small"
                                onClick={() => moveVariantImage(null, imgIndex, -1)}
                                disabled={imgIndex === 0}
                                sx={{ minWidth: "30px", minHeight: "30px" }}
                              >
                                <ArrowUpwardIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => moveVariantImage(null, imgIndex, 1)}
                                disabled={imgIndex === variantForm.images.length - 1}
                                sx={{ minWidth: "30px", minHeight: "30px" }}
                              >
                                <ArrowDownwardIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => deleteVariantImageHandler(url, null)}
                                sx={{ minWidth: "30px", minHeight: "30px" }}
                              >
                                <DeleteIcon fontSize="small" color="error" />
                              </IconButton>
                            </Stack>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Box>

                {/* Variant Properties */}
                <Box sx={{ p: 2, border: "1px solid #eee", borderRadius: 2, bgcolor: "#fafafa" }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Variant Properties
                  </Typography>
                  <Stack direction="row" spacing={2} flexWrap="wrap">
                    {["color", "size", "storage", "price", "countInStock"].map(
                      (field) => (
                        <TextField
                          key={field}
                          label={field.charAt(0).toUpperCase() + field.slice(1)}
                          value={variantForm[field]}
                          onChange={(e) =>
                            setVariantForm((prev) => ({ ...prev, [field]: e.target.value }))
                          }
                          sx={{
                            input: { color: "black" },
                            label: { color: "#666" },
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': {
                                borderColor: '#ccc',
                              },
                              '&:hover fieldset': {
                                borderColor: '#999',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#1976d2',
                              },
                            },
                            width: { xs: "100%", sm: "150px" },
                            mb: 1
                          }}
                        />
                      )
                    )}
                  </Stack>

                  <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                    <Button
                      onClick={handleAddOrUpdateVariant}
                      variant="contained"
                      color="primary"
                      sx={{ fontWeight: "bold" }}
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
                      >
                        Cancel
                      </Button>
                    )}
                  </Stack>
                </Box>

                {/* Existing Variants List */}
                {variants.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Existing Variants ({variants.length})
                    </Typography>
                    <Stack spacing={2}>
                      {variants.map((v, i) => (
                        <Card key={i} sx={{ p: 2, bgcolor: "#ffffff", boxShadow: 2 }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                              Variant #{i + 1}
                            </Typography>
                            <Box>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleEditVariant(i)}
                                title="Edit Variant"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteVariant(i)}
                                title="Delete Variant"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>

                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                            {v.color && <Chip label={`Color: ${v.color}`} size="small" sx={{ bgcolor: "#e3f2fd" }} />}
                            {v.size && <Chip label={`Size: ${v.size}`} size="small" sx={{ bgcolor: "#e8f5e9" }} />}
                            {v.storage && <Chip label={`Storage: ${v.storage}`} size="small" sx={{ bgcolor: "#fff3e0" }} />}
                            {v.price && <Chip label={`Price: $${v.price}`} size="small" sx={{ bgcolor: "#fce4ec" }} />}
                            {v.countInStock && <Chip label={`Stock: ${v.countInStock}`} size="small" sx={{ bgcolor: "#f3e5f5" }} />}
                          </Box>

                          {/* Variant images section */}
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Variant Images:
                            </Typography>

                            {/* Upload button for existing variant */}
                            <Button
                              variant="outlined"
                              component="label"
                              size="small"
                              sx={{ mb: 1, mr: 1 }}
                            >
                              Add More Images
                              <input
                                type="file"
                                accept="image/*"
                                hidden
                                multiple
                                onChange={(e) => uploadVariantImageHandler(e, i)}
                              />
                            </Button>

                            {/* Display variant images */}
                            {v.images && v.images.length > 0 ? (
                              <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
                                {v.images.map((url, imgIndex) => (
                                  <Box key={imgIndex} sx={{ position: "relative" }}>
                                    <img
                                      src={url}
                                      alt={`variant-${i}-img-${imgIndex}`}
                                      style={{ height: 80, borderRadius: 4, border: "1px solid #ddd" }}
                                    />
                                    <Stack direction="row" spacing={0} sx={{ mt: 0.5 }}>
                                      <IconButton
                                        size="small"
                                        onClick={() => moveVariantImage(i, imgIndex, -1)}
                                        disabled={imgIndex === 0}
                                        sx={{ minWidth: "25px", minHeight: "25px", padding: "2px" }}
                                      >
                                        <ArrowUpwardIcon fontSize="small" />
                                      </IconButton>
                                      <IconButton
                                        size="small"
                                        onClick={() => moveVariantImage(i, imgIndex, 1)}
                                        disabled={imgIndex === v.images.length - 1}
                                        sx={{ minWidth: "25px", minHeight: "25px", padding: "2px" }}
                                      >
                                        <ArrowDownwardIcon fontSize="small" />
                                      </IconButton>
                                      <IconButton
                                        size="small"
                                        onClick={() => deleteVariantImageHandler(url, i)}
                                        sx={{ minWidth: "25px", minHeight: "25px", padding: "2px" }}
                                      >
                                        <DeleteIcon fontSize="small" color="error" />
                                      </IconButton>
                                    </Stack>
                                  </Box>
                                ))}
                              </Stack>
                            ) : (
                              <Typography variant="body2" color="textSecondary">
                                No images uploaded for this variant
                              </Typography>
                            )}
                          </Box>
                        </Card>
                      ))}
                    </Stack>
                  </Box>
                )}
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* Product Specifications */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "black" }} />}>
              <Typography>Product Specifications</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <Stack direction="row" spacing={2}>
                  <TextField
                    label="Key"
                    value={specKey}
                    onChange={(e) => setSpecKey(e.target.value)}
                    sx={{
                      input: { color: "black" },
                      label: { color: "#bbb" },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: '#555',
                        },
                        '&:hover fieldset': {
                          borderColor: '#888',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#1976d2',
                        },
                      },
                    }}
                  />
                  <TextField
                    label="Value"
                    value={specValue}
                    onChange={(e) => setSpecValue(e.target.value)}
                    sx={{
                      input: { color: "black" },
                      label: { color: "#bbb" },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: '#555',
                        },
                        '&:hover fieldset': {
                          borderColor: '#888',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#1976d2',
                        },
                      },
                    }}
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
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* Additional Information */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "black" }} />}>
              <Typography>Additional Information</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={3}>
                <TextField
                  label="Warranty Period"
                  fullWidth
                  value={warrantyPeriod}
                  onChange={(e) => setWarrantyPeriod(e.target.value)}
                  sx={{
                    input: { color: "black" },
                    label: { color: "#bbb" },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#555',
                      },
                      '&:hover fieldset': {
                        borderColor: '#888',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#1976d2',
                      },
                    },
                  }}
                  helperText="e.g., 1 year, 30 days, lifetime"
                />
                <TextField
                  label="Return Policy"
                  fullWidth
                  value={returnPolicy}
                  onChange={(e) => setReturnPolicy(e.target.value)}
                  sx={{
                    input: { color: "black" },
                    label: { color: "#bbb" },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#555',
                      },
                      '&:hover fieldset': {
                        borderColor: '#888',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#1976d2',
                      },
                    },
                  }}
                  helperText="Details about return and refund policy"
                />
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ py: 2, borderRadius: 2, fontWeight: "bold" }}
          >
            Add Product
          </Button>
        </Box>
      </Paper>
    </Box>
  );

};

export default AddProduct;