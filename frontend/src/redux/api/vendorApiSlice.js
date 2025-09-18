import { apiSlice } from './apiSlice';
import { VENDORS_URL } from '../constants';

export const vendorApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Vendor dashboard endpoints
    getVendorDashboard: builder.query({
      query: () => ({
        url: `${VENDORS_URL}/dashboard`,
      }),
      keepUnusedDataFor: 5,
      providesTags: ['Vendor'],
    }),
    
    // Vendor analytics endpoints
    getVendorSalesAnalytics: builder.query({
      query: ({ startDate, endDate, groupBy }) => ({
        url: `${VENDORS_URL}/analytics/sales`,
        params: { startDate, endDate, groupBy },
      }),
      keepUnusedDataFor: 5,
    }),
    
    getVendorProductAnalytics: builder.query({
      query: ({ startDate, endDate, limit, sortBy }) => ({
        url: `${VENDORS_URL}/analytics/products`,
        params: { startDate, endDate, limit, sortBy },
      }),
      keepUnusedDataFor: 5,
    }),
    
    getVendorCustomerAnalytics: builder.query({
      query: ({ startDate, endDate, segment }) => ({
        url: `${VENDORS_URL}/analytics/customers`,
        params: { startDate, endDate, segment },
      }),
      keepUnusedDataFor: 5,
    }),
    
    getVendorInventoryAnalytics: builder.query({
      query: () => ({
        url: `${VENDORS_URL}/analytics/inventory`,
      }),
      keepUnusedDataFor: 5,
    }),
    
    // Admin vendor management endpoints
    getVendors: builder.query({
      query: ({ pageNumber, pageSize }) => ({
        url: VENDORS_URL,
        params: { pageNumber, pageSize },
      }),
      keepUnusedDataFor: 5,
      providesTags: ['Vendors'],
    }),
    
    getVendorDetails: builder.query({
      query: (vendorId) => ({
        url: `${VENDORS_URL}/${vendorId}`,
      }),
      keepUnusedDataFor: 5,
      providesTags: (result, error, vendorId) => [{ type: 'Vendor', id: vendorId }],
    }),
    
    createVendor: builder.mutation({
      query: (vendorData) => ({
        url: VENDORS_URL,
        method: 'POST',
        body: vendorData,
      }),
      invalidatesTags: ['Vendors'],
    }),
    
    updateVendor: builder.mutation({
      query: ({ vendorId, ...vendorData }) => ({
        url: `${VENDORS_URL}/${vendorId}`,
        method: 'PUT',
        body: vendorData,
      }),
      invalidatesTags: (result, error, { vendorId }) => [
        { type: 'Vendor', id: vendorId },
        'Vendors'
      ],
    }),
    
    deleteVendor: builder.mutation({
      query: (vendorId) => ({
        url: `${VENDORS_URL}/${vendorId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Vendors'],
    }),
    
    // Admin vendor verification endpoints
    verifyVendor: builder.mutation({
      query: (vendorId) => ({
        url: `${VENDORS_URL}/${vendorId}/verify`,
        method: 'PUT',
      }),
      invalidatesTags: ['Vendors'],
    }),
    
    rejectVendor: builder.mutation({
      query: (vendorId) => ({
        url: `${VENDORS_URL}/${vendorId}/reject`,
        method: 'PUT',
      }),
      invalidatesTags: ['Vendors'],
    }),
  }),
});

export const {
  useGetVendorDashboardQuery,
  useGetVendorSalesAnalyticsQuery,
  useGetVendorProductAnalyticsQuery,
  useGetVendorCustomerAnalyticsQuery,
  useGetVendorInventoryAnalyticsQuery,
  useGetVendorsQuery,
  useGetVendorDetailsQuery,
  useCreateVendorMutation,
  useUpdateVendorMutation,
  useDeleteVendorMutation,
  useVerifyVendorMutation,
  useRejectVendorMutation,
} = vendorApiSlice;