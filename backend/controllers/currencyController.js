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

// Store API configuration
let apiConfig = {
  apiKey: process.env.EXCHANGE_API_KEY || "",
  autoUpdateInterval: 24, // hours
  isEnabled: true,
  lastUpdate: null,
  nextUpdate: null
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
    // For PUT requests, code comes from URL params
    // For POST requests, code comes from request body
    const code = req.params.code || req.body.code;
    const { name,rate, symbol, isDefault, isEnabled, region } = req.body;

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
      currency.rate = rate;
      const updatedCurrency = await currency.save();
      res.json(updatedCurrency);
    } else {
      // Create new currency
      const newCurrency = new Currency({
        code: code.toUpperCase(),
        name,
        symbol,
        rate: rate,
        isDefault: isDefault || false,
        isEnabled: isEnabled !== undefined ? isEnabled : true,
        region: region || null
      });
      
      const createdCurrency = await newCurrency.save();
      res.status(201).json(createdCurrency);
    }
  } catch (error) {
    console.error("Create or update currency error:", error);
    res.status(500).json({ message: error.message || "Failed to create or update currency" });
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
      
      await currency.deleteOne();
      res.json({ message: "Currency removed" });
    } else {
      res.status(404).json({ message: "Currency not found" });
    }
  } catch (error) {
    console.error("Delete currency error:", error);
    res.status(500).json({ message: error.message || "Failed to delete currency" });
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
    console.error("Set default currency error:", error);
    res.status(500).json({ message: error.message || "Failed to set default currency" });
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
    
    // Get API key from config
    const apiKey = apiConfig.apiKey || process.env.EXCHANGE_API_KEY;
    if (!apiKey) {
      throw new Error("Exchange rate API key not configured");
    }
    
    // Fetch exchange rates from external API
    const response = await axios.get(
      `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${baseCurrencyCode}`,
      {
        timeout: 5000, // 5 second timeout
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
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
    
    // Throw error instead of using fallback rates
    throw new Error("Failed to fetch exchange rates from API and no cached rates available");
  }
};

// Update exchange rates from external API - now just refreshes cache
export const updateExchangeRates = asyncHandler(async (req, res) => {
  try {
    // Get the API key from config
    const apiKey = apiConfig.apiKey || process.env.EXCHANGE_API_KEY;
    
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
    
    // Update all currency rates in the database
    const updatePromises = Object.entries(rates).map(async ([code, rate]) => {
      return await Currency.updateOne(
        { code: code.toUpperCase() },
        { rate: rate, lastUpdated: new Date() }
      );
    });
    
    await Promise.all(updatePromises);
    
    // Update API config with last update time
    apiConfig.lastUpdate = new Date();
    const nextUpdate = new Date();
    nextUpdate.setHours(nextUpdate.getHours() + apiConfig.autoUpdateInterval);
    apiConfig.nextUpdate = nextUpdate;
    
    res.json({
      message: "Exchange rates updated successfully",
      baseCurrency: baseCurrency.code,
      ratesCount: Object.keys(rates).length,
      lastUpdate: apiConfig.lastUpdate,
      nextUpdate: apiConfig.nextUpdate
    });
  } catch (error) {
    console.error("Exchange rate update error:", error);
    res.status(500).json({ 
      message: "Failed to update exchange rates", 
      error: error.message 
    });
  }
});

// Convert amount between currencies using database rates only
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
    
    // Get currencies from database
    const fromCurrency = await Currency.findOne({ code: from.toUpperCase() });
    const toCurrency = await Currency.findOne({ code: to.toUpperCase() });
    
    // Check if currencies exist in database
    if (!fromCurrency) {
      return res.status(400).json({ message: `Unsupported currency: ${from}` });
    }
    
    if (!toCurrency) {
      return res.status(400).json({ message: `Unsupported currency: ${to}` });
    }
    
    // Check if rates are available
    if (!fromCurrency.rate || !toCurrency.rate) {
      return res.status(400).json({ message: "Exchange rates not available for these currencies" });
    }
    
    // Convert through base currency (USD) with proper rounding
    // Formula: (amount / fromRate) * toRate
    const amountInBase = numericAmount / fromCurrency.rate;
    const convertedAmount = amountInBase * toCurrency.rate;
    
    // Round to 2 decimal places for currency display
    const roundedConvertedAmount = Math.round(convertedAmount * 100) / 100;
    
    res.json({
      from: from.toUpperCase(),
      to: to.toUpperCase(),
      amount: numericAmount,
      convertedAmount: roundedConvertedAmount,
      rate: toCurrency.rate / fromCurrency.rate
    });
  } catch (error) {
    console.error("Currency conversion error:", error);
    res.status(500).json({ 
      message: "Failed to convert currency", 
      error: error.message 
    });
  }
});

