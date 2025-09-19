import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Divider,
  Chip,
  Alert,
  CircularProgress,
  Link,
} from "@mui/material";
import { LocalShipping, CheckCircle, Pending, Cancel, Info } from "@mui/icons-material";
import { useTrackOrderByNumberQuery } from "../redux/api/trackingApiSlice";

const TrackOrder = () => {
  const [trackingNumber, setTrackingNumber] = useState("");
  const { data: orderStatus, isLoading, isError, error, refetch } = useTrackOrderByNumberQuery(trackingNumber, {
    skip: !trackingNumber,
  });

  const handleTrackOrder = (e) => {
    e.preventDefault();
    if (!trackingNumber.trim()) {
      return;
    }
    refetch();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Delivered":
        return <CheckCircle color="success" />;
      case "Out for Delivery":
        return <Pending color="primary" />;
      case "Shipped":
        return <Pending color="primary" />;
      case "Packed":
        return <Pending color="primary" />;
      case "Confirmed":
        return <Pending color="primary" />;
      case "Placed":
        return <Pending color="disabled" />;
      default:
        return <Info color="disabled" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "success";
      case "Out for Delivery":
        return "primary";
      case "Shipped":
        return "primary";
      case "Packed":
        return "primary";
      case "Confirmed":
        return "primary";
      case "Placed":
        return "default";
      default:
        return "default";
    }
  };

  // Map order status to step status
  const mapOrderStatusToStep = (orderStatus, stepStatus) => {
    const statusOrder = ["Placed", "Confirmed", "Packed", "Shipped", "Out for Delivery", "Delivered"];
    const currentStatusIndex = statusOrder.indexOf(orderStatus);
    const stepStatusIndex = statusOrder.indexOf(stepStatus);
    
    if (stepStatusIndex < currentStatusIndex) return "completed";
    if (stepStatusIndex === currentStatusIndex) return "current";
    return "pending";
  };

  // Create steps based on order timeline
  const createStepsFromTimeline = (timeline) => {
    if (!timeline || timeline.length === 0) return [];
    
    return timeline.map(event => ({
      id: event.status,
      label: event.status,
      description: event.description,
      date: new Date(event.timestamp).toLocaleString(),
      status: "completed" // All timeline events are completed
    }));
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: { xs: 4, md: 8 },
        px: { xs: 2, md: 4 },
        background: "linear-gradient(135deg, #f3e7e9 0%, #e3eeff 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          maxWidth: 900,
          width: "100%",
          mx: "auto",
          p: { xs: 3, md: 5 },
          borderRadius: 4,
          boxShadow: "0 8px 32px 0 rgba(236,72,153,0.15)",
          background: "#fff",
        }}
      >
        <Typography
          variant="h3"
          fontWeight="bold"
          sx={{
            color: "#ec4899",
            mb: 2,
            letterSpacing: 0.5,
            textAlign: { xs: "center", md: "left" },
          }}
        >
          Track Your Order
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{ color: "#6366f1", mb: 4, textAlign: { xs: "center", md: "left" } }}
        >
          Enter your tracking number to get real-time updates on your order
        </Typography>

        <Box component="form" onSubmit={handleTrackOrder} sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
            <TextField
              fullWidth
              label="Tracking Number"
              placeholder="Enter your tracking number (e.g., ORD-2024-001234)"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              variant="outlined"
              sx={{ flex: 1 }}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : <LocalShipping />}
              sx={{
                px: 4,
                py: 1.5,
                bgcolor: "primary.main",
                "&:hover": { bgcolor: "primary.dark" },
                height: '56px'
              }}
            >
              {isLoading ? "Tracking..." : "Track Order"}
            </Button>
          </Box>
          {isError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error?.data?.error || "Failed to fetch order status. Please try again."}
            </Alert>
          )}
        </Box>

        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {orderStatus && !isLoading && (
          <>
            <Divider sx={{ my: 4 }} />
            
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
                Order Status
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                <Chip 
                  icon={<LocalShipping />} 
                  label={`Order #${orderStatus.orderNumber}`} 
                  color="primary" 
                  variant="outlined" 
                />
                <Chip 
                  label={`Status: ${orderStatus.status}`} 
                  color={getStatusColor(orderStatus.status)} 
                  variant="outlined" 
                />
                {orderStatus.estimatedDelivery && (
                  <Chip 
                    label={`Est. Delivery: ${new Date(orderStatus.estimatedDelivery).toLocaleDateString()}`} 
                    color="success" 
                    variant="outlined" 
                  />
                )}
              </Box>
              
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  Order Progress
                </Typography>
                <Stepper orientation="vertical" activeStep={-1}>
                  {orderStatus.timeline && orderStatus.timeline.length > 0 ? (
                    createStepsFromTimeline(orderStatus.timeline).map((step, index) => (
                      <Step key={step.id} active={step.status === "current"} completed={step.status === "completed"}>
                        <StepLabel 
                          StepIconComponent={() => getStatusIcon(step.status)}
                          sx={{ 
                            '& .MuiStepLabel-label': { 
                              fontWeight: step.status === "current" ? 'bold' : 'normal',
                              color: step.status === "completed" ? 'success.main' : 
                                     step.status === "current" ? 'primary.main' : 'text.secondary'
                            }
                          }}
                        >
                          {step.label}
                        </StepLabel>
                        <StepContent>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            {step.description}
                          </Typography>
                          {step.date && (
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {step.date}
                            </Typography>
                          )}
                        </StepContent>
                      </Step>
                    ))
                  ) : (
                    <Alert severity="info">No tracking events available yet</Alert>
                  )}
                </Stepper>
              </Box>
              
              {orderStatus.shippingAddress && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                  <Box sx={{ flex: 1, minWidth: 250 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                      Shipping Address
                    </Typography>
                    <Typography variant="body1">
                      {orderStatus.shippingAddress}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </>
        )}

        {!orderStatus && !isLoading && !isError && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <LocalShipping sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 2 }}>
              Track Your Order
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
              Enter your tracking number above to see the current status of your order.
            </Typography>
            <Box sx={{ textAlign: 'left', maxWidth: 500, mx: 'auto' }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                Where to find your tracking number:
              </Typography>
              <ul>
                <li>
                  <Typography variant="body2">
                    Check your order confirmation email for the tracking number
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    Log into your account and go to "My Orders" to find tracking information
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    Tracking numbers typically follow the format: ORD-YYYY-XXXXXX
                  </Typography>
                </li>
              </ul>
            </Box>
          </Box>
        )}

        <Box sx={{ mt: 4, p: 3, bgcolor: '#f0f8ff', borderRadius: 2 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: "#333" }}>
            Need Help With Your Order?
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            If you're having trouble tracking your order or have questions about your delivery, please contact our customer support team:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box>
              <Typography variant="subtitle2">Email Support</Typography>
              <Link href="mailto:support@nexusmart.com">support@nexusmart.com</Link>
            </Box>
            <Box>
              <Typography variant="subtitle2">Phone Support</Typography>
              <Link href="tel:+18001234567">1-800-NEXUS-MART</Link>
            </Box>
            <Box>
              <Typography variant="subtitle2">Live Chat</Typography>
              <Link href="/support/chat">Start a live chat</Link>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default TrackOrder;