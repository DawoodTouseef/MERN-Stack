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
  Stack
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
import { useFetchBannersQuery } from "../redux/api/bannerApiSlice";
import { useFetchOffersQuery } from "../redux/api/offerApiSlice";
import PersonalizedHomepage from "../components/PersonalizedHomepage";
import DocumentTitle from "react-document-title";
import { APP_NAME } from "../redux/constants";

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
  const { data: banners, isLoading: bannerLoading, isError: BannnerIserror, error: BannerError } = useFetchBannersQuery();
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

  }, [isLoading, data, offers]);
  if (userInfo?.role === "admin") return <AdminDashboard />;
  if (userInfo?.role === "seller") return <SellerDashBoard />;
  if (userInfo?.role === "vendor") return <VendorDashboard />;

  return (
    <DocumentTitle title={`Home | ${APP_NAME}`}>
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
                height: { xs: '500px', sm: '600px', md: '750px' },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                mb: 6,
                background: `linear-gradient(135deg, ${theme.palette.grey[900]} 0%, #000 100%)`,
              }}
            >
              {/* Dynamic Background Pattern */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  opacity: 0.4,
                  background: `radial-gradient(circle at 20% 30%, ${alpha(theme.palette.primary.main, 0.4)} 0%, transparent 40%), 
                               radial-gradient(circle at 80% 70%, ${alpha(theme.palette.secondary.main, 0.4)} 0%, transparent 40%)`,
                  zIndex: 1
                }}
              />

              <Box
                sx={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)',
                  backgroundSize: '30px 30px',
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
                }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                >
                  <Typography
                    variant={isMobile ? "h2" : "h1"}
                    sx={{
                      fontWeight: 900,
                      mb: 2,
                      color: '#fff',
                      letterSpacing: '-0.04em',
                      lineHeight: 1.1,
                      textShadow: '0 10px 30px rgba(0,0,0,0.5)'
                    }}
                  >
                    The Future of <br />
                    <Box component="span" sx={{
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}>Modern Shopping</Box>
                  </Typography>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                >
                  <Typography
                    variant={isMobile ? "body1" : "h5"}
                    sx={{
                      fontWeight: 300,
                      mb: 5,
                      color: alpha('#fff', 0.8),
                      maxWidth: { xs: '100%', sm: '80%', md: '70%' },
                      mx: 'auto',
                      lineHeight: 1.6
                    }}
                  >
                    Explore a curated marketplace of world-class brands and products.
                    Elevate your digital retail experience with {APP_NAME}.
                  </Typography>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                >
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                    <Button
                      variant="contained"
                      size="large"
                      component={Link}
                      to="/shop"
                      sx={{
                        px: 6,
                        py: 2,
                        borderRadius: 1.5,
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        textTransform: 'none',
                        background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.dark} 90%)`,
                        boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.4)}`,
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: `0 12px 35px ${alpha(theme.palette.primary.main, 0.5)}`,
                        },
                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                      }}
                    >
                      Shop Collection
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      component={Link}
                      to="/register"
                      sx={{
                        px: 6,
                        py: 2,
                        borderRadius: 1.5,
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        textTransform: 'none',
                        borderColor: alpha('#fff', 0.3),
                        color: '#fff',
                        '&:hover': {
                          borderColor: '#fff',
                          bgcolor: alpha('#fff', 0.05),
                          transform: 'translateY(-5px)',
                        },
                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                      }}
                    >
                      Join Now
                    </Button>
                  </Stack>
                </motion.div>
              </Container>

              {/* Scroll Indicator */}
              <Box sx={{
                position: 'absolute',
                bottom: 30,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 2,
                opacity: 0.6
              }}>
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Box sx={{ width: 2, height: 40, bgcolor: '#fff', borderRadius: 1 }} />
                </motion.div>
              </Box>
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
                  {filteredProducts.length !== 0 && (
                    <motion.div variants={fadeIn} initial="hidden" animate="visible">
                      <Box
                        sx={{
                          background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
                          color: "white",
                          borderRadius: 5,
                          p: { xs: 4, md: 6 },
                          my: 8,
                          textAlign: "center",
                          boxShadow: `0 20px 40px ${alpha(theme.palette.error.main, 0.2)}`,
                          position: 'relative',
                          overflow: 'hidden',
                        }}
                      >
                        {/* Decorative Background Icon */}
                        <FlashOn sx={{
                          position: 'absolute',
                          right: -20,
                          bottom: -20,
                          fontSize: 200,
                          opacity: 0.1,
                          transform: 'rotate(-15deg)'
                        }} />

                        <Typography
                          variant="h3"
                          sx={{
                            fontWeight: 900,
                            fontSize: { xs: "2rem", md: "3rem" },
                            mb: 2,
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em'
                          }}
                        >
                          ⚡ Flash Sale
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{
                            mb: 4,
                            opacity: 0.9,
                            maxWidth: '600px',
                            mx: 'auto'
                          }}
                        >
                          Exclusive offers for a limited time. Don't miss out on premium products at revolutionary prices.
                        </Typography>
                        <Button
                          variant="contained"
                          component={Link}
                          to="/flash-sale"
                          sx={{
                            bgcolor: 'white',
                            color: theme.palette.error.main,
                            px: 8,
                            py: 2,
                            borderRadius: 50,
                            fontWeight: 800,
                            fontSize: '1.2rem',
                            '&:hover': {
                              bgcolor: alpha('#fff', 0.9),
                              transform: 'scale(1.05)',
                            },
                            transition: 'all 0.3s'
                          }}
                        >
                          View Deals
                        </Button>
                      </Box>
                    </motion.div>
                  )}

                  {/* Category Filter Chips */}
                  <Box sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1.5,
                    my: 6,
                    justifyContent: "center",
                    px: { xs: 2, md: 0 },
                  }}>
                    {categories?.slice(0, 8).map((cat, index) => (
                      <motion.div
                        key={cat._id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.05 }}
                      >
                        <Button
                          component={Link}
                          to={`/shop/${cat._id}`}
                          sx={{
                            borderRadius: '12px',
                            px: 3,
                            py: 1,
                            textTransform: 'none',
                            fontWeight: 700,
                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                            color: theme.palette.primary.main,
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                            '&:hover': {
                              bgcolor: theme.palette.primary.main,
                              color: '#fff',
                              boxShadow: `0 10px 20px ${alpha(theme.palette.primary.main, 0.2)}`
                            }
                          }}
                        >
                          {cat.name}
                        </Button>
                      </motion.div>
                    ))}
                  </Box>

                  {/* Featured Categories */}
                  <FeaturedCategories categories={categories} />

                  {/* Personalized Recommendations */}
                  <PersonalizedRecommendations page="homepage" limit={8} />

                  {/* Trending Products */}
                  <TrendingProducts limit={8} showFilters={true} />

                  {/* Top Deals Section - Only show if products exist */}
                  {data?.products?.length > 0 && (
                    <Box sx={{ mt: 12, mb: 10 }}>
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        justifyContent="space-between"
                        alignItems="center"
                        spacing={2}
                        sx={{ mb: 6, textAlign: { xs: 'center', sm: 'left' } }}
                      >
                        <Box>
                          <Typography variant="h3" fontWeight="900" sx={{ letterSpacing: '-0.02em' }}>
                            Today's <Box component="span" sx={{ color: theme.palette.primary.main }}>Top Deals</Box>
                          </Typography>
                          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
                            Handpicked products with the best discounts just for you
                          </Typography>
                        </Box>
                        <Button
                          component={Link}
                          to="/shop?sort=discount"
                          variant="outlined"
                          sx={{ borderRadius: 3, px: 4, fontWeight: 700 }}
                        >
                          View All Deals
                        </Button>
                      </Stack>
                      <ResponsiveProductGrid spacing={3}>
                        {data.products.slice(0, 8).map((product) => (
                          <motion.div key={product._id} whileHover={{ y: -10 }} transition={{ duration: 0.3 }}>
                            <Product product={product} />
                          </motion.div>
                        ))}
                      </ResponsiveProductGrid>
                    </Box>
                  )}

                  {/* Trending Now Section - Only show if enough products exist */}
                  {data?.products?.length > 8 && (
                    <Box sx={{ mb: 12 }}>
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        justifyContent="space-between"
                        alignItems="center"
                        spacing={2}
                        sx={{ mb: 6, textAlign: { xs: 'center', sm: 'left' } }}
                      >
                        <Box>
                          <Typography variant="h3" fontWeight="900" sx={{ letterSpacing: '-0.02em' }}>
                            🔥 Trending <Box component="span" sx={{ color: theme.palette.secondary.main }}>Now</Box>
                          </Typography>
                          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
                            Most popular products this week across our community
                          </Typography>
                        </Box>
                      </Stack>
                      <ResponsiveProductGrid spacing={3}>
                        {data.products.slice(8, 12).map((product) => (
                          <motion.div key={product._id} whileHover={{ y: -10 }} transition={{ duration: 0.3 }}>
                            <Product product={product} />
                          </motion.div>
                        ))}
                      </ResponsiveProductGrid>
                    </Box>
                  )}

                  {/* Category-wise Products */}
                  {categories?.length > 0 && (
                    <>
                      <Divider sx={{ my: 10, opacity: 0.5 }} />
                      {categories.map((category, index) => {
                        const filteredProducts = data?.products?.filter(
                          (product) => product.category._id === category._id
                        );
                        if (!filteredProducts?.length) return null;

                        return (
                          <Box key={category._id} sx={{ mb: 12 }}>
                            <Stack
                              direction={{ xs: "column", sm: "row" }}
                              justifyContent="space-between"
                              alignItems="center"
                              spacing={2}
                              sx={{ mb: 5, textAlign: { xs: 'center', sm: 'left' } }}
                            >
                              <Box>
                                <Typography variant="h4" fontWeight="900" sx={{ letterSpacing: '-0.01em' }}>
                                  {category.name}
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                  Our latest selection of premium {category.name.toLowerCase()}
                                </Typography>
                              </Box>
                              <Button
                                component={Link}
                                to={`/shop/${category._id}`}
                                sx={{
                                  fontWeight: 700,
                                  color: theme.palette.primary.main,
                                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) }
                                }}
                              >
                                View Collection
                              </Button>
                            </Stack>
                            <ResponsiveProductGrid spacing={2}>
                              {filteredProducts.slice(0, 4).map((product) => (
                                <motion.div key={product._id} whileHover={{ y: -10 }} transition={{ duration: 0.3 }}>
                                  <Product product={product} />
                                </motion.div>
                              ))}
                            </ResponsiveProductGrid>
                          </Box>
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