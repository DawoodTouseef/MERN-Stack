import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Rating,
  Stack,
  Grid,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  Divider,
} from "@mui/material";
import {
  Verified,
  Star,
  ThumbUp,
  ThumbDown,
  Flag,
  Reply,
  CheckCircle,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { 
  useGetProductReviewsQuery, 
  useVoteOnReviewMutation, 
  useReportReviewMutation 
} from "../../redux/api/productApiSlice";

const reportReasons = [
  { value: "spam", label: "Spam" },
  { value: "inappropriate", label: "Inappropriate Content" },
  { value: "fake", label: "Fake Review" },
  { value: "offensive", label: "Offensive Language" },
  { value: "other", label: "Other" },
];

const usageOptions = [
  { value: "less_than_week", label: "Less than a week" },
  { value: "1_to_4_weeks", label: "1-4 weeks" },
  { value: "1_to_3_months", label: "1-3 months" },
  { value: "3_to_6_months", label: "3-6 months" },
  { value: "6_months_to_year", label: "6 months to 1 year" },
  { value: "more_than_year", label: "More than a year" },
];

const recommendationOptions = [
  { value: "highly_recommend", label: "Highly Recommend", color: "#4caf50" },
  { value: "recommend", label: "Recommend", color: "#8bc34a" },
  { value: "neutral", label: "Neutral", color: "#ff9800" },
  { value: "not_recommend", label: "Don't Recommend", color: "#f44336" },
  { value: "strongly_not_recommend", label: "Strongly Don't Recommend", color: "#d32f2f" },
];

const EnhancedReviewsList = ({ product, userInfo }) => {
  const [sortBy, setSortBy] = useState("newest");
  const [filterBy, setFilterBy] = useState("all");
  const [reportDialog, setReportDialog] = useState({ open: false, reviewId: null });
  const [reportForm, setReportForm] = useState({ reason: "", description: "" });

  const [voteOnReview] = useVoteOnReviewMutation();
  const [reportReview] = useReportReviewMutation();

  const {
    data: reviewsData,
    isLoading: reviewsLoading,
    refetch: refetchReviews,
  } = useGetProductReviewsQuery({ 
    productId: product._id,
    page: 1,
    limit: 20,
    sortBy,
    verified: filterBy === 'verified' ? 'true' : undefined,
    withMedia: filterBy === 'withMedia' ? 'true' : undefined,
  });

  const handleVote = async (reviewId, isHelpful) => {
    if (!userInfo) {
      alert("Please login to vote");
      return;
    }

    try {
      await voteOnReview({
        productId: product._id,
        reviewId,
        isHelpful
      }).unwrap();
      refetchReviews();
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  const handleReportSubmit = async () => {
    try {
      await reportReview({
        productId: product._id,
        reviewId: reportDialog.reviewId,
        reason: reportForm.reason,
        description: reportForm.description
      }).unwrap();
      
      setReportDialog({ open: false, reviewId: null });
      setReportForm({ reason: "", description: "" });
      alert("Review reported successfully");
    } catch (error) {
      console.error("Error reporting review:", error);
      alert("Error reporting review");
    }
  };

  const ReviewCard = ({ review }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Paper
        elevation={2}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          border: review.isVerifiedPurchase ? "2px solid #4caf50" : "1px solid #e0e0e0",
          position: "relative",
        }}
      >
        {review.isVerifiedPurchase && (
          <Chip
            icon={<Verified />}
            label="Verified Purchase"
            size="small"
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              bgcolor: "#e8f5e8",
              color: "#2e7d32",
              fontWeight: 600,
            }}
          />
        )}

        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Avatar
            sx={{
              bgcolor: "#ec4899",
              width: 48,
              height: 48,
              fontSize: "1.2rem",
              fontWeight: 700,
            }}
          >
            {review.name?.[0]?.toUpperCase() || "U"}
          </Avatar>

          <Box flex={1}>
            <Stack direction="row" alignItems="center" spacing={1} mb={1}>
              <Typography variant="h6" fontWeight={600}>
                {review.name}
              </Typography>
              {review.qualityScore >= 70 && (
                <Chip 
                  icon={<Star />} 
                  label="Top Reviewer" 
                  size="small" 
                  color="warning" 
                />
              )}
            </Stack>

            <Stack direction="row" alignItems="center" spacing={2} mb={1}>
              <Rating value={review.rating} readOnly size="small" />
              <Typography variant="body2" color="text.secondary">
                {new Date(review.createdAt).toLocaleDateString()}
              </Typography>
              {review.isEdited && (
                <Chip label="Edited" size="small" variant="outlined" />
              )}
            </Stack>

            {review.title && (
              <Typography variant="subtitle1" fontWeight={600} mb={1}>
                {review.title}
              </Typography>
            )}

            <Typography variant="body1" mb={2} sx={{ lineHeight: 1.6 }}>
              {review.comment}
            </Typography>

            {/* Pros and Cons */}
            {((review.pros && review.pros.length > 0) || (review.cons && review.cons.length > 0)) && (
              <Grid container spacing={2} mb={2}>
                {review.pros && review.pros.length > 0 && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="success.main" fontWeight={600} mb={1}>
                      👍 Pros:
                    </Typography>
                    {review.pros.map((pro, index) => (
                      <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                        • {pro}
                      </Typography>
                    ))}
                  </Grid>
                )}
                
                {review.cons && review.cons.length > 0 && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="error.main" fontWeight={600} mb={1}>
                      👎 Cons:
                    </Typography>
                    {review.cons.map((con, index) => (
                      <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                        • {con}
                      </Typography>
                    ))}
                  </Grid>
                )}
              </Grid>
            )}

            {/* Usage Context */}
            {review.usageContext && Object.keys(review.usageContext).length > 0 && (
              <Box mb={2}>
                <Typography variant="subtitle2" fontWeight={600} mb={1}>
                  Usage Information:
                </Typography>
                <Stack direction="row" spacing={2} flexWrap="wrap">
                  {review.usageContext.howLongUsed && (
                    <Chip
                      label={`Used for: ${usageOptions.find(opt => opt.value === review.usageContext.howLongUsed)?.label}`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                  {review.usageContext.recommendation && (
                    <Chip
                      label={recommendationOptions.find(opt => opt.value === review.usageContext.recommendation)?.label}
                      size="small"
                      sx={{
                        bgcolor: recommendationOptions.find(opt => opt.value === review.usageContext.recommendation)?.color + "20",
                        color: recommendationOptions.find(opt => opt.value === review.usageContext.recommendation)?.color,
                      }}
                    />
                  )}
                </Stack>
              </Box>
            )}

            {/* Review Images */}
            {review.images && review.images.length > 0 && (
              <Stack direction="row" spacing={1} mb={2}>
                {review.images.map((image, index) => (
                  <Avatar
                    key={index}
                    src={image.url || image}
                    variant="rounded"
                    sx={{ width: 60, height: 60, cursor: "pointer" }}
                  />
                ))}
              </Stack>
            )}

            {/* Vendor Response */}
            {review.vendorResponse && (
              <Paper
                sx={{
                  p: 2,
                  mb: 2,
                  bgcolor: "#f5f5f5",
                  borderLeft: "4px solid #ec4899",
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                  <Reply fontSize="small" />
                  <Typography variant="subtitle2" fontWeight={600}>
                    Vendor Response
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(review.vendorResponse.respondedAt).toLocaleDateString()}
                  </Typography>
                </Stack>
                <Typography variant="body2">
                  {review.vendorResponse.comment}
                </Typography>
              </Paper>
            )}

            {/* Action Buttons */}
            <Stack direction="row" spacing={2} alignItems="center">
              <Button
                size="small"
                startIcon={<ThumbUp />}
                onClick={() => handleVote(review._id, true)}
                variant={review.userVote === true ? "contained" : "outlined"}
                color="success"
              >
                Helpful ({review.helpfulCount || 0})
              </Button>
              
              <Button
                size="small"
                startIcon={<ThumbDown />}
                onClick={() => handleVote(review._id, false)}
                variant={review.userVote === false ? "contained" : "outlined"}
                color="error"
              >
                Not Helpful ({review.notHelpfulCount || 0})
              </Button>

              <Button
                size="small"
                startIcon={<Flag />}
                onClick={() => setReportDialog({ open: true, reviewId: review._id })}
                color="warning"
              >
                Report
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </motion.div>
  );

  return (
    <Box>
      {reviewsLoading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : reviewsData?.reviews?.length > 0 ? (
        <Box>
          {/* Review Statistics */}
          {reviewsData.stats && (
            <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Stack alignItems="center" spacing={1}>
                    <Typography variant="h3" fontWeight={700} color="#ec4899">
                      {reviewsData.stats.averageRating.toFixed(1)}
                    </Typography>
                    <Rating value={reviewsData.stats.averageRating} readOnly />
                    <Typography variant="body2" color="text.secondary">
                      Based on {reviewsData.stats.totalReviews} reviews
                    </Typography>
                  </Stack>
                </Grid>
                
                <Grid item xs={12} md={8}>
                  <Typography variant="h6" mb={2}>Rating Breakdown</Typography>
                  {[5, 4, 3, 2, 1].map(rating => (
                    <Stack key={rating} direction="row" alignItems="center" spacing={2} mb={1}>
                      <Typography variant="body2" minWidth={20}>
                        {rating}★
                      </Typography>
                      <Box
                        sx={{
                          flex: 1,
                          height: 8,
                          bgcolor: "#f0f0f0",
                          borderRadius: 4,
                          overflow: "hidden",
                        }}
                      >
                        <Box
                          sx={{
                            height: "100%",
                            bgcolor: "#ec4899",
                            width: `${((reviewsData.stats.ratingBreakdown[rating] || 0) / reviewsData.stats.totalReviews) * 100}%`,
                            transition: "width 0.3s ease",
                          }}
                        />
                      </Box>
                      <Typography variant="body2" minWidth={30}>
                        {reviewsData.stats.ratingBreakdown[rating] || 0}
                      </Typography>
                    </Stack>
                  ))}
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* Sort and Filter Controls */}
          <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Sort by</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Sort by"
                >
                  <MenuItem value="newest">Newest</MenuItem>
                  <MenuItem value="oldest">Oldest</MenuItem>
                  <MenuItem value="helpful">Most Helpful</MenuItem>
                  <MenuItem value="rating_high">Highest Rating</MenuItem>
                  <MenuItem value="rating_low">Lowest Rating</MenuItem>
                  <MenuItem value="verified">Verified First</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Filter</InputLabel>
                <Select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  label="Filter"
                >
                  <MenuItem value="all">All Reviews</MenuItem>
                  <MenuItem value="verified">Verified Only</MenuItem>
                  <MenuItem value="withMedia">With Photos</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Paper>

          {/* Review List */}
          {reviewsData.reviews.map((review) => (
            <ReviewCard key={review._id} review={review} />
          ))}
        </Box>
      ) : (
        <Paper elevation={2} sx={{ p: 4, textAlign: "center", borderRadius: 3 }}>
          <Typography variant="h6" color="text.secondary" mb={1}>
            No reviews yet
          </Typography>
          <Typography color="text.secondary">
            Be the first to review this product and help other customers!
          </Typography>
        </Paper>
      )}

      {/* Report Dialog */}
      <Dialog open={reportDialog.open} onClose={() => setReportDialog({ open: false, reviewId: null })}>
        <DialogTitle>Report Review</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Help us maintain quality by reporting inappropriate content.
          </Typography>
          
          <FormControl fullWidth margin="dense">
            <InputLabel>Reason for reporting</InputLabel>
            <Select
              value={reportForm.reason}
              onChange={(e) => setReportForm(prev => ({ ...prev, reason: e.target.value }))}
              label="Reason for reporting"
            >
              {reportReasons.map(reason => (
                <MenuItem key={reason.value} value={reason.value}>
                  {reason.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            multiline
            rows={3}
            margin="dense"
            label="Additional details (optional)"
            value={reportForm.description}
            onChange={(e) => setReportForm(prev => ({ ...prev, description: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialog({ open: false, reviewId: null })}>
            Cancel
          </Button>
          <Button 
            onClick={handleReportSubmit}
            variant="contained"
            color="warning"
            disabled={!reportForm.reason}
          >
            Submit Report
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EnhancedReviewsList;