import { Link, useParams } from "react-router-dom";
import { useGetProductsQuery } from "../redux/api/productApiSlice";
import Loader from "../components/Loader";
import Message from "../components/Message";
import Header from "../components/Header";
import Product from "./Products/Product";
import { useSelector } from "react-redux";
import AdminDashboard from "./Admin/AdminDashboard";
import {
  Box,
  Typography,
  Button,
  Grow,
  Slide,
  Container,
  Grid,
  Paper,
  Divider,
} from "@mui/material";
import { useEffect, useState } from "react";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { useFetchCategoriesQuery } from "../redux/api/categoryApiSlice";
import DocumentTitle from "react-document-title";

const Home = () => {
  const { keyword } = useParams();
  const { data, isLoading, isError, error } = useGetProductsQuery({ keyword });
  const { userInfo } = useSelector((state) => state.auth);
  const { data: categories } = useFetchCategoriesQuery();
  const [showProducts, setShowProducts] = useState(false);

  useEffect(() => {
    if (!isLoading && data?.products?.length) {
      setShowProducts(true);
    }
  }, [isLoading, data]);

  if (userInfo && userInfo.isAdmin) {
    return <AdminDashboard />;
  }
  
  return (
    <>
      <DocumentTitle title="Home | Special Products" />
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f3e7e9 0%, #e3eeff 100%)",
          pb: 6,
        }}
      >
        {!keyword && <Header />}
        <Container maxWidth="xl" sx={{ pt: 6 }}>
          {isLoading ? (
            <Loader />
          ) : isError ? (
            <Message variant="danger">
              {error?.data?.message || error?.error || "An error occurred"}
            </Message>
          ) : (
            <>
              <Slide direction="down" in timeout={700}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{
                    mt: 6,
                    mb: 4,
                    px: { xs: 1, md: 6 },
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 900,
                      letterSpacing: 1,
                      color: "primary.main",
                      textShadow: "2px 2px 8px #e1bee7",
                    }}
                  >
                    Special Products
                  </Typography>
                  <Button
                    component={Link}
                    to="/shop"
                    variant="contained"
                    color="secondary"
                    size="large"
                    sx={{
                      fontWeight: "bold",
                      borderRadius: "999px",
                      py: 1.5,
                      px: 5,
                      boxShadow: 4,
                      fontSize: "1.2rem",
                      transition: "transform 0.2s",
                      "&:hover": {
                        transform: "scale(1.07)",
                        boxShadow: 8,
                      },
                    }}
                  >
                    <AiOutlineShoppingCart size={28} style={{ marginRight: 4 }} />
                    Shop
                  </Button>
                </Box>
              </Slide>

              <Grid container spacing={3} justifyContent="center">
                {data?.products?.map((product, idx) => (
                  <Grow
                    in={showProducts}
                    timeout={500 + idx * 120}
                    key={product._id}
                  >
                    <Grid item xs={12} sm={6} md={4} lg={3}>
                      <Paper
                        elevation={6}
                        sx={{
                          p: 2,
                          borderRadius: 4,
                          bgcolor: "#fff",
                          transition: "transform 0.2s, box-shadow 0.2s",
                          "&:hover": {
                            transform: "translateY(-8px) scale(1.03)",
                            boxShadow: 10,
                          },
                        }}
                      >
                        <Product product={product} />
                      </Paper>
                    </Grid>
                  </Grow>
                ))}
              </Grid>

              {categories?.length > 0 && (
                <>
                  <Divider sx={{ my: 6, bgcolor: "#bbb" }} />
                  {categories.map((category) => (
                    <Box key={category._id} sx={{ mb: 8 }}>
                      <Slide direction="down" in timeout={700}>
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                          sx={{
                            mt: 8,
                            mb: 3,
                            px: { xs: 1, md: 6 },
                          }}
                        >
                          {data?.products?.filter(
                            (product) => product.category === category._id
                          ).length === 0 ? (
                            <></>
                          ):(
                            <>
                            <Typography
                            variant="h4"
                            sx={{
                              fontWeight: 800,
                              letterSpacing: 1,
                              color: "secondary.main",
                              textShadow: "2px 2px 8px #e1bee7",
                            }}
                          >
                            {category.name}
                          </Typography>
                          <Button
                            component={Link}
                            to={`/shop/${category._id}`}
                            variant="contained"
                            color="primary"
                            size="large"
                            sx={{
                              fontWeight: "bold",
                              borderRadius: "999px",
                              py: 1.2,
                              px: 4,
                              boxShadow: 4,
                              fontSize: "1.1rem",
                              transition: "transform 0.2s",
                              "&:hover": {
                                transform: "scale(1.07)",
                                boxShadow: 8,
                              },
                            }}
                          >
                            <AiOutlineShoppingCart size={24} style={{ marginRight: 4 }} />
                            Shop
                          </Button>
                            </>
                          )}
                        </Box>
                      </Slide>
                      <Grid container spacing={3} justifyContent="center">
                        {data?.products
                          ?.filter((product) => product.category === category._id)
                          .map((product, idx) => (
                            <Grow
                              in={showProducts}
                              timeout={500 + idx * 120}
                              key={product._id}
                            >
                              <Grid item xs={12} sm={6} md={4} lg={3}>
                                <Paper
                                  elevation={5}
                                  sx={{
                                    p: 2,
                                    borderRadius: 4,
                                    bgcolor: "#fff",
                                    transition: "transform 0.2s, box-shadow 0.2s",
                                    "&:hover": {
                                      transform: "translateY(-8px) scale(1.03)",
                                      boxShadow: 10,
                                    },
                                  }}
                                >
                                  <Product product={product} />
                                </Paper>
                              </Grid>
                            </Grow>
                          ))}
                      </Grid>
                    </Box>
                  ))}
                </>
              )}
            </>
          )}
        </Container>
      </Box>
    </>
  );
};

export default Home;