import { Link } from "react-router-dom";
import {
  Grid,
  Typography,
  TextField,
  MenuItem,
  Button,
  Avatar,
  Box,
  Rating,
  Tooltip,
  Stack,
  Paper,
} from "@mui/material";
import { FaUpload } from "react-icons/fa";

const ratingLabels = {
  1: "Inferior",
  2: "Decent",
  3: "Great",
  4: "Excellent",
  5: "Exceptional",
};

const ReviewForm = ({
  userInfo,
  submitHandler,
  rating,
  setRating,
  comment,
  setComment,
  images,
  setImages,
  loadingProductReview,
}) => {
  // Helper for review images preview
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  return (
    <Box>
      {userInfo ? (
        <form onSubmit={submitHandler}>
          <Paper
            elevation={2}
            sx={{
              p: { xs: 2, md: 4 },
              borderRadius: 3,
              bgcolor: "#fff",
              boxShadow: "0 2px 12px #ec489933",
              mb: 2,
            }}
          >
            <Grid container spacing={4}>
              {/* Rating */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
                  Your Rating
                </Typography>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={2}
                  sx={{ mb: 2 }}
                >
                  <Rating
                    name="product-rating"
                    value={Number(rating)}
                    precision={1}
                    size="large"
                    onChange={(_, value) => setRating(value)}
                    sx={{
                      color: "#fbbf24",
                      fontSize: "2rem",
                      "& .MuiRating-iconFilled": { color: "#fbbf24" },
                      "& .MuiRating-iconEmpty": { color: "#e5e7eb" },
                    }}
                  />
                  {rating > 0 && (
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: "#ec4899",
                        ml: 1,
                        fontSize: "1.1rem",
                        letterSpacing: 0.2,
                      }}
                    >
                      {ratingLabels[rating]}
                    </Typography>
                  )}
                </Stack>
                <TextField
                  select
                  label="Select Rating"
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  fullWidth
                  required
                  sx={{ mb: 2 }}
                >
                  <MenuItem value="">Select</MenuItem>
                  <MenuItem value={1}>Inferior</MenuItem>
                  <MenuItem value={2}>Decent</MenuItem>
                  <MenuItem value={3}>Great</MenuItem>
                  <MenuItem value={4}>Excellent</MenuItem>
                  <MenuItem value={5}>Exceptional</MenuItem>
                </TextField>
              </Grid>
              {/* Upload Images */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
                  Upload Images
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  color="secondary"
                  startIcon={<FaUpload />}
                  sx={{
                    mb: 2,
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: "none",
                    px: 2.5,
                    py: 1,
                    background: "#f9fafb",
                    "&:hover": { background: "#fce7f3" },
                  }}
                >
                  Select Images
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={handleImageChange}
                  />
                </Button>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
                  {images &&
                    Array.from(images).map((img, idx) => (
                      <Tooltip title="Preview" key={idx}>
                        <Avatar
                          src={URL.createObjectURL(img)}
                          alt={`review-img-${idx}`}
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: 2,
                            border: "2px solid #ec4899",
                            boxShadow: "0 2px 8px #ec489955",
                          }}
                          variant="rounded"
                        />
                      </Tooltip>
                    ))}
                </Box>
              </Grid>
              {/* Comment */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
                  Comment
                </Typography>
                <TextField
                  label="Write your review"
                  multiline
                  minRows={3}
                  fullWidth
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  sx={{
                    bgcolor: "#f9fafb",
                    borderRadius: 2,
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "#e3eeff" },
                      "&:hover fieldset": { borderColor: "#ec4899" },
                    },
                  }}
                />
              </Grid>
              {/* Submit */}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="secondary"
                  size="large"
                  disabled={loadingProductReview}
                  sx={{
                    borderRadius: 3,
                    fontWeight: "bold",
                    px: 5,
                    mt: 2,
                    fontSize: "1.1rem",
                    background: "#ec4899",
                    "&:hover": { background: "#be185d" },
                    boxShadow: 2,
                    textTransform: "none",
                  }}
                >
                  Submit Review
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </form>
      ) : (
        <Typography sx={{ fontWeight: 500, fontSize: "1.1rem" }}>
          Please{" "}
          <Link
            to="/login"
            style={{ color: "#ec4899", fontWeight: 700 }}
          >
            sign in
          </Link>{" "}
          to write a review.
        </Typography>
      )}
    </Box>
  );
};

export default ReviewForm;