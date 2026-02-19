import React from 'react';
import { Box, Typography, Button, alpha, useTheme } from "@mui/material";
import { ErrorOutlineRounded } from "@mui/icons-material";

const InactiveVendorOverlay = ({ onLogout }) => {
    const theme = useTheme();

    return (
        <Box
            sx={{
                position: "fixed",
                top: 0,
                left: 0,
                zIndex: 2500,
                width: "100vw",
                height: "100vh",
                bgcolor: alpha("#000", 0.8),
                backdropFilter: "blur(10px)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                color: "#fff",
                p: 3,
                touchAction: "manipulation"
            }}
        >
            <Box
                sx={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    bgcolor: alpha(theme.palette.error.main, 0.1),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 3,
                    border: `2px solid ${alpha(theme.palette.error.main, 0.3)}`
                }}
            >
                <ErrorOutlineRounded sx={{ fontSize: 40, color: theme.palette.error.main }} />
            </Box>

            <Typography variant="h3" fontWeight="900" gutterBottom sx={{ letterSpacing: "-0.02em" }}>
                Verification Pending
            </Typography>

            <Typography variant="h6" sx={{ mb: 4, maxWidth: 500, color: alpha("#fff", 0.7), fontWeight: 400 }}>
                Your account is currently being reviewed by our administration team.
                You will regain access once your organization documents are verified.
            </Typography>

            <Button
                variant="contained"
                onClick={onLogout}
                sx={{
                    px: 6,
                    py: 1.5,
                    fontWeight: "bold",
                    fontSize: "1rem",
                    borderRadius: "30px",
                    textTransform: "none",
                    background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
                    boxShadow: `0 10px 20px ${alpha(theme.palette.error.main, 0.3)}`,
                    '&:hover': {
                        boxShadow: `0 15px 30px ${alpha(theme.palette.error.main, 0.4)}`,
                        transform: "translateY(-2px)"
                    },
                    transition: "all 0.3s ease"
                }}
            >
                Logout from Portal
            </Button>
        </Box>
    );
};

export default InactiveVendorOverlay;
