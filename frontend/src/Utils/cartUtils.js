export const addDecimals = (num) => {
  return (Math.round(num * 100) / 100).toFixed(2);
};
const calculateDiscountedPrice = (product, offers) => {
  if (!product || !product.price) return 0; // Return 0 if product or price is undefined
  if (!offers || offers.length === 0) return product.price; // Return original price if no offers

  let discountedPrice = product.price;

  // Iterate through all offers to find applicable discounts
  offers.forEach((offer) => {
    const isProductInOffer =
      offer.products.some((p) => p._id === product._id) ||
      offer.categories.some((c) => c._id === product.category) ||
      (offer.brand && offer.brand._id === product.brand);

    if (isProductInOffer) {
      if (offer.discountUnit === "percent" && offer.endTime !== Date()) {
        discountedPrice = Math.min(
          discountedPrice,
          product.price - product.price * (offer.discountValue / 100)
        );
      } else if (offer.discountUnit === "flat") {
        discountedPrice = Math.min(
          discountedPrice,
          product.price - offer.discountValue
        );
      }
    }
  });
  return discountedPrice;
};

const discountPrice = (p, offers) => {
  return calculateDiscountedPrice(p, offers)
};

export const updateCart = (state, offers) => {
  // Ensure cartItems is an array
  state.cartItems = state.cartItems || [];
  state.savedItems = state.savedItems || [];
  // Calculate the items price
  state.itemsPrice = Number(
    addDecimals(
      state.cartItems.reduce((acc, item) => acc + discountPrice(item, offers) * item.qty, 0)
    )
  );

  // Calculate the shipping price
  state.shippingPrice = Number(addDecimals(state.itemsPrice > 100 ? 0 : 10));

  // Calculate the tax price
  state.taxPrice = Number(addDecimals(0.15 * state.itemsPrice));

  // Calculate the total price
  state.totalPrice = Number(
    (
      Number(state.itemsPrice) +
      Number(state.shippingPrice)
    ).toFixed(2)
  );

  // Save the cart to localStorage
  localStorage.setItem("cart", JSON.stringify(state));

  return state;
};