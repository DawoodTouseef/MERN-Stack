import { apiSlice } from "./apiSlice";

const translateApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    translateText: builder.mutation({
      query: ({ text, sourceLang = 'en', targetLang = 'hi' }) => ({
        url: 'translate',
        method: 'POST',
        body: { text, sourceLang, targetLang },
      }),
    }),
  }),
});

export const { useTranslateTextMutation } = translateApiSlice;
