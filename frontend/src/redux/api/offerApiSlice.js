import { apiSlice } from "./apiSlice";
import { OFFER_URL } from "../constants";

export const offerApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    fetchOffers: builder.query({
      query: () =>({
       url:  `${OFFER_URL}`,
       method:"GET"
  })
}),
    fetchOfferById: builder.query({
      query: (id) => `${OFFER_URL}/${id}`,
      providesTags: (result, error, id) => [{ type: "Offer", id }],
    }),
    createOffer: builder.mutation({
      query: (offerData) => ({
        url: `${OFFER_URL}`,
        method: "POST",
        body: offerData,
      }),
      invalidatesTags: ["Offer"],
    }),
    updateOffer: builder.mutation({
      query: ({ id, offerData }) => ({
        url: `${OFFER_URL}/${id}`,
        method: "PUT",
        body: offerData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Offer", id }],
    }),
    deleteOffer: builder.mutation({
      query: (id) => ({
        url: `${OFFER_URL}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Offer", id }],
    }),
  }),
});

export const {
  useFetchOffersQuery,
  useFetchOfferByIdQuery,
  useCreateOfferMutation,
  useUpdateOfferMutation,
  useDeleteOfferMutation,
} = offerApiSlice;