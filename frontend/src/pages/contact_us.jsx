import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Divider,
  Grid,
  IconButton,
  Link,
  CircularProgress,
} from "@mui/material";
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt, FaFacebookF, FaTwitter, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";
import { APP_NAME } from "../redux/constants";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.message.trim()) newErrors.message = "Message is required";
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      // Placeholder API endpoint (replace with your actual endpoint)
      await axios.post("/api/contact", formData);
      toast.success("Message sent successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      console.error("Contact form error:", error);
      toast.error("Failed to send message. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
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
          Contact {APP_NAME}
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{ color: "#6366f1", mb: 4, textAlign: { xs: "center", md: "left" } }}
        >
          We're here to assist you! Reach out with any questions, feedback, or support needs.
        </Typography>

        <Grid container spacing={4}>
          {/* Contact Details */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ color: "#18181b", mb: 3 }}>
              Get in Touch
            </Typography>
            <Stack spacing={3}>
              <Stack direction="row" spacing={2} alignItems="center">
                <FaEnvelope style={{ color: "#ec4899", fontSize: 20 }} />
                <Link
                  href={`mailto:support@${APP_NAME.toLowerCase().replace(/\s+/g, '')}.com`}
                  sx={{ color: "#18181b", textDecoration: "none", "&:hover": { color: "#ec4899" } }}
                >
                  support@{APP_NAME.toLowerCase().replace(/\s+/g, '')}.com
                </Link>
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center">
                <FaPhoneAlt style={{ color: "#6366f1", fontSize: 20 }} />
                <Link
                  href="tel:+18001234567"
                  sx={{ color: "#18181b", textDecoration: "none", "&:hover": { color: "#6366f1" } }}
                >
                  +1 (800) 123-4567
                </Link>
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center">
                <FaMapMarkerAlt style={{ color: "#fbbf24", fontSize: 20 }} />
                <Typography variant="body1" sx={{ color: "#18181b" }}>
                  123 Commerce Street, Bengaluru, Karnataka, India
                </Typography>
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="body2" sx={{ color: "#666" }}>
                  Follow us:
                </Typography>
                <IconButton
                  href={`https://facebook.com/${APP_NAME.toLowerCase().replace(/\s+/g, '')}`}
                  target="_blank"
                  sx={{ color: "#3b5998" }}
                >
                  <FaFacebookF />
                </IconButton>
                <IconButton
                  href={`https://twitter.com/${APP_NAME.toLowerCase().replace(/\s+/g, '')}`}
                  target="_blank"
                  sx={{ color: "#1da1f2" }}
                >
                  <FaTwitter />
                </IconButton>
                <IconButton
                  href={`https://instagram.com/${APP_NAME.toLowerCase().replace(/\s+/g, '')}`}
                  target="_blank"
                  sx={{ color: "#e1306c" }}
                >
                  <FaInstagram />
                </IconButton>
                <IconButton
                  href="https://wa.me/918001234567"
                  target="_blank"
                  sx={{ color: "#25d366" }}
                >
                  <FaWhatsapp />
                </IconButton>
              </Stack>
            </Stack>
            <Divider sx={{ my: 3, bgcolor: "#e3eeff" }} />
            <Typography variant="body1" sx={{ color: "#18181b", mb: 2 }}>
              Need quick answers? Visit our{" "}
              <Link
                href="/faq"
                sx={{ color: "#6366f1", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
              >
                FAQ page
              </Link>{" "}
              or try our{" "}
              <Link
                href="/support/chat"
                sx={{ color: "#6366f1", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
              >
                live chat
              </Link>.
            </Typography>
          </Grid>

          {/* Contact Form */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ color: "#18181b", mb: 3 }}>
              Send Us a Message
            </Typography>
            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  label="Your Name"
                  name="name"
                  variant="outlined"
                  fullWidth
                  required
                  value={formData.name}
                  onChange={handleChange}
                  error={!!errors.name}
                  helperText={errors.name}
                  sx={{
                    bgcolor: "#f9fafb",
                    borderRadius: 2,
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "#e3eeff" },
                      "&:hover fieldset": { borderColor: "#ec4899" },
                      "&.Mui-focused fieldset": { borderColor: "#ec4899" },
                    },
                  }}
                />
                <TextField
                  label="Your Email"
                  name="email"
                  variant="outlined"
                  type="email"
                  fullWidth
                  required
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  sx={{
                    bgcolor: "#f9fafb",
                    borderRadius: 2,
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "#e3eeff" },
                      "&:hover fieldset": { borderColor: "#6366f1" },
                      "&.Mui-focused fieldset": { borderColor: "#6366f1" },
                    },
                  }}
                />
                <TextField
                  label="Message"
                  name="message"
                  variant="outlined"
                  multiline
                  minRows={4}
                  fullWidth
                  required
                  value={formData.message}
                  onChange={handleChange}
                  error={!!errors.message}
                  helperText={errors.message}
                  sx={{
                    bgcolor: "#f9fafb",
                    borderRadius: 2,
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "#e3eeff" },
                      "&:hover fieldset": { borderColor: "#ad1457" },
                      "&.Mui-focused fieldset": { borderColor: "#ad1457" },
                    },
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="secondary"
                  size="large"
                  disabled={isSubmitting}
                  sx={{
                    borderRadius: 3,
                    fontWeight: "bold",
                    px: 5,
                    mt: 2,
                    fontSize: "1.1rem",
                    background: "#ec4899",
                    "&:hover": { background: "#be185d" },
                    boxShadow: 2,
                    textTransform: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  {isSubmitting ? <CircularProgress size={24} color="inherit" /> : "Send Message"}
                </Button>
              </Stack>
            </form>
            <Typography variant="body2" sx={{ color: "#666", mt: 2, textAlign: "center" }}>
              We respect your privacy. See our{" "}
              <Link
                href="/privacy-policy"
                sx={{ color: "#6366f1", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
              >
                Privacy Policy
              </Link>{" "}
              for details.
            </Typography>
          </Grid>
        </Grid>

        {/* Optional Map (Commented Out) */}
        {/* 
        <Divider sx={{ my: 4, bgcolor: "#e3eeff" }} />
        <Typography variant="h6" fontWeight="bold" sx={{ color: "#18181b", mb: 3, textAlign: "center" }}>
          Our Location
        </Typography>
        <Box sx={{ height: 300, borderRadius: 2, overflow: "hidden" }}>
          <MapContainer center={[12.9716, 77.5946]} zoom={13} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={[12.9716, 77.5946]}>
              <Popup>Nexus Mart Headquarters</Popup>
            </Marker>
          </MapContainer>
        </Box>
        */}
      </Paper>
    </Box>
  );
};

export default ContactUs;