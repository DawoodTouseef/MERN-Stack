import { Box, Typography, Grid, Paper, Card, CardContent, Divider, Chip } from "@mui/material";
import Chart from "react-apexcharts";
import { useGetTotalSalesQuery, useGetTotalOrdersQuery } from "../../redux/api/orderApiSlice";
import { useGetVendorsQuery } from "../../redux/api/vendorApiSlice";
import Loader from "../../components/Loader";

const AdminAnalytics = () => {
    const { data: sales, isLoading: salesLoading } = useGetTotalSalesQuery();
    const { data: orders, isLoading: ordersLoading } = useGetTotalOrdersQuery();
    const { data: vendorsData, isLoading: vendorsLoading } = useGetVendorsQuery({ pageNumber: 1, pageSize: 100 });

    if (salesLoading || ordersLoading || vendorsLoading) return <Loader />;

    const vendors = vendorsData?.vendors || [];
    const verifiedVendors = vendors.filter(v => v.isVerified).length;
    const pendingVendors = vendors.length - verifiedVendors;

    const chartOptions = {
        chart: { id: "revenue-chart", toolbar: { show: false } },
        xaxis: { categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"] },
        colors: ["#6200ea"],
        stroke: { curve: "smooth" }
    };

    const chartSeries = [{
        name: "Revenue",
        data: [30, 40, 45, 50, 49, 60, 70] // Placeholder for trend
    }];

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" fontWeight={800} gutterBottom color="primary">
                Platform Intelligence
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Card sx={{ borderRadius: 4, bgcolor: "primary.main", color: "white" }}>
                        <CardContent>
                            <Typography variant="h6">Gross Volume</Typography>
                            <Typography variant="h3" fontWeight={700}>${sales?.totalSales?.toFixed(2) || 0}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card sx={{ borderRadius: 4, bgcolor: "secondary.main", color: "white" }}>
                        <CardContent>
                            <Typography variant="h6">Total Orders</Typography>
                            <Typography variant="h3" fontWeight={700}>{orders?.totalOrders || 0}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card sx={{ borderRadius: 4, bgcolor: "info.main", color: "white" }}>
                        <CardContent>
                            <Typography variant="h6">Vendors</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                                <Typography variant="h3" fontWeight={700}>{verifiedVendors}</Typography>
                                <Typography variant="body1">/ {vendors.length} Total</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, borderRadius: 4 }}>
                        <Typography variant="h6" gutterBottom>Revenue Momentum</Typography>
                        <Chart options={chartOptions} series={chartSeries} type="area" height={300} />
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, borderRadius: 4 }}>
                        <Typography variant="h6" gutterBottom>Merchant Health</Typography>
                        <Box sx={{ mt: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography>Verified</Typography>
                                <Chip label={verifiedVendors} color="success" size="small" />
                            </Box>
                            <Divider />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                <Typography>Pending Approval</Typography>
                                <Chip label={pendingVendors} color="warning" size="small" />
                            </Box>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AdminAnalytics;
