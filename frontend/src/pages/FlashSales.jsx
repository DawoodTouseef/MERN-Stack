import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Chip,
  Grid,
  LinearProgress,
  IconButton,
  Alert,
  Skeleton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  FlashOn,
  AccessTime,
  LocalOffer,
  ShoppingCart,
  Favorite,
  FavoriteBorder,
  Star,
  TrendingUp,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetActiveFlashSalesQuery } from '../redux/api/dynamicPricingApiSlice';
import { addToCart } from '../redux/features/cart/cartSlice';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const FlashSales = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState(new Set());
  const [currentTime, setCurrentTime] = useState(new Date());

  const { data: flashSales, isLoading, error, refetch } = useGetActiveFlashSalesQuery({
    limit: 20
  });

  // Update current time every second for countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Refetch flash sales periodically
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000); // Refetch every 30 seconds
    return () => clearInterval(interval);
  }, [refetch]);

  const handleAddToCart = (product) => {
    dispatch(addToCart({
      ...product,
      qty: 1,
      price: product.flashSale.discountedPrice
    }));
    toast.success(`${product.name} added to cart!`);
  };

  const toggleFavorite = (productId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId);
      toast.info('Removed from wishlist');
    } else {
      newFavorites.add(productId);
      toast.success('Added to wishlist');
    }
    setFavorites(newFavorites);
  };

  const formatTimeRemaining = (endDate) => {
    const now = currentTime;
    const end = new Date(endDate);
    const diff = end - now;

    if (diff <= 0) return 'Ended';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (sold, max) => {
    return max > 0 ? (sold / max) * 100 : 0;
  };

  const FlashSaleCard = ({ product }) => {
    const { flashSale } = product;
    const timeRemaining = formatTimeRemaining(flashSale.endDate);
    const progressPercentage = getProgressPercentage(flashSale.soldQuantity, flashSale.maxQuantity);
    const isEnded = timeRemaining === 'Ended';
    const isAlmostSoldOut = progressPercentage > 80;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        <Card
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: theme.shadows[4],
            '&:hover': {
              boxShadow: theme.shadows[8],
            }
          }}
        >
          {/* Flash Sale Badge */}
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              zIndex: 2,
              display: 'flex',
              gap: 1,
            }}
          >
            <Chip
              icon={<FlashOn sx={{ fontSize: 16 }} />}
              label={`${Math.round(flashSale.savingsPercentage)}% OFF`}
              color="error"
              size="small"
              sx={{
                fontWeight: 'bold',
                animation: isEnded ? 'none' : 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': { transform: 'scale(1)' },
                  '50%': { transform: 'scale(1.05)' },
                  '100%': { transform: 'scale(1)' }
                }
              }}
            />
            {isAlmostSoldOut && (
              <Chip
                label="Almost Gone!"
                color="warning"
                size="small"
                sx={{ fontWeight: 'bold' }}
              />
            )}
          </Box>

          {/* Favorite Button */}
          <IconButton
            onClick={() => toggleFavorite(product._id)}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 2,
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' }
            }}
          >
            {favorites.has(product._id) ? (
              <Favorite color="error" />
            ) : (
              <FavoriteBorder />
            )}
          </IconButton>

          {/* Product Image */}
          <Box sx={{ position: 'relative' }}>
            <CardMedia
              component="img"
              height="200"
              image={product.image || '/placeholder-product.jpg'}
              alt={product.name}
              sx={{
                objectFit: 'cover',
                filter: isEnded ? 'grayscale(50%)' : 'none'
              }}
            />

            {/* Countdown Overlay */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                bgcolor: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                p: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1
              }}
            >
              <AccessTime fontSize="small" />
              <Typography variant="body2" fontWeight="bold">
                {isEnded ? 'Sale Ended' : timeRemaining}
              </Typography>
            </Box>
          </Box>

          <CardContent sx={{ flexGrow: 1, p: 2 }}>
            {/* Product Name */}
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'bold',
                mb: 1,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                minHeight: '3rem'
              }}
            >
              {product.name}
            </Typography>

            {/* Rating */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                <Star sx={{ color: '#ffa726', fontSize: 16 }} />
                <Typography variant="body2" sx={{ ml: 0.5 }}>
                  {product.rating || 0}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                ({product.numReviews || 0} reviews)
              </Typography>
            </Box>

            {/* Pricing */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6" color="error.main" fontWeight="bold">
                  ${flashSale.discountedPrice}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    textDecoration: 'line-through',
                    color: 'text.secondary'
                  }}
                >
                  ${flashSale.originalPrice}
                </Typography>
              </Box>
              <Typography variant="body2" color="success.main" fontWeight="medium">
                Save ${(flashSale.originalPrice - flashSale.discountedPrice).toFixed(2)}
              </Typography>
            </Box>

            {/* Stock Progress */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" color="text.secondary">
                  Stock Progress
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {flashSale.remainingQuantity} left
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progressPercentage}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: 'grey.200',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: progressPercentage > 80 ? 'error.main' :
                      progressPercentage > 50 ? 'warning.main' : 'success.main',
                    borderRadius: 4
                  }
                }}
              />
            </Box>
          </CardContent>

          <CardActions sx={{ p: 2, pt: 0 }}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<ShoppingCart />}
              onClick={() => handleAddToCart(product)}
              disabled={isEnded || flashSale.remainingQuantity <= 0}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 'bold',
                py: 1.5,
                bgcolor: isEnded ? 'grey.400' : 'error.main',
                '&:hover': {
                  bgcolor: isEnded ? 'grey.400' : 'error.dark'
                }
              }}
            >
              {isEnded ? 'Sale Ended' :
                flashSale.remainingQuantity <= 0 ? 'Sold Out' :
                  'Add to Cart'}
            </Button>
          </CardActions>
        </Card>
      </motion.div>
    );
  };

  const LoadingSkeleton = () => (
    <Grid container spacing={3}>
      {Array.from({ length: 8 }).map((_, index) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
          <Card sx={{ borderRadius: 3 }}>
            <Skeleton variant="rectangular" height={200} />
            <CardContent>
              <Skeleton variant="text" height={32} />
              <Skeleton variant="text" height={20} width="60%" />
              <Skeleton variant="text" height={24} width="40%" />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          Failed to load flash sales. Please try again later.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <FlashOn sx={{ fontSize: 40, color: 'error.main', mr: 1 }} />
            <Typography
              variant="h3"
              sx={{
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #f44336, #ff9800)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '2rem', md: '3rem' }
              }}
            >
              Flash Sales
            </Typography>
          </Box>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            Limited time deals with incredible savings!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Hurry up! These deals won't last long
          </Typography>
        </Box>
      </motion.div>

      {/* Flash Sales Grid */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : flashSales?.data?.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Grid container spacing={3}>
            {flashSales.data.map((product, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <FlashSaleCard product={product} />
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <LocalOffer sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom>
              No Flash Sales Available
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Check back later for amazing deals!
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/')}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Continue Shopping
            </Button>
          </Box>
        </motion.div>
      )}
    </Container>
  );
};

export default FlashSales;