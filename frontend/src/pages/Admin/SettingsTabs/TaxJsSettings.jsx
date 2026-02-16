import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Stack,
  Alert,
  InputAdornment,
  Divider,
  CircularProgress
} from "@mui/material";
import { AccountBalance as TaxIcon, Percent as PercentIcon } from "@mui/icons-material";
import { toast } from "react-toastify";

const TaxJsSettings = () => {
  const [apiKey, setApiKey] = useState("");
  const [defaultRate, setDefaultRate] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      console.log({ apiKey, defaultRate });
      toast.success("Tax configuration saved successfully");
      setIsLoading(false);
    }, 1000);
  };

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 4, borderRadius: 3 }}>
        Manage your sales tax calculations globally. Integrated with TaxJS for automated real-time compliance and regional tax calculations.
      </Alert>

      <form onSubmit={handleSubmit}>
        <Stack spacing={4}>
          <Box>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ color: 'text.primary' }}>
              TaxJS API Key
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Required for real-time tax lookups. Get your key from the TaxJS developer portal.
            </Typography>
            <TextField
              fullWidth
              placeholder="tj_live_..."
              variant="outlined"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              InputProps={{
                sx: { borderRadius: 2.5, bgcolor: '#f8fafc' }
              }}
            />
          </Box>

          <Box>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ color: 'text.primary' }}>
              Fallback Tax Rate
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              The default percentage applied if the automated service is unavailable.
            </Typography>
            <TextField
              fullWidth
              type="number"
              placeholder="e.g. 5.00"
              variant="outlined"
              value={defaultRate}
              onChange={(e) => setDefaultRate(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <PercentIcon size="small" sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
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
              {isLoading ? <CircularProgress size={24} color="inherit" /> : "Save Configuration"}
            </Button>
          </Box>
        </Stack>
      </form>
    </Box>
  );
};

export default TaxJsSettings;