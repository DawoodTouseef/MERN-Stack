import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Fade,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  CreditCard,
  AccountBalance,
  PhoneAndroid,
  Wallet,
  Security,
  CheckCircle,
  Error as ErrorIcon,
  Warning
} from '@mui/icons-material';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCreatePaymentIntentMutation, useGetPaymentMethodsQuery } from '../redux/api/paymentApiSlice';
import { toast } from 'react-toastify';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const PaymentMethodCard = ({ method, selected, onSelect, fraudScore }) => {
  const theme = useTheme();
  
  const getMethodIcon = (methodType) => {
    switch (methodType) {
      case 'credit_card':
      case 'debit_card':
        return <CreditCard />;
      case 'net_banking':
        return <AccountBalance />;
      case 'upi':
        return <PhoneAndroid />;
      case 'wallet':
        return <Wallet />;
      default:
        return <CreditCard />;
    }
  };

  const getMethodColor = (methodType) => {
    switch (methodType) {
      case 'credit_card':
        return '#1976d2';
      case 'debit_card':
        return '#388e3c';
      case 'upi':
        return '#ff9800';
      case 'net_banking':
        return '#7b1fa2';
      case 'wallet':
        return '#f57c00';
      default:
        return theme.palette.primary.main;
    }
  };

  return (
    <Card
      sx={{
        cursor: 'pointer',
        border: selected ? `2px solid ${theme.palette.primary.main}` : '1px solid #e0e0e0',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: theme.shadows[4],
          transform: 'translateY(-2px)'
        },
        position: 'relative'
      }}
      onClick={() => onSelect(method)}
    >
      <CardContent sx={{ p: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <Box sx={{ color: getMethodColor(method.method) }}>
              {getMethodIcon(method.method)}
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight="bold">
                {method.displayName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {method.method.replace('_', ' ').toUpperCase()}
              </Typography>
            </Box>
          </Box>
          
          {fraudScore > 70 && (
            <Chip
              icon={<Warning />}
              label="Requires Verification"
              size="small"
              color="warning"
            />
          )}
        </Box>
        
        <Box mt={1}>
          <Typography variant="caption" color="text.secondary">
            Fee: {method.fees.domestic.percentage}% + ₹{method.fees.domestic.fixed}
          </Typography>
        </Box>
        
        {selected && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: theme.palette.primary.main
            }}
          >
            <CheckCircle fontSize="small" />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const StripePaymentForm = ({ onSuccess, onError, paymentData }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) return;
    
    setProcessing(true);
    
    try {
      const cardElement = elements.getElement(CardElement);
      
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: paymentData.customerInfo.name,
          email: paymentData.customerInfo.email,
          address: paymentData.billingAddress
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      const { error: confirmError } = await stripe.confirmCardPayment(
        paymentData.clientSecret,
        {
          payment_method: paymentMethod.id
        }
      );

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      onSuccess(paymentMethod);
    } catch (error) {
      onError(error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, mb: 2 }}>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
            },
          }}
        />
      </Box>
      
      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={!stripe || processing}
        startIcon={processing ? <CircularProgress size={20} /> : <Security />}
      >
        {processing ? 'Processing...' : `Pay ₹${paymentData.amount}`}
      </Button>
    </form>
  );
};

const RazorpayPaymentForm = ({ onSuccess, onError, paymentData }) => {
  const [processing, setProcessing] = useState(false);

  const handleRazorpayPayment = async () => {
    setProcessing(true);
    
    try {
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: paymentData.amount * 100,
        currency: paymentData.currency,
        name: 'Nexus Mart',
        description: `Order Payment - ${paymentData.orderId}`,
        order_id: paymentData.gatewayTransactionId,
        handler: function (response) {
          onSuccess(response);
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
            onError(new Error('Payment cancelled'));
          }
        },
        prefill: {
          name: paymentData.customerInfo.name,
          email: paymentData.customerInfo.email
        },
        theme: {
          color: '#1976d2'
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      onError(error);
      setProcessing(false);
    }
  };

  return (
    <Button
      onClick={handleRazorpayPayment}
      variant="contained"
      fullWidth
      disabled={processing}
      startIcon={processing ? <CircularProgress size={20} /> : <Security />}
    >
      {processing ? 'Opening Razorpay...' : `Pay ₹${paymentData.amount}`}
    </Button>
  );
};

