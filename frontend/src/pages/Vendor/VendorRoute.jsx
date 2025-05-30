import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const VendorRoute = () => {
  const { userInfo } = useSelector((state) => state.auth);
  return userInfo && userInfo.isAdmin && userInfo.role==="vendor" ? (
    <Outlet />
  ) : (
    <Navigate to="/vendor/login" replace />
  );
};
export default VendorRoute;
