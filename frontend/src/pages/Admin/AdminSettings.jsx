import { useState } from "react";
import PayPalSettings from "../Admin/SettingsTabs/PayPalSettings";
import TaxJsSettings from "../Admin/SettingsTabs/TaxJsSettings";
import ExchangeApiSettings from "../Admin/SettingsTabs/ExchangeApiSettings";
import LogisticsSettings from "../Admin/SettingsTabs/LogisticsSettings";
import PaymentSettings from "../Admin/SettingsTabs/PaymentSettings";
import { Box, Tabs, Tab, Typography, Paper, Divider } from "@mui/material";

const tabs = [
  { id: "paypal", label: "PayPal Settings" },
  { id: "taxjs", label: "Tax Configuration" },
  { id: "exchange", label: "Exchange API" },
  { id: "payments", label: "Payments" },
  { id: "logistics", label: "Logistics Partners" },
];

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("paypal");

  const renderTabContent = () => {
    switch (activeTab) {
      case "paypal":
        return <PayPalSettings />;
      case "taxjs":
        return <TaxJsSettings />;
      case "exchange":
        return <ExchangeApiSettings />;
      case "payments":
        return <PaymentSettings />;
      case "logistics":
        return <LogisticsSettings />;
      default:
        return null;
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ display: "flex", maxWidth: "1200px", mx: "auto", mt: 6 }}>
      {/* Sidebar Tabs */}
      <Paper
        elevation={4}
        sx={{
          minWidth: 250,
          mr: 4,
          p: 2,
          bgcolor: "background.default",
          borderRadius: 3,
        }}
      >
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{ mb: 2, textAlign: "center", color: "primary.main" }}
        >
          Admin Settings
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Tabs
          orientation="vertical"
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: "bold",
              color: "text.secondary",
              "&.Mui-selected": {
                color: "primary.main",
              },
            },
            "& .MuiTabs-indicator": {
              bgcolor: "primary.main",
            },
          }}
        >
          {tabs.map((tab) => (
            <Tab key={tab.id} value={tab.id} label={tab.label} />
          ))}
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box
        sx={{
          flex: 1,
          p: 4,
          bgcolor: "background.paper",
          borderRadius: 3,
          boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
        }}
      >
        <Typography
          variant="h4"
          fontWeight="bold"
          sx={{ mb: 3, color: "primary.main" }}
        >
          {tabs.find((tab) => tab.id === activeTab)?.label}
        </Typography>
        {renderTabContent()}
      </Box>
    </Box>
  );
};

export default SettingsPage;