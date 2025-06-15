import { useState } from "react";
import { Box, TextField, Button, Typography, Paper } from "@mui/material";

const PayPalSettings = () => {
  const [clientId, setClientId] = useState("");
  const [secret, setSecret] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ clientId, secret });
    alert("PayPal settings saved!");
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
        PayPal Settings
      </Typography>
      <form onSubmit={handleSubmit}>
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Client ID"
            variant="outlined"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
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
            type="password"
            label="Secret"
            variant="outlined"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
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

export default PayPalSettings;