import { apiSlice } from "./apiSlice";

export const taxApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    calculateTax: builder.mutation({
      query: (data) => ({
        url: "/tax/calculate",
        method: "POST",
        body: data,
      }),
      providesTags: ["Tax"],
    }),
  }),
});

export const { useCalculateTaxMutation } = taxApiSlice;
