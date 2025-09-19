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
} from "@mui/material";
import { useState } from "react";
import { FlashOn, LocalOffer, Timer, Percent } from "@mui/icons-material";

const Deals = () => {
  const [activeTab, setActiveTab] = useState("all");

  // Mock deals data
  const deals = [
    {
      id: 1,
      title: "Summer Sale - Up to 70% Off",
      description: "Huge discounts on summer essentials including swimwear, sunglasses, and outdoor gear",
      discount: "UP TO 70% OFF",
      originalPrice: 199.99,
      discountedPrice: 59.99,
      expiryDate: "2024-07-31",
      category: "summer",
      image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&h=400",
      featured: true
    },
    {
      id: 2,
      title: "Electronics Bundle Deal",
      description: "Get a free pair of wireless earbuds with any smartphone purchase over $500",
      discount: "FREE GIFT",
      category: "electronics",
      image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&h=400",
      featured: true
    },
    {
      id: 3,
      title: "Back to School Special",
      description: "Save on backpacks, notebooks, and school supplies with our back-to-school collection",
      discount: "25% OFF",
      originalPrice: 89.99,
      discountedPrice: 67.49,
      expiryDate: "2024-08-31",
      category: "school",
      image: "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=600&h=400"
    },
    {
      id: 4,
      title: "Flash Sale - Limited Time",
      description: "Today only: Extra 30% off already discounted items. Limited quantities available!",
      discount: "EXTRA 30% OFF",
      originalPrice: 149.99,
      discountedPrice: 83.99,
      expiryDate: "2024-06-15",
      category: "flash",
      image: "https://images.unsplash.com/photo-1607082350899-7e105aa886ae?auto=format&fit=crop&w=600&h=400",
      flash: true
    },
    {
      id: 5,
      title: "New Arrivals - First 100 Customers",
      description: "Be among the first 100 to buy our new collection and get 40% off",
      discount: "40% OFF",
      originalPrice: 129.99,
      discountedPrice: 77.99,
      expiryDate: "2024-06-30",
      category: "new",
      image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&h=400"
    },
    {
      id: 6,
      title: "Free Shipping on Orders Over $50",
      description: "No minimum discount required. Free shipping automatically applied at checkout",
      discount: "FREE SHIPPING",
      category: "shipping",
      image: "https://images.unsplash.com/photo-1591370874773-6702e8f12fd8?auto=format&fit=crop&w=600&h=400"
    }
  ];

  const categories = [
    { id: "all", name: "All Deals" },
    { id: "featured", name: "Featured" },
    { id: "flash", name: "Flash Sales" },
    { id: "electronics", name: "Electronics" },
    { id: "summer", name: "Summer Sale" },
    { id: "school", name: "Back to School" },
    { id: "new", name: "New Arrivals" }
  ];

  const filteredDeals = activeTab === "all" 
    ? deals 
    : activeTab === "featured" 
      ? deals.filter(deal => deal.featured)
      : deals.filter(deal => deal.category === activeTab);

  const formatExpiryDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getTimeRemaining = (dateString) => {
    const expiryDate = new Date(dateString);
    const now = new Date();
    const diffTime = expiryDate - now;
    
    if (diffTime < 0) return "Expired";
    
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} left`;
    } else {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} left`;
    }
  };

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
          <LocalOffer sx={{ fontSize: 40, color: "#ec4899" }} />
          <Typography
            variant="h3"
            fontWeight="bold"
            sx={{
              color: "#ec4899",
              letterSpacing: 0.5,
            }}
          >
            Current Deals & Offers
          </Typography>
        </Box>
        
        <Typography
          variant="subtitle1"
          sx={{ color: "#6366f1", mb: 4 }}
        >
          Take advantage of our exclusive deals and save on your favorite products
        </Typography>

        <Alert severity="info" sx={{ mb: 4 }}>
          <Typography variant="body1">
            <strong>Limited Time Offers:</strong> All deals are subject to availability and may end without notice. 
            Some restrictions may apply. See individual deal details for complete terms.
          </Typography>
        </Alert>

        <Box sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={activeTab === category.id ? "contained" : "outlined"}
              onClick={() => setActiveTab(category.id)}
              sx={{
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: activeTab === category.id ? 'bold' : 'normal'
              }}
            >
              {category.name}
            </Button>
          ))}
        </Box>

        <Grid container spacing={4}>
          {filteredDeals.map((deal) => (
            <Grid item xs={12} sm={6} md={4} key={deal.id}>
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
                  height="200"
                  image={deal.image}
                  alt={deal.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography gutterBottom variant="h6" component="div" fontWeight="bold">
                      {deal.title}
                    </Typography>
                    {deal.flash && (
                      <Chip 
                        icon={<FlashOn />} 
                        label="Flash Sale" 
                        color="error" 
                        size="small" 
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {deal.description}
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Chip 
                      icon={<Percent />} 
                      label={deal.discount} 
                      color="primary" 
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>
                  
                  {deal.originalPrice && deal.discountedPrice && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="body1" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                        ${deal.originalPrice.toFixed(2)}
                      </Typography>
                      <Typography variant="h6" color="primary.main" fontWeight="bold">
                        ${deal.discountedPrice.toFixed(2)}
                      </Typography>
                      <Chip 
                        label={`${Math.round((1 - deal.discountedPrice / deal.originalPrice) * 100)}% OFF`} 
                        size="small" 
                        color="success" 
                      />
                    </Box>
                  )}
                  
                  {deal.expiryDate && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                      <Timer color="action" />
                      <Typography variant="body2" color="text.secondary">
                        Expires: {formatExpiryDate(deal.expiryDate)} 
                        <span style={{ color: '#f57c00', fontWeight: 'bold' }}> ({getTimeRemaining(deal.expiryDate)})</span>
                      </Typography>
                    </Box>
                  )}
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
                    Shop Now
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 6 }} />

        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
            Want to be the first to know about new deals?
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
            Subscribe to our newsletter and never miss out on exclusive offers and promotions
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
            Terms & Conditions
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            All offers are valid while supplies last. Nexus Mart reserves the right to modify or cancel any promotion at any time. 
            Some restrictions may apply. See individual offer details for complete terms and conditions.
          </Typography>
          <Typography variant="body2">
            For questions about any of our current deals, please contact our customer support team at 
            <Link href="mailto:support@nexusmart.com"> support@nexusmart.com</Link>.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Deals;