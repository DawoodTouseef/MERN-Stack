import ProductCarousel from "../pages/Products/ProductCarousel";
import { Box, Typography, Fade, Slide } from "@mui/material";

const Header = () => {
  return (
    <Fade in timeout={900}>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          my: 4,
          position: "relative",
        }}
      >
        <Slide direction="down" in timeout={1200}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              letterSpacing: 1,
              color: "secondary.main",
              mb: 2,
              textShadow: "2px 2px 12px #f8bbd0",
              textAlign: "center",
              px: 2,
            }}
          >
            Welcome to Our Store
          </Typography>
        </Slide>
        <Box sx={{ width: "100%" }}>
          <ProductCarousel />
        </Box>
      </Box>
    </Fade>
  );
};

export default Header;
