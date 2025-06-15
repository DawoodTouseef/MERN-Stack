import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedCurrency: "USD", // Default currency
  price:1
};

const currencySlice = createSlice({
  name: "currency",
  initialState,
  reducers: {
    setCurrency: (state, action) => {
      state.selectedCurrency = action.payload;
    },
    setPrice:(state,action)=>{
      state.price=action.payload;
    }
  },
});

export const { setCurrency,setPrice } = currencySlice.actions;

export default currencySlice.reducer;