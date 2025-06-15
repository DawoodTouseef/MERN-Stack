import { apiSlice } from "./apiSlice";

export const configApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Fetch configuration settings
    fetchConfig: builder.query({
      query: () => "/api/config",
      providesTags: ["Config"],
    }),

    // Update configuration settings
    updateConfig: builder.mutation({
      query: (config) => ({
        url: "/api/config",
        method: "PUT",
        body: config,
      }),
      invalidatesTags: ["Config"],
    }),
  }),
});

export const { useFetchConfigQuery, useUpdateConfigMutation } = configApiSlice;