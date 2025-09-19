import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Box,
  Modal,
  Paper,
  Typography,
  Button,
  Rating,
  Chip,
  Stack,
  IconButton,
  useTheme,
  useMediaQuery,
  alpha,
} from "@mui/material";
import { FaShoppingCart, FaHeart, FaRegHeart, FaTimes, FaEye } from "react-icons/fa";
import { addToCart } from "../redux/features/cart/cartSlice";
import { addToFavorites, removeFromFavorites } from "../redux/features/favorites/favoriteSlice";
import MultiCurrencyPriceDisplay from "./MultiCurrencyPriceDisplay";
import { useFetchOffersQuery } from "../redux/api/offerApiSlice";

const QuickView = ({ product, open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const { data: offers } = useFetchOffersQuery();
  
  // Check if product is in favorites
  const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
  const isFavorite = favorites.some((p) => p._id === product?._id);

  const toggleFavorites = () => {
    if (isFavorite) {
      dispatch(removeFromFavorites(product));
      const updatedFavorites = favorites.filter((p) => p._id !== product._id);
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      toast.info("Removed from favorites");
    } else {
      dispatch(addToFavorites(product));
      const updatedFavorites = [...favorites, product];
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      toast.success("Added to favorites!");
    }
  };

  const addToCartHandler = () => {
    dispatch(addToCart({ ...product, qty }));
    toast.success("Added to cart!");
  };

  const goToProductPage = () => {
    onClose();
    navigate(`/product/${product._id}`);
  };

  const calculateDiscountedPrice = (product, offers) => {
    if (!product || !product.price) return product?.price || 0;
    if (!offers || offers.length === 0) return product.price;

    let discountedPrice = product.price;
    let bestDiscount = 0;
    let bestDiscountType = null;
    
    offers.forEach((offer) => {
      const isProductInOffer =
        offer.products.some((p) => p._id === product._id) ||
        offer.categories.some((c) => c._id === product.category?._id) ||
        (offer.brand && offer.brand._id === product.brand?._id);

      if (isProductInOffer) {
        if (offer.discountUnit === "percent" && offer.discountValue > bestDiscount) {
          bestDiscount = offer.discountValue;
          bestDiscountType = "percent";
        } else if (offer.discountUnit === "flat" && offer.discountValue > bestDiscount) {
          bestDiscount = offer.discountValue;
          bestDiscountType = "flat";
        }
      }
    });

    if (bestDiscountType === "percent") {
      discountedPrice = product.price - (product.price * bestDiscount / 100);
    } else if (bestDiscountType === "flat") {
      discountedPrice = Math.max(0, product.price - bestDiscount);
    }

    return discountedPrice;
  };

  const discountedPrice = calculateDiscountedPrice(product, offers);

  if (!product) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Paper
        elevation={24}
        sx={{
          width: '100%',
          maxWidth: { xs: '100%', sm: 600, md: 900 },
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: 4,
          bgcolor: theme.palette.background.paper,
          position: 'relative',
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.shadows[24],
        }}
      >
        {/* Close Button */}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 10,
            bgcolor: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(10px)',
            '&:hover': {
              bgcolor: alpha(theme.palette.error.main, 0.1),
            }
          }}
        >
          <FaTimes />
        </IconButton>
        
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          <Stack 
            direction={{ xs: 'column', md: 'row' }} 
            spacing={{ xs: 3, md: 4 }}
            sx={{ 
              position: 'relative',
              minHeight: { xs: 'auto', md: 400 }
            }}
          >
            {/* Product Image */}
            <Box 
              sx={{ 
                flex: { md: 1 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}
            >
              <Box
                component="img"
                src={product.media?.[0]?.url || "/placeholder.jpg"}
                alt={product.name}
                sx={{
                  width: '100%',
                  maxWidth: 350,
                  height: { xs: 300, md: 350 },
                  objectFit: "cover",
                  borderRadius: 3,
                  boxShadow: 3,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              />
              
              {/* Favorite Button */}
              <IconButton
                onClick={toggleFavorites}
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  bgcolor: alpha(theme.palette.background.paper, 0.8),
                  backdropFilter: 'blur(10px)',
                  color: isFavorite ? theme.palette.error.main : theme.palette.text.secondary,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.error.main, 0.1),
                    color: theme.palette.error.main,
                  }
                }}
              >
                {isFavorite ? <FaHeart /> : <FaRegHeart />}
              </IconButton>
              
              {/* Stock Status */}
              <Chip
                label={product.countInStock > 0 ? "In Stock" : "Out of Stock"}
                color={product.countInStock > 0 ? "success" : "error"}
                size="small"
                sx={{
                  position: 'absolute',
                  top: 16,
                  left: 16,
                  fontWeight: 600,
                  borderRadius: 2,
                  height: 28,
                  '& .MuiChip-label': {
                    px: 1.5
                  }
                }}
              />
            </Box>
            
            {/* Product Details */}
            <Box sx={{ flex: { md: 1 } }}>
              <Typography 
                variant={isMobile ? "h5" : "h4"} 
                fontWeight={800}
                sx={{ 
                  mb: 1,
                  color: theme.palette.text.primary
                }}
              >
                {product.name}
              </Typography>
              
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <Rating 
                  value={product.rating || 0} 
                  precision={0.1} 
                  readOnly 
                  size="small" 
                />
                <Typography variant="body2" color="text.secondary">
                  ({product.numReviews || 0} reviews)
                </Typography>
              </Stack>
              
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  mb: 3,
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {product.description}
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <MultiCurrencyPriceDisplay 
                  product={{...product, price: discountedPrice}} 
                  showOriginal={product.price !== discountedPrice}
                  originalPrice={product.price}
                />
              </Box>
              
              <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                <Chip 
                  label={product.brand?.name || "Unknown Brand"} 
                  variant="outlined"
                  sx={{
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                    color: theme.palette.primary.main,
                    fontWeight: 500
                  }}
                />
                <Chip 
                  label={product.category?.name || "Uncategorized"} 
                  variant="outlined"
                  sx={{
                    borderColor: alpha(theme.palette.secondary.main, 0.3),
                    color: theme.palette.secondary.main,
                    fontWeight: 500
                  }}
                />
              </Stack>
              
              {/* Quantity Selector - Only show if in stock */}
              {product.countInStock > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                    Quantity
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <IconButton
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      disabled={qty <= 1}
                      sx={{
                        width: 40,
                        height: 40,
                        border: `1px solid ${theme.palette.divider}`,
                        '&:disabled': {
                          opacity: 0.5
                        }
                      }}
                    >
                      -
                    </IconButton>
                    <Typography variant="body1" sx={{ minWidth: 40, textAlign: 'center', fontWeight: 600 }}>
                      {qty}
                    </Typography>
                    <IconButton
                      onClick={() => setQty(Math.min(product.countInStock, qty + 1))}
                      disabled={qty >= product.countInStock}
                      sx={{
                        width: 40,
                        height: 40,
                        border: `1px solid ${theme.palette.divider}`,
                        '&:disabled': {
                          opacity: 0.5
                        }
                      }}
                    >
                      +
                    </IconButton>
                    {product.countInStock < 10 && (
                      <Typography variant="caption" color="warning.main">
                        Only {product.countInStock} left!
                      </Typography>
                    )}
                  </Stack>
                </Box>
              )}
              
              {/* Action Buttons */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  variant="contained"
                  size={isMobile ? "medium" : "large"}
                  disabled={product.countInStock === 0}
                  onClick={addToCartHandler}
                  sx={{
                    flex: 1,
                    borderRadius: 2,
                    py: 1.5,
                    fontWeight: 600,
                    textTransform: "none",
                    background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                    boxShadow: 3,
                    '&:hover': {
                      boxShadow: 6,
                      transform: 'translateY(-2px)'
                    },
                    '&:disabled': {
                      bgcolor: 'action.disabled',
                      color: 'action.disabledText'
                    }
                  }}
                  startIcon={<FaShoppingCart />}
                >
                  {product.countInStock === 0 ? "Out of Stock" : "Add to Cart"}
                </Button>
                
                <Button
                  variant="outlined"
                  size={isMobile ? "medium" : "large"}
                  onClick={goToProductPage}
                  sx={{
                    flex: 1,
                    borderRadius: 2,
                    py: 1.5,
                    fontWeight: 600,
                    textTransform: "none",
                    borderColor: alpha(theme.palette.primary.main, 0.5),
                    color: theme.palette.primary.main,
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                      transform: 'translateY(-2px)'
                    }
                  }}
                  startIcon={<FaEye />}
                >
                  View Details
                </Button>
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Paper>
    </Modal>
  );
};

export default QuickView;