const PaymentGateway = ({ 
  orderId, 
  amount, 
  currency = 'INR', 
  onSuccess, 
  onError,
  billingAddress,
  customerInfo 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [fraudScore, setFraudScore] = useState(0);
  const [deviceFingerprint, setDeviceFingerprint] = useState('');
  
  const { data: paymentMethods, isLoading: methodsLoading } = useGetPaymentMethodsQuery();
  const [createPaymentIntent, { isLoading: intentLoading }] = useCreatePaymentIntentMutation();

  const steps = ['Select Payment Method', 'Enter Details', 'Confirm Payment'];

  useEffect(() => {
    // Generate device fingerprint
    const generateFingerprint = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint', 2, 2);
      
      const fingerprint = canvas.toDataURL().slice(-50) + 
        navigator.userAgent.slice(-20) + 
        screen.width + 'x' + screen.height;
      
      setDeviceFingerprint(btoa(fingerprint).slice(0, 32));
    };

    generateFingerprint();
  }, []);

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    setCurrentStep(1);
  };

  const handlePaymentSubmit = async () => {
    if (!selectedMethod) return;

    try {
      setCurrentStep(2);
      
      const paymentData = {
        amount,
        currency,
        gateway: selectedMethod.gateway,
        paymentMethod: selectedMethod.method,
        orderId,
        billingAddress,
        deviceFingerprint,
        metadata: {
          userAgent: navigator.userAgent,
          timestamp: Date.now()
        }
      };

      const result = await createPaymentIntent(paymentData).unwrap();
      
      setFraudScore(result.fraudScore);

      if (result.fraudScore > 80) {
        throw new Error('Transaction blocked due to fraud detection');
      }

      // Handle different gateways
      if (selectedMethod.gateway === 'stripe') {
        // Stripe payment will be handled by StripePaymentForm
        return result;
      } else if (selectedMethod.gateway === 'razorpay') {
        // Razorpay payment will be handled by RazorpayPaymentForm
        return result;
      }
    } catch (error) {
      onError(error);
      setCurrentStep(1);
    }
  };

  const handlePaymentSuccess = (paymentResult) => {
    setCurrentStep(3);
    onSuccess({
      ...paymentResult,
      method: selectedMethod,
      fraudScore
    });
  };

  const handlePaymentError = (error) => {
    onError(error);
    setCurrentStep(1);
  };

  if (methodsLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Progress Stepper */}
      <Stepper activeStep={currentStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Fraud Score Alert */}
      {fraudScore > 50 && (
        <Alert 
          severity={fraudScore > 80 ? 'error' : 'warning'} 
          sx={{ mb: 3 }}
          icon={fraudScore > 80 ? <ErrorIcon /> : <Warning />}
        >
          {fraudScore > 80 
            ? 'Transaction has been blocked due to security concerns'
            : 'Additional verification may be required for this transaction'
          }
        </Alert>
      )}

      {/* Step 1: Payment Method Selection */}
      {currentStep === 0 && (
        <Fade in={true}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Choose Payment Method
            </Typography>
            
            <Grid container spacing={2}>
              {paymentMethods?.paymentMethods?.map((method, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <PaymentMethodCard
                    method={method}
                    selected={selectedMethod?.gateway === method.gateway && selectedMethod?.method === method.method}
                    onSelect={handleMethodSelect}
                    fraudScore={fraudScore}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        </Fade>
      )}

      {/* Step 2: Payment Details */}
      {currentStep === 1 && selectedMethod && (
        <Fade in={true}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Payment Details
            </Typography>
            
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Selected Method: {selectedMethod.displayName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Amount: ₹{amount} | Fee: {selectedMethod.fees.domestic.percentage}%
                </Typography>
              </CardContent>
            </Card>

            {selectedMethod.gateway === 'stripe' && (
              <Elements stripe={stripePromise}>
                <StripePaymentForm
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  paymentData={{
                    amount,
                    currency,
                    orderId,
                    customerInfo,
                    billingAddress,
                    clientSecret: null // This would come from the payment intent
                  }}
                />
              </Elements>
            )}

            {selectedMethod.gateway === 'razorpay' && (
              <RazorpayPaymentForm
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                paymentData={{
                  amount,
                  currency,
                  orderId,
                  customerInfo,
                  gatewayTransactionId: null // This would come from the payment intent
                }}
              />
            )}

            <Box mt={2}>
              <Button
                variant="outlined"
                onClick={() => setCurrentStep(0)}
                sx={{ mr: 1 }}
              >
                Back
              </Button>
            </Box>
          </Box>
        </Fade>
      )}

      {/* Step 3: Payment Confirmation */}
      {currentStep === 2 && (
        <Fade in={true}>
          <Box textAlign="center" p={4}>
            <CircularProgress size={60} sx={{ mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Processing Payment...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please do not close this window
            </Typography>
          </Box>
        </Fade>
      )}
    </Box>
  );
};

export default PaymentGateway;