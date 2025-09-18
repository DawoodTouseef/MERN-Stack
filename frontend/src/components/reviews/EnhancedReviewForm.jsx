import { useState } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Rating,
  Stack,
  Grid,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  IconButton,
} from "@mui/material";
import {
  PhotoCamera,
  Videocam,
  Add,
  Close,
  CheckCircle,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useCreateReviewMutation, useGetProductReviewsQuery } from "../../redux/api/productApiSlice";

const ratingLabels = {
  1: "Poor",
  2: "Fair", 
  3: "Good",
  4: "Very Good",
  5: "Excellent",
};

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

const EnhancedReviewForm = ({ product, userInfo, onReviewSubmitted }) => {
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    title: "",
    comment: "",
    pros: [""],
    cons: [""],
    usageContext: {
      howLongUsed: "",
      useCase: "",
      recommendation: "",
    },
    images: [],
    videos: [],
  });

  const [createReview, { isLoading: isSubmitting }] = useCreateReviewMutation();

  const handleInputChange = (field, value) => {
    setReviewForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUsageContextChange = (field, value) => {
    setReviewForm(prev => ({
      ...prev,
      usageContext: {
        ...prev.usageContext,
        [field]: value
      }
    }));
  };

  const addProsOrCons = (type) => {
    setReviewForm(prev => ({
      ...prev,
      [type]: [...prev[type], ""]
    }));
  };

  const updateProsOrCons = (type, index, value) => {
    setReviewForm(prev => ({
      ...prev,
      [type]: prev[type].map((item, i) => i === index ? value : item)
    }));
  };

  const removeProsOrCons = (type, index) => {
    setReviewForm(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    // In a real app, you'd upload these to your server/cloud storage
    const imageUrls = files.map(file => URL.createObjectURL(file));
    setReviewForm(prev => ({
      ...prev,
      images: [...prev.images, ...imageUrls]
    }));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!userInfo) {
      alert("Please login to submit a review");
      return;
    }

    if (reviewForm.rating === 0) {
      alert("Please select a rating");
      return;
    }

    if (reviewForm.comment.trim().length < 10) {
      alert("Please write a review with at least 10 characters");
      return;
    }

    try {
      const reviewData = {
        ...reviewForm,
        pros: reviewForm.pros.filter(p => p.trim()),
        cons: reviewForm.cons.filter(c => c.trim()),
      };

      await createReview({
        productId: product._id,
        ...reviewData
      }).unwrap();

      // Reset form
      setReviewForm({
        rating: 0,
        title: "",
        comment: "",
        pros: [""],
        cons: [""],
        usageContext: {
          howLongUsed: "",
          useCase: "",
          recommendation: "",
        },
        images: [],
        videos: [],
      });
      
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Error submitting review. Please try again.");
    }
  };

  return (
    <Box>
      {userInfo ? (
        <form onSubmit={handleSubmitReview}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
            <Typography variant="h5" fontWeight={700} mb={3} color="#ec4899">
              Share Your Experience
            </Typography>

            <Grid container spacing={4}>
              {/* Rating Section */}
              <Grid item xs={12}>
                <Typography variant="h6" mb={2}>
                  Overall Rating *
                </Typography>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Rating
                    value={reviewForm.rating}
                    onChange={(_, value) => handleInputChange("rating", value)}
                    size="large"
                    sx={{ fontSize: "2.5rem" }}
                  />
                  {reviewForm.rating > 0 && (
                    <Chip
                      label={ratingLabels[reviewForm.rating]}
                      color="primary"
                      variant="outlined"
                    />
                  )}
                </Stack>
              </Grid>

              {/* Title */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Review Title (Optional)"
                  placeholder="Summarize your experience in a few words"
                  value={reviewForm.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  inputProps={{ maxLength: 200 }}
                  helperText={`${reviewForm.title.length}/200 characters`}
                />
              </Grid>

              {/* Comment */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Your Review *"
                  placeholder="Tell others about your experience with this product..."
                  value={reviewForm.comment}
                  onChange={(e) => handleInputChange("comment", e.target.value)}
                  inputProps={{ maxLength: 2000 }}
                  helperText={`${reviewForm.comment.length}/2000 characters (minimum 10)`}
                  error={reviewForm.comment.length > 0 && reviewForm.comment.length < 10}
                />
              </Grid>

              {/* Pros and Cons */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" mb={2} color="success.main">
                  👍 What did you like?
                </Typography>
                {reviewForm.pros.map((pro, index) => (
                  <Stack key={index} direction="row" spacing={1} mb={1}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Add a positive point"
                      value={pro}
                      onChange={(e) => updateProsOrCons("pros", index, e.target.value)}
                    />
                    {reviewForm.pros.length > 1 && (
                      <IconButton onClick={() => removeProsOrCons("pros", index)}>
                        <Close />
                      </IconButton>
                    )}
                  </Stack>
                ))}
                <Button
                  startIcon={<Add />}
                  onClick={() => addProsOrCons("pros")}
                  size="small"
                  color="success"
                >
                  Add Pro
                </Button>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" mb={2} color="error.main">
                  👎 What could be improved?
                </Typography>
                {reviewForm.cons.map((con, index) => (
                  <Stack key={index} direction="row" spacing={1} mb={1}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Add a point for improvement"
                      value={con}
                      onChange={(e) => updateProsOrCons("cons", index, e.target.value)}
                    />
                    {reviewForm.cons.length > 1 && (
                      <IconButton onClick={() => removeProsOrCons("cons", index)}>
                        <Close />
                      </IconButton>
                    )}
                  </Stack>
                ))}
                <Button
                  startIcon={<Add />}
                  onClick={() => addProsOrCons("cons")}
                  size="small"
                  color="error"
                >
                  Add Con
                </Button>
              </Grid>

              {/* Usage Context */}
              <Grid item xs={12}>
                <Typography variant="h6" mb={2}>
                  Usage Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>How long have you used this?</InputLabel>
                      <Select
                        value={reviewForm.usageContext.howLongUsed}
                        onChange={(e) => handleUsageContextChange("howLongUsed", e.target.value)}
                        label="How long have you used this?"
                      >
                        {usageOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Primary use case"
                      placeholder="e.g., Gaming, Work, Photography"
                      value={reviewForm.usageContext.useCase}
                      onChange={(e) => handleUsageContextChange("useCase", e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Would you recommend this?</InputLabel>
                      <Select
                        value={reviewForm.usageContext.recommendation}
                        onChange={(e) => handleUsageContextChange("recommendation", e.target.value)}
                        label="Would you recommend this?"
                      >
                        {recommendationOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={isSubmitting || reviewForm.rating === 0 || reviewForm.comment.length < 10}
                  sx={{
                    bgcolor: "#ec4899",
                    py: 2,
                    px: 6,
                    borderRadius: 3,
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    "&:hover": { bgcolor: "#d63384" },
                  }}
                  startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
                >
                  {isSubmitting ? "Submitting..." : "Submit Review"}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </form>
      ) : (
        <Alert severity="info" sx={{ borderRadius: 3 }}>
          <Typography variant="h6" mb={1}>
            Please sign in to write a review
          </Typography>
          <Typography>
            Share your experience with other customers by signing in and leaving a detailed review.
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default EnhancedReviewForm;