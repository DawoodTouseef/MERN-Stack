
import HeartIcon from "./HeartIcon";
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Chip,
  Fade,
  Stack,
  Tooltip,
  Badge,
  LinearProgress,
} from "@mui/material";
import {
  LocalOffer,
  TrendingUp,
  FlashOn,
  LocationOn,
  Verified,
  Star,
  LocalShipping,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useFetchOffersQuery } from "../../redux/api/offerApiSlice";

const Product = ({ 
  product, 
  showDiscountBadge = false,
  showPersonalizationScore = null,
  showLocationBadge = false,
  locationData = null,
  showTrendingBadge = false,
  trendingRank = null
}) => {
  const [hovered, setHovered] = useState(false);
  const { data: offers, isLoading: offersLoading } = useFetchOffersQuery();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [offerpercent, setofferpercent] = useState({
    percentage:"",
    end:""
  })
  const currency = useSelector((state) => state.currency.selectedCurrency);
  const price = useSelector((state) => state.currency.price);
  const defaultVariant = product.variants?.[0];

  const displayImage =
    product.media?.[0]?.url ||
    defaultVariant?.images?.[0] ||
    product.image ||
    "/default-image.jpg";

    useEffect(() => {
    if (offers) {
      const productsWithOffers = offers
  .filter((offer) => offer.offerType === "flash")
  
      setFilteredProducts(productsWithOffers);
      
    }

  }, [offers]);
  const isOutOfStock = product.countInStock === 0;
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

  return (
    <Fade in timeout={600}>
      <Card
        sx={{
          width: "100%",
          maxWidth: 320,
          mx: "auto",
          p: 2,
          position: "relative",
          borderRadius: 3,
          boxShadow: hovered ? 8 : 3,
          transform: hovered ? "scale(1.025)" : "scale(1)",
          transition: "box-shadow 0.3s, transform 0.3s",
          bgcolor: "#fff",
          cursor: "pointer",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        elevation={hovered ? 8 : 3}
      >
        <Box sx={{ position: "relative" }}>
          <CardMedia
            component="img"
            image={displayImage}
            alt={product.name}
            sx={{
              width: "100%",
              borderRadius: 2,
              height: { xs: 200, sm: 220, md: 250 },
              objectFit: "cover",
              filter: hovered ? "brightness(0.95) blur(0.5px)" : "none",
              transition: "filter 0.3s",
            }}
          />
          <Box sx={{ position: "absolute", top: 10, right: 10 }}>
            <HeartIcon product={product} />
          </Box>

          {isOutOfStock && (
            <Chip
              label="Out of Stock"
              color="error"
              sx={{
                position: "absolute",
                top: 10,
                left: 10,
                fontWeight: 600,
                fontSize: "0.95rem",
                borderRadius: "999px",
              }}
            />
          )}

          {/* Flash Sale Badge */}
          {(showDiscountBadge || offerpercent.percentage > 0) && offerpercent.end !== Date() && (
            <Chip
              icon={<FlashOn sx={{ fontSize: 16 }} />}
              label={`-${offerpercent.percentage}%`}
              color="error"
              sx={{
                position: "absolute",
                top: isOutOfStock ? 50 : 10,
                left: 10,
                fontWeight: 600,
                fontSize: "0.95rem",
                borderRadius: "999px",
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': { transform: 'scale(1)' },
                  '50%': { transform: 'scale(1.05)' },
                  '100%': { transform: 'scale(1)' }
                }
              }}
            />
          )}

          {/* Trending Badge */}
          {showTrendingBadge && trendingRank && (
            <Chip
              icon={<TrendingUp sx={{ fontSize: 16 }} />}
              label={`#${trendingRank} Trending`}
              sx={{
                position: "absolute",
                top: 10,
                right: 50,
                bgcolor: '#ff5722',
                color: 'white',
                fontWeight: 600,
                fontSize: "0.85rem",
                borderRadius: "999px",
              }}
            />
          )}

          {/* Location Badge */}
          {showLocationBadge && locationData?.city && (
            <Chip
              icon={<LocationOn sx={{ fontSize: 16 }} />}
              label={`Popular in ${locationData.city}`}
              sx={{
                position: "absolute",
                bottom: 50,
                left: 10,
                bgcolor: '#4caf50',
                color: 'white',
                fontWeight: 600,
                fontSize: "0.85rem",
                borderRadius: "999px",
              }}
            />
          )}

          {/* Personalization Score */}
          {showPersonalizationScore && (
            <Box
              sx={{
                position: "absolute",
                top: 10,
                right: 50,
                bgcolor: 'rgba(103, 58, 183, 0.9)',
                color: 'white',
                p: 1,
                borderRadius: 2,
                minWidth: 80
              }}
            >
              <Typography variant="caption" fontWeight="bold">
                {Math.round(showPersonalizationScore * 100)}% Match
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={showPersonalizationScore * 100}
                sx={{ 
                  mt: 0.5, 
                  bgcolor: 'rgba(255,255,255,0.3)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: 'white'
                  }
                }}
              />
            </Box>
          )}

          {defaultVariant?.images?.length > 1 && (
            <Stack
              direction="row"
              spacing={1}
              sx={{
                position: "absolute",
                bottom: 10,
                left: 10,
                zIndex: 2,
                bgcolor: "rgba(255,255,255,0.7)",
                borderRadius: 2,
                p: 0.5,
              }}
            >
              {defaultVariant.images.slice(1, 4).map((img, idx) => (
                <Tooltip title="More image" key={idx}>
                  <img
                    src={img}
                    alt={`thumb-${idx}`}
                    style={{
                      width: 36,
                      height: 36,
                      objectFit: "cover",
                      borderRadius: 6,
                      border: "1px solid #eee",
                    }}
                  />
                </Tooltip>
              ))}
            </Stack>
          )}
        </Box>

        <CardContent sx={{ p: 2, flexGrow: 1, display: "flex", flexDirection: "column" }}>
          <Link to={`/product/${product._id}`} style={{ textDecoration: "none" }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <Tooltip title={product.name}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    maxWidth: 260,
                    letterSpacing: 0.2,
                    color: hovered ? "secondary.main" : "text.primary",
                    transition: "color 0.2s",
                  }}
                >
                  {product.name.length > 20
                    ? product.name.substring(0, 20) + "..."
                    : product.name}
                </Typography>
              </Tooltip>
              <Chip
                label={`${getCurrencySymbol()}${discountedPrice}`}
                sx={{
                  bgcolor: "#f8bbd0",
                  color: "#ad1457",
                  fontWeight: 600,
                  fontSize: "1rem",
                  borderRadius: "999px",
                  boxShadow: hovered ? 2 : 0,
                  transition: "box-shadow 0.2s",
                }}
              />
            </Stack>

            <Typography
              variant="body2"
              sx={{
                minHeight: 38,
                maxHeight: 38,
                overflow: "hidden",
                textOverflow: "ellipsis",
                mb: 1,
                color: hovered ? "primary.main" : "text.secondary",
                transition: "color 0.2s",
              }}
            >
              {product.description?.substring(0, 60)}...
            </Typography>

            <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: "wrap" }}>
              <Chip
                label={product.brand?.name}
                size="small"
                sx={{
                  bgcolor: "#e1bee7",
                  color: "#6a1b9a",
                  fontWeight: 500,
                  borderRadius: "999px",
                }}
              />
              <Chip
                label={product.category?.name || "Uncategorized"}
                size="small"
                sx={{
                  bgcolor: "#ffe082",
                  color: "#ff6f00",
                  fontWeight: 500,
                  borderRadius: "999px",
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
                }}
              />
              {product.warrantyPeriod && (
                <Chip
                  label={`Warranty: ${product.warrantyPeriod}`}
                  size="small"
                  sx={{
                    bgcolor: "#bbdefb",
                    color: "#0d47a1",
                    fontWeight: 500,
                    borderRadius: "999px",
                  }}
                />
              )}
              {product.returnPolicy && (
                <Chip
                  label="Returnable"
                  size="small"
                  sx={{
                    bgcolor: "#fce4ec",
                    color: "#c2185b",
                    fontWeight: 500,
                    borderRadius: "999px",
                  }}
                />
              )}
            </Stack>

            {product.tags?.length > 0 && (
              <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
                {product.tags.slice(0, 3).map((tag, idx) => (
                  <Chip
                    key={idx}
                    label={`#${tag}`}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontSize: "0.75rem",
                      borderRadius: "999px",
                      color: "#555",
                      borderColor: "#ccc",
                    }}
                  />
                ))}
              </Stack>
            )}
          </Link>
        </CardContent>
      </Card>
    </Fade>
  );
};

export default Product;
