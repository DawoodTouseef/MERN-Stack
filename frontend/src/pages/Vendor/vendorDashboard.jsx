import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import DocumentTitle from "react-document-title";
import VendorAnalyticsDashboard from "../../components/vendor/VendorAnalyticsDashboard";
import VendorDebugTest from "../../components/vendor/VendorDebugTest";
import ApiTestComponent from "../../components/vendor/ApiTestComponent";
import { Box, Typography, Button } from "@mui/material";

const VendorDashBoard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo } = useSelector((state) => state.auth);
  const [debugMode, setDebugMode] = useState(false);

  useEffect(() => {
    if (userInfo && userInfo.role !== "vendor") {
      navigate("/unauthorized");
    }
  }, [userInfo, navigate]);

  // Show loading state while checking authentication
  if (!userInfo) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h6">Loading...</Typography>
      </Box>
    );
  }

  // Show unauthorized message if user is not a vendor
  if (userInfo.role !== "vendor") {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error">
          Access denied. Vendors only.
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate("/vendor/login")}
          sx={{ mt: 2 }}
        >
          Go to Vendor Login
        </Button>
      </Box>
    );
  }

  // Check URL parameters to determine which view to show
  const showDebugTest = location.search.includes('debug=test');
  const showApiTest = location.search.includes('debug=api');

  const getView = () => {
    return <VendorAnalyticsDashboard />;
  };

  return (
    <DocumentTitle title="Vendor Dashboard | Nexus Mart">
      <>
        {getView()}
      </>
    </DocumentTitle>
  );
};

export default VendorDashBoard;