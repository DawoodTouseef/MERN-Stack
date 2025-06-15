import { apiSlice } from "./apiSlice";
import { BANNER_URL } from "../constants";

export const bannerApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Fetch all banners
    fetchBanners: builder.query({
      query: () => `${BANNER_URL}`,
      providesTags: ["Banner"],
    }),

    // Fetch a single banner by ID
    fetchBannerById: builder.query({
      query: (id) => `${BANNER_URL}/${id}`,
      providesTags: (result, error, id) => [{ type: "Banner", id }],
    }),

    // Create a new banner
    createBanner: builder.mutation({
      query: (bannerData) => ({
        url: `${BANNER_URL}`,
        method: "POST",
        body: bannerData,
      }),
      invalidatesTags: ["Banner"],
    }),

    // Update an existing banner
    updateBanner: builder.mutation({
      query: ({ id, bannerData }) => ({
        url: `${BANNER_URL}/${id}`,
        method: "PUT",
        body: bannerData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Banner", id }],
    }),

    // Delete a banner
    deleteBanner: builder.mutation({
      query: (id) => ({
        url: `${BANNER_URL}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Banner", id }],
    }),
  }),
});

export const {
  useFetchBannersQuery,
  useFetchBannerByIdQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
} = bannerApiSlice;