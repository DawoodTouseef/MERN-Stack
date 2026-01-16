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

    // Vendor profile endpoint
    getVendorProfile: builder.query({
      query: () => ({
        url: `${VENDORS_URL}/profile`,
      }),
      keepUnusedDataFor: 5,
      providesTags: ['Vendor'],
    }),

    // Vendor analytics endpoints
    getVendorSalesAnalytics: builder.query({
      query: ({ startDate, endDate, groupBy }) => {
        // Build query parameters
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', new Date(startDate).toISOString());
        if (endDate) params.append('endDate', new Date(endDate).toISOString());
        if (groupBy) params.append('groupBy', groupBy);

        return {
          url: `${VENDORS_URL}/analytics/sales?${params.toString()}`,
          validateStatus: (response) => response.status < 500, // Allow 4xx errors to be handled gracefully
        };
      },
      keepUnusedDataFor: 5,
      transformErrorResponse: (response) => {
        console.error('Vendor Sales Analytics Error:', response);
        return response;
      }
    }),

    getVendorProductAnalytics: builder.query({
      query: ({ startDate, endDate, limit, sortBy }) => {
        // Build query parameters
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (limit) params.append('limit', limit);
        if (sortBy) params.append('sortBy', sortBy);

        return {
          url: `${VENDORS_URL}/analytics/products?${params.toString()}`,
        };
      },
      keepUnusedDataFor: 5,
    }),

    getVendorCustomerAnalytics: builder.query({
      query: ({ startDate, endDate, segment }) => {
        // Build query parameters
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (segment) params.append('segment', segment);

        return {
          url: `${VENDORS_URL}/analytics/customers?${params.toString()}`,
        };
      },
      keepUnusedDataFor: 5,
    }),

    getVendorInventoryAnalytics: builder.query({
      query: () => ({
        url: `${VENDORS_URL}/analytics/inventory`,
      }),
      keepUnusedDataFor: 5,
    }),

    // Debug endpoints
    checkVendorProducts: builder.query({
      query: () => ({
        url: `${VENDORS_URL}/debug/products`,
      }),
      keepUnusedDataFor: 5,
    }),

    // Admin vendor management endpoints
    getVendors: builder.query({
      query: ({ pageNumber, pageSize }) => {
        // Build query parameters
        const params = new URLSearchParams();
        if (pageNumber) params.append('pageNumber', pageNumber);
        if (pageSize) params.append('pageSize', pageSize);

        return {
          url: `${VENDORS_URL}?${params.toString()}`,
        };
      },
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
      query: ({ id, status, remarks, documentStatuses }) => ({
        url: `${VENDORS_URL}/${id}/verify`,
        method: 'PUT',
        body: { status, remarks, documentStatuses }
      }),
      invalidatesTags: ['Vendors'],
    }),

    // Legacy support (alias to verifyVendor for now)
    rejectVendor: builder.mutation({
      query: (vendorId) => ({
        url: `${VENDORS_URL}/${vendorId}/verify`,
        method: 'PUT',
        body: { status: 'rejected' }
      }),
      invalidatesTags: ['Vendors'],
    }),
  }),
});

export const {
  useGetVendorDashboardQuery,
  useGetVendorProfileQuery,
  useGetVendorSalesAnalyticsQuery,
  useGetVendorProductAnalyticsQuery,
  useGetVendorCustomerAnalyticsQuery,
  useGetVendorInventoryAnalyticsQuery,
  useCheckVendorProductsQuery,
  useGetVendorsQuery,
  useGetVendorDetailsQuery,
  useCreateVendorMutation,
  useUpdateVendorMutation,
  useDeleteVendorMutation,
  useVerifyVendorMutation,
  useRejectVendorMutation,
} = vendorApiSlice;