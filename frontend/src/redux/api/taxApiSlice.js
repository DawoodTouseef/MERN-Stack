import { apiSlice } from "./apiSlice";

export const taxApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Create or update a tax rule (admin only)
    createOrUpdateTax: builder.mutation({
      query: (data) => ({
        url: "/tax/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Tax"],
    }),

    // Calculate tax for a product and location
    calculateTax: builder.mutation({
      query: (data) => ({
        url: "/tax/calculate",
        method: "POST",
        body: data,
      }),
      providesTags: ["Tax"],
    }),

    // Get all tax rules (admin only)
    getAllTaxRules: builder.query({
      query: () => ({
        url: "/tax/",
        method: "GET",
      }),
      providesTags: ["Tax"],
    }),

    // Delete a tax rule (admin only)
    deleteTaxRule: builder.mutation({
      query: (id) => ({
        url: `/tax/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Tax"],
    }),
  }),
});

export const {
  useCreateOrUpdateTaxMutation,
  useCalculateTaxMutation,
  useGetAllTaxRulesQuery,
  useDeleteTaxRuleMutation,
} = taxApiSlice;