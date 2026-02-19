import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Alert,
  Tooltip,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  LinearProgress,
  Stack,
  Avatar,
  useTheme,
  Fade,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as ActivateIcon,
  Pause as PauseIcon,
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingIcon,
  FlashOn as FlashIcon,
  Schedule as ScheduleIcon,
  MoreVert as MoreIcon,
  Save as SaveIcon,
  AutoGraph as AutoGraphIcon,
  TipsAndUpdates as TipsIcon
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  useGetAllPricingRulesQuery,
  useCreatePricingRuleMutation,
  useUpdatePricingRuleMutation,
  useDeletePricingRuleMutation,
  useTogglePricingStatusMutation,
  useGetPricingAnalyticsQuery,
  useGetSurgePricingRecommendationsQuery,
} from '../../redux/api/dynamicPricingApiSlice';
import { useGetProductsQuery } from '../../redux/api/productApiSlice';
import { useFetchCategoriesQuery } from '../../redux/api/categoryApiSlice';
import DocumentTitle from "../../components/DocumentTitle";
import { APP_NAME } from '../../redux/constants';

const AdminDynamicPricing = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const theme = useTheme();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    pricingType: 'flash_sale',
    targets: {
      products: [],
      categories: [],
      userSegments: ['all']
    },
    pricingRules: {
      discountType: 'percentage',
      discountValue: 0,
      maxDiscountPercentage: 80
    },
    schedule: {
      startDate: new Date(),
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      flashSaleConfig: {
        duration: 60,
        maxQuantity: 100,
        countdownTimer: true
      }
    },
    usageLimits: {
      maxUsagePerCustomer: 1,
      maxTotalUsage: 1000
    },
    priority: 5
  });

  // API hooks
  const { data: pricingRules, isLoading: loadingRules, refetch } = useGetAllPricingRulesQuery();
  const { data: products } = useGetProductsQuery({});
  const { data: categories } = useFetchCategoriesQuery();
  const { data: analytics } = useGetPricingAnalyticsQuery();
  const { data: surgeRecommendations } = useGetSurgePricingRecommendationsQuery({ days: 7 });

  const [createPricingRule, { isLoading: isCreating }] = useCreatePricingRuleMutation();
  const [updatePricingRule, { isLoading: isUpdating }] = useUpdatePricingRuleMutation();
  const [deletePricingRule] = useDeletePricingRuleMutation();
  const [togglePricingStatus] = useTogglePricingStatusMutation();

  const pricingTypes = [
    { value: 'flash_sale', label: 'Flash Sale', icon: <FlashIcon /> },
    { value: 'surge_pricing', label: 'Surge Pricing', icon: <TrendingIcon /> },
    { value: 'quantity_tier', label: 'Quantity Tiers', icon: <ScheduleIcon /> },
    { value: 'time_based', label: 'Time-Based', icon: <ScheduleIcon /> },
    { value: 'bundle_offer', label: 'Bundle Offer', icon: <AddIcon /> },
    { value: 'clearance', label: 'Clearance', icon: <DeleteIcon /> },
  ];

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name) {
        toast.error("Please provide a name for the rule");
        return;
      }
      if (editingRule) {
        await updatePricingRule({ id: editingRule._id, ...formData }).unwrap();
        toast.success('Pricing rule updated successfully');
      } else {
        await createPricingRule(formData).unwrap();
        toast.success('Pricing rule created successfully');
      }
      setOpenDialog(false);
      setEditingRule(null);
      resetForm();
      refetch();
    } catch (error) {
      toast.error(error.data?.message || 'Failed to save pricing rule');
    }
  };

  const handleEdit = (rule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      description: rule.description,
      pricingType: rule.pricingType,
      targets: rule.targets,
      pricingRules: rule.pricingRules,
      schedule: {
        ...rule.schedule,
        startDate: new Date(rule.schedule.startDate),
        endDate: new Date(rule.schedule.endDate)
      },
      usageLimits: rule.usageLimits,
      priority: rule.priority
    });
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this pricing rule?')) {
      try {
        await deletePricingRule(id).unwrap();
        toast.success('Pricing rule deleted successfully');
        refetch();
      } catch (error) {
        toast.error(error.data?.message || 'Failed to delete pricing rule');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      pricingType: 'flash_sale',
      targets: { products: [], categories: [], userSegments: ['all'] },
      pricingRules: { discountType: 'percentage', discountValue: 0, maxDiscountPercentage: 80 },
      schedule: {
        startDate: new Date(),
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        flashSaleConfig: { duration: 60, maxQuantity: 100, countdownTimer: true }
      },
      usageLimits: { maxUsagePerCustomer: 1, maxTotalUsage: 1000 },
      priority: 5
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'paused': return 'warning';
      case 'completed': return 'info';
      case 'expired': return 'error';
      default: return 'default';
    }
  };

  return (
    <DocumentTitle title={`Dynamic Pricing | ${APP_NAME} Cabinet`}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", py: { xs: 4, md: 6 }, px: { xs: 2, md: 4 } }}>
          <Box sx={{ maxWidth: "1400px", mx: "auto" }}>

            {/* Header */}
            <Box sx={{ mb: 6 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: 'primary.main', color: '#fff', display: 'flex' }}>
                      <AutoGraphIcon fontSize="large" />
                    </Box>
                    <Box>
                      <Typography variant="h3" fontWeight={900} color="text.primary" sx={{ letterSpacing: '-1.5px' }}>
                        Yield Engine
                      </Typography>
                      <Typography variant="body1" color="text.secondary" fontWeight={500}>
                        Configure automated pricing models and surge detection
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }} sx={{ textAlign: { md: 'right' } }}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => { resetForm(); setOpenDialog(true); }}
                    sx={{ borderRadius: 2.5, px: 4, py: 1.2, fontWeight: 700, textTransform: 'none' }}
                  >
                    New Pricing Model
                  </Button>
                </Grid>
              </Grid>
            </Box>

            <Paper elevation={0} sx={{ borderRadius: 5, border: '1px solid #e2e8f0', bgcolor: '#fff', overflow: 'hidden' }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
                <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                  <Tab label="Active Rules" icon={<FlashIcon sx={{ fontSize: 20 }} />} iconPosition="start" sx={{ fontWeight: 600, py: 2.5 }} />
                  <Tab label="Performance" icon={<AnalyticsIcon sx={{ fontSize: 20 }} />} iconPosition="start" sx={{ fontWeight: 600 }} />
                  <Tab label="Surge Recs" icon={<TrendingIcon sx={{ fontSize: 20 }} />} iconPosition="start" sx={{ fontWeight: 600 }} />
                </Tabs>
              </Box>

              <Box sx={{ p: 4 }}>
                {tabValue === 0 && (
                  <Fade in>
                    <Box>
                      <TableContainer component={Box}>
                        <Table sx={{ minWidth: 800 }}>
                          <TableHead>
                            <TableRow sx={{ bgcolor: '#f8fafc' }}>
                              <TableCell sx={{ fontWeight: 800, color: 'text.secondary' }}>Model Details</TableCell>
                              <TableCell sx={{ fontWeight: 800, color: 'text.secondary' }}>Type</TableCell>
                              <TableCell sx={{ fontWeight: 800, color: 'text.secondary' }}>Adjustment</TableCell>
                              <TableCell sx={{ fontWeight: 800, color: 'text.secondary' }}>Validity</TableCell>
                              <TableCell sx={{ fontWeight: 800, color: 'text.secondary' }}>Status</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 800, color: 'text.secondary' }}>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {pricingRules?.data?.map((rule) => (
                              <TableRow key={rule._id} hover sx={{ '&:hover': { bgcolor: '#f1f5f980' }, transition: 'all 0.2s' }}>
                                <TableCell>
                                  <Typography variant="subtitle2" fontWeight={800}>{rule.name}</Typography>
                                  <Typography variant="caption" color="text.secondary">PRIORITY: {rule.priority}</Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip label={rule.pricingType.replace('_', ' ')} size="small" variant="outlined" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '10px' }} />
                                </TableCell>
                                <TableCell>
                                  <Typography fontWeight={900} color="primary.main">
                                    {rule.pricingRules.discountValue > 0 ? `-${rule.pricingRules.discountValue}%` : `+${Math.abs(rule.pricingRules.discountValue)}%`}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" fontWeight={600}>{new Date(rule.schedule.startDate).toLocaleDateString()}</Typography>
                                  <Typography variant="caption" color="text.secondary">to {new Date(rule.schedule.endDate).toLocaleDateString()}</Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip label={rule.status} color={getStatusColor(rule.status)} size="small" sx={{ fontWeight: 700 }} />
                                </TableCell>
                                <TableCell align="right">
                                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                                    <IconButton size="small" onClick={() => handleEdit(rule)} color="primary"><EditIcon fontSize="small" /></IconButton>
                                    <IconButton size="small" sx={{ color: 'error.main' }} onClick={() => handleDelete(rule._id)}><DeleteIcon fontSize="small" /></IconButton>
                                  </Stack>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  </Fade>
                )}

                {tabValue === 1 && (
                  <Fade in>
                    <Box>
                      {analytics?.data && (
                        <Grid container spacing={4}>
                          <Grid size={{ xs: 12, md: 6 }}>
                            <Paper variant="outlined" sx={{ p: 4, borderRadius: 4, bgcolor: '#f8fafc', borderStyle: 'dashed' }}>
                              <Typography variant="h6" fontWeight={800} gutterBottom>Contribution Analysis</Typography>
                              <Stack spacing={3} sx={{ mt: 3 }}>
                                <Box>
                                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                                    <Typography variant="body2" fontWeight={700}>System Revenue</Typography>
                                    <Typography variant="body2" color="primary.main" fontWeight={800}>${analytics.data.overall.totalRevenue.toLocaleString()}</Typography>
                                  </Stack>
                                  <LinearProgress variant="determinate" value={80} sx={{ height: 8, borderRadius: 4 }} />
                                </Box>
                                <Box>
                                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                                    <Typography variant="body2" fontWeight={700}>Conversion Velocity</Typography>
                                    <Typography variant="body2" color="success.main" fontWeight={800}>{(analytics.data.overall.avgConversionRate * 100).toFixed(1)}%</Typography>
                                  </Stack>
                                  <LinearProgress variant="determinate" value={analytics.data.overall.avgConversionRate * 100} color="success" sx={{ height: 8, borderRadius: 4 }} />
                                </Box>
                              </Stack>
                            </Paper>
                          </Grid>
                          <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="h6" fontWeight={800} sx={{ mb: 3 }}>Revenue by Model</Typography>
                            {analytics.data.byType?.map((type) => (
                              <Box key={type._id} sx={{ mb: 3 }}>
                                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                                  <Typography variant="body2" fontWeight={700} textTransform="uppercase">{type._id.replace('_', ' ')}</Typography>
                                  <Typography variant="body2" fontWeight={800}>${type.totalRevenue.toLocaleString()}</Typography>
                                </Stack>
                                <LinearProgress
                                  variant="determinate"
                                  value={(type.totalRevenue / analytics.data.overall.totalRevenue) * 100}
                                  sx={{ height: 6, borderRadius: 3, bgcolor: '#f1f5f9' }}
                                />
                              </Box>
                            ))}
                          </Grid>
                        </Grid>
                      )}
                    </Box>
                  </Fade>
                )}

                {tabValue === 2 && (
                  <Fade in>
                    <Grid container spacing={3}>
                      {surgeRecommendations?.data?.map((rec) => (
                        <Grid size={{ xs: 12, md: 4 }} key={rec.product.id}>
                          <motion.div whileHover={{ y: -5 }}>
                            <Card sx={{ borderRadius: 4, height: '100%', border: '1px solid #e2e8f0', boxShadow: 'none', '&:hover': { borderColor: 'primary.main', boxShadow: '0 8px 20px -10px rgba(0,0,0,0.1)' } }}>
                              <CardContent sx={{ p: 3 }}>
                                <Chip label="SURGE DETECTED" size="small" color="error" sx={{ fontWeight: 900, mb: 2, fontSize: '9px' }} />
                                <Typography variant="h6" fontWeight={800} gutterBottom>{rec.product.name}</Typography>

                                <Divider sx={{ my: 2, borderStyle: 'dashed' }} />

                                <Stack spacing={1} sx={{ mb: 3 }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" color="text.secondary">Current Price</Typography>
                                    <Typography variant="body2" fontWeight={700}>${rec.product.currentPrice}</Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" color="text.secondary">Demand Multiplier</Typography>
                                    <Typography variant="body2" fontWeight={700} color="error.main">{rec.recommendation.surgeFactor}x</Typography>
                                  </Box>
                                </Stack>

                                <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: 'primary.main', color: '#fff', mb: 3 }}>
                                  <Typography variant="caption" sx={{ opacity: 0.8 }}>RECOMMENDED PRICE</Typography>
                                  <Typography variant="h4" fontWeight={900}>${rec.recommendation.recommendedPrice}</Typography>
                                </Paper>

                                <Button
                                  fullWidth
                                  variant="outlined"
                                  startIcon={<TrendingIcon />}
                                  onClick={() => handleEdit({ ...formData, name: `Surge: ${rec.product.name}`, pricingType: 'surge_pricing' })}
                                  sx={{ borderRadius: 2.5, fontWeight: 700, textTransform: 'none' }}
                                >
                                  Deploy Surge Model
                                </Button>
                              </CardContent>
                            </Card>
                          </motion.div>
                        </Grid>
                      ))}
                    </Grid>
                  </Fade>
                )}
              </Box>
            </Paper>

            {/* Model Dialog */}
            <Dialog
              open={openDialog}
              onClose={() => setOpenDialog(false)}
              maxWidth="md"
              fullWidth
              PaperProps={{ sx: { borderRadius: 5 } }}
            >
              <DialogTitle sx={{ p: 4, pb: 0 }}>
                <Typography variant="h5" fontWeight={900}>{editingRule ? 'Configure Pricing Model' : 'New Pricing Model'}</Typography>
                <Typography variant="body2" color="text.secondary">Set algorithms and target parameters</Typography>
              </DialogTitle>

              <DialogContent sx={{ p: 4 }}>
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid size={{ xs: 12 }}>
                    <TextField fullWidth label="Algorithm Name *" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField select fullWidth label="Pricing Logic" value={formData.pricingType} onChange={(e) => handleInputChange('pricingType', e.target.value)}>
                      {pricingTypes.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth label="Adjustment Value (%) *" type="number" value={formData.pricingRules.discountValue} onChange={(e) => handleInputChange('pricingRules.discountValue', parseFloat(e.target.value))} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <DateTimePicker label="Start Threshold" value={formData.schedule.startDate} onChange={(d) => handleInputChange('schedule.startDate', d)} slotProps={{ textField: { fullWidth: true } }} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <DateTimePicker label="End Threshold" value={formData.schedule.endDate} onChange={(d) => handleInputChange('schedule.endDate', d)} slotProps={{ textField: { fullWidth: true } }} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth label="Priority Index (1-10)" type="number" value={formData.priority} onChange={(e) => handleInputChange('priority', parseInt(e.target.value))} />
                  </Grid>
                </Grid>
              </DialogContent>

              <DialogActions sx={{ p: 4, pt: 1 }}>
                <Button onClick={() => setOpenDialog(false)} sx={{ color: 'text.secondary', fontWeight: 700 }}>Discard</Button>
                <Button variant="contained" onClick={handleSubmit} disabled={isCreating || isUpdating} sx={{ borderRadius: 2.5, px: 4, py: 1.2, fontWeight: 700 }}>
                  Deploy Model
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        </Box>
      </LocalizationProvider>
    </DocumentTitle>
  );
};

export default AdminDynamicPricing;