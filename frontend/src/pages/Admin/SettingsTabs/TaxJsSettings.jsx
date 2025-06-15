import { useState } from "react";
import { Box, TextField, Button, Typography, Paper } from "@mui/material";

const TaxJsSettings = () => {
  const [apiKey, setApiKey] = useState("");
  const [defaultRate, setDefaultRate] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ apiKey, defaultRate });
    alert("TaxJS settings saved!");
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 4,
        borderRadius: 3,
        boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
        bgcolor: "background.paper",
      }}
    >
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, color: "primary.main" }}>
        Tax JS Settings
      </Typography>
      <form onSubmit={handleSubmit}>
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="API Key"
            variant="outlined"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
        </Box>
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            type="number"
            label="Default Tax Rate (%)"
            variant="outlined"
            value={defaultRate}
            onChange={(e) => setDefaultRate(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
        </Box>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: 2,
            fontWeight: "bold",
            fontSize: "1rem",
            textTransform: "none",
            bgcolor: "primary.main",
            "&:hover": { bgcolor: "primary.dark" },
          }}
        >
          Save Settings
        </Button>
      </form>
    </Paper>
  );
};

export default TaxJsSettings;