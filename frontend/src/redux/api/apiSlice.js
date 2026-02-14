import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../constants";
import Cookies from "js-cookie";

const baseQuery = fetchBaseQuery({ 
  baseUrl: BASE_URL,
  credentials: 'include', // Include cookies with requests
  prepareHeaders: (headers) => {
    const csrfToken = Cookies.get("csrf-token");
    if (csrfToken) {
      headers.set("X-CSRF-Token", csrfToken);
    }
    return headers;
  },
});

export const apiSlice = createApi({
  baseQuery,
  tagTypes: ["Offer","Page","Banner","Product", "Order", "User", "Category",  "Address","Tax","Currency","TaxExemption","TaxConfig","Courier","Shipment","FlashSale","BlogPost","Tracking", "Settings", "PaymentMethods", "PaymentTransactions", "PaymentTransaction", "PaymentGateways", "FraudRules", "PaymentAnalytics"],
  endpoints: () => ({}),
});