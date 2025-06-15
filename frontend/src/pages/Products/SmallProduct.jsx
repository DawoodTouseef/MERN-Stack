import { Link } from "react-router-dom";
import HeartIcon from "./HeartIcon";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Chip,
  Box,
  Stack,
  Tooltip,
} from "@mui/material";
import { useSelector } from "react-redux";
import {useFetchOffersQuery} from "../../redux/api/offerApiSlice"
import { useEffect,useState } from "react";

const SmallProduct = ({ product }) => {
  const handleWriteReviewClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const { data: offers, isLoading: offersLoading } = useFetchOffersQuery();
  const currency = useSelector((state) => state.currency.selectedCurrency);
  const price = useSelector((state) => state.currency.price);
  const [offerpercent, setofferpercent] = useState({
        percentage:"",
        end:""
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
    <Card
      sx={{
        width: 320,
        ml: 2,
        p: 2,
        borderRadius: 4,
        boxShadow: "0 4px 16px 0 rgba(236,72,153,0.10)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: 260,
        position: "relative",
        transition: "box-shadow 0.25s, transform 0.25s",
        "&:hover": {
          boxShadow: "0 8px 32px 0 rgba(236,72,153,0.18)",
          transform: "scale(1.025)",
          border: "2px solid #ec4899",
        },
        border: "2px solid transparent",
        background: "linear-gradient(135deg, #fff 80%, #e3eeff 100%)",
      }}
    >
      {/* Product Media */}
      <Box sx={{ position: "relative" }}>
        <Link
          to={`/product/${product._id}`}
          style={{ textDecoration: "none" }}
          onClick={handleWriteReviewClick}
        >
          <CardMedia
            component="img"
            image={product.media?.[0]?.url || "/placeholder.png"}
            alt={product.name}
            sx={{
              width: "100%",
              height: 140,
              objectFit: "cover",
              borderRadius: 2,
              background: "#fff",
              transition: "filter 0.3s",
              "&:hover": {
                filter: "brightness(0.93) blur(0.5px)",
              },
            }}
          />
        </Link>
        <Box sx={{ position: "absolute", top: 10, right: 10 }}>
          <HeartIcon product={product} />
        </Box>
        {product.countInStock === 0 && (
          <Chip
            label="Out of Stock"
            color="error"
            sx={{
              position: "absolute",
              top: 10,
              left: 10,
              fontWeight: 600,
              fontSize: "0.85rem",
              borderRadius: "999px",
              zIndex: 2,
              bgcolor: "#f87171",
              color: "#fff",
              boxShadow: "0 2px 8px #f8717166",
            }}
          />
        )}
        {offerpercent.percentage > 0 && offerpercent.end !==Date() && (
          <Chip
            label={`-${offerpercent.percentage}%`}
            color="primary"
            sx={{
              position: "absolute",
              bottom: 10,
              left: 10,
              fontWeight: 600,
              fontSize: "0.85rem",
              borderRadius: "999px",
              zIndex: 2,
              bgcolor: "#6366f1",
              color: "#fff",
              boxShadow: "0 2px 8px #6366f155",
            }}
          />
        )}
      </Box>

      {/* Product Details */}
      <CardContent sx={{ p: 2, pt: 1 }}>
        <Link to={`/product/${product._id}`} style={{ textDecoration: "none" }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 0.5 }}
          >
            <Tooltip title={product?.name}>
              <Typography
                variant="subtitle1"
                sx={{
                  color: "#18181b",
                  fontWeight: 700,
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  maxWidth: 170,
                  letterSpacing: 0.1,
                  fontSize: "1.05rem",
                  "&:hover": { color: "#ec4899" },
                  transition: "color 0.2s",
                }}
              >
                {product?.name.length > 28
                  ? product?.name.substring(0, 28) + "..."
                  : product?.name}
              </Typography>
            </Tooltip>
            <Chip
              label={`${getCurrencySymbol()}${discountedPrice}`}
              sx={{
                bgcolor: "#f8bbd0",
                color: "#ad1457",
                fontWeight: 700,
                fontSize: "1rem",
                borderRadius: "999px",
                px: 1.5,
                boxShadow: "0 2px 8px #ec489955",
              }}
            />
          </Stack>
          {product.discount?.percentage > 0 && (
            <Typography
              variant="caption"
              sx={{
                color: "#ef4444",
                fontWeight: 500,
                textDecoration: "line-through",
                fontSize: "0.9rem",
              }}
            >
              {getCurrencySymbol()}{product.price*price}
            </Typography>
          )}
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
            <Chip
              label={product.brand?.name || "Unknown Brand"}
              size="small"
              sx={{
                bgcolor: "#e1bee7",
                color: "#6a1b9a",
                fontWeight: 500,
                borderRadius: "999px",
                fontSize: "0.85rem",
              }}
            />
            <Chip
              label={`Stock: ${product.countInStock}`}
              size="small"
              sx={{
                bgcolor: "#c8e6c9",
                color: "#388e3c",
                fontWeight: 500,
                borderRadius: "999px",
                fontSize: "0.85rem",
              }}
            />
          </Stack>
        </Link>
      </CardContent>
    </Card>
  );
};

export default SmallProduct;