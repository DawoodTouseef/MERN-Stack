import { apiSlice } from './apiSlice';
import { RECOMMENDATIONS_URL } from '../constants';

export const recommendationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Track user behavior
    trackBehavior: builder.mutation({
      query: (behaviorData) => ({
        url: `${RECOMMENDATIONS_URL}/track-behavior`,
        method: 'POST',
        body: behaviorData,
      }),
    }),

    // Get personalized recommendations
    getPersonalizedRecommendations: builder.query({
      query: ({ page = 'homepage', cartItems, forceRefresh = false }) => {
        const params = new URLSearchParams({
          page,
          forceRefresh: forceRefresh.toString(),
        });
        if (cartItems && cartItems.length > 0) {
          params.append('cartItems', JSON.stringify(cartItems));
        }
        return `${RECOMMENDATIONS_URL}/personalized?${params}`;
      },
      providesTags: ['Recommendations'],
    }),

    // Get product recommendations (similar products)
    getProductRecommendations: builder.query({
      query: ({ productId, limit = 8 }) => 
        `${RECOMMENDATIONS_URL}/product/${productId}/similar?limit=${limit}`,
      providesTags: (result, error, { productId }) => [
        { type: 'ProductRecommendations', id: productId }
      ],
    }),

    // Get cart-based recommendations
    getCartRecommendations: builder.mutation({
      query: ({ cartItems, limit = 6 }) => ({
        url: `${RECOMMENDATIONS_URL}/cart-recommendations?limit=${limit}`,
        method: 'POST',
        body: { cartItems },
      }),
    }),

    // Get trending products
    getTrendingProducts: builder.query({
      query: ({ limit = 10, category, priceRange } = {}) => {
        const params = new URLSearchParams({ limit: limit.toString() });
        if (category) params.append('category', category);
        if (priceRange) params.append('priceRange', priceRange);
        return `${RECOMMENDATIONS_URL}/trending?${params}`;
      },
      providesTags: ['TrendingProducts'],
    }),

    // Get user behavior analytics
    getUserBehaviorAnalytics: builder.query({
      query: ({ days = 30 } = {}) => 
        `${RECOMMENDATIONS_URL}/user-analytics?days=${days}`,
      providesTags: ['UserAnalytics'],
    }),

    // Submit recommendation feedback
    submitRecommendationFeedback: builder.mutation({
      query: (feedbackData) => ({
        url: `${RECOMMENDATIONS_URL}/feedback`,
        method: 'POST',
        body: feedbackData,
      }),
      invalidatesTags: ['Recommendations'],
    }),

    // Refresh recommendations
    refreshRecommendations: builder.mutation({
      query: () => ({
        url: `${RECOMMENDATIONS_URL}/refresh`,
        method: 'POST',
      }),
      invalidatesTags: ['Recommendations'],
    }),

    // Admin: Get recommendation metrics
    getRecommendationMetrics: builder.query({
      query: ({ startDate, endDate, modelName } = {}) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (modelName) params.append('modelName', modelName);
        return `${RECOMMENDATIONS_URL}/metrics?${params}`;
      },
      providesTags: ['RecommendationMetrics'],
    }),
  }),
});

export const {
  useTrackBehaviorMutation,
  useGetPersonalizedRecommendationsQuery,
  useGetProductRecommendationsQuery,
  useGetCartRecommendationsMutation,
  useGetTrendingProductsQuery,
  useGetUserBehaviorAnalyticsQuery,
  useSubmitRecommendationFeedbackMutation,
  useRefreshRecommendationsMutation,
  useGetRecommendationMetricsQuery,
} = recommendationApiSlice;