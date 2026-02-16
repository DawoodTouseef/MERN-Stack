import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetCurrentOrganizationQuery } from "../../redux/api/organizationApiSlice";
import { CircularProgress, Box } from "@mui/material";

const VerificationGuard = () => {
    const { userInfo } = useSelector((state) => state.auth);
    const { data: org, isLoading } = useGetCurrentOrganizationQuery();

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!org) {
        return <Navigate to="/vendor/create-organization" replace />;
    }

    // If organization exists but not verified
    if (!org.isVerified) {
        // If documents submitted but not verified yet
        if (org.verificationStatus === 'submitted') {
            return <Navigate to="/vendor/verification-pending" replace />;
        }
        // If rejected or mostly likely draft/initial state (though we redirect to pending if submitted)
        // If rejected, we might want to show a specialized page or allow them to edit in create-org
        return <Navigate to="/vendor/create-organization" replace />;
    }

    // If verified, allow access
    return <Outlet />;
};

export default VerificationGuard;
