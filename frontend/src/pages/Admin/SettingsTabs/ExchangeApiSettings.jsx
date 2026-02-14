import { useEffect, useState } from "react";
import { Box, TextField, Button, Typography, Paper } from "@mui/material";
import { toast } from "react-toastify";
import { useGetSettingsQuery, useUpdateSettingsMutation } from "../../../redux/api/settingsApiSlice";

const ExchangeApiSettings = () => {
  const { data, isLoading } = useGetSettingsQuery();
  const [updateSettings, { isLoading: isSaving }] = useUpdateSettingsMutation();
  const [apiUrl, setApiUrl] = useState("");
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    if (data?.settings?.exchange) {
      setApiUrl(data.settings.exchange.apiUrl || "");
      setApiKey(data.settings.exchange.apiKey || "");
    }
  }, [data]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateSettings({ exchange: { apiUrl, apiKey } }).unwrap();
      toast.success("Exchange settings saved");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to save settings");
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: 3, boxShadow: "0 4px 24px rgba(0,0,0,0.1)", bgcolor: "background.paper" }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, color: "primary.main" }}>Exchange API Settings</Typography>
      <form onSubmit={handleSubmit}>
        <Box sx={{ mb: 3 }}><TextField fullWidth label="API URL" variant="outlined" value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} disabled={isLoading} /></Box>
        <Box sx={{ mb: 3 }}><TextField fullWidth label="API Key" variant="outlined" value={apiKey} onChange={(e) => setApiKey(e.target.value)} disabled={isLoading} /></Box>
        <Button type="submit" variant="contained" color="primary" disabled={isSaving || isLoading}>Save Settings</Button>
      </form>
    </Paper>
  );
};

export default ExchangeApiSettings;
