import { useSelector } from "react-redux";
import { selectFavoriteProduct } from "../../redux/features/favorites/favoriteSlice";
import Product from "./Product";
import { Box, Grid, Typography, Paper, Fade } from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import DocumentTitle from "react-document-title";
const Favorites = () => {
  const favorites = useSelector(selectFavoriteProduct);

  return (
    <DocumentTitle title="Favorites | Nexus Mart">
    <Box
      sx={{
        minHeight: "80vh",
        px: { xs: 2, md: 10 },
        py: 6,
        background: "linear-gradient(135deg, #f3e7e9 0%, #e3eeff 100%)",
      }}
      className="min-h-screen"
    >
      <Paper
        elevation={6}
        sx={{
          p: { xs: 2, md: 5 },
          borderRadius: 4,
          bgcolor: "#fff",
          boxShadow: "0 8px 32px 0 rgba(236,72,153,0.10)",
          maxWidth: 1400,
          mx: "auto",
        }}
        className="shadow-xl"
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
          <FavoriteBorderIcon
            sx={{
              color: "#ec4899",
              fontSize: 38,
              mr: 2,
              filter: "drop-shadow(0 2px 8px #ec489955)",
            }}
          />
          <Typography
            variant="h4"
            fontWeight={800}
            color="primary.main"
            sx={{
              letterSpacing: 1,
              textShadow: "2px 2px 8px #f3e7e9",
            }}
          >
            Favorite Products
          </Typography>
        </Box>
        {favorites.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              color: "#a1a1aa",
              fontWeight: 600,
              fontSize: "1.3rem",
              letterSpacing: 1,
            }}
          >
            You have no favorite products yet. Start adding some!
          </Box>
        ) : (
          <Grid container spacing={4}>
            {favorites.map((product, idx) => (
              <Fade in timeout={400 + idx * 100} key={product._id}>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <Box
                    sx={{
                      transition: "transform 0.2s, box-shadow 0.2s",
                      "&:hover": {
                        transform: "scale(1.03)",
                        boxShadow: 8,
                        bgcolor: "#fce7f3",
                      },
                      borderRadius: 3,
                      boxShadow: "0 2px 12px 0 rgba(236,72,153,0.08)",
                      bgcolor: "#f9fafb",
                      p: 1,
                    }}
                    className="hover:scale-105 hover:shadow-2xl transition-transform duration-200"
                  >
                    <Product product={product} />
                  </Box>
                </Grid>
              </Fade>
            ))}
          </Grid>
        )}
      </Paper>
    </Box>
    </DocumentTitle>
  );
};

export default Favorites;
