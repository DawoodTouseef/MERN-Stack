import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../constants";
console.log("Base url"+ BASE_URL)
const baseQuery = fetchBaseQuery({ baseUrl: BASE_URL });

export const apiSlice = createApi({
  baseQuery,
  tagTypes: ["Offer","Page","Banner","Product", "Order", "User", "Category",  "Address","Tax","Currency"],
  endpoints: () => ({}),
});
