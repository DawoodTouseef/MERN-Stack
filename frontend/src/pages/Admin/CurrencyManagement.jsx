import { useState, useEffect } from "react";
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
  Switch,
  FormControlLabel,
  Chip,
  Tooltip,
  Alert,
  Grid,
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
  AccordionDetails,
  Fade
} from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';
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
import SearchIcon from "@mui/icons-material/Search";
import { format } from "date-fns";
import DocumentTitle from "react-document-title";

const CurrencyManagement = () => {
  const { data: currencies = [], refetch, isLoading } = useGetAllCurrenciesQuery();
  const { data: apiConfigData } = useGetCurrencyApiConfigQuery();
  const [createOrUpdateCurrency, { isLoading: isCreating }] = useCreateOrUpdateCurrencyMutation();
  const [updateCurrency, { isLoading: isUpdating }] = useUpdateCurrencyMutation();
  const [deleteCurrency] = useDeleteCurrencyMutation();
  const [setDefaultCurrency] = useSetDefaultCurrencyMutation();
  const [updateExchangeRates, { isLoading: isUpdatingRates }] = useUpdateExchangeRatesMutation();
  const [updateCurrencyApiConfig, { isLoading: isSavingConfig }] = useUpdateCurrencyApiConfigMutation();

  // Local state
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState({ open: false, code: "" });
  const [editingCurrency, setEditingCurrency] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    symbol: "",
    rate: "",
    isDefault: false,
    isEnabled: true,
    region: ""
  });

  const [apiConfig, setApiConfig] = useState({
    apiKey: "",
    autoUpdateInterval: 24,
    isEnabled: true
  });

  const [lastUpdate, setLastUpdate] = useState(null);
  const [nextUpdate, setNextUpdate] = useState(null);

  // Initialize API config
  useEffect(() => {
    if (apiConfigData) {
      setApiConfig({
        apiKey: apiConfigData.apiKey || "",
        autoUpdateInterval: apiConfigData.autoUpdateInterval || 24,
        isEnabled: apiConfigData.isEnabled !== undefined ? apiConfigData.isEnabled : true
      });
      if (apiConfigData.lastUpdate) setLastUpdate(new Date(apiConfigData.lastUpdate));
      if (apiConfigData.nextUpdate) setNextUpdate(new Date(apiConfigData.nextUpdate));
    }
  }, [apiConfigData]);

  // Handlers
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleApiConfigChange = (e) => {
    const { name, value, type, checked } = e.target;
    setApiConfig(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    try {
      const currencyData = {
        ...formData,
        rate: parseFloat(formData.rate) || 0
      };

      if (editingCurrency) {
        await updateCurrency({ code: editingCurrency.code, ...currencyData }).unwrap();
        toast.success("Currency updated successfully");
      } else {
        await createOrUpdateCurrency(currencyData).unwrap();
        toast.success("Currency created successfully");
      }

      handleCloseDialog();
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to save currency");
    }
  };

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

  const confirmDelete = async () => {
    try {
      await deleteCurrency(deleteConfirmDialog.code).unwrap();
      toast.success("Currency deleted successfully");
      setDeleteConfirmDialog({ open: false, code: "" });
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to delete currency");
    }
  };

  const handleSetDefault = async (code) => {
    try {
      await setDefaultCurrency({ code }).unwrap();
      toast.success("Default currency updated");
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to set default");
    }
  };

  const handleUpdateRates = async () => {
    try {
      const result = await updateExchangeRates().unwrap();
      toast.success("Rates synchronized with API");
      if (result.lastUpdate) setLastUpdate(new Date(result.lastUpdate));
      if (result.nextUpdate) setNextUpdate(new Date(result.nextUpdate));
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Sync failed");
    }
  };

  const handleSaveApiConfig = async () => {
    try {
      await updateCurrencyApiConfig(apiConfig).unwrap();
      toast.success("API configuration saved");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to save config");
    }
  };

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

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCurrency(null);
  };

  // DataGrid Columns
  const columns = [
    {
      field: 'code',
      headerName: 'Code',
      width: 100,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={700} color="primary.main">
          {params.value}
        </Typography>
      )
    },
    { field: 'name', headerName: 'Currency Name', flex: 1 },
    { field: 'symbol', headerName: 'Symbol', width: 90, align: 'center', headerAlign: 'center' },
    {
      field: 'rate',
      headerName: 'Exchange Rate',
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontFamily: 'Monospace' }}>
          {(params.value || 0).toFixed(4)}
        </Typography>
      )
    },
    { field: 'region', headerName: 'Region', width: 130 },
    {
      field: 'isEnabled',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value ? "Active" : "Inactive"}
          color={params.value ? "success" : "default"}
          size="small"
          sx={{ fontWeight: 600, borderRadius: 1 }}
        />
      )
    },
    {
      field: 'isDefault',
      headerName: 'Default',
      width: 110,
      renderCell: (params) => params.value ? (
        <Chip label="Default" color="primary" size="small" icon={<CheckIcon />} sx={{ fontWeight: 700 }} />
      ) : (
        <Button
          size="small"
          variant="outlined"
          onClick={() => handleSetDefault(params.row.code)}
          sx={{ textTransform: 'none', borderRadius: 1.5, py: 0 }}
        >
          Set
        </Button>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="Edit">
            <IconButton size="small" color="primary" onClick={() => handleEdit(params.row)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {!params.row.isDefault && (
            <Tooltip title="Delete">
              <IconButton size="small" color="error" onClick={() => setDeleteConfirmDialog({ open: true, code: params.row.code })}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      )
    }
  ];

  const filteredCurrencies = currencies.filter(c =>
    c.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DocumentTitle title="Currency Management | Admin">
      <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", py: 4, px: { xs: 2, md: 4 } }}>
        <Fade in>
          <Box>
            {/* Header Section */}
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #e2e8f0', bgcolor: '#fff', mb: 3 }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={6}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: 'primary.main', color: '#fff', display: 'flex' }}>
                      <CurrencyExchangeIcon fontSize="large" />
                    </Box>
                    <Box>
                      <Typography variant="h4" fontWeight={800} color="text.primary" sx={{ letterSpacing: '-0.5px' }}>
                        Currencies
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Configure global exchange rates and payment currencies
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={12} md={6} sx={{ textAlign: { md: 'right' } }}>
                  <Stack direction="row" spacing={2} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                      onClick={handleUpdateRates}
                      disabled={isUpdatingRates}
                      sx={{ borderRadius: 2.5, px: 3, py: 1, textTransform: 'none', fontWeight: 600 }}
                    >
                      {isUpdatingRates ? "Syncing..." : "Sync Rates"}
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleOpenDialog}
                      sx={{ borderRadius: 2.5, px: 3, py: 1, textTransform: 'none', fontWeight: 600, boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)' }}
                    >
                      Add Currency
                    </Button>
                  </Stack>
                </Grid>
              </Grid>

              <Divider sx={{ my: 4 }} />

              {/* Stats Cards */}
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ p: 3, borderRadius: 3, bgcolor: '#f1f5f9', border: '1px solid #e2e8f0' }}>
                    <Typography color="text.secondary" variant="body2" fontWeight={600} gutterBottom>Total</Typography>
                    <Typography variant="h4" fontWeight={800}>{currencies.length}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ p: 3, borderRadius: 3, bgcolor: '#ecfdf5', border: '1px solid #d1fae5' }}>
                    <Typography color="success.main" variant="body2" fontWeight={600} gutterBottom>Active</Typography>
                    <Typography variant="h4" fontWeight={800} color="success.dark">{currencies.filter(c => c.isEnabled).length}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ p: 3, borderRadius: 3, bgcolor: '#eff6ff', border: '1px solid #dbeafe' }}>
                    <Typography color="primary.main" variant="body2" fontWeight={600} gutterBottom>Base</Typography>
                    <Typography variant="h4" fontWeight={800} color="primary.dark">{currencies.find(c => c.isDefault)?.code || '---'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ p: 3, borderRadius: 3, bgcolor: '#fff7ed', border: '1px solid #ffedd5' }}>
                    <Typography color="warning.main" variant="body2" fontWeight={600} gutterBottom>Next Sync</Typography>
                    <Typography variant="subtitle1" fontWeight={700}>{nextUpdate ? format(nextUpdate, 'HH:mm') : 'Manual'}</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Main Tabs Section */}
            <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', bgcolor: '#fff', overflow: 'hidden' }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
                <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ minHeight: 64 }}>
                  <Tab label="Currency List" icon={<SettingsIcon sx={{ fontSize: 20 }} />} iconPosition="start" sx={{ fontWeight: 600, minHeight: 64 }} />
                  <Tab label="API Settings" icon={<ApiIcon sx={{ fontSize: 20 }} />} iconPosition="start" sx={{ fontWeight: 600 }} />
                  <Tab label="Automation" icon={<ScheduleIcon sx={{ fontSize: 20 }} />} iconPosition="start" sx={{ fontWeight: 600 }} />
                </Tabs>
              </Box>

              <Box sx={{ p: 3 }}>
                {activeTab === 0 && (
                  <Fade in>
                    <Box>
                      <TextField
                        placeholder="Search code or name..."
                        size="small"
                        fullWidth
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                          startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                          sx: { borderRadius: 2.5, bgcolor: '#f8fafc', mb: 3 }
                        }}
                        sx={{ maxWidth: 400 }}
                      />
                      <Box sx={{ height: 500, width: '100%' }}>
                        <DataGrid
                          rows={filteredCurrencies}
                          columns={columns}
                          getRowId={(row) => row.code}
                          loading={isLoading}
                          pageSize={10}
                          rowsPerPageOptions={[10, 25, 50]}
                          disableSelectionOnClick
                          sx={{
                            border: 'none',
                            '& .MuiDataGrid-columnHeaders': { bgcolor: '#f8fafc', color: 'text.secondary', fontWeight: 700 },
                            '& .MuiDataGrid-cell': { py: 1.5, borderBottom: '1px solid #f1f5f9' },
                            '& .MuiDataGrid-row:hover': { bgcolor: '#f8fafc' }
                          }}
                        />
                      </Box>
                    </Box>
                  </Fade>
                )}

                {activeTab === 1 && (
                  <Fade in>
                    <Grid container spacing={4} sx={{ maxWidth: 800 }}>
                      <Grid item xs={12}>
                        <Typography variant="h6" fontWeight={700} gutterBottom>ExchangeRateAPI Integration</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                          Configure your standard V6 API key to pull real-time rates automatically.
                        </Typography>
                        <TextField
                          label="Production API Key"
                          name="apiKey"
                          value={apiConfig.apiKey}
                          onChange={handleApiConfigChange}
                          fullWidth
                          type="password"
                          sx={{ mb: 3 }}
                          placeholder="e.g. sk_live_..."
                        />
                        <FormControlLabel
                          control={<Switch checked={apiConfig.isEnabled} onChange={handleApiConfigChange} name="isEnabled" />}
                          label={<Typography variant="body2" fontWeight={600}>Enable Automated Fetching</Typography>}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          variant="contained"
                          onClick={handleSaveApiConfig}
                          disabled={isSavingConfig}
                          sx={{ borderRadius: 2, px: 4 }}
                        >
                          {isSavingConfig ? <CircularProgress size={20} /> : "Save API Config"}
                        </Button>
                      </Grid>
                    </Grid>
                  </Fade>
                )}

                {activeTab === 2 && (
                  <Fade in>
                    <Box>
                      <Alert severity="info" sx={{ borderRadius: 3, mb: 4 }}>
                        System background workers handle synchronization every 24 hours.
                      </Alert>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Last Update</Typography>
                            <Typography variant="h6" fontWeight={700}>
                              {lastUpdate ? format(lastUpdate, 'PPP p') : 'Never'}
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Next Scheduled</Typography>
                            <Typography variant="h6" fontWeight={700} color="success.main">
                              {nextUpdate ? format(nextUpdate, 'PPP p') : 'Not Configured'}
                            </Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                    </Box>
                  </Fade>
                )}
              </Box>
            </Paper>
          </Box>
        </Fade>

        {/* Currency Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
          <DialogTitle sx={{ p: 3, pb: 0 }}>
            <Typography variant="h5" fontWeight={800}>{editingCurrency ? "Edit Currency" : "New Currency"}</Typography>
            <Typography variant="body2" color="text.secondary">Fill in the details for the currency</Typography>
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Grid container spacing={3} sx={{ mt: 0.5 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Currency Code"
                  name="code"
                  fullWidth
                  value={formData.code}
                  onChange={handleFormChange}
                  disabled={!!editingCurrency}
                  placeholder="e.g. USD"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Symbol"
                  name="symbol"
                  fullWidth
                  value={formData.symbol}
                  onChange={handleFormChange}
                  placeholder="e.g. $"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Full Name"
                  name="name"
                  fullWidth
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="e.g. US Dollar"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Base Rate"
                  name="rate"
                  type="number"
                  fullWidth
                  value={formData.rate}
                  onChange={handleFormChange}
                  helperText="Value relative to base currency"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Region" name="region" fullWidth value={formData.region} onChange={handleFormChange} />
              </Grid>
              <Grid item xs={12}>
                <Stack direction="row" spacing={4}>
                  <FormControlLabel
                    control={<Switch checked={formData.isEnabled} onChange={handleFormChange} name="isEnabled" color="success" />}
                    label="Active"
                  />
                  <FormControlLabel
                    control={<Switch checked={formData.isDefault} onChange={handleFormChange} name="isDefault" />}
                    label="Default"
                  />
                </Stack>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button onClick={handleCloseDialog} sx={{ color: 'text.secondary', fontWeight: 600 }}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={isCreating || isUpdating}
              sx={{ borderRadius: 2, px: 4, fontWeight: 700 }}
            >
              {isCreating || isUpdating ? <CircularProgress size={24} /> : (editingCurrency ? "Update" : "Create")}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation */}
        <Dialog open={deleteConfirmDialog.open} onClose={() => setDeleteConfirmDialog({ open: false, code: "" })} PaperProps={{ sx: { borderRadius: 4 } }}>
          <DialogTitle sx={{ fontWeight: 800 }}>Confirm Deletion</DialogTitle>
          <DialogContent>
            <Typography variant="body1">
              Are you sure you want to delete <strong>{deleteConfirmDialog.code}</strong>? This cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setDeleteConfirmDialog({ open: false, code: "" })} sx={{ color: 'text.secondary' }}>Cancel</Button>
            <Button onClick={confirmDelete} variant="contained" color="error" sx={{ fontWeight: 700, borderRadius: 2 }}>Delete Forever</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DocumentTitle>
  );
};

export default CurrencyManagement;