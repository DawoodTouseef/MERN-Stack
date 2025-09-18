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
} from "@mui/material";
import { FaFacebook, FaTwitter, FaInstagram, FaGithub, FaComments, FaArrowUp } from "react-icons/fa";
import { useGetExchangeCodeMutation,useGetExchangeApiKeyQuery ,useGetExchangeRatesMutation} from "../redux/api/currencyApiSlice";
import { useDispatch, useSelector } from "react-redux";
import { setCurrency,setPrice } from "../redux/features/currency/currencySlice";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [language, setLanguage] = useState("en");
  const [currencyData,setCurrencyData] = useState([]);
  const chatRef = useRef();

  // Fetch API key
  const { data: apiKey, isLoading: apiKeyLoading, error: apiKeyError } = useGetExchangeApiKeyQuery();
  const [fetchExchangeRates] =useGetExchangeRatesMutation();

  // Fetch currency codes using the API key
  const [fetchCurrencyCodes] = useGetExchangeCodeMutation();
  
  useEffect(() => {
  const fetchCurrencyData = async () => {
    if (apiKey?.apikey) { // Use apiKey.apikey to access the API key
      try {
        const result = await fetchCurrencyCodes({ apiKey: apiKey.apikey }).unwrap();
        setCurrencyData(result?.supported_codes || []); // Assuming the API returns `supported_codes`
      } catch (error) {
        console.error("Error fetching currency codes:", error);
      }
    }
  };

  fetchCurrencyData();
}, [apiKey, fetchCurrencyCodes]);

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
  const prcie = useSelector((state)=>(state.currency.price));
  
  const handleCurrencyChange = async(e) => {
    e.preventDefault()
    const newCurrency = e.target.value;
    setCurrency(newCurrency);
    dispatch(setCurrency(newCurrency)); 
    try {
    // Fetch the exchange rate from USD to the selected currency
    const result = await fetchExchangeRates({
      apiKey: apiKey?.apikey,
      from: "USD",
      to: newCurrency,
      amount: 1, // Convert 1 USD to the selected currency
    }).unwrap();
    const exchangeRate = result?.conversion_rates?.[newCurrency] || 1; // Get the conversion rate
    console.log(`Exchange rate for ${newCurrency}:`, exchangeRate);
    dispatch(setPrice(exchangeRate)); // Dispatch the updated price to Redux
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
  }
  };
  
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "#18181b",
        color: "#fff",
        pt: 6,
        pb: 2,
        // Use normal document flow instead of fixed positioning
        width: "100%",
        overflow: "hidden",
        // Ensure footer stays at the bottom
        marginTop: "auto",
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={4}
          justifyContent="space-between"
          alignItems={{ xs: "center", md: "flex-start" }}
          sx={{ pb: 4, textAlign: { xs: "center", md: "left" } }}
        >
          {/* Brand */}
          <Box>
            <Typography variant="h5" fontWeight={700} color="primary.main">
              Nexus Mart
            </Typography>
            <Typography variant="body2" sx={{ color: "#d1d5db", mb: 1 }}>
              Your one-stop shop for everything!
            </Typography>
            <Stack direction="row" spacing={2}>
              <Link href="https://facebook.com" target="_blank" color="inherit">
                <FaFacebook />
              </Link>
              <Link href="https://twitter.com" target="_blank" color="inherit">
                <FaTwitter />
              </Link>
              <Link href="https://instagram.com" target="_blank" color="inherit">
                <FaInstagram />
              </Link>
              <Link href="https://github.com" target="_blank" color="inherit">
                <FaGithub />
              </Link>
            </Stack>
          </Box>

          {/* Customer Links */}
          <Box>
            <Typography variant="subtitle1" fontWeight={600} mb={1}>
              Customer Service
            </Typography>
            <Stack spacing={1}>
              <Link href="/contact" underline="hover" color="#d1d5db">
                Contact Us
              </Link>
              <Link href="/vendor/login" underline="hover" color="#d1d5db">
                Sell With Us
              </Link>
              <Link href="/privacy-policy" underline="hover" color="#d1d5db">
                Privacy Policy
              </Link>
            </Stack>
          </Box>

          {/* Quick Links */}
          <Box>
            <Typography variant="subtitle1" fontWeight={600} mb={1}>
              Quick Links
            </Typography>
            <Stack spacing={1}>
              <Link href="/" underline="hover" color="#d1d5db">
                Home
              </Link>
              <Link href="/shop" underline="hover" color="#d1d5db">
                Home
              </Link>
              <Link href="/shop" underline="hover" color="#d1d5db">
                Shop
              </Link>
              <Link href="/cart" underline="hover" color="#d1d5db">
                Cart
              </Link>
              <Link href="/contact" underline="hover" color="#d1d5db">
                Contact
              </Link>
            </Stack>
          </Box>

          {/* Newsletter */}
          <Box sx={{ minWidth: { xs: "100%", md: 250 }, maxWidth: { xs: "100%", md: 300 } }}>
            <Typography variant="subtitle1" fontWeight={600} mb={1}>
              Newsletter
            </Typography>
            <Typography variant="body2" sx={{ color: "#d1d5db", mb: 1 }}>
              Sign up for exclusive offers and updates.
            </Typography>
            <form onSubmit={handleSubscribe}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <TextField
                  size="small"
                  type="email"
                  required
                  placeholder="Your email"
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
                  color="secondary"
                  sx={{
                    fontWeight: 700,
                    borderRadius: 2,
                    px: 2.5,
                    bgcolor: "#ec4899",
                    "&:hover": { bgcolor: "#be185d" },
                  }}
                >
                  Sign Up
                </Button>
              </Stack>
              {message && (
                <Typography variant="caption" sx={{ mt: 1, color: "#22d3ee" }}>
                  {message}
                </Typography>
              )}
            </form>
          </Box>

          {/* Language and Currency Switcher */}
          <Box sx={{ minWidth: { xs: "100%", md: "auto" } }}>
            <Typography variant="subtitle1" fontWeight={600} mb={1}>
              Preferences
            </Typography>
            <Stack spacing={1}>
              <Select
                value={language}
                size="small"
                onChange={(e) => setLanguage(e.target.value)}
                sx={{ bgcolor: "#23232a", color: "#fff" }}
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="hi">Hindi</MenuItem>
                <MenuItem value="es">Spanish</MenuItem>
              </Select>
              <Select
                value={currencyData.length > 0 ? selectedCurrency : ""}
                size="small"
                onChange={handleCurrencyChange}
                sx={{ bgcolor: "#23232a", color: "#fff" }}
                displayEmpty
              >
                {currencyData.length > 0 ? (
                  currencyData.map(([code, name]) => (
                    <MenuItem key={code} value={code}>
                      {name} ({code})
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value="" disabled>Loading currencies...</MenuItem>
                )}
              </Select>
            </Stack>
          </Box>
        </Stack>

        <Divider sx={{ bgcolor: "#27272a", mb: 2 }} />
        <Typography variant="body2" sx={{ color: "#a1a1aa" ,textAlign:"center"}}>
            &copy; 2024- {new Date().getFullYear()} Nexus Mart. All rights reserved.
          </Typography>

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Button
            size="small"
            variant="outlined"
            onClick={handleScrollToTop}
            sx={{ color: "#fff", borderColor: "#444", "&:hover": { borderColor: "#ec4899" } }}
            startIcon={<FaArrowUp />}
          >
            Scroll to Top
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
          bgcolor: "#ec4899",
          color: "#fff",
          "&:hover": { bgcolor: "#be185d" },
          zIndex: 2000,
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
          <Typography variant="h6" sx={{ mb: 2 }}>
            Live Chat
          </Typography>
          <Typography variant="body2">
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