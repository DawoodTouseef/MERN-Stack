import { apiSlice } from "./apiSlice";
import { USERS_URL } from "../constants";

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/auth`,
        method: "POST",
        body: data,
      }),
    }),
    register: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}`,
        method: "POST",
        body: data,
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: `${USERS_URL}/logout`,
        method: "POST",
      }),
    }),
    profile: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/profile`,
        method: "PUT",
        body: data,
      }),
    }),
    // New endpoint for upgrading seller to vendor
    upgradeToVendor: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/upgrade-to-vendor`,
        method: "POST",
        body: data,
      }),
    }),
    getUsers: builder.query({
      query: (params) => {
        const { search, role, status, sortBy, sortOrder, page, limit } = params || {};
        let url = USERS_URL;
        
        // Build query string
        const queryParams = new URLSearchParams();
        if (search) queryParams.append('search', search);
        if (role && role !== 'all') queryParams.append('role', role);
        if (status && status !== 'all') queryParams.append('status', status);
        if (sortBy) queryParams.append('sortBy', sortBy);
        if (sortOrder) queryParams.append('sortOrder', sortOrder);
        if (page) queryParams.append('page', page);
        if (limit) queryParams.append('limit', limit);
        
        if (queryParams.toString()) {
          url += `?${queryParams.toString()}`;
        }
        
        return { url };
      },
      providesTags: ["User"],
      keepUnusedDataFor: 5,
    }),
    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `${USERS_URL}/${userId}`,
        method: "DELETE",
      }),
    }),
    updateUser: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/${data.userId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    getUserDetails: builder.query({
      query: (id) => ({
        url: `${USERS_URL}/${id}`,
      }),
      keepUnusedDataFor: 5,
    }),
    requestPassword:builder.mutation({
    query:(email) => ({
        url: `${USERS_URL}/request-password`,
        method: "POST",
        body: email,
      }),
      invalidatesTags: ["User"],
    }),
    changePassword:builder.mutation({
    query:(data) => ({
        url: `${USERS_URL}/reset-password`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    // Vendor verification endpoints
    verifyVendor: builder.mutation({
      query: (userId) => ({
        url: `${USERS_URL}/${userId}/verify-vendor`,
        method: "PUT",
      }),
      invalidatesTags: ["User"],
    }),
    rejectVendor: builder.mutation({
      query: (userId) => ({
        url: `${USERS_URL}/${userId}/reject-vendor`,
        method: "PUT",
      }),
      invalidatesTags: ["User"],
    })
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
  useProfileMutation,
  useGetUsersQuery,
  useDeleteUserMutation,
  useUpdateUserMutation,
  useGetUserDetailsQuery,
  useRequestPasswordMutation,
  useChangePasswordMutation,
  useVerifyVendorMutation,
  useRejectVendorMutation,
  useUpgradeToVendorMutation
} = userApiSlice;
