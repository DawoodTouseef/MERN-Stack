import { Link } from "react-router-dom";
import { Box, Typography, Chip, Stack, Button, Tooltip } from "@mui/material";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/features/cart/cartSlice";
import { toast } from "react-toastify";

const FlashSaleProductCard = ({ product, offers }) => {
  const dispatch = useDispatch();
  const [hovered, setHovered] = useState(false);

  const calculateDiscountedPrice = (product, offers) => {
  let discountedPrice = product.price;
  
  // Iterate through all offers to find applicable discounts
  offers.forEach((offer) => {
    //console.log(offer.categories.some((p)=>(p._id ===product.category)))
    const isProductInOffer =
      offer.products.some((p) => p._id === product._id) ||
      offer.categories.some((c) => c._id === product.category) ||
      (offer.brand.some((b)=>(b._id === product.brand)));
    
    if (isProductInOffer) {
      if (offer.discountUnit === "percent") {
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
  // Calculate the discounted price for the product
  const discountedPrice = calculateDiscountedPrice(product, offers);

  const addToCartHandler = () => {
    dispatch(addToCart({ ...product, qty: 1 }));
    toast.success("Item added to cart", {
      position: toast.POSITION.TOP_RIGHT,
      autoClose: 2000,
    });
  };

  return (
    <Box
      sx={{
        maxWidth: 320,
        minHeight: 400,
        bgcolor: "#fff",
        borderRadius: 4,
        boxShadow: hovered ? 8 : 2,
        overflow: "hidden",
        transform: hovered ? "scale(1.02)" : "scale(1)",
        transition: "transform 0.25s, box-shadow 0.25s",
        border: hovered ? "2px solid #ec4899" : "2px solid transparent",
        position: "relative",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Product Image */}
      <Box sx={{ position: "relative" }}>
        <Link to={`/product/${product._id}`}>
          <img
            src={product.media?.[0]?.url || "fallback-image-url.jpg"}
            alt={product.name}
            style={{
              width: "100%",
              height: 220,
              objectFit: "cover",
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              filter: hovered ? "brightness(0.9) blur(0.4px)" : "none",
              transition: "filter 0.3s",
            }}
          />
        </Link>
        {discountedPrice < product.price && (
          <Chip
            label={`${
              ((product.price - discountedPrice) / product.price) * 100
            }% OFF`}
            size="small"
            sx={{
              position: "absolute",
              top: 12,
              left: 12,
              bgcolor: "#ffe0b2",
              color: "#e65100",
              fontWeight: 700,
              fontSize: "0.8rem",
              borderRadius: "999px",
            }}
          />
        )}
        {product.countInStock === 0 && (
          <Chip
            label="Out of Stock"
            color="error"
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
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

      {/* Product Details */}
      <Box sx={{ p: 3 }}>
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{
            color: "#18181b",
            letterSpacing: 0.5,
            mb: 1,
            textOverflow: "ellipsis",
            overflow: "hidden",
            whiteSpace: "nowrap",
          }}
        >
          {product.name}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "#555",
            mb: 2,
            textOverflow: "ellipsis",
            overflow: "hidden",
            whiteSpace: "nowrap",
          }}
        >
          {product.description}
        </Typography>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{ color: "#e65100", letterSpacing: 0.5 }}
          >
            ${discountedPrice.toFixed(2)}
          </Typography>
          {discountedPrice < product.price && (
            <Typography
              variant="body2"
              sx={{
                color: "#999",
                textDecoration: "line-through",
              }}
            >
              ${product.price.toFixed(2)}
            </Typography>
          )}
        </Stack>
        <Tooltip title="Add to Cart">
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            onClick={addToCartHandler}
            disabled={product.countInStock === 0}
          >
            {product.countInStock === 0 ? "Out of Stock" : "Add to Cart"}
          </Button>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default FlashSaleProductCard;