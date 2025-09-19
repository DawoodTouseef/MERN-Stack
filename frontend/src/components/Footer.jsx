import { useState, useRef, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Link,
  Stack,
  Divider,
  TextField,
  Button,
  MenuItem,
  Select,
  IconButton,
  Fade,
  Paper,
  Grid,
  useTheme,
  alpha,
  Chip,
  Avatar,
} from "@mui/material";
import { FaFacebook, FaTwitter, FaInstagram, FaGithub, FaComments, FaArrowUp, FaTelegram, FaYoutube, FaLinkedin } from "react-icons/fa";
import { useGetCurrenciesQuery } from "../redux/api/currencyApiSlice";
import { useDispatch, useSelector } from "react-redux";
import { setCurrency } from "../redux/features/currency/currencySlice";
import { motion } from "framer-motion";

const Footer = () => {
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [language, setLanguage] = useState("en");
  
  // Fetch currencies from our system
  const { data: currencies = [], isLoading } = useGetCurrenciesQuery();
  
  const chatbot = (e)=>{
      e.preventDefault();
      console.log(e.target.value);
  
  }
  
  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) {
      setMessage("Please enter a valid email address.");
      return;
    }
    setMessage("Thank you for subscribing!");
    setEmail("");
    setTimeout(() => setMessage(""), 3000);
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  
  const dispatch = useDispatch();
  const selectedCurrency = useSelector((state) => state.currency.selectedCurrency); 
  
  const handleCurrencyChange = (e) => {
    const newCurrency = e.target.value;
    dispatch(setCurrency(newCurrency)); 
  };
  
  // Set default currency if none is selected and currencies are loaded
  useEffect(() => {
    if (currencies.length > 0 && !selectedCurrency) {
      // Filter only enabled currencies
      const enabledCurrencies = currencies.filter(c => c.isEnabled);
      const defaultCurrency = enabledCurrencies.find(c => c.isDefault) || enabledCurrencies[0];
      if (defaultCurrency) {
        dispatch(setCurrency(defaultCurrency.code));
      }
    }
  }, [currencies, selectedCurrency, dispatch]);
  
  // Animation variants for footer sections
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };
  
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "#18181b",
        color: "#fff",
        pt: 8,
        pb: 4,
        // Use normal document flow instead of fixed positioning
        width: "100%",
        overflow: "hidden",
        // Ensure footer stays at the bottom
        marginTop: "auto",
        position: "relative",
      }}
    >
      {/* Decorative Elements */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 10% 20%, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 20%), 
                       radial-gradient(circle at 90% 80%, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 20%)`,
          zIndex: 0
        }}
      />
      
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 }, position: "relative", zIndex: 1 }}>
        {/* Main Footer Content */}
        <Grid container spacing={{ xs: 4, md: 6 }} sx={{ mb: 6 }}>
          {/* Brand & About */}
          <Grid item xs={12} md={4}>
            <motion.div variants={sectionVariants} initial="hidden" animate="visible">
              <Box sx={{ mb: 3 }}>
                <Typography variant="h4" fontWeight={800} color="primary.main" sx={{ mb: 1 }}>
                  Nexus Mart
                </Typography>
                <Typography variant="body2" sx={{ color: "#d1d5db", mb: 2, maxWidth: 300 }}>
                  Your one-stop shop for everything! Discover amazing products at unbeatable prices with fast delivery and excellent customer service.
                </Typography>
              </Box>
              
              {/* Social Media */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight={600} mb={1.5}>
                  Follow Us
                </Typography>
                <Stack direction="row" spacing={2}>
                  <IconButton 
                    href="https://facebook.com" 
                    target="_blank" 
                    sx={{ 
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: "#fff",
                      "&:hover": { bgcolor: theme.palette.primary.main }
                    }}
                  >
                    <FaFacebook />
                  </IconButton>
                  <IconButton 
                    href="https://twitter.com" 
                    target="_blank" 
                    sx={{ 
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: "#fff",
                      "&:hover": { bgcolor: theme.palette.primary.main }
                    }}
                  >
                    <FaTwitter />
                  </IconButton>
                  <IconButton 
                    href="https://instagram.com" 
                    target="_blank" 
                    sx={{ 
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: "#fff",
                      "&:hover": { bgcolor: theme.palette.primary.main }
                    }}
                  >
                    <FaInstagram />
                  </IconButton>
                  <IconButton 
                    href="https://youtube.com" 
                    target="_blank" 
                    sx={{ 
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: "#fff",
                      "&:hover": { bgcolor: theme.palette.primary.main }
                    }}
                  >
                    <FaYoutube />
                  </IconButton>
                  <IconButton 
                    href="https://linkedin.com" 
                    target="_blank" 
                    sx={{ 
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: "#fff",
                      "&:hover": { bgcolor: theme.palette.primary.main }
                    }}
                  >
                    <FaLinkedin />
                  </IconButton>
                </Stack>
              </Box>
              
              {/* Trust Badges */}
              <Box>
                <Typography variant="subtitle1" fontWeight={600} mb={1.5}>
                  Secure Shopping
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip 
                    label="SSL Secure" 
                    size="small" 
                    icon={<Box component="span" sx={{ width: 12, height: 12, bgcolor: 'success.main', borderRadius: '50%' }} />} 
                    sx={{ 
                      bgcolor: alpha(theme.palette.success.main, 0.1), 
                      color: 'success.main',
                      fontWeight: 600,
                      mb: 0.5
                    }} 
                  />
                  <Chip 
                    label="30-Day Returns" 
                    size="small" 
                    sx={{ 
                      bgcolor: alpha(theme.palette.info.main, 0.1), 
                      color: 'info.main',
                      fontWeight: 600,
                      mb: 0.5
                    }} 
                  />
                  <Chip 
                    label="24/7 Support" 
                    size="small" 
                    sx={{ 
                      bgcolor: alpha(theme.palette.secondary.main, 0.1), 
                      color: 'secondary.main',
                      fontWeight: 600,
                      mb: 0.5
                    }} 
                  />
                </Stack>
              </Box>
            </motion.div>
          </Grid>
          
          {/* Customer Links */}
          <Grid item xs={6} md={2}>
            <motion.div variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
              <Typography variant="h6" fontWeight={700} mb={2.5} color="primary.main">
                Customer Service
              </Typography>
              <Stack spacing={1.5}>
                <Link href="/contact" underline="hover" color="#d1d5db" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Contact Us
                </Link>
                <Link href="/faq" underline="hover" color="#d1d5db" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  FAQ
                </Link>
                <Link href="/returns" underline="hover" color="#d1d5db" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Returns & Exchanges
                </Link>
                <Link href="/shipping" underline="hover" color="#d1d5db" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Shipping Info
                </Link>
                <Link href="/track-order" underline="hover" color="#d1d5db" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Track Order
                </Link>
                <Link href="/size-guide" underline="hover" color="#d1d5db" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Size Guide
                </Link>
              </Stack>
            </motion.div>
          </Grid>
          
          {/* Quick Links */}
          <Grid item xs={6} md={2}>
            <motion.div variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
              <Typography variant="h6" fontWeight={700} mb={2.5} color="primary.main">
                Quick Links
              </Typography>
              <Stack spacing={1.5}>
                <Link href="/" underline="hover" color="#d1d5db" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Home
                </Link>
                <Link href="/shop" underline="hover" color="#d1d5db" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Shop
                </Link>
                <Link href="/deals" underline="hover" color="#d1d5db" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Deals & Offers
                </Link>
                <Link href="/new-arrivals" underline="hover" color="#d1d5db" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  New Arrivals
                </Link>
                <Link href="/brands" underline="hover" color="#d1d5db" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Brands
                </Link>
                <Link href="/blog" underline="hover" color="#d1d5db" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Blog
                </Link>
              </Stack>
            </motion.div>
          </Grid>
          
          {/* Newsletter & Preferences */}
          <Grid item xs={12} md={4}>
            <motion.div variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
              {/* Newsletter */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" fontWeight={700} mb={1.5} color="primary.main">
                  Newsletter
                </Typography>
                <Typography variant="body2" sx={{ color: "#d1d5db", mb: 2 }}>
                  Subscribe to get special offers, free giveaways, and new product alerts.
                </Typography>
                <form onSubmit={handleSubscribe}>
                  <Stack spacing={1.5}>
                    <TextField
                      fullWidth
                      type="email"
                      required
                      placeholder="Your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      sx={{
                        bgcolor: "#23232a",
                        borderRadius: 2,
                        input: { color: "#fff" },
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": { borderColor: "#444" },
                          "&:hover fieldset": { borderColor: "#ec4899" },
                        },
                      }}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      sx={{
                        fontWeight: 700,
                        borderRadius: 2,
                        py: 1.5,
                        bgcolor: "primary.main",
                        "&:hover": { bgcolor: "primary.dark" },
                      }}
                    >
                      Subscribe
                    </Button>
                  </Stack>
                  {message && (
                    <Typography variant="caption" sx={{ mt: 1, color: message.includes("Thank") ? "success.main" : "error.main" }}>
                      {message}
                    </Typography>
                  )}
                </form>
              </Box>
              
              {/* Download App */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" fontWeight={600} mb={1.5}>
                  Download Our App
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <Button
                    variant="outlined"
                    startIcon={<Avatar src="/images/app-store.png" sx={{ width: 24, height: 24 }} />}
                    sx={{
                      color: "#fff",
                      borderColor: "#444",
                      borderRadius: 2,
                      py: 1,
                      px: 2,
                      textTransform: "none",
                      justifyContent: "flex-start",
                      "&:hover": { borderColor: "#ec4899" }
                    }}
                  >
                    App Store
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Avatar src="/images/play-store.png" sx={{ width: 24, height: 24 }} />}
                    sx={{
                      color: "#fff",
                      borderColor: "#444",
                      borderRadius: 2,
                      py: 1,
                      px: 2,
                      textTransform: "none",
                      justifyContent: "flex-start",
                      "&:hover": { borderColor: "#ec4899" }
                    }}
                  >
                    Google Play
                  </Button>
                </Stack>
              </Box>
              
              {/* Language and Currency Switcher */}
              <Box>
                <Typography variant="subtitle1" fontWeight={600} mb={1.5}>
                  Preferences
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <Select
                    value={language}
                    size="small"
                    onChange={(e) => setLanguage(e.target.value)}
                    sx={{ 
                      bgcolor: "#23232a", 
                      color: "#fff",
                      flex: 1,
                      borderRadius: 2
                    }}
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="hi">Hindi</MenuItem>
                    <MenuItem value="es">Spanish</MenuItem>
                    <MenuItem value="fr">French</MenuItem>
                    <MenuItem value="de">German</MenuItem>
                  </Select>
                  <Select
                    value={selectedCurrency || (currencies.length > 0 ? currencies[0]?.code : "")}
                    size="small"
                    onChange={handleCurrencyChange}
                    sx={{ 
                      bgcolor: "#23232a", 
                      color: "#fff",
                      flex: 1,
                      borderRadius: 2
                    }}
                    displayEmpty
                  >
                    {isLoading ? (
                      <MenuItem value="" disabled>Loading currencies...</MenuItem>
                    ) : currencies.length > 0 ? (
                      currencies.filter(c => c.isEnabled).map((currency) => (
                        <MenuItem key={currency.code} value={currency.code}>
                          {currency.name} ({currency.code})
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem value="" disabled>No currencies available</MenuItem>
                    )}
                  </Select>
                </Stack>
              </Box>
            </motion.div>
          </Grid>
        </Grid>
        
        <Divider sx={{ bgcolor: "#27272a", mb: 3 }} />
        
        {/* Bottom Footer */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={8}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} flexWrap="wrap">
              <Link href="/about" underline="hover" color="#a1a1aa" sx={{ fontSize: "0.875rem" }}>
                About Us
              </Link>
              <Link href="/privacy-policy" underline="hover" color="#a1a1aa" sx={{ fontSize: "0.875rem" }}>
                Privacy Policy
              </Link>
              <Link href="/terms" underline="hover" color="#a1a1aa" sx={{ fontSize: "0.875rem" }}>
                Terms & Conditions
              </Link>
              <Link href="/sitemap" underline="hover" color="#a1a1aa" sx={{ fontSize: "0.875rem" }}>
                Sitemap
              </Link>
              <Link href="/accessibility" underline="hover" color="#a1a1aa" sx={{ fontSize: "0.875rem" }}>
                Accessibility
              </Link>
            </Stack>
          </Grid>
          <Grid item xs={12} md={4}>
            <Stack direction="row" spacing={1} justifyContent={{ xs: "flex-start", md: "flex-end" }}>
              <Chip 
                label="We Accept" 
                size="small" 
                variant="outlined" 
                sx={{ 
                  borderColor: alpha("#fff", 0.2),
                  color: "#a1a1aa",
                  fontWeight: 500
                }} 
              />
              <Avatar src="/images/payment-methods.png" variant="square" sx={{ width: 120, height: 24 }} />
            </Stack>
          </Grid>
        </Grid>
        
        <Typography variant="body2" sx={{ color: "#a1a1aa", textAlign: "center", mb: 2 }}>
          &copy; 2024-{new Date().getFullYear()} Nexus Mart. All rights reserved.
        </Typography>
        
        <Stack direction="row" justifyContent="center" alignItems="center" spacing={2}>
          <Button
            size="small"
            variant="outlined"
            onClick={handleScrollToTop}
            sx={{ 
              color: "#fff", 
              borderColor: "#444", 
              borderRadius: 2,
              "&:hover": { borderColor: "#ec4899" } 
            }}
            startIcon={<FaArrowUp />}
          >
            Back to Top
          </Button>
        </Stack>
      </Container>
      
      {/* Live Chat Button */}
      <IconButton
        onClick={() => setChatOpen(!chatOpen)}
        sx={{
          position: "fixed",
          bottom: 30,
          right: 30,
          bgcolor: "primary.main",
          color: "#fff",
          "&:hover": { bgcolor: "primary.dark" },
          zIndex: 2000,
          width: 56,
          height: 56,
          boxShadow: 3,
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "scale(1.1)",
            boxShadow: 6
          }
        }}
      >
        <FaComments />
      </IconButton>
      
      {/* Live Chat Panel */}
      <Fade in={chatOpen}>
        <Paper
          elevation={8}
          sx={{
            position: "fixed",
            bottom: 90,
            right: 30,
            width: 320,
            maxHeight: 400,
            bgcolor: "#1f1f1f",
            p: 2,
            borderRadius: 2,
            color: "#fff",
            zIndex: 2000,
            overflowY: "auto",
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">
              Live Chat
            </Typography>
            <IconButton 
              size="small" 
              onClick={() => setChatOpen(false)}
              sx={{ color: "#fff" }}
            >
              <FaArrowUp />
            </IconButton>
          </Stack>
          <Typography variant="body2" sx={{ mb: 2 }}>
            👋 Hi! How can we help you today?
          </Typography>
          {/* Simulate chat UI */}
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              placeholder="Type your message..."
              size="small"
              sx={{
                bgcolor: "#2d2d2d",
                borderRadius: 1,
                input: { color: "#fff" },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#444" },
                },
              }}
              onClick={chatbot}
            />
          </Box>
        </Paper>
      </Fade>
    </Box>
  );
};

export default Footer;