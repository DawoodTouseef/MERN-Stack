import { Link } from "react-router-dom";
import { AiOutlineShoppingCart, AiOutlineEye } from "react-icons/ai";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/features/cart/cartSlice";
import { toast } from "react-toastify";
import HeartIcon from "./HeartIcon";
import QuickView from "../../components/QuickView";
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
  Avatar,
  useTheme,
  alpha,
  useMediaQuery,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Skeleton,
} from "@mui/material";
import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { useFetchOffersQuery } from "../../redux/api/offerApiSlice";
import usePerformance from "../../hooks/usePerformance";
import useAccessibility from "../../hooks/useAccessibility";

const ProductCard = ({ product, viewMode = 'grid' }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const dispatch = useDispatch();
  const [hovered, setHovered] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const currency = useSelector((state) => state.currency.selectedCurrency);
  const price = useSelector((state) => state.currency.price);
  const { data: offers, isLoading: offersLoading } = useFetchOffersQuery();
  const { shouldReduceAnimations, shouldReduceImageQuality } = usePerformance();
  const { isKeyboardMode } = useAccessibility();
  
  const [offerpercent, setofferpercent] = useState({
    percentage: 0,
    end: "",
    type: ""
  });
  
  useEffect(() => {
    if (offers && product) {
      let bestOffer = null;
      let bestDiscount = 0;
      
      offers.forEach((offer) => {
        const isProductInOffer =
          offer.products.some((p) => p._id === product._id) ||
          offer.categories.some((c) => c._id === product.category?._id) ||
          (offer.brand && offer.brand._id === product.brand?._id);
          
        if (isProductInOffer) {
          if (offer.discountUnit === "percent" && offer.discountValue > bestDiscount) {
            bestDiscount = offer.discountValue;
            bestOffer = offer;
          } else if (offer.discountUnit === "flat" && offer.discountValue > bestDiscount) {
            bestDiscount = offer.discountValue;
            bestOffer = offer;
          }
        }
      });
      
      if (bestOffer) {
        setofferpercent({
          percentage: bestOffer.discountValue,
          end: bestOffer.endTime,
          type: bestOffer.discountUnit
        });
      }
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

  const hasDiscount = offerpercent.percentage > 0;
  
  const calculateDiscountedPrice = (product, offers) => {
    if (!product || !product.price) return 0;
    if (!offers || offers.length === 0) return product.price * price;

    let discountedPrice = product.price;

    // Find the best discount for this product
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
  
  const discountedPrice = useMemo(() => calculateDiscountedPrice(product, offers), [product, offers, price]);
  const originalPrice = useMemo(() => product.price * price, [product, price]);
  
  // Format prices
  const formattedDiscountedPrice = useMemo(() => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(discountedPrice), [discountedPrice, currency]);
  
  const formattedOriginalPrice = useMemo(() => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(originalPrice), [originalPrice, currency]);
  
  // Calculate savings
  const savings = useMemo(() => originalPrice - discountedPrice, [originalPrice, discountedPrice]);
  const savingsPercentage = useMemo(() => originalPrice > 0 ? Math.round((savings / originalPrice) * 100) : 0, [originalPrice, savings]);
  
  if (viewMode === 'list') {
    // List view design
    return (
      <>
        <Fade in={!shouldReduceAnimations} timeout={500}>
          <Card
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              bgcolor: theme.palette.background.paper,
              borderRadius: 3,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
              overflow: "hidden",
              transition: shouldReduceAnimations ? 'none' : "all 0.3s ease",
              border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
              '&:hover': {
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
                transform: shouldReduceAnimations ? 'none' : 'translateY(-2px)',
              },
              position: "relative",
            }}
          >
            {/* Image Section */}
            <Box 
              sx={{ 
                width: { xs: '100%', sm: 200 },
                height: { xs: 200, sm: 'auto' },
                position: "relative",
                flexShrink: 0
              }}
            >
              <Link 
                to={`/product/${product._id}`}
                aria-label={`View details for ${product.name}`}
              >
                {!imageLoaded && (
                  <Skeleton 
                    variant="rectangular" 
                    width="100%" 
                    height="100%" 
                    sx={{ borderRadius: 0 }}
                  />
                )}
                <CardMedia
                  component="img"
                  image={product.media?.[0]?.url || "/placeholder.jpg"}
                  alt={product.name}
                  onLoad={() => setImageLoaded(true)}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: "cover",
                    display: imageLoaded ? 'block' : 'none',
                    transition: shouldReduceAnimations ? 'none' : "transform 0.3s ease",
                    filter: shouldReduceImageQuality ? 'contrast(1.1)' : 'none'
                  }}
                  loading="lazy"
                />
              </Link>
              
              {/* Discount Badge */}
              {hasDiscount && (
                <Chip
                  label={`-${savingsPercentage}%`}
                  color="error"
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 12,
                    left: 12,
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    borderRadius: "6px",
                    height: 22,
                    '& .MuiChip-label': {
                      px: 1
                    }
                  }}
                />
              )}
              
              {/* Wishlist Icon */}
              <Box sx={{ position: "absolute", top: 12, right: 12 }}>
                <HeartIcon product={product} />
              </Box>
            </Box>
            
            {/* Content Section */}
            <CardContent sx={{ flex: 1, p: { xs: 2, sm: 3 } }}>
              <Stack spacing={1.5}>
                {/* Brand and Category */}
                <Stack direction="row" spacing={1} alignItems="center">
                  {product.brand?.name && (
                    <Chip
                      label={product.brand.name}
                      size="small"
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        fontWeight: 600,
                        fontSize: "0.7rem",
                        height: 20,
                        '& .MuiChip-label': {
                          px: 0.8
                        },
                        borderRadius: 1
                      }}
                    />
                  )}
                  {product.category?.name && (
                    <Chip
                      label={product.category.name}
                      size="small"
                      variant="outlined"
                      sx={{
                        borderColor: alpha(theme.palette.secondary.main, 0.3),
                        color: theme.palette.secondary.main,
                        fontWeight: 500,
                        fontSize: "0.65rem",
                        height: 20,
                        '& .MuiChip-label': {
                          px: 0.8
                        },
                        borderRadius: 1
                      }}
                    />
                  )}
                </Stack>
                
                {/* Product Name */}
                <Tooltip title={product.name}>
                  <Typography
                    variant="h6"
                    component={Link}
                    to={`/product/${product._id}`}
                    sx={{
                      fontWeight: 700,
                      color: theme.palette.text.primary,
                      textDecoration: 'none',
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      '&:hover': {
                        color: theme.palette.primary.main
                      },
                      fontSize: '1.125rem',
                      lineHeight: 1.3
                    }}
                    aria-label={`Product: ${product.name}`}
                  >
                    {product.name}
                  </Typography>
                </Tooltip>
                
                {/* Rating */}
                {product.rating > 0 && (
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Rating 
                      value={product.rating} 
                      precision={0.1} 
                      readOnly 
                      size="small" 
                      aria-label={`Rating: ${product.rating} out of 5 stars`}
                    />
                    <Typography variant="caption" color="text.secondary">
                      ({product.numReviews})
                    </Typography>
                  </Stack>
                )}
                
                {/* Description */}
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {product.description}
                </Typography>
                
                {/* Pricing */}
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 700,
                        color: theme.palette.primary.main,
                        fontSize: '1.25rem'
                      }}
                    >
                      {formattedDiscountedPrice}
                    </Typography>
                    {hasDiscount && (
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          textDecoration: "line-through",
                          color: theme.palette.text.secondary
                        }}
                      >
                        {formattedOriginalPrice}
                      </Typography>
                    )}
                    {hasDiscount && (
                      <Chip
                        label={`Save ${new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: currency
                        }).format(savings)}`}
                        size="small"
                        color="success"
                        sx={{
                          height: 20,
                          '& .MuiChip-label': {
                            px: 0.8,
                            fontSize: "0.65rem"
                          },
                          borderRadius: 1
                        }}
                      />
                    )}
                  </Stack>
                </Box>
                
                {/* Stock Status */}
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    label={product.countInStock > 0 ? "In Stock" : "Out of Stock"}
                    size="small"
                    color={product.countInStock > 0 ? "success" : "error"}
                    sx={{
                      height: 24,
                      '& .MuiChip-label': {
                        px: 1,
                        fontSize: "0.7rem"
                      },
                      borderRadius: 1
                    }}
                  />
                  {product.countInStock > 0 && (
                    <Typography variant="caption" color="text.secondary">
                      {product.countInStock} available
                    </Typography>
                  )}
                </Stack>
                
                {/* Action Buttons */}
                <CardActions sx={{ p: 0, mt: 1 }}>
                  <Stack direction="row" spacing={1.5}>
                    <Button
                      variant="contained"
                      size="small"
                      sx={{
                        borderRadius: 2,
                        px: 2,
                        py: 1,
                        fontWeight: 600,
                        textTransform: "none",
                        boxShadow: 2,
                        '&:hover': {
                          boxShadow: 4
                        },
                        height: 36
                      }}
                      onClick={() => addToCartHandler(product, 1)}
                      startIcon={<AiOutlineShoppingCart />}
                      aria-label={`Add ${product.name} to cart`}
                    >
                      Add to Cart
                    </Button>
                    
                    <Button
                      component={Link}
                      to={`/product/${product._id}`}
                      variant="outlined"
                      size="small"
                      sx={{
                        borderRadius: 2,
                        px: 2,
                        py: 1,
                        fontWeight: 600,
                        textTransform: "none",
                        borderColor: alpha(theme.palette.primary.main, 0.5),
                        color: theme.palette.primary.main,
                        '&:hover': {
                          borderColor: theme.palette.primary.main,
                          backgroundColor: alpha(theme.palette.primary.main, 0.05)
                        },
                        height: 36
                      }}
                      startIcon={<AiOutlineEye />}
                      aria-label={`View details for ${product.name}`}
                    >
                      View Details
                    </Button>
                    
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setQuickViewOpen(true)}
                      sx={{
                        borderRadius: 2,
                        px: 2,
                        py: 1,
                        fontWeight: 600,
                        textTransform: "none",
                        borderColor: alpha(theme.palette.secondary.main, 0.5),
                        color: theme.palette.secondary.main,
                        '&:hover': {
                          borderColor: theme.palette.secondary.main,
                          backgroundColor: alpha(theme.palette.secondary.main, 0.05)
                        },
                        height: 36
                      }}
                      aria-label={`Quick view ${product.name}`}
                    >
                      Quick View
                    </Button>
                  </Stack>
                </CardActions>
              </Stack>
            </CardContent>
          </Card>
        </Fade>
        <QuickView 
          product={product} 
          open={quickViewOpen} 
          onClose={() => setQuickViewOpen(false)} 
        />
      </>
    );
  }
  
  // Grid view design (default)
  return (
    <>
      <Fade in={!shouldReduceAnimations} timeout={500}>
        <Card
          sx={{
            width: '100%',
            minHeight: { xs: 380, sm: 420, md: 460 },
            bgcolor: theme.palette.background.paper,
            borderRadius: 3,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
            overflow: "hidden",
            transition: shouldReduceAnimations ? 'none' : "all 0.3s ease",
            border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
            position: "relative",
            '&:hover': {
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
              transform: shouldReduceAnimations ? 'none' : "translateY(-4px)",
            },
          }}
          onMouseEnter={() => !isKeyboardMode && setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocus={() => isKeyboardMode && setHovered(true)}
          onBlur={() => setHovered(false)}
        >
          {/* Image Section */}
          <Box sx={{ position: "relative", height: { xs: 200, sm: 220, md: 240 } }}>
            <Link 
              to={`/product/${product._id}`}
              aria-label={`View details for ${product.name}`}
            >
              {!imageLoaded && (
                <Skeleton 
                  variant="rectangular" 
                  width="100%" 
                  height="100%" 
                  sx={{ borderRadius: 0 }}
                />
              )}
              <CardMedia
                component="img"
                image={product.media?.[0]?.url || "/placeholder.jpg"}
                alt={product.name}
                onLoad={() => setImageLoaded(true)}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: imageLoaded ? 'block' : 'none',
                  transition: shouldReduceAnimations ? 'none' : "transform 0.5s ease",
                  transform: hovered && !shouldReduceAnimations ? "scale(1.05)" : "scale(1)",
                  filter: shouldReduceImageQuality ? 'contrast(1.1)' : 'none'
                }}
                loading="lazy"
              />
            </Link>
            
            {/* Additional Images Preview */}
            {product.media?.length > 1 && (
              <Stack direction="row" spacing={0.5} sx={{ position: "absolute", bottom: 12, left: 12 }}>
                {product.media.slice(1, 4).map((m, i) => (
                  m.type === "image" && (
                    <Avatar 
                      key={i} 
                      src={m.url} 
                      sx={{ 
                        width: { xs: 24, sm: 28, md: 32 }, 
                        height: { xs: 24, sm: 28, md: 32 },
                        border: `2px solid ${theme.palette.background.paper}`,
                        boxShadow: 1,
                        borderRadius: 1
                      }} 
                      variant="rounded" 
                      alt={`Additional view ${i+1} of ${product.name}`}
                    />
                  )
                ))}
              </Stack>
            )}
            
            {/* Discount Badge */}
            {hasDiscount && (
              <Chip
                label={`-${savingsPercentage}%`}
                color="error"
                sx={{
                  position: "absolute",
                  top: 12,
                  left: 12,
                  fontWeight: 700,
                  fontSize: { xs: "0.75rem", sm: "0.8rem" },
                  borderRadius: "6px",
                  height: { xs: 24, sm: 28 },
                  '& .MuiChip-label': {
                    px: 1.2
                  }
                }}
              />
            )}
            
            {/* Brand Badge */}
            {product.brand?.name && (
              <Chip
                label={product.brand.name}
                size="small"
                sx={{
                  position: "absolute",
                  bottom: 12,
                  right: 12,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                  fontSize: { xs: "0.65rem", sm: "0.7rem" },
                  borderRadius: "6px",
                  height: 22,
                  '& .MuiChip-label': {
                    px: 1
                  }
                }}
              />
            )}
            
            {/* Wishlist Icon */}
            <Box sx={{ position: "absolute", top: 12, right: 12 }}>
              <HeartIcon product={product} />
            </Box>
            
            {/* Quick Actions on Hover */}
            {hovered && (
              <Box 
                sx={{ 
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  display: "flex",
                  gap: 1,
                  zIndex: 10
                }}
              >
                <Tooltip title="Quick View">
                  <IconButton
                    onClick={(e) => {
                      e.preventDefault();
                      setQuickViewOpen(true);
                    }}
                    sx={{
                      bgcolor: theme.palette.background.paper,
                      color: theme.palette.primary.main,
                      width: 40,
                      height: 40,
                      boxShadow: 3,
                      '&:hover': {
                        bgcolor: theme.palette.primary.main,
                        color: theme.palette.background.paper,
                        transform: shouldReduceAnimations ? 'none' : "scale(1.1)"
                      },
                      transition: shouldReduceAnimations ? 'none' : "all 0.2s ease",
                      borderRadius: 2
                    }}
                    aria-label={`Quick view ${product.name}`}
                  >
                    <AiOutlineEye size={18} />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Add to Cart">
                  <IconButton
                    onClick={(e) => {
                      e.preventDefault();
                      addToCartHandler(product, 1);
                    }}
                    sx={{
                      bgcolor: theme.palette.background.paper,
                      color: theme.palette.primary.main,
                      width: 40,
                      height: 40,
                      boxShadow: 3,
                      '&:hover': {
                        bgcolor: theme.palette.primary.main,
                        color: theme.palette.background.paper,
                        transform: shouldReduceAnimations ? 'none' : "scale(1.1)"
                      },
                      transition: shouldReduceAnimations ? 'none' : "all 0.2s ease",
                      borderRadius: 2
                    }}
                    aria-label={`Add ${product.name} to cart`}
                  >
                    <AiOutlineShoppingCart size={18} />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
            
            {/* Overlay on Hover */}
            {hovered && (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  bgcolor: alpha('#000', 0.05),
                  transition: shouldReduceAnimations ? 'none' : "all 0.3s ease",
                  borderRadius: '3px 3px 0 0'
                }}
              />
            )}
          </Box>

          {/* Content Section */}
          <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
            <Stack spacing={1.5}>
              {/* Product Name */}
              <Tooltip title={product.name}>
                <Typography
                  variant="h6"
                  component={Link}
                  to={`/product/${product._id}`}
                  sx={{
                    fontWeight: 700,
                    color: theme.palette.text.primary,
                    textDecoration: 'none',
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    '&:hover': {
                      color: theme.palette.primary.main
                    },
                    fontSize: '1.125rem',
                    lineHeight: 1.3
                  }}
                  aria-label={`Product: ${product.name}`}
                >
                  {product.name.length > 30 ? `${product.name.substring(0, 30)}...` : product.name}
                </Typography>
              </Tooltip>
              
              {/* Rating */}
              {product.rating > 0 && (
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Rating 
                    value={product.rating} 
                    precision={0.1} 
                    readOnly 
                    size="small" 
                    aria-label={`Rating: ${product.rating} out of 5 stars`}
                  />
                  <Typography variant="caption" color="text.secondary">
                    ({product.numReviews})
                  </Typography>
                </Stack>
              )}
              
              {/* Pricing */}
              <Box>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 700,
                      color: theme.palette.primary.main,
                      fontSize: '1.25rem'
                    }}
                  >
                    {formattedDiscountedPrice}
                  </Typography>
                  {hasDiscount && (
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        textDecoration: "line-through",
                        color: theme.palette.text.secondary
                      }}
                    >
                      {formattedOriginalPrice}
                    </Typography>
                  )}
                </Stack>
                {hasDiscount && (
                  <Typography 
                    variant="caption" 
                    color="success.main"
                    sx={{ fontWeight: 600 }}
                  >
                    Save {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: currency
                    }).format(savings)}
                  </Typography>
                )}
              </Box>
              
              {/* Category and Stock */}
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {product.category?.name && (
                  <Chip
                    label={product.category.name}
                    size="small"
                    variant="outlined"
                    sx={{
                      borderColor: alpha(theme.palette.secondary.main, 0.3),
                      color: theme.palette.secondary.main,
                      fontWeight: 500,
                      fontSize: "0.65rem",
                      height: 20,
                      '& .MuiChip-label': {
                        px: 0.8
                      },
                      borderRadius: 1
                    }}
                  />
                )}
                <Chip
                  label={product.countInStock > 0 ? "In Stock" : "Out of Stock"}
                  size="small"
                  color={product.countInStock > 0 ? "success" : "error"}
                  sx={{
                    height: 20,
                    '& .MuiChip-label': {
                      px: 0.8,
                      fontSize: "0.65rem"
                    },
                    borderRadius: 1
                  }}
                />
              </Stack>
              
              {/* Action Buttons */}
              <CardActions sx={{ p: 0, mt: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" width="100%">
                  <Button
                    component={Link}
                    to={`/product/${product._id}`}
                    variant="outlined"
                    size="small"
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      borderRadius: 2,
                      px: 1.5,
                      py: 0.8,
                      fontSize: "0.8rem",
                      borderColor: alpha(theme.palette.primary.main, 0.5),
                      color: theme.palette.primary.main,
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        backgroundColor: alpha(theme.palette.primary.main, 0.05)
                      },
                      height: 32
                    }}
                    aria-label={`View details for ${product.name}`}
                  >
                    Details
                  </Button>
                  
                  <Tooltip title="Add to Cart">
                    <IconButton
                      onClick={() => addToCartHandler(product, 1)}
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        width: 32,
                        height: 32,
                        '&:hover': {
                          bgcolor: theme.palette.primary.main,
                          color: theme.palette.background.paper,
                          transform: shouldReduceAnimations ? 'none' : "scale(1.1)"
                        },
                        transition: shouldReduceAnimations ? 'none' : "all 0.2s ease",
                        borderRadius: 1.5
                      }}
                      aria-label={`Add ${product.name} to cart`}
                    >
                      <AiOutlineShoppingCart size={16} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </CardActions>
            </Stack>
          </CardContent>
        </Card>
      </Fade>
      <QuickView 
        product={product} 
        open={quickViewOpen} 
        onClose={() => setQuickViewOpen(false)} 
      />
    </>
  );
};

export default ProductCard;