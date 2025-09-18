import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaTrash } from "react-icons/fa";
import { addToCart, removeFromCart ,addOffers} from "../redux/features/cart/cartSlice";

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
} from "@mui/material";
import DocumentTitle from "react-document-title";
import { useMemo } from "react";
import {useFetchOffersQuery} from "../redux/api/offerApiSlice";
import CartRecommendations from "../components/CartRecommendations";


const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);
  const currency = useSelector((state) => state.currency.selectedCurrency);
  const price = useSelector((state) => state.currency.price);
  const { cartItems } = cart;
  const { data: offers, isLoading: offersLoading } = useFetchOffersQuery();
  
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
    dispatch(addToCart({ ...product, qty }));
  };

  const removeFromCartHandler = (id) => {
    dispatch(removeFromCart(id));
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
      if (!product || !product.price) return 0; // Return 0 if product or price is undefined
      if (!offers || offers.length === 0) return product.price * price; // Return original price if no offers

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

      return discountedPrice * price;
  };
  
  
  const discountprice = (item) =>{
    const  cal = calculateDiscountedPrice(item,offers)
    return cal;
  }
  // Memoize the total items and total price calculations
  const totalItems = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.qty, 0),
    [cartItems]
  );

  const totalPrice = useMemo(
    () =>
      cartItems.reduce((acc, item) => acc + item.qty * discountprice(item), 0).toFixed(2),
    [cartItems]
  );

  return (
    <DocumentTitle title="Shopping Cart - Nexus Mart" description="Your shopping cart at Nexus Mart">
      <Box sx={{ minHeight: "100vh", bgcolor: "#f3e7e9", py: 4 }}>
        <Box sx={{ maxWidth: 1200, mx: "auto" }}>
          <Paper
            elevation={6}
            sx={{
              p: { xs: 2, md: 4 },
              borderRadius: 4,
              boxShadow: "0 8px 32px 0 rgba(236,72,153,0.10)",
              background: "linear-gradient(135deg, #fff 70%, #e3eeff 100%)",
            }}
          >
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 3, color: "#18181b" }}>
              Shopping Cart
            </Typography>
            {cartItems.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                  Your cart is empty.
                </Typography>
                <Button
                  component={Link}
                  to="/shop"
                  variant="contained"
                  color="secondary"
                  sx={{
                    borderRadius: 2,
                    px: 4,
                    py: 1.2,
                    fontWeight: 600,
                    fontSize: "1.1rem",
                    background: "#ec4899",
                    "&:hover": { background: "#be185d" },
                    boxShadow: 2,
                    textTransform: "none",
                  }}
                >
                  Go To Shop
                </Button>
              </Box>
            ) : (
              <Grid container spacing={4}>
                {/* Cart Items */}
                <Grid item xs={12} md={8}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      bgcolor: "#fff",
                      boxShadow: "0 2px 12px #ec489933",
                    }}
                  >

                    {cartItems.map((item) => (
                      <Box
                        key={item._id}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 3,
                          pb: 2,
                          borderBottom: "1px solid #e3eeff",
                          "&:last-child": { borderBottom: "none" },
                        }}
                      >
                        <Avatar
                          src={item.media[0].url}
                          alt={item.name}
                          variant="rounded"
                          sx={{
                            width: 72,
                            height: 72,
                            borderRadius: 3,
                            mr: 2,
                            boxShadow: "0 2px 8px #ec489955",
                            border: "2px solid #e3eeff",
                            background: "#fff",
                          }}
                        />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Link
                            to={`/product/${item._id}`}
                            style={{
                              color: "#ec4899",
                              fontWeight: 700,
                              fontSize: "1.1rem",
                              textDecoration: "none",
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
                          <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                color: "#6366f1",
                                fontWeight: 500,
                                letterSpacing: 0.1,
                              }}
                            >
                              {item.brand?.name}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: "#18181b",
                                fontWeight: 700,
                              }}
                            >
                              {getCurrencySymbol()}{discountprice(item).toFixed(2)}
                            </Typography>
                          </Stack>
                        </Box>
                        <Box sx={{ width: 90, mx: 2 }}>
                          <TextField
                            type="number"
                            value={item.qty}
                            onChange={(e) => {
                              const newQty = Math.max(1, Math.min(Number(e.target.value), item.countInStock));
                              addToCartHandler(item, newQty);
                            }}
                            size="small"
                            inputProps={{
                              min: 1,
                              max: item.countInStock,
                              style: { textAlign: "center" },
                            }}
                             sx={{
                              bgcolor: "#f9fafb",
                              borderRadius: 2,
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: "#e3eeff",
                              },
                              "&:hover .MuiOutlinedInput-notchedOutline": {
                                borderColor: "#ec4899",
                              },
                            }}
                          />
                        </Box>
                        <IconButton
                          color="error"
                          onClick={() => removeFromCartHandler(item._id)}
                          sx={{
                            ml: 1,
                            "&:hover": { bgcolor: "#ffe4e6" },
                          }}
                        >
                          <FaTrash />
                        </IconButton>
                      </Box>
                    ))}
                  </Paper>
                </Grid>
                {/* Cart Summary */}
                <Grid item xs={12} md={4}>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      bgcolor: "#fff",
                      boxShadow: "0 2px 12px #ec489933",
                    }}
                  >
                    <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
                      Order Summary
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      sx={{ mb: 1 }}
                    >
                      <Typography variant="body1" color="text.secondary">
                        Items ({totalItems})
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {getCurrencySymbol()}{totalPrice}
                      </Typography>
                    </Stack>
                    <Divider sx={{ my: 2 }} />
                    <Button
                      variant="contained"
                      color="secondary"
                      fullWidth
                      size="large"
                      disabled={cartItems.length === 0}
                      onClick={checkoutHandler}
                      sx={{
                        borderRadius: 3,
                        fontWeight: "bold",
                        px: 4,
                        py: 1.5,
                        fontSize: "1.1rem",
                        background: "#ec4899",
                        "&:hover": { background: "#be185d" },
                        boxShadow: 2,
                        textTransform: "none",
                      }}
                    >
                      Proceed To Checkout
                    </Button>
                  </Paper>
                </Grid>
              </Grid>
            )}

            {/* Cart Recommendations */}
            {cartItems.length > 0 && (
              <CartRecommendations cartItems={cartItems} limit={6} />
            )}
          </Paper>
        </Box>
      </Box>
    </DocumentTitle>
  );
};

export default Cart;