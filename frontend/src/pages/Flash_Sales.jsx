import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useFetchOffersQuery } from "../redux/api/offerApiSlice";
import { useFetchCategoriesQuery } from "../redux/api/categoryApiSlice"
import {
  setCategories,

} from "../redux/features/shop/shopSlice";
import Loader from "../components/Loader";
import ProductCard from "./Products/FlashSaleCard";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Stack,
  Fade,
} from "@mui/material";
import DocumentTitle from "react-document-title";

const FlashSales = () => {
  const dispatch = useDispatch();
  const { data: offers, isLoading: offersLoading } = useFetchOffersQuery();
  const { data: categoriesData } = useFetchCategoriesQuery();
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    if (categoriesData) {
      dispatch(setCategories(categoriesData));
    }
  }, [categoriesData, dispatch]);

  useEffect(() => {
    if (offers) {
      const productsWithOffers = offers
  .filter((offer) => offer.offerType === "flash")
  
      setFilteredProducts(productsWithOffers);
      
    }

  }, [offers]);

  return (
    <>
      <DocumentTitle title="Flash Sales" />
      <Box
        sx={{
          maxWidth: "100vw",
          px: { xs: 1, md: 4 },
          py: 2,
          background: "linear-gradient(135deg, #f3e7e9 0%, #e3eeff 100%)",
          minHeight: "100vh",
        }}
      >
        {/* Header */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 2, mt: 1 }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{
                color: "#18181b",
                letterSpacing: 0.5,
                textShadow: "1px 1px 8px #e3eeff",
              }}
            >
              Flash Sales
            </Typography>
          </Stack>
        </Stack>

        {/* Products Section */}
        <Box
          sx={{
            flexWrap: "wrap",
            gap: 3,
            p: 2,
            justifyContent: { xs: "center", md: "flex-start" },
            flex: 1,
            minHeight: 600,
            position: "relative",
          }}
        >
          {offersLoading ? (
            <Loader />
          ) : filteredProducts.length === 0 ? (
            <Typography
              variant="h6"
              sx={{
                textAlign: "center",
                color: "#555",
                mt: 4,
              }}
            >
              No products with active offers available.
            </Typography>
          ) : (
            filteredProducts.map((products) => (
              <>
              {products.products.map((product)=>(
                <>
                  <Fade in key={product._id}>
                <Paper
                  key={product._id}
                  elevation={6}
                  sx={{
                    p: 2,
                    borderRadius: 4,
                    bgcolor: "#fff",
                    minWidth: 260,
                    maxWidth: 320,
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-8px) scale(1.03)",
                      boxShadow: 10,
                      borderColor: "secondary.main",
                    },
                    boxShadow: "0 4px 24px 0 rgba(0,0,0,0.10)",
                  }}
                  className="hover:scale-105 hover:shadow-2xl transition-transform duration-200"
                >
                  <ProductCard product={product} offers={offers}/>
                  {product.countInStock === 0 && (
                    <Chip
                      label="Out of Stock"
                      color="error"
                      sx={{
                        position: "absolute",
                        top: 12,
                        left: 12,
                        fontWeight: 600,
                        fontSize: "0.95rem",
                        borderRadius: "999px",
                        zIndex: 2,
                        bgcolor: "#f87171",
                        color: "#fff",
                        boxShadow: "0 2px 8px #f8717166",
                      }}
                    />
                  )}
                </Paper>
              </Fade>
            
                </>
              ))} 
            
            </>
            ))
          )}
        </Box>
      </Box>
    </>
  );
};

export default FlashSales;