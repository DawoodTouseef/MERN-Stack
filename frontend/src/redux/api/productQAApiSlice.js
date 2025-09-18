import { PRODUCT_URL } from "../constants";
import { apiSlice } from "./apiSlice";

export const productQAApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get Q&A for a product
    getProductQA: builder.query({
      query: ({ productId, ...params }) => ({
        url: `${PRODUCT_URL}/${productId}/qa`,
        params,
      }),
      keepUnusedDataFor: 5,
      providesTags: ["ProductQA"],
    }),

    // Ask a question
    askQuestion: builder.mutation({
      query: ({ productId, ...questionData }) => ({
        url: `${PRODUCT_URL}/${productId}/qa/ask`,
        method: "POST",
        body: questionData,
      }),
      invalidatesTags: ["ProductQA"],
    }),

    // Answer a question
    answerQuestion: builder.mutation({
      query: ({ qaId, ...answerData }) => ({
        url: `${PRODUCT_URL}/qa/${qaId}/answer`,
        method: "POST",
        body: answerData,
      }),
      invalidatesTags: ["ProductQA"],
    }),

    // Vote on a question
    voteOnQuestion: builder.mutation({
      query: ({ qaId, isHelpful }) => ({
        url: `${PRODUCT_URL}/qa/${qaId}/vote-question`,
        method: "POST",
        body: { isHelpful },
      }),
      invalidatesTags: ["ProductQA"],
    }),

    // Vote on an answer
    voteOnAnswer: builder.mutation({
      query: ({ qaId, answerId, isHelpful }) => ({
        url: `${PRODUCT_URL}/qa/${qaId}/answers/${answerId}/vote`,
        method: "POST",
        body: { isHelpful },
      }),
      invalidatesTags: ["ProductQA"],
    }),

    // Mark best answer
    markBestAnswer: builder.mutation({
      query: ({ qaId, answerId }) => ({
        url: `${PRODUCT_URL}/qa/${qaId}/best-answer/${answerId}`,
        method: "PUT",
      }),
      invalidatesTags: ["ProductQA"],
    }),

    // Follow/unfollow a question
    followQuestion: builder.mutation({
      query: ({ qaId, notificationPreferences }) => ({
        url: `${PRODUCT_URL}/qa/${qaId}/follow`,
        method: "POST",
        body: { notificationPreferences },
      }),
      invalidatesTags: ["ProductQA"],
    }),

    unfollowQuestion: builder.mutation({
      query: ({ qaId }) => ({
        url: `${PRODUCT_URL}/qa/${qaId}/follow`,
        method: "DELETE",
      }),
      invalidatesTags: ["ProductQA"],
    }),
  }),
});

export const {
  useGetProductQAQuery,
  useAskQuestionMutation,
  useAnswerQuestionMutation,
  useVoteOnQuestionMutation,
  useVoteOnAnswerMutation,
  useMarkBestAnswerMutation,
  useFollowQuestionMutation,
  useUnfollowQuestionMutation,
} = productQAApiSlice;