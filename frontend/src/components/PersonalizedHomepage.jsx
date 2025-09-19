import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Grid,
  Container,
  Skeleton,
  Avatar,
  Paper,
  IconButton,
  Badge,
  Divider,
  LinearProgress,
} from '@mui/material';
import {
  LocationOn,
  TrendingUp,
  LocalOffer,
  Schedule,
  Star,
  ShoppingCart,
  Favorite,
  FavoriteBorder,
  NavigateNext,
  FlashOn,
  LocalShipping,
  Security,
  Verified,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useGetPersonalizedRecommendationsQuery, useTrackBehaviorMutation } from '../redux/api/recommendationApiSlice';
import { useGetUserLocationQuery, useGetLocationBasedProductsQuery, useUpdateUserLocationMutation } from '../redux/api/locationApiSlice';
import { useGetFlashSalesQuery, useGetTrendingProductsQuery } from '../redux/api/productApiSlice';
import { addToCart } from '../redux/features/cart/cartSlice';
import { toast } from 'react-toastify';
import Product from '../pages/Products/Product';
import ResponsiveProductGrid from './ResponsiveProductGrid';

const PersonalizedHomepage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);
  const currency = useSelector((state) => state.currency.selectedCurrency);
  
  const [favorites, setFavorites] = useState(new Set());
  const [userLocation, setUserLocation] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // API calls for personalized content
  const { data: personalizedRecs, isLoading: recsLoading } = useGetPersonalizedRecommendationsQuery(
    { page: 'homepage', cartItems, forceRefresh: false },
    { skip: !userInfo }
  );

  const { data: locationData, isLoading: locationLoading, isError: locationError } = useGetUserLocationQuery(
    {},
    { skip: !userInfo }
  );

  const { data: locationProducts, isLoading: locationProductsLoading } = useGetLocationBasedProductsQuery(
    { location: userLocation || locationData?.location, limit: 12 },
    { skip: !userLocation && !locationData?.location }
  );

  const { data: flashSales, isLoading: flashSalesLoading } = useGetFlashSalesQuery({
    active: true,
    limit: 8
  });

  const { data: trendingProducts, isLoading: trendingLoading } = useGetTrendingProductsQuery({
    limit: 12,
    location: userLocation || locationData?.location
  });

  const [trackBehavior] = useTrackBehaviorMutation();
  const [updateUserLocation] = useUpdateUserLocationMutation();

  // Get user's current location
  useEffect(() => {
    if (!userInfo) return;

    const fetchLocation = async () => {
      // Try browser geolocation first
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            };
            setUserLocation(location);
            
            // Update user location in backend
            updateUserLocation(location);
            
            // Track location-based behavior
            trackBehavior({
              type: 'location_detected',
              source: 'homepage',
              metadata: { location }
            });
          },
          (error) => {
            console.log('Location access denied:', error);
            // Even if geolocation fails, we still want to get location data from backend
            // The backend will try to determine location from IP address
          }
        );
      }
    };

    fetchLocation();
  }, [userInfo, trackBehavior, updateUserLocation]);

  // Update current time every minute for flash sale countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Track page view
  useEffect(() => {
    if (userInfo) {
      trackBehavior({
        type: 'page_view',
        source: 'homepage',
        metadata: { 
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          location: userLocation
        }
      });
    }
  }, [userInfo, userLocation, trackBehavior]);

  const handleAddToCart = (product, quantity = 1) => {
    dispatch(addToCart({ ...product, qty: quantity }));
    toast.success('Added to cart!');
    
    // Track add to cart behavior
    trackBehavior({
      type: 'add_to_cart',
      source: 'homepage',
      metadata: { 
        productId: product._id,
        price: product.price,
        quantity
      }
    });
  };

  const toggleFavorite = (productId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId);
    } else {
      newFavorites.add(productId);
    }
    setFavorites(newFavorites);

    // Track wishlist behavior
    trackBehavior({
      type: 'toggle_wishlist',
      source: 'homepage',
      metadata: { 
        productId,
        action: newFavorites.has(productId) ? 'add' : 'remove'
      }
    });
  };

  const getTimeBasedGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getFlashSaleCountdown = (endTime) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;
    
    if (diff <= 0) return 'Ended';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m left`;
  };

  const SectionSkeleton = ({ count = 4 }) => (
    <Grid container spacing={2}>
      {Array.from({ length: count }).map((_, index) => (
        <Grid xs={6} sm={4} md={3} key={index}>
          <Card>
            <Skeleton variant="rectangular" height={200} />
            <CardContent>
              <Skeleton variant="text" height={24} />
              <Skeleton variant="text" height={20} width="60%" />
              <Skeleton variant="text" height={28} width="40%" />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Personalized Welcome Section */}
      {userInfo && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Paper 
            sx={{ 
              p: 3, 
              mb: 4, 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: 3
            }}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar 
                sx={{ width: 60, height: 60, bgcolor: 'rgba(255,255,255,0.2)' }}
              >
                {userInfo.username?.charAt(0).toUpperCase()}
              </Avatar>
              <Box flex={1}>
                <Typography variant="h5" fontWeight="bold">
                  {getTimeBasedGreeting()}, {userInfo.username}!
                </Typography>
                <Box display="flex" alignItems="center" gap={1} mt={1}>
                  <LocationOn fontSize="small" />
                  <Typography variant="body2">
                    {locationLoading ? 'Loading location...' : 
                     locationError ? 'Location not available' : 
                     locationData?.city || 'Location not available'}
                  </Typography>
                </Box>
              </Box>
              <Box textAlign="center">
                <Typography variant="h6" fontWeight="bold">
                  {cartItems?.length || 0}
                </Typography>
                <Typography variant="body2">Items in Cart</Typography>
              </Box>
            </Box>
          </Paper>
        </motion.div>
      )}

      {/* Flash Sales Section */}
      {flashSales?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Paper sx={{ p: 3, mb: 4, bgcolor: '#fff3e0', borderRadius: 3 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <FlashOn sx={{ color: '#ff9800' }} />
                <Typography variant="h5" fontWeight="bold" color="#e65100">
                  Flash Sale
                </Typography>
                <Chip 
                  label={getFlashSaleCountdown(flashSales[0]?.endTime)}
                  color="error"
                  size="small"
                  icon={<Schedule />}
                />
              </Box>
              <Button 
                component={Link} 
                to="/flash-sales"
                endIcon={<NavigateNext />}
                sx={{ color: '#e65100' }}
              >
                View All
              </Button>
            </Box>
            
            {flashSalesLoading ? (
              <SectionSkeleton count={4} />
            ) : (
              <ResponsiveProductGrid spacing={2}>
                {flashSales.slice(0, 8).map((product) => (
                  <motion.div
                    key={product._id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Product product={product} showDiscountBadge />
                  </motion.div>
                ))}
              </ResponsiveProductGrid>
            )}
          </Paper>
        </motion.div>
      )}

      {/* Personalized Recommendations */}
      {userInfo && personalizedRecs?.products?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Box mb={4}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h5" fontWeight="bold" color="primary.main">
                Recommended for You
              </Typography>
              <Button 
                component={Link} 
                to="/recommendations"
                endIcon={<NavigateNext />}
              >
                View All
              </Button>
            </Box>
            
            {recsLoading ? (
              <SectionSkeleton count={6} />
            ) : (
              <ResponsiveProductGrid spacing={2}>
                {personalizedRecs.products.slice(0, 12).map((product) => (
                  <motion.div
                    key={product._id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Product 
                      product={product} 
                      showPersonalizationScore={personalizedRecs.scores?.[product._id]}
                    />
                  </motion.div>
                ))}
              </ResponsiveProductGrid>
            )}
          </Box>
        </motion.div>
      )}

      {/* Location-Based Products */}
      {locationProducts?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Box mb={4}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <LocationOn color="primary" />
                <Typography variant="h5" fontWeight="bold">
                  Popular in {locationLoading ? 'Loading...' : 
                             locationError ? 'Your Area' : 
                             locationData?.city || 'Your Area'}
                </Typography>
              </Box>
              <Button 
                component={Link} 
                to={`/location-products?city=${locationData?.city || 'unknown'}`}
                endIcon={<NavigateNext />}
                disabled={locationLoading || !locationData?.city}
              >
                View All
              </Button>
            </Box>
            
            {locationProductsLoading ? (
              <SectionSkeleton count={6} />
            ) : (
              <ResponsiveProductGrid spacing={2}>
                {locationProducts.slice(0, 12).map((product) => (
                  <motion.div
                    key={product._id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Product 
                      product={product} 
                      showLocationBadge
                      locationData={locationData}
                    />
                  </motion.div>
                ))}
              </ResponsiveProductGrid>
            )}
          </Box>
        </motion.div>
      )}

      {/* Trending Products */}
      {trendingProducts?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Box mb={4}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <TrendingUp color="error" />
                <Typography variant="h5" fontWeight="bold" color="#d32f2f">
                  Trending Now
                </Typography>
              </Box>
              <Button 
                component={Link} 
                to="/trending"
                endIcon={<NavigateNext />}
              >
                View All
              </Button>
            </Box>
            
            {trendingLoading ? (
              <SectionSkeleton count={6} />
            ) : (
              <ResponsiveProductGrid spacing={2}>
                {trendingProducts.slice(0, 12).map((product, index) => (
                  <motion.div
                    key={product._id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Product 
                      product={product} 
                      showTrendingBadge
                      trendingRank={index + 1}
                    />
                  </motion.div>
                ))}
              </ResponsiveProductGrid>
            )}
          </Box>
        </motion.div>
      )}

      {/* Trust Indicators */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <Paper sx={{ p: 3, mt: 4, borderRadius: 3, bgcolor: '#f8f9fa' }}>
          <Grid container spacing={3} textAlign="center">
            <Grid item xs={6} md={3}>
              <Box display="flex" flexDirection="column" alignItems="center">
                <LocalShipping sx={{ fontSize: 40, color: '#4caf50', mb: 1 }} />
                <Typography variant="h6" fontWeight="bold">Free Shipping</Typography>
                <Typography variant="body2" color="text.secondary">
                  On orders over $50
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box display="flex" flexDirection="column" alignItems="center">
                <Security sx={{ fontSize: 40, color: '#2196f3', mb: 1 }} />
                <Typography variant="h6" fontWeight="bold">Secure Payment</Typography>
                <Typography variant="body2" color="text.secondary">
                  Your payment is safe
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box display="flex" flexDirection="column" alignItems="center">
                <Verified sx={{ fontSize: 40, color: '#ff9800', mb: 1 }} />
                <Typography variant="h6" fontWeight="bold">Quality Assured</Typography>
                <Typography variant="body2" color="text.secondary">
                  Verified products only
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box display="flex" flexDirection="column" alignItems="center">
                <Schedule sx={{ fontSize: 40, color: '#9c27b0', mb: 1 }} />
                <Typography variant="h6" fontWeight="bold">24/7 Support</Typography>
                <Typography variant="body2" color="text.secondary">
                  Round the clock help
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default PersonalizedHomepage;