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
import { useFetchOffersQuery } from "../redux/api/offerApiSlice";
import { APP_NAME } from "../redux/constants";

const Deals = () => {
  const [activeTab, setActiveTab] = useState("all");
  const { data: offers = [], isLoading, isError, error } = useFetchOffersQuery();

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
    ? offers
    : activeTab === "featured"
      ? offers.filter(offer => offer.isFeatured)
      : offers.filter(offer => {
        // Check offer type first
        if (offer.offerType && offer.offerType.toLowerCase().includes(activeTab)) {
          return true;
        }

        // Check categories
        if (offer.categories && offer.categories.length > 0) {
          return offer.categories.some(cat =>
            cat && cat.name && cat.name.toLowerCase().includes(activeTab)
          );
        }

        return false;
      });

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

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Loading deals...</Typography>
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Alert severity="error">
          Error loading deals: {error?.data?.message || "Failed to load deals"}
        </Alert>
      </Box>
    );
  }

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
          At {APP_NAME}, we're constantly updating our inventory with the latest and greatest deals.
          Check back often to find the best savings.
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
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={deal._id}>
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
                  image={deal.image || "https://images.unsplash.com/photo-1607082350899-7e105aa886ae?auto=format&fit=crop&w=600&h=400"}
                  alt={deal.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography gutterBottom variant="h6" component="div" fontWeight="bold">
                      {deal.title}
                    </Typography>
                    {deal.offerType === "flash" && (
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
                      label={`${deal.discountValue}${deal.discountUnit === "percent" ? "%" : ""} OFF`}
                      color="primary"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>

                  {deal.startTime && deal.endTime && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                      <Timer color="action" />
                      <Typography variant="body2" color="text.secondary">
                        Expires: {formatExpiryDate(deal.endTime)}
                        <span style={{ color: '#f57c00', fontWeight: 'bold' }}> ({getTimeRemaining(deal.endTime)})</span>
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
            All offers are valid while supplies last. {APP_NAME} reserves the right to modify or cancel any promotion at any time.
            Some restrictions may apply. See individual offer details for complete terms and conditions.
          </Typography>
          <Typography variant="body2">
            For questions about any of our current deals, please contact our customer support team at
            <Link href={`mailto:support@${APP_NAME.toLowerCase().replace(/\s+/g, '')}.com`}> support@{APP_NAME.toLowerCase().replace(/\s+/g, '')}.com</Link>.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Deals;