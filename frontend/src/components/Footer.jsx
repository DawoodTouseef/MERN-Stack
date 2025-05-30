import { useState } from "react";
import { Box, Container, Typography, Link, Stack, Divider, TextField, Button } from "@mui/material";
import { FaFacebook, FaTwitter, FaInstagram, FaGithub } from "react-icons/fa";

const Footer = () => {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterMsg, setNewsletterMsg] = useState("");

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // Here you would call your newsletter API
    setNewsletterMsg("Thank you for subscribing!");
    setNewsletterEmail("");
    setTimeout(() => setNewsletterMsg(""), 3000);
  };

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "#18181b",
        color: "#fff",
        pt: 6,
        pb: 2,
        mt: 8,
        boxShadow: "0 -2px 16px 0 rgba(0,0,0,0.12)",
      }}
      className="shadow-[0_-2px_16px_0_rgba(0,0,0,0.12)]"
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={4}
          justifyContent="space-between"
          alignItems="flex-start"
          sx={{ pb: 4 }}
        >
          {/* Brand */}
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                letterSpacing: 1,
                mb: 1,
                color: "primary.main",
              }}
              className="tracking-wider"
            >
              Nexus Mart
            </Typography>
            <Typography variant="body2" sx={{ color: "#d1d5db" }}>
              Your one-stop shop for everything!
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Link
                href="https://facebook.com"
                target="_blank"
                rel="noopener"
                color="inherit"
                className="hover:text-blue-500 transition-colors"
              >
                <FaFacebook size={22} />
              </Link>
              <Link
                href="https://twitter.com"
                target="_blank"
                rel="noopener"
                color="inherit"
                className="hover:text-sky-400 transition-colors"
              >
                <FaTwitter size={22} />
              </Link>
              <Link
                href="https://instagram.com"
                target="_blank"
                rel="noopener"
                color="inherit"
                className="hover:text-pink-400 transition-colors"
              >
                <FaInstagram size={22} />
              </Link>
              <Link
                href="https://github.com"
                target="_blank"
                rel="noopener"
                color="inherit"
                className="hover:text-gray-400 transition-colors"
              >
                <FaGithub size={22} />
              </Link>
            </Stack>
          </Box>
          {/* Customer Service */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Customer Service
            </Typography>
            <Stack spacing={1}>
              <Link
                href="/contact"
                underline="none"
                color="#d1d5db"
                className="hover:text-primary transition-colors font-medium"
              >
                Contact Us
              </Link>
              <Link
                href="/vendor/login"
                underline="none"
                color="#d1d5db"
                className="hover:text-primary transition-colors font-medium"
              >
                Sell with us
              </Link>
              <Link
                href="/cart"
                underline="none"
                color="#d1d5db"
                className="hover:text-primary transition-colors font-medium"
              >
                Cart
              </Link>
              <Link
                href="/privacy-policy"
                underline="none"
                color="#d1d5db"
                className="hover:text-primary transition-colors font-medium"
              >
                Privacy Policy
              </Link>
            </Stack>
          </Box>
          {/* Quick Links */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Quick Links
            </Typography>
            <Stack spacing={1}>
              <Link
                href="/"
                underline="none"
                color="#d1d5db"
                className="hover:text-primary transition-colors font-medium"
              >
                Home
              </Link>
              <Link
                href="/shop"
                underline="none"
                color="#d1d5db"
                className="hover:text-primary transition-colors font-medium"
              >
                Shop
              </Link>
              <Link
                href="/cart"
                underline="none"
                color="#d1d5db"
                className="hover:text-primary transition-colors font-medium"
              >
                Cart
              </Link>
              <Link
                href="/contact"
                underline="none"
                color="#d1d5db"
                className="hover:text-primary transition-colors font-medium"
              >
                Contact
              </Link>
            </Stack>
          </Box>
          {/* Newsletter Signup */}
          <Box sx={{ minWidth: 250 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Newsletter
            </Typography>
            <Typography variant="body2" sx={{ color: "#d1d5db", mb: 1 }}>
              Sign up for exclusive offers and updates.
            </Typography>
            <form onSubmit={handleNewsletterSubmit}>
              <Stack direction="row" spacing={1}>
                <TextField
                  size="small"
                  type="email"
                  required
                  placeholder="Your email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  sx={{
                    bgcolor: "#23232a",
                    borderRadius: 2,
                    input: { color: "#fff" },
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "#444" },
                      "&:hover fieldset": { borderColor: "#ec4899" },
                    },
                  }}
                  InputProps={{
                    style: { color: "#fff" },
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="secondary"
                  sx={{
                    fontWeight: 700,
                    borderRadius: 2,
                    px: 2.5,
                    letterSpacing: 1,
                    bgcolor: "#ec4899",
                    "&:hover": { bgcolor: "#be185d" },
                    boxShadow: 2,
                  }}
                >
                  Sign Up
                </Button>
              </Stack>
              {newsletterMsg && (
                <Typography
                  variant="caption"
                  sx={{ color: "#22d3ee", mt: 1, display: "block" }}
                >
                  {newsletterMsg}
                </Typography>
              )}
            </form>
          </Box>
          {/* Contact */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Contact Us
            </Typography>
            <Typography variant="body2" sx={{ color: "#d1d5db" }}>
              Email:{" "}
              <Link
                href="mailto:tdawood140@gmail.com"
                target="_blank"
                color="inherit"
                underline="hover"
                className="hover:text-primary"
              >
                tdawood140@gmail.com
              </Link>
            </Typography>
            <Typography variant="body2" sx={{ color: "#d1d5db" }}>
              Phone:{" "}
              <Link
                href="tel:+917348848706"
                target="_blank"
                color="inherit"
                underline="hover"
                className="hover:text-primary"
              >
                +91 7348848706
              </Link>
            </Typography>
          </Box>
        </Stack>
        <Divider sx={{ bgcolor: "#27272a", mb: 2 }} />
        <Typography
          variant="body2"
          align="center"
          sx={{ color: "#a1a1aa", fontSize: "0.95rem" }}
        >
          &copy; {new Date().getFullYear()} Nexus Mart. All rights
          reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;