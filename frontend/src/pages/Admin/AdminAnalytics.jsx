import {
    Box,
    Typography,
    Grid,
    Paper,
    Card,
    CardContent,
    Divider,
    Chip,
    Stack,
    Avatar,
    useTheme,
    Button,
    IconButton,
    Tooltip,
    Fade
} from "@mui/material";
import Chart from "react-apexcharts";
import { useGetTotalSalesQuery, useGetTotalOrdersQuery } from "../../redux/api/orderApiSlice";
import { useGetVendorsQuery } from "../../redux/api/vendorApiSlice";
import Loader from "../../components/Loader";
import {
    Insights as InsightsIcon,
    TrendingUp as TrendingUpIcon,
    Storefront as StoreIcon,
    VerifiedUser as VerifiedIcon,
    PendingActions as PendingIcon,
    Download as DownloadIcon,
    FilterList as FilterIcon,
    MoreVert as MoreIcon
} from "@mui/icons-material";
import DocumentTitle from "react-document-title";

const AdminAnalytics = () => {
    const theme = useTheme();
    const { data: sales, isLoading: salesLoading } = useGetTotalSalesQuery();
    const { data: orders, isLoading: ordersLoading } = useGetTotalOrdersQuery();
    const { data: vendorsData, isLoading: vendorsLoading } = useGetVendorsQuery({ pageNumber: 1, pageSize: 100 });

    if (salesLoading || ordersLoading || vendorsLoading) {
        return (
            <Box sx={{ width: '100%', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: '#f8fafc' }}>
                <Loader />
            </Box>
        );
    }

    const vendors = vendorsData?.vendors || [];
    const verifiedVendors = vendors.filter(v => v.isVerified).length;
    const pendingVendors = vendors.length - verifiedVendors;

    // Advanced Chart Configurations
    const revenueOptions = {
        chart: {
            id: "revenue-momentum",
            toolbar: { show: false },
            sparkline: { enabled: false },
            fontFamily: 'Inter, sans-serif'
        },
        stroke: { curve: "smooth", width: 4 },
        colors: [theme.palette.primary.main, theme.palette.secondary.main],
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.45,
                opacityTo: 0.05,
                stops: [20, 100, 100, 100]
            }
        },
        xaxis: {
            categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            labels: { style: { colors: 'text.secondary', fontWeight: 600 } },
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        yaxis: {
            show: true,
            labels: { style: { colors: 'text.secondary', fontWeight: 600 } }
        },
        grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
        tooltip: { theme: 'light', x: { show: true } },
        dataLabels: { enabled: false }
    };

    const vendorDistributionOptions = {
        labels: ["Verified", "Pending"],
        colors: [theme.palette.success.main, theme.palette.warning.main],
        plotOptions: {
            pie: {
                donut: {
                    size: '75%',
                    labels: {
                        show: true,
                        total: { show: true, label: 'TOTAL', fontWeight: 800 }
                    }
                }
            }
        },
        legend: { position: 'bottom', fontWeight: 600 },
        dataLabels: { enabled: false },
        chart: { fontFamily: 'Inter, sans-serif' }
    };

    return (
        <DocumentTitle title="Platform Intelligence | Analytics">
            <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", py: { xs: 4, md: 6 }, px: { xs: 2, md: 4 } }}>
                <Box sx={{ maxWidth: "1400px", mx: "auto" }}>

                    {/* Header Section */}
                    <Box sx={{ mb: 6 }}>
                        <Grid container spacing={3} alignItems="center">
                            <Grid item xs={12} md={6}>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: 'primary.main', color: '#fff', display: 'flex' }}>
                                        <InsightsIcon fontSize="large" />
                                    </Box>
                                    <Box>
                                        <Typography variant="h3" fontWeight={900} color="text.primary" sx={{ letterSpacing: '-1.5px' }}>
                                            Intelligence
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary" fontWeight={500}>
                                            Deep dive into platform performance and merchant health
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Grid>
                            <Grid item xs={12} md={6} sx={{ textAlign: { md: 'right' } }}>
                                <Stack direction="row" spacing={2} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                                    <Button variant="outlined" startIcon={<DownloadIcon />} sx={{ borderRadius: 2.5, px: 3, fontWeight: 700, textTransform: 'none' }}>
                                        Export CSV
                                    </Button>
                                    <Button variant="contained" startIcon={<FilterIcon />} sx={{ borderRadius: 2.5, px: 3, fontWeight: 700, textTransform: 'none' }}>
                                        More Filters
                                    </Button>
                                </Stack>
                            </Grid>
                        </Grid>
                    </Box>

                    {/* Main Analytics Grid */}
                    <Grid container spacing={4}>
                        {/* Volume & Momentum */}
                        <Grid item xs={12} lg={8}>
                            <Paper elevation={0} sx={{ p: 4, borderRadius: 5, border: '1px solid #e2e8f0', bgcolor: '#fff' }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                                    <Box>
                                        <Typography variant="h6" fontWeight={800}>Gross Volume Momentum</Typography>
                                        <Typography variant="body2" color="text.secondary">Real-time revenue tracking across all endpoints</Typography>
                                    </Box>
                                    <Tooltip title="Chart Settings">
                                        <IconButton><MoreIcon /></IconButton>
                                    </Tooltip>
                                </Stack>

                                <Grid container spacing={3} sx={{ mb: 4 }}>
                                    <Grid item xs={12} sm={6}>
                                        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, borderStyle: 'dashed', bgcolor: '#f8fafc' }}>
                                            <Typography variant="caption" fontWeight={700} color="text.secondary">TOTAL VOLUME</Typography>
                                            <Typography variant="h3" fontWeight={900}>${sales?.totalSales?.toLocaleString() || 0}</Typography>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, borderStyle: 'dashed', bgcolor: '#f8fafc' }}>
                                            <Typography variant="caption" fontWeight={700} color="text.secondary">TOTAL TRANSACTIONS</Typography>
                                            <Typography variant="h3" fontWeight={900}>{orders?.totalOrders || 0}</Typography>
                                        </Paper>
                                    </Grid>
                                </Grid>

                                <Chart options={revenueOptions} series={[{ name: "Revenue", data: [4500, 5200, 4800, 6100, 5900, 7200, 8500] }]} type="area" height={350} />
                            </Paper>
                        </Grid>

                        {/* Merchant Distribution */}
                        <Grid item xs={12} lg={4}>
                            <Paper elevation={0} sx={{ p: 4, borderRadius: 5, border: '1px solid #e2e8f0', bgcolor: '#fff', height: '100%' }}>
                                <Typography variant="h6" fontWeight={800} sx={{ mb: 4 }}>Merchant Health Index</Typography>

                                <Box sx={{ height: 280, display: 'flex', justifyContent: 'center' }}>
                                    <Chart options={vendorDistributionOptions} series={[verifiedVendors, pendingVendors]} type="donut" width="100%" />
                                </Box>

                                <Divider sx={{ my: 4, borderStyle: 'dashed' }} />

                                <Stack spacing={3}>
                                    <Box sx={{ p: 2, borderRadius: 3, bgcolor: '#ecfdf5', border: '1px solid #d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Avatar sx={{ bgcolor: 'success.main', color: '#fff', width: 32, height: 32 }}><VerifiedIcon fontSize="small" /></Avatar>
                                            <Typography fontWeight={700}>Verified Partners</Typography>
                                        </Stack>
                                        <Typography fontWeight={800} color="success.dark">{verifiedVendors}</Typography>
                                    </Box>

                                    <Box sx={{ p: 2, borderRadius: 3, bgcolor: '#fff7ed', border: '1px solid #ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Avatar sx={{ bgcolor: 'warning.main', color: '#fff', width: 32, height: 32 }}><PendingIcon fontSize="small" /></Avatar>
                                            <Typography fontWeight={700}>Awaiting Verification</Typography>
                                        </Stack>
                                        <Typography fontWeight={800} color="warning.dark">{pendingVendors}</Typography>
                                    </Box>
                                </Stack>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </DocumentTitle>
    );
};

export default AdminAnalytics;
