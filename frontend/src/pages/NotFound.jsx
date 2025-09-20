import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { FaExclamationTriangle, FaHome, FaSearch } from "react-icons/fa";

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  const handleSearch = () => {
    navigate("/search");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #f3e7e9 0%, #e3eeff 100%)",
        px: 2,
        py: 4,
      }}
    >
      <Box
        sx={{
          maxWidth: 600,
          width: "100%",
          textAlign: "center",
          bgcolor: "#fff",
          borderRadius: 4,
          p: { xs: 3, md: 6 },
          boxShadow: "0 8px 32px 0 rgba(236,72,153,0.15)",
        }}
      >
        <Box
          sx={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            bgcolor: "#fee2e2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 3,
          }}
        >
          <FaExclamationTriangle style={{ fontSize: "4rem", color: "#ef4444" }} />
        </Box>

        <Typography
          variant="h1"
          fontWeight="bold"
          sx={{
            color: "#ec4899",
            fontSize: { xs: "3rem", md: "4rem" },
            mb: 2,
          }}
        >
          404
        </Typography>

        <Typography
          variant="h4"
          fontWeight="bold"
          sx={{
            color: "#18181b",
            mb: 2,
          }}
        >
          Page Not Found
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: "#666",
            mb: 4,
            fontSize: "1.1rem",
            maxWidth: 500,
            mx: "auto",
          }}
        >
          Oops! The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            justifyContent: "center",
            mt: 3,
          }}
        >
          <Button
            variant="contained"
            size="large"
            startIcon={<FaHome />}
            onClick={handleGoHome}
            sx={{
              px: 4,
              py: 1.5,
              bgcolor: "#6366f1",
              "&:hover": {
                bgcolor: "#ec4899",
              },
              fontWeight: "bold",
              borderRadius: 2,
            }}
          >
            Go to Homepage
          </Button>

          <Button
            variant="outlined"
            size="large"
            startIcon={<FaSearch />}
            onClick={handleSearch}
            sx={{
              px: 4,
              py: 1.5,
              borderColor: "#6366f1",
              color: "#6366f1",
              "&:hover": {
                borderColor: "#ec4899",
                color: "#ec4899",
              },
              fontWeight: "bold",
              borderRadius: 2,
            }}
          >
            Search Products
          </Button>
        </Box>

        <Box sx={{ mt: 6 }}>
          <Typography variant="body2" sx={{ color: "#999" }}>
            Need help? Contact our support team at{" "}
            <a
              href="mailto:support@nexusmart.com"
              style={{ color: "#6366f1", textDecoration: "none" }}
            >
              support@nexusmart.com
            </a>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default NotFound;