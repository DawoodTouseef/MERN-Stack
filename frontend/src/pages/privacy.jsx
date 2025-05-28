import React from 'react'
import { Box, Paper, Typography, Divider, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { FaLock, FaUserShield, FaRegClock, FaRegEnvelope } from "react-icons/fa";

const Privacy = () => (
  <Box
    sx={{
      minHeight: "100vh",
      py: 6,
      px: 2,
      background: "linear-gradient(135deg, #f3e7e9 0%, #e3eeff 100%)",
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
    }}
  >
    <Paper
      elevation={6}
      sx={{
        maxWidth: 700,
        width: "100%",
        mx: "auto",
        p: { xs: 3, md: 5 },
        borderRadius: 4,
        boxShadow: "0 8px 32px 0 rgba(236,72,153,0.10)",
        background: "linear-gradient(135deg, #fff 80%, #e3eeff 100%)",
      }}
    >
      <Typography
        variant="h3"
        fontWeight="bold"
        sx={{
          color: "#ec4899",
          mb: 2,
          letterSpacing: 1,
          textShadow: "1px 1px 8px #e3eeff",
        }}
      >
        Privacy Policy
      </Typography>
      <Typography variant="h6" sx={{ color: "#6366f1", mb: 3 }}>
        Last updated: May 27, 2025
      </Typography>
      <Divider sx={{ mb: 3, bgcolor: "#e3eeff" }} />
      <Typography variant="body1" sx={{ mb: 2, color: "#18181b" }}>
        Welcome to <b>Nexus Mart</b>. Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information when you use our website and services.
      </Typography>
      <List sx={{ mb: 3 }}>
        <ListItem>
          <ListItemIcon>
            <FaUserShield style={{ color: "#6366f1" }} />
          </ListItemIcon>
          <ListItemText
            primary="Information We Collect"
            secondary="We collect information you provide when you register, place an order, subscribe to our newsletter, or interact with our site. This may include your name, email, address, payment details, and browsing activity."
            primaryTypographyProps={{ fontWeight: 700, color: "#18181b" }}
            secondaryTypographyProps={{ color: "#444" }}
          />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <FaLock style={{ color: "#ec4899" }} />
          </ListItemIcon>
          <ListItemText
            primary="How We Use Your Information"
            secondary="Your information is used to process orders, personalize your experience, improve our services, and communicate with you about offers and updates. We do not sell your personal data."
            primaryTypographyProps={{ fontWeight: 700, color: "#18181b" }}
            secondaryTypographyProps={{ color: "#444" }}
          />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <FaRegClock style={{ color: "#fbbf24" }} />
          </ListItemIcon>
          <ListItemText
            primary="Data Retention"
            secondary="We retain your information as long as your account is active or as needed to provide you services, comply with legal obligations, or resolve disputes."
            primaryTypographyProps={{ fontWeight: 700, color: "#18181b" }}
            secondaryTypographyProps={{ color: "#444" }}
          />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <FaRegEnvelope style={{ color: "#ad1457" }} />
          </ListItemIcon>
          <ListItemText
            primary="Your Choices"
            secondary="You can update your information, unsubscribe from emails, or request deletion of your account at any time. Contact us for any privacy-related requests."
            primaryTypographyProps={{ fontWeight: 700, color: "#18181b" }}
            secondaryTypographyProps={{ color: "#444" }}
          />
        </ListItem>
      </List>
      <Divider sx={{ mb: 3, bgcolor: "#e3eeff" }} />
      <Typography variant="body1" sx={{ color: "#18181b", mb: 2 }}>
        <b>Security:</b> We use industry-standard security measures to protect your data. However, no method of transmission over the Internet is 100% secure.
      </Typography>
      <Typography variant="body1" sx={{ color: "#18181b", mb: 2 }}>
        <b>Third-Party Services:</b> We may use trusted third-party services for payments, analytics, and marketing. These providers have their own privacy policies.
      </Typography>
      <Typography variant="body1" sx={{ color: "#18181b", mb: 2 }}>
        <b>Policy Updates:</b> We may update this policy from time to time. Changes will be posted on this page.
      </Typography>
      <Typography variant="body1" sx={{ color: "#6366f1", mt: 3 }}>
        If you have any questions about our privacy practices, please contact us at <b>tdawood140@gmail.com</b>.
      </Typography>
    </Paper>
  </Box>
);

export default Privacy;