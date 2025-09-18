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
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { motion } from 'framer-motion';
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

const AdminDynamicPricing = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
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
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
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
  const { data: pricingRules, isLoading, refetch } = useGetAllPricingRulesQuery();
  const { data: products } = useGetProductsQuery({});
  const { data: categories } = useFetchCategoriesQuery();
  const { data: analytics } = useGetPricingAnalyticsQuery();
  const { data: surgeRecommendations } = useGetSurgePricingRecommendationsQuery({ days: 7 });

  const [createPricingRule] = useCreatePricingRuleMutation();
  const [updatePricingRule] = useUpdatePricingRuleMutation();
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

  const discountTypes = [
    { value: 'percentage', label: 'Percentage (%)' },
    { value: 'fixed_amount', label: 'Fixed Amount ($)' },
    { value: 'tiered', label: 'Tiered Pricing' },
  ];

  const userSegments = [
    { value: 'all', label: 'All Customers' },
    { value: 'new_customer', label: 'New Customers' },
    { value: 'returning_customer', label: 'Returning Customers' },
    { value: 'vip', label: 'VIP Customers' },
    { value: 'loyalty_member', label: 'Loyalty Members' },
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
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async () => {
    try {
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

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const action = currentStatus === 'active' ? 'deactivate' : 'activate';
      await togglePricingStatus({ id, action }).unwrap();
      toast.success(`Pricing rule ${action}d successfully`);
      refetch();
    } catch (error) {
      toast.error(error.data?.message || 'Failed to toggle pricing status');
    }
  };

  const resetForm = () => {
    setFormData({
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

  const formatCurrency = (amount) => `$${amount?.toFixed(2) || '0.00'}`;

  const PricingRulesTab = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">Pricing Rules</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{ borderRadius: 2 }}
        >
          Create Rule
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Discount</TableCell>
              <TableCell>Schedule</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Performance</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pricingRules?.data?.map((rule) => (
              <TableRow key={rule._id}>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {rule.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Priority: {rule.priority}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={rule.pricingType.replace('_', ' ')}
                    variant="outlined"
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {rule.pricingRules.discountType === 'percentage' 
                      ? `${rule.pricingRules.discountValue}%`
                      : formatCurrency(rule.pricingRules.discountValue)
                    }
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {new Date(rule.schedule.startDate).toLocaleDateString()}
                    <br />
                    to {new Date(rule.schedule.endDate).toLocaleDateString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={rule.status}
                    color={getStatusColor(rule.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    Sales: {rule.performance?.totalSales || 0}
                    <br />
                    Revenue: {formatCurrency(rule.performance?.totalRevenue)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Tooltip title="Edit">
                    <IconButton onClick={() => handleEdit(rule)} size="small">
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={rule.status === 'active' ? 'Pause' : 'Activate'}>
                    <IconButton 
                      onClick={() => handleToggleStatus(rule._id, rule.status)}
                      size="small"
                    >
                      {rule.status === 'active' ? <PauseIcon /> : <ActivateIcon />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton 
                      onClick={() => handleDelete(rule._id)}
                      size="small"
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const AnalyticsTab = () => (
    <Box>
      <Typography variant="h6" sx={{ mb: 3 }}>Pricing Analytics</Typography>
      
      {analytics?.data && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Overall Performance
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Total Rules:</Typography>
                  <Typography fontWeight="bold">
                    {analytics.data.overall.totalRules}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Total Revenue:</Typography>
                  <Typography fontWeight="bold">
                    {formatCurrency(analytics.data.overall.totalRevenue)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Total Sales:</Typography>
                  <Typography fontWeight="bold">
                    {analytics.data.overall.totalSales}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Avg Conversion:</Typography>
                  <Typography fontWeight="bold">
                    {(analytics.data.overall.avgConversionRate * 100).toFixed(1)}%
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Performance by Type
                </Typography>
                {analytics.data.byType?.map((type) => (
                  <Box key={type._id} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" textTransform="capitalize">
                        {type._id.replace('_', ' ')}
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {formatCurrency(type.totalRevenue)}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(type.totalRevenue / analytics.data.overall.totalRevenue) * 100}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );

  const SurgeRecommendationsTab = () => (
    <Box>
      <Typography variant="h6" sx={{ mb: 3 }}>Surge Pricing Recommendations</Typography>
      
      {surgeRecommendations?.data && (
        <Grid container spacing={2}>
          {surgeRecommendations.data.map((rec) => (
            <Grid item xs={12} md={6} lg={4} key={rec.product.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      {rec.product.name}
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Current Price: {formatCurrency(rec.product.currentPrice)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Stock: {rec.product.stock} units
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Demand: {rec.demand.total} events
                      </Typography>
                    </Box>
                    
                    <Box sx={{ bgcolor: 'primary.50', p: 2, borderRadius: 1, mb: 2 }}>
                      <Typography variant="body2" fontWeight="bold" color="primary.main">
                        Recommended Price: {formatCurrency(rec.recommendation.recommendedPrice)}
                      </Typography>
                      <Typography variant="body2" color="success.main">
                        +{rec.recommendation.increasePercentage}% increase
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      {rec.recommendation.reasoning.map((reason, index) => (
                        <Typography key={index} variant="body2" color="text.secondary">
                          • {reason}
                        </Typography>
                      ))}
                    </Box>
                    
                    <Button
                      variant="contained"
                      size="small"
                      fullWidth
                      onClick={() => {
                        // Pre-fill form with surge pricing recommendation
                        setFormData({
                          ...formData,
                          name: `Surge Pricing - ${rec.product.name}`,
                          pricingType: 'surge_pricing',
                          targets: {
                            products: [rec.product.id],
                            categories: [],
                            userSegments: ['all']
                          },
                          pricingRules: {
                            discountType: 'percentage',
                            discountValue: -rec.recommendation.increasePercentage,
                            surgeFactor: rec.recommendation.surgeFactor
                          }
                        });
                        setOpenDialog(true);
                      }}
                    >
                      Apply Surge Pricing
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
          Dynamic Pricing Management
        </Typography>

        <Paper sx={{ borderRadius: 2 }}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Pricing Rules" />
            <Tab label="Analytics" />
            <Tab label="Surge Recommendations" />
          </Tabs>

          <Box sx={{ p: 3 }}>
            {tabValue === 0 && <PricingRulesTab />}
            {tabValue === 1 && <AnalyticsTab />}
            {tabValue === 2 && <SurgeRecommendationsTab />}
          </Box>
        </Paper>

        {/* Create/Edit Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={() => setOpenDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {editingRule ? 'Edit Pricing Rule' : 'Create Pricing Rule'}
          </DialogTitle>
          
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Rule Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  sx={{ mb: 2 }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={2}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  sx={{ mb: 2 }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Pricing Type</InputLabel>
                  <Select
                    value={formData.pricingType}
                    onChange={(e) => handleInputChange('pricingType', e.target.value)}
                    label="Pricing Type"
                  >
                    {pricingTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Discount Type</InputLabel>
                  <Select
                    value={formData.pricingRules.discountType}
                    onChange={(e) => handleInputChange('pricingRules.discountType', e.target.value)}
                    label="Discount Type"
                  >
                    {discountTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Discount Value"
                  type="number"
                  value={formData.pricingRules.discountValue}
                  onChange={(e) => handleInputChange('pricingRules.discountValue', parseFloat(e.target.value))}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Priority (1-10)"
                  type="number"
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', parseInt(e.target.value))}
                  inputProps={{ min: 1, max: 10 }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <DateTimePicker
                  label="Start Date"
                  value={formData.schedule.startDate}
                  onChange={(date) => handleInputChange('schedule.startDate', date)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <DateTimePicker
                  label="End Date"
                  value={formData.schedule.endDate}
                  onChange={(date) => handleInputChange('schedule.endDate', date)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleSubmit}
              variant="contained"
              sx={{ borderRadius: 2 }}
            >
              {editingRule ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default AdminDynamicPricing;