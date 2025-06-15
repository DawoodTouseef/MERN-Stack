import { apiSlice } from "./apiSlice";
import { PAGESURL } from "../constants";

export const pagesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Fetch all pages
    fetchPages: builder.query({
      query: () => `${PAGESURL}`,
      providesTags: ["Page"],
    }),

    // Fetch a single page by ID
    fetchPageById: builder.query({
      query: (id) => `${PAGESURL}/${id}`,
      providesTags: (result, error, id) => [{ type: "Page", id }],
    }),

    // Create a new page
    createPage: builder.mutation({
      query: (pageData) => ({
        url: `${PAGESURL}`,
        method: "POST",
        body: pageData,
      }),
      invalidatesTags: ["Page"],
    }),

    // Update an existing page
    updatePage: builder.mutation({
      query: ({ id, pageData }) => ({
        url: `${PAGESURL}/${id}`,
        method: "PUT",
        body: pageData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Page", id }],
    }),

    // Delete a page
    deletePage: builder.mutation({
      query: (id) => ({
        url: `${PAGESURL}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Page", id }],
    }),
  }),
});

export const {
  useFetchPagesQuery,
  useFetchPageByIdQuery,
  useCreatePageMutation,
  useUpdatePageMutation,
  useDeletePageMutation,
} = pagesApiSlice;