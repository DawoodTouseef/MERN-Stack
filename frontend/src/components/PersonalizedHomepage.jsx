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
  Stack,
  useTheme,
  alpha
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
  const theme = useTheme();
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
        <Grid item xs={6} sm={4} md={3} key={index}>
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
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 5 },
              mb: 8,
              background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
              color: 'white',
              borderRadius: 5,
              position: 'relative',
              overflow: 'hidden',
              boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.2)}`
            }}
          >
            {/* Ambient Background Glow */}
            <Box sx={{
              position: 'absolute',
              top: -100,
              right: -100,
              width: 300,
              height: 300,
              borderRadius: '50%',
              background: alpha('#fff', 0.1),
              filter: 'blur(50px)',
              zIndex: 1
            }} />

            <Stack
              direction={{ xs: 'column', md: 'row' }}
              alignItems="center"
              spacing={4}
              sx={{ position: 'relative', zIndex: 2 }}
            >
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: alpha('#fff', 0.2),
                  border: '4px solid rgba(255,255,255,0.3)',
                  fontSize: '2.5rem',
                  fontWeight: 800
                }}
              >
                {userInfo.username?.charAt(0).toUpperCase()}
              </Avatar>

              <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
                <Typography variant="h3" fontWeight="900" sx={{ mb: 1, letterSpacing: '-0.02em' }}>
                  {getTimeBasedGreeting()}, <Box component="span" sx={{ color: theme.palette.secondary.light }}>{userInfo.username}</Box>
                </Typography>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent={{ xs: 'center', md: 'flex-start' }}
                  spacing={1}
                  sx={{ opacity: 0.9 }}
                >
                  <LocationOn fontSize="small" />
                  <Typography variant="h6" fontWeight="400">
                    {locationLoading ? 'Detecting your trends...' :
                      locationError ? 'Global Marketplace' :
                        `Exclusives in ${locationData?.city || 'your area'}`}
                  </Typography>
                </Stack>
              </Box>

              <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' }, borderColor: alpha('#fff', 0.2) }} />

              <Stack direction="row" spacing={4} sx={{ textAlign: 'center' }}>
                <Box>
                  <Typography variant="h4" fontWeight="900">{cartItems?.length || 0}</Typography>
                  <Typography variant="overline" sx={{ opacity: 0.8, fontWeight: 700 }}>In Cart</Typography>
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="900">{personalizedRecs?.products?.length || 0}</Typography>
                  <Typography variant="overline" sx={{ opacity: 0.8, fontWeight: 700 }}>For You</Typography>
                </Box>
              </Stack>
            </Stack>
          </Paper>
        </motion.div>
      )}

      {/* Flash Sales Section */}
      {flashSales?.length > 0 && (
        <Box sx={{ mb: 10 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems="center"
            justifyContent="space-between"
            spacing={2}
            sx={{ mb: 4, textAlign: { xs: "center", sm: "left" } }}
          >
            <Box>
              <Stack direction="row" alignItems="center" spacing={1} justifyContent={{ xs: "center", sm: "flex-start" }}>
                <FlashOn sx={{ color: theme.palette.error.main }} />
                <Typography variant="h4" fontWeight="900" sx={{ letterSpacing: "-0.02em", color: theme.palette.error.main }}>
                  Flash Sale
                </Typography>
                <Chip
                  label={getFlashSaleCountdown(flashSales[0]?.endTime)}
                  color="error"
                  size="small"
                  variant="outlined"
                  icon={<Schedule />}
                  sx={{ fontWeight: 700, borderRadius: 1 }}
                />
              </Stack>
              <Typography variant="h6" color="text.secondary" fontWeight="400">
                Limited time offers. Grab them before they vanish!
              </Typography>
            </Box>
            <Button
              component={Link}
              to="/flash-sales"
              variant="outlined"
              color="error"
              sx={{ borderRadius: 3, px: 4, fontWeight: 700 }}
            >
              Explore Deals
            </Button>
          </Stack>

          {flashSalesLoading ? (
            <SectionSkeleton count={4} />
          ) : (
            <ResponsiveProductGrid spacing={2}>
              {flashSales.slice(0, 8).map((product) => (
                <motion.div
                  key={product._id}
                  whileHover={{ y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Product product={product} showDiscountBadge />
                </motion.div>
              ))}
            </ResponsiveProductGrid>
          )}
        </Box>
      )}

      {/* Personalized Recommendations */}
      {userInfo && personalizedRecs?.products?.length > 0 && (
        <Box sx={{ mb: 10 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
            sx={{ mb: 4, textAlign: { xs: "center", sm: "left" } }}
          >
            <Box>
              <Typography variant="h4" fontWeight="900" sx={{ letterSpacing: "-0.02em" }}>
                Recommended <Box component="span" sx={{ color: theme.palette.primary.main }}>for You</Box>
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
                Based on your style and browsing fingerprint
              </Typography>
            </Box>
            <Button
              component={Link}
              to="/recommendations"
              sx={{ fontWeight: 700, color: theme.palette.primary.main }}
            >
              View All
            </Button>
          </Stack>

          {recsLoading ? (
            <SectionSkeleton count={6} />
          ) : (
            <ResponsiveProductGrid spacing={2}>
              {personalizedRecs.products.slice(0, 12).map((product) => (
                <motion.div
                  key={product._id}
                  whileHover={{ y: -10 }}
                  transition={{ duration: 0.3 }}
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
      )}

      {/* Location-Based Products */}
      {locationProducts?.length > 0 && (
        <Box sx={{ mb: 10 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
            sx={{ mb: 4, textAlign: { xs: "center", sm: "left" } }}
          >
            <Box>
              <Stack direction="row" alignItems="center" spacing={1} justifyContent={{ xs: "center", sm: "flex-start" }}>
                <LocationOn color="primary" />
                <Typography variant="h4" fontWeight="900" sx={{ letterSpacing: "-0.02em" }}>
                  Popular in <Box component="span" sx={{ color: theme.palette.primary.main }}>{locationLoading ? "..." : locationData?.city || "Your Area"}</Box>
                </Typography>
              </Stack>
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
                What's trending right now in your local neighborhood
              </Typography>
            </Box>
            <Button
              component={Link}
              to={`/location-products?city=${locationData?.city || "unknown"}`}
              disabled={locationLoading || !locationData?.city}
              sx={{ fontWeight: 700, color: theme.palette.primary.main }}
            >
              Nearby Catalog
            </Button>
          </Stack>

          {locationProductsLoading ? (
            <SectionSkeleton count={6} />
          ) : (
            <ResponsiveProductGrid spacing={2}>
              {locationProducts.slice(0, 12).map((product) => (
                <motion.div
                  key={product._id}
                  whileHover={{ y: -10 }}
                  transition={{ duration: 0.3 }}
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
      )}

      {/* Trending Products */}
      {trendingProducts?.length > 0 && (
        <Box sx={{ mb: 10 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
            sx={{ mb: 4, textAlign: { xs: "center", sm: "left" } }}
          >
            <Box>
              <Stack direction="row" alignItems="center" spacing={1} justifyContent={{ xs: "center", sm: "flex-start" }}>
                <TrendingUp color="error" />
                <Typography variant="h4" fontWeight="900" sx={{ letterSpacing: "-0.02em", color: theme.palette.error.dark }}>
                  Trending Now
                </Typography>
              </Stack>
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
                High-demand items that everyone's talking about
              </Typography>
            </Box>
            <Button
              component={Link}
              to="/trending"
              sx={{ fontWeight: 700, color: theme.palette.error.main }}
            >
              See the Buzz
            </Button>
          </Stack>

          {trendingLoading ? (
            <SectionSkeleton count={6} />
          ) : (
            <ResponsiveProductGrid spacing={2}>
              {trendingProducts.slice(0, 12).map((product, index) => (
                <motion.div
                  key={product._id}
                  whileHover={{ y: -10 }}
                  transition={{ duration: 0.3 }}
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
      )}

      {/* Trust Indicators */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 6 },
            mt: 8,
            borderRadius: 5,
            bgcolor: alpha(theme.palette.primary.main, 0.03),
            border: `1px solid ${alpha(theme.palette.divider, 0.5)}`
          }}
        >
          <Grid container spacing={4} textAlign="center">
            {[
              { icon: <LocalShipping sx={{ fontSize: 40 }} />, title: 'Free Shipping', desc: 'On orders over $50', color: '#4caf50' },
              { icon: <Security sx={{ fontSize: 40 }} />, title: 'Secure Payment', desc: 'Protected by SSL', color: '#2196f3' },
              { icon: <Verified sx={{ fontSize: 40 }} />, title: 'Quality Assured', desc: 'Authentic 100%', color: '#ff9800' },
              { icon: <Schedule sx={{ fontSize: 40 }} />, title: '24/7 Support', desc: 'Dedicated help', color: '#9c27b0' }
            ].map((item, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Box sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  '&:hover .icon-box': { transform: 'scale(1.1) rotate(5deg)', bgcolor: item.color, color: 'white' }
                }}>
                  <Box
                    className="icon-box"
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: 4,
                      bgcolor: alpha(item.color, 0.1),
                      color: item.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                      transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Typography variant="h6" fontWeight="800" sx={{ mb: 0.5 }}>{item.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{item.desc}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default PersonalizedHomepage;