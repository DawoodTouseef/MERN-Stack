import { useState } from "react";
import {
    useGetAllTaxRulesQuery,
    useCreateOrUpdateTaxMutation,
    useDeleteTaxRuleMutation,
    useGetTaxConfigQuery,
    useCreateOrUpdateTaxConfigMutation
} from "../../redux/api/taxApiSlice";
import {
    Box,
    Typography,
    Button,
    Paper,
    Stack,
    TextField,
    IconButton,
    Tooltip,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Divider,
    Switch,
    FormControlLabel,
    Grid,
    Tabs,
    Tab,
    Alert,
    Fade
} from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    AccountBalance as TaxIcon,
    Public as RegionIcon,
    Settings as SettingsIcon,
    Save as SaveIcon,
    FilterList as FilterIcon
} from "@mui/icons-material";
import { toast } from "react-toastify";
import DocumentTitle from "react-document-title";

const Tax = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingRule, setEditingRule] = useState(null);
    const [formData, setFormData] = useState({
        region: "",
        country: "",
        rate: "",
        type: "percentage",
        isActive: true,
        description: ""
    });

    // Queries
    const { data: taxRules = [], isLoading: loadingRules, refetch: refetchRules } = useGetAllTaxRulesQuery();
    const { data: taxConfig, isLoading: loadingConfig, refetch: refetchConfig } = useGetTaxConfigQuery();

    // Mutations
    const [createOrUpdateTax, { isLoading: isSavingRule }] = useCreateOrUpdateTaxMutation();
    const [deleteTaxRule] = useDeleteTaxRuleMutation();
    const [createOrUpdateTaxConfig, { isLoading: isSavingConfig }] = useCreateOrUpdateTaxConfigMutation();

    const handleOpenDialog = (rule = null) => {
        if (rule) {
            setFormData({
                region: rule.region || "",
                country: rule.country || "",
                rate: rule.rate || "",
                type: rule.type || "percentage",
                isActive: rule.isActive !== undefined ? rule.isActive : true,
                description: rule.description || ""
            });
            setEditingRule(rule);
        } else {
            setFormData({
                region: "",
                country: "",
                rate: "",
                type: "percentage",
                isActive: true,
                description: ""
            });
            setEditingRule(null);
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingRule(null);
    };

    const handleFormChange = (e) => {
        const { name, value, checked, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmitRule = async () => {
        try {
            if (!formData.country || !formData.rate) {
                toast.error("Please fill in all required fields");
                return;
            }
            const dataToSave = {
                ...formData,
                rate: parseFloat(formData.rate)
            };
            if (editingRule) {
                dataToSave._id = editingRule._id;
            }
            await createOrUpdateTax(dataToSave).unwrap();
            toast.success(editingRule ? "Tax rule updated" : "Tax rule created");
            handleCloseDialog();
            refetchRules();
        } catch (err) {
            toast.error(err?.data?.message || "Failed to save tax rule");
        }
    };

    const handleDeleteRule = async (id) => {
        if (window.confirm("Are you sure you want to delete this tax rule?")) {
            try {
                await deleteTaxRule(id).unwrap();
                toast.success("Tax rule deleted");
                refetchRules();
            } catch (err) {
                toast.error("Failed to delete tax rule");
            }
        }
    };

    const columns = [
        {
            field: 'country', headerName: 'Country/Region', flex: 1, renderCell: (params) => (
                <Typography variant="body2" fontWeight={700}>{params.value}</Typography>
            )
        },
        { field: 'region', headerName: 'State/Prov', width: 130 },
        {
            field: 'rate', headerName: 'Rate (%)', width: 100, align: 'center', renderCell: (params) => (
                <Box sx={{ p: 0.5, px: 1.5, borderRadius: 2, bgcolor: 'rgba(99, 102, 241, 0.1)', color: 'primary.main', fontWeight: 800 }}>
                    {params.value}%
                </Box>
            )
        },
        {
            field: 'isActive', headerName: 'Status', width: 120, renderCell: (params) => (
                <Chip
                    label={params.value ? "Active" : "Disabled"}
                    color={params.value ? "success" : "default"}
                    size="small"
                    sx={{ fontWeight: 600 }}
                />
            )
        },
        {
            field: 'actions', headerName: 'Actions', width: 100, sortable: false, renderCell: (params) => (
                <Stack direction="row" spacing={1}>
                    <IconButton size="small" color="primary" onClick={() => handleOpenDialog(params.row)}>
                        <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDeleteRule(params.row._id)}>
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Stack>
            )
        }
    ];

    return (
        <DocumentTitle title="Tax Management | Admin">
            <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", py: { xs: 4, md: 6 }, px: { xs: 2, md: 4 } }}>
                <Box sx={{ maxWidth: "1200px", mx: "auto" }}>

                    {/* Header */}
                    <Box sx={{ mb: 4 }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: 'primary.main', color: '#fff', display: 'flex' }}>
                                <TaxIcon fontSize="large" />
                            </Box>
                            <Box>
                                <Typography variant="h4" fontWeight={800} color="text.primary" sx={{ letterSpacing: '-0.5px' }}>
                                    Tax Compliance
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Configure multi-regional tax rules and global compliance settings
                                </Typography>
                            </Box>
                        </Stack>
                    </Box>

                    <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', bgcolor: '#fff', overflow: 'hidden' }}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
                            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
                                <Tab label="Tax Rules" icon={<RegionIcon sx={{ fontSize: 20 }} />} iconPosition="start" sx={{ fontWeight: 600, py: 2.5 }} />
                                <Tab label="Global Config" icon={<SettingsIcon sx={{ fontSize: 20 }} />} iconPosition="start" sx={{ fontWeight: 600 }} />
                            </Tabs>
                        </Box>

                        <Box sx={{ p: 4 }}>
                            {activeTab === 0 && (
                                <Fade in>
                                    <Box>
                                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 4 }}>
                                            <Button variant="outlined" startIcon={<FilterIcon />} sx={{ borderRadius: 2.5, fontWeight: 700 }}>
                                                Filter Rules
                                            </Button>
                                            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} sx={{ borderRadius: 2.5, px: 3, fontWeight: 700 }}>
                                                Add Rule
                                            </Button>
                                        </Stack>

                                        <Box sx={{ height: 500, width: '100%' }}>
                                            <DataGrid
                                                rows={taxRules}
                                                columns={columns}
                                                getRowId={(row) => row._id}
                                                loading={loadingRules}
                                                pageSize={10}
                                                disableSelectionOnClick
                                                sx={{
                                                    border: 'none',
                                                    '& .MuiDataGrid-columnHeaders': { bgcolor: '#f8fafc', color: 'text.secondary', fontWeight: 700 },
                                                    '& .MuiDataGrid-cell': { py: 1.5, borderBottom: '1px solid #f1f5f9' },
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                </Fade>
                            )}

                            {activeTab === 1 && (
                                <Fade in>
                                    <Box sx={{ maxWidth: 800 }}>
                                        <Alert severity="info" sx={{ mb: 4, borderRadius: 3 }}>
                                            Global settings apply to all regions unless overridden by a specific tax rule.
                                        </Alert>

                                        <Stack spacing={4}>
                                            <Box>
                                                <Typography variant="subtitle1" fontWeight={700} gutterBottom>Default Strategy</Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Choose how tax is calculated when no specific rule matches.</Typography>
                                                <TextField select fullWidth defaultValue="standard" size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}>
                                                    <MenuItem value="standard">Standard Regional</MenuItem>
                                                    <MenuItem value="flat">Flat Global Rate</MenuItem>
                                                    <MenuItem value="none">Tax Exempt (Default)</MenuItem>
                                                </TextField>
                                            </Box>

                                            <Box>
                                                <Typography variant="subtitle1" fontWeight={700} gutterBottom>Tax Inclusive Pricing</Typography>
                                                <FormControlLabel
                                                    control={<Switch checked={taxConfig?.inclusive || false} />}
                                                    label={<Typography variant="body2" fontWeight={600}>Prices entered include tax</Typography>}
                                                />
                                            </Box>

                                            <Divider sx={{ borderStyle: 'dashed' }} />

                                            <Box>
                                                <Button variant="contained" startIcon={<SaveIcon />} sx={{ borderRadius: 2.5, px: 4, py: 1.2, fontWeight: 700 }}>
                                                    Save Config
                                                </Button>
                                            </Box>
                                        </Stack>
                                    </Box>
                                </Fade>
                            )}
                        </Box>
                    </Paper>

                    {/* Rule Dialog */}
                    <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
                        <DialogTitle sx={{ p: 4, pb: 0 }}>
                            <Typography variant="h5" fontWeight={800}>{editingRule ? "Edit Tax Rule" : "New Tax Rule"}</Typography>
                            <Typography variant="body2" color="text.secondary">Specify regional tax requirements</Typography>
                        </DialogTitle>
                        <DialogContent sx={{ p: 4 }}>
                            <Grid container spacing={3} sx={{ mt: 1 }}>
                                <Grid item xs={12} md={6}>
                                    <TextField label="Country *" name="country" fullWidth value={formData.country} onChange={handleFormChange} required />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField label="State/Region" name="region" fullWidth value={formData.region} onChange={handleFormChange} />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField label="Tax Rate (%) *" name="rate" type="number" fullWidth value={formData.rate} onChange={handleFormChange} required />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField select label="Type" name="type" fullWidth value={formData.type} onChange={handleFormChange}>
                                        <MenuItem value="percentage">Percentage</MenuItem>
                                        <MenuItem value="fixed">Fixed Amount</MenuItem>
                                    </TextField>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField label="Internal Description" name="description" fullWidth multiline rows={2} value={formData.description} onChange={handleFormChange} />
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={<Switch checked={formData.isActive} name="isActive" onChange={handleFormChange} color="success" />}
                                        label={<Typography fontWeight={600}>Active Rule</Typography>}
                                    />
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions sx={{ p: 4, pt: 1 }}>
                            <Button onClick={handleCloseDialog} sx={{ color: 'text.secondary', fontWeight: 600 }}>Cancel</Button>
                            <Button variant="contained" onClick={handleSubmitRule} disabled={isSavingRule} sx={{ borderRadius: 2.5, px: 4, fontWeight: 700 }}>
                                {isSavingRule ? <CircularProgress size={24} /> : (editingRule ? "Update Rule" : "Create Rule")}
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Box>
            </Box>
        </DocumentTitle>
    );
};

export default Tax;
