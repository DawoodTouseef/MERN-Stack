import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Stack,
  Alert,
  InputAdornment,
  Divider,
  CircularProgress
} from "@mui/material";
import { CurrencyExchange as CurrencyIcon, Language as LanguageIcon } from "@mui/icons-material";
import { toast } from "react-toastify";

const ExchangeApiSettings = () => {
  const [apiUrl, setApiUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      console.log({ apiUrl, apiKey });
      toast.success("Exchange API configuration saved successfully");
      setIsLoading(false);
    }, 1000);
  };

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 4, borderRadius: 3 }}>
        Synchronize your store rates with real-time market data. We recommend using
        <a href="https://www.exchangerate-api.com/" target="_blank" rel="noreferrer" style={{ color: 'inherit', fontWeight: 700 }}> ExchangeRate-API</a> for reliable V6 standard data.
      </Alert>

      <form onSubmit={handleSubmit}>
        <Stack spacing={4}>
          <Box>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ color: 'text.primary' }}>
              Base API URL
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              The endpoint used to fetch currency conversion rates.
            </Typography>
            <TextField
              fullWidth
              placeholder="https://v6.exchangerate-api.com/v6/..."
              variant="outlined"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LanguageIcon size="small" sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2.5, bgcolor: '#f8fafc' }
              }}
            />
          </Box>

          <Box>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ color: 'text.primary' }}>
              API Key (Token)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Your private authorization token for the exchange rate service.
            </Typography>
            <TextField
              fullWidth
              type="password"
              placeholder="sk_live_..."
              variant="outlined"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              InputProps={{
                sx: { borderRadius: 2.5, bgcolor: '#f8fafc' }
              }}
            />
          </Box>

          <Divider sx={{ borderStyle: 'dashed' }} />

          <Box sx={{ pt: 1 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              size="large"
              sx={{
                px: 5,
                py: 1.5,
                borderRadius: 2.5,
                fontWeight: 700,
                textTransform: "none",
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
                minWidth: 200
              }}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : "Save API Configuration"}
            </Button>
          </Box>
        </Stack>
      </form>
    </Box>
  );
};

export default ExchangeApiSettings;