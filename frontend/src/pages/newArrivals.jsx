import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Chip,
  Divider,
  Alert,
  Link,
  Rating,
  Skeleton,
} from "@mui/material";
import { useState, useEffect } from "react";
import { NewReleases, LocalFireDepartment, Star } from "@mui/icons-material";
import { useGetNewProductsQuery } from "../redux/api/productApiSlice";

const NewArrivals = () => {
  const { data: products = [], isLoading, isError, error } = useGetNewProductsQuery();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: { xs: 4, md: 8 },
        px: { xs: 2, md: 4 },
        background: "linear-gradient(135deg, #f3e7e9 0%, #e3eeff 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          maxWidth: 1200,
          width: "100%",
          mx: "auto",
          p: { xs: 3, md: 5 },
          borderRadius: 4,
          boxShadow: "0 8px 32px 0 rgba(236,72,153,0.15)",
          background: "#fff",
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <NewReleases sx={{ fontSize: 40, color: "#ec4899" }} />
          <Typography
            variant="h3"
            fontWeight="bold"
            sx={{
              color: "#ec4899",
              letterSpacing: 0.5,
            }}
          >
            New Arrivals
          </Typography>
        </Box>
        
        <Typography
          variant="subtitle1"
          sx={{ color: "#6366f1", mb: 4 }}
        >
          Discover our latest products and be the first to experience innovation
        </Typography>

        <Alert severity="info" sx={{ mb: 4 }}>
          <Typography variant="body1">
            <strong>Fresh Picks:</strong> These items just arrived and are creating a buzz! 
            Be among the first to own these exciting new products.
          </Typography>
        </Alert>

        {isLoading ? (
          <Grid container spacing={4}>
            {[...Array(6)].map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{ height: '100%' }}>
                  <Skeleton variant="rectangular" height={200} />
                  <CardContent>
                    <Skeleton variant="text" sx={{ fontSize: '1.5rem', mb: 1 }} />
                    <Skeleton variant="text" sx={{ fontSize: '1rem', mb: 2 }} />
                    <Skeleton variant="text" sx={{ fontSize: '1rem', width: '60%' }} />
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Skeleton variant="rectangular" width="100%" height={36} />
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : isError ? (
          <Alert severity="error">
            Error loading new arrivals: {error?.data?.message || "Failed to load products"}
          </Alert>
        ) : (
          <Grid container spacing={4}>
            {products.map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product._id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 6
                    }
                  }}
                >
                  <CardMedia
                    component="img"
                    height="250"
                    image={product.media?.[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&h=600"}
                    alt={product.name}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography gutterBottom variant="h6" component="div" fontWeight="bold">
                        {product.name}
                      </Typography>
                      <Box>
                        <Chip 
                          icon={<NewReleases />} 
                          label="New" 
                          color="primary" 
                          size="small" 
                          sx={{ mb: 0.5 }}
                        />
                        {product.rating >= 4.5 && (
                          <Chip 
                            icon={<LocalFireDepartment />} 
                            label="Trending" 
                            color="error" 
                            size="small" 
                          />
                        )}
                      </Box>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {product.description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Rating value={product.rating} precision={0.5} size="small" readOnly />
                      <Typography variant="body2" color="text.secondary">
                        {product.rating} ({product.numReviews})
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="h6" color="primary.main" fontWeight="bold">
                        ${product.price?.toFixed(2)}
                      </Typography>
                      {product.pricing?.compareAtPrice > product.price && (
                        <>
                          <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                            ${product.pricing.compareAtPrice.toFixed(2)}
                          </Typography>
                          <Chip 
                            label={`${Math.round((1 - product.price / product.pricing.compareAtPrice) * 100)}% OFF`} 
                            size="small" 
                            color="success" 
                          />
                        </>
                      )}
                    </Box>
                    
                    <Chip label={product.category?.name || "Uncategorized"} variant="outlined" size="small" />
                  </CardContent>
                  <CardActions sx={{ mt: 'auto', p: 2, pt: 0 }}>
                    <Button 
                      size="small" 
                      variant="contained" 
                      fullWidth
                      sx={{ 
                        fontWeight: 'bold',
                        borderRadius: 2,
                        py: 1
                      }}
                    >
                      View Product
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <Divider sx={{ my: 6 }} />

        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
            Want to be notified about future arrivals?
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
            Subscribe to our newsletter and be the first to know about new products and exclusive offers
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            sx={{ 
              px: 4, 
              py: 1.5, 
              fontWeight: 'bold',
              borderRadius: 3,
              bgcolor: "primary.main",
              "&:hover": { bgcolor: "primary.dark" }
            }}
          >
            Subscribe to Newsletter
          </Button>
        </Box>

        <Box sx={{ mt: 4, p: 3, bgcolor: '#f0f8ff', borderRadius: 2 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            About Our New Arrivals
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            At Nexus Mart, we're constantly updating our inventory with the latest and greatest products across all categories. 
            Our team carefully selects new items based on quality, innovation, and customer demand.
          </Typography>
          <Typography variant="body1">
            For questions about any of our new arrivals or to request a specific product, please contact our customer support team at 
            <Link href="mailto:support@nexusmart.com"> support@nexusmart.com</Link>.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default NewArrivals;