import { useState,useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  useGetProductDetailsQuery,
  useCreateReviewMutation,
} from "../../redux/api/productApiSlice";
import Loader from "../../components/Loader";
import Message from "../../components/Message";
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

} from "@mui/material";
import { FaShoppingCart } from "react-icons/fa";
import {useFetchOffersQuery} from "../../redux/api/offerApiSlice"
import HeartIcon from "./HeartIcon";
import ProductTabs from "./ProductTabs";
import SimilarProducts from "../../components/SimilarProducts";
import { addToCart } from "../../redux/features/cart/cartSlice";
import DocumentTitle from "react-document-title";

const ProductDetails = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [qty, setQty] = useState(1);
  const [variant, setVariant] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const { data: product, isLoading, refetch, error } = useGetProductDetailsQuery(productId);
  const { data: offers, isLoading: offersLoading } = useFetchOffersQuery();
  
  const [offerpercent, setofferpercent] = useState({
      percentage:"",
      end:""
    })
    
  const { userInfo } = useSelector((state) => state.auth);
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
  const currency = useSelector((state) => state.currency.selectedCurrency);
  const price = useSelector((state) => state.currency.price);
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

  const addToCartHandler = () => {
    dispatch(addToCart({ ...product, qty, variant }));
    toast.success("Added to cart!", { autoClose: 1800 });
    navigate("/cart");
  };
  const addToShippingHandler = () => {
    
    dispatch(addToCart({ ...product, qty, variant }));
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
  let  discountedPrice = calculateDiscountedPrice(product, offers).toFixed(2);
  
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
                        image={product.media?.[0]?.url || "/placeholder.png"}
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
                    {product.media && product.media.length > 1 && (
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
                        {product.media.slice(1, 4).map((media, idx) => (
                          <img
                            src={media.url}
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
                      Brand: <b>{product.brand?.name}</b>
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      <strong>About this item:</strong>
                      <br />
                      {product.description}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
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
                      {getCurrencySymbol()} {discountedPrice}
                    </Typography>
                    {product.discount?.percentage > 0 && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#ef4444",
                          fontWeight: 500,
                          textDecoration: "line-through",
                        }}
                      >
                        Original Price: {getCurrencySymbol()}{product.price*price}
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
                      <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
                        {getCurrencySymbol()}{discountedPrice}
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
                        onClick={addToShippingHandler}
                      >
                        <FaShoppingCart style={{ marginRight: 8 }} />
                        Buy Now
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Product Specifications */}
                {product.specifications &&(
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