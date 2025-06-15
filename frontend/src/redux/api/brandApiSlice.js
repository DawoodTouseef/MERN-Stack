import { apiSlice } from "./apiSlice";
import { BRAND_URL } from "../constants";



const brandApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBrands: builder.query({
      query: () => ({
        url: `${BRAND_URL}/`,
        method: "GET",
      }),
      providesTags: ["Brand"],
    }),
    addBrand: builder.mutation({
      query: (brand) => ({
        url: `${BRAND_URL}/`,
        method: "POST",
        body: brand,
      }),
      invalidatesTags: ["Brand"],
    }),
    updateBrand: builder.mutation({
      query: (brand) => ({
        url: `${BRAND_URL}/${brand._id}`,
        method: "PUT",
        body: brand,
      }),
      invalidatesTags: ["Brand"],
    }),
    deleteBrand: builder.mutation({
      query: (id) => ({
        url: `${BRAND_URL}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Brand"],
    }),
    getBrandById: builder.query({
      query: (id) => ({
        url: `${BRAND_URL}/${id}`,
        method: "GET",
      }),
      providesTags: ["Brand"],
    }),
  }),
});

export const {
  useGetBrandsQuery,
  useAddBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
  useGetBrandByIdQuery,
} = brandApiSlice;