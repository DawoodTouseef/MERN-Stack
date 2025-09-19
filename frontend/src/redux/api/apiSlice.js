import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../constants";

const baseQuery = fetchBaseQuery({ 
  baseUrl: BASE_URL,
  credentials: 'include', // Include cookies with requests
  prepareHeaders: (headers) => {
    // Don't set Content-Type here - let RTK Query handle it automatically for FormData
    // headers.set('Content-Type', 'application/json');
    return headers;
  },
});

export const apiSlice = createApi({
  baseQuery,
  tagTypes: ["Offer","Page","Banner","Product", "Order", "User", "Category",  "Address","Tax","Currency","TaxExemption","TaxConfig","Courier","Shipment","FlashSale","BlogPost","Tracking"],
  endpoints: () => ({}),
});