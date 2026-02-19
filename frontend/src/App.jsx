import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./styles/global.css";
import { Outlet } from "react-router-dom";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import { Box } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "./redux/features/auth/authSlice";
import { useLogoutMutation } from "./redux/api/usersApiSlice";
import { useNavigate } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import { registerServiceWorker, preloadCriticalResources } from "./Utils/performanceOptimization";
import { useEffect } from "react";
import { AccessibilityProvider } from "./contexts/AccessibilityContext";
import { useGetCurrentOrganizationQuery } from "../src/redux/api/organizationApiSlice";
import DocumentTitle from "./components/DocumentTitle";
import { APP_NAME } from "../src/redux/constants";
import InactiveVendorOverlay from "./components/InactiveVendorOverlay";

const App = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutApiCall] = useLogoutMutation();
  const { data: org } = useGetCurrentOrganizationQuery(undefined, {
    skip: userInfo?.role !== "vendor"
  });
  const isInactiveVendor = userInfo?.role === "vendor" && (org && !org.isVerified);

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
    <>
      <DocumentTitle title={APP_NAME}>
        <AccessibilityProvider>
          <ErrorBoundary>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh",
                bgcolor: "background.default",
                position: "relative",
                width: "100%",
                maxWidth: "100vw",
                overflowX: "hidden",
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
                  bgcolor: "background.default",
                  filter: isInactiveVendor ? "blur(8px)" : "none",
                  pointerEvents: isInactiveVendor ? "none" : "auto",
                  transition: "filter 0.3s ease-in-out",
                  width: "100%",
                  maxWidth: "100vw",
                  overflowX: "hidden",
                  touchAction: "manipulation"
                }}
                tabIndex={-1}
              >
                <Outlet />
              </Box>

              <Footer />

              {isInactiveVendor && (
                <InactiveVendorOverlay onLogout={handleLogout} />
              )}
            </Box>
          </ErrorBoundary>
        </AccessibilityProvider>
      </DocumentTitle>
    </>
  );
};

export default App;