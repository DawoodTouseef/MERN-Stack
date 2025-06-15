import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  orderId: ""
}

const currencySlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    setOrder: (state, action) => {
      state.orderId = action.payload;
    },

  },
});

export const { setOrder } = currencySlice.actions;

export default currencySlice.reducer;