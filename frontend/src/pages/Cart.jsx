import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaTrash } from "react-icons/fa";
import { addToCart, removeFromCart } from "../redux/features/cart/cartSlice";
import { ArrowBack } from "@mui/icons-material";
import {
  Box,
  IconButton,
  Typography,
  Paper,
  Button,
  Grid,
  Avatar,
  Divider,
  Select,
  MenuItem,
  Stack,
  Tooltip,
} from "@mui/material";
import DocumentTitle from "react-document-title";
const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cart = useSelector((state) => state.cart);
  const { cartItems } = cart;

  const addToCartHandler = (product, qty) => {
    dispatch(addToCart({ ...product, qty }));
  };

  const removeFromCartHandler = (id) => {
    dispatch(removeFromCart(id));
  };

  const checkoutHandler = () => {
    navigate("/login?redirect=/shipping");
  };

  return (
    <DocumentTitle title="Shopping Cart - Nexus Mart" description="Your shopping cart at Nexus Mart">
    <Box sx={{ minHeight: "100vh", bgcolor: "#f3e7e9", py: 4 }}>
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <IconButton
            onClick={() => navigate(-1)}
            sx={{
              color: "#6366f1",
              mr: 1,
              border: "1px solid #6366f1",
              borderRadius: 2,
              "&:hover": { bgcolor: "#e3eeff" },
            }}
          >
            <ArrowBack />
          </IconButton>
          <Typography
            variant="body1"
            sx={{
              color: "#6366f1",
              fontWeight: 600,
              cursor: "pointer",
              "&:hover": { textDecoration: "underline" },
            }}
            onClick={() => navigate(-1)}
          >
            Go to Previous Page
          </Typography>
        </Box>
        <Paper
          elevation={6}
          sx={{
            p: { xs: 2, md: 4 },
            borderRadius: 4,
            boxShadow: "0 8px 32px 0 rgba(236,72,153,0.10)",
            background: "linear-gradient(135deg, #fff 70%, #e3eeff 100%)",
          }}
        >
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{ mb: 3, color: "#18181b" }}
          >
            Shopping Cart
          </Typography>
          {cartItems.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ mb: 2 }}
              >
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
                        src={item.image}
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
                            ${item.price}
                          </Typography>
                        </Stack>
                      </Box>
                      <Box sx={{ width: 90, mx: 2 }}>
                        <Select
                          value={item.qty}
                          onChange={(e) =>
                            addToCartHandler(item, Number(e.target.value))
                          }
                          size="small"
                          sx={{
                            bgcolor: "#f9fafb",
                            borderRadius: 2,
                            fontWeight: 600,
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#e3eeff",
                            },
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#ec4899",
                            },
                          }}
                        >
                          {[...Array(item.countInStock).keys()].map((x) => (
                            <MenuItem key={x + 1} value={x + 1}>
                              {x + 1}
                            </MenuItem>
                          ))}
                        </Select>
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
                      Items ({cartItems.reduce((acc, item) => acc + item.qty, 0)})
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      $
                      {cartItems
                        .reduce((acc, item) => acc + item.qty * item.price, 0)
                        .toFixed(2)}
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
        </Paper>
      </Box>
    </Box>
    </DocumentTitle>
  );
};

export default Cart;
