import useCurrency from "../hooks/useCurrency";
import { Box, Typography } from "@mui/material";


const MultiCurrencyPriceDisplay = ({ product, showConversion = true }) => {
  const { format, selectedCurrency, currencies } = useCurrency();

  // Determine which currency to display
  const displayCurrencyCode = selectedCurrency;

  // Get the price in the selected currency
  let displayPrice = product.price;
  let sourceCurrency = product.currency || 'USD';

  // If we have specific prices for different currencies, use that
  if (product.prices && product.prices[displayCurrencyCode]) {
    displayPrice = product.prices[displayCurrencyCode];
    sourceCurrency = displayCurrencyCode;
  }

  // Format the price
  const formattedPrice = format(displayPrice, sourceCurrency);

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