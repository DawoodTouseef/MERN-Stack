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
import { FaHeart, FaRegHeart, FaShoppingCart, FaEye } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useGetProductRecommendationsQuery, useTrackBehaviorMutation } from '../redux/api/recommendationApiSlice';
import { addToCart } from '../redux/features/cart/cartSlice';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

const SimilarProducts = ({ productId, limit = 6 }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const currency = useSelector((state) => state.currency.selectedCurrency);
  const price = useSelector((state) => state.currency.price);
  const dispatch = useDispatch();

  const [favorites, setFavorites] = useState(new Set());

  // API calls
  const { 
    data: similarProducts, 
    isLoading, 
    error 
  } = useGetProductRecommendationsQuery({ productId, limit });

  const [trackBehavior] = useTrackBehaviorMutation();

  // Track viewing similar products section
  useEffect(() => {
    if (userInfo && productId) {
      trackBehavior({
        type: 'view_section',
        productId,
        source: 'product_details',
        metadata: { section: 'similar_products' }
      });
    }
  }, [userInfo, productId, trackBehavior]);

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
        source: 'similar_products',
        metadata: { 
          section: 'similar_products',
          original_product: productId,
          similarity_score: product.similarityScore 
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
        source: 'similar_products',
        metadata: { 
          section: 'similar_products',
          original_product: productId 
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
        source: 'similar_products',
        metadata: { action: favorites.has(productId) ? 'remove' : 'add' }
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ mt: 6, mb: 5 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
          Similar Products
        </Typography>
        <Grid container spacing={3}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ borderRadius: 3 }}>
                <Skeleton variant="rectangular" height={180} />
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
          Unable to load similar products at this time.
        </Alert>
      </Box>
    );
  }

  // No similar products
  if (!similarProducts?.data?.length) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Box sx={{ mt: 6, mb: 5 }}>
        <Typography
          variant="h5"
          sx={{ 
            fontWeight: 'bold', 
            mb: 3,
            color: 'text.primary',
          }}
        >
          🔍 Similar Products You Might Like
        </Typography>

        <Grid container spacing={3}>
          {similarProducts.data.map((product, index) => {
            const finalPrice = (product.price * price).toFixed(2);
            
            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.03 }}
                >
                  <Card
                    sx={{
                      borderRadius: 3,
                      overflow: 'hidden',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      '&:hover': {
                        boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                      },
                    }}
                  >
                    {/* Similarity Badge */}
                    {product.similarityScore && (
                      <Chip
                        label={`${Math.round(product.similarityScore * 100)}% match`}
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          zIndex: 2,
                          bgcolor: 'success.main',
                          color: 'white',
                          fontSize: '0.7rem',
                        }}
                      />
                    )}

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
                      height="180"
                      image={product.image || '/placeholder-product.jpg'}
                      alt={product.name}
                      sx={{ objectFit: 'cover' }}
                    />

                    <CardContent sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <Typography
                        variant="h6"
                        component={Link}
                        to={`/product/${product._id}`}
                        onClick={() => handleProductClick(product)}
                        sx={{
                          fontSize: '0.9rem',
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

                      {product.reason && (
                        <Typography
                          variant="caption"
                          sx={{ 
                            color: 'text.secondary',
                            fontStyle: 'italic',
                            mt: 0.5,
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {product.reason}
                        </Typography>
                      )}

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
      </Box>
    </motion.div>
  );
};

export default SimilarProducts;