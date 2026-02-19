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
  Typography,
  IconButton,
  Tooltip
} from "@mui/material";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";

const HeaderCurrencySelector = () => {
  const dispatch = useDispatch();
  const { selectedCurrency } = useSelector((state) => state.currency);
  const { data: currencies = [] } = useGetCurrenciesQuery();
  const [open, setOpen] = useState(false);

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
    <Box sx={{ minWidth: 120, display: "flex", alignItems: "center" }}>
      <Tooltip title="Change Currency">
        <IconButton
          onClick={() => setOpen(!open)}
          sx={{
            color: "#fff",
            mr: 1,
            display: { xs: "none", md: "flex" }
          }}
        >
          <CurrencyExchangeIcon />
        </IconButton>
      </Tooltip>

      <FormControl
        fullWidth
        size="small"
        sx={{
          minWidth: 120,
          display: { xs: "none", md: "block" }
        }}
      >
        <Select
          open={open}
          onClose={() => setOpen(false)}
          onOpen={() => setOpen(true)}
          value={displayValue}
          onChange={handleChange}
          sx={{
            color: "#fff",
            ".MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.5)" },
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
                  {currency.symbol}
                </Typography>
                <Typography component="span" sx={{ ml: 1 }}>
                  {currency.code}
                </Typography>
              </MenuItem>
            ))}
        </Select>
      </FormControl>

      {/* Mobile version - just the icon */}
      <FormControl
        fullWidth
        size="small"
        sx={{
          display: { xs: "block", md: "none" }
        }}
      >
        <Select
          value={displayValue}
          onChange={handleChange}
          sx={{
            color: "#fff",
            ".MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.5)" },
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
                  {currency.symbol}
                </Typography>
                <Typography component="span" sx={{ ml: 1 }}>
                  {currency.code}
                </Typography>
              </MenuItem>
            ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default HeaderCurrencySelector;