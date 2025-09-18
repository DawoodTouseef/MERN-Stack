import { apiSlice } from "./apiSlice";

export const taxApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Enhanced Tax Rules Management
    createOrUpdateTax: builder.mutation({
      query: (data) => ({
        url: "/tax/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Tax"],
    }),

    // Bulk upload tax rules
    bulkUploadTaxRules: builder.mutation({
      query: (data) => ({
        url: "/tax/bulk-upload",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Tax"],
    }),

    // Advanced tax calculation
    calculateAdvancedTax: builder.mutation({
      query: (data) => ({
        url: "/tax/calculate-advanced",
        method: "POST",
        body: data,
      }),
      providesTags: ["Tax"],
    }),

    // Legacy tax calculation
    calculateTax: builder.mutation({
      query: (data) => ({
        url: "/tax/calculate",
        method: "POST",
        body: data,
      }),
      providesTags: ["Tax"],
    }),

    // Get all tax rules with filtering
    getAllTaxRules: builder.query({
      query: (params = {}) => ({
        url: "/tax/",
        method: "GET",
        params,
      }),
      providesTags: ["Tax"],
    }),

    // Tax Exemptions
    createTaxExemption: builder.mutation({
      query: (data) => ({
        url: "/tax/exemptions",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["TaxExemption"],
    }),

    getTaxExemptions: builder.query({
      query: (params = {}) => ({
        url: "/tax/exemptions",
        method: "GET",
        params,
      }),
      providesTags: ["TaxExemption"],
    }),

    // Tax Configuration
    createOrUpdateTaxConfig: builder.mutation({
      query: (data) => ({
        url: "/tax/config",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["TaxConfig"],
    }),

    getTaxConfig: builder.query({
      query: () => ({
        url: "/tax/config",
        method: "GET",
      }),
      providesTags: ["TaxConfig"],
    }),

    // Test third-party service
    testTaxServiceConnection: builder.mutation({
      query: (data) => ({
        url: "/tax/test-service",
        method: "POST",
        body: data,
      }),
    }),

    // Delete a tax rule
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
  useBulkUploadTaxRulesMutation,
  useCalculateAdvancedTaxMutation,
  useCalculateTaxMutation,
  useGetAllTaxRulesQuery,
  useCreateTaxExemptionMutation,
  useGetTaxExemptionsQuery,
  useCreateOrUpdateTaxConfigMutation,
  useGetTaxConfigQuery,
  useTestTaxServiceConnectionMutation,
  useDeleteTaxRuleMutation,
} = taxApiSlice;

