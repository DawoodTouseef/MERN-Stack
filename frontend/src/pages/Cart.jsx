import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as CartIcon,
  ArrowForward as ArrowForwardIcon,
  LocalOffer as OfferIcon,
  VerifiedUser as SecureIcon,
  FavoriteBorder as SaveIcon,
  ShoppingBag as MoveIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as CheckIcon
} from "@mui/icons-material";
import {
  addToCart,
  removeFromCart,
  addOffers,
  saveForLater,
  moveToCart,
  removeFromSaved
} from "../redux/features/cart/cartSlice";

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
import DocumentTitle from "../components/DocumentTitle";
import { useMemo, useState } from "react";
import { useFetchOffersQuery } from "../redux/api/offerApiSlice";
import CartRecommendations from "../components/CartRecommendations";
import { formatVariantAttributes, getVariantSku } from "../Utils/variantUtils";
import { APP_NAME } from "../redux/constants";

const Cart = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);
  const currency = useSelector((state) => state.currency.selectedCurrency);
  const price = useSelector((state) => state.currency.price);
  const { cartItems, savedItems = [] } = cart;
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
      return currency;
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

  const handleSaveForLater = (id) => {
    dispatch(saveForLater(id));
    toast.success("Item saved for later", {
      position: toast.POSITION.BOTTOM_RIGHT,
      autoClose: 2000,
    });
  };

  const handleMoveToCart = (id) => {
    dispatch(moveToCart(id));
    toast.success("Item moved back to cart", {
      position: toast.POSITION.BOTTOM_RIGHT,
      autoClose: 2000,
    });
  };

  const handleRemoveFromSaved = (id) => {
    dispatch(removeFromSaved(id));
  };

  const updateQuantity = (item, newQty) => {
    const qty = Math.max(1, Math.min(newQty, item.countInStock || 99));
    addToCartHandler(item, qty);
  };

  const checkoutHandler = () => {
    if (offers && offers.length > 0) {
      dispatch(addOffers(offers));
    }
    navigate("/shipping");
  };

  const calculateDiscountedPrice = (product, offers) => {
    if (!product || !product.price) return 0;

    // Check if pre-calculated price exists
    if (product.prices && product.prices[currency]) {
      return product.prices[currency];
    }

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

  const discountprice = (item) => calculateDiscountedPrice(item, offers);

  const calculateOriginalPrice = (item) => {
    if (item.prices && item.prices[currency]) {
      return item.prices[currency];
    }
    return item.price * price;
  };

  const totalItems = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.qty, 0),
    [cartItems]
  );

  const subtotal = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.qty * calculateOriginalPrice(item), 0),
    [cartItems, currency, price]
  );

  const totalPrice = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.qty * discountprice(item), 0),
    [cartItems, offers, currency, price]
  );

  const totalDiscount = subtotal - totalPrice;
  const shippingThreshold = 100 * price;
  const isFreeShipping = totalPrice >= shippingThreshold;
  const remainingForFreeShipping = Math.max(0, shippingThreshold - totalPrice);
  const freeShippingProgress = Math.min(100, (totalPrice / shippingThreshold) * 100);

  return (
    <DocumentTitle title={`Shopping Cart - ${APP_NAME}`} description={`Your shopping cart at ${APP_NAME}`}>
      <Box sx={{ minHeight: "100vh", bgcolor: "#f1f5f9", py: { xs: 4, md: 8 } }}>
        <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, md: 4 } }}>

          {/* Free Shipping Progress */}
          {cartItems.length > 0 && (
            <Paper elevation={0} sx={{
              p: 2, mb: 4, borderRadius: 4, bgcolor: '#fff', border: '1px solid #e2e8f0',
              display: 'flex', alignItems: 'center', gap: 2
            }}>
              <Box sx={{
                p: 1.5, borderRadius: 3,
                bgcolor: isFreeShipping ? alpha('#10b981', 0.1) : alpha('#6366f1', 0.1),
                color: isFreeShipping ? '#10b981' : '#6366f1'
              }}>
                {isFreeShipping ? <CheckIcon fontSize="medium" /> : <ShippingIcon fontSize="medium" />}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" fontWeight={800} color="#1e293b">
                  {isFreeShipping ? (
                    "Congratulations! Your order qualifies for FREE Shipping."
                  ) : (
                    `Add ${getCurrencySymbol()}${remainingForFreeShipping.toFixed(2)} more to qualify for FREE Shipping.`
                  )}
                </Typography>
                <Box sx={{ height: 8, width: '100%', bgcolor: '#f1f5f9', borderRadius: 4, mt: 1, overflow: 'hidden' }}>
                  <Box sx={{
                    height: '100%',
                    width: `${freeShippingProgress}%`,
                    bgcolor: isFreeShipping ? '#10b981' : '#6366f1',
                    transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                  }} />
                </Box>
              </Box>
            </Paper>
          )}

          <Typography variant="h3" fontWeight={900} color="#0f172a" sx={{ mb: 5, fontSize: { xs: '2rem', md: '3rem' } }}>
            Your Cart <Typography component="span" variant="h4" fontWeight={400} color="text.secondary">({totalItems} items)</Typography>
          </Typography>

          {cartItems.length === 0 ? (
            <Paper elevation={0} sx={{
              p: { xs: 6, md: 12 }, borderRadius: 8, textAlign: 'center',
              border: '2px dashed #cbd5e1', bgcolor: 'transparent'
            }}>
              <Box sx={{
                width: 120, height: 120, borderRadius: '50%', bgcolor: alpha('#6366f1', 0.05),
                display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 4
              }}>
                <CartIcon sx={{ fontSize: 60, color: '#94a3b8' }} />
              </Box>
              <Typography variant="h4" fontWeight={900} color="#1e293b" sx={{ mb: 2 }}>Cart feels a bit light!</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 5, maxWidth: 400, mx: 'auto' }}>
                Discover amazing deals and the latest products. Your next favorite item is just a click away.
              </Typography>
              <Button
                component={Link}
                to="/shop"
                variant="contained"
                size="large"
                sx={{
                  borderRadius: 4, px: 8, py: 2, fontWeight: 900, textTransform: 'none',
                  fontSize: '1.1rem', bgcolor: '#6366f1', boxShadow: '0 10px 30px rgba(99, 102, 241, 0.3)',
                  '&:hover': { bgcolor: '#4f46e5', transform: 'translateY(-2px)' },
                  transition: 'all 0.3s'
                }}
              >
                Start Shopping
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={6}>
              {/* Items List */}
              <Grid size={{ xs: 12, lg: 8.5 }}>
                <Stack spacing={3}>
                  <Box sx={{ px: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight={800} color="#334155">Items in Cart</Typography>
                    <Typography variant="body2" color="#6366f1" fontWeight={700} sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                      Deselect all items
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 1, opacity: 0.5 }} />
                  {cartItems.map((item) => {
                    const originalPrice = calculateOriginalPrice(item);
                    const discountedPrice = discountprice(item);
                    const hasDiscount = originalPrice > discountedPrice;

                    return (
                      <Paper
                        key={item._id}
                        elevation={0}
                        sx={{
                          p: { xs: 2.5, md: 3.5 }, borderRadius: 6, border: '1px solid #e2e8f0',
                          position: 'relative', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': { boxShadow: '0 20px 40px rgba(0,0,0,0.06)', transform: 'translateY(-4px)', borderColor: alpha('#6366f1', 0.2) }
                        }}
                      >
                        <Grid container spacing={4} alignItems="center">
                          <Grid size={{ xs: 4, sm: 2.5 }}>
                            <Box sx={{ position: 'relative', borderRadius: 4, overflow: 'hidden' }}>
                              <Avatar
                                src={item.media?.[0]?.url || item.images?.[0]}
                                variant="rounded"
                                sx={{ width: '100%', height: 'auto', aspectRatio: '1/1', border: '1px solid #f1f5f9' }}
                              />
                            </Box>
                          </Grid>
                          <Grid size={{ xs: 8, sm: 6.5 }}>
                            <Stack spacing={1}>
                              <Link to={`/product/${item.product || item.productId || item._id.split('-')[0]}`} style={{ textDecoration: 'none' }}>
                                <Typography variant="h6" fontWeight={900} color="#1e293b" sx={{
                                  lineHeight: 1.2, mb: 1, transition: 'color 0.2s',
                                  '&:hover': { color: '#6366f1' },
                                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                                }}>
                                  {item.name}
                                </Typography>
                              </Link>

                              {item.variantId && (
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                  {item.selectedOptions?.map((opt, i) => (
                                    <Chip key={opt.key} label={`${opt.name}: ${opt.value}`} size="small" variant="outlined" sx={{ borderRadius: 1.5, fontWeight: 600, fontSize: '0.7rem' }} />
                                  ))}
                                </Box>
                              )}

                              <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
                                <Typography variant="body2" color={item.countInStock > 0 ? "#10b981" : "#ef4444"} fontWeight={800}>
                                  {item.countInStock > 0 ? "In Stock" : "Temporarily Out of Stock"}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">| Eligible for FREE Shipping</Typography>
                              </Stack>

                              <Stack direction="row" spacing={3} alignItems="center" sx={{ mt: 2 }}>
                                <Stack direction="row" alignItems="center" sx={{ bgcolor: '#f8fafc', borderRadius: 3, border: '1px solid #e2e8f0', p: 0.5 }}>
                                  <IconButton size="small" onClick={() => updateQuantity(item, item.qty - 1)} disabled={item.qty <= 1}>
                                    <RemoveIcon fontSize="small" />
                                  </IconButton>
                                  <TextField
                                    value={item.qty}
                                    size="small"
                                    variant="standard"
                                    InputProps={{ disableUnderline: true }}
                                    sx={{ width: 40, '& input': { textAlign: 'center', fontWeight: 900, fontSize: '0.9rem' } }}
                                  />
                                  <IconButton size="small" onClick={() => updateQuantity(item, item.qty + 1)} disabled={item.qty >= (item.countInStock || 99)}>
                                    <AddIcon fontSize="small" />
                                  </IconButton>
                                </Stack>

                                <Divider orientation="vertical" flexItem sx={{ height: 24, alignSelf: 'center' }} />

                                <Button
                                  startIcon={<DeleteIcon />}
                                  color="error"
                                  size="small"
                                  onClick={() => removeFromCartHandler(item._id)}
                                  sx={{ fontWeight: 800, textTransform: 'none', '&:hover': { bgcolor: alpha('#ef4444', 0.05) } }}
                                >
                                  Delete
                                </Button>

                                <Button
                                  startIcon={<SaveIcon />}
                                  color="primary"
                                  size="small"
                                  onClick={() => handleSaveForLater(item._id)}
                                  sx={{ fontWeight: 800, textTransform: 'none', '&:hover': { bgcolor: alpha('#6366f1', 0.05) } }}
                                >
                                  Save for later
                                </Button>
                              </Stack>
                            </Stack>
                          </Grid>
                          <Grid size={{ xs: 12, sm: 3 }} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                            <Stack spacing={0.5}>
                              <Typography variant="h5" fontWeight={1000} color="#1e293b">
                                {getCurrencySymbol()}{discountedPrice.toFixed(2)}
                              </Typography>
                              {hasDiscount && (
                                <Stack direction="row" spacing={1} justifyContent={{ xs: 'flex-start', sm: 'flex-right' }} alignItems="center">
                                  <Typography variant="body2" color="error.main" fontWeight={800} sx={{ bgcolor: alpha('#ef4444', 0.1), px: 1, borderRadius: 1 }}>
                                    Save {Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)}%
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                                    {getCurrencySymbol()}{originalPrice.toFixed(2)}
                                  </Typography>
                                </Stack>
                              )}
                            </Stack>
                          </Grid>
                        </Grid>
                      </Paper>
                    );
                  })}
                </Stack>

                {/* Save for Later Section */}
                {savedItems.length > 0 && (
                  <Box sx={{ mt: 8 }}>
                    <Typography variant="h5" fontWeight={900} color="#1e293b" sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <SaveIcon color="primary" /> Saved for Later <Typography component="span" fontWeight={500} color="text.secondary">({savedItems.length} items)</Typography>
                    </Typography>
                    <Grid container spacing={3}>
                      {savedItems.map((item) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item._id}>
                          <Paper elevation={0} sx={{ p: 2, borderRadius: 5, border: '1px solid #e2e8f0', transition: 'all 0.3s', '&:hover': { boxShadow: 4, borderColor: '#6366f1' } }}>
                            <Box sx={{ position: 'relative', borderRadius: 3, overflow: 'hidden', mb: 2 }}>
                              <Avatar src={item.media?.[0]?.url || item.images?.[0]} variant="rounded" sx={{ width: '100%', height: 'auto', aspectRatio: '1/1' }} />
                            </Box>
                            <Typography variant="subtitle1" fontWeight={800} noWrap sx={{ mb: 1 }}>{item.name}</Typography>
                            <Typography variant="h6" fontWeight={900} color="#6366f1" sx={{ mb: 2 }}>{getCurrencySymbol()}{calculateOriginalPrice(item).toFixed(2)}</Typography>
                            <Stack spacing={1}>
                              <Button
                                fullWidth variant="contained" size="small"
                                startIcon={<MoveIcon />}
                                onClick={() => handleMoveToCart(item._id)}
                                sx={{ borderRadius: 2, fontWeight: 800, textTransform: 'none', bgcolor: '#6366f1' }}
                              >
                                Move to Cart
                              </Button>
                              <Button
                                fullWidth variant="outlined" size="small"
                                color="error"
                                onClick={() => handleRemoveFromSaved(item._id)}
                                sx={{ borderRadius: 2, fontWeight: 800, textTransform: 'none' }}
                              >
                                Delete
                              </Button>
                            </Stack>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </Grid>

              {/* Summary Section */}
              <Grid size={{ xs: 12, lg: 3.5 }}>
                <Paper elevation={0} sx={{
                  p: 4.5, borderRadius: 8, border: '1px solid #e2e8f0', bgcolor: '#fff',
                  position: 'sticky', top: 32, boxShadow: '0 30px 60px rgba(0,0,0,0.05)'
                }}>
                  <Typography variant="h5" fontWeight={900} sx={{ mb: 4, color: '#0f172a' }}>Price Details</Typography>

                  <Stack spacing={3} sx={{ mb: 5 }}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body1" color="text.secondary" fontWeight={500}>Price ({totalItems} items)</Typography>
                      <Typography variant="body1" fontWeight={700} color="#1e293b">{getCurrencySymbol()}{subtotal.toFixed(2)}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body1" color="text.secondary" fontWeight={500}>Discount</Typography>
                      <Typography variant="body1" fontWeight={800} color="#10b981">-{getCurrencySymbol()}{totalDiscount.toFixed(2)}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body1" color="text.secondary" fontWeight={500}>Estimated Tax (15%)</Typography>
                      <Typography variant="body1" fontWeight={700} color="#1e293b">{getCurrencySymbol()}{(totalPrice * 0.15).toFixed(2)}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body1" color="text.secondary" fontWeight={500}>Delivery Charges</Typography>
                      <Typography variant="body1" fontWeight={800} color="#10b981">{isFreeShipping ? "FREE" : `${getCurrencySymbol()}${(10 * price).toFixed(2)}`}</Typography>
                    </Stack>
                    <Divider sx={{ borderStyle: 'dashed', opacity: 0.6 }} />
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="h5" fontWeight={1000}>Total Amount</Typography>
                      <Typography variant="h5" fontWeight={1000} color="#6366f1">{getCurrencySymbol()}{(totalPrice * 1.15 + (isFreeShipping ? 0 : 10 * price)).toFixed(2)}</Typography>
                    </Stack>
                  </Stack>

                  <Box sx={{ mb: 4, p: 2, borderRadius: 3, bgcolor: alpha('#10b981', 0.05), border: '1px solid', borderColor: alpha('#10b981', 0.1) }}>
                    <Typography variant="body2" color="#047857" fontWeight={800} align="center">
                      You will save {getCurrencySymbol()}{totalDiscount.toFixed(2)} on this order
                    </Typography>
                  </Box>

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={checkoutHandler}
                    sx={{
                      borderRadius: 4, py: 2.5, fontWeight: 900, textTransform: 'none',
                      fontSize: '1.1rem', bgcolor: '#6366f1', boxShadow: '0 12px 30px rgba(99, 102, 241, 0.3)',
                      mb: 3, '&:hover': { bgcolor: '#4f46e5', transform: 'translateY(-2px)' }, transition: 'all 0.3s'
                    }}
                  >
                    Proceed to Checkout
                  </Button>

                  <Stack spacing={2}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <SecureIcon color="success" sx={{ fontSize: 20 }} />
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>Safe and Secure Payments</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <OfferIcon sx={{ fontSize: 20, color: '#f59e0b' }} />
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>100% Authentic Products</Typography>
                    </Stack>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          )}

          {cartItems.length > 0 && (
            <Box sx={{ mt: 10 }}>
              <CartRecommendations cartItems={cartItems} limit={6} />
            </Box>
          )}
        </Box>
      </Box>
    </DocumentTitle>
  );
};

export default Cart;
