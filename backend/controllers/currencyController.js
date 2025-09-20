import asyncHandler from "../middlewares/asyncHandler.js";
import Currency from "../models/currencyModel.js";
import axios from "axios";

// In-memory cache for exchange rates with TTL
let exchangeRateCache = {
  rates: {},
  lastUpdated: null,
  baseCurrency: null,
  ttl: 60 * 60 * 1000 // 1 hour cache
};

// Get all currencies - now returns supported currencies without rates
export const getCurrencies = asyncHandler(async (req, res) => {
  try {
    const currencies = await Currency.find({}).sort({ code: 1 });
    res.json(currencies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get enabled currencies - now returns supported currencies without rates
export const getEnabledCurrencies = asyncHandler(async (req, res) => {
  try {
    const currencies = await Currency.find({ isEnabled: true }).sort({ code: 1 });
    res.json(currencies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get currency by code - now returns currency info without rate
export const getCurrencyByCode = asyncHandler(async (req, res) => {
  try {
    const currency = await Currency.findOne({ code: req.params.code.toUpperCase() });
    if (currency) {
      res.json(currency);
    } else {
      res.status(404).json({ message: "Currency not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create or update currency - only stores metadata, not rates
export const createOrUpdateCurrency = asyncHandler(async (req, res) => {
  try {
    const { code, name, symbol, isDefault, isEnabled, region } = req.body;

    // Validate required fields
    if (!code || !name || !symbol) {
      return res.status(400).json({ message: "Code, name, and symbol are required" });
    }

    // Check if currency already exists
    let currency = await Currency.findOne({ code: code.toUpperCase() });

    if (currency) {
      // Update existing currency
      currency.name = name;
      currency.symbol = symbol;
      currency.isDefault = isDefault || false;
      currency.isEnabled = isEnabled !== undefined ? isEnabled : true;
      currency.region = region || currency.region;
      currency.lastUpdated = Date.now();
      
      const updatedCurrency = await currency.save();
      res.json(updatedCurrency);
    } else {
      // Create new currency
      const newCurrency = new Currency({
        code: code.toUpperCase(),
        name,
        symbol,
        rate: 1.0, // Default rate, will be fetched from API
        isDefault: isDefault || false,
        isEnabled: isEnabled !== undefined ? isEnabled : true,
        region: region || null
      });
      
      const createdCurrency = await newCurrency.save();
      res.status(201).json(createdCurrency);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete currency
export const deleteCurrency = asyncHandler(async (req, res) => {
  try {
    const currency = await Currency.findOne({ code: req.params.code.toUpperCase() });
    
    if (currency) {
      // Check if it's the default currency
      if (currency.isDefault) {
        return res.status(400).json({ message: "Cannot delete the default currency" });
      }
      
      await currency.remove();
      res.json({ message: "Currency removed" });
    } else {
      res.status(404).json({ message: "Currency not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Set default currency
export const setDefaultCurrency = asyncHandler(async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ message: "Currency code is required" });
    }
    
    // Remove default flag from all currencies
    await Currency.updateMany({}, { isDefault: false });
    
    // Set the new default currency
    const currency = await Currency.findOne({ code: code.toUpperCase() });
    
    if (currency) {
      currency.isDefault = true;
      const updatedCurrency = await currency.save();
      res.json(updatedCurrency);
    } else {
      res.status(404).json({ message: "Currency not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get exchange rates from external API with enhanced caching and fallback
const getExchangeRatesFromAPI = async (baseCurrencyCode) => {
  try {
    // Check cache first
    const now = Date.now();
    if (exchangeRateCache.lastUpdated && 
        (now - exchangeRateCache.lastUpdated) < exchangeRateCache.ttl &&
        exchangeRateCache.baseCurrency === baseCurrencyCode) {
      console.log('Using cached exchange rates');
      return exchangeRateCache.rates;
    }
    
    // Get API key from environment
    const apiKey = process.env.EXCHANGE_API_KEY;
    if (!apiKey) {
      throw new Error("Exchange rate API key not configured");
    }
    
    // Fetch exchange rates from external API
    const response = await axios.get(
      `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${baseCurrencyCode}`,
      {
        timeout: 5000, // 5 second timeout
        headers: {
          'User-Agent': 'NexusMart-Ecommerce/1.0'
        }
      }
    );
    
    // Validate response
    if (response.status !== 200 || !response.data || response.data.result !== 'success') {
      throw new Error("Invalid response from exchange rate API");
    }
    
    const rates = response.data.conversion_rates;
    
    // Update cache
    exchangeRateCache = {
      rates,
      lastUpdated: now,
      baseCurrency: baseCurrencyCode,
      ttl: 60 * 60 * 1000 // 1 hour
    };
    
    console.log(`Fetched fresh exchange rates for ${baseCurrencyCode}`);
    return rates;
  } catch (error) {
    console.error("Exchange rate API error:", error.message);
    
    // Use cached rates if available as fallback
    if (exchangeRateCache.lastUpdated) {
      console.log('Using cached exchange rates as fallback');
      return exchangeRateCache.rates;
    }
    
    // Fallback to basic rates if no cache
    console.log('Using fallback exchange rates');
    return {
      'USD': 1,
      'EUR': 0.85,
      'GBP': 0.75,
      'JPY': 110,
      'CAD': 1.25,
      'AUD': 1.35,
      'CHF': 0.92,
      'CNY': 6.45,
      'INR': 73.5,
      'BRL': 5.2,
      'MXN': 20.0,
      'SGD': 1.35
    };
  }
};

// Update exchange rates from external API - now just refreshes cache
export const updateExchangeRates = asyncHandler(async (req, res) => {
  try {
    // Get the API key from config
    const apiKey = process.env.EXCHANGE_API_KEY;
    
    if (!apiKey) {
      return res.status(400).json({ message: "Exchange rate API key not configured" });
    }
    
    // Get base currency (usually USD)
    const baseCurrency = await Currency.findOne({ isDefault: true });
    if (!baseCurrency) {
      return res.status(400).json({ message: "No default currency set" });
    }
    
    // Refresh cache
    const rates = await getExchangeRatesFromAPI(baseCurrency.code);
    
    res.json({
      message: "Exchange rates updated successfully",
      baseCurrency: baseCurrency.code,
      ratesCount: Object.keys(rates).length
    });
  } catch (error) {
    console.error("Exchange rate update error:", error);
    res.status(500).json({ 
      message: "Failed to update exchange rates", 
      error: error.message 
    });
  }
});

// Convert amount between currencies using third-party API with enhanced error handling
export const convertCurrency = asyncHandler(async (req, res) => {
  try {
    const { from, to, amount } = req.body;
    
    if (!from || !to || !amount) {
      return res.status(400).json({ message: "From currency, to currency, and amount are required" });
    }
    
    // Validate amount
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ message: "Amount must be a positive number" });
    }
    
    // Get base currency (usually USD)
    const baseCurrency = await Currency.findOne({ isDefault: true });
    if (!baseCurrency) {
      return res.status(400).json({ message: "No default currency set" });
    }
    
    // Get exchange rates
    const rates = await getExchangeRatesFromAPI(baseCurrency.code);
    
    // Check if currencies are supported
    if (!rates[from.toUpperCase()]) {
      return res.status(400).json({ message: `Unsupported currency: ${from}` });
    }
    
    if (!rates[to.toUpperCase()]) {
      return res.status(400).json({ message: `Unsupported currency: ${to}` });
    }
    
    // Convert through base currency with proper rounding
    const amountInBase = numericAmount / rates[from.toUpperCase()];
    const convertedAmount = amountInBase * rates[to.toUpperCase()];
    
    // Round to 2 decimal places for currency display
    const roundedConvertedAmount = Math.round(convertedAmount * 100) / 100;
    
    res.json({
      from: from.toUpperCase(),
      to: to.toUpperCase(),
      amount: numericAmount,
      convertedAmount: roundedConvertedAmount,
      rate: rates[to.toUpperCase()] / rates[from.toUpperCase()]
    });
  } catch (error) {
    console.error("Currency conversion error:", error);
    res.status(500).json({ 
      message: "Failed to convert currency", 
      error: error.message 
    });
  }
});
