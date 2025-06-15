import { updateCart as calculateCartTotals } from "../../../Utils/cartUtils";
import { taxApiSlice } from "../../api/taxApiSlice";

export const updateCartWithTax = (userLocation) => async (dispatch, getState) => {
  const state = getState().cart;
  const calculateTax = taxApiSlice.endpoints.calculateTax.initiate;

  try {
    // Dispatch the calculateTax API call
    const result = await dispatch(
      calculateTax({
        location: userLocation,
        items: state.cartItems,
      })
    ).unwrap(); 

    const taxAmount = result?.taxAmount || 0; 

    // Update the cart state with the new tax amount
    const updatedState = calculateCartTotals({
      ...state,
      taxPrice: taxAmount,
    });

    // Save the updated cart state to localStorage
    localStorage.setItem("cart", JSON.stringify(updatedState));
  } catch (error) {
    console.error("Failed to calculate tax:", error);
  }
};