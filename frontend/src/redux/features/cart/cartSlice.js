import { createSlice } from "@reduxjs/toolkit";
import { updateCart } from "../../../Utils/cartUtils";

const initialState = localStorage.getItem("cart")
  ? JSON.parse(localStorage.getItem("cart"))
  : { cartItems: [], savedItems: [], shippingAddress: {}, paymentMethod: "PayPal", offers: [] };

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      // Accept single product or array of products
      const items = Array.isArray(action.payload) ? action.payload : [action.payload];

      items.forEach((payloadItem) => {
        const { user, rating, numReviews, reviews, ...item } = payloadItem;
        const existItem = state.cartItems.find((x) => x._id === item._id);

        if (existItem) {
          state.cartItems = state.cartItems.map((x) =>
            x._id === existItem._id ? item : x
          );
        } else {
          state.cartItems = [...state.cartItems, item];
        }
      });
      return updateCart(state, state.offers);
    },

    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter((x) => x._id !== action.payload);
      return updateCart(state, state.offers);
    },

    saveForLater: (state, action) => {
      const item = state.cartItems.find((x) => x._id === action.payload);
      if (item) {
        state.cartItems = state.cartItems.filter((x) => x._id !== action.payload);
        state.savedItems = [...(state.savedItems || []), item];
      }
      return updateCart(state, state.offers);
    },

    moveToCart: (state, action) => {
      const item = state.savedItems.find((x) => x._id === action.payload);
      if (item) {
        state.savedItems = state.savedItems.filter((x) => x._id !== action.payload);
        const existItem = state.cartItems.find((x) => x._id === item._id);
        if (existItem) {
          state.cartItems = state.cartItems.map((x) => x._id === existItem._id ? item : x);
        } else {
          state.cartItems = [...state.cartItems, item];
        }
      }
      return updateCart(state, state.offers);
    },

    removeFromSaved: (state, action) => {
      state.savedItems = state.savedItems.filter((x) => x._id !== action.payload);
      return updateCart(state, state.offers);
    },

    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
      localStorage.setItem("cart", JSON.stringify(state));
    },

    savePaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
      localStorage.setItem("cart", JSON.stringify(state));
    },

    clearCartItems: (state, action) => {
      state.cartItems = [];
      localStorage.setItem("cart", JSON.stringify(state));
    },

    resetCart: (state) => (state = initialState),
    addOffers: (state, action) => {
      state.offers = action.payload;

      // Update the cart with the new offers
      return updateCart(state, state.offers);
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  saveForLater,
  moveToCart,
  removeFromSaved,
  savePaymentMethod,
  saveShippingAddress,
  clearCartItems,
  resetCart,
  addOffers
} = cartSlice.actions;

export default cartSlice.reducer;
