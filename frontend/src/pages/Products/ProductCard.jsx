import { Link } from "react-router-dom";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/features/cart/cartSlice";
import { toast } from "react-toastify";
import HeartIcon from "./HeartIcon";
import {
  Box,
  Button,
  IconButton,
  Chip,
  Tooltip,
  Stack,
  Typography,
  Fade,
  Rating,
  Avatar
} from "@mui/material";
import { useState,useEffect } from "react";
import { useSelector } from "react-redux";
import {useFetchOffersQuery} from "../../redux/api/offerApiSlice";


const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const [hovered, setHovered] = useState(false);
  const currency = useSelector((state) => state.currency.selectedCurrency);
  const price = useSelector((state) => state.currency.price);
  const { data: offers, isLoading: offersLoading } = useFetchOffersQuery();
  
  const [offerpercent, setofferpercent] = useState({
      percentage:"",
      end:"",
      type:""
    })
    
  useEffect(() => {
  if (offers) {
    offers.forEach((offer) => {
        const isProductInOffer =
          offer.products.some((p) => p._id === product._id) ||
          offer.categories.some((c) => c._id === product.category) ||
          (offer.brand && offer.brand._id === product.brand);
        if (isProductInOffer && offer.discountUnit === "percent") {
          setofferpercent({
            percentage: offer.discountValue,
            end: offer.endTime,
            type:offer.discountUnit
          });
        }
      
    });
  }
}, [offers, product]);
  
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
    toast.success("Item added to cart", {
      position: toast.POSITION.TOP_RIGHT,
      autoClose: 2000,
    });
  };

  const hasDiscount = offerpercent.end !== Date();
  
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
    <Fade in timeout={500}>
      <Box
        sx={{
          maxWidth: 360,
          minHeight: 460,
          bgcolor: "#1e1e20",
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
        
        <Box sx={{ position: "relative" }}>
          <Link to={`/product/${product._id}`}>
            <img
              src={product.media[0].url || "fallback-image-url.jpg"}
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
            {product.media?.length > 1 && (
              <Stack direction="row" spacing={0.5} sx={{ position: "absolute", bottom: 12, left: 12 }}>
                {product.media.slice(1, 4).map((m, i) => (
                  m.type === "image" && (
                    <Avatar key={i} src={m.url} sx={{ width: 32, height: 32 }} variant="rounded" />
                  )
                ))}
              </Stack>
            )}
            
            {hasDiscount && offerpercent.type==="flat" && (
              <Chip
                label={`${offerpercent.percentage}% OFF`}
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
            <Chip
              label={product.brand?.name}
              size="small"
              sx={{
                position: "absolute",
                bottom: 12,
                right: 12,
                bgcolor: "#fce7f3",
                color: "#ec4899",
                fontWeight: 600,
                fontSize: "0.85rem",
                borderRadius: "999px",
              }}
            />
            {offerpercent.percentage > 0 && (
            <Chip
              label={`-${offerpercent.percentage}%`}
              color="success"
              sx={{
                position: "absolute",
                top: 50,
                left: 10,
                fontWeight: 600,
                fontSize: "0.95rem",
                borderRadius: "999px",
              }}
            />
          )}

            
          </Link>
          <Box sx={{ position: "absolute", top: 12, right: 12 }}>
            <HeartIcon product={product} />
          </Box>
        </Box>

        <Box sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Tooltip title={product.name}>
              <Typography
                variant="h6"
                sx={{
                  color: "#fff",
                  fontWeight: 700,
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  maxWidth: 180,
                  "&:hover": { color: "#ec4899" },
                }}
                component={Link}
                to={`/product/${product._id}`}
              >
                {product.name.length > 22 ? `${product.name.slice(0, 22)}...` : product.name}
              </Typography>
            </Tooltip>
            <Chip
              label={getCurrencySymbol()+discountedPrice.toLocaleString("en-US", { style: "currency", currency: currency })}
              sx={{
                bgcolor: "#f8bbd0",
                color: "#880e4f",
                fontWeight: 600,
                borderRadius: "999px",
              }}
            />
          </Stack>

          {product.rating > 0 && (
            <Stack direction="row" alignItems="center" spacing={0.5} mt={1}>
              <Rating value={product.rating} precision={0.1} readOnly size="small" />
              <Typography variant="caption" color="#ccc">
                ({product.numReviews})
              </Typography>
            </Stack>
          )}

          <Typography variant="body2" color="#cfcfcf" mt={1} mb={1.5}>
            {product.description?.substring(0, 60)}...
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip
              label={product.category?.name || "Uncategorized"}
              size="small"
              sx={{ bgcolor: "#ffe082", color: "#ff6f00", fontWeight: 500 }}
            />
            <Chip
              label={`Stock: ${product.countInStock}`}
              size="small"
              sx={{ bgcolor: "#c8e6c9", color: "#388e3c", fontWeight: 500 }}
            />
            {product.warrantyPeriod && (
              <Chip
                label={`Warranty: ${product.warrantyPeriod}`}
                size="small"
                sx={{ bgcolor: "#e0f7fa", color: "#00796b" }}
              />
            )}
          </Stack>

          {product.tags?.length > 0 && (
            <Stack direction="row" spacing={0.5} mt={1}>
              {product.tags.slice(0, 3).map((tag, idx) => (
                <Chip
                  key={idx}
                  label={tag}
                  size="small"
                  sx={{ bgcolor: "#e0f2f1", color: "#00695c", fontWeight: 500 }}
                />
              ))}
            </Stack>
          )}

          <Stack direction="row" justifyContent="space-between" alignItems="center" mt={2}>
            <Button
              component={Link}
              to={`/product/${product._id}`}
              variant="contained"
              sx={{
                textTransform: "none",
                fontWeight: 500,
                borderRadius: 2,
                backgroundColor: "#d81b60",
                "&:hover": { backgroundColor: "#ad1457" },
              }}
              endIcon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 14 10"><path d="M1 5h12m0 0L9 1m4 4L9 9" /></svg>}
            >
              Read More
            </Button>

            <Tooltip title="Add to Cart" arrow>
              <IconButton
                onClick={() => addToCartHandler(product, 1)}
                sx={{
                  bgcolor: "#f8bbd0",
                  "&:hover": { bgcolor: "#f06292", transform: "scale(1.12)" },
                }}
              >
                <AiOutlineShoppingCart size={24} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      </Box>
    </Fade>
  );
};

export default ProductCard;
