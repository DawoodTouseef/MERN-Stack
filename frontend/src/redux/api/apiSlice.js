import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../constants";

const baseQuery = fetchBaseQuery({ 
  baseUrl: BASE_URL,
  credentials: 'include', // Include cookies with requests
  prepareHeaders: (headers) => {
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

export const apiSlice = createApi({
  baseQuery,
  tagTypes: ["Offer","Page","Banner","Product", "Order", "User", "Category",  "Address","Tax","Currency"],
  endpoints: () => ({}),
});
