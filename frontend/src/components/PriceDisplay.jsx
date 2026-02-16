import useCurrency from "../hooks/useCurrency";

const PriceDisplay = ({ amount, currency, prices, showCurrencyCode = true }) => {
  const { format, selectedCurrency } = useCurrency();

  // Get the price in the selected currency
  let displayPrice = amount;
  let sourceCurrency = currency || 'USD';

  // If we have specific prices for different currencies, use that
  if (prices && prices[selectedCurrency]) {
    displayPrice = prices[selectedCurrency];
    sourceCurrency = selectedCurrency; // Already in target currency
  }

  return (
    <span>
      {format(displayPrice, sourceCurrency)}
      {showCurrencyCode && sourceCurrency !== selectedCurrency && (
        <span style={{ fontSize: '0.8em', marginLeft: '4px', opacity: 0.7 }}>
          ({sourceCurrency})
        </span>
      )}
    </span>
  );
};

export default PriceDisplay;
