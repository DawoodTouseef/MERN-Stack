import { useState } from "react";
import { Link } from "react-router-dom";
import { useGetTopProductsQuery } from "../../redux/api/productApiSlice";
import SmallProduct from "./SmallProduct";
import Loader from "../../components/Loader";
import EnhancedReviewForm from "../../components/reviews/EnhancedReviewForm";
import EnhancedReviewsList from "../../components/reviews/EnhancedReviewsList";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Paper,
  Grid,
} from "@mui/material";
import { useSelector } from "react-redux";

const ProductTabs = ({
  product,
  userInfo,
}) => {
  const { data: relatedProducts, isLoading } = useGetTopProductsQuery();
  const [activeTab, setActiveTab] = useState(1); // Default to All Reviews

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleReviewSubmitted = () => {
    setActiveTab(1); // Switch to reviews tab after submission
  };

  return (
    <Box sx={{ width: "100%", mt: 4 }}>
      <Paper
        elevation={3}
        sx={{
          mb: 3,
          borderRadius: 3,
          bgcolor: "#fff",
          boxShadow: "0 2px 12px #ec489933",
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="secondary"
          textColor="secondary"
          variant="fullWidth"
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            "& .MuiTab-root": {
              fontWeight: 700,
              fontSize: "1.13rem",
              letterSpacing: 0.2,
              color: "#6366f1",
              "&.Mui-selected": {
                color: "#ec4899",
              },
            },
            "& .MuiTabs-indicator": {
              background: "linear-gradient(90deg,#ec4899 0%,#6366f1 100%)",
              height: 4,
              borderRadius: 2,
            },
          }}
        >
          <Tab label="Write Your Review" />
          <Tab label={`All Reviews (${product.reviews.length})`} />
          <Tab label="Related Products" />
        </Tabs>
      </Paper>

      {/* Write Review */}
      {activeTab === 0 && (
        <Paper
          sx={{
            p: { xs: 2, md: 4 },
            borderRadius: 3,
            mb: 3,
            bgcolor: "#f9fafb",
            boxShadow: "0 2px 12px #ec489933",
          }}
        >
          <EnhancedReviewForm
            product={product}
            userInfo={userInfo}
            onReviewSubmitted={handleReviewSubmitted}
          />
        </Paper>
      )}

      {/* All Reviews */}
      {activeTab === 1 && (
        <Paper
          sx={{
            p: { xs: 2, md: 4 },
            borderRadius: 3,
            mb: 3,
            bgcolor: "#f9fafb",
            boxShadow: "0 2px 12px #ec489933",
          }}
        >
          <EnhancedReviewsList
            product={product}
            userInfo={userInfo}
          />
        </Paper>
      )}

      {/* Related Products */}
      {activeTab === 2 && (
        <Paper
          sx={{
            p: { xs: 2, md: 4 },
            borderRadius: 3,
            bgcolor: "#f9fafb",
            boxShadow: "0 2px 12px #ec489933",
          }}
        >
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: "#18181b" }}>
            Related Products
          </Typography>
          <Grid container spacing={2}>
            {isLoading ? (
              <Loader />
            ) : (
              relatedProducts.slice(0, 8).map((prod) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={prod._id}>
                  <SmallProduct product={prod} />
                </Grid>
              ))
            )}
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default ProductTabs;