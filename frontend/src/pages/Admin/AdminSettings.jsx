import { useState } from "react";
import PaymentSettings from "./SettingsTabs/paymentsSettings";
import TaxJsSettings from "./SettingsTabs/TaxJsSettings";
import ExchangeApiSettings from "./SettingsTabs/ExchangeApiSettings";
import LogisticsSettings from "./SettingsTabs/LogisticsSettings";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Paper,
  Divider,
  Stack,
  Fade,
  useTheme,
  useMediaQuery
} from "@mui/material";
import {
  CurrencyExchange as CurrencyIcon,
  LocalShipping as LogisticsIcon,
  AccountBalance as TaxIcon,
  Payment as PaymentIcon,
  Settings as SettingsIcon
} from "@mui/icons-material";
import DocumentTitle from "../../components/DocumentTitle";

const tabs = [
  { id: "payments", label: "Payments", icon: <PaymentIcon /> },
  { id: "taxjs", label: "Tax Configuration", icon: <TaxIcon /> },
  { id: "exchange", label: "Exchange API", icon: <CurrencyIcon /> },
  { id: "logistics", label: "Logistics Partners", icon: <LogisticsIcon /> },
];

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState("payments");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const renderTabContent = () => {
    switch (activeTab) {
      case "payments":
        return <PaymentSettings />;
      case "taxjs":
        return <TaxJsSettings />;
      case "exchange":
        return <ExchangeApiSettings />;
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
    <DocumentTitle title="Admin Settings | ShopHub">
      <Box sx={{
        minHeight: "100vh",
        bgcolor: "#f8fafc",
        py: { xs: 2, md: 6 },
        px: { xs: 2, md: 4 }
      }}>
        <Box sx={{ maxWidth: "1200px", mx: "auto" }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{
                p: 1.5,
                borderRadius: 3,
                bgcolor: 'primary.main',
                color: '#fff',
                display: 'flex'
              }}>
                <SettingsIcon fontSize="large" />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={800} color="text.primary" sx={{ letterSpacing: '-0.5px' }}>
                  System Settings
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Configure global payment, tax, and logistics integrations
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Grid container spacing={4}>
            {/* Sidebar Navigation */}
            <Grid size={{ xs: 12, md: 3.5 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: "#fff",
                  borderRadius: 4,
                  border: '1px solid #e2e8f0',
                  position: { md: 'sticky' },
                  top: { md: 24 }
                }}
              >
                <Tabs
                  orientation={isMobile ? "horizontal" : "vertical"}
                  variant="scrollable"
                  value={activeTab}
                  onChange={handleTabChange}
                  sx={{
                    "& .MuiTab-root": {
                      textTransform: "none",
                      fontWeight: 600,
                      justifyContent: "flex-start",
                      minHeight: 56,
                      borderRadius: 2,
                      mb: isMobile ? 0 : 1,
                      mr: isMobile ? 1 : 0,
                      px: 3,
                      color: "text.secondary",
                      transition: 'all 0.2s',
                      "&.Mui-selected": {
                        color: "primary.main",
                        bgcolor: "rgba(99, 102, 241, 0.08)",
                      },
                      "&:hover": {
                        bgcolor: "rgba(0, 0, 0, 0.02)",
                      },
                    },
                    "& .MuiTabs-indicator": {
                      display: "none",
                    },
                  }}
                >
                  {tabs.map((tab) => (
                    <Tab
                      key={tab.id}
                      value={tab.id}
                      label={tab.label}
                      icon={tab.icon}
                      iconPosition="start"
                    />
                  ))}
                </Tabs>
              </Paper>
            </Grid>

            {/* Content Area */}
            <Grid size={{ xs: 12, md: 8.5 }}>
              <Fade in timeout={400}>
                <Box>
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 3, md: 5 },
                      bgcolor: "#fff",
                      borderRadius: 4,
                      border: '1px solid #e2e8f0',
                      minHeight: 500
                    }}
                  >
                    <Typography
                      variant="h5"
                      fontWeight={800}
                      sx={{ mb: 4, color: "text.primary", display: 'flex', alignItems: 'center', gap: 1.5 }}
                    >
                      {tabs.find((tab) => tab.id === activeTab)?.label}
                    </Typography>
                    <Divider sx={{ mb: 5, borderStyle: 'dashed' }} />
                    {renderTabContent()}
                  </Paper>
                </Box>
              </Fade>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </DocumentTitle>
  );
};

// Internal Grid helper for simplicity
const Grid = ({ children, container, item, xs, md, spacing, sx }) => {
  return (
    <Box
      sx={{
        display: container ? 'flex' : 'block',
        flexWrap: 'wrap',
        width: item ? (xs ? `${(xs / 12) * 100}%` : 'auto') : '100%',
        margin: container ? `-${(spacing || 0) * 4}px` : 0,
        ...sx,
        '& > *': item ? { boxSizing: 'border-box' } : {}
      }}
    >
      {children}
    </Box>
  );
};

export default AdminSettings;