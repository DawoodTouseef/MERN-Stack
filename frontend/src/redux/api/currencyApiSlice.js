import { apiSlice } from "./apiSlice";
import { EXCHANGE_URL } from "../constants";

export const currencyApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getExchangeApiKey: builder.query({
      query: () => EXCHANGE_URL,
      providesTags: ['Currency'],
    }),
    
    // Currency management endpoints
    getCurrencies: builder.query({
      query: () => '/api/currencies',
      providesTags: ['Currency'],
    }),
    
    getAllCurrencies: builder.query({
      query: () => '/api/currencies/all',
      providesTags: ['Currency'],
    }),
    
    getCurrencyByCode: builder.query({
      query: (code) => `/api/currencies/${code}`,
      providesTags: ['Currency'],
    }),
    
    createOrUpdateCurrency: builder.mutation({
      query: (currencyData) => ({
        url: '/api/currencies',
        method: 'POST',
        body: currencyData,
      }),
      invalidatesTags: ['Currency'],
    }),
    
    updateCurrency: builder.mutation({
      query: ({ code, ...currencyData }) => ({
        url: `/api/currencies/${code}`,
        method: 'PUT',
        body: currencyData,
      }),
      invalidatesTags: ['Currency'],
    }),
    
    deleteCurrency: builder.mutation({
      query: (code) => ({
        url: `/api/currencies/${code}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Currency'],
    }),
    
    setDefaultCurrency: builder.mutation({
      query: (currencyData) => ({
        url: '/api/currencies/default',
        method: 'PUT',
        body: currencyData,
      }),
      invalidatesTags: ['Currency'],
    }),
    
    updateExchangeRates: builder.mutation({
      query: () => ({
        url: '/api/currencies/update-rates',
        method: 'POST',
      }),
      invalidatesTags: ['Currency'],
    }),
    
    convertCurrency: builder.mutation({
      query: (conversionData) => ({
        url: '/api/currencies/convert',
        method: 'POST',
        body: conversionData,
      }),
    }),
    
    // API Configuration endpoints
    getCurrencyApiConfig: builder.query({
      query: () => '/api/currencies/config',
      providesTags: ['CurrencyConfig'],
    }),
    
    updateCurrencyApiConfig: builder.mutation({
      query: (configData) => ({
        url: '/api/currencies/config',
        method: 'PUT',
        body: configData,
      }),
      invalidatesTags: ['CurrencyConfig'],
    }),
  }),
});

export const {
  useGetExchangeApiKeyQuery,
  useGetCurrenciesQuery,
  useGetAllCurrenciesQuery,
  useGetCurrencyByCodeQuery,
  useCreateOrUpdateCurrencyMutation,
  useUpdateCurrencyMutation,
  useDeleteCurrencyMutation,
  useSetDefaultCurrencyMutation,
  useUpdateExchangeRatesMutation,
  useConvertCurrencyMutation,
  useGetCurrencyApiConfigQuery,
  useUpdateCurrencyApiConfigMutation,
} = currencyApiSlice;