import { Box, Paper, Typography, TextField, Button, Stack, Divider } from "@mui/material";
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt } from "react-icons/fa";

const ContactUs = () => (
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
        maxWidth: 600,
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
        Contact Us
      </Typography>
      <Typography variant="h6" sx={{ color: "#6366f1", mb: 3 }}>
        We'd love to hear from you!
      </Typography>
      <Divider sx={{ mb: 3, bgcolor: "#e3eeff" }} />
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <FaEnvelope style={{ color: "#ec4899", fontSize: 22 }} />
        <Typography variant="body1" sx={{ color: "#18181b" }}>
          tdawood140@gmail.com
        </Typography>
      </Stack>
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <FaPhoneAlt style={{ color: "#6366f1", fontSize: 22 }} />
        <Typography variant="body1" sx={{ color: "#18181b" }}>
          +91 7348848706
        </Typography>
      </Stack>
      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
        <FaMapMarkerAlt style={{ color: "#fbbf24", fontSize: 22 }} />
        <Typography variant="body1" sx={{ color: "#18181b" }}>
          123 Nexus Street, Tech City, USA
        </Typography>
      </Stack>
      <Divider sx={{ mb: 3, bgcolor: "#e3eeff" }} />
      <form>
        <Stack spacing={3}>
          <TextField
            label="Your Name"
            variant="outlined"
            fullWidth
            required
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
            variant="outlined"
            type="email"
            fullWidth
            required
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
            variant="outlined"
            multiline
            minRows={4}
            fullWidth
            required
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
            }}
          >
            Send Message
          </Button>
        </Stack>
      </form>
    </Paper>
  </Box>
);

export default ContactUs;