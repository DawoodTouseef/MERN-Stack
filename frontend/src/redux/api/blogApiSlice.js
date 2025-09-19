import { apiSlice } from "./apiSlice";
import { PAGESURL } from "../constants";

export const blogApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Fetch all blog posts
    fetchBlogPosts: builder.query({
      query: ({ page = 1, limit = 6, search = "" }) => {
        const params = new URLSearchParams({
          page,
          limit,
          search
        });
        return `${PAGESURL}/blog?${params}`;
      },
      providesTags: ["BlogPost"],
    }),
    
    // Fetch a single blog post by ID
    fetchBlogPostById: builder.query({
      query: (id) => `${PAGESURL}/${id}`,
      providesTags: (result, error, id) => [{ type: "BlogPost", id }],
    }),
    
    // Fetch all pages
    fetchPages: builder.query({
      query: () => PAGESURL,
      providesTags: ["Page"],
    }),
  }),
});

export const { useFetchBlogPostsQuery, useFetchBlogPostByIdQuery, useFetchPagesQuery } = blogApiSlice;