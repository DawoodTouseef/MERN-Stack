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
  Rating,
  IconButton,
  Skeleton,
  Alert,
  Chip,
} from '@mui/material';
import { motion } from 'framer-motion';
import { FaShoppingCart, FaEye, FaPlus } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useGetCartRecommendationsMutation, useTrackBehaviorMutation } from '../redux/api/recommendationApiSlice';
import { addToCart } from '../redux/features/cart/cartSlice';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

const CartRecommendations = ({ cartItems, limit = 6 }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const currency = useSelector((state) => state.currency.selectedCurrency);
  const price = useSelector((state) => state.currency.price);
  const dispatch = useDispatch();

  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // API calls
  const [getCartRecommendations] = useGetCartRecommendationsMutation();
  const [trackBehavior] = useTrackBehaviorMutation();

  // Fetch cart recommendations when cart items change
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!cartItems || cartItems.length === 0) {
        setRecommendations([]);
        return;
      }

      setIsLoading(true);
      try {
        const result = await getCartRecommendations({ 
          cartItems: cartItems.map(item => ({
            productId: item._id,
            quantity: item.qty
          })), 
          limit 
        }).unwrap();
        
        setRecommendations(result.data || []);

        // Track viewing cart recommendations
        if (userInfo) {
          trackBehavior({
            type: 'view_section',
            source: 'cart',
            metadata: { 
              section: 'cart_recommendations',
              cart_items_count: cartItems.length 
            }
          });
        }
      } catch (error) {
        console.error('Error fetching cart recommendations:', error);
        setRecommendations([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [cartItems, limit, getCartRecommendations, userInfo, trackBehavior]);

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
          recommendation_type: 'frequently_bought_together' 
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
          recommendation_type: 'frequently_bought_together' 
        }
      });
    }
  };

  // Don't render if no cart items
  if (!cartItems || cartItems.length === 0) {
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ mt: 4, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
          Frequently Bought Together
        </Typography>
        <Grid container spacing={2}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ borderRadius: 2 }}>
                <Skeleton variant="rectangular" height={150} />
                <CardContent>
                  <Skeleton variant="text" />
                  <Skeleton variant="text" width="60%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  // No recommendations
  if (!recommendations.length) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ mt: 4, mb: 3 }}>
        <Typography
          variant="h6"
          sx={{ 
            fontWeight: 'bold', 
            mb: 2,
            color: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <FaPlus /> Frequently Bought Together
        </Typography>

        <Grid container spacing={2}>
          {recommendations.map((item, index) => {
            const product = item.product;
            const finalPrice = (product.price * price).toFixed(2);
            
            return (
              <Grid item xs={12} sm={6} md={4} key={product._id}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card
                    sx={{
                      borderRadius: 2,
                      overflow: 'hidden',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      '&:hover': {
                        boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                      },
                    }}
                  >
                    {/* Recommendation Badge */}
                    <Chip
                      label={`${Math.round((item.confidence || 0.8) * 100)}% match`}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        zIndex: 2,
                        bgcolor: 'warning.main',
                        color: 'white',
                        fontSize: '0.7rem',
                      }}
                    />

                    <CardMedia
                      component="img"
                      height="150"
                      image={product.image || '/placeholder-product.jpg'}
                      alt={product.name}
                      sx={{ objectFit: 'cover' }}
                    />

                    <CardContent sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <Typography
                        variant="subtitle2"
                        component={Link}
                        to={`/product/${product._id}`}
                        onClick={() => handleProductClick(product)}
                        sx={{
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          color: 'text.primary',
                          textDecoration: 'none',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          flexGrow: 1,
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
                        sx={{ color: 'primary.main', fontWeight: 'bold', mt: 1, fontSize: '1rem' }}
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
                          sx={{ 
                            borderRadius: 20,
                            fontSize: '0.75rem',
                            py: 0.5,
                          }}
                        >
                          Add to Cart
                        </Button>
                        <IconButton
                          component={Link}
                          to={`/product/${product._id}`}
                          onClick={() => handleProductClick(product)}
                          sx={{ 
                            border: 1, 
                            borderColor: 'divider',
                            width: 36,
                            height: 36,
                          }}
                        >
                          <FaEye size={14} />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            );
          })}
        </Grid>

        {/* Purchase incentive */}
        <Box
          sx={{
            mt: 3,
            p: 2,
            bgcolor: 'success.light',
            borderRadius: 2,
            textAlign: 'center',
          }}
        >
          <Typography variant="body2" sx={{ color: 'success.dark', fontWeight: 500 }}>
            💡 Customers who bought items in your cart also purchased these products
          </Typography>
        </Box>
      </Box>
    </motion.div>
  );
};

export default CartRecommendations;