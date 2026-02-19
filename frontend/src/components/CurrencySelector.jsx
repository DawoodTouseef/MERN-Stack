import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setCurrency } from "../redux/features/currency/currencySlice";
import { useGetCurrenciesQuery } from "../redux/api/currencyApiSlice";
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography
} from "@mui/material";

const CurrencySelector = () => {
  const dispatch = useDispatch();
  const { selectedCurrency } = useSelector((state) => state.currency);
  const { data: currencies = [] } = useGetCurrenciesQuery();

  const handleChange = (event) => {
    dispatch(setCurrency(event.target.value));
  };

  // Set default currency on initial load
  useEffect(() => {
    if (currencies.length > 0 && (!selectedCurrency || !currencies.some(c => c.code === selectedCurrency))) {
      const defaultCurrency = currencies.find(currency => currency.isDefault) || currencies[0];
      if (defaultCurrency) {
        dispatch(setCurrency(defaultCurrency.code));
      }
    }
  }, [currencies, selectedCurrency, dispatch]);

  if (currencies.length <= 1) {
    return null; // Don't show selector if there's only one currency
  }

  // Filter only enabled currencies
  const enabledCurrencies = currencies.filter(currency => currency.isEnabled);

  // Check if selected currency exists and is enabled in the list
  const isValidCurrency = enabledCurrencies.some(currency => currency.code === selectedCurrency);
  const displayValue = isValidCurrency ? selectedCurrency : (enabledCurrencies[0]?.code || "");

  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth size="small">
        <InputLabel
          id="currency-select-label"
          sx={{
            color: "#fff",
            "&.Mui-focused": { color: "#fff" }
          }}
        >
          Currency
        </InputLabel>
        <Select
          labelId="currency-select-label"
          id="currency-select"
          value={displayValue}
          label="Currency"
          onChange={handleChange}
          sx={{
            color: "#fff",
            ".MuiOutlinedInput-notchedOutline": { borderColor: "#fff" },
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#fff" },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#fff" },
            ".MuiSvgIcon-root": { color: "#fff" }
          }}
        >
          {currencies
            .filter(currency => currency.isEnabled)
            .map((currency) => (
              <MenuItem
                key={currency.code}
                value={currency.code}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  color: "#000"
                }}
              >
                <Typography component="span" sx={{ fontWeight: "bold" }}>
                  {currency.code}
                </Typography>
                <Typography component="span" sx={{ ml: 1 }}>
                  {currency.name}
                </Typography>
              </MenuItem>
            ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default CurrencySelector;