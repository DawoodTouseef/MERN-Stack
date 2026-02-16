import { useSelector } from "react-redux";
import { useGetCurrenciesQuery } from "../redux/api/currencyApiSlice";

/**
 * Custom hook for centralized currency management.
 * Provides helper functions for converting and formatting prices.
 */
const useCurrency = () => {
    const { selectedCurrency } = useSelector((state) => state.currency);
    const { data: currencies = [] } = useGetCurrenciesQuery();

    // Find the current currency details
    const displayCurrency = currencies.find((c) => c.code === (selectedCurrency || "USD")) || {
        code: "USD",
        symbol: "$",
        rate: 1,
    };

    /**
     * Converts an amount from a source currency to the currently selected currency.
     * @param {number} amount - The amount to convert.
     * @param {string} fromCurrencyCode - The code of the source currency (default: 'USD').
     * @returns {number} The converted amount.
     */
    const convert = (amount, fromCurrencyCode = "USD") => {
        if (!amount || isNaN(amount)) return 0;
        if (selectedCurrency === fromCurrencyCode) return amount;

        const fromCurrency = currencies.find((c) => c.code === fromCurrencyCode) || { rate: 1 };

        // Formula: (amount / fromRate) * toRate
        // We assume rates are relative to a base currency (e.g., 1 USD = 83 INR)
        const amountInBase = amount / fromCurrency.rate;
        return amountInBase * displayCurrency.rate;
    };

    /**
     * Formats an amount into a currency string.
     * @param {number} amount - The amount to format.
     * @param {string} fromCurrencyCode - The source currency code (converts if different from selected).
     * @returns {string} The formatted currency string.
     */
    const format = (amount, fromCurrencyCode = "USD") => {
        const convertedAmount = convert(amount, fromCurrencyCode);

        try {
            return new Intl.NumberFormat(undefined, {
                style: "currency",
                currency: displayCurrency.code,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(convertedAmount);
        } catch (error) {
            // Fallback formatting
            return `${displayCurrency.symbol}${convertedAmount.toFixed(2)}`;
        }
    };

    return {
        convert,
        format,
        symbol: displayCurrency.symbol,
        code: displayCurrency.code,
        rate: displayCurrency.rate,
        currencies,
        selectedCurrency: displayCurrency.code
    };
};

export default useCurrency;
