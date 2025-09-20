import {
  Box,
  Paper,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Link,
} from "@mui/material";
import { FaBalanceScale, FaUserShield, FaRegClock, FaRegEnvelope, FaExclamationTriangle, FaBan, FaDollarSign } from "react-icons/fa";
import { ExpandMore } from "@mui/icons-material";
import { useEffect } from "react";

const Terms = () => {
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
    { id: "acceptance", title: "Acceptance of Terms" },
    { id: "eligibility", title: "Eligibility" },
    { id: "account", title: "Account Registration" },
    { id: "ordering", title: "Ordering and Payment" },
    { id: "pricing", title: "Pricing and Availability" },
    { id: "shipping", title: "Shipping and Delivery" },
    { id: "returns", title: "Returns and Refunds" },
    { id: "intellectual", title: "Intellectual Property" },
    { id: "user-content", title: "User-Generated Content" },
    { id: "prohibited", title: "Prohibited Activities" },
    { id: "limitation", title: "Limitation of Liability" },
    { id: "termination", title: "Termination" },
    { id: "dispute", title: "Dispute Resolution" },
    { id: "changes", title: "Changes to Terms" },
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
          Terms and Conditions
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
                <Link
                  href={`#${section.id}`}
                  sx={{
                    color: "#6366f1",
                    textDecoration: "none",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  {`${index + 1}. ${section.title}`}
                </Link>
              </ListItem>
            ))}
          </List>
        </Box>

        <Divider sx={{ mb: 4, bgcolor: "#e3eeff" }} />

        {/* Acceptance of Terms */}
        <Accordion defaultExpanded>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            id="acceptance"
            sx={{ bgcolor: "#f3e7e9", borderRadius: 1, mb: 1 }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ color: "#18181b" }}>
              1. Acceptance of Terms
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ color: "#444", mb: 2 }}>
              By accessing or using the Nexus Mart website, mobile applications, or services ("Platform"), you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree to these Terms, you must not access or use the Platform.
            </Typography>
            <Typography variant="body1" sx={{ color: "#444" }}>
              These Terms constitute a legally binding agreement between you and Nexus Mart Private Limited, an Indian company ("we," "us," or "our").
            </Typography>
          </AccordionDetails>
        </Accordion>

        {/* Eligibility */}
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            id="eligibility"
            sx={{ bgcolor: "#f3e7e9", borderRadius: 1, mb: 1 }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ color: "#18181b" }}>
              2. Eligibility
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ color: "#444", mb: 2 }}>
              To use the Platform, you must:
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Be at least 18 years old or have parental consent"
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Have the legal capacity to enter into contracts"
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Reside in a jurisdiction where our services are available"
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        {/* Account Registration */}
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            id="account"
            sx={{ bgcolor: "#f3e7e9", borderRadius: 1, mb: 1 }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ color: "#18181b" }}>
              3. Account Registration
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ color: "#444", mb: 2 }}>
              To access certain features, you must register for an account. You agree to:
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Provide accurate, current, and complete information"
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Maintain and update your information as needed"
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Keep your password confidential and secure"
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
            </List>
            <Typography variant="body1" sx={{ color: "#444" }}>
              You are responsible for all activities under your account. Notify us immediately of any unauthorized use.
            </Typography>
          </AccordionDetails>
        </Accordion>

        {/* Ordering and Payment */}
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            id="ordering"
            sx={{ bgcolor: "#f3e7e9", borderRadius: 1, mb: 1 }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ color: "#18181b" }}>
              4. Ordering and Payment
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ color: "#444", mb: 2 }}>
              When placing an order, you agree to:
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Provide accurate payment information"
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Authorize us to charge the total amount, including taxes and fees"
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Accept responsibility for all transactions under your account"
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
            </List>
            <Typography variant="body1" sx={{ color: "#444" }}>
              We reserve the right to refuse or cancel any order for any reason, including but not limited to product availability, pricing errors, or suspected fraudulent activity.
            </Typography>
          </AccordionDetails>
        </Accordion>

        {/* Pricing and Availability */}
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            id="pricing"
            sx={{ bgcolor: "#f3e7e9", borderRadius: 1, mb: 1 }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ color: "#18181b" }}>
              5. Pricing and Availability
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ color: "#444", mb: 2 }}>
              All prices are subject to change without notice. We make reasonable efforts to ensure accurate pricing, but errors may occur. In the event of a pricing error, we reserve the right to:
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Cancel the order and refund any payment"
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Contact you to confirm the correct price"
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
            </List>
            <Typography variant="body1" sx={{ color: "#444" }}>
              Product availability is not guaranteed. We may limit quantities per customer and reserve the right to discontinue any product at any time.
            </Typography>
          </AccordionDetails>
        </Accordion>

        {/* Shipping and Delivery */}
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            id="shipping"
            sx={{ bgcolor: "#f3e7e9", borderRadius: 1, mb: 1 }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ color: "#18181b" }}>
              6. Shipping and Delivery
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ color: "#444", mb: 2 }}>
              Shipping options, costs, and delivery times vary based on your location and selected method. By placing an order, you agree to:
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Provide accurate shipping information"
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Accept responsibility for customs duties and taxes (if applicable)"
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
            </List>
            <Typography variant="body1" sx={{ color: "#444" }}>
              Risk of loss and title for products transfer to you upon delivery. We are not responsible for delays caused by shipping carriers or customs.
            </Typography>
          </AccordionDetails>
        </Accordion>

        {/* Returns and Refunds */}
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            id="returns"
            sx={{ bgcolor: "#f3e7e9", borderRadius: 1, mb: 1 }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ color: "#18181b" }}>
              7. Returns and Refunds
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ color: "#444", mb: 2 }}>
              Our return policy is detailed on our Returns page. Generally, you may return most items within 30 days of delivery for a full refund or exchange, subject to:
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Items must be in original condition with tags attached"
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Proof of purchase is required"
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
            </List>
            <Typography variant="body1" sx={{ color: "#444" }}>
              Refunds are processed within 7-14 business days after we receive the returned item. Shipping costs are non-refundable unless the return is due to our error.
            </Typography>
          </AccordionDetails>
        </Accordion>

        {/* Intellectual Property */}
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            id="intellectual"
            sx={{ bgcolor: "#f3e7e9", borderRadius: 1, mb: 1 }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ color: "#18181b" }}>
              8. Intellectual Property
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ color: "#444", mb: 2 }}>
              All content on the Platform, including text, graphics, logos, images, and software, is the property of Nexus Mart or its licensors and is protected by intellectual property laws.
            </Typography>
            <Typography variant="body1" sx={{ color: "#444" }}>
              You may not use our intellectual property without prior written consent. Unauthorized use may result in legal action.
            </Typography>
          </AccordionDetails>
        </Accordion>

        {/* User-Generated Content */}
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            id="user-content"
            sx={{ bgcolor: "#f3e7e9", borderRadius: 1, mb: 1 }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ color: "#18181b" }}>
              9. User-Generated Content
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ color: "#444", mb: 2 }}>
              By submitting content to the Platform, you grant us a non-exclusive, royalty-free, perpetual, and worldwide license to use, reproduce, modify, and display your content.
            </Typography>
            <Typography variant="body1" sx={{ color: "#444" }}>
              You are solely responsible for your content and must ensure it does not violate any laws or third-party rights. We reserve the right to remove any content at our discretion.
            </Typography>
          </AccordionDetails>
        </Accordion>

        {/* Prohibited Activities */}
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            id="prohibited"
            sx={{ bgcolor: "#f3e7e9", borderRadius: 1, mb: 1 }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ color: "#18181b" }}>
              10. Prohibited Activities
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ color: "#444", mb: 2 }}>
              You agree not to:
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <FaBan style={{ color: "#ec4899" }} />
                </ListItemIcon>
                <ListItemText
                  primary="Use the Platform for illegal purposes"
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <FaExclamationTriangle style={{ color: "#f59e0b" }} />
                </ListItemIcon>
                <ListItemText
                  primary="Attempt to gain unauthorized access to our systems"
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <FaDollarSign style={{ color: "#10b981" }} />
                </ListItemIcon>
                <ListItemText
                  primary="Engage in fraudulent activities"
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
            </List>
            <Typography variant="body1" sx={{ color: "#444" }}>
              Violation of these provisions may result in account termination and legal action.
            </Typography>
          </AccordionDetails>
        </Accordion>

        {/* Limitation of Liability */}
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            id="limitation"
            sx={{ bgcolor: "#f3e7e9", borderRadius: 1, mb: 1 }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ color: "#18181b" }}>
              11. Limitation of Liability
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ color: "#444", mb: 2 }}>
              To the fullest extent permitted by law, Nexus Mart shall not be liable for any indirect, incidental, special, or consequential damages arising from:
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Use or inability to use the Platform"
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Unauthorized access to or alteration of your data"
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
            </List>
            <Typography variant="body1" sx={{ color: "#444" }}>
              Our total liability shall not exceed the amount paid by you for the products or services in question.
            </Typography>
          </AccordionDetails>
        </Accordion>

        {/* Termination */}
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            id="termination"
            sx={{ bgcolor: "#f3e7e9", borderRadius: 1, mb: 1 }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ color: "#18181b" }}>
              12. Termination
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ color: "#444", mb: 2 }}>
              We may suspend or terminate your account at any time for:
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Violation of these Terms"
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Non-payment or fraudulent activity"
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
            </List>
            <Typography variant="body1" sx={{ color: "#444" }}>
              Upon termination, you lose access to your account and any associated benefits. Sections 8, 11, and 13 survive termination.
            </Typography>
          </AccordionDetails>
        </Accordion>

        {/* Dispute Resolution */}
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            id="dispute"
            sx={{ bgcolor: "#f3e7e9", borderRadius: 1, mb: 1 }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ color: "#18181b" }}>
              13. Dispute Resolution
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ color: "#444", mb: 2 }}>
              Any dispute arising from these Terms shall be resolved through:
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <FaBalanceScale style={{ color: "#6366f1" }} />
                </ListItemIcon>
                <ListItemText
                  primary="Negotiation"
                  secondary="Good faith efforts to resolve the issue directly"
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <FaUserShield style={{ color: "#10b981" }} />
                </ListItemIcon>
                <ListItemText
                  primary="Mediation"
                  secondary="If negotiation fails, mediation through a mutually agreed mediator"
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
            </List>
            <Typography variant="body1" sx={{ color: "#444" }}>
              If mediation fails, disputes shall be subject to the exclusive jurisdiction of courts in Bengaluru, Karnataka, India.
            </Typography>
          </AccordionDetails>
        </Accordion>

        {/* Changes to Terms */}
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            id="changes"
            sx={{ bgcolor: "#f3e7e9", borderRadius: 1, mb: 1 }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ color: "#18181b" }}>
              14. Changes to Terms
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ color: "#444", mb: 2 }}>
              We may update these Terms at any time. Changes will be effective immediately upon posting to the Platform. Your continued use constitutes acceptance of the revised Terms.
            </Typography>
            <Typography variant="body1" sx={{ color: "#444" }}>
              We will notify you of significant changes via email or Platform notifications when possible.
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
              15. Contact Information
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ color: "#444", mb: 2 }}>
              For questions about these Terms, please contact us:
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <FaRegEnvelope style={{ color: "#ad1457" }} />
                </ListItemIcon>
                <ListItemText
                  primary="Email"
                  secondary={<Link href="mailto:legal@nexusmart.com">legal@nexusmart.com</Link>}
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <FaRegClock style={{ color: "#f59e0b" }} />
                </ListItemIcon>
                <ListItemText
                  primary="Business Hours"
                  secondary="Monday to Friday, 9:00 AM to 6:00 PM IST"
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
            </List>
            <Typography variant="body2" sx={{ color: "#666" }}>
              Nexus Mart Private Limited, 123 Commerce Street, Bengaluru, Karnataka, India, 560001
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Paper>
    </Box>
  );
};

export default Terms;