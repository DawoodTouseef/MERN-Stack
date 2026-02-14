import { useEffect, useState } from "react";
import { Box, TextField, Button, Typography, Paper } from "@mui/material";
import { toast } from "react-toastify";
import { useGetSettingsQuery, useUpdateSettingsMutation } from "../../../redux/api/settingsApiSlice";

const PayPalSettings = () => {
  const { data, isLoading } = useGetSettingsQuery();
  const [updateSettings, { isLoading: isSaving }] = useUpdateSettingsMutation();
  const [clientId, setClientId] = useState("");
  const [secret, setSecret] = useState("");

  useEffect(() => {
    if (data?.settings?.payment) {
      setClientId(data.settings.payment.paypalClientId || "");
    }
  }, [data]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateSettings({ payment: { paypalClientId: clientId, paypalSecret: secret } }).unwrap();
      setSecret("");
      toast.success("PayPal settings saved");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to save settings");
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: 3, boxShadow: "0 4px 24px rgba(0,0,0,0.1)", bgcolor: "background.paper" }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, color: "primary.main" }}>
        PayPal Settings
      </Typography>
      <form onSubmit={handleSubmit}>
        <Box sx={{ mb: 3 }}>
          <TextField fullWidth label="Client ID" variant="outlined" value={clientId} onChange={(e) => setClientId(e.target.value)} disabled={isLoading} />
        </Box>
        <Box sx={{ mb: 3 }}>
          <TextField fullWidth type="password" label="Secret (leave blank to keep existing)" variant="outlined" value={secret} onChange={(e) => setSecret(e.target.value)} disabled={isLoading} />
        </Box>
        <Button type="submit" variant="contained" color="primary" disabled={isSaving || isLoading}>Save Settings</Button>
      </form>
    </Paper>
  );
};

export default PayPalSettings;
