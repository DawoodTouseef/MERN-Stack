import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as CartIcon,
  ArrowForward as ArrowForwardIcon,
  LocalOffer as OfferIcon,
  VerifiedUser as SecureIcon
} from "@mui/icons-material";
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
    <DocumentTitle title={`Shopping Cart - ${APP_NAME}`} description={`Your shopping cart at ${APP_NAME}`}>
      <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", py: 6 }}>
        <Box sx={{ maxWidth: 1200, mx: "auto", px: 3 }}>
          <Typography variant="h4" fontWeight={900} color="#1e293b" sx={{ mb: 4 }}>
            Shopping Cart
          </Typography>

          {cartItems.length === 0 ? (
            <Paper elevation={0} sx={{ p: 8, borderRadius: 5, border: '1px dashed #cbd5e1', bgcolor: 'transparent', textAlign: 'center' }}>
              <CartIcon sx={{ fontSize: 80, color: '#e2e8f0', mb: 3 }} />
              <Typography variant="h5" fontWeight={800} color="#1e293b" sx={{ mb: 1 }}>Your cart is empty</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>Time to fill it with some amazing products!</Typography>
              <Button
                component={Link}
                to="/shop"
                variant="contained"
                size="large"
                sx={{
                  borderRadius: 3,
                  px: 6,
                  py: 1.5,
                  fontWeight: 800,
                  textTransform: 'none',
                  bgcolor: '#6366f1',
                  '&:hover': { bgcolor: '#4f46e5' }
                }}
              >
                Go to Shop
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={4}>
              {/* Cart Items List */}
              <Grid item xs={12} lg={8}>
                <Stack spacing={2}>
                  {cartItems.map((item) => {
                    const originalPrice = calculateOriginalPrice(item);
                    const discountedPrice = discountprice(item);
                    const hasDiscount = originalPrice > discountedPrice;

                    return (
                      <Paper
                        key={item._id}
                        elevation={0}
                        sx={{
                          p: 2.5,
                          borderRadius: 4,
                          border: '1px solid #e2e8f0',
                          transition: 'all 0.2s',
                          '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }
                        }}
                      >
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={3} sm={2}>
                            <Avatar
                              src={item.media?.[0]?.url}
                              variant="rounded"
                              sx={{ width: '100%', height: 'auto', aspectRatio: '1/1', borderRadius: 2, border: '1px solid #f1f5f9' }}
                            />
                          </Grid>
                          <Grid item xs={9} sm={5}>
                            <Link to={`/product/${item.product || item.productId || item._id.split('-')[0]}`} style={{ textDecoration: 'none' }}>
                              <Typography variant="subtitle1" fontWeight={800} color="#1e293b" sx={{ mb: 0.5, '&:hover': { color: '#6366f1' } }}>
                                {item.name}
                              </Typography>
                            </Link>
                            {item.variantId && (
                              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                                {formatVariantAttributes(item.selectedOptions)}
                              </Typography>
                            )}
                            <Stack direction="row" spacing={1}>
                              <Chip
                                label={item.countInStock > 0 ? "In Stock" : "Out of Stock"}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: '0.65rem',
                                  fontWeight: 800,
                                  bgcolor: item.countInStock > 0 ? alpha('#10b981', 0.1) : alpha('#ef4444', 0.1),
                                  color: item.countInStock > 0 ? '#10b981' : '#ef4444'
                                }}
                              />
                            </Stack>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ bgcolor: '#f8fafc', borderRadius: 2, px: 1, py: 0.5, width: 'fit-content' }}>
                              <IconButton size="small" onClick={() => updateQuantity(item, item.qty - 1)} disabled={item.qty <= 1}>
                                <RemoveIcon fontSize="small" />
                              </IconButton>
                              <Typography variant="body2" fontWeight={800} sx={{ minWidth: 24, textAlign: 'center' }}>{item.qty}</Typography>
                              <IconButton size="small" onClick={() => updateQuantity(item, item.qty + 1)} disabled={item.qty >= item.countInStock}>
                                <AddIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </Grid>
                          <Grid item xs={6} sm={2} sx={{ textAlign: 'right' }}>
                            <Box>
                              <Typography variant="subtitle1" fontWeight={900} color="#1e293b">
                                {getCurrencySymbol()}{discountedPrice.toFixed(2)}
                              </Typography>
                              {hasDiscount && (
                                <Typography variant="caption" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                                  {getCurrencySymbol()}{originalPrice.toFixed(2)}
                                </Typography>
                              )}
                            </Box>
                            <IconButton color="error" size="small" onClick={() => removeFromCartHandler(item._id)} sx={{ mt: 1 }}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Grid>
                        </Grid>
                      </Paper>
                    );
                  })}
                </Stack>
              </Grid>

              {/* Summary Section */}
              <Grid item xs={12} lg={4}>
                <Paper elevation={0} sx={{ p: 4, borderRadius: 5, border: '1px solid #e2e8f0', bgcolor: '#fff', position: 'sticky', top: 20 }}>
                  <Typography variant="h6" fontWeight={800} sx={{ mb: 3, color: '#1e293b' }}>Order Summary</Typography>
                  <Stack spacing={2} sx={{ mb: 4 }}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Subtotal ({totalItems} items)</Typography>
                      <Typography variant="body2" fontWeight={700}>{getCurrencySymbol()}{subtotal.toFixed(2)}</Typography>
                    </Stack>
                    {totalDiscount > 0 && (
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">Discount</Typography>
                        <Typography variant="body2" fontWeight={700} color="#10b981">-{getCurrencySymbol()}{totalDiscount.toFixed(2)}</Typography>
                      </Stack>
                    )}
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Shipping</Typography>
                      <Typography variant="body2" fontWeight={700} color="#10b981">FREE</Typography>
                    </Stack>
                    <Divider />
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="h6" fontWeight={900}>Total</Typography>
                      <Typography variant="h6" fontWeight={900} color="#6366f1">{getCurrencySymbol()}{totalPrice.toFixed(2)}</Typography>
                    </Stack>
                  </Stack>

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={checkoutHandler}
                    sx={{
                      borderRadius: 3,
                      py: 2,
                      fontWeight: 800,
                      textTransform: 'none',
                      bgcolor: '#6366f1',
                      '&:hover': { bgcolor: '#4f46e5' },
                      boxShadow: '0 8px 20px rgba(99, 102, 241, 0.2)',
                      mb: 2
                    }}
                  >
                    Proceed to Checkout
                  </Button>
                  <Button
                    fullWidth
                    component={Link}
                    to="/shop"
                    variant="outlined"
                    sx={{ borderRadius: 3, py: 1.5, fontWeight: 700, textTransform: 'none', borderColor: '#e2e8f0', color: '#475569' }}
                  >
                    Continue Shopping
                  </Button>

                  <Box sx={{ mt: 4, p: 2, borderRadius: 3, bgcolor: '#f8fafc', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <SecureIcon color="success" fontSize="small" />
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Secure 256-bit SSL Encrypted Checkout
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}

          {cartItems.length > 0 && (
            <Box sx={{ mt: 8 }}>
              <CartRecommendations cartItems={cartItems} limit={6} />
            </Box>
          )}
        </Box>
      </Box>
    </DocumentTitle>
  );
};

export default Cart;
