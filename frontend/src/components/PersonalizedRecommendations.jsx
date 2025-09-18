import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Rating,
  IconButton,
  Skeleton,
  Alert,
} from '@mui/material';
import { motion } from 'framer-motion';
import { FaHeart, FaRegHeart, FaShoppingCart, FaEye } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useGetPersonalizedRecommendationsQuery, useTrackBehaviorMutation } from '../redux/api/recommendationApiSlice';
import { addToCart } from '../redux/features/cart/cartSlice';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

const PersonalizedRecommendations = ({ page = 'homepage', cartItems = [], limit = 8 }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const currency = useSelector((state) => state.currency.selectedCurrency);
  const price = useSelector((state) => state.currency.price);
  const dispatch = useDispatch();

  const [favorites, setFavorites] = useState(new Set());
  const [displayLimit, setDisplayLimit] = useState(limit);

  // API calls
  const { 
    data: recommendations, 
    isLoading, 
    error, 
    refetch 
  } = useGetPersonalizedRecommendationsQuery(
    { page, cartItems, forceRefresh: false },
    { skip: !userInfo } // Only fetch if user is logged in
  );

  const [trackBehavior] = useTrackBehaviorMutation();

  // Track page view
  useEffect(() => {
    if (userInfo) {
      trackBehavior({
        type: 'page_view',
        source: page,
        metadata: { section: 'personalized_recommendations' }
      });
    }
  }, [userInfo, page, trackBehavior]);

  const getCurrencySymbol = () => {
    try {
      const formatter = new Intl.NumberFormat('en', {
        style: 'currency',
        currency: currency,
        currencyDisplay: 'symbol',
      });
      const parts = formatter.formatToParts(1);
      return parts.find(part => part.type === 'currency')?.value || currency;
    } catch (err) {
      return currency;
    }
  };

  const handleProductClick = (product) => {
    if (userInfo) {
      trackBehavior({
        type: 'product_click',
        productId: product._id,
        categoryId: product.category?._id,
        brandId: product.brand?._id,
        source: 'recommendations',
        metadata: { 
          section: 'personalized_recommendations',
          recommendation_type: 'personalized',
          page 
        }
      });
    }
  };

  const handleAddToCart = (product) => {
    dispatch(addToCart({ ...product, qty: 1 }));
    toast.success('Added to cart!', { autoClose: 1500 });
    
    if (userInfo) {
      trackBehavior({
        type: 'add_to_cart',
        productId: product._id,
        categoryId: product.category?._id,
        brandId: product.brand?._id,
        source: 'recommendations',
        metadata: { 
          section: 'personalized_recommendations',
          recommendation_type: 'personalized' 
        }
      });
    }
  };

  const toggleFavorite = (productId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });

    if (userInfo) {
      trackBehavior({
        type: 'favorite',
        productId,
        source: 'recommendations',
        metadata: { action: favorites.has(productId) ? 'remove' : 'add' }
      });
    }
  };

  // Don't render if user is not logged in
  if (!userInfo) {
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ mt: 6, mb: 5 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3, textAlign: 'center' }}>
          Recommended for You
        </Typography>
        <Grid container spacing={3}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ borderRadius: 3 }}>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
                  <Skeleton variant="text" sx={{ fontSize: '0.8rem' }} />
                  <Skeleton variant="rectangular" width={80} height={30} sx={{ mt: 1 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ mt: 6, mb: 5 }}>
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          Unable to load personalized recommendations at this time. Please try again later.
        </Alert>
      </Box>
    );
  }

  // No recommendations
  if (!recommendations?.data?.personalized?.length) {
    return null;
  }

  const productsToShow = recommendations.data.personalized.slice(0, displayLimit);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Box sx={{ mt: 6, mb: 5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography
            variant="h4"
            sx={{ 
              fontWeight: 'bold', 
              color: 'primary.main',
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            ✨ Recommended for You
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => refetch()}
            sx={{ borderRadius: 20 }}
          >
            Refresh
          </Button>
        </Box>

        <Grid container spacing={3}>
          {productsToShow.map((item, index) => {
            const product = item.product;
            const finalPrice = (product.price * price).toFixed(2);
            
            return (
              <Grid item xs={12} sm={6} md={3} key={product._id}>
                <motion.div
                  whileHover={{ scale: 1.03, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    sx={{
                      borderRadius: 3,
                      overflow: 'hidden',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      '&:hover': {
                        boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                      },
                    }}
                  >
                    {/* Recommendation Badge */}
                    <Chip
                      label={item.reason || 'Recommended'}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        zIndex: 2,
                        bgcolor: 'primary.main',
                        color: 'white',
                        fontSize: '0.7rem',
                      }}
                    />

                    {/* Favorite Button */}
                    <IconButton
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        zIndex: 2,
                        bgcolor: 'rgba(255,255,255,0.9)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,1)' },
                      }}
                      onClick={() => toggleFavorite(product._id)}
                    >
                      {favorites.has(product._id) ? (
                        <FaHeart color="#e91e63" />
                      ) : (
                        <FaRegHeart />
                      )}
                    </IconButton>

                    <CardMedia
                      component="img"
                      height="200"
                      image={product.image || '/placeholder-product.jpg'}
                      alt={product.name}
                      sx={{ objectFit: 'cover' }}
                    />

                    <CardContent sx={{ p: 2 }}>
                      <Typography
                        variant="h6"
                        component={Link}
                        to={`/product/${product._id}`}
                        onClick={() => handleProductClick(product)}
                        sx={{
                          fontSize: '0.95rem',
                          fontWeight: 600,
                          color: 'text.primary',
                          textDecoration: 'none',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          '&:hover': { color: 'primary.main' },
                        }}
                      >
                        {product.name}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <Rating value={product.rating || 0} size="small" readOnly />
                        <Typography variant="caption" color="text.secondary">
                          ({product.numReviews || 0})
                        </Typography>
                      </Box>

                      <Typography
                        variant="h6"
                        sx={{ color: 'primary.main', fontWeight: 'bold', mt: 1 }}
                      >
                        {getCurrencySymbol()}{finalPrice}
                      </Typography>

                      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                        <Button
                          fullWidth
                          variant="contained"
                          size="small"
                          startIcon={<FaShoppingCart />}
                          onClick={() => handleAddToCart(product)}
                          sx={{ borderRadius: 20 }}
                        >
                          Add to Cart
                        </Button>
                        <IconButton
                          component={Link}
                          to={`/product/${product._id}`}
                          onClick={() => handleProductClick(product)}
                          sx={{ border: 1, borderColor: 'divider' }}
                        >
                          <FaEye />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            );
          })}
        </Grid>

        {/* Show More Button */}
        {recommendations.data.personalized.length > displayLimit && (
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Button
              variant="outlined"
              onClick={() => setDisplayLimit(prev => prev + 4)}
              sx={{ borderRadius: 20 }}
            >
              Show More Recommendations
            </Button>
          </Box>
        )}
      </Box>
    </motion.div>
  );
};

export default PersonalizedRecommendations;