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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  alpha
} from "@mui/material";
import { FaLock, FaUserShield, FaRegClock, FaRegEnvelope, FaCookieBite, FaUsers, FaShieldAlt, FaGlobe } from "react-icons/fa";
import { ExpandMore } from "@mui/icons-material";
import { useEffect } from "react";
import { APP_NAME } from "../redux/constants";

const Privacy = () => {
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
    { id: "introduction", title: "Introduction" },
    { id: "info-collect", title: "Information We Collect" },
    { id: "how-use", title: "How We Use Your Information" },
    { id: "data-sharing", title: "Data Sharing and Disclosure" },
    { id: "cookies", title: "Cookies and Tracking Technologies" },
    { id: "data-retention", title: "Data Retention" },
    { id: "user-rights", title: "Your Rights and Choices" },
    { id: "security", title: "Data Security" },
    { id: "third-party", title: "Third-Party Services" },
    { id: "international", title: "International Data Transfers" },
    { id: "updates", title: "Updates to This Policy" },
    { id: "contact", title: "Contact Us" },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: { xs: 4, md: 8 },
        px: { xs: 2, md: 4 },
        bgcolor: "#f8fafc",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          maxWidth: 900,
          width: "100%",
          mx: "auto",
          p: { xs: 3, md: 5 },
          borderRadius: 4,
          border: `1px solid ${alpha('#6366f1', 0.1)}`,
          background: "#fff",
        }}
      >
        <Typography
          variant="h3"
          fontWeight="bold"
          sx={{
            color: "#1e293b",
            mb: 2,
            letterSpacing: '-0.02em',
            textAlign: { xs: "center", md: "left" },
          }}
        >
          Privacy <Box component="span" sx={{ color: '#6366f1' }}>Policy</Box>
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
          <TableContainer>
            <Table size="small">
              <TableBody>
                {sections.map((section, index) => (
                  <TableRow key={section.id}>
                    <TableCell sx={{ border: "none", py: 0.5 }}>
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Divider sx={{ mb: 4, bgcolor: "#e3eeff" }} />

        {/* Introduction */}
        <Accordion defaultExpanded elevation={0} sx={{ border: `1px solid ${alpha('#6366f1', 0.1)}`, borderRadius: '8px !important', overflow: 'hidden', mb: 2 }}>
          <AccordionSummary
            expandIcon={<ExpandMore sx={{ color: '#6366f1' }} />}
            id="introduction"
            sx={{ bgcolor: alpha('#6366f1', 0.03) }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ color: "#1e293b" }}>
              1. Introduction
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ color: "#444", mb: 2 }}>
              At <b>{APP_NAME}</b>, we are committed to protecting your privacy. This Privacy Policy outlines how we collect, use, disclose, and safeguard your personal information when you visit our website, use our mobile applications, or engage with our services. By using {APP_NAME}, you consent to the practices described in this policy.
            </Typography>
            <Typography variant="body2" sx={{ color: "#666" }}>
              This policy complies with applicable data protection laws, including the General Data Protection Regulation (GDPR), California Consumer Privacy Act (CCPA), and India’s Digital Personal Data Protection Act (DPDP Act).
            </Typography>
          </AccordionDetails>
        </Accordion>

        {/* Information We Collect */}
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            id="info-collect"
            sx={{ bgcolor: "#f3e7e9", borderRadius: 1, mb: 1 }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ color: "#18181b" }}>
              2. Information We Collect
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              <ListItem>
                <ListItemIcon>
                  <FaUserShield style={{ color: "#6366f1" }} />
                </ListItemIcon>
                <ListItemText
                  primary="Personal Information"
                  secondary="When you register, place an order, or contact us, we collect information such as your name, email address, phone number, shipping/billing address, and payment details."
                  primaryTypographyProps={{ fontWeight: 600 }}
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <FaCookieBite style={{ color: "#ec4899" }} />
                </ListItemIcon>
                <ListItemText
                  primary="Usage Data"
                  secondary="We collect information about your interactions with our platform, including IP address, browser type, device information, pages visited, and search queries."
                  primaryTypographyProps={{ fontWeight: 600 }}
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <FaUsers style={{ color: "#fbbf24" }} />
                </ListItemIcon>
                <ListItemText
                  primary="User-Generated Content"
                  secondary="Reviews, ratings, comments, or other content you submit may be collected and stored."
                  primaryTypographyProps={{ fontWeight: 600 }}
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        {/* How We Use Your Information */}
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            id="how-use"
            sx={{ bgcolor: "#f3e7e9", borderRadius: 1, mb: 1 }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ color: "#18181b" }}>
              3. How We Use Your Information
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ color: "#444", mb: 2 }}>
              We use your information to:
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Process transactions, fulfill orders, and provide customer support."
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Personalize your shopping experience and recommend products."
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Send promotional emails, newsletters, or targeted advertisements (with your consent)."
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Improve our platform, analyze trends, and enhance security."
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
            </List>
            <Typography variant="body2" sx={{ color: "#666" }}>
              We do not sell your personal information to third parties.
            </Typography>
          </AccordionDetails>
        </Accordion>

        {/* Data Sharing and Disclosure */}
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            id="data-sharing"
            sx={{ bgcolor: "#f3e7e9", borderRadius: 1, mb: 1 }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ color: "#18181b" }}>
              4. Data Sharing and Disclosure
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ color: "#444", mb: 2 }}>
              We may share your information with:
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Service Providers"
                  secondary="Trusted partners who assist with payment processing, shipping, analytics, or marketing, bound by confidentiality agreements."
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Legal Requirements"
                  secondary="When required by law, such as to comply with a court order or protect our rights."
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Business Transfers"
                  secondary="In the event of a merger, acquisition, or sale of assets, your information may be transferred."
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        {/* Cookies and Tracking Technologies */}
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            id="cookies"
            sx={{ bgcolor: "#f3e7e9", borderRadius: 1, mb: 1 }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ color: "#18181b" }}>
              5. Cookies and Tracking Technologies
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ color: "#444", mb: 2 }}>
              We use cookies and similar technologies to enhance your experience, analyze usage, and deliver personalized ads. You can manage cookie preferences through your browser settings or our cookie consent tool.
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Essential Cookies"
                  secondary="Required for website functionality, such as session management."
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Analytics Cookies"
                  secondary="Help us understand how users interact with our platform."
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Advertising Cookies"
                  secondary="Enable personalized ads based on your browsing behavior."
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        {/* Data Retention */}
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            id="data-retention"
            sx={{ bgcolor: "#f3e7e9", borderRadius: 1, mb: 1 }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ color: "#18181b" }}>
              6. Data Retention
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ color: "#444", mb: 2 }}>
              We retain your personal information for as long as necessary to:
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Maintain your account and provide services."
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Comply with legal obligations, such as tax or consumer protection laws."
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Resolve disputes or enforce agreements."
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
            </List>
            <Typography variant="body2" sx={{ color: "#666" }}>
              Inactive accounts may be deleted after 2 years, subject to applicable laws.
            </Typography>
          </AccordionDetails>
        </Accordion>

        {/* Your Rights and Choices */}
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            id="user-rights"
            sx={{ bgcolor: "#f3e7e9", borderRadius: 1, mb: 1 }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ color: "#18181b" }}>
              7. Your Rights and Choices
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ color: "#444", mb: 2 }}>
              Depending on your jurisdiction, you may have the following rights:
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Access"
                  secondary="Request a copy of your personal information."
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Correction"
                  secondary="Update or correct inaccurate information."
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Deletion"
                  secondary="Request deletion of your data, subject to legal exceptions."
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Opt-Out"
                  secondary="Unsubscribe from marketing communications or opt out of targeted ads."
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
            </List>
            <Typography variant="body2" sx={{ color: "#666" }}>
              To exercise these rights, contact us at <Link href="mailto:privacy@nexusmart.com">privacy@nexusmart.com</Link>.
            </Typography>
          </AccordionDetails>
        </Accordion>

        {/* Data Security */}
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            id="security"
            sx={{ bgcolor: "#f3e7e9", borderRadius: 1, mb: 1 }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ color: "#18181b" }}>
              8. Data Security
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ color: "#444", mb: 2 }}>
              We implement robust security measures, including encryption, secure sockets layer (SSL), and access controls, to protect your data. However, no online platform can guarantee absolute security, and users assume some risk when transmitting data online.
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <FaShieldAlt style={{ color: "#ad1457" }} />
                </ListItemIcon>
                <ListItemText
                  primary="Encryption"
                  secondary="All sensitive data is encrypted during transmission and storage."
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <FaLock style={{ color: "#ec4899" }} />
                </ListItemIcon>
                <ListItemText
                  primary="Access Controls"
                  secondary="Only authorized personnel can access your data."
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        {/* Third-Party Services */}
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            id="third-party"
            sx={{ bgcolor: "#f3e7e9", borderRadius: 1, mb: 1 }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ color: "#18181b" }}>
              9. Third-Party Services
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ color: "#444", mb: 2 }}>
              We partner with third-party services for:
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Payment Processors"
                  secondary="To securely handle transactions (e.g., Stripe, PayPal)."
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Analytics Providers"
                  secondary="To analyze site usage (e.g., Google Analytics)."
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Marketing Platforms"
                  secondary="To deliver personalized ads (e.g., Meta Ads)."
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
            </List>
            <Typography variant="body2" sx={{ color: "#666" }}>
              These providers are contractually obligated to protect your data and have their own privacy policies.
            </Typography>
          </AccordionDetails>
        </Accordion>

        {/* International Data Transfers */}
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            id="international"
            sx={{ bgcolor: "#f3e7e9", borderRadius: 1, mb: 1 }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ color: "#18181b" }}>
              10. International Data Transfers
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ color: "#444", mb: 2 }}>
              As a global platform, your data may be transferred to and processed in countries outside your jurisdiction, including the United States and India. We ensure compliance with international data protection standards, such as GDPR’s Standard Contractual Clauses.
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <FaGlobe style={{ color: "#6366f1" }} />
                </ListItemIcon>
                <ListItemText
                  primary="Data Protection Measures"
                  secondary="We use safeguards to protect data during cross-border transfers."
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        {/* Updates to This Policy */}
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            id="updates"
            sx={{ bgcolor: "#f3e7e9", borderRadius: 1, mb: 1 }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ color: "#18181b" }}>
              11. Updates to This Policy
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ color: "#444", mb: 2 }}>
              We may update this Privacy Policy to reflect changes in our practices or legal requirements. Updates will be posted on this page, and significant changes will be communicated via email or site notifications.
            </Typography>
            <Typography variant="body2" sx={{ color: "#666" }}>
              Last updated: May 27, 2025
            </Typography>
          </AccordionDetails>
        </Accordion>

        {/* Contact Us */}
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            id="contact"
            sx={{ bgcolor: "#f3e7e9", borderRadius: 1, mb: 1 }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ color: "#18181b" }}>
              12. Contact Us
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ color: "#444", mb: 2 }}>
              For questions, concerns, or requests regarding your privacy, please contact our Data Protection Officer:
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <FaRegEnvelope style={{ color: "#ad1457" }} />
                </ListItemIcon>
                <ListItemText
                  primary="Email"
                  secondary={<Link href="mailto:privacy@nexusmart.com">privacy@nexusmart.com</Link>}
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <FaGlobe style={{ color: "#6366f1" }} />
                </ListItemIcon>
                <ListItemText
                  primary="Website"
                  secondary={<Link href="https://www.nexusmart.com/support">www.nexusmart.com/support</Link>}
                  secondaryTypographyProps={{ color: "#444" }}
                />
              </ListItem>
            </List>
            <Typography variant="body2" sx={{ color: "#666" }}>
              {APP_NAME}, 123 Commerce Street, Bengaluru, Karnataka, India
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Paper>
    </Box>
  );
};

export default Privacy;