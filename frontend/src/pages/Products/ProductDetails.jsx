import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  useGetProductDetailsQuery,
  useCreateReviewMutation,
} from "../../redux/api/productApiSlice";
import Loader from "../../components/Loader";
import Message from "../../components/Message";
import MultiCurrencyPriceDisplay from "../../components/MultiCurrencyPriceDisplay";
import {
  Box,
  Grid,
  Typography,
  Paper,
  Button,
  Rating,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow,
  IconButton,
  Tooltip,
  OutlinedInput,
  InputAdornment,
} from "@mui/material";
import { FaShoppingCart, FaEye, FaHeart, FaRegHeart } from "react-icons/fa";
import { useFetchOffersQuery } from "../../redux/api/offerApiSlice";
import ProductTabs from "./ProductTabs";
import SimilarProducts from "../../components/SimilarProducts";
import { addToCart } from "../../redux/features/cart/cartSlice";
import DocumentTitle from "react-document-title";
import { getVariant, getAvailableOptions, formatVariantAttributes, isVariantInStock, getVariantPrice, getVariantImages, hasVariants, getVariantSku, getVariantShippingDetails } from "../../Utils/variantUtils";

const ProductDetails = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [qty, setQty] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState({}); // For variant selection
  const [selectedVariant, setSelectedVariant] = useState(null); // Current selected variant
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const { data: product, isLoading, refetch, error } = useGetProductDetailsQuery(productId);
  const { data: offers, isLoading: offersLoading } = useFetchOffersQuery();
  
  const [offerpercent, setofferpercent] = useState({
    percentage: "",
    end: ""
  });
  
  const { userInfo } = useSelector((state) => state.auth);
  
  // Update variant when product or selected options change
  useEffect(() => {
    if (product && product.variants && product.variants.length > 0) {
      const variant = getVariant(product, selectedOptions);
      setSelectedVariant(variant);
    } else {
      setSelectedVariant(null);
    }
  }, [product, selectedOptions]);
  
  useEffect(() => {
    if (offers && product) {
      offers.forEach((offer) => {
        if (
          offer.products &&
          offer.categories &&
          offer.brand &&
          product._id &&
          product.category &&
          product.brand
        ) {
          const isProductInOffer =
            offer.products.some((p) => p._id === product._id) ||
            offer.categories.some((c) => c._id === product.category) ||
            (offer.brand && offer.brand._id === product.brand);

          if (isProductInOffer && offer.discountUnit === "percent") {
            setofferpercent({
              percentage: offer.discountValue,
              end: offer.endTime,
            });
          }
        }
      });
    }
  }, [offers, product]);
  
  const [createReview, { isLoading: loadingProductReview }] = useCreateReviewMutation();

  // Get current product/variant price
  const getCurrentPrice = () => {
    if (selectedVariant) {
      return getVariantPrice(selectedVariant);
    }
    return product?.price || 0;
  };

  // Get current product/variant images
  const getCurrentImages = () => {
    if (selectedVariant) {
      return getVariantImages(selectedVariant, product);
    }
    return product?.media?.map(m => m.url) || [];
  };

  // Get current stock
  const getCurrentStock = () => {
    if (selectedVariant) {
      return selectedVariant.countInStock;
    }
    return product?.countInStock || 0;
  };

  // Check if current selection is in stock
  const isInStock = () => {
    if (selectedVariant) {
      return isVariantInStock(selectedVariant);
    }
    return product?.countInStock > 0;
  };

  // Handle option selection
  const handleOptionSelect = (optionType, value) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionType]: value
    }));
  };

  // Reset selection when product changes
  useEffect(() => {
    setSelectedOptions({});
    setSelectedVariant(null);
  }, [productId]);

  // Add to cart handler
  const addToCartHandler = () => {
    // Check if product has variants but no variant is selected
    if (hasVariants(product) && !selectedVariant) {
      toast.error("Please select all options before adding to cart");
      return;
    }
    
    // Prepare cart item with variant information if applicable
    const cartItem = {
      ...product,
      qty,
      // If we have a variant, include variant-specific information
      ...(selectedVariant && {
        _id: `${product._id}-${selectedVariant._id}`, // Unique ID for variant in cart
        variantId: selectedVariant._id,
        sku: getVariantSku(selectedVariant),
        name: `${product.name} (${formatVariantAttributes(selectedVariant)})`,
        price: getVariantPrice(selectedVariant),
        media: getVariantImages(selectedVariant, product).map(url => ({ url })),
        countInStock: selectedVariant.countInStock,
        selectedOptions: selectedOptions // Store selected options for display in cart
      })
    };
    
    dispatch(addToCart(cartItem));
    toast.success("Added to cart!", { autoClose: 1800 });
    navigate("/cart");
  };
  
  const addToShippingHandler = () => {
    // Check if product has variants but no variant is selected
    if (hasVariants(product) && !selectedVariant) {
      toast.error("Please select all options before buying now");
      return;
    }
    
    // Prepare cart item with variant information if applicable
    const cartItem = {
      ...product,
      qty,
      // If we have a variant, include variant-specific information
      ...(selectedVariant && {
        _id: `${product._id}-${selectedVariant._id}`, // Unique ID for variant in cart
        variantId: selectedVariant._id,
        sku: getVariantSku(selectedVariant),
        name: `${product.name} (${formatVariantAttributes(selectedVariant)})`,
        price: getVariantPrice(selectedVariant),
        media: getVariantImages(selectedVariant, product).map(url => ({ url })),
        countInStock: selectedVariant.countInStock,
        selectedOptions: selectedOptions // Store selected options for display in cart
      })
    };
    
    dispatch(addToCart(cartItem));
    navigate("/shipping");
  };
  
  const calculateDiscountedPrice = (product, offers) => {
    if (!product || !product.price) return 0; // Return 0 if product or price is undefined
    if (!offers || offers.length === 0) return product.price; // Return original price if no offers

    let discountedPrice = product.price;

    // Iterate through all offers to find applicable discounts
    offers.forEach((offer) => {
      const isProductInOffer =
        offer.products.some((p) => p._id === product._id) ||
        offer.categories.some((c) => c._id === product.category) ||
        (offer.brand && offer.brand._id === product.brand);

      if (isProductInOffer) {
        if (offer.discountUnit === "percent" && offer.endTime !== Date()) {
          discountedPrice = Math.min(
            discountedPrice,
            product.price - product.price * (offer.discountValue / 100)
          );
        } else if (offer.discountUnit === "flat") {
          discountedPrice = Math.min(
            discountedPrice,
            product.price - offer.discountValue
          );
        }
      }
    });

    return discountedPrice;
  };
  
  let discountedPrice = calculateDiscountedPrice(product, offers).toFixed(2);
  
  // Get available options for the product
  const availableOptions = product ? getAvailableOptions(product) : { colors: [], sizes: [], storages: [] };
  
  return (
    <DocumentTitle title={`${product?.name || "Product"} - Details`}>
      <Box sx={{ minHeight: "100vh", py: 4, bgcolor: "#f3f4f6" }}>
        <Box sx={{ maxWidth: "1400px", mx: "auto" }}>
          {isLoading ? (
            <Loader />
          ) : error ? (
            <Message variant="danger">{error?.data?.message || error.message}</Message>
          ) : (
            <Paper
              elevation={6}
              sx={{
                p: { xs: 2, md: 4 },
                borderRadius: 4,
                boxShadow: "0 8px 32px 0 rgba(236,72,153,0.10)",
                background: "linear-gradient(135deg, #fff 70%, #e3eeff 100%)",
              }}
            >
              <Grid container spacing={4}>
                {/* Product Media */}
                <Grid item xs={12} md={5} lg={4}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      bgcolor: "#fff",
                      borderRadius: 3,
                      height: "100%",
                      justifyContent: "center",
                      boxShadow: "0 2px 12px #ec489933",
                    }}
                  >
                    <Box
                      sx={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        minHeight: 350,
                        position: "relative",
                      }}
                    >
                      <CardMedia
                        component="img"
                        image={getCurrentImages()[0] || "/placeholder.png"}
                        alt={product.name}
                        sx={{
                          width: "100%",
                          maxWidth: 340,
                          maxHeight: 400,
                          objectFit: "contain",
                          mb: 2,
                          borderRadius: 3,
                          border: "1.5px solid #f3e7e9",
                          background: "#f8fafc",
                          boxShadow: "0 4px 24px #ec489955",
                          transition: "transform 0.3s",
                          "&:hover": {
                            transform: "scale(1.04)",
                          },
                        }}
                      />
                      {/* Variant-specific image thumbnails */}
                      {selectedVariant && getCurrentImages().length > 1 && (
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{
                            mt: 2,
                            bgcolor: "rgba(255,255,255,0.85)",
                            borderRadius: 2,
                            p: 0.5,
                            boxShadow: "0 2px 8px #ec489955",
                          }}
                        >
                          {getCurrentImages().slice(1, 4).map((url, idx) => (
                            <img
                              src={url}
                              alt={`variant-thumb-${idx}`}
                              key={idx}
                              style={{
                                width: 38,
                                height: 38,
                                objectFit: "cover",
                                borderRadius: 6,
                                border: "1.5px solid #ec4899",
                                boxShadow: "0 1px 4px #ec489933",
                                background: "#fff",
                              }}
                            />
                          ))}
                        </Stack>
                      )}
                      <Box sx={{ position: "absolute", top: 14, right: 14 }}>
                        {/* Heart icon would go here */}
                      </Box>
                      {!isInStock() && (
                        <Chip
                          label="Out of Stock"
                          color="error"
                          sx={{
                            position: "absolute",
                            top: 14,
                            left: 14,
                            fontWeight: 600,
                            fontSize: "0.95rem",
                            borderRadius: "999px",
                            zIndex: 2,
                            bgcolor: "#f87171",
                            color: "#fff",
                            boxShadow: "0 2px 8px #f8717166",
                          }}
                        />
                      )}
                    </Box>
                    {/* Thumbnails */}
                    {getCurrentImages().length > 1 && (
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{
                          mt: 2,
                          bgcolor: "rgba(255,255,255,0.85)",
                          borderRadius: 2,
                          p: 0.5,
                          boxShadow: "0 2px 8px #ec489955",
                        }}
                      >
                        {getCurrentImages().slice(1, 4).map((url, idx) => (
                          <img
                            src={url}
                            alt={`thumb-${idx}`}
                            key={idx}
                            style={{
                              width: 38,
                              height: 38,
                              objectFit: "cover",
                              borderRadius: 6,
                              border: "1.5px solid #ec4899",
                              boxShadow: "0 1px 4px #ec489933",
                              background: "#fff",
                            }}
                          />
                        ))}
                      </Stack>
                    )}
                  </Paper>
                </Grid>

                {/* Product Info */}
                <Grid item xs={12} md={4} lg={5}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      bgcolor: "#fff",
                      borderRadius: 3,
                      boxShadow: "0 2px 12px #ec489933",
                    }}
                  >
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      gutterBottom
                      sx={{
                        color: "#18181b",
                        letterSpacing: 0.5,
                        textShadow: "1px 1px 8px #f3e7e9",
                      }}
                    >
                      {product.name}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <Rating
                        value={Number(product.rating) || 0}
                        precision={0.1}
                        readOnly
                        size="medium"
                        sx={{ color: "#ec4899" }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {product.numReviews} ratings
                      </Typography>
                      <Chip
                        label={isInStock() ? "In Stock" : "Out of Stock"}
                        color={isInStock() ? "success" : "error"}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.95rem",
                          borderRadius: "999px",
                          ml: 1,
                        }}
                      />
                    </Stack>
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                      Brand: <b>{product.brand?.name}</b>
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      <strong>About this item:</strong>
                      <br />
                      {product.description}
                    </Typography>
                    
                    {/* Variant Selection */}
                    {hasVariants(product) && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Select Options:
                        </Typography>
                        
                        {/* Color Selector */}
                        {availableOptions.colors.length > 0 && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle1" sx={{ mb: 1 }}>
                              Color:
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap">
                              {availableOptions.colors.map((color) => (
                                <Chip
                                  key={color}
                                  label={color}
                                  onClick={() => handleOptionSelect('color', color)}
                                  color={selectedOptions.color === color ? "primary" : "default"}
                                  variant={selectedOptions.color === color ? "filled" : "outlined"}
                                  sx={{ 
                                    cursor: "pointer", 
                                    mb: 1,
                                    minWidth: 40,
                                    height: 36,
                                    '&:hover': {
                                      transform: 'scale(1.05)',
                                      boxShadow: 2
                                    },
                                    transition: 'all 0.2s ease'
                                  }}
                                />
                              ))}
                            </Stack>
                          </Box>
                        )}
                        
                        {/* Size Selector */}
                        {availableOptions.sizes.length > 0 && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle1" sx={{ mb: 1 }}>
                              Size:
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap">
                              {availableOptions.sizes.map((size) => (
                                <Chip
                                  key={size}
                                  label={size}
                                  onClick={() => handleOptionSelect('size', size)}
                                  color={selectedOptions.size === size ? "primary" : "default"}
                                  variant={selectedOptions.size === size ? "filled" : "outlined"}
                                  sx={{ 
                                    cursor: "pointer", 
                                    mb: 1,
                                    minWidth: 40,
                                    height: 36,
                                    '&:hover': {
                                      transform: 'scale(1.05)',
                                      boxShadow: 2
                                    },
                                    transition: 'all 0.2s ease'
                                  }}
                                />
                              ))}
                            </Stack>
                          </Box>
                        )}
                        
                        {/* Storage Selector */}
                        {availableOptions.storages.length > 0 && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle1" sx={{ mb: 1 }}>
                              Storage:
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap">
                              {availableOptions.storages.map((storage) => (
                                <Chip
                                  key={storage}
                                  label={storage}
                                  onClick={() => handleOptionSelect('storage', storage)}
                                  color={selectedOptions.storage === storage ? "primary" : "default"}
                                  variant={selectedOptions.storage === storage ? "filled" : "outlined"}
                                  sx={{ 
                                    cursor: "pointer", 
                                    mb: 1,
                                    minWidth: 40,
                                    height: 36,
                                    '&:hover': {
                                      transform: 'scale(1.05)',
                                      boxShadow: 2
                                    },
                                    transition: 'all 0.2s ease'
                                  }}
                                />
                              ))}
                            </Stack>
                          </Box>
                        )}
                        
                        {/* Selected Variant Info */}
                        {selectedVariant && (
                          <Box sx={{ mt: 2, p: 2, bgcolor: "#f5f5f5", borderRadius: 2 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                              Selected: {formatVariantAttributes(selectedVariant)}
                            </Typography>
                            <Typography variant="body2">
                              SKU: {getVariantSku(selectedVariant)}
                            </Typography>
                            {selectedVariant.countInStock < 10 && selectedVariant.countInStock > 0 && (
                              <Typography variant="body2" color="warning.main">
                                Only {selectedVariant.countInStock} left in stock!
                              </Typography>
                            )}
                            
                            {/* Shipping Info */}
                            {getVariantShippingDetails(selectedVariant).weight && (
                              <Typography variant="body2" sx={{ mt: 1 }}>
                                Weight: {getVariantShippingDetails(selectedVariant).weight}kg
                              </Typography>
                            )}
                          </Box>
                        )}
                        
                        {/* Warning when not all options are selected */}
                        {!selectedVariant && Object.keys(selectedOptions).length > 0 && (
                          <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
                            Please select all options
                          </Typography>
                        )}
                      </Box>
                    )}
                    
                    <Divider sx={{ my: 2 }} />
                    <MultiCurrencyPriceDisplay product={{...product, price: getCurrentPrice()}} />
                    {offerpercent.percentage > 0 && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#ef4444",
                          fontWeight: 500,
                          textDecoration: "line-through",
                          mt: 1,
                        }}
                      >
                        Original Price: <MultiCurrencyPriceDisplay product={{...product, price: product.price}} showConversion={false} />
                      </Typography>
                    )}
                    
                    {/* Variant-specific price display */}
                    {selectedVariant && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Variant Price: <MultiCurrencyPriceDisplay product={{...product, price: getVariantPrice(selectedVariant)}} showConversion={false} />
                      </Typography>
                    )}
                  </Paper>
                </Grid>

                {/* Buy/Cart Section */}
                <Grid item xs={12} md={3} lg={3}>
                  <Card
                    elevation={4}
                    sx={{
                      p: 3,
                      bgcolor: "#fff",
                      borderRadius: 3,
                      boxShadow: "0 2px 12px #ec489933",
                    }}
                  >
                    <CardContent>
                      <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
                        Buy Now
                      </Typography>
                      <MultiCurrencyPriceDisplay product={{...product, price: getCurrentPrice()}} />
                      <Typography variant="body2" sx={{ mb: 2, mt: 1 }}>
                        {isInStock() ? (
                          <span style={{ color: "#22c55e" }}>In Stock</span>
                        ) : (
                          <span style={{ color: "#ef4444" }}>Out of Stock</span>
                        )}
                      </Typography>
                      {isInStock() && (
                        <FormControl fullWidth sx={{ mb: 2 }}>
                          <InputLabel id="qty-label">Quantity</InputLabel>
                          <Select
                            labelId="qty-label"
                            value={qty}
                            label="Quantity"
                            onChange={(e) => setQty(Number(e.target.value))}
                            sx={{ bgcolor: "#f5f5f5", borderRadius: 2 }}
                          >
                            {[...Array(Math.min(10, getCurrentStock())).keys()].map((x) => (
                              <MenuItem key={x + 1} value={x + 1}>
                                {x + 1}
                              </MenuItem>
                            ))}
                          </Select>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {getCurrentStock()} available
                          </Typography>
                        </FormControl>
                      )}
                      <Button
                        variant="contained"
                        color="secondary"
                        fullWidth
                        size="large"
                        sx={{
                          borderRadius: 2,
                          fontWeight: "bold",
                          mb: 1,
                          background: "#ec4899",
                          "&:hover": { background: "#be185d" },
                          boxShadow: 2,
                          textTransform: "none",
                          fontSize: "1.1rem",
                          py: 1.2,
                        }}
                        disabled={!isInStock() || (hasVariants(product) && !selectedVariant)}
                        onClick={addToCartHandler}
                      >
                        <FaShoppingCart style={{ marginRight: 8 }} />
                        Add To Cart
                      </Button>
                      <Button
                        variant="contained"
                        color="secondary"
                        fullWidth
                        size="large"
                        sx={{
                          borderRadius: 2,
                          fontWeight: "bold",
                          mb: 1,
                          background: "#ec4899",
                          "&:hover": { background: "#be185d" },
                          boxShadow: 2,
                          textTransform: "none",
                          fontSize: "1.1rem",
                          py: 1.2,
                        }}
                        disabled={!isInStock() || (hasVariants(product) && !selectedVariant)}
                        onClick={addToShippingHandler}
                      >
                        <FaShoppingCart style={{ marginRight: 8 }} />
                        Buy Now
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Product Specifications */}
                {product.specifications && (
                  <>
                    <Grid item xs={12} sx={{ mt: 4 }}>
                      <Paper
                        sx={{
                          p: 4,
                          mb: 4,
                          borderRadius: 3,
                          bgcolor: "#fafafa",
                          boxShadow: "0 2px 12px #ec489933",
                        }}
                      >
                        <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
                          Specifications
                        </Typography>
                        <Table>
                          <TableBody>
                            {product.specifications &&
                              Object.entries(product.specifications).map(
                                ([key, value]) => (
                                  <TableRow key={key}>
                                    <TableCell
                                      sx={{
                                        fontWeight: "bold",
                                        textTransform: "capitalize",
                                      }}
                                    >
                                      {key}
                                    </TableCell>
                                    <TableCell>{value}</TableCell>
                                  </TableRow>
                                )
                              )}
                          </TableBody>
                        </Table>
                      </Paper>
                    </Grid>
                  </>
                )}

                {/* Product Reviews */}
                <Grid item xs={12}>
                  <ProductTabs
                    userInfo={userInfo}
                    product={product}
                  />
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* Similar Products */}
          {!isLoading && !error && product && (
            <SimilarProducts productId={productId} limit={6} />
          )}
        </Box>
      </Box>
    </DocumentTitle>
  );
};

export default ProductDetails;