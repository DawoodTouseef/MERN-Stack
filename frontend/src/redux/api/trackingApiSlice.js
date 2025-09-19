import { apiSlice } from "./apiSlice";
import { ORDERS_URL } from "../constants";

export const trackingApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Track order by order number (public endpoint)
    trackOrderByNumber: builder.query({
      query: (orderNumber) => ({
        url: `${ORDERS_URL}/track/${orderNumber}`,
      }),
      providesTags: (result, error, orderNumber) => [{ type: "Tracking", id: orderNumber }],
    }),
  }),
});

export const { useTrackOrderByNumberQuery } = trackingApiSlice;