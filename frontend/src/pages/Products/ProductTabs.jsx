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
  Button,
  Collapse,
} from "@mui/material";
import { useSelector } from "react-redux";
import { FaEdit } from "react-icons/fa";

const ProductTabs = ({
  product,
  userInfo,
}) => {
  const { data: relatedProducts, isLoading } = useGetTopProductsQuery();
  const [activeTab, setActiveTab] = useState(0); // Default to All Reviews
  const [showReviewForm, setShowReviewForm] = useState(false);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleReviewSubmitted = () => {
    setShowReviewForm(false); // Hide form after submission
  };

  const toggleReviewForm = () => {
    setShowReviewForm(!showReviewForm);
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
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            mb: 4,
            '& .MuiTabs-indicator': {
              display: 'none',
            },
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600,
              mr: 2,
              borderRadius: 3,
              transition: 'all 0.2s',
              minHeight: 48,
              px: 3,
              color: 'text.secondary',
              '&.Mui-selected': {
                color: 'white',
                bgcolor: 'primary.main',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
              },
              '&:hover:not(.Mui-selected)': {
                bgcolor: 'rgba(99, 102, 241, 0.08)',
                color: 'primary.main'
              }
            }
          }}
        >
          <Tab label={`All Reviews (${product.reviews.length})`} />
          <Tab label="Related Products" />
        </Tabs>
      </Paper>

      {/* All Reviews */}
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
          <EnhancedReviewsList
            product={product}
            userInfo={userInfo}
          />

          {/* Write Review Button */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              onClick={toggleReviewForm}
              sx={{
                borderRadius: 3,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                background: 'linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)',
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.39)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(99, 102, 241, 0.23)',
                  filter: 'brightness(1.1)'
                },
              }}
            >
              <FaEdit style={{ marginRight: 8 }} />
              {showReviewForm ? 'Cancel' : 'Write a Review'}
            </Button>
          </Box>

          {/* Review Form (Collapsible) */}
          <Collapse in={showReviewForm}>
            <Box sx={{ mt: 3 }}>
              <EnhancedReviewForm
                product={product}
                userInfo={userInfo}
                onReviewSubmitted={handleReviewSubmitted}
              />
            </Box>
          </Collapse>
        </Paper>
      )}

      {/* Related Products */}
      {activeTab === 1 && (
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