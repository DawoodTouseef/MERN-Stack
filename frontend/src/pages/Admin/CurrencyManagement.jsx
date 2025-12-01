import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  useGetAllCurrenciesQuery,
  useCreateOrUpdateCurrencyMutation,
  useUpdateCurrencyMutation,
  useDeleteCurrencyMutation,
  useSetDefaultCurrencyMutation,
  useUpdateExchangeRatesMutation,
  useGetCurrencyApiConfigQuery,
  useUpdateCurrencyApiConfigMutation
} from "../../redux/api/currencyApiSlice";
import { toast } from "react-toastify";
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  IconButton,
  Stack,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  FormControlLabel,
  Chip,
  Tooltip,
  Alert,
  Card,
  CardContent,
  Grid,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Badge,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckIcon from "@mui/icons-material/Check";
import AddIcon from "@mui/icons-material/Add";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ScheduleIcon from "@mui/icons-material/Schedule";
import SettingsIcon from "@mui/icons-material/Settings";
import ApiIcon from "@mui/icons-material/Api";

const CurrencyManagement = () => {
  const { data: currencies = [], refetch, isLoading } = useGetAllCurrenciesQuery();
  const { data: apiConfigData } = useGetCurrencyApiConfigQuery();
  const [createOrUpdateCurrency] = useCreateOrUpdateCurrencyMutation();
  const [updateCurrency] = useUpdateCurrencyMutation();
  const [deleteCurrency] = useDeleteCurrencyMutation();
  const [setDefaultCurrency] = useSetDefaultCurrencyMutation();
  const [updateExchangeRates] = useUpdateExchangeRatesMutation();
  const [updateCurrencyApiConfig] = useUpdateCurrencyApiConfigMutation();

  // Form state
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    symbol: "",
    rate: "",
    isDefault: false,
    isEnabled: true,
    region: ""
  });
  const [editingCurrency, setEditingCurrency] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  
  // API Configuration state
  const [apiConfig, setApiConfig] = useState({
    apiKey: "",
    autoUpdateInterval: 24, // hours
    isEnabled: true
  });
  const [activeTab, setActiveTab] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [nextUpdate, setNextUpdate] = useState(null);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  // Handle API config changes
  const handleApiConfigChange = (e) => {
    const { name, value, type, checked } = e.target;
    setApiConfig(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const currencyData = {
        ...formData,
        rate: parseFloat(formData.rate)
      };

      if (editingCurrency) {
        // For updates, we need to pass the code separately
        await updateCurrency({ code: editingCurrency.code, ...currencyData }).unwrap();
        toast.success("Currency updated successfully");
        setEditingCurrency(null);
      } else {
        // For creates, code is part of the data
        await createOrUpdateCurrency(currencyData).unwrap();
        toast.success("Currency created successfully");
      }

      // Reset form
      setFormData({
        code: "",
        name: "",
        symbol: "",
        rate: "",
        isDefault: false,
        isEnabled: true,
        region: ""
      });

      // Close dialog and refresh currency list
      setOpenDialog(false);
      refetch();
    } catch (error) {
      console.error("Save currency error:", error);
      const errorMessage = error?.data?.message || error?.message || "Failed to save currency";
      toast.error(errorMessage);
    }
  };

  // Handle edit currency
  const handleEdit = (currency) => {
    setFormData({
      code: currency.code,
      name: currency.name,
      symbol: currency.symbol,
      rate: currency.rate,
      isDefault: currency.isDefault,
      isEnabled: currency.isEnabled,
      region: currency.region || ""
    });
    setEditingCurrency(currency);
    setOpenDialog(true);
  };

  // Handle delete currency
  const handleDelete = async (code) => {
    try {
      await deleteCurrency(code).unwrap();
      toast.success("Currency deleted successfully");
      refetch();
    } catch (error) {
      const errorMessage = error?.data?.message || error?.message || "Failed to delete currency";
      toast.error(errorMessage);
    }
  };

  // Handle set default currency
  const handleSetDefault = async (code) => {
    try {
      await setDefaultCurrency({ code }).unwrap();
      toast.success("Default currency set successfully");
      refetch();
    } catch (error) {
      const errorMessage = error?.data?.message || error?.message || "Failed to set default currency";
      toast.error(errorMessage);
    }
  };

  // Handle update exchange rates
  const handleUpdateRates = async () => {
    try {
      const result = await updateExchangeRates().unwrap();
      toast.success("Exchange rates updated successfully");
      setLastUpdate(result.lastUpdate ? new Date(result.lastUpdate) : new Date());
      setNextUpdate(result.nextUpdate ? new Date(result.nextUpdate) : null);
      refetch();
    } catch (error) {
      const errorMessage = error?.data?.message || error?.message || "Failed to update exchange rates";
      toast.error(errorMessage);
    }
  };


  // Reset form
  const handleCancel = () => {
    setFormData({
      code: "",
      name: "",
      symbol: "",
      rate: "",
      isDefault: false,
      isEnabled: true,
      region: ""
    });
    setEditingCurrency(null);
    setOpenDialog(false);
  };

  // Open dialog for adding new currency
  const handleOpenDialog = () => {
    setFormData({
      code: "",
      name: "",
      symbol: "",
      rate: "",
      isDefault: false,
      isEnabled: true,
      region: ""
    });
    setEditingCurrency(null);
    setOpenDialog(true);
  };

  // Initialize API config data
  useEffect(() => {
    if (apiConfigData) {
      setApiConfig({
        apiKey: apiConfigData.apiKey || "",
        autoUpdateInterval: apiConfigData.autoUpdateInterval || 24,
        isEnabled: apiConfigData.isEnabled !== undefined ? apiConfigData.isEnabled : true
      });
      
      if (apiConfigData.lastUpdate) {
        setLastUpdate(new Date(apiConfigData.lastUpdate));
      }
      
      if (apiConfigData.nextUpdate) {
        setNextUpdate(new Date(apiConfigData.nextUpdate));
      }
    }
  }, [apiConfigData]);

  // Get default currency
  const defaultCurrency = currencies.find(currency => currency.isDefault);

  return (
    <Box sx={{ maxWidth: "100vw", px: { xs: 1, md: 4 }, py: 2 }}>
      <Paper
        elevation={6}
        sx={{ 
          bgcolor: "#1a1a1a", 
          color: "#fff", 
          p: 3, 
          mt: 2, 
          mb: 2, 
          borderRadius: 4,
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, background: "linear-gradient(45deg, #2196F3, #21CBF3)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Currency Management
          </Typography>
          
          <Badge 
            badgeContent={currencies.length} 
            color="primary"
            sx={{ 
              "& .MuiBadge-badge": { 
                fontSize: 12, 
                height: 20, 
                minWidth: 20,
                borderRadius: 10
              } 
            }}
          >
            <CurrencyExchangeIcon sx={{ fontSize: 40, color: "#2196F3" }} />
          </Badge>
        </Stack>
        
        <Alert 
          severity="info" 
          sx={{ 
            mb: 3, 
            borderRadius: 2,
            bgcolor: "rgba(33, 150, 243, 0.1)",
            border: "1px solid rgba(33, 150, 243, 0.3)"
          }}
        >
          Manage supported currencies for your e-commerce platform. Set a default currency and enable/disable specific currencies for customers.
        </Alert>
        
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ mb: 3 }}
          textColor="secondary"
          indicatorColor="secondary"
        >
          <Tab icon={<CurrencyExchangeIcon />} label="Currencies" />
          <Tab icon={<ApiIcon />} label="API Configuration" />
          <Tab icon={<ScheduleIcon />} label="Scheduled Updates" />
        </Tabs>
        
        {activeTab === 0 && (
          <>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<RefreshIcon />}
                onClick={handleUpdateRates}
                sx={{ 
                  py: 1.5,
                  px: 3,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  boxShadow: 3,
                  "&:hover": {
                    boxShadow: 6
                  }
                }}
              >
                Update Exchange Rates
              </Button>
              
              <Button
                variant="contained"
                color="secondary"
                startIcon={<AddIcon />}
                onClick={handleOpenDialog}
                sx={{ 
                  py: 1.5,
                  px: 3,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  boxShadow: 3,
                  "&:hover": {
                    boxShadow: 6
                  }
                }}
              >
                Add New Currency
              </Button>
            </Stack>
            
            <Divider sx={{ my: 3, borderColor: "rgba(255,255,255,0.1)" }} />
            
            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: "#2d2d2d", borderRadius: 3, boxShadow: 3 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: "#2196F3", mb: 1 }}>
                      Total Currencies
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: "#fff" }}>
                      {currencies.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: "#2d2d2d", borderRadius: 3, boxShadow: 3 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: "#4CAF50", mb: 1 }}>
                      Active Currencies
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: "#fff" }}>
                      {currencies.filter(c => c.isEnabled).length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: "#2d2d2d", borderRadius: 3, boxShadow: 3 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: "#FF9800", mb: 1 }}>
                      Default Currency
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: "#fff" }}>
                      {defaultCurrency ? defaultCurrency.code : "None"}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: "#2d2d2d", borderRadius: 3, boxShadow: 3 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: "#9C27B0", mb: 1 }}>
                      Inactive Currencies
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: "#fff" }}>
                      {currencies.filter(c => !c.isEnabled).length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            {/* Currency List */}
            <Paper sx={{ p: 3, bgcolor: "#1e1e1e", borderRadius: 3, boxShadow: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: "#2196F3" }}>
                  Supported Currencies
                </Typography>
                
                {isLoading && <CircularProgress size={24} sx={{ color: "#2196F3" }} />}
              </Stack>
              
              <TableContainer sx={{ borderRadius: 2, maxHeight: 600 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold", bgcolor: "#2d2d2d" }}>Code</TableCell>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold", bgcolor: "#2d2d2d" }}>Name</TableCell>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold", bgcolor: "#2d2d2d" }}>Symbol</TableCell>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold", bgcolor: "#2d2d2d" }}>Rate</TableCell>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold", bgcolor: "#2d2d2d" }}>Region</TableCell>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold", bgcolor: "#2d2d2d" }}>Status</TableCell>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold", bgcolor: "#2d2d2d" }}>Default</TableCell>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold", bgcolor: "#2d2d2d" }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currencies.map((currency) => (
                      <TableRow 
                        key={currency.code} 
                        sx={{ 
                          "&:hover": { bgcolor: "rgba(33, 150, 243, 0.1)" },
                          transition: "background-color 0.3s"
                        }}
                      >
                        <TableCell sx={{ color: "#fff", fontWeight: 600 }}>{currency.code}</TableCell>
                        <TableCell sx={{ color: "#fff" }}>{currency.name}</TableCell>
                        <TableCell sx={{ color: "#fff" }}>{currency.symbol}</TableCell>
                        <TableCell sx={{ color: "#fff" }}>{currency.rate}</TableCell>
                        <TableCell sx={{ color: "#fff" }}>{currency.region || "-"}</TableCell>
                        <TableCell sx={{ color: "#fff" }}>
                          <Chip
                            label={currency.isEnabled ? "Enabled" : "Disabled"}
                            color={currency.isEnabled ? "success" : "default"}
                            size="small"
                            sx={{ 
                              fontWeight: 600,
                              borderRadius: 1
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: "#fff" }}>
                          {currency.isDefault ? (
                            <Tooltip title="Default Currency">
                              <Chip 
                                icon={<CheckIcon />} 
                                label="Default" 
                                color="primary" 
                                size="small"
                                sx={{ 
                                  fontWeight: 600,
                                  borderRadius: 1
                                }}
                              />
                            </Tooltip>
                          ) : (
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleSetDefault(currency.code)}
                              sx={{ 
                                minWidth: "auto", 
                                p: 0.5,
                                borderRadius: 1,
                                textTransform: "none",
                                borderColor: "rgba(255,255,255,0.3)",
                                color: "#fff",
                                "&:hover": {
                                  borderColor: "#2196F3",
                                  bgcolor: "rgba(33, 150, 243, 0.1)"
                                }
                              }}
                            >
                              Set Default
                            </Button>
                          )}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEdit(currency)}
                            sx={{ 
                              mr: 1,
                              "&:hover": {
                                bgcolor: "rgba(33, 150, 243, 0.1)"
                              }
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(currency.code)}
                            disabled={currency.isDefault}
                            sx={{ 
                              "&:hover": {
                                bgcolor: "rgba(244, 67, 54, 0.1)"
                              },
                              "&.Mui-disabled": {
                                color: "rgba(255,255,255,0.3)"
                              }
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </>
        )}
        
        {activeTab === 1 && (
          <Paper sx={{ p: 3, bgcolor: "#1e1e1e", borderRadius: 3, boxShadow: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: "#2196F3", mb: 3 }}>
              <ApiIcon sx={{ mr: 1, verticalAlign: "middle" }} />
              Exchange Rate API Configuration
            </Typography>
            
            <Alert 
              severity="warning" 
              sx={{ 
                mb: 3, 
                borderRadius: 2,
                bgcolor: "rgba(255, 152, 0, 0.1)",
                border: "1px solid rgba(255, 152, 0, 0.3)"
              }}
            >
              Configure your external API key to fetch real-time exchange rates. This key is stored securely on the server.
            </Alert>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <TextField
                  label="API Key"
                  name="apiKey"
                  value={apiConfig.apiKey}
                  onChange={handleApiConfigChange}
                  fullWidth
                  type="password"
                  sx={{ 
                    input: { color: "#fff" }, 
                    label: { color: "#fff" },
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "rgba(255,255,255,0.2)"
                      },
                      "&:hover fieldset": {
                        borderColor: "rgba(33, 150, 243, 0.5)"
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#2196F3"
                      }
                    }
                  }}
                  helperText="Enter your ExchangeRate-API key for real-time currency conversion"
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: "#fff" }}>Auto-update Status</InputLabel>
                  <Select
                    name="isEnabled"
                    value={apiConfig.isEnabled}
                    onChange={handleApiConfigChange}
                    sx={{ 
                      color: "#fff",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(255,255,255,0.2)"
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(33, 150, 243, 0.5)"
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#2196F3"
                      }
                    }}
                    label="Auto-update Status"
                  >
                    <MenuItem value={true}>Enabled</MenuItem>
                    <MenuItem value={false}>Disabled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Accordion sx={{ bgcolor: "#2d2d2d", borderRadius: 2 }}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon sx={{ color: "#fff" }} />}
                    sx={{ color: "#fff" }}
                  >
                    <SettingsIcon sx={{ mr: 1 }} />
                    <Typography>Advanced Settings</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Auto-update Interval (hours)"
                          name="autoUpdateInterval"
                          type="number"
                          value={apiConfig.autoUpdateInterval}
                          onChange={handleApiConfigChange}
                          fullWidth
                          sx={{ 
                            input: { color: "#fff" }, 
                            label: { color: "#fff" },
                            "& .MuiOutlinedInput-root": {
                              "& fieldset": {
                                borderColor: "rgba(255,255,255,0.2)"
                              },
                              "&:hover fieldset": {
                                borderColor: "rgba(33, 150, 243, 0.5)"
                              },
                              "&.Mui-focused fieldset": {
                                borderColor: "#2196F3"
                              }
                            }
                          }}
                          helperText="How often to automatically update exchange rates (default: 24 hours)"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Fallback Rate Source"
                          value="ExchangeRate-API (v6)"
                          fullWidth
                          disabled
                          sx={{ 
                            input: { color: "#aaa" }, 
                            label: { color: "#fff" },
                            "& .MuiOutlinedInput-root": {
                              "& fieldset": {
                                borderColor: "rgba(255,255,255,0.2)"
                              }
                            }
                          }}
                        />
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Grid>
              
              <Grid item xs={12}>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSaveApiConfig}
                    sx={{ 
                      py: 1.5,
                      px: 3,
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                      boxShadow: 3,
                      "&:hover": {
                        boxShadow: 6
                      }
                    }}
                  >
                    Save Configuration
                  </Button>
                  
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => {
                      setApiConfig({
                        apiKey: apiConfigData?.apiKey || "",
                        autoUpdateInterval: 24,
                        isEnabled: true
                      });
                      toast.info("Configuration reset to defaults");
                    }}
                    sx={{ 
                      py: 1.5,
                      px: 3,
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                      borderColor: "rgba(255,255,255,0.3)",
                      color: "#fff",
                      "&:hover": {
                        borderColor: "#fff",
                        bgcolor: "rgba(255,255,255,0.1)"
                      }
                    }}
                  >
                    Reset to Defaults
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        )}
        
        {activeTab === 2 && (
          <Paper sx={{ p: 3, bgcolor: "#1e1e1e", borderRadius: 3, boxShadow: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: "#2196F3", mb: 3 }}>
              <ScheduleIcon sx={{ mr: 1, verticalAlign: "middle" }} />
              Scheduled Exchange Rate Updates
            </Typography>
            
            <Alert 
              severity="info" 
              sx={{ 
                mb: 3, 
                borderRadius: 2,
                bgcolor: "rgba(33, 150, 243, 0.1)",
                border: "1px solid rgba(33, 150, 243, 0.3)"
              }}
            >
              Exchange rates are automatically updated every 24 hours to ensure accurate currency conversion.
            </Alert>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ bgcolor: "#2d2d2d", borderRadius: 3, boxShadow: 3, height: "100%" }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: "#2196F3", mb: 2 }}>
                      <ScheduleIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                      Update Schedule
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#fff", mb: 2 }}>
                      Next automatic update:
                    </Typography>
                    <Typography variant="h6" sx={{ color: "#4CAF50", fontWeight: 600 }}>
                      {nextUpdate ? nextUpdate.toLocaleString() : "Not scheduled"}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#aaa", mt: 2 }}>
                      Last manual update: {lastUpdate ? lastUpdate.toLocaleString() : "Never"}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card sx={{ bgcolor: "#2d2d2d", borderRadius: 3, boxShadow: 3, height: "100%" }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: "#FF9800", mb: 2 }}>
                      <SettingsIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                      Update Configuration
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#fff", mb: 2 }}>
                      Current settings:
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#fff", mb: 1 }}>
                      • Auto-update: {apiConfig.isEnabled ? "Enabled" : "Disabled"}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#fff", mb: 1 }}>
                      • Interval: {apiConfig.autoUpdateInterval} hours
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#fff" }}>
                      • API Source: ExchangeRate-API
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<RefreshIcon />}
                    onClick={handleUpdateRates}
                    sx={{ 
                      py: 1.5,
                      px: 3,
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                      boxShadow: 3,
                      "&:hover": {
                        boxShadow: 6
                      }
                    }}
                  >
                    Update Rates Now
                  </Button>
                  
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => {
                      // In a real implementation, this would trigger a backend job
                      toast.info("Scheduled update configured");
                    }}
                    sx={{ 
                      py: 1.5,
                      px: 3,
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                      borderColor: "rgba(255,255,255,0.3)",
                      color: "#fff",
                      "&:hover": {
                        borderColor: "#fff",
                        bgcolor: "rgba(255,255,255,0.1)"
                      }
                    }}
                  >
                    Reschedule Updates
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        )}
      </Paper>
      
      {/* Add/Edit Currency Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCancel}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "#1e1e1e",
            color: "#fff",
            borderRadius: 3
          }
        }}
      >
        <DialogTitle sx={{ pb: 2, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {editingCurrency ? "Edit Currency" : "Add New Currency"}
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 3 }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Currency Code *"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  fullWidth
                  required
                  disabled={!!editingCurrency}
                  sx={{ 
                    input: { color: "#fff" }, 
                    label: { color: "#fff" },
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "rgba(255,255,255,0.2)"
                      },
                      "&:hover fieldset": {
                        borderColor: "rgba(33, 150, 243, 0.5)"
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#2196F3"
                      }
                    }
                  }}
                  helperText="3-letter currency code (e.g., USD, EUR)"
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  label="Currency Name *"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  fullWidth
                  required
                  sx={{ 
                    input: { color: "#fff" }, 
                    label: { color: "#fff" },
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "rgba(255,255,255,0.2)"
                      },
                      "&:hover fieldset": {
                        borderColor: "rgba(33, 150, 243, 0.5)"
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#2196F3"
                      }
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  label="Symbol *"
                  name="symbol"
                  value={formData.symbol}
                  onChange={handleChange}
                  fullWidth
                  required
                  sx={{ 
                    input: { color: "#fff" }, 
                    label: { color: "#fff" },
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "rgba(255,255,255,0.2)"
                      },
                      "&:hover fieldset": {
                        borderColor: "rgba(33, 150, 243, 0.5)"
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#2196F3"
                      }
                    }
                  }}
                  helperText="Currency symbol (e.g., $, €, £)"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Exchange Rate *"
                  name="rate"
                  type="number"
                  value={formData.rate}
                  onChange={handleChange}
                  fullWidth
                  required
                  sx={{ 
                    input: { color: "#fff" }, 
                    label: { color: "#fff" },
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "rgba(255,255,255,0.2)"
                      },
                      "&:hover fieldset": {
                        borderColor: "rgba(33, 150, 243, 0.5)"
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#2196F3"
                      }
                    }
                  }}
                  helperText="Rate relative to default currency"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Region"
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  fullWidth
                  sx={{ 
                    input: { color: "#fff" }, 
                    label: { color: "#fff" },
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "rgba(255,255,255,0.2)"
                      },
                      "&:hover fieldset": {
                        borderColor: "rgba(33, 150, 243, 0.5)"
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#2196F3"
                      }
                    }
                  }}
                  helperText="Optional region for this currency"
                />
              </Grid>
            </Grid>
            
            <Stack direction={{ xs: "column", sm: "row" }} spacing={3} sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    name="isEnabled"
                    checked={formData.isEnabled}
                    onChange={handleChange}
                    color="primary"
                  />
                }
                label="Enabled"
                sx={{ 
                  color: "#fff",
                  "& .MuiTypography-root": {
                    fontWeight: 500
                  }
                }}
              />
              
              <FormControlLabel
                control={
                  <Switch
                    name="isDefault"
                    checked={formData.isDefault}
                    onChange={handleChange}
                    color="secondary"
                  />
                }
                label="Default Currency"
                sx={{ 
                  color: "#fff",
                  "& .MuiTypography-root": {
                    fontWeight: 500
                  }
                }}
              />
            </Stack>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={handleCancel}
            sx={{ 
              color: "#fff",
              borderColor: "rgba(255,255,255,0.3)",
              "&:hover": {
                borderColor: "#fff"
              }
            }}
            variant="outlined"
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            sx={{ 
              py: 1.5,
              px: 3,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              boxShadow: 3,
              "&:hover": {
                boxShadow: 6
              }
            }}
          >
            {editingCurrency ? "Update Currency" : "Add Currency"}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={handleOpenDialog}
        sx={{ 
          position: "fixed",
          bottom: 32,
          right: 32,
          boxShadow: 6,
          "&:hover": {
            boxShadow: 12
          }
        }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default CurrencyManagement;