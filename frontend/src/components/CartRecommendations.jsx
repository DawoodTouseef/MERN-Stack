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
  useTheme,
  alpha,
} from '@mui/material';
import { motion } from 'framer-motion';
import { FaHeart, FaRegHeart, FaShoppingCart, FaEye } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useGetCartRecommendationsMutation, useTrackBehaviorMutation } from '../redux/api/recommendationApiSlice';
import { addToCart } from '../redux/features/cart/cartSlice';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import ProductCard from '../pages/Products/ProductCard';

const CartRecommendations = ({ cartItems = [], limit = 6 }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const currency = useSelector((state) => state.currency.selectedCurrency);
  const price = useSelector((state) => state.currency.price);

  const [favorites, setFavorites] = useState(new Set());
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // API calls
  const [getCartRecommendations] = useGetCartRecommendationsMutation();
  const [trackBehavior] = useTrackBehaviorMutation();

  // Fetch recommendations when cart items change
  useEffect(() => {
    if (cartItems && cartItems.length > 0) {
      fetchRecommendations();
    }
  }, [cartItems]);

  const fetchRecommendations = async () => {
    if (cartItems.length === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await getCartRecommendations({
        cartItems: cartItems.map(item => ({
          productId: item._id,
          quantity: item.qty,
          category: item.category?._id,
          brand: item.brand?._id
        })),
        limit
      }).unwrap();
      
      setRecommendedProducts(response.data || []);
      
      // Track recommendation view
      if (userInfo) {
        trackBehavior({
          type: 'recommendation_view',
          source: 'cart',
          metadata: { 
            section: 'cart_recommendations',
            count: response.data?.length || 0
          }
        });
      }
    } catch (err) {
      console.error('Failed to fetch cart recommendations:', err);
      setError('Unable to load recommendations at this time.');
    } finally {
      setLoading(false);
    }
  };

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
        source: 'cart_recommendations',
        metadata: { 
          section: 'cart_recommendations',
          recommendation_type: 'cart_based'
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
        source: 'cart_recommendations',
        metadata: { 
          section: 'cart_recommendations',
          recommendation_type: 'cart_based'
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
        source: 'cart_recommendations',
        metadata: { action: favorites.has(productId) ? 'remove' : 'add' }
      });
    }
  };

  // Don't render if no cart items
  if (!cartItems || cartItems.length === 0) {
    return null;
  }

  // Loading state
  if (loading) {
    return (
      <Box sx={{ mt: 6, mb: 5 }}>
        <Typography 
          variant="h5" 
          fontWeight={700}
          sx={{ 
            mb: 3, 
            textAlign: 'center',
            color: theme.palette.primary.main
          }}
        >
          You Might Also Like
        </Typography>
        <Grid container spacing={3}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
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
        <Alert 
          severity="info" 
          sx={{ 
            borderRadius: 2,
            bgcolor: alpha(theme.palette.info.main, 0.1)
          }}
        >
          {error}
        </Alert>
      </Box>
    );
  }

  // No recommendations
  if (!recommendedProducts?.length) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Box sx={{ mt: 6, mb: 5 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 4,
          pb: 2,
          borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`
        }}>
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{ 
              color: theme.palette.primary.main,
              position: 'relative',
              display: 'inline-block',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -8,
                left: 0,
                width: 60,
                height: 4,
                bgcolor: theme.palette.secondary.main,
                borderRadius: 2
              }
            }}
          >
            🛒 You Might Also Like
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {recommendedProducts.map((product, index) => {
            const finalPrice = (product.price * price).toFixed(2);
            
            return (
              <Grid item xs={12} sm={6} md={4} key={product._id}>
                <motion.div
                  whileHover={{ 
                    y: -8,
                    transition: { duration: 0.2 }
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    sx={{
                      borderRadius: 3,
                      overflow: 'hidden',
                      boxShadow: 2,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      '&:hover': {
                        boxShadow: 6,
                        transform: 'translateY(-4px)',
                      },
                    }}
                  >
                    {/* Favorite Button */}
                    <IconButton
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        zIndex: 2,
                        bgcolor: alpha(theme.palette.background.paper, 0.8),
                        backdropFilter: 'blur(10px)',
                        '&:hover': { 
                          bgcolor: alpha(theme.palette.error.main, 0.1),
                          color: theme.palette.error.main
                        },
                      }}
                      onClick={() => toggleFavorite(product._id)}
                    >
                      {favorites.has(product._id) ? (
                        <FaHeart color={theme.palette.error.main} />
                      ) : (
                        <FaRegHeart />
                      )}
                    </IconButton>

                    <CardMedia
                      component="img"
                      height="200"
                      image={product.media?.[0]?.url || '/placeholder-product.jpg'}
                      alt={product.name}
                      sx={{ 
                        objectFit: 'cover',
                        borderBottom: `1px solid ${theme.palette.divider}`
                      }}
                    />

                    <CardContent sx={{ 
                      p: 2, 
                      flexGrow: 1,
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      <Typography
                        variant="h6"
                        component={Link}
                        to={`/product/${product._id}`}
                        onClick={() => handleProductClick(product)}
                        sx={{
                          fontSize: '1.1rem',
                          fontWeight: 700,
                          color: theme.palette.text.primary,
                          textDecoration: 'none',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          mb: 1,
                          flex: 1,
                          '&:hover': { color: theme.palette.primary.main },
                        }}
                      >
                        {product.name}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Rating 
                          value={product.rating || 0} 
                          size="small" 
                          readOnly 
                          precision={0.5}
                        />
                        <Typography variant="caption" color="text.secondary">
                          ({product.numReviews || 0})
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Chip
                          label={product.category?.name || 'Category'}
                          size="small"
                          variant="outlined"
                          sx={{
                            borderColor: alpha(theme.palette.primary.main, 0.3),
                            color: theme.palette.primary.main,
                            fontWeight: 500,
                            mr: 1
                          }}
                        />
                        <Chip
                          label={product.brand?.name || 'Brand'}
                          size="small"
                          variant="outlined"
                          sx={{
                            borderColor: alpha(theme.palette.secondary.main, 0.3),
                            color: theme.palette.secondary.main,
                            fontWeight: 500
                          }}
                        />
                      </Box>

                      <Typography
                        variant="h6"
                        sx={{ 
                          color: theme.palette.primary.main, 
                          fontWeight: 800,
                          fontSize: '1.25rem',
                          mb: 2
                        }}
                      >
                        {getCurrencySymbol()}{finalPrice}
                      </Typography>

                      <Box sx={{ 
                        display: 'flex', 
                        gap: 1, 
                        mt: 'auto',
                        pt: 1
                      }}>
                        <Button
                          fullWidth
                          variant="contained"
                          size="small"
                          startIcon={<FaShoppingCart />}
                          onClick={() => handleAddToCart(product)}
                          sx={{ 
                            borderRadius: 2,
                            py: 1,
                            fontWeight: 600,
                            textTransform: 'none',
                            background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                            boxShadow: 2,
                            '&:hover': {
                              boxShadow: 4,
                              transform: 'translateY(-2px)'
                            }
                          }}
                        >
                          Add to Cart
                        </Button>
                        <IconButton
                          component={Link}
                          to={`/product/${product._id}`}
                          onClick={() => handleProductClick(product)}
                          sx={{ 
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: 2,
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              borderColor: theme.palette.primary.main
                            }
                          }}
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
      </Box>
    </motion.div>
  );
};

export default CartRecommendations;