import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  useGetAllCurrenciesQuery,
  useCreateOrUpdateCurrencyMutation,
  useUpdateCurrencyMutation,
  useDeleteCurrencyMutation,
  useSetDefaultCurrencyMutation,
  useUpdateExchangeRatesMutation
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
  Badge
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckIcon from "@mui/icons-material/Check";
import AddIcon from "@mui/icons-material/Add";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";

const CurrencyManagement = () => {
  const navigate = useNavigate();
  const { data: currencies = [], refetch, isLoading } = useGetAllCurrenciesQuery();
  const [createOrUpdateCurrency] = useCreateOrUpdateCurrencyMutation();
  const [updateCurrency] = useUpdateCurrencyMutation();
  const [deleteCurrency] = useDeleteCurrencyMutation();
  const [setDefaultCurrency] = useSetDefaultCurrencyMutation();
  const [updateExchangeRates] = useUpdateExchangeRatesMutation();

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

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
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
        await updateCurrency({ code: editingCurrency.code, ...currencyData }).unwrap();
        toast.success("Currency updated successfully");
        setEditingCurrency(null);
      } else {
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
      toast.error(error?.data?.message || "Failed to save currency");
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
      toast.error(error?.data?.message || "Failed to delete currency");
    }
  };

  // Handle set default currency
  const handleSetDefault = async (code) => {
    try {
      await setDefaultCurrency({ code }).unwrap();
      toast.success("Default currency set successfully");
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to set default currency");
    }
  };

  // Handle update exchange rates
  const handleUpdateRates = async () => {
    try {
      await updateExchangeRates().unwrap();
      toast.success("Exchange rates updated successfully");
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update exchange rates");
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
