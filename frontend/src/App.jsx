import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./styles/global.css";
import { Outlet } from "react-router-dom";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import { Box, Typography, Button } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "./redux/features/auth/authSlice";
import { useLogoutMutation } from "./redux/api/usersApiSlice";
import { useNavigate } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import AppPerformanceWrapper, { PWAInstallBanner, registerServiceWorker, preloadCriticalResources } from "./Utils/performanceOptimization";
import { useEffect } from "react";
import { AccessibilityProvider } from "./contexts/AccessibilityContext";
import AccessibilityToolbar from "./components/AccessibilityToolbar";
import PerformanceMonitor from "./components/PerformanceMonitor";

const App = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutApiCall] = useLogoutMutation();

  const isInactiveVendor = userInfo?.role === "vendor" && userInfo?.status === "inactive";

  // Initialize performance optimizations
  useEffect(() => {
    registerServiceWorker();
    preloadCriticalResources();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate("/vendor/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AccessibilityProvider>
      <>
        <ErrorBoundary>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              minHeight: "100vh",
              margin: 0,
              padding: 0,
              bgcolor: "#f9fafb",
              position: "relative",
              width: "100%",
              maxWidth: "100vw",
              overflowX: "hidden",
              // Add touch-action for better mobile experience
              touchAction: "manipulation"
            }}
          >
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
            // Make toast container responsive
            style={{
              width: "90%",
              maxWidth: "400px",
              left: "50%",
              transform: "translateX(-50%)"
            }}
          />
          <NavBar />
          <Box
            component="main"
            id="main-content"
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              margin: 0,
              padding: 0,
              bgcolor: "#ffffff",
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
              filter: isInactiveVendor ? "blur(6px)" : "none",
              pointerEvents: isInactiveVendor ? "none" : "auto",
              transition: "filter 0.3s ease-in-out",
              width: "100%",
              maxWidth: "100vw",
              overflowX: "hidden",
              // Add touch-action for better mobile experience
              touchAction: "manipulation"
            }}
            tabIndex={-1}
          >
            <Outlet />
          </Box>
          <Footer />

            {isInactiveVendor && (
              <Box
                sx={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  zIndex: 2000,
                  width: "100vw",
                  height: "100vh",
                  bgcolor: "rgba(0, 0, 0, 0.6)",
                  backdropFilter: "blur(4px)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  color: "#fff",
                  // Add touch-action for better mobile experience
                  touchAction: "manipulation"
                }}
              >
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  Account is not verified
                </Typography>
                <Typography variant="body1" mb={3}>
                  Please wait for an admin to activate your account.
                </Typography>
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleLogout}
                  sx={{ px: 4, py: 1.5, fontWeight: "bold", fontSize: "1rem" ,borderRadius:"25px" ,color:"yellow"}}
                >
                  Logout
                </Button>
              </Box>
            )}
          </Box>
          <PWAInstallBanner />
          <AccessibilityToolbar />
          <PerformanceMonitor />
        </ErrorBoundary>
      </>
    </AccessibilityProvider>
  );
};

export default App;