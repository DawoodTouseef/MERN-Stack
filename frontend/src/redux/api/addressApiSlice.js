import { apiSlice } from "./apiSlice";
import { ADDRESS_URL } from "../constants";


const addressApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAddress: builder.query({
        query: () => ({
            url: `${ADDRESS_URL}/`,
            method: "GET",
        }),
        providesTags: ["Address"],
        }),
        addAddress: builder.mutation({
        query: (address) => ({
            url: `${ADDRESS_URL}/`,
            method: "POST",
            body: address,
        }),
        invalidatesTags: ["Address"],
        }),
        updateAddress: builder.mutation({
        query: (address) => ({
            url: `${ADDRESS_URL}/${address._id}`,
            method: "PUT",
            body: address,
        }),
        invalidatesTags: ["Address"],
        }),
        deleteAddress: builder.mutation({
        query: (id) => ({
            url: `${ADDRESS_URL}/${id}`,
            method: "DELETE",
        }),
        invalidatesTags: ["Address"],
        }),
        deleteAllAddresses: builder.mutation({
        query: () => ({
            url: `${ADDRESS_URL}/`,
            method: "DELETE",
        }),
        invalidatesTags: ["Address"],
        }),


    }),
    });

export const {
  useGetAddressQuery,
  useAddAddressMutation,
  useUpdateAddressMutation,
    useDeleteAddressMutation,
} = addressApiSlice;