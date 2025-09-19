import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  Chip,
  Divider,
  Alert,
  Link,
  TextField,
  InputAdornment,
  Skeleton,
} from "@mui/material";
import { useState, useEffect } from "react";
import { Search, Star, Verified } from "@mui/icons-material";

const Brands = () => {
  const [brands, setBrands] = useState([]);
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Mock brands data
  const brandData = [
    {
      id: 1,
      name: "TechNova",
      description: "Innovative technology solutions for the modern world",
      logo: "https://images.unsplash.com/photo-1547027072-3a9a2c5a3c5c?auto=format&fit=crop&w=200&h=200",
      category: "Electronics",
      rating: 4.8,
      products: 124,
      isFeatured: true,
      established: 2010
    },
    {
      id: 2,
      name: "EcoWear",
      description: "Sustainable fashion for the conscious consumer",
      logo: "https://images.unsplash.com/photo-1529361136673-9d7e40a3a825?auto=format&fit=crop&w=200&h=200",
      category: "Clothing",
      rating: 4.6,
      products: 89,
      isFeatured: true,
      established: 2015
    },
    {
      id: 3,
      name: "HomeEssentials",
      description: "Quality home goods for everyday living",
      logo: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=200&h=200",
      category: "Home & Kitchen",
      rating: 4.7,
      products: 203,
      established: 2008
    },
    {
      id: 4,
      name: "FitLife",
      description: "Premium fitness equipment and apparel",
      logo: "https://images.unsplash.com/photo-1534367507877-0edd93bd013b?auto=format&fit=crop&w=200&h=200",
      category: "Sports & Fitness",
      rating: 4.5,
      products: 72,
      isFeatured: true,
      established: 2012
    },
    {
      id: 5,
      name: "BeautyGlow",
      description: "Natural beauty products for radiant skin",
      logo: "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?auto=format&fit=crop&w=200&h=200",
      category: "Beauty",
      rating: 4.9,
      products: 142,
      established: 2018
    },
    {
      id: 6,
      name: "BookWorld",
      description: "Your gateway to literary adventures",
      logo: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=200&h=200",
      category: "Books",
      rating: 4.4,
      products: 56,
      established: 2005
    },
    {
      id: 7,
      name: "ToyJoy",
      description: "Fun and educational toys for all ages",
      logo: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=200&h=200",
      category: "Toys",
      rating: 4.6,
      products: 87,
      established: 2013
    },
    {
      id: 8,
      name: "PetCare",
      description: "Premium care products for your furry friends",
      logo: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=200&h=200",
      category: "Pet Supplies",
      rating: 4.7,
      products: 65,
      established: 2016
    }
  ];

  useEffect(() => {
    // Simulate API call
    const fetchBrands = setTimeout(() => {
      setBrands(brandData);
      setFilteredBrands(brandData);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(fetchBrands);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredBrands(brands);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = brands.filter(
        brand => 
          brand.name.toLowerCase().includes(query) || 
          brand.description.toLowerCase().includes(query) ||
          brand.category.toLowerCase().includes(query)
      );
      setFilteredBrands(filtered);
    }
  }, [searchQuery, brands]);

  const featuredBrands = brands.filter(brand => brand.isFeatured);

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
          <Star sx={{ fontSize: 40, color: "#ec4899" }} />
          <Typography
            variant="h3"
            fontWeight="bold"
            sx={{
              color: "#ec4899",
              letterSpacing: 0.5,
            }}
          >
            Our Brands
          </Typography>
        </Box>
        
        <Typography
          variant="subtitle1"
          sx={{ color: "#6366f1", mb: 4 }}
        >
          Discover the trusted brands that make our products exceptional
        </Typography>

        <Alert severity="info" sx={{ mb: 4 }}>
          <Typography variant="body1">
            <strong>Quality Assured:</strong> All our brands go through a rigorous selection process to ensure they meet our high standards for quality, sustainability, and customer satisfaction.
          </Typography>
        </Alert>

        <TextField
          fullWidth
          placeholder="Search brands by name, category, or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 4 }}
        />

        {loading ? (
          <Grid container spacing={4}>
            {[...Array(8)].map((_, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card sx={{ height: '100%' }}>
                  <Skeleton variant="rectangular" height={150} />
                  <CardContent>
                    <Skeleton variant="text" sx={{ fontSize: '1.25rem', mb: 1 }} />
                    <Skeleton variant="text" sx={{ fontSize: '0.875rem', mb: 2 }} />
                    <Skeleton variant="text" sx={{ fontSize: '0.875rem', width: '60%' }} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <>
            {featuredBrands.length > 0 && (
              <>
                <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
                  Featured Brands
                </Typography>
                <Grid container spacing={4} sx={{ mb: 6 }}>
                  {featuredBrands.map((brand) => (
                    <Grid item xs={12} sm={6} md={4} key={brand.id}>
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
                          height="150"
                          image={brand.logo}
                          alt={brand.name}
                          sx={{ objectFit: 'contain', p: 2 }}
                        />
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography gutterBottom variant="h6" component="div" fontWeight="bold">
                              {brand.name}
                            </Typography>
                            <Verified color="primary" fontSize="small" />
                          </Box>
                          
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {brand.description}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Star color="warning" fontSize="small" />
                            <Typography variant="body2">
                              {brand.rating} ({brand.products} products)
                            </Typography>
                          </Box>
                          
                          <Chip label={brand.category} size="small" sx={{ mb: 2 }} />
                          
                          <Typography variant="caption" color="text.secondary">
                            Established {brand.established}
                          </Typography>
                        </CardContent>
                        <Button 
                          size="small" 
                          variant="contained" 
                          sx={{ 
                            m: 2, 
                            fontWeight: 'bold',
                            borderRadius: 2
                          }}
                        >
                          Shop {brand.name}
                        </Button>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </>
            )}

            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
              All Brands
            </Typography>
            <Grid container spacing={4}>
              {filteredBrands.map((brand) => (
                <Grid item xs={12} sm={6} md={3} key={brand.id}>
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
                      height="120"
                      image={brand.logo}
                      alt={brand.name}
                      sx={{ objectFit: 'contain', p: 2 }}
                    />
                    <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                      <Typography gutterBottom variant="h6" component="div" fontWeight="bold">
                        {brand.name}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 60 }}>
                        {brand.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                        <Star color="warning" fontSize="small" />
                        <Typography variant="body2">
                          {brand.rating}
                        </Typography>
                      </Box>
                      
                      <Chip label={brand.category} size="small" variant="outlined" />
                    </CardContent>
                    <Button 
                      size="small" 
                      variant="outlined" 
                      sx={{ 
                        m: 2, 
                        fontWeight: 'bold',
                        borderRadius: 2
                      }}
                    >
                      View Products
                    </Button>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}

        <Divider sx={{ my: 6 }} />

        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
            Want to see your brand here?
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
            Partner with Nexus Mart to reach millions of customers worldwide
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
            Become a Partner
          </Button>
        </Box>

        <Box sx={{ mt: 4, p: 3, bgcolor: '#f0f8ff', borderRadius: 2 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            About Our Brand Partnerships
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            At Nexus Mart, we believe in partnering with brands that share our values of quality, innovation, and customer satisfaction. 
            Each brand in our collection is carefully selected and regularly reviewed to ensure they meet our high standards.
          </Typography>
          <Typography variant="body1">
            For questions about our brands or to inquire about partnerships, please contact our brand relations team at 
            <Link href="mailto:brands@nexusmart.com"> brands@nexusmart.com</Link>.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Brands;