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
  FormControl,
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material';
import { motion } from 'framer-motion';
import { FaHeart, FaRegHeart, FaShoppingCart, FaEye,  } from 'react-icons/fa';
import { IoIosTrendingUp as FaTrendingUp } from "react-icons/io";
import { Link } from 'react-router-dom';
import { useGetTrendingProductsQuery, useTrackBehaviorMutation } from '../redux/api/recommendationApiSlice';
import { useFetchCategoriesQuery } from '../redux/api/categoryApiSlice';
import { addToCart } from '../redux/features/cart/cartSlice';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

const TrendingProducts = ({ limit = 8, showFilters = true }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const currency = useSelector((state) => state.currency.selectedCurrency);
  const price = useSelector((state) => state.currency.price);
  const dispatch = useDispatch();

  const [favorites, setFavorites] = useState(new Set());
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState('');

  // API calls
  const { 
    data: trendingProducts, 
    isLoading, 
    error,
    refetch 
  } = useGetTrendingProductsQuery({ 
    limit, 
    category: selectedCategory || undefined,
    priceRange: priceRange || undefined 
  });

  const { data: categories } = useFetchCategoriesQuery();
  const [trackBehavior] = useTrackBehaviorMutation();

  // Track viewing trending section
  useEffect(() => {
    if (userInfo) {
      trackBehavior({
        type: 'view_section',
        source: 'homepage',
        metadata: { section: 'trending_products' }
      });
    }
  }, [userInfo, trackBehavior]);

  // Refetch when filters change
  useEffect(() => {
    refetch();
  }, [selectedCategory, priceRange, refetch]);

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
        source: 'trending_products',
        metadata: { 
          section: 'trending_products',
          trend_score: product.trendScore 
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
        source: 'trending_products',
        metadata: { section: 'trending_products' }
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
        source: 'trending_products',
        metadata: { action: favorites.has(productId) ? 'remove' : 'add' }
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ mt: 6, mb: 5 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3, textAlign: 'center' }}>
          🔥 Trending Now
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
          Unable to load trending products at this time.
        </Alert>
      </Box>
    );
  }

  // No trending products
  if (!trendingProducts?.data?.length) {
    return null;
  }

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
              color: '#ff5722',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <FaTrendingUp /> Trending Now
          </Typography>
          
          {showFilters && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  label="Category"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories?.map((category) => (
                    <MenuItem key={category._id} value={category._id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Price Range</InputLabel>
                <Select
                  value={priceRange}
                  label="Price Range"
                  onChange={(e) => setPriceRange(e.target.value)}
                >
                  <MenuItem value="">All Prices</MenuItem>
                  <MenuItem value="0-50">$0 - $50</MenuItem>
                  <MenuItem value="50-100">$50 - $100</MenuItem>
                  <MenuItem value="100-200">$100 - $200</MenuItem>
                  <MenuItem value="200-500">$200 - $500</MenuItem>
                  <MenuItem value="500-1000">$500+</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </Box>

        <Grid container spacing={3}>
          {trendingProducts.data.map((item, index) => {
            const product = item.product;
            const finalPrice = (product.price * price).toFixed(2);
            
            return (
              <Grid item xs={12} sm={6} md={3} key={product._id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.03, y: -5 }}
                >
                  <Card
                    sx={{
                      borderRadius: 3,
                      overflow: 'hidden',
                      boxShadow: '0 4px 20px rgba(255,87,34,0.1)',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      '&:hover': {
                        boxShadow: '0 8px 30px rgba(255,87,34,0.2)',
                      },
                    }}
                  >
                    {/* Trending Badge */}
                    <Chip
                      icon={<FaTrendingUp />}
                      label={`#${index + 1} Trending`}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        zIndex: 2,
                        bgcolor: '#ff5722',
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
                        sx={{ color: '#ff5722', fontWeight: 'bold', mt: 1 }}
                      >
                        {getCurrencySymbol()}{finalPrice}
                      </Typography>

                      {item.trendScore && (
                        <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                          Trend Score: {Math.round(item.trendScore * 100)}%
                        </Typography>
                      )}

                      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                        <Button
                          fullWidth
                          variant="contained"
                          size="small"
                          startIcon={<FaShoppingCart />}
                          onClick={() => handleAddToCart(product)}
                          sx={{ 
                            borderRadius: 20,
                            bgcolor: '#ff5722',
                            '&:hover': { bgcolor: '#e64a19' }
                          }}
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

export default TrendingProducts;