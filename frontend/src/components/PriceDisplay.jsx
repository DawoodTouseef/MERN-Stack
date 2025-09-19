import { useSelector } from "react-redux";
import { useGetCurrenciesQuery } from "../redux/api/currencyApiSlice";

const PriceDisplay = ({ amount, currency, prices, showCurrencyCode = true }) => {
  const { selectedCurrency } = useSelector((state) => state.currency);
  const { data: currencies = [] } = useGetCurrenciesQuery();
  
  // Get the default currency
  const defaultCurrency = currencies.find(c => c.isDefault) || { code: 'USD', symbol: '$' };
  
  // Determine which currency to display
  const displayCurrencyCode = selectedCurrency || currency || defaultCurrency.code;
  
  // Find the currency details
  const displayCurrency = currencies.find(c => c.code === displayCurrencyCode) || defaultCurrency;
  
  // Get the price in the selected currency
  let displayPrice = amount;
  
  // If we have specific prices for different currencies, use that
  if (prices && prices[displayCurrencyCode]) {
    displayPrice = prices[displayCurrencyCode];
  } 
  // Otherwise, if we need to convert from the default currency
  else if (displayCurrencyCode !== (currency || defaultCurrency.code)) {
    // Get the original currency
    const originalCurrency = currencies.find(c => c.code === (currency || defaultCurrency.code)) || defaultCurrency;
    
    // Convert using exchange rates
    if (originalCurrency.rate && displayCurrency.rate) {
      // Convert to base currency first, then to target currency
      const amountInBase = amount / originalCurrency.rate;
      displayPrice = amountInBase * displayCurrency.rate;
    }
  }
  
  // Format the price
  const formattedPrice = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: displayCurrencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(displayPrice);
  
  return (
    <span>
      {formattedPrice}
      {showCurrencyCode && displayCurrencyCode !== displayCurrency.code && (
        <span style={{ fontSize: '0.8em', marginLeft: '4px', opacity: 0.7 }}>
          ({displayCurrency.code})
        </span>
      )}
    </span>
  );
};

export default PriceDisplay;