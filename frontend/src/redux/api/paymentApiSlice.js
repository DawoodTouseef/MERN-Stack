import { apiSlice } from './apiSlice';

const PAYMENT_URL = '/api/payments';

export const paymentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get available payment methods
    getPaymentMethods: builder.query({
      query: (country = 'IN') => `${PAYMENT_URL}/methods?country=${country}`,
      providesTags: ['PaymentMethods']
    }),

    // Create payment intent
    createPaymentIntent: builder.mutation({
      query: (paymentData) => ({
        url: `${PAYMENT_URL}/create-intent`,
        method: 'POST',
        body: paymentData
      }),
      invalidatesTags: ['PaymentTransactions']
    }),

    // Process refund
    processRefund: builder.mutation({
      query: (refundData) => ({
        url: `${PAYMENT_URL}/refund`,
        method: 'POST',
        body: refundData
      }),
      invalidatesTags: ['PaymentTransactions']
    }),

    // Get transaction history
    getTransactionHistory: builder.query({
      query: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return `${PAYMENT_URL}/transactions?${queryString}`;
      },
      providesTags: ['PaymentTransactions']
    }),

    // Get transaction details
    getTransactionDetails: builder.query({
      query: (transactionId) => `${PAYMENT_URL}/transaction/${transactionId}`,
      providesTags: (result, error, transactionId) => [
        { type: 'PaymentTransaction', id: transactionId }
      ]
    }),

    // Admin: Get payment gateways
    getPaymentGateways: builder.query({
      query: () => `${PAYMENT_URL}/gateways`,
      providesTags: ['PaymentGateways']
    }),

    // Admin: Update gateway configuration
    updatePaymentGateway: builder.mutation({
      query: ({ id, ...gatewayData }) => ({
        url: `${PAYMENT_URL}/gateways/${id}`,
        method: 'PUT',
        body: gatewayData
      }),
      invalidatesTags: ['PaymentGateways']
    }),

    // Admin: Get fraud rules
    getFraudRules: builder.query({
      query: () => `${PAYMENT_URL}/fraud-rules`,
      providesTags: ['FraudRules']
    }),

    // Admin: Create fraud rule
    createFraudRule: builder.mutation({
      query: (ruleData) => ({
        url: `${PAYMENT_URL}/fraud-rules`,
        method: 'POST',
        body: ruleData
      }),
      invalidatesTags: ['FraudRules']
    }),

    // Admin: Update fraud rule
    updateFraudRule: builder.mutation({
      query: ({ id, ...ruleData }) => ({
        url: `${PAYMENT_URL}/fraud-rules/${id}`,
        method: 'PUT',
        body: ruleData
      }),
      invalidatesTags: ['FraudRules']
    }),

    // Admin: Get payment analytics
    getPaymentAnalytics: builder.query({
      query: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return `${PAYMENT_URL}/analytics?${queryString}`;
      },
      providesTags: ['PaymentAnalytics']
    })
  })
});

export const {
  useGetPaymentMethodsQuery,
  useCreatePaymentIntentMutation,
  useProcessRefundMutation,
  useGetTransactionHistoryQuery,
  useGetTransactionDetailsQuery,
  useGetPaymentGatewaysQuery,
  useUpdatePaymentGatewayMutation,
  useGetFraudRulesQuery,
  useCreateFraudRuleMutation,
  useUpdateFraudRuleMutation,
  useGetPaymentAnalyticsQuery
} = paymentApiSlice;