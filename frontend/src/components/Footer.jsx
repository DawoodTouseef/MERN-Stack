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
import { APP_NAME, TAGLINE, SOCIAL_LINKS, FOOTER_LINKS, APP_DOWNLOAD_LINKS } from "../redux/constants";

const Footer = () => {
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [language, setLanguage] = useState("en");

  // Fetch currencies from our system
  const { data: currencies = [], isLoading } = useGetCurrenciesQuery();

  const chatbot = (e) => {
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
        bgcolor: "#0f172a", // Deep Slate
        color: "#fff",
        pt: 10,
        pb: 6,
        width: "100%",
        overflow: "hidden",
        marginTop: "auto",
        position: "relative",
        borderTop: `1px solid ${alpha('#6366f1', 0.1)}`,
      }}
    >
      {/* Decorative Gradient Background */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 10% 20%, ${alpha('#6366f1', 0.08)} 0%, transparent 25%), 
                       radial-gradient(circle at 90% 80%, ${alpha('#6366f1', 0.08)} 0%, transparent 25%)`,
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
                  {APP_NAME}
                </Typography>
                <Typography variant="body2" sx={{ color: "#d1d5db", mb: 2, maxWidth: 300 }}>
                  {TAGLINE}
                </Typography>
              </Box>

              {/* Social Media */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight={600} mb={1.5}>
                  Follow Us
                </Typography>
                <Stack direction="row" spacing={2}>
                  {Object.entries(SOCIAL_LINKS).map(([platform, url]) => {
                    let Icon;
                    switch (platform) {
                      case 'facebook': Icon = FaFacebook; break;
                      case 'twitter': Icon = FaTwitter; break;
                      case 'instagram': Icon = FaInstagram; break;
                      case 'youtube': Icon = FaYoutube; break;
                      case 'linkedin': Icon = FaLinkedin; break;
                      case 'telegram': Icon = FaTelegram; break;
                      default: return null;
                    }
                    if (!Icon) return null;

                    return (
                      <IconButton
                        key={platform}
                        href={url}
                        target="_blank"
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: "#fff",
                          "&:hover": { bgcolor: theme.palette.primary.main }
                        }}
                      >
                        <Icon />
                      </IconButton>
                    );
                  })}
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
                {FOOTER_LINKS.customerService.map((link) => (
                  <Link key={link.name} href={link.path} underline="hover" color="#d1d5db" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {link.name}
                  </Link>
                ))}
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
                {FOOTER_LINKS.quickLinks.map((link) => (
                  <Link key={link.name} href={link.path} underline="hover" color="#d1d5db" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {link.name}
                  </Link>
                ))}
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
                    startIcon={<svg height="44" viewBox="0 0 14 44" width="14" xmlns="http://www.w3.org/2000/svg"><path d="m13.0729 17.6825a3.61 3.61 0 0 0 -1.7248 3.0365 3.5132 3.5132 0 0 0 2.1379 3.2223 8.394 8.394 0 0 1 -1.0948 2.2618c-.6816.9812-1.3943 1.9623-2.4787 1.9623s-1.3633-.63-2.613-.63c-1.2187 0-1.6525.6507-2.644.6507s-1.6834-.9089-2.4787-2.0243a9.7842 9.7842 0 0 1 -1.6628-5.2776c0-3.0984 2.014-4.7405 3.9969-4.7405 1.0535 0 1.9314.6919 2.5924.6919.63 0 1.6112-.7333 2.8092-.7333a3.7579 3.7579 0 0 1 3.1604 1.5802zm-3.7284-2.8918a3.5615 3.5615 0 0 0 .8469-2.22 1.5353 1.5353 0 0 0 -.031-.32 3.5686 3.5686 0 0 0 -2.3445 1.2084 3.4629 3.4629 0 0 0 -.8779 2.1585 1.419 1.419 0 0 0 .031.2892 1.19 1.19 0 0 0 .2169.0207 3.0935 3.0935 0 0 0 2.1586-1.1368z"></path></svg>}
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
                    href={APP_DOWNLOAD_LINKS.apple}
                    target="_blank"
                  >
                    App Store
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<svg class="kOqhQd" aria-hidden="true" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0,0h40v40H0V0z"></path><g><path d="M19.7,19.2L4.3,35.3c0,0,0,0,0,0c0.5,1.7,2.1,3,4,3c0.8,0,1.5-0.2,2.1-0.6l0,0l17.4-9.9L19.7,19.2z" fill="#EA4335"></path><path d="M35.3,16.4L35.3,16.4l-7.5-4.3l-8.4,7.4l8.5,8.3l7.5-4.2c1.3-0.7,2.2-2.1,2.2-3.6C37.5,18.5,36.6,17.1,35.3,16.4z" fill="#FBBC04"></path><path d="M4.3,4.7C4.2,5,4.2,5.4,4.2,5.8v28.5c0,0.4,0,0.7,0.1,1.1l16-15.7L4.3,4.7z" fill="#4285F4"></path><path d="M19.8,20l8-7.9L10.5,2.3C9.9,1.9,9.1,1.7,8.3,1.7c-1.9,0-3.6,1.3-4,3c0,0,0,0,0,0L19.8,20z" fill="#34A853"></path></g></svg>}
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
                    href={APP_DOWNLOAD_LINKS.google}
                    target="_blank"
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
              {FOOTER_LINKS.bottomLinks.map((link) => (
                <Link key={link.name} href={link.path} underline="hover" color="#a1a1aa" sx={{ fontSize: "0.875rem" }}>
                  {link.name}
                </Link>
              ))}
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
          &copy; 2024-{new Date().getFullYear()} {APP_NAME}. All rights reserved.
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
          "&:hover": {
            transform: "scale(1.1)",
            bgcolor: "primary.dark",
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