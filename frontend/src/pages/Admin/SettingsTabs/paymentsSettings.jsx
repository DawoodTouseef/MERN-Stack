import { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Stack,
  Alert,
  InputAdornment,
  Divider,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
  Grid,
  Link
} from "@mui/material";
import {
  Payment as PaymentIcon,
  Lock as LockIcon,
  CheckCircle as CheckCircleIcon,
  ExpandMore as ExpandMoreIcon,
  Key as KeyIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  CreditCard as StripeIcon,
  AccountBalanceWallet as WalletIcon,
  Euro as CurrencyIcon
} from "@mui/icons-material";
import { toast } from "react-toastify";
import {
  useGetPaymentGatewaysQuery,
  useUpdatePaymentGatewayMutation
} from "../../../redux/api/paymentApiSlice";
import Loader from "../../../components/Loader";
import Message from "../../../components/Message";

const GatewayConfigForm = ({ gateway, onUpdate }) => {
  const [formData, setFormData] = useState({
    isActive: gateway.isActive,
    ...gateway.configuration
  });
  const [showSecret, setShowSecret] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setFormData({
      isActive: gateway.isActive,
      ...gateway.configuration
    });
    setIsDirty(false);
  }, [gateway]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSave = () => {
    onUpdate(gateway._id, formData);
    setIsDirty(false);
  };

  const renderFields = () => {
    switch (gateway.name) {
      case 'stripe':
        return (
          <>
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                Manage your API keys in the <Link href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener">Stripe Dashboard</Link>.
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Publishable Key"
                value={formData.publicKey || ''}
                onChange={(e) => handleChange('publicKey', e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><KeyIcon color="action" /></InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Secret Key"
                type={showSecret ? "text" : "password"}
                value={formData.secretKey || ''}
                onChange={(e) => handleChange('secretKey', e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><LockIcon color="action" /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button onClick={() => setShowSecret(!showSecret)}>
                        {showSecret ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </Button>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Webhook Secret"
                type={showSecret ? "text" : "password"}
                value={formData.webhookSecret || ''}
                onChange={(e) => handleChange('webhookSecret', e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><LockIcon color="action" /></InputAdornment>,
                }}
              />
            </Grid>
          </>
        );
      case 'razorpay':
        return (
          <>
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                Manage your API keys in the <Link href="https://dashboard.razorpay.com/#/app/keys" target="_blank" rel="noopener">Razorpay Dashboard</Link>.
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Key ID (Public Key)"
                value={formData.publicKey || ''}
                onChange={(e) => handleChange('publicKey', e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><KeyIcon color="action" /></InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Key Secret"
                type={showSecret ? "text" : "password"}
                value={formData.secretKey || ''}
                onChange={(e) => handleChange('secretKey', e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><LockIcon color="action" /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button onClick={() => setShowSecret(!showSecret)}>
                        {showSecret ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </Button>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Webhook Secret"
                type={showSecret ? "text" : "password"}
                value={formData.webhookSecret || ''}
                onChange={(e) => handleChange('webhookSecret', e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><LockIcon color="action" /></InputAdornment>,
                }}
              />
            </Grid>
          </>
        );
      case 'paypal':
        return (
          <>
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                Manage your apps in the <Link href="https://developer.paypal.com/dashboard/applications/live" target="_blank" rel="noopener">PayPal Developer Dashboard</Link>.
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Client ID"
                value={formData.publicKey || ''}
                onChange={(e) => handleChange('publicKey', e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><KeyIcon color="action" /></InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Client Secret"
                type={showSecret ? "text" : "password"}
                value={formData.secretKey || ''}
                onChange={(e) => handleChange('secretKey', e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><LockIcon color="action" /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button onClick={() => setShowSecret(!showSecret)}>
                        {showSecret ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </Button>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Webhook ID"
                value={formData.webhookSecret || ''}
                onChange={(e) => handleChange('webhookSecret', e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><KeyIcon color="action" /></InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.environment === 'sandbox'}
                    onChange={(e) => handleChange('environment', e.target.checked ? 'sandbox' : 'production')}
                  />
                }
                label={`Environment: ${formData.environment === 'sandbox' ? 'Sandbox' : 'Production'}`}
              />
            </Grid>
          </>
        );
      default:
        return <Typography color="text.secondary">No configuration available for this gateway.</Typography>;
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={(e) => handleChange('isActive', e.target.checked)}
                color="success"
              />
            }
            label={formData.isActive ? "Active" : "Inactive"}
          />
          <Button
            variant="contained"
            disabled={!isDirty}
            onClick={handleSave}
            sx={{ px: 4, borderRadius: 2 }}
          >
            Save Changes
          </Button>
        </Box>

        <Divider />

        <Grid container spacing={3}>
          {renderFields()}
        </Grid>
      </Stack>
    </Box>
  );
};

const PaymentsSettings = () => {
  const { data: gateways, isLoading, isError, error } = useGetPaymentGatewaysQuery();
  const [updatePaymentGateway, { isLoading: isUpdating }] = useUpdatePaymentGatewayMutation();
  console.log(gateways);
  const handleUpdateGateway = async (id, updatedData) => {
    try {
      // Separate isActive from configuration
      const { isActive, ...configuration } = updatedData;

      await updatePaymentGateway({
        id,
        isActive,
        configuration
      }).unwrap();
      toast.success("Gateway configuration updated successfully");
    } catch (err) {
      toast.error(err?.data?.message || err.error || "Failed to update gateway");
    }
  };

  const getIcon = (name) => {
    switch (name) {
      case 'stripe': return <StripeIcon />;
      case 'razorpay': return <WalletIcon />;
      case 'paypal': return <PaymentIcon />;
      default: return <PaymentIcon />;
    }
  };

  if (isLoading) return <Loader />;
  if (isError) return <Message variant="danger">{error?.data?.message || error.error || "Failed to load setttings"}</Message>;

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 4, borderRadius: 3 }}>
        Configure your payment gateways below. Ensure you have the correct API credentials from your provider's dashboard.
        <br />
        <strong>Note:</strong> Active gateways will be immediately available to customers at checkout.
      </Alert>

      {gateways?.gateways?.map((gateway) => (
        <Accordion key={gateway._id} sx={{ mb: 2, borderRadius: 2, '&:before': { display: 'none' }, border: '1px solid #e2e8f0' }} elevation={0}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ color: 'primary.main' }}>
                {getIcon(gateway.name)}
              </Box>
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  {gateway.displayName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {gateway.isActive ? 'Enabled' : 'Disabled'} • {gateway.supportedMethods.join(', ')}
                </Typography>
              </Box>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <GatewayConfigForm gateway={gateway} onUpdate={handleUpdateGateway} />
          </AccordionDetails>
        </Accordion>
      ))}

      {isUpdating && (
        <Box sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999 }}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};

export default PaymentsSettings;
