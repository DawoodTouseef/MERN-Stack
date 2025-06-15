import { apiSlice } from "./apiSlice";
import { EXCHANGE_URL } from "../constants";
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const currencyApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getExchangeApiKey: builder.query({
      query: () => EXCHANGE_URL,
      providesTags: ['Currency'],
    }),

  })
})
export const exchangeRateApi = createApi({
  reducerPath: 'exchangeRateApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://v6.exchangerate-api.com/v6/',
  }),
  endpoints: (builder) => ({
    getLatestRates: builder.mutation({
      query: (base = 'USD') => `latest?base=${base}`,
    }),
    convertCurrency: builder.mutation({
      query: ({ from, to, amount }) =>
        `convert?from=${from}&to=${to}&amount=${amount}`,
    }),

    getExchangeRates: builder.mutation({
      query: ({apiKey,from,to,amount}) => 
        `${apiKey}/latest/convert?from=${from}&to=${to}&amount=${amount}`, // Example with ExchangeRate-API
        method: 'GET',
      }),
    getExchangeCode: builder.mutation({
      query: ({apiKey}) => 
        `${apiKey}/codes`, // Example with ExchangeRate-API
        method: 'GET',
      }),
    })

  })

export const {
  useGetExchangeApiKeyQuery,
} = currencyApiSlice;

export const{
  useConvertCurrencyMutation,
  useGetExchangeCodeMutation,
  useGetExchangeRatesMutation,
  useGetLatestRatesMutation,
}=exchangeRateApi