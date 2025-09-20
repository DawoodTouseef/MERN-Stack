import {
  Box,
  Paper,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { useEffect } from "react";

const ShippingPolicy = () => {
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const element = document.getElementById(hash.replace("#", ""));
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, []);

  const sections = [
    { id: "overview", title: "Shipping Overview" },
    { id: "methods", title: "Shipping Methods" },
    { id: "costs", title: "Shipping Costs" },
    { id: "delivery", title: "Delivery Times" },
    { id: "tracking", title: "Order Tracking" },
    { id: "international", title: "International Shipping" },
    { id: "restrictions", title: "Shipping Restrictions" },
    { id: "damaged", title: "Damaged or Lost Packages" },
    { id: "returns", title: "Return Shipping" },
    { id: "changes", title: "Address Changes" },
    { id: "contact", title: "Contact Information" },
  ];

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
          Shipping Policy
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{ color: "#6366f1", mb: 4, textAlign: { xs: "center", md: "left" } }}
        >
          Effective Date: May 27, 2025
        </Typography>

        {/* Table of Contents */}
        <Box sx={{ mb: 4, bgcolor: "#f9fafb", p: 3, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ color: "#18181b", mb: 2 }}>
            Table of Contents
          </Typography>
          <List>
            {sections.map((section, index) => (
              <ListItem key={section.id} sx={{ py: 0.5 }}>
                <a
                  href={`#${section.id}`}
                  style={{
                    color: "#6366f1",
                    textDecoration: "none",
                  }}
                  onMouseOver={(e) => (e.target.style.textDecoration = "underline")}
                  onMouseOut={(e) => (e.target.style.textDecoration = "none")}
                >
                  {`${index + 1}. ${section.title}`}
                </a>
              </ListItem>
            ))}
          </List>
        </Box>

        <Divider sx={{ mb: 4, bgcolor: "#e3eeff" }} />

        {/* Shipping Overview */}
        <Accordion defaultExpanded>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            id="overview"
            sx={{ bgcolor: "#f3e7e9", borderRadius: 1, mb: 1 }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ color: "#18181b" }}>
              1. Shipping Overview
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ color: "#444", mb: 2 }}>
              At Nexus Mart, we strive to deliver your orders quickly and securely. This Shipping Policy outlines our shipping practices, costs, and delivery times to help you understand what to expect when ordering from us.
            </Typography>
            <Typography variant="body1" sx={{ color: "#444" }}>
              By placing an order, you agree to these shipping terms and conditions.
            </Typography>
          </AccordionDetails>
        </Accordion>

        {/* Shipping Methods */}
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            id="methods"
            sx={{ bgcolor: "#f3e7e9", borderRadius: 1, mb: 1 }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ color: "#18181b" }}>
              2. Shipping Methods
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ color: "#444", mb: 2 }}>
              We offer several shipping options to meet your needs:
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Standard Shipping"
                  secondary="Delivered within 5-7 business days. Most cost-effective option."
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Express Shipping"
                  secondary="Delivered within 2-3 business days. Faster delivery for urgent orders."
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Next-Day Delivery"
                  secondary="Delivered the next business day. Available in select metropolitan areas."
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
            </List>
            <Typography variant="body1" sx={{ color: "#444", mt: 2 }}>
              Shipping method availability may vary based on your location and the items in your order.
            </Typography>
          </AccordionDetails>
        </Accordion>

        {/* Shipping Costs */}
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            id="costs"
            sx={{ bgcolor: "#f3e7e9", borderRadius: 1, mb: 1 }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ color: "#18181b" }}>
              3. Shipping Costs
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ color: "#444", mb: 2 }}>
              Our shipping costs are calculated at checkout based on:
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Order value"
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Shipping destination"
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Selected shipping method"
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Package weight and dimensions"
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
            </List>
            
            <TableContainer sx={{ mt: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Order Value</strong></TableCell>
                    <TableCell><strong>Standard Shipping</strong></TableCell>
                    <TableCell><strong>Express Shipping</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Below ₹499</TableCell>
                    <TableCell>₹50</TableCell>
                    <TableCell>₹100</TableCell>
                  </TableRow>
                  <TableRow sx={{ backgroundColor: '#f0f8ff' }}>
                    <TableCell>₹500 - ₹999</TableCell>
                    <TableCell>₹30</TableCell>
                    <TableCell>₹75</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>₹1000 - ₹1999</TableCell>
                    <TableCell>₹15</TableCell>
                    <TableCell>₹50</TableCell>
                  </TableRow>
                  <TableRow sx={{ backgroundColor: '#f0f8ff' }}>
                    <TableCell>Above ₹2000</TableCell>
                    <TableCell>
                      <Chip label="FREE" color="success" size="small" />
                    </TableCell>
                    <TableCell>₹25</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
            
            <Typography variant="body2" sx={{ color: "#666", mt: 2 }}>
              * Next-Day Delivery costs ₹150 and is available for orders above ₹500 in select cities.
            </Typography>
          </AccordionDetails>
        </Accordion>

        {/* Delivery Times */}
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            id="delivery"
            sx={{ bgcolor: "#f3e7e9", borderRadius: 1, mb: 1 }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ color: "#18181b" }}>
              4. Delivery Times
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ color: "#444", mb: 2 }}>
              Estimated delivery times are provided for reference and may vary due to:
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Weather conditions"
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Holidays and weekends"
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Customs clearance (for international orders)"
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Unexpected shipping delays"
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
            </List>
            <Typography variant="body1" sx={{ color: "#444", mt: 2 }}>
              Orders are processed within 1-2 business days. Delivery times begin after processing is complete.
            </Typography>
          </AccordionDetails>
        </Accordion>

        {/* Order Tracking */}
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            id="tracking"
            sx={{ bgcolor: "#f3e7e9", borderRadius: 1, mb: 1 }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ color: "#18181b" }}>
              5. Order Tracking
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ color: "#444", mb: 2 }}>
              Once your order ships, you'll receive a shipping confirmation email with:
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Tracking number"
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Carrier information"
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Estimated delivery date"
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
            </List>
            <Typography variant="body1" sx={{ color: "#444", mt: 2 }}>
              You can track your order status in real-time through your account dashboard or by visiting the carrier's website.
            </Typography>
          </AccordionDetails>
        </Accordion>

        {/* International Shipping */}
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            id="international"
            sx={{ bgcolor: "#f3e7e9", borderRadius: 1, mb: 1 }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ color: "#18181b" }}>
              6. International Shipping
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ color: "#444", mb: 2 }}>
              We ship internationally to selected countries. International shipping rates and delivery times vary by destination.
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Customs and Duties"
                  secondary="International customers are responsible for all customs duties, taxes, and fees imposed by their country."
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Delivery Times"
                  secondary="International delivery typically takes 7-14 business days, depending on the destination."
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Tracking"
                  secondary="Full tracking information is provided for international shipments."
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
            </List>
            <Typography variant="body1" sx={{ color: "#444", mt: 2 }}>
              Some items may be restricted for international shipping due to regulations or size/weight limitations.
            </Typography>
          </AccordionDetails>
        </Accordion>

        {/* Shipping Restrictions */}
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            id="restrictions"
            sx={{ bgcolor: "#f3e7e9", borderRadius: 1, mb: 1 }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ color: "#18181b" }}>
              7. Shipping Restrictions
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ color: "#444", mb: 2 }}>
              Certain items may have shipping restrictions:
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Fragile Items"
                  secondary="Special packaging and handling required. Additional fees may apply."
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Hazardous Materials"
                  secondary="Items containing hazardous materials cannot be shipped."
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Oversized Items"
                  secondary="Large items may require special shipping arrangements."
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
            </List>
            <Typography variant="body1" sx={{ color: "#444", mt: 2 }}>
              We reserve the right to cancel orders that cannot be shipped to your location or contain restricted items.
            </Typography>
          </AccordionDetails>
        </Accordion>

        {/* Damaged or Lost Packages */}
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            id="damaged"
            sx={{ bgcolor: "#f3e7e9", borderRadius: 1, mb: 1 }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ color: "#18181b" }}>
              8. Damaged or Lost Packages
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ color: "#444", mb: 2 }}>
              If your package arrives damaged or is lost during transit:
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Report Immediately"
                  secondary="Contact us within 48 hours of delivery for damaged items or 7 days for missing packages."
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Provide Documentation"
                  secondary="Include photos of damaged items and packaging when reporting issues."
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Resolution Process"
                  secondary="We will work with the carrier to investigate and resolve the issue promptly."
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
            </List>
            <Typography variant="body1" sx={{ color: "#444", mt: 2 }}>
              Refunds or replacements will be processed once the investigation is complete.
            </Typography>
          </AccordionDetails>
        </Accordion>

        {/* Return Shipping */}
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            id="returns"
            sx={{ bgcolor: "#f3e7e9", borderRadius: 1, mb: 1 }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ color: "#18181b" }}>
              9. Return Shipping
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ color: "#444", mb: 2 }}>
              For returns, please refer to our Return Policy. Generally:
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Eligible Returns"
                  secondary="We provide return shipping labels for defective or incorrect items."
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Customer Returns"
                  secondary="Return shipping costs are the customer's responsibility for change of mind returns."
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
            </List>
            <Typography variant="body1" sx={{ color: "#444", mt: 2 }}>
              Return packages must be properly packaged to prevent damage during transit.
            </Typography>
          </AccordionDetails>
        </Accordion>

        {/* Address Changes */}
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            id="changes"
            sx={{ bgcolor: "#f3e7e9", borderRadius: 1, mb: 1 }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ color: "#18181b" }}>
              10. Address Changes
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ color: "#444", mb: 2 }}>
              To change your shipping address:
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Before Shipment"
                  secondary="Contact us immediately. Changes can be made at no additional cost."
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="After Shipment"
                  secondary="Contact the carrier directly with your tracking number to request delivery changes."
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
            </List>
            <Typography variant="body1" sx={{ color: "#444", mt: 2 }}>
              Additional fees may apply for address changes after shipment.
            </Typography>
          </AccordionDetails>
        </Accordion>

        {/* Contact Information */}
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            id="contact"
            sx={{ bgcolor: "#f3e7e9", borderRadius: 1, mb: 1 }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ color: "#18181b" }}>
              11. Contact Information
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ color: "#444", mb: 2 }}>
              For shipping inquiries, contact our Customer Service team:
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Email"
                  secondary="shipping@nexusmart.com"
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Phone"
                  secondary="+91-80-1234-5678"
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Hours"
                  secondary="Monday to Friday, 9:00 AM to 6:00 PM IST"
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
            </List>
            <Typography variant="body2" sx={{ color: "#666", mt: 2 }}>
              Nexus Mart Shipping Department, 123 Commerce Street, Bengaluru, Karnataka, India, 560001
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Paper>
    </Box>
  );
};

export default ShippingPolicy;