import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControlLabel,
  Grid,
  MenuItem,
  Switch,
  TextField,
  Typography,
  Chip,
} from '@mui/material';
import { toast } from 'react-toastify';
import { useGetPaymentGatewaysQuery, useUpdatePaymentGatewayMutation } from '../../../redux/api/paymentApiSlice';

const supportedGateways = ['upi', 'paypal', 'stripe', 'razorpay'];

const PaymentSettings = () => {
  const { data, isLoading, refetch } = useGetPaymentGatewaysQuery();
  const [updateGateway, { isLoading: isUpdating }] = useUpdatePaymentGatewayMutation();
  const [drafts, setDrafts] = useState({});

  const gateways = useMemo(() => {
    const list = data?.gateways || [];
    return supportedGateways
      .map((name) => list.find((g) => g.name === name))
      .filter(Boolean);
  }, [data]);

  const getDraft = (gateway) => {
    const local = drafts[gateway._id] || {};
    return {
      displayName: local.displayName ?? gateway.displayName ?? '',
      isActive: local.isActive ?? gateway.isActive ?? false,
      merchantId: local.merchantId ?? gateway.configuration?.merchantId ?? '',
      publicKey: local.publicKey ?? gateway.configuration?.publicKey ?? '',
      secretKey: local.secretKey ?? '',
      webhookSecret: local.webhookSecret ?? '',
      environment: local.environment ?? gateway.configuration?.environment ?? 'sandbox',
    };
  };

  const updateDraft = (gatewayId, patch) => {
    setDrafts((prev) => ({ ...prev, [gatewayId]: { ...(prev[gatewayId] || {}), ...patch } }));
  };

  const handleSave = async (gateway) => {
    const draft = getDraft(gateway);
    try {
      await updateGateway({
        id: gateway._id,
        displayName: draft.displayName,
        isActive: draft.isActive,
        configuration: {
          merchantId: draft.merchantId,
          publicKey: draft.publicKey,
          secretKey: draft.secretKey,
          webhookSecret: draft.webhookSecret,
          environment: draft.environment,
        },
      }).unwrap();

      toast.success(`${gateway.displayName} settings updated`);
      setDrafts((prev) => ({ ...prev, [gateway._id]: { ...prev[gateway._id], secretKey: '', webhookSecret: '' } }));
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update gateway settings');
    }
  };

  if (isLoading) {
    return <Typography>Loading payment gateways...</Typography>;
  }

  return (
    <Box>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Manage supported payment gateways (UPI, PayPal, Stripe, Razorpay): enable/disable each gateway and configure API/authentication keys.
      </Typography>
      <Grid container spacing={2}>
        {gateways.map((gateway) => {
          const draft = getDraft(gateway);
          return (
            <Grid item xs={12} key={gateway._id}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6">{gateway.displayName}</Typography>
                      <Chip size="small" label={gateway.name.toUpperCase()} />
                    </Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={draft.isActive}
                          onChange={(e) => updateDraft(gateway._id, { isActive: e.target.checked })}
                        />
                      }
                      label={draft.isActive ? 'Enabled' : 'Disabled'}
                    />
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Display Name"
                        value={draft.displayName}
                        onChange={(e) => updateDraft(gateway._id, { displayName: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        select
                        fullWidth
                        label="Environment"
                        value={draft.environment}
                        onChange={(e) => updateDraft(gateway._id, { environment: e.target.value })}
                      >
                        <MenuItem value="sandbox">Sandbox</MenuItem>
                        <MenuItem value="production">Production</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Merchant ID"
                        value={draft.merchantId}
                        onChange={(e) => updateDraft(gateway._id, { merchantId: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Public Key / Key ID"
                        value={draft.publicKey}
                        onChange={(e) => updateDraft(gateway._id, { publicKey: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        type="password"
                        label="Secret Key (leave blank to keep existing)"
                        value={draft.secretKey}
                        onChange={(e) => updateDraft(gateway._id, { secretKey: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        type="password"
                        label="Webhook Secret (leave blank to keep existing)"
                        value={draft.webhookSecret}
                        onChange={(e) => updateDraft(gateway._id, { webhookSecret: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button variant="contained" onClick={() => handleSave(gateway)} disabled={isUpdating}>
                        Save {gateway.displayName}
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default PaymentSettings;
