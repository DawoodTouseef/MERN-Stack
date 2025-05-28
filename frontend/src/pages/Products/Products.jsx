import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  useGetProductDetailsQuery,
  useCreateReviewMutation,
} from "../../redux/api/productApiSlice";
import Rating from "./Rating";
import Loader from "../../components/Loader";
import Message from "../../components/Message";
import { addToCart } from "../../redux/features/cart/cartSlice";
import {
  FaBox,
  FaClock,
  FaShoppingCart,
  FaStar,
  FaStore,
} from "react-icons/fa";
import moment from "moment";
import ProductTabs from "./Tabs";
import HeartIcon from "./HeartIcon";
import {
  Box,
  Grid,
  Typography,
  Paper,
  Button,
  Rating as MuiRating,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Chip,
  Stack,
} from "@mui/material";

const Product = () => {
  const { id: productId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const {
    data: product,
    isLoading,
    refetch,
    error,
  } = useGetProductDetailsQuery(productId);

  const { userInfo } = useSelector((state) => state.auth);

  const [createReview, { isLoading: loadingProductReview }] =
    useCreateReviewMutation();

  const addToCartHandler = () => {
    dispatch(addToCart({ ...product, qty }));
    toast.success("Added to cart!", { autoClose: 1800 });
    navigate("/cart");
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      await createReview({
        productId,
        rating,
        comment,
      }).unwrap();
      refetch();
      toast.success("Review created successfully");
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", py: 4, bgcolor: "#f3e7e9" }}>
      <Box sx={{ maxWidth: "1400px", mx: "auto" }}>
        <Link
          className="text-white font-semibold hover:underline"
          style={{ marginLeft: "2rem" }}
          to="/"
        >
          Go Back
        </Link>
        {isLoading ? (
          <Loader />
        ) : error ? (
          <Message variant="danger">
            {error?.data?.message || error.error}
          </Message>
        ) : (
          <Paper
            elevation={6}
            sx={{
              p: { xs: 2, md: 4 },
              borderRadius: 4,
              boxShadow: "0 8px 32px 0 rgba(236,72,153,0.10)",
              background: "linear-gradient(135deg, #fff 70%, #e3eeff 100%)",
              mt: 4,
            }}
          >
            <Grid container spacing={4}>
              {/* Product Image & Thumbnails */}
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
                    <img
                      src={product.image}
                      alt={product.name}
                      style={{
                        width: "100%",
                        maxWidth: 340,
                        maxHeight: 400,
                        objectFit: "contain",
                        marginBottom: 16,
                        borderRadius: 12,
                        border: "1.5px solid #f3e7e9",
                        background: "#f8fafc",
                        boxShadow: "0 4px 24px #ec489955",
                        transition: "transform 0.3s",
                      }}
                    />
                    <Box sx={{ position: "absolute", top: 14, right: 14 }}>
                      <HeartIcon product={product} />
                    </Box>
                    {product.countInStock === 0 && (
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
                  {product.images && product.images.length > 1 && (
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
                      {product.images.slice(1, 4).map((img, idx) => (
                        <img
                          src={img}
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
                    <MuiRating
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
                      label={product.countInStock > 0 ? "In Stock" : "Out of Stock"}
                      color={product.countInStock > 0 ? "success" : "error"}
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
                    <FaStore className="mr-2 text-pink-500" /> Brand: <b>{product.brand}</b>
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    <strong>About this item:</strong>
                    <br />
                    {product.description}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      <FaClock style={{ marginRight: 4 }} />
                      Added: {moment(product.createdAt).fromNow()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <FaBox style={{ marginRight: 4 }} />
                      In Stock: {product.countInStock}
                    </Typography>
                  </Stack>
                  <Typography
                    variant="h4"
                    color="primary"
                    fontWeight="bold"
                    sx={{
                      mb: 2,
                      letterSpacing: 1,
                      textShadow: "1px 1px 8px #e3eeff",
                    }}
                  >
                    ${product.price}
                  </Typography>
                </Paper>
              </Grid>

              {/* Buy/Cart Section */}
              <Grid item xs={12} md={3} lg={3}>
                <Paper
                  elevation={4}
                  sx={{
                    p: 3,
                    bgcolor: "#fff",
                    borderRadius: 3,
                    boxShadow: "0 2px 12px #ec489933",
                  }}
                >
                  <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
                    Buy Now
                  </Typography>
                  <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
                    ${product.price}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {product.countInStock > 0 ? (
                      <span style={{ color: "#22c55e" }}>In Stock</span>
                    ) : (
                      <span style={{ color: "#ef4444" }}>Out of Stock</span>
                    )}
                  </Typography>
                  {product.countInStock > 0 && (
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel id="qty-label">Quantity</InputLabel>
                      <Select
                        labelId="qty-label"
                        value={qty}
                        label="Quantity"
                        onChange={(e) => setQty(Number(e.target.value))}
                        sx={{ bgcolor: "#f5f5f5", borderRadius: 2 }}
                      >
                        {[...Array(product.countInStock).keys()].map((x) => (
                          <MenuItem key={x + 1} value={x + 1}>
                            {x + 1}
                          </MenuItem>
                        ))}
                      </Select>
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
                    disabled={product.countInStock === 0}
                    onClick={addToCartHandler}
                  >
                    <FaShoppingCart style={{ marginRight: 8 }} />
                    Add To Cart
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    fullWidth
                    size="large"
                    sx={{
                      borderRadius: 2,
                      fontWeight: "bold",
                      textTransform: "none",
                      fontSize: "1.1rem",
                      py: 1.2,
                      borderColor: "#6366f1",
                      color: "#6366f1",
                      "&:hover": {
                        bgcolor: "#6366f1",
                        color: "#fff",
                        borderColor: "#6366f1",
                      },
                      boxShadow: 1,
                      mt: 1,
                    }}
                    disabled={product.countInStock === 0}
                    onClick={addToCartHandler}
                  >
                    Buy Now
                  </Button>
                </Paper>
              </Grid>

              {/* Product Tabs & Reviews */}
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
                    Customer Reviews
                  </Typography>
                  <ProductTabs
                    loadingProductReview={loadingProductReview}
                    userInfo={userInfo}
                    submitHandler={submitHandler}
                    rating={rating}
                    setRating={setRating}
                    comment={comment}
                    setComment={setComment}
                    product={product}
                  />
                  <Divider sx={{ my: 2 }} />
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default Product;