// Get API configuration
export const getApiConfig = asyncHandler(async (req, res) => {
  res.json(apiConfig);
});

// Enhanced updateApiConfig to reinitialize scheduled updates when config changes
export const updateApiConfig = asyncHandler(async (req, res) => {
  try {
    const { apiKey, autoUpdateInterval, isEnabled } = req.body;
    
    // Validate required fields
    if (apiKey !== undefined && (typeof apiKey !== 'string' || apiKey.trim() === '')) {
      return res.status(400).json({ message: "API Key is required and must be a non-empty string" });
    }
    
    if (autoUpdateInterval !== undefined && (typeof autoUpdateInterval !== 'number' || autoUpdateInterval <= 0)) {
      return res.status(400).json({ message: "Auto-update interval must be a positive number" });
    }
    
    if (isEnabled !== undefined && typeof isEnabled !== 'boolean') {
      return res.status(400).json({ message: "isEnabled must be a boolean value" });
    }
    
    // Update config values
    if (apiKey !== undefined) apiConfig.apiKey = apiKey;
    if (autoUpdateInterval !== undefined) apiConfig.autoUpdateInterval = autoUpdateInterval;
    if (isEnabled !== undefined) apiConfig.isEnabled = isEnabled;
    
    // Reinitialize scheduled updates if interval or enabled status changed
    if (autoUpdateInterval !== undefined || isEnabled !== undefined) {
      initializeScheduledUpdates();
    }
    
    res.json({ message: "API configuration updated successfully", config: apiConfig });
  } catch (error) {
    console.error("Update API config error:", error);
    res.status(500).json({ message: error.message || "Failed to update API configuration" });
  }
});

// Scheduled exchange rate update function
export const scheduledExchangeRateUpdate = async () => {
  try {
    if (!apiConfig.isEnabled) {
      console.log("Automatic exchange rate updates are disabled");
      return;
    }
    
    console.log("Running scheduled exchange rate update...");
    
    // Get base currency (usually USD)
    const baseCurrency = await Currency.findOne({ isDefault: true });
    if (!baseCurrency) {
      console.error("No default currency set for scheduled update");
      return;
    }
    
    // Refresh cache
    const rates = await getExchangeRatesFromAPI(baseCurrency.code);
    
    // Update all currency rates in the database
    const updatePromises = Object.entries(rates).map(async ([code, rate]) => {
      return await Currency.updateOne(
        { code: code.toUpperCase() },
        { rate: rate, lastUpdated: new Date() }
      );
    });
    
    await Promise.all(updatePromises);
    
    // Update API config with last update time
    apiConfig.lastUpdate = new Date();
    const nextUpdate = new Date();
    nextUpdate.setHours(nextUpdate.getHours() + apiConfig.autoUpdateInterval);
    apiConfig.nextUpdate = nextUpdate;
    
    console.log(`Scheduled exchange rates updated successfully. Next update: ${apiConfig.nextUpdate}`);
  } catch (error) {
    console.error("Scheduled exchange rate update error:", error);
    // Log error but don't stop the scheduled updates
  }
};

// Store the current interval ID for clearing/restarting
let scheduledIntervalId = null;

// Initialize scheduled updates
const initializeScheduledUpdates = () => {
  // Clear existing interval if it exists
  if (scheduledIntervalId) {
    clearInterval(scheduledIntervalId);
  }
  
  // Set up interval for automatic updates (every 24 hours by default)
  scheduledIntervalId = setInterval(() => {
    scheduledExchangeRateUpdate();
  }, apiConfig.autoUpdateInterval * 60 * 60 * 1000); // Convert hours to milliseconds
  
  console.log(`Scheduled exchange rate updates initialized every ${apiConfig.autoUpdateInterval} hours`);
};

// Initialize on module load
initializeScheduledUpdates();