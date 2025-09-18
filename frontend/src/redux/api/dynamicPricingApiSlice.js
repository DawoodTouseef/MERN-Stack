import { apiSlice } from "./apiSlice";

const PRICING_URL = "/api/pricing";

export const dynamicPricingApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get active flash sales
    getActiveFlashSales: builder.query({
      query: ({ limit = 10, category, brand } = {}) => {
        const params = new URLSearchParams({ limit: limit.toString() });
        if (category) params.append('category', category);
        if (brand) params.append('brand', brand);
        return `${PRICING_URL}/flash-sales?${params}`;
      },
      providesTags: ["FlashSales"],
      keepUnusedDataFor: 60, // 1 minute cache for flash sales
    }),

    // Calculate dynamic price
    calculateDynamicPrice: builder.mutation({
      query: (priceData) => ({
        url: `${PRICING_URL}/calculate`,
        method: "POST",
        body: priceData,
      }),
    }),

    // Admin: Get all pricing rules
    getAllPricingRules: builder.query({
      query: ({ status, pricingType, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = {}) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          sortBy,
          sortOrder
        });
        if (status) params.append('status', status);
        if (pricingType) params.append('pricingType', pricingType);
        return `${PRICING_URL}?${params}`;
      },
      providesTags: ["PricingRules"],
    }),

    // Admin: Create pricing rule
    createPricingRule: builder.mutation({
      query: (pricingData) => ({
        url: PRICING_URL,
        method: "POST",
        body: pricingData,
      }),
      invalidatesTags: ["PricingRules", "FlashSales"],
    }),

    // Admin: Update pricing rule
    updatePricingRule: builder.mutation({
      query: ({ id, ...pricingData }) => ({
        url: `${PRICING_URL}/${id}`,
        method: "PUT",
        body: pricingData,
      }),
      invalidatesTags: ["PricingRules", "FlashSales"],
    }),

    // Admin: Delete pricing rule
    deletePricingRule: builder.mutation({
      query: (id) => ({
        url: `${PRICING_URL}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["PricingRules", "FlashSales"],
    }),

    // Admin: Toggle pricing status
    togglePricingStatus: builder.mutation({
      query: ({ id, action }) => ({
        url: `${PRICING_URL}/${id}/toggle`,
        method: "PATCH",
        body: { action },
      }),
      invalidatesTags: ["PricingRules", "FlashSales"],
    }),

    // Admin: Get pricing analytics
    getPricingAnalytics: builder.query({
      query: ({ startDate, endDate, pricingType } = {}) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (pricingType) params.append('pricingType', pricingType);
        return `${PRICING_URL}/analytics/overview?${params}`;
      },
      providesTags: ["PricingAnalytics"],
    }),

    // Admin: Get surge pricing recommendations
    getSurgePricingRecommendations: builder.query({
      query: ({ days = 7 } = {}) => ({
        url: `${PRICING_URL}/surge/recommendations?days=${days}`,
      }),
      providesTags: ["SurgeRecommendations"],
    }),
  }),
});

export const {
  useGetActiveFlashSalesQuery,
  useCalculateDynamicPriceMutation,
  useGetAllPricingRulesQuery,
  useCreatePricingRuleMutation,
  useUpdatePricingRuleMutation,
  useDeletePricingRuleMutation,
  useTogglePricingStatusMutation,
  useGetPricingAnalyticsQuery,
  useGetSurgePricingRecommendationsQuery,
} = dynamicPricingApiSlice;