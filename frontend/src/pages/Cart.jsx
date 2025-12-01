import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaTrash, FaPlus, FaMinus } from "react-icons/fa";
import { addToCart, removeFromCart, addOffers } from "../redux/features/cart/cartSlice";

import {
  Box,
  IconButton,
  Typography,
  Paper,
  Button,
  Grid,
  Avatar,
  Divider,
  TextField,
  Stack,
  Tooltip,
  useTheme,
  useMediaQuery,
  alpha,
  Chip,
  Skeleton,
} from "@mui/material";
import DocumentTitle from "react-document-title";
import { useMemo, useState } from "react";
import { useFetchOffersQuery } from "../redux/api/offerApiSlice";
import CartRecommendations from "../components/CartRecommendations";
import { formatVariantAttributes, getVariantSku } from "../Utils/variantUtils";

const Cart = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);
  const currency = useSelector((state) => state.currency.selectedCurrency);
  const price = useSelector((state) => state.currency.price);
  const { cartItems } = cart;
  const { data: offers, isLoading: offersLoading } = useFetchOffersQuery();
  
  const [updatingItemId, setUpdatingItemId] = useState(null);
  
  const getCurrencySymbol = () => {
    try {
      const formatter = new Intl.NumberFormat('en', {
        style: 'currency',
        currency: currency,
        currencyDisplay: 'symbol',
      });

      const parts = formatter.formatToParts(1);
      const symbol = parts.find(part => part.type === 'currency')?.value;
      return symbol || currency;
    } catch (err) {
      return currency; // fallback if currency code is invalid
    }
  };
  
  const addToCartHandler = (product, qty) => {
    setUpdatingItemId(product._id);
    dispatch(addToCart({ ...product, qty }));
    setTimeout(() => setUpdatingItemId(null), 500);
  };

  const removeFromCartHandler = (id) => {
    dispatch(removeFromCart(id));
  };
  
  const updateQuantity = (item, newQty) => {
    const qty = Math.max(1, Math.min(newQty, item.countInStock));
    addToCartHandler(item, qty);
  };

  const checkoutHandler = () => {
    dispatch(addToCart(cartItems));

    // Dispatch addOffers to ensure offers are updated
    if (offers && offers.length > 0) {
      dispatch(addOffers(offers));
    }
    navigate("/shipping");
  };
  
  const calculateDiscountedPrice = (product, offers) => {
    if (!product || !product.price) return 0;
    if (!offers || offers.length === 0) return product.price * price;

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

    return discountedPrice * price;
  };
  
  const discountprice = (item) => {
    const cal = calculateDiscountedPrice(item, offers);
    return cal;
  };
  
  // Calculate original price
  const calculateOriginalPrice = (item) => {
    return item.price * price;
  };
  
  // Memoize the total items and total price calculations
  const totalItems = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.qty, 0),
    [cartItems]
  );

  const subtotal = useMemo(
    () =>
      cartItems.reduce((acc, item) => acc + item.qty * calculateOriginalPrice(item), 0),
    [cartItems]
  );
  
  const totalDiscount = useMemo(
    () =>
      cartItems.reduce((acc, item) => {
        const originalPrice = calculateOriginalPrice(item);
        const discountedPrice = discountprice(item);
        return acc + (item.qty * (originalPrice - discountedPrice));
      }, 0),
    [cartItems]
  );

  const totalPrice = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.qty * discountprice(item), 0),
    [cartItems]
  );
  
  // Calculate savings
  const totalSavings = subtotal - totalPrice;

  return (
    <DocumentTitle title="Shopping Cart - Nexus Mart" description="Your shopping cart at Nexus Mart">
      <Box sx={{ minHeight: "100vh", bgcolor: theme.palette.background.default, py: { xs: 2, sm: 3, md: 4 } }}>
        <Box sx={{ maxWidth: { xs: '100%', md: 1200 }, mx: "auto", px: { xs: 2, sm: 3 } }}>
          <Paper
            elevation={3}
            sx={{
              p: { xs: 2, sm: 3, md: 4 },
              borderRadius: 4,
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            <Typography 
              variant={isMobile ? "h5" : "h4"} 
              fontWeight="800" 
              sx={{ 
                mb: { xs: 2, sm: 3, md: 4 }, 
                color: theme.palette.text.primary,
                textAlign: { xs: 'center', sm: 'left' }
              }}
            >
              Shopping Cart
            </Typography>
            
            {cartItems.length === 0 ? (
              <Box sx={{ textAlign: "center", py: { xs: 6, sm: 8, md: 10 } }}>
                <Box
                  sx={{
                    width: { xs: 80, sm: 100, md: 120 },
                    height: { xs: 80, sm: 100, md: 120 },
                    borderRadius: '50%',
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3
                  }}
                >
                  <FaTrash style={{ 
                    color: theme.palette.primary.main, 
                    fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
                  }} />
                </Box>
                <Typography 
                  variant={isMobile ? "h6" : "h5"} 
                  color="text.primary" 
                  sx={{ mb: 2, fontWeight: 600 }}
                >
                  Your cart is empty
                </Typography>
                <Typography 
                  variant="body1" 
                  color="text.secondary"
                  sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}
                >
                  Looks like you haven't added any items to your cart yet. Start shopping to find amazing products!
                </Typography>
                <Button
                  component={Link}
                  to="/shop"
                  variant="contained"
                  size={isMobile ? "medium" : "large"}
                  sx={{
                    borderRadius: 3,
                    px: { xs: 3, sm: 5, md: 6 },
                    py: { xs: 1.2, sm: 1.5, md: 1.8 },
                    fontWeight: 600,
                    fontSize: { xs: "1rem", sm: "1.1rem", md: "1.1rem" },
                    background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                    "&:hover": { 
                      background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.secondary.dark} 90%)`,
                      transform: 'translateY(-2px)'
                    },
                    boxShadow: 3,
                    textTransform: "none",
                    transition: 'all 0.3s ease'
                  }}
                >
                  Start Shopping
                </Button>
              </Box>
            ) : (
              <Grid container spacing={{ xs: 3, sm: 4, md: 5 }}>
                {/* Cart Items */}
                <Grid item xs={12} lg={8}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 2, sm: 3 },
                      borderRadius: 3,
                      bgcolor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      boxShadow: 2
                    }}
                  >
                    <Typography 
                      variant="h6" 
                      fontWeight="700" 
                      sx={{ 
                        mb: 3, 
                        color: theme.palette.text.primary,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <span>{cartItems.length}</span>
                      </Box>
                      Cart Items
                    </Typography>
                    
                    <Divider sx={{ mb: 3 }} />
                    
                    {cartItems.map((item) => {
                      const originalPrice = calculateOriginalPrice(item);
                      const discountedPrice = discountprice(item);
                      const hasDiscount = originalPrice > discountedPrice;
                      const savings = (originalPrice - discountedPrice) * item.qty;
                      
                      return (
                        <Box
                          key={item._id}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mb: 3,
                            pb: 3,
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            "&:last-child": { borderBottom: "none", mb: 0, pb: 0 },
                          }}
                        >
                          {/* Product Image */}
                          <Avatar
                            src={item.media?.[0]?.url}
                            alt={item.name}
                            variant="rounded"
                            sx={{
                              width: { xs: 72, sm: 80, md: 90 },
                              height: { xs: 72, sm: 80, md: 90 },
                              borderRadius: 2,
                              mr: { xs: 1.5, sm: 2, md: 3 },
                              boxShadow: 2,
                              border: `1px solid ${theme.palette.divider}`,
                              bgcolor: theme.palette.background.default
                            }}
                          />
                          
                          {/* Product Info */}
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Link
                              to={`/product/${item.product || item.productId || item._id.split('-')[0]}`}
                              style={{
                                color: theme.palette.primary.main,
                                fontWeight: 700,
                                fontSize: { xs: "1rem", sm: "1.1rem" },
                                textDecoration: "none",
                                display: 'block',
                                marginBottom: '4px'
                              }}
                            >
                              <Tooltip title={item.name}>
                                <span>
                                  {item.name.length > 40
                                    ? item.name.substring(0, 40) + "..."
                                    : item.name}
                                </span>
                              </Tooltip>
                            </Link>
                            
                            {/* Variant Information */}
                            {item.variantId && (
                              <Box sx={{ mb: 1 }}>
                                <Typography 
                                  variant="body2" 
                                  color="text.secondary" 
                                  sx={{ mb: 0.5 }}
                                >
                                  {formatVariantAttributes({ 
                                    color: item.selectedOptions?.color,
                                    size: item.selectedOptions?.size,
                                    storage: item.selectedOptions?.storage
                                  })}
                                </Typography>
                                <Chip 
                                  label={`SKU: ${item.sku || getVariantSku(item)}`} 
                                  size="small" 
                                  variant="outlined" 
                                  sx={{ 
                                    height: 20, 
                                    '& .MuiChip-label': { 
                                      px: 0.8, 
                                      fontSize: "0.7rem" 
                                    } 
                                  }} 
                                />
                              </Box>
                            )}
                            
                            <Stack direction="row" spacing={2} sx={{ mt: 1, mb: 1.5 }}>
                              {item.brand?.name && (
                                <Chip
                                  label={item.brand.name}
                                  size="small"
                                  sx={{
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    color: theme.palette.primary.main,
                                    fontWeight: 500,
                                    fontSize: "0.75rem",
                                    height: 20,
                                    '& .MuiChip-label': {
                                      px: 0.8
                                    }
                                  }}
                                />
                              )}
                              <Chip
                                label={item.countInStock > 0 ? "In Stock" : "Out of Stock"}
                                size="small"
                                color={item.countInStock > 0 ? "success" : "error"}
                                sx={{
                                  height: 20,
                                  '& .MuiChip-label': {
                                    px: 0.8,
                                    fontSize: "0.7rem"
                                  }
                                }}
                              />
                            </Stack>
                            
                            {/* Pricing */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography
                                variant="body1"
                                sx={{
                                  color: theme.palette.text.primary,
                                  fontWeight: 700,
                                  fontSize: { xs: "1rem", sm: "1.1rem" }
                                }}
                              >
                                {getCurrencySymbol()}{discountedPrice.toFixed(2)}
                              </Typography>
                              
                              {hasDiscount && (
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: theme.palette.text.secondary,
                                    textDecoration: "line-through"
                                  }}
                                >
                                  {getCurrencySymbol()}{originalPrice.toFixed(2)}
                                </Typography>
                              )}
                              
                              {hasDiscount && (
                                <Chip
                                  label={`Save ${getCurrencySymbol()}${savings.toFixed(2)}`}
                                  size="small"
                                  color="success"
                                  sx={{
                                    height: 20,
                                    '& .MuiChip-label': {
                                      px: 0.8,
                                      fontSize: "0.7rem"
                                    }
                                  }}
                                />
                              )}
                            </Box>
                          </Box>
                          
                          {/* Quantity Controls */}
                          <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center',
                            mx: { xs: 1, sm: 2, md: 3 }
                          }}>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                mb: 1, 
                                color: theme.palette.text.secondary,
                                fontWeight: 500
                              }}
                            >
                              Qty
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <IconButton
                                size="small"
                                onClick={() => updateQuantity(item, item.qty - 1)}
                                disabled={item.qty <= 1 || updatingItemId === item._id}
                                sx={{
                                  width: 32,
                                  height: 32,
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                  color: theme.palette.primary.main,
                                  '&:hover': {
                                    bgcolor: alpha(theme.palette.primary.main, 0.2)
                                  },
                                  '&:disabled': {
                                    bgcolor: alpha(theme.palette.action.disabled, 0.1),
                                    color: theme.palette.action.disabled
                                  }
                                }}
                              >
                                <FaMinus size={12} />
                              </IconButton>
                              
                              {updatingItemId === item._id ? (
                                <Skeleton variant="rectangular" width={32} height={32} sx={{ borderRadius: 1 }} />
                              ) : (
                                <Typography
                                  variant="body1"
                                  sx={{
                                    minWidth: 32,
                                    textAlign: 'center',
                                    fontWeight: 600
                                  }}
                                >
                                  {item.qty}
                                </Typography>
                              )}
                              
                              <IconButton
                                size="small"
                                onClick={() => updateQuantity(item, item.qty + 1)}
                                disabled={item.qty >= item.countInStock || updatingItemId === item._id}
                                sx={{
                                  width: 32,
                                  height: 32,
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                  color: theme.palette.primary.main,
                                  '&:hover': {
                                    bgcolor: alpha(theme.palette.primary.main, 0.2)
                                  },
                                  '&:disabled': {
                                    bgcolor: alpha(theme.palette.action.disabled, 0.1),
                                    color: theme.palette.action.disabled
                                  }
                                }}
                              >
                                <FaPlus size={12} />
                              </IconButton>
                            </Box>
                            
                            {item.countInStock < 10 && item.countInStock > 0 && (
                              <Typography 
                                variant="caption" 
                                color="warning.main"
                                sx={{ mt: 1, textAlign: 'center' }}
                              >
                                Only {item.countInStock} left!
                              </Typography>
                            )}
                          </Box>
                          
                          {/* Remove Button */}
                          <IconButton
                            color="error"
                            onClick={() => removeFromCartHandler(item._id)}
                            sx={{
                              ml: 1,
                              width: 40,
                              height: 40,
                              '&:hover': { 
                                bgcolor: alpha(theme.palette.error.main, 0.1),
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <FaTrash />
                          </IconButton>
                        </Box>
                      );
                    })}
                  </Paper>
                </Grid>
                
                {/* Cart Summary */}
                <Grid item xs={12} lg={4}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 2, sm: 3 },
                      borderRadius: 3,
                      bgcolor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      boxShadow: 2,
                      position: 'sticky',
                      top: { xs: 16, sm: 24, md: 32 }
                    }}
                  >
                    <Typography 
                      variant="h6" 
                      fontWeight="700" 
                      sx={{ 
                        mb: 3, 
                        color: theme.palette.text.primary 
                      }}
                    >
                      Order Summary
                    </Typography>
                    
                    <Divider sx={{ mb: 3 }} />
                    
                    <Stack spacing={2}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body1" color="text.secondary">
                          Subtotal ({totalItems} items)
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {getCurrencySymbol()}{subtotal.toFixed(2)}
                        </Typography>
                      </Stack>
                      
                      {totalDiscount > 0 && (
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body1" color="text.secondary">
                            Discounts
                          </Typography>
                          <Typography variant="body1" color="success.main" fontWeight={500}>
                            -{getCurrencySymbol()}{totalDiscount.toFixed(2)}
                          </Typography>
                        </Stack>
                      )}
                      
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body1" color="text.secondary">
                          Shipping
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          Free
                        </Typography>
                      </Stack>
                      
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body1" color="text.secondary">
                          Tax
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          Calculated at checkout
                        </Typography>
                      </Stack>
                      
                      <Divider sx={{ my: 1 }} />
                      
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="h6" fontWeight="700">
                          Total
                        </Typography>
                        <Typography variant="h6" fontWeight="700" color="primary.main">
                          {getCurrencySymbol()}{totalPrice.toFixed(2)}
                        </Typography>
                      </Stack>
                      
                      {totalSavings > 0 && (
                        <Box sx={{ 
                          bgcolor: alpha(theme.palette.success.main, 0.1), 
                          borderRadius: 2, 
                          p: 1.5, 
                          textAlign: 'center' 
                        }}>
                          <Typography variant="body2" color="success.main" fontWeight={600}>
                            You save {getCurrencySymbol()}{totalSavings.toFixed(2)}!
                          </Typography>
                        </Box>
                      )}
                      
                      <Button
                        variant="contained"
                        size={isMobile ? "medium" : "large"}
                        disabled={cartItems.length === 0}
                        onClick={checkoutHandler}
                        sx={{
                          borderRadius: 3,
                          fontWeight: "bold",
                          px: { xs: 2, sm: 3, md: 4 },
                          py: { xs: 1.2, sm: 1.5, md: 1.8 },
                          fontSize: { xs: "1rem", sm: "1.1rem" },
                          background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                          "&:hover": { 
                            background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.secondary.dark} 90%)`,
                            transform: 'translateY(-2px)',
                            boxShadow: 4
                          },
                          boxShadow: 3,
                          textTransform: "none",
                          transition: 'all 0.3s ease',
                          mt: 2
                        }}
                      >
                        Proceed To Checkout
                      </Button>
                      
                      <Button
                        component={Link}
                        to="/shop"
                        variant="outlined"
                        size={isMobile ? "medium" : "large"}
                        sx={{
                          borderRadius: 3,
                          fontWeight: "600",
                          px: { xs: 2, sm: 3, md: 4 },
                          py: { xs: 1.2, sm: 1.5, md: 1.8 },
                          fontSize: { xs: "1rem", sm: "1.1rem" },
                          borderColor: alpha(theme.palette.primary.main, 0.5),
                          color: theme.palette.primary.main,
                          "&:hover": { 
                            borderColor: theme.palette.primary.main,
                            backgroundColor: alpha(theme.palette.primary.main, 0.05),
                            transform: 'translateY(-2px)'
                          },
                          textTransform: "none",
                          transition: 'all 0.3s ease',
                          mt: 1
                        }}
                      >
                        Continue Shopping
                      </Button>
                    </Stack>
                  </Paper>
                  
                  {/* Secure Checkout Badge */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    mt: 3,
                    p: 1.5,
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                    borderRadius: 2
                  }}>
                    <Typography variant="body2" color="success.main" sx={{ fontWeight: 500 }}>
                      🔒 Secure checkout with 256-bit encryption
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            )}

            {/* Cart Recommendations */}
            {cartItems.length > 0 && (
              <Box sx={{ mt: { xs: 4, sm: 5, md: 6 } }}>
                <CartRecommendations cartItems={cartItems} limit={6} />
              </Box>
            )}
          </Paper>
        </Box>
      </Box>
    </DocumentTitle>
  );
};

export default Cart;