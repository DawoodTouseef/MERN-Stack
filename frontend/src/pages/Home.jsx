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
import PageTitle from "../components/PageTitle";
import { useFetchBannersQuery} from "../redux/api/bannerApiSlice";
import {useFetchOffersQuery} from "../redux/api/offerApiSlice";
import PersonalizedHomepage from "../components/PersonalizedHomepage";
import DocumentTitle from "react-document-title";
const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const Home = () => {
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
      <Box sx={{ minHeight: "100vh", backgroundColor: "#f4f6f8", width: "100%", overflow: "hidden" }}>
      
      {/* Show personalized homepage for logged-in users */}
      {userInfo ? (
        <PersonalizedHomepage />
      ) : (
        // Default homepage for non-authenticated users
        <>
          {banners && (
            <BannerCarousel />
          )}

          <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
            {isLoading ? (
              <Loader />
            ) : isError ? (
              <Message variant="danger">
                {error?.data?.message || error?.error || "An error occurred"}
              </Message>
            ) : (
              <>
                {/* Flash Sale Section */}
                {filteredProducts.length!==0 &&(
                <motion.div variants={fadeIn} initial="hidden" animate="visible">
                  <Box
                    sx={{
                      background: "linear-gradient(90deg, #ff8a00, #e52e71)",
                      color: "white",
                      borderRadius: 3,
                      px: { xs: 3, sm: 4 },
                      py: { xs: 2.5, sm: 3 },
                      my: 5,
                      textAlign: "center",
                      boxShadow: 2,
                      mx: { xs: 1, sm: 0 },
                      maxWidth: "100%",
                      overflow: "hidden"
                    }}
                  >
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        fontWeight: "bold",
                        fontSize: { xs: "1.25rem", sm: "1.5rem" }
                      }}
                    >
                      ⏰ Flash Sale – Limited Time Only!
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        mt: 1,
                        fontSize: { xs: "0.875rem", sm: "1rem" }
                      }}
                    >
                      Grab the best deals before they're gone!
                    </Typography>
                    <Button
                      variant="contained"
                      color="secondary"
                      sx={{ 
                        mt: 2,
                        px: { xs: 3, sm: 4 },
                        py: { xs: 1, sm: 1.5 },
                        fontSize: { xs: "0.875rem", sm: "1rem" },
                        borderRadius: 25
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
                  {categories?.slice(0, 6).map((cat) => (
                    <Button
                      key={cat._id}
                      size="small"
                      variant="outlined"
                      component={Link}
                      to={`/shop/${cat._id}`}
                      sx={{
                        borderRadius: 25,
                        px: { xs: 2, sm: 3 },
                        py: { xs: 0.5, sm: 1 },
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        minWidth: { xs: "auto", sm: "80px" },
                        textTransform: "none",
                        fontWeight: 500,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: 2
                        }
                      }}
                    >
                      {cat.name}
                    </Button>
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
                      <Typography
                        variant="h4"
                        sx={{ 
                          fontWeight: "bold", 
                          mb: 2, 
                          textAlign: "center", 
                          color: "primary.main",
                          fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" }
                        }}
                      >
                        Today's Top Deals
                      </Typography>
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
                      <Typography
                        variant="h4"
                        sx={{ 
                          fontWeight: "bold", 
                          mb: 2, 
                          textAlign: "center", 
                          color: "#ff5722",
                          fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" }
                        }}
                      >
                        🔥 Trending Now
                      </Typography>
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
                              sx={{ mb: 2 }}
                            >
                              <Typography 
                                variant="h5" 
                                sx={{ 
                                  fontWeight: "bold", 
                                  color: "#333",
                                  fontSize: { xs: "1.25rem", sm: "1.5rem" }
                                }}
                              >
                                {category.name}
                              </Typography>
                              <Button
                                component={Link}
                                to={`/shop/${category._id}`}
                                variant="outlined"
                                size="small"
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
