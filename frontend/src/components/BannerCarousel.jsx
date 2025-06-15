import { Box, Typography, Button, CircularProgress } from "@mui/material";
import Carousel from "react-material-ui-carousel";
import { motion } from "framer-motion";
import { useFetchBannersQuery } from "../redux/api/bannerApiSlice";

const BannerCarousel = () => {
  const { data: banners, isLoading, isError } = useFetchBannersQuery();

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 300 }}>
        <Typography variant="h6" color="error">
          Failed to load banners. Please try again later.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", mt: 2, mb: 4 }}>
      <Carousel
        indicators={true}
        animation="fade"
        interval={5000}
        navButtonsAlwaysVisible
        sx={{ borderRadius: 3, overflow: "hidden" }}
      >
        {banners.map((banner, idx) => (
          <Box
            key={banner._id}
            sx={{
              position: "relative",
              width: "100%",
              height: { xs: 250, sm: 350, md: 450 },
              overflow: "hidden",
            }}
          >
            {/* Background Image */}
            <motion.img
              src={banner.image}
              alt={`Banner ${idx + 1}`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 5, ease: "easeInOut" }}
            />

            {/* Overlay Text */}
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "10%",
                transform: "translateY(-50%)",
                color: "#fff",
                textShadow: "2px 2px 8px rgba(0, 0, 0, 0.7)",
                zIndex: 2,
                maxWidth: "40%",
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: "bold",
                    mb: 1,
                    fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
                  }}
                >
                  {banner.title}
                </Typography>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: { xs: "0.9rem", sm: "1rem", md: "1.2rem" },
                    mb: 2,
                  }}
                >
                  {banner.subtitle}
                </Typography>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.9 }}
              >
                <Button
                  variant="contained"
                  color="secondary"
                  href={banner.ctaLink}
                  sx={{
                    fontWeight: "bold",
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    textTransform: "uppercase",
                    boxShadow: 3,
                    "&:hover": {
                      boxShadow: 6,
                      transform: "scale(1.05)",
                    },
                  }}
                >
                  {banner.ctaText}
                </Button>
              </motion.div>
            </Box>

            {/* Gradient Overlay */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background:
                  "linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.7))",
                zIndex: 1,
              }}
            />
          </Box>
        ))}
      </Carousel>
    </Box>
  );
};

export default BannerCarousel;