import { PRODUCT_URL, UPLOAD_URL } from "../constants";
import { apiSlice } from "./apiSlice";

export const productApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: ({ keyword }) => ({
        url: `${PRODUCT_URL}`,
        params: { keyword },
      }),
      keepUnusedDataFor: 5,
      providesTags: ["Products"],
    }),

    getProductById: builder.query({
      query: (productId) => `${PRODUCT_URL}/${productId}`,
      providesTags: (result, error, productId) => [
        { type: "Product", id: productId },
      ],
    }),

    allProducts: builder.query({
      query: () => `${PRODUCT_URL}/allProducts`,
    }),

    getProductDetails: builder.query({
      query: (productId) => ({
        url: `${PRODUCT_URL}/${productId}`,
      }),
      keepUnusedDataFor: 5,
    }),

    createProduct: builder.mutation({
      query: (productData) => ({
        url: `${PRODUCT_URL}`,
        method: "POST",
        body: productData,
      }),
      invalidatesTags: ["Product"],
    }),

    updateProduct: builder.mutation({
      query: ({ productId, formData }) => ({
        url: `${PRODUCT_URL}/${productId}`,
        method: "PUT",
        body: formData,
      }),
    }),

    uploadProductImage: builder.mutation({
      query: (data) => ({
        url: `${UPLOAD_URL}`,
        method: "POST",
        body: data,
      }),
    }),
    deleteProductImage: builder.mutation({
      query: (data) => ({
        url: `${UPLOAD_URL}`,
        method: "DELETE",
        body: data,
      }),
    }),
    deleteProduct: builder.mutation({
      query: (productId) => ({
        url: `${PRODUCT_URL}/${productId}`,
        method: "DELETE",
      }),
      providesTags: ["Product"],
    }),

    createReview: builder.mutation({
      query: (data) => ({
        url: `${PRODUCT_URL}/${data.productId}/reviews`,
        method: "POST",
        body: data,
      }),
    }),

    getTopProducts: builder.query({
      query: () => `${PRODUCT_URL}/top`,
      keepUnusedDataFor: 5,
    }),

    getNewProducts: builder.query({
      query: () => `${PRODUCT_URL}/new`,
      keepUnusedDataFor: 5,
    }),

    getFilteredProducts: builder.query({
      query: ({ checked, radio }) => ({
        url: `${PRODUCT_URL}/filtered-products`,
        method: "POST",
        body: { checked, radio },
      }),
    }),

    // Advanced search endpoint
    advancedSearch: builder.query({
      query: (searchParams) => ({
        url: `${PRODUCT_URL}/search/advanced`,
        params: searchParams,
      }),
      keepUnusedDataFor: 5,
      providesTags: ["Products"],
    }),

    // Faceted search endpoint with comprehensive filters
    facetedSearch: builder.query({
      query: (searchParams) => ({
        url: `${PRODUCT_URL}/search/faceted`,
        params: searchParams,
      }),
      keepUnusedDataFor: 5,
      providesTags: ["Products"],
    }),

    // Search suggestions endpoint
    getSearchSuggestions: builder.query({
      query: (query) => ({
        url: `${PRODUCT_URL}/search/suggestions`,
        params: { query },
      }),
      keepUnusedDataFor: 2,
    }),

    // Enhanced review endpoints
    getProductReviews: builder.query({
      query: ({ productId, ...params }) => ({
        url: `${PRODUCT_URL}/${productId}/reviews`,
        params,
      }),
      providesTags: ["Reviews"],
    }),

    updateReview: builder.mutation({
      query: ({ reviewId, ...data }) => ({
        url: `${PRODUCT_URL}/reviews/${reviewId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Reviews", "Products"],
    }),

    voteOnReview: builder.mutation({
      query: (data) => ({
        url: `${PRODUCT_URL}/reviews/vote`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Reviews"],
    }),

    reportReview: builder.mutation({
      query: (data) => ({
        url: `${PRODUCT_URL}/reviews/report`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Reviews"],
    }),

    addVendorResponse: builder.mutation({
      query: (data) => ({
        url: `${PRODUCT_URL}/reviews/vendor-response`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Reviews"],
    }),

    // Flash sales endpoint
    getFlashSales: builder.query({
      query: ({ active = true, limit = 8 }) => ({
        url: `${PRODUCT_URL}/flash-sales`,
        params: { active, limit },
      }),
      keepUnusedDataFor: 5,
      providesTags: ["FlashSales"],
    }),

    // Trending products endpoint
    getTrendingProducts: builder.query({
      query: ({ limit = 12, location, category, timeframe = '7d' }) => {
        const params = { limit, timeframe };
        if (location) {
          params.latitude = location.latitude;
          params.longitude = location.longitude;
        }
        if (category) params.category = category;
        
        return {
          url: `${PRODUCT_URL}/trending`,
          params,
        };
      },
      keepUnusedDataFor: 5,
      providesTags: ["TrendingProducts"],
    }),
  }),
});

export const {
  useGetProductByIdQuery,
  useGetProductsQuery,
  useGetProductDetailsQuery,
  useAllProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useCreateReviewMutation,
  useGetTopProductsQuery,
  useGetNewProductsQuery,
  useUploadProductImageMutation,
  useGetFilteredProductsQuery,
  useDeleteProductImageMutation,
  useAdvancedSearchQuery,
  useFacetedSearchQuery,
  useGetSearchSuggestionsQuery,
  useGetProductReviewsQuery,
  useUpdateReviewMutation,
  useVoteOnReviewMutation,
  useReportReviewMutation,
  useAddVendorResponseMutation,
  useGetFlashSalesQuery,
  useGetTrendingProductsQuery,
} = productApiSlice;
