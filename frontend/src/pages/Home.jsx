import { Link, useParams } from "react-router-dom";
import { useGetProductsQuery } from "../redux/api/productApiSlice";
import { useFetchCategoriesQuery } from "../redux/api/categoryApiSlice";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Container,
  Divider,
  useTheme,
  useMediaQuery,
  alpha,
} from "@mui/material";
import { motion } from "framer-motion";
import Loader from "../components/Loader";
import Message from "../components/Message";
import FeaturedCategories from "../components/FeaturedCategories";
import BannerCarousel from "../components/BannerCarousel";
import Product from "./Products/Product";
import PersonalizedRecommendations from "../components/PersonalizedRecommendations";
import TrendingProducts from "../components/TrendingProducts";
import ResponsiveProductGrid from "../components/ResponsiveProductGrid";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import SellerDashBoard from "./Seller/SellerDashboard";
import VendorDashboard from "./Vendor/vendorDashboard";
import { useFetchBannersQuery} from "../redux/api/bannerApiSlice";
import {useFetchOffersQuery} from "../redux/api/offerApiSlice";
import PersonalizedHomepage from "../components/PersonalizedHomepage";
import DocumentTitle from "react-document-title";

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const { keyword } = useParams();
  const { data, isLoading, isError, error } = useGetProductsQuery({ keyword });
  const { data: categories } = useFetchCategoriesQuery();
  
  const { data: offers, isLoading: offersLoading } = useFetchOffersQuery();
  const { userInfo } = useSelector((state) => state.auth);
  const [showProducts, setShowProducts] = useState(false);
  const { data: banners, isLoading:bannerLoading, isError:BannnerIserror, error:BannerError } = useFetchBannersQuery();
  const [filteredProducts, setFilteredProducts] = useState([]);
  
  useEffect(() => {
    if (!isLoading && data?.products?.length) {
      setShowProducts(true);
    }
         if (offers) {
        const productsWithOffers = offers
    .filter((offer) => offer.offerType === "flash")
    
        setFilteredProducts(productsWithOffers);
        
      }
 
  }, [isLoading, data,offers]);
  if (userInfo?.role === "admin") return <AdminDashboard />;
  if (userInfo?.role === "seller") return <SellerDashBoard />;
  if (userInfo?.role === "vendor") return <VendorDashboard />;
  
  return (
    <DocumentTitle title="Home | Nexus Mart">
      <Box sx={{ minHeight: "100vh", backgroundColor: theme.palette.background.default, width: "100%", overflow: "hidden" }}>
      
      {/* Show personalized homepage for logged-in users */}
      {userInfo ? (
        <PersonalizedHomepage />
      ) : (
        <>
          {/* Hero Section */}
          <Box 
            sx={{ 
              position: 'relative',
              width: '100%',
              height: { xs: '400px', sm: '500px', md: '600px' },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              mb: 6,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
            }}
          >
            {/* Background Pattern */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `radial-gradient(circle at 10% 20%, ${alpha(theme.palette.primary.light, 0.2)} 0%, transparent 20%), 
                             radial-gradient(circle at 90% 80%, ${alpha(theme.palette.secondary.light, 0.2)} 0%, transparent 20%)`,
                zIndex: 1
              }}
            />
            
            {/* Content */}
            <Container 
              maxWidth="lg" 
              sx={{ 
                position: 'relative',
                zIndex: 2,
                textAlign: 'center',
                px: { xs: 2, sm: 3, md: 4 },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%'
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Typography 
                  variant={isMobile ? "h3" : "h1"}
                  sx={{ 
                    fontWeight: 800,
                    mb: 2,
                    color: theme.palette.primary.main,
                    textShadow: `2px 2px 4px ${alpha('#000', 0.1)}`,
                    lineHeight: 1.2
                  }}
                >
                  Welcome to NexusMart
                </Typography>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Typography 
                  variant={isMobile ? "h6" : "h4"}
                  sx={{ 
                    fontWeight: 500,
                    mb: 4,
                    color: theme.palette.text.primary,
                    maxWidth: { xs: '100%', sm: '80%', md: '60%' },
                    mx: 'auto'
                  }}
                >
                  Discover amazing products at unbeatable prices. Shop the latest trends and find everything you need in one place.
                </Typography>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Button
                  variant="contained"
                  size={isMobile ? "medium" : "large"}
                  component={Link}
                  to="/shop"
                  sx={{
                    px: { xs: 3, sm: 5, md: 6 },
                    py: { xs: 1.5, sm: 2, md: 2.5 },
                    borderRadius: 50,
                    fontWeight: 700,
                    fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                    '&:hover': {
                      boxShadow: `0 6px 24px ${alpha(theme.palette.primary.main, 0.6)}`,
                      transform: 'translateY(-3px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Start Shopping
                </Button>
              </motion.div>
            </Container>
            
            {/* Decorative Elements */}
            <Box
              sx={{
                position: 'absolute',
                top: '20%',
                left: '10%',
                width: { xs: 60, sm: 80, md: 100 },
                height: { xs: 60, sm: 80, md: 100 },
                borderRadius: '50%',
                background: alpha(theme.palette.secondary.main, 0.2),
                filter: 'blur(20px)',
                zIndex: 0
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: '15%',
                right: '10%',
                width: { xs: 80, sm: 100, md: 120 },
                height: { xs: 80, sm: 100, md: 120 },
                borderRadius: '50%',
                background: alpha(theme.palette.primary.main, 0.2),
                filter: 'blur(30px)',
                zIndex: 0
              }}
            />
          </Box>

          <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
            {isLoading ? (
              <Loader />
            ) : isError ? (
              <Message variant="danger">
                {error?.data?.message || error?.error || "An error occurred"}
              </Message>
            ) : (
              <>
                {/* Banners Carousel */}
                {banners && banners.length > 0 && (
                  <motion.div variants={fadeIn} initial="hidden" animate="visible">
                    <BannerCarousel />
                  </motion.div>
                )}

                {/* Flash Sale Section */}
                {filteredProducts.length!==0 &&(
                <motion.div variants={fadeIn} initial="hidden" animate="visible">
                  <Box
                    sx={{
                      background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      color: "white",
                      borderRadius: 4,
                      px: { xs: 3, sm: 4 },
                      py: { xs: 3, sm: 4 },
                      my: 5,
                      textAlign: "center",
                      boxShadow: 4,
                      mx: { xs: 1, sm: 0 },
                      maxWidth: "100%",
                      overflow: "hidden",
                      position: 'relative',
                      '&:before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `linear-gradient(45deg, transparent 40%, ${alpha('#fff', 0.1)} 50%, transparent 60%)`,
                        backgroundSize: '200% 200%',
                        animation: 'shine 3s infinite',
                      },
                      '@keyframes shine': {
                        '0%': { backgroundPosition: '200% 0' },
                        '100%': { backgroundPosition: '-200% 0' }
                      }
                    }}
                  >
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        fontWeight: 800,
                        fontSize: { xs: "1.5rem", sm: "1.8rem", md: "2.2rem" },
                        mb: 1
                      }}
                    >
                      ⏰ Flash Sale – Limited Time Only!
                    </Typography>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        mt: 1,
                        mb: 3,
                        fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
                        maxWidth: { sm: '80%', md: '60%' },
                        mx: 'auto'
                      }}
                    >
                      Grab the best deals before they're gone!
                    </Typography>
                    <Button
                      variant="contained"
                      color="secondary"
                      size={isMobile ? "medium" : "large"}
                      sx={{ 
                        mt: 1,
                        px: { xs: 3, sm: 5, md: 6 },
                        py: { xs: 1.2, sm: 1.5, md: 2 },
                        fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" },
                        borderRadius: 50,
                        fontWeight: 700,
                        boxShadow: `0 4px 16px ${alpha(theme.palette.secondary.dark, 0.4)}`,
                        '&:hover': {
                          boxShadow: `0 6px 20px ${alpha(theme.palette.secondary.dark, 0.6)}`,
                          transform: 'translateY(-2px)'
                        }
                      }}
                      component={Link}
                      to="/flash-sale"
                    >
                      Shop Now
                    </Button>
                  </Box>
                </motion.div>
                )}
                
                {/* Category Filter Chips */}
                <Box sx={{ 
                  display: "flex", 
                  flexWrap: "wrap", 
                  gap: { xs: 1.5, sm: 2 }, 
                  my: 4,
                  justifyContent: { xs: "center", md: "flex-start" },
                  px: { xs: 1, sm: 0 },
                  maxWidth: "100%",
                  overflow: "hidden"
                }}>
                  {categories?.slice(0, 6).map((cat, index) => (
                    <motion.div
                      key={cat._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        size="small"
                        variant="outlined"
                        component={Link}
                        to={`/shop/${cat._id}`}
                        sx={{
                          borderRadius: 50,
                          px: { xs: 2, sm: 3, md: 4 },
                          py: { xs: 0.8, sm: 1.2, md: 1.5 },
                          fontSize: { xs: "0.75rem", sm: "0.875rem", md: "1rem" },
                          minWidth: { xs: "auto", sm: "100px", md: "120px" },
                          textTransform: "none",
                          fontWeight: 600,
                          transition: "all 0.3s ease",
                          borderColor: alpha(theme.palette.primary.main, 0.5),
                          color: theme.palette.primary.main,
                          '&:hover': {
                            borderColor: theme.palette.primary.main,
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            transform: "translateY(-3px)",
                            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`
                          }
                        }}
                      >
                        {cat.name}
                      </Button>
                    </motion.div>
                  ))}
                </Box>

                {/* Featured Categories */}
                <motion.div variants={fadeIn} initial="hidden" animate="visible">
                  <FeaturedCategories categories={categories} />
                </motion.div>

                {/* Personalized Recommendations */}
                <PersonalizedRecommendations page="homepage" limit={8} />

                {/* Trending Products */}
                <TrendingProducts limit={8} showFilters={true} />

                {/* Top Deals Section - Only show if products exist */}
                {data?.products?.length > 0 && (
                  <motion.div variants={fadeIn} initial="hidden" animate="visible">
                    <Box sx={{ mt: 6, mb: 5 }}>
                      <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Typography
                          variant="h4"
                          sx={{ 
                            fontWeight: 800, 
                            color: theme.palette.primary.main,
                            fontSize: { xs: "1.75rem", sm: "2.25rem", md: "2.5rem" },
                            mb: 1
                          }}
                        >
                          Today's Top Deals
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{ 
                            fontWeight: 400, 
                            color: theme.palette.text.secondary,
                            maxWidth: { sm: '80%', md: '60%' },
                            mx: 'auto'
                          }}
                        >
                          Handpicked products with the best discounts
                        </Typography>
                      </Box>
                      <ResponsiveProductGrid spacing={3}>
                        {data.products.slice(0, 8).map((product) => (
                          <motion.div key={product._id} whileHover={{ scale: 1.03 }}>
                            <Product product={product} />
                          </motion.div>
                        ))}
                      </ResponsiveProductGrid>
                    </Box>
                  </motion.div>
                )}

                {/* Trending Now Section - Only show if enough products exist */}
                {data?.products?.length > 8 && (
                  <motion.div variants={fadeIn} initial="hidden" animate="visible">
                    <Box sx={{ mt: 6, mb: 5 }}>
                      <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Typography
                          variant="h4"
                          sx={{ 
                            fontWeight: 800, 
                            color: theme.palette.secondary.main,
                            fontSize: { xs: "1.75rem", sm: "2.25rem", md: "2.5rem" },
                            mb: 1
                          }}
                        >
                          🔥 Trending Now
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{ 
                            fontWeight: 400, 
                            color: theme.palette.text.secondary,
                            maxWidth: { sm: '80%', md: '60%' },
                            mx: 'auto'
                          }}
                        >
                          Most popular products this week
                        </Typography>
                      </Box>
                      <ResponsiveProductGrid spacing={3}>
                        {data.products.slice(8, 12).map((product) => (
                          <motion.div key={product._id} whileHover={{ scale: 1.03 }}>
                            <Product product={product} />
                          </motion.div>
                        ))}
                      </ResponsiveProductGrid>
                    </Box>
                  </motion.div>
                )}

                {/* Category-wise Products */}
                {categories?.length > 0 && (
                  <>
                    <Divider sx={{ my: 6 }} />
                    {categories.map((category, index) => {
                      const filteredProducts = data?.products?.filter(
                        (product) => product.category._id === category._id
                      );
                      if (!filteredProducts?.length) return null;

                      return (
                        <motion.div
                          key={category._id}
                          variants={fadeIn}
                          initial="hidden"
                          animate="visible"
                          transition={{ delay: index * 0.2 }}
                        >
                          <Box sx={{ mb: 6 }}>
                            <Box
                              display="flex"
                              justifyContent="space-between"
                              alignItems="center"
                              sx={{ mb: 3 }}
                            >
                              <Box>
                                <Typography 
                                  variant="h4" 
                                  sx={{ 
                                    fontWeight: 800, 
                                    color: theme.palette.text.primary,
                                    fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" }
                                  }}
                                >
                                  {category.name}
                                </Typography>
                                <Typography 
                                  variant="body1" 
                                  sx={{ 
                                    color: theme.palette.text.secondary,
                                    mt: 0.5
                                  }}
                                >
                                  Explore our collection of {category.name.toLowerCase()}
                                </Typography>
                              </Box>
                              <Button
                                component={Link}
                                to={`/shop/${category._id}`}
                                variant="outlined"
                                size="large"
                                sx={{
                                  borderRadius: 50,
                                  px: { xs: 2, sm: 3, md: 4 },
                                  py: { xs: 1, sm: 1.2, md: 1.5 },
                                  fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
                                  fontWeight: 600,
                                  borderColor: alpha(theme.palette.primary.main, 0.5),
                                  color: theme.palette.primary.main,
                                  '&:hover': {
                                    borderColor: theme.palette.primary.main,
                                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                  }
                                }}
                              >
                                View All
                              </Button>
                            </Box>
                            <ResponsiveProductGrid spacing={2}>
                              {filteredProducts.slice(0, 4).map((product) => (
                                <motion.div key={product._id} whileHover={{ scale: 1.03 }}>
                                  <Product product={product} />
                                </motion.div>
                              ))}
                            </ResponsiveProductGrid>
                          </Box>
                        </motion.div>
                      );
                    })}
                  </>
                )}
              </>
            )}
          </Container>
        </>
      )}
    </Box>
    </DocumentTitle>
  );
};

export default Home;