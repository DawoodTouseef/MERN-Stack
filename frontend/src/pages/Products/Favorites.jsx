import { useSelector } from "react-redux";
import { selectFavoriteProduct } from "../../redux/features/favorites/favoriteSlice";
import Product from "./Product";
import { Box, Grid, Typography, Paper, Fade, Button } from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { alpha } from "@mui/material/styles";
import { Link } from "react-router-dom";
import DocumentTitle from "../../components/DocumentTitle";
import { APP_NAME } from "../../redux/constants";
const Favorites = () => {
  const favorites = useSelector(selectFavoriteProduct);

  return (
    <DocumentTitle title={`My Favorites - ${APP_NAME}`}>
      <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", py: 6 }}>
        <Box sx={{ maxWidth: 1200, mx: "auto", px: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 5, gap: 2 }}>
            <Box sx={{
              width: 48,
              height: 48,
              borderRadius: 3,
              bgcolor: alpha('#6366f1', 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FavoriteIcon sx={{ color: '#6366f1' }} />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight={900} color="#1e293b">
                My Favorites
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {favorites.length} {favorites.length === 1 ? 'item' : 'items'} saved in your wishlist
              </Typography>
            </Box>
          </Box>

          {favorites.length === 0 ? (
            <Paper elevation={0} sx={{ p: 8, borderRadius: 5, border: '1px dashed #cbd5e1', bgcolor: 'transparent', textAlign: 'center' }}>
              <FavoriteIcon sx={{ fontSize: 80, color: '#e2e8f0', mb: 3 }} />
              <Typography variant="h5" fontWeight={800} color="#1e293b" sx={{ mb: 1 }}>Your wishlist is empty</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>Save items you love and keep track of updates!</Typography>
              <Button
                component={Link}
                to="/shop"
                variant="contained"
                size="large"
                sx={{
                  borderRadius: 3,
                  px: 6,
                  py: 1.5,
                  fontWeight: 800,
                  textTransform: 'none',
                  bgcolor: '#6366f1',
                  '&:hover': { bgcolor: '#4f46e5' }
                }}
              >
                Go to Shop
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {favorites.map((product) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      borderRadius: 4,
                      border: '1px solid #e2e8f0',
                      transition: 'all 0.2s',
                      '&:hover': {
                        boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                        borderColor: '#6366f1'
                      }
                    }}
                  >
                    <Product product={product} />
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Box>
    </DocumentTitle>
  );
};

export default Favorites;
