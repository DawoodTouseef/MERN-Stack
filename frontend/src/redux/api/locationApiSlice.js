import { apiSlice } from "./apiSlice";
import { LOCATION_URL } from "../constants";

export const locationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get user's current location data
    getUserLocation: builder.query({
      query: () => ({
        url: `${LOCATION_URL}/current`,
        method: "GET",
      }),
      providesTags: ["Location"],
    }),

    // Update user location
    updateUserLocation: builder.mutation({
      query: (locationData) => ({
        url: `${LOCATION_URL}/update`,
        method: "POST",
        body: locationData,
      }),
      invalidatesTags: ["Location", "LocationProducts"],
    }),

    // Get location-based products
    getLocationBasedProducts: builder.query({
      query: ({ location, limit = 12, category, priceRange }) => {
        const params = new URLSearchParams({
          limit: limit.toString(),
        });
        
        if (location) {
          params.append('latitude', location.latitude.toString());
          params.append('longitude', location.longitude.toString());
        }
        if (category) params.append('category', category);
        if (priceRange) params.append('priceRange', priceRange);
        
        return `${LOCATION_URL}/products?${params}`;
      },
      providesTags: ["LocationProducts"],
    }),

    // Get location-based offers and deals
    getLocationOffers: builder.query({
      query: ({ location, limit = 10 }) => {
        const params = new URLSearchParams({
          limit: limit.toString(),
        });
        
        if (location) {
          params.append('latitude', location.latitude.toString());
          params.append('longitude', location.longitude.toString());
        }
        
        return `${LOCATION_URL}/offers?${params}`;
      },
      providesTags: ["LocationOffers"],
    }),

    // Get trending products by location
    getTrendingByLocation: builder.query({
      query: ({ location, timeframe = '7d', limit = 12 }) => {
        const params = new URLSearchParams({
          timeframe,
          limit: limit.toString(),
        });
        
        if (location) {
          params.append('latitude', location.latitude.toString());
          params.append('longitude', location.longitude.toString());
        }
        
        return `${LOCATION_URL}/trending?${params}`;
      },
      providesTags: ["LocationTrending"],
    }),

    // Get nearby stores/vendors
    getNearbyVendors: builder.query({
      query: ({ location, radius = 10, limit = 20 }) => {
        const params = new URLSearchParams({
          radius: radius.toString(),
          limit: limit.toString(),
        });
        
        if (location) {
          params.append('latitude', location.latitude.toString());
          params.append('longitude', location.longitude.toString());
        }
        
        return `${LOCATION_URL}/vendors?${params}`;
      },
      providesTags: ["NearbyVendors"],
    }),

    // Get delivery options for location
    getDeliveryOptions: builder.query({
      query: ({ location, productIds = [] }) => {
        const params = new URLSearchParams();
        
        if (location) {
          params.append('latitude', location.latitude.toString());
          params.append('longitude', location.longitude.toString());
        }
        if (productIds.length > 0) {
          params.append('productIds', JSON.stringify(productIds));
        }
        
        return `${LOCATION_URL}/delivery-options?${params}`;
      },
      providesTags: ["DeliveryOptions"],
    }),

    // Get regional preferences and popular categories
    getRegionalPreferences: builder.query({
      query: ({ location }) => {
        const params = new URLSearchParams();
        
        if (location) {
          params.append('latitude', location.latitude.toString());
          params.append('longitude', location.longitude.toString());
        }
        
        return `${LOCATION_URL}/preferences?${params}`;
      },
      providesTags: ["RegionalPreferences"],
    }),

    // Get location-based pricing
    getLocationPricing: builder.query({
      query: ({ location, productIds }) => {
        const params = new URLSearchParams({
          productIds: JSON.stringify(productIds),
        });
        
        if (location) {
          params.append('latitude', location.latitude.toString());
          params.append('longitude', location.longitude.toString());
        }
        
        return `${LOCATION_URL}/pricing?${params}`;
      },
      providesTags: ["LocationPricing"],
    }),

    // Get weather-based product recommendations
    getWeatherBasedProducts: builder.query({
      query: ({ location, limit = 8 }) => {
        const params = new URLSearchParams({
          limit: limit.toString(),
        });
        
        if (location) {
          params.append('latitude', location.latitude.toString());
          params.append('longitude', location.longitude.toString());
        }
        
        return `${LOCATION_URL}/weather-products?${params}`;
      },
      providesTags: ["WeatherProducts"],
    }),

    // Track location-based analytics
    trackLocationEvent: builder.mutation({
      query: (eventData) => ({
        url: `${LOCATION_URL}/track-event`,
        method: "POST",
        body: eventData,
      }),
    }),
  }),
});

export const {
  useGetUserLocationQuery,
  useUpdateUserLocationMutation,
  useGetLocationBasedProductsQuery,
  useGetLocationOffersQuery,
  useGetTrendingByLocationQuery,
  useGetNearbyVendorsQuery,
  useGetDeliveryOptionsQuery,
  useGetRegionalPreferencesQuery,
  useGetLocationPricingQuery,
  useGetWeatherBasedProductsQuery,
  useTrackLocationEventMutation,
} = locationApiSlice;