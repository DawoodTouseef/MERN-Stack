import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
} from "@mui/material";
import { ExpandMore, CheckCircle, ErrorOutline, AccessTime } from "@mui/icons-material";

const Returns = () => {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
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
          Returns & Exchanges
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{ color: "#6366f1", mb: 4, textAlign: { xs: "center", md: "left" } }}
        >
          Our hassle-free return and exchange policy
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 2, color: "#333" }}>
            Return Policy Overview
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, color: "#555" }}>
            At Nexus Mart, we want you to be completely satisfied with your purchase. If for any reason you're not happy with your item, you can return it within 30 days of delivery for a full refund or exchange.
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
            <Chip icon={<CheckCircle />} label="30-Day Returns" color="success" variant="outlined" />
            <Chip icon={<CheckCircle />} label="Free Returns" color="success" variant="outlined" />
            <Chip icon={<CheckCircle />} label="No Questions Asked" color="success" variant="outlined" />
          </Box>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')} sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: '#f8f9fa' }}>
            <Typography variant="h6" fontWeight="bold">Eligibility for Returns</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="Items must be in original condition" 
                  secondary="Unused, unwashed, and with all original tags attached" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="Original packaging included" 
                  secondary="All original boxes, bags, and documentation must be included" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="Within 30 days of delivery" 
                  secondary="Returns must be initiated within 30 days of receiving your order" 
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion expanded={expanded === 'panel2'} onChange={handleChange('panel2')} sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: '#f8f9fa' }}>
            <Typography variant="h6" fontWeight="bold">Non-Returnable Items</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              <ListItem>
                <ListItemIcon>
                  <ErrorOutline color="error" />
                </ListItemIcon>
                <ListItemText 
                  primary="Personal care items" 
                  secondary="Undergarments, swimwear, cosmetics, and other hygiene-related products" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <ErrorOutline color="error" />
                </ListItemIcon>
                <ListItemText 
                  primary="Digital products" 
                  secondary="Software, e-books, digital downloads, and gift cards" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <ErrorOutline color="error" />
                </ListItemIcon>
                <ListItemText 
                  primary="Custom or personalized items" 
                  secondary="Products made to your specifications or personalized with your information" 
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion expanded={expanded === 'panel3'} onChange={handleChange('panel3')} sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: '#f8f9fa' }}>
            <Typography variant="h6" fontWeight="bold">Return Process</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              <ListItem>
                <ListItemIcon>
                  <AccessTime color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Step 1: Initiate Return" 
                  secondary="Log into your account, go to 'My Orders', select the item, and click 'Return Item'" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <AccessTime color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Step 2: Print Return Label" 
                  secondary="We'll email you a prepaid return shipping label (where applicable)" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <AccessTime color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Step 3: Package Item" 
                  secondary="Securely pack the item in its original packaging with all accessories" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <AccessTime color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Step 4: Ship Item" 
                  secondary="Drop off the package at the nearest shipping location" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <AccessTime color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Step 5: Receive Refund" 
                  secondary="Once we receive and inspect the item, we'll process your refund within 5-7 business days" 
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion expanded={expanded === 'panel4'} onChange={handleChange('panel4')} sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: '#f8f9fa' }}>
            <Typography variant="h6" fontWeight="bold">Exchanges</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ mb: 2 }}>
              If you'd like to exchange an item for a different size, color, or style, you can do so within 30 days of delivery.
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="Same Item Exchange" 
                  secondary="Exchange for the same item in a different size or color at no additional cost" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="Different Item Exchange" 
                  secondary="Exchange for a different item with price adjustment if applicable" 
                />
              </ListItem>
            </List>
            <Typography variant="body1" sx={{ mt: 2 }}>
              To initiate an exchange, follow the same return process and indicate in the return form that you'd like an exchange instead of a refund.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion expanded={expanded === 'panel5'} onChange={handleChange('panel5')} sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: '#f8f9fa' }}>
            <Typography variant="h6" fontWeight="bold">Refunds</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Refunds are processed within 5-7 business days after we receive your returned item.
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="Original Payment Method" 
                  secondary="Refunds will be issued to your original payment method" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="Store Credit" 
                  secondary="You can also choose to receive store credit for faster processing" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="Shipping Costs" 
                  secondary="Return shipping is free for defective items. For other returns, original shipping costs are non-refundable" 
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Box sx={{ mt: 4, p: 3, bgcolor: '#f0f8ff', borderRadius: 2 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: "#333" }}>
            Need Help?
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            If you have any questions about our return policy or need assistance with a return, please contact our customer support team:
          </Typography>
          <List>
            <ListItem>
              <ListItemText 
                primary="Email" 
                secondary={<Link href="mailto:support@nexusmart.com">support@nexusmart.com</Link>} 
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Phone" 
                secondary={<Link href="tel:+18001234567">1-800-NEXUS-MART</Link>} 
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Live Chat" 
                secondary={<Link href="/support/chat">Start a live chat</Link>} 
              />
            </ListItem>
          </List>
        </Box>
      </Paper>
    </Box>
  );
};

export default Returns;