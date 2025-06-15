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
  Grid,
  Divider,

} from "@mui/material";
import { motion } from "framer-motion";
import Loader from "../components/Loader";
import Message from "../components/Message";
import FeaturedCategories from "../components/FeaturedCategories";
import BannerCarousel from "../components/BannerCarousel";
import Product from "./Products/Product";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import VendorDashboard from "./Vendor/vendorDashboard";
import DocumentTitle from "react-document-title";
import { useFetchBannersQuery} from "../redux/api/bannerApiSlice";
import {useFetchOffersQuery} from "../redux/api/offerApiSlice";

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
  if (userInfo?.role === "vendor") return <VendorDashboard />;

  return (
    <DocumentTitle title="Home | Nexus Mart">
      <Box sx={{ minHeight: "100vh", backgroundColor: "#f4f6f8" }}>
      {banners && (
        <BannerCarousel />
      )}

      <Container maxWidth="xl">
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
                  px: 4,
                  py: 3,
                  my: 5,
                  textAlign: "center",
                  boxShadow: 2,
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                  ⏰ Flash Sale – Limited Time Only!
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  Grab the best deals before they're gone!
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  sx={{ mt: 2 }}
                  component={Link}
                  to="/flash-sale"
                >
                  Shop Now
                </Button>
              </Box>
            </motion.div>
            )}
            {/* Category Filter Chips */}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, my: 4 }}>
              {categories?.slice(0, 6).map((cat) => (
                <Button
                  key={cat._id}
                  size="small"
                  variant="outlined"
                  component={Link}
                  to={`/shop/${cat._id}`}
                >
                  {cat.name} 
                </Button>
              ))}
            </Box>

            {/* Featured Categories */}
            <motion.div variants={fadeIn} initial="hidden" animate="visible">
              <FeaturedCategories categories={categories} />
            </motion.div>

            {/* Top Deals Section */}
            <motion.div variants={fadeIn} initial="hidden" animate="visible">
              <Box sx={{ mt: 6, mb: 5 }}>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: "bold", mb: 2, textAlign: "center", color: "primary.main" }}
                >
                  Today's Top Deals
                </Typography>
                <Grid container spacing={3}>
                  {data?.products?.slice(0, 8).map((product) => (
                    <Grid item xs={12} sm={6} md={3} key={product._id}>
                      <motion.div whileHover={{ scale: 1.03 }}>
                        <Product product={product} />
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </motion.div>

            {/* Trending Now Section */}
            <motion.div variants={fadeIn} initial="hidden" animate="visible">
              <Box sx={{ mt: 6, mb: 5 }}>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: "bold", mb: 2, textAlign: "center", color: "#ff5722" }}
                >
                  🔥 Trending Now
                </Typography>
                <Grid container spacing={3}>
                  {data?.products?.slice(8, 12).map((product) => (
                    <Grid item xs={12} sm={6} md={3} key={product._id}>
                      <motion.div whileHover={{ scale: 1.03 }}>
                        <Product product={product} />
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </motion.div>

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
                          <Typography variant="h5" sx={{ fontWeight: "bold", color: "#333" }}>
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
                        <Grid container spacing={2}>
                          {filteredProducts.slice(0, 4).map((product) => (
                            <Grid item xs={12} sm={6} md={3} key={product._id}>
                              <motion.div whileHover={{ scale: 1.03 }}>
                                <Product product={product} />
                              </motion.div>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    </motion.div>
                  );
                })}
              </>
            )}

            
          </>
        )}
      </Container>
    </Box>
    </DocumentTitle>
  );
};

export default Home;
