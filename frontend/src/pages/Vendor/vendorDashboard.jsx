import Chart from "react-apexcharts";
import {
  useGetTotalOrdersQuery,
  useGetTotalSalesByDateQuery,
  useGetTotalSalesQuery,
  useGetOrdersQuery
} from "../../redux/api/orderApiSlice";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import DocumentTitle from "react-document-title";
import VendorAnalyticsDashboard from "../../components/vendor/VendorAnalyticsDashboard";

const SellerDashBoard = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo?.role !== "vendor") navigate("/unauthorized");
  }, [userInfo, navigate]);

  return (
    <DocumentTitle title="Vendor Dashboard | Nexus Mart">
      <VendorAnalyticsDashboard />
    </DocumentTitle>
  );
};

export default SellerDashBoard;