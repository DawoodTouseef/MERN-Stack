import { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Switch,
    TextField,
    Button,
    Grid,
    Card,
    CardContent,
    CardHeader,
    FormControlLabel,
    CircularProgress,
    Alert,
    Divider,
    Collapse,
    Stack,
    IconButton,
    Tooltip,
    Paper,
    Chip,
    Fade
} from "@mui/material";
import {
    LocalShipping as LogisticsIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    Settings as SettingsIcon,
    Save as SaveIcon,
    Api as ApiIcon
} from "@mui/icons-material";
import axios from "axios";
import { toast } from "react-toastify";

const LogisticsSettings = () => {
    const [couriers, setCouriers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        fetchCouriers();
    }, []);

    const fetchCouriers = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get("/api/courier/partners", { withCredentials: true });
            setCouriers(data.couriers || []);
            setLoading(false);
        } catch (err) {
            setError("Failed to load courier settings. Please ensure the backend is running.");
            setLoading(false);
        }
    };

    const handleToggleActive = async (id, currentStatus) => {
        try {
            await axios.put(`/api/courier/partners/${id}`, { isActive: !currentStatus }, { withCredentials: true });
            setCouriers(prev => prev.map(c => c._id === id ? { ...c, isActive: !currentStatus } : c));
            toast.success(`Courier ${!currentStatus ? 'enabled' : 'disabled'} successfully`);
        } catch (err) {
            toast.error("Failed to update courier status");
        }
    };

    const handleUpdateConfig = async (id, config) => {
        try {
            await axios.put(`/api/courier/partners/${id}`, { apiConfig: config }, { withCredentials: true });
            toast.success("API configuration updated");
            setExpandedId(null);
        } catch (err) {
            toast.error("Failed to save configuration");
        }
    };

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
        </Box>
    );

    if (error) return (
        <Alert severity="error" variant="outlined" sx={{ borderRadius: 3 }}>
            {error}
        </Alert>
    );

    return (
        <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Connect and manage international shipping providers. Each provider requires specialized API credentials for real-time tracking and label generation.
            </Typography>

            <Grid container spacing={3}>
                {couriers.map((courier) => (
                    <Grid item xs={12} key={courier._id}>
                        <Paper
                            elevation={0}
                            variant="outlined"
                            sx={{
                                borderRadius: 4,
                                overflow: 'hidden',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    borderColor: 'primary.main',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                                }
                            }}
                        >
                            <Box sx={{ px: 3, py: 2, bgcolor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Box sx={{
                                        p: 1,
                                        borderRadius: 2,
                                        bgcolor: courier.isActive ? 'primary.main' : '#e2e8f0',
                                        color: '#fff',
                                        display: 'flex'
                                    }}>
                                        <LogisticsIcon fontSize="small" />
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight={700}>
                                            {courier.displayName}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            CODE: {courier.code.toUpperCase()}
                                        </Typography>
                                    </Box>
                                    <Chip
                                        label={courier.isActive ? "Active" : "Inactive"}
                                        size="small"
                                        color={courier.isActive ? "success" : "default"}
                                        sx={{ fontWeight: 600, ml: 2 }}
                                    />
                                </Stack>

                                <Stack direction="row" spacing={3} alignItems="center">
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                size="small"
                                                checked={courier.isActive}
                                                onChange={() => handleToggleActive(courier._id, courier.isActive)}
                                            />
                                        }
                                        label={<Typography variant="body2" fontWeight={600}>Status</Typography>}
                                        labelPlacement="start"
                                        sx={{ m: 0 }}
                                    />
                                    <IconButton onClick={() => toggleExpand(courier._id)} color="primary">
                                        {expandedId === courier._id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                    </IconButton>
                                </Stack>
                            </Box>

                            <Collapse in={expandedId === courier._id}>
                                <Divider />
                                <Box sx={{ p: 4 }}>
                                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <ApiIcon fontSize="small" color="primary" /> API Configuration
                                    </Typography>

                                    <Box
                                        component="form"
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            const formData = new FormData(e.currentTarget);
                                            const config = {
                                                apiKey: formData.get("apiKey"),
                                                secretKey: formData.get("secretKey"),
                                                accountNumber: formData.get("accountNumber"),
                                                baseUrl: formData.get("baseUrl")
                                            };
                                            handleUpdateConfig(courier._id, config);
                                        }}
                                    >
                                        <Grid container spacing={3}>
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    label="Production API Key"
                                                    name="apiKey"
                                                    defaultValue={courier.apiConfig?.apiKey}
                                                    fullWidth
                                                    size="small"
                                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    label="Production Secret"
                                                    name="secretKey"
                                                    defaultValue={courier.apiConfig?.secretKey}
                                                    type="password"
                                                    fullWidth
                                                    size="small"
                                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    label="Enterprise Account #"
                                                    name="accountNumber"
                                                    defaultValue={courier.apiConfig?.accountNumber}
                                                    fullWidth
                                                    size="small"
                                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    label="Base Integration URL"
                                                    name="baseUrl"
                                                    defaultValue={courier.apiConfig?.baseUrl}
                                                    fullWidth
                                                    size="small"
                                                    placeholder="https://api.provider.com/v1"
                                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sx={{ mt: 1 }}>
                                                <Button
                                                    type="submit"
                                                    variant="contained"
                                                    startIcon={<SaveIcon />}
                                                    sx={{ borderRadius: 2.5, px: 4, py: 1, fontWeight: 700, textTransform: 'none' }}
                                                >
                                                    Save Integration
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Box>
                            </Collapse>
                        </Paper>
                    </Grid>
                ))}

                {couriers.length === 0 && (
                    <Grid item xs={12}>
                        <Alert severity="info" variant="outlined" sx={{ borderRadius: 4, py: 3 }}>
                            <Typography variant="subtitle1" fontWeight={700}>No Providers Found</Typography>
                            <Typography variant="body2">Logistics partner data is currently empty. Please run system seeders or contact technical support.</Typography>
                        </Alert>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
};

export default LogisticsSettings;
