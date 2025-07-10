import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const VendorRoute = () => {
  const { userInfo } = useSelector((state) => state.auth);
  return userInfo  && userInfo.role==="seller" ? (
    <Outlet />
  ) : (
    <Navigate to="/seller/login" replace />
  );
};
export default VendorRoute;
