import { useSelector } from "react-redux";
import { useGetCurrenciesQuery } from "../redux/api/currencyApiSlice";
import {
  Box,
  Typography,
  Tooltip,
  Chip
} from "@mui/material";

const MultiCurrencyPriceDisplay = ({ product, showConversion = true }) => {
  const { selectedCurrency } = useSelector((state) => state.currency);
  const { data: currencies = [] } = useGetCurrenciesQuery();
  
  // Get the default currency
  const defaultCurrency = currencies.find(c => c.isDefault) || { code: 'USD', symbol: '$' };
  
  // Determine which currency to display
  const displayCurrencyCode = selectedCurrency || product.currency || defaultCurrency.code;
  
  // Find the currency details
  const displayCurrency = currencies.find(c => c.code === displayCurrencyCode) || defaultCurrency;
  
  // Get the price in the selected currency
  let displayPrice = product.price;
  
  // If we have specific prices for different currencies, use that
  if (product.prices && product.prices[displayCurrencyCode]) {
    displayPrice = product.prices[displayCurrencyCode];
  } 
  // Otherwise, if we need to convert from the default currency
  else if (displayCurrencyCode !== (product.currency || defaultCurrency.code)) {
    // Get the original currency
    const originalCurrency = currencies.find(c => c.code === (product.currency || defaultCurrency.code)) || defaultCurrency;
    
    // Convert using exchange rates
    if (originalCurrency.rate && displayCurrency.rate) {
      // Convert to base currency first, then to target currency
      const amountInBase = product.price / originalCurrency.rate;
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
  
  // Show other available currencies
  const otherCurrencies = currencies.filter(c => 
    c.code !== displayCurrencyCode && 
    c.isEnabled && 
    product.prices && 
    product.prices[c.code]
  );
  
  return (
    <Box>
      <Typography variant="h4" component="div" sx={{ fontWeight: "bold", mb: 1 }}>
        {formattedPrice}
        {displayCurrencyCode !== (product.currency || defaultCurrency.code) && showConversion && (
          <Typography component="span" variant="body2" sx={{ ml: 1, opacity: 0.7 }}>
            ({product.currency || defaultCurrency.code})
          </Typography>
        )}
      </Typography>
      
      {otherCurrencies.length > 0 && showConversion && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2" sx={{ mb: 0.5, opacity: 0.7 }}>
            Also available in:
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {otherCurrencies.map(currency => {
              const price = product.prices[currency.code];
              const formattedOtherPrice = new Intl.NumberFormat(undefined, {
                style: 'currency',
                currency: currency.code,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }).format(price);
              
              return (
                <Tooltip key={currency.code} title={`${currency.name} (${currency.code})`}>
                  <Chip
                    label={`${formattedOtherPrice} ${currency.symbol}`}
                    size="small"
                    variant="outlined"
                    sx={{ 
                      borderColor: "rgba(255,255,255,0.3)",
                      color: "rgba(255,255,255,0.7)",
                      fontSize: "0.75rem"
                    }}
                  />
                </Tooltip>
              );
            })}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default MultiCurrencyPriceDisplay;