
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
    Collapse
} from "@mui/material";
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
            const { data } = await axios.get("/api/courier/partners", { withCredentials: true });
            setCouriers(data.couriers || []);
            setLoading(false);
        } catch (err) {
            setError("Failed to load courier settings.");
            setLoading(false);
        }
    };

    const handleToggleActive = async (id, currentStatus) => {
        try {
            await axios.put(`/api/courier/partners/${id}`, { isActive: !currentStatus }, { withCredentials: true });
            fetchCouriers(); // Refresh list
            toast.success("Courier status updated");
        } catch (err) {
            toast.error("Failed to update courier");
        }
    };

    const handleUpdateConfig = async (id, config) => {
        try {
            await axios.put(`/api/courier/partners/${id}`, { apiConfig: config }, { withCredentials: true });
            toast.success("Configuration saved");
        } catch (err) {
            toast.error("Failed to save configuration");
        }
    };

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box>
            <Typography variant="body1" sx={{ mb: 3 }}>
                Configure logistics partners and shipping providers.
            </Typography>

            <Grid container spacing={3}>
                {couriers.map((courier) => (
                    <Grid item xs={12} key={courier._id}>
                        <Card variant="outlined">
                            <CardHeader
                                title={courier.displayName}
                                action={
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={courier.isActive}
                                                onChange={() => handleToggleActive(courier._id, courier.isActive)}
                                            />
                                        }
                                        label={courier.isActive ? "Enabled" : "Disabled"}
                                    />
                                }
                                subheader={courier.code.toUpperCase()}
                            />
                            <CardContent>
                                <Box mb={2}>
                                    <Button variant="outlined" size="small" onClick={() => toggleExpand(courier._id)}>
                                        {expandedId === courier._id ? "Hide Configuration" : "Configure API"}
                                    </Button>
                                </Box>

                                <Collapse in={expandedId === courier._id}>
                                    <Box component="form"
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            const formData = new FormData(e.target);
                                            const config = {
                                                apiKey: formData.get("apiKey"),
                                                secretKey: formData.get("secretKey"),
                                                accountNumber: formData.get("accountNumber"),
                                                baseUrl: formData.get("baseUrl")
                                            };
                                            handleUpdateConfig(courier._id, config);
                                        }}
                                        sx={{ p: 2, bgcolor: "#f9f9f9", borderRadius: 2 }}
                                    >
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    label="API Key"
                                                    name="apiKey"
                                                    defaultValue={courier.apiConfig?.apiKey}
                                                    fullWidth
                                                    size="small"
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    label="Secret Key"
                                                    name="secretKey"
                                                    defaultValue={courier.apiConfig?.secretKey}
                                                    type="password"
                                                    fullWidth
                                                    size="small"
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    label="Account Number"
                                                    name="accountNumber"
                                                    defaultValue={courier.apiConfig?.accountNumber}
                                                    fullWidth
                                                    size="small"
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    label="Base URL"
                                                    name="baseUrl"
                                                    defaultValue={courier.apiConfig?.baseUrl}
                                                    fullWidth
                                                    size="small"
                                                    helperText="e.g. https://apis-sandbox.fedex.com"
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Button type="submit" variant="contained" color="primary">
                                                    Save Config
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Collapse>

                            </CardContent>
                        </Card>
                    </Grid>
                ))}

                {couriers.length === 0 && (
                    <Grid item xs={12}>
                        <Alert severity="info">No courier partners found in the database. Please seed the database.</Alert>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
};

export default LogisticsSettings;
