import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const AdminRoute = () => {
  const { userInfo } = useSelector((state) => state.auth);
  return userInfo&& userInfo.role==="admin" ? (
    <Outlet />
  ) : (
    <Navigate to="/admin/login" replace />
  );
};
export default AdminRoute;
