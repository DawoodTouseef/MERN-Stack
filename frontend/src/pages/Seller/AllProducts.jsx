import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import { useAllProductsQuery } from "../../redux/api/productApiSlice";
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  CircularProgress,
  Avatar,
  Chip,
} from "@mui/material";
import { IoAdd } from "react-icons/io5";
import DocumentTitle from "react-document-title";
import { useSelector } from "react-redux";

const AllProducts = () => {
  const { data: products = [], isLoading, isError, refetch } = useAllProductsQuery();
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [filteredProducts, setfilteredProducts] = useState([]);
  const { userInfo } = useSelector((state) => state.auth);
  // Listen for product add/update/delete events in localStorage
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === "productChanged") {
        setRefreshFlag((f) => !f);
        refetch();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [refetch]);
  useEffect(() => {
    const filter=products.filter((p)=>(p.user===userInfo._id));
    setfilteredProducts(filter);
  }, [products]);
  // Optionally, trigger refetch on focus (for single tab)
  useEffect(() => {
    const onFocus = () => refetch();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refetch]);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <Typography color="error">Error loading products</Typography>
      </Box>
    );
  }

  return (
    <DocumentTitle title="Products | Nexus Mart">
    <Box
      sx={{
        px: { xs: 1, md: 8 },
        py: 4,
        background: "linear-gradient(135deg, #f3e7e9 0%, #e3eeff 100%)",
        minHeight: "100vh",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700} color="primary.main">
            My Products
          </Typography>
          <Chip
            label={`Total: ${filteredProducts.length}`}
            color="secondary"
            sx={{ ml: 2, fontWeight: 600, fontSize: "1rem" }}
          />
        </Box>
        {userInfo?.role === "vendor" ? (
          <Button
          component={Link}
          to="/vendor/productlist" 
          variant="contained"
          color="secondary"
          startIcon={<IoAdd />}
          sx={{
            borderRadius: 2,
            fontWeight: 600,
            boxShadow: 3,
            letterSpacing: 1,
            px: 3,
            py: 1,
            fontSize: "1.05rem",
            transition: "transform 0.2s, box-shadow 0.2s",
            "&:hover": {
              transform: "scale(1.04)",
              boxShadow: 6,
            },
          }}
          className="transition-transform"
        >
          Create Product
        </Button>
        ):(
          <Button
          component={Link}
          to="/seller/productlist" 
          variant="contained"
          color="secondary"
          startIcon={<IoAdd />}
          sx={{
            borderRadius: 2,
            fontWeight: 600,
            boxShadow: 3,
            letterSpacing: 1,
            px: 3,
            py: 1,
            fontSize: "1.05rem",
            transition: "transform 0.2s, box-shadow 0.2s",
            "&:hover": {
              transform: "scale(1.04)",
              boxShadow: 6,
            },
          }}
          className="transition-transform"
        >
          Create Product
        </Button>
        )}
      </Box>
      {filteredProducts.length === 0 ? (
        <Box sx={{ textAlign: "center", mt: 8 }}>
          <Typography variant="h6" color="text.secondary">
            You have not added any products yet.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={4}>
          {filteredProducts.map((product) => (
            <Grid item xs={12} md={6} key={product._id}>
              <Paper
                elevation={6}
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  p: 3,
                  borderRadius: 4,
                  bgcolor: "#fff",
                  boxShadow: "0 6px 32px 0 rgba(0,0,0,0.12)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-8px) scale(1.03)",
                    boxShadow: 12,
                  },
                }}
                className="hover:scale-105 hover:shadow-2xl transition-transform duration-200"
              >
                <Avatar
                  variant="rounded"
                  src={product.media[0]?.url}
                  alt={product.name}
                  sx={{
                    width: 120,
                    height: 120,
                    mr: 3,
                    bgcolor: "#eee",
                    border: "2px solid #e3eeff",
                  }}
                />
                <Box sx={{ flex: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="h6" fontWeight={700} color="primary.main">
                      {product.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {moment(product.createdAt).format("MMM Do, YYYY")}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ my: 1, maxWidth: { xs: "100%", md: 400 } }}
                  >
                    {product.description?.substring(0, 160)}...
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mt: 2,
                    }}
                  >
                    <Button
                      component={Link}
                      to={`/vendor/product/update/${product._id}`}
                      variant="contained"
                      color="primary"
                      sx={{
                        borderRadius: 2,
                        fontWeight: 600,
                        px: 3,
                        letterSpacing: 1,
                        boxShadow: 2,
                        "&:hover": {
                          bgcolor: "secondary.main",
                          color: "#fff",
                        },
                      }}
                      // Add a callback to set localStorage flag on update
                      onClick={() => {
                        localStorage.setItem("productChanged", Date.now().toString());
                      }}
                    >
                      Update Product
                    </Button>
                    <Typography variant="h6" color="secondary.main">
                      ${product.price}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
    </DocumentTitle>
  );
};

export default AllProducts;