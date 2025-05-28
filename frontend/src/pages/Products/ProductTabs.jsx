import { useState } from "react";
import { Link } from "react-router-dom";
import { useGetTopProductsQuery } from "../../redux/api/productApiSlice";
import SmallProduct from "./SmallProduct";
import Loader from "../../components/Loader";
import ReviewForm from "./ReviewForm";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Paper,
  Avatar,
  Stack,
  Divider,
  Grid,
  Rating,
  Chip,
  Tooltip,
} from "@mui/material";
import { FaUserCircle } from "react-icons/fa";

const ProductTabs = ({
  loadingProductReview,
  userInfo,
  submitHandler,
  rating,
  setRating,
  comment,
  setComment,
  product,
  images,
  setImages,
}) => {
  const { data, isLoading } = useGetTopProductsQuery();
  const [activeTab, setActiveTab] = useState(1); // Default to All Reviews

  if (isLoading) {
    return <Loader />;
  }

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
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
          <ReviewForm
            userInfo={userInfo}
            submitHandler={submitHandler}
            rating={rating}
            setRating={setRating}
            comment={comment}
            setComment={setComment}
            images={images}
            setImages={setImages}
            loadingProductReview={loadingProductReview}
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
          {product.reviews.length === 0 ? (
            <Typography color="text.secondary" sx={{ fontWeight: 500 }}>
              No reviews yet. Be the first to review this product!
            </Typography>
          ) : (
            <Box>
              {product.reviews.map((review) => (
                <Box key={review._id} sx={{ mb: 4 }}>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                    <Avatar
                      sx={{
                        bgcolor: "#ec4899",
                        fontWeight: 700,
                        width: 48,
                        height: 48,
                        fontSize: 24,
                        boxShadow: "0 2px 8px #ec489955",
                      }}
                    >
                      {review.name ? review.name[0].toUpperCase() : <FaUserCircle />}
                    </Avatar>
                    <Box>
                      <Typography fontWeight="bold" color="text.primary" sx={{ fontSize: "1.1rem" }}>
                        {review.name}
                        {review.isVerified && (
                          <Chip
                            label="Verified Purchase"
                            size="small"
                            sx={{
                              ml: 1,
                              bgcolor: "#c8e6c9",
                              color: "#388e3c",
                              fontWeight: 600,
                              fontSize: "0.8rem",
                              borderRadius: "999px",
                            }}
                          />
                        )}
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Rating value={Number(review.rating)} readOnly size="small" sx={{ color: "#ec4899" }} />
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          {new Date(review.createdAt).toLocaleDateString()}
                        </Typography>
                      </Stack>
                    </Box>
                    {review.images && review.images.length > 0 && (
                      <Stack direction="row" spacing={1} sx={{ ml: 2 }}>
                        {review.images.map((img, idx) => (
                          <Tooltip title="Review Image" key={idx}>
                            <Avatar
                              src={img}
                              alt={`review-img-${idx}`}
                              sx={{
                                width: 44,
                                height: 44,
                                borderRadius: 2,
                                border: "2px solid #ec4899",
                                boxShadow: "0 2px 8px #ec489955",
                              }}
                              variant="rounded"
                            />
                          </Tooltip>
                        ))}
                      </Stack>
                    )}
                  </Stack>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{
                      mb: 1,
                      fontSize: "1.05rem",
                      letterSpacing: 0.1,
                      lineHeight: 1.6,
                    }}
                  >
                    {review.comment}
                  </Typography>
                  <Divider sx={{ my: 2, bgcolor: "#e3eeff" }} />
                </Box>
              ))}
            </Box>
          )}
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
            {!data ? (
              <Loader />
            ) : (
              data.slice(0, 8).map((prod) => (
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
