import TaxRule, { TaxExemption, TaxConfig } from "../models/taxModel.js";
import Product from "../models/productModel.js";
import User from "../models/userModel.js";
import taxServiceManager from "../services/thirdPartyTaxService.js";
import axios from "axios";

// Third-party tax service integrations
const taxServices = {
  avalara: {
    calculateTax: async (params) => {
      const { apiKey, companyCode, sandbox } = params.config;
      const baseUrl = sandbox ? 'https://sandbox-rest.avatax.com' : 'https://rest.avatax.com';
      
      try {
        const response = await axios.post(
          `${baseUrl}/api/v2/companies/${companyCode}/transactions/create`,
          {
            type: 'SalesInvoice',
            customerCode: params.customerCode,
            date: new Date().toISOString().split('T')[0],
            lines: params.lineItems.map((item, index) => ({
              number: index + 1,
              quantity: item.quantity,
              amount: item.amount,
              taxCode: item.taxCode,
              customerUsageType: item.customerUsageType,
              addresses: {
                shipFrom: params.shipFrom,
                shipTo: params.shipTo
              }
            }))
          },
          {
            headers: {
              'Authorization': `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}`,
              'Content-Type': 'application/json'
            }
          }
        );
        return response.data;
      } catch (error) {
        throw new Error(`Avalara API Error: ${error.response?.data?.error?.message || error.message}`);
      }
    }
  },
  
  taxjar: {
    calculateTax: async (params) => {
      const { apiKey, sandbox } = params.config;
      const baseUrl = sandbox ? 'https://api.sandbox.taxjar.com' : 'https://api.taxjar.com';
      
      try {
        const response = await axios.post(
          `${baseUrl}/v2/taxes`,
          {
            from_country: params.shipFrom.country,
            from_zip: params.shipFrom.postalCode,
            from_state: params.shipFrom.region,
            from_city: params.shipFrom.city,
            from_street: params.shipFrom.line1,
            to_country: params.shipTo.country,
            to_zip: params.shipTo.postalCode,
            to_state: params.shipTo.region,
            to_city: params.shipTo.city,
            to_street: params.shipTo.line1,
            amount: params.amount,
            shipping: params.shipping,
            line_items: params.lineItems
          },
          {
            headers: {
              'Authorization': `Token token="${apiKey}"`,
              'Content-Type': 'application/json'
            }
          }
        );
        return response.data;
      } catch (error) {
        throw new Error(`TaxJar API Error: ${error.response?.data?.error || error.message}`);
      }
    }
  }
};

// Enhanced tax calculation with multiple factors
export const calculateAdvancedTax = async (req, res) => {
  try {
    const {
      productId,
      customerId,
      shippingAddress,
      billingAddress,
      quantity = 1,
      discountAmount = 0,
      useThirdPartyService = false
    } = req.body;

    // Get product details
    const product = await Product.findById(productId).populate("brand category");
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Get customer details and exemptions
    const customer = await User.findById(customerId);
    const exemption = await TaxExemption.findOne({
      customer: customerId,
      isActive: true,
      validFrom: { $lte: new Date() },
      $or: [{ validUntil: { $gte: new Date() } }, { validUntil: null }]
    }).populate('exemptCategories exemptProducts');

    // Check for exemptions
    if (exemption) {
      if (exemption.exemptionType === 'total_exempt') {
        return res.status(200).json({
          tax: 0,
          rate: 0,
          totalPrice: product.price * quantity - discountAmount,
          exemptionApplied: true,
          exemptionReason: exemption.exemptionReason
        });
      }
      
      if (exemption.exemptionType === 'category_exempt' && 
          exemption.exemptCategories.some(cat => cat._id.toString() === product.category._id.toString())) {
        return res.status(200).json({
          tax: 0,
          rate: 0,
          totalPrice: product.price * quantity - discountAmount,
          exemptionApplied: true,
          exemptionReason: 'Category exempt'
        });
      }
      
      if (exemption.exemptionType === 'product_exempt' && 
          exemption.exemptProducts.some(prod => prod._id.toString() === product._id.toString())) {
        return res.status(200).json({
          tax: 0,
          rate: 0,
          totalPrice: product.price * quantity - discountAmount,
          exemptionApplied: true,
          exemptionReason: 'Product exempt'
        });
      }
    }

    // Get tax configuration
    const taxConfig = await TaxConfig.findOne({ isActive: true });
    
    // Use third-party service if configured and requested
    if (useThirdPartyService && taxConfig && taxConfig.taxService !== 'internal') {
      try {
        const taxResult = await calculateWithThirdParty(taxConfig, {
          product,
          customer,
          shippingAddress,
          billingAddress,
          quantity,
          discountAmount
        });
        
        return res.status(200).json(taxResult);
      } catch (error) {
        console.log('Third-party tax service error, falling back to internal calculation:', error.message);
      }
    }

    // Internal tax calculation
    const taxAddress = shippingAddress || billingAddress;
    
    // Find applicable tax rules with priority
    const taxRules = await TaxRule.find({
      $and: [
        {
          $or: [
            { product: product._id },
            { brand: product.brand?._id },
            { category: product.category._id },
            { productCode: product.taxProductCode },
            { product: null, brand: null, category: null, productCode: null } // Default rules
          ]
        },
        {
          $or: [
            { country: taxAddress.country },
            { country: null }
          ]
        },
        {
          $or: [
            { state: taxAddress.state },
            { state: null }
          ]
        },
        {
          $or: [
            { city: taxAddress.city },
            { city: null }
          ]
        },
        {
          $or: [
            { zipCode: taxAddress.zipCode },
            { zipCode: null }
          ]
        },
        { isActive: true },
        {
          $or: [
            { startDate: { $lte: new Date() } },
            { startDate: null }
          ]
        },
        {
          $or: [
            { endDate: { $gte: new Date() } },
            { endDate: null }
          ]
        }
      ]
    }).sort({ priority: -1, createdAt: -1 });

    if (!taxRules.length) {
      return res.status(200).json({
        tax: 0,
        rate: 0,
        totalPrice: product.price * quantity - discountAmount,
        message: "No applicable tax rules found"
      });
    }

    // Apply the highest priority tax rule
    const applicableTaxRule = taxRules[0];
    const taxableAmount = Math.max(0, product.price * quantity - discountAmount);
    
    // Check minimum amount threshold
    if (taxableAmount < applicableTaxRule.minAmount) {
      return res.status(200).json({
        tax: 0,
        rate: applicableTaxRule.rate,
        totalPrice: taxableAmount,
        message: "Below minimum taxable amount"
      });
    }

    // Calculate tax
    let taxAmount = 0;
    const effectiveAmount = applicableTaxRule.maxAmount ? 
      Math.min(taxableAmount, applicableTaxRule.maxAmount) : taxableAmount;

    if (applicableTaxRule.flatAmount > 0) {
      taxAmount = applicableTaxRule.flatAmount;
    } else {
      taxAmount = (effectiveAmount * applicableTaxRule.rate) / 100;
    }

    // Apply rounding based on configuration
    const decimalPlaces = taxConfig?.decimalPlaces || 2;
    const roundingMethod = taxConfig?.roundingMethod || 'round';
    
    switch (roundingMethod) {
      case 'floor':
        taxAmount = Math.floor(taxAmount * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);
        break;
      case 'ceil':
        taxAmount = Math.ceil(taxAmount * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);
        break;
      default:
        taxAmount = Math.round(taxAmount * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);
    }

    const totalPrice = applicableTaxRule.isInclusive ? 
      taxableAmount : taxableAmount + taxAmount;

    res.status(200).json({
      tax: taxAmount,
      rate: applicableTaxRule.rate,
      totalPrice: totalPrice,
      taxType: applicableTaxRule.taxType,
      isInclusive: applicableTaxRule.isInclusive,
      jurisdiction: applicableTaxRule.jurisdiction,
      breakdown: {
        subtotal: taxableAmount,
        taxAmount: taxAmount,
        total: totalPrice,
        appliedRule: {
          id: applicableTaxRule._id,
          description: applicableTaxRule.description,
          priority: applicableTaxRule.priority
        }
      }
    });

  } catch (err) {
    res.status(500).json({ message: "Tax calculation failed", error: err.message });
  }
};

// Helper function for third-party tax calculation
const calculateWithThirdParty = async (taxConfig, params) => {
  const { product, shippingAddress, billingAddress, quantity, discountAmount, customerId } = params;
  
  try {
    // Initialize tax service manager
    await taxServiceManager.initialize();
    
    const transactionData = {
      customerCode: customerId || 'GUEST_CUSTOMER',
      customerId: customerId,
      shipFrom: {
        country: 'US', // Default or from store settings
        postalCode: '12345', // Default or from store settings
        region: 'CA',
        city: 'San Francisco',
        line1: '123 Store St'
      },
      shipTo: {
        country: shippingAddress.country,
        postalCode: shippingAddress.zipCode,
        region: shippingAddress.state,
        city: shippingAddress.city,
        line1: shippingAddress.address
      },
      lineItems: [{
        id: product._id.toString(),
        quantity: quantity,
        amount: product.price * quantity - discountAmount,
        unitPrice: product.price,
        taxCode: product.taxProductCode || 'P0000000',
        description: product.name
      }],
      amount: product.price * quantity - discountAmount,
      shipping: 0
    };

    const result = await taxServiceManager.calculateTax(transactionData, taxConfig.taxService);
    
    if (!result.success) {
      throw new Error(result.error);
    }
    
    return {
      tax: result.totalTax || 0,
      rate: result.totalTax ? (result.totalTax / transactionData.amount * 100) : 0,
      totalPrice: result.totalAmount || (transactionData.amount + (result.totalTax || 0)),
      thirdPartyService: taxConfig.taxService,
      breakdown: result.breakdown || {},
      jurisdictions: result.jurisdictions || null
    };
  } catch (error) {
    console.error('Third-party tax calculation error:', error);
    throw error;
  }
};


// Create or update a tax rule with enhanced features
export const createOrUpdateTax = async (req, res) => {
  try {
    const {
      country, state, county, city, zipCode,
      category, brand, product, productCode,
      taxType, rate, flatAmount,
      isInclusive, isExempt, hasReducedRate,
      minAmount, maxAmount,
      startDate, endDate,
      priority, vendorTaxPreference,
      description, jurisdiction,
      vatNumber, customsCode
    } = req.body;

    // Validate required fields
    if (!country || (!rate && !flatAmount)) {
      return res.status(400).json({ message: "Country and tax rate/amount are required" });
    }

    // Check for existing rule
    let existing = await TaxRule.findOne({
      country, state, county, city, zipCode,
      category, brand, product, productCode
    });

    if (existing) {
      // Update existing rule
      Object.assign(existing, {
        taxType, rate, flatAmount,
        isInclusive, isExempt, hasReducedRate,
        minAmount, maxAmount,
        startDate, endDate,
        priority, vendorTaxPreference,
        description, jurisdiction,
        vatNumber, customsCode
      });
      
      await existing.save();
      return res.status(200).json({ message: "Tax rule updated", rule: existing });
    }

    // Create new rule
    const newRule = await TaxRule.create({
      country, state, county, city, zipCode,
      category, brand, product, productCode,
      taxType, rate, flatAmount,
      isInclusive, isExempt, hasReducedRate,
      minAmount, maxAmount,
      startDate, endDate,
      priority, vendorTaxPreference,
      description, jurisdiction,
      vatNumber, customsCode,
      createdBy: req.user._id
    });

    res.status(201).json({ message: "Tax rule created", rule: newRule });
  } catch (err) {
    res.status(500).json({ message: "Failed to create or update tax rule", error: err.message });
  }
};

// Bulk upload tax rules
export const bulkUploadTaxRules = async (req, res) => {
  try {
    const { taxRules } = req.body;
    
    if (!Array.isArray(taxRules) || taxRules.length === 0) {
      return res.status(400).json({ message: "Tax rules array is required" });
    }

    const results = {
      created: 0,
      updated: 0,
      errors: []
    };

    for (const [index, ruleData] of taxRules.entries()) {
      try {
        const existing = await TaxRule.findOne({
          country: ruleData.country,
          state: ruleData.state,
          category: ruleData.category,
          brand: ruleData.brand,
          product: ruleData.product,
          productCode: ruleData.productCode
        });

        if (existing) {
          Object.assign(existing, { ...ruleData, createdBy: req.user._id });
          await existing.save();
          results.updated++;
        } else {
          await TaxRule.create({ ...ruleData, createdBy: req.user._id });
          results.created++;
        }
      } catch (error) {
        results.errors.push({
          index,
          rule: ruleData,
          error: error.message
        });
      }
    }

    res.status(200).json({
      message: "Bulk upload completed",
      results
    });
  } catch (err) {
    res.status(500).json({ message: "Bulk upload failed", error: err.message });
  }
};

// Tax Exemption Management
export const createTaxExemption = async (req, res) => {
  try {
    const {
      customerId,
      exemptionType,
      exemptionCertificate,
      exemptionReason,
      validFrom,
      validUntil,
      exemptCategories,
      exemptProducts
    } = req.body;

    // Validate customer exists
    const customer = await User.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Check for existing exemption
    const existing = await TaxExemption.findOne({
      customer: customerId,
      isActive: true
    });

    if (existing) {
      return res.status(400).json({ message: "Customer already has an active tax exemption" });
    }

    const exemption = await TaxExemption.create({
      customer: customerId,
      exemptionType,
      exemptionCertificate,
      exemptionReason,
      validFrom,
      validUntil,
      exemptCategories,
      exemptProducts,
      createdBy: req.user._id
    });

    res.status(201).json({ message: "Tax exemption created", exemption });
  } catch (err) {
    res.status(500).json({ message: "Failed to create tax exemption", error: err.message });
  }
};

export const updateTaxExemption = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const exemption = await TaxExemption.findById(id);
    if (!exemption) {
      return res.status(404).json({ message: "Tax exemption not found" });
    }

    Object.assign(exemption, updateData);
    await exemption.save();

    res.status(200).json({ message: "Tax exemption updated", exemption });
  } catch (err) {
    res.status(500).json({ message: "Failed to update tax exemption", error: err.message });
  }
};

export const deleteTaxExemption = async (req, res) => {
  try {
    const { id } = req.params;
    
    const exemption = await TaxExemption.findById(id);
    if (!exemption) {
      return res.status(404).json({ message: "Tax exemption not found" });
    }

    exemption.isActive = false;
    await exemption.save();

    res.status(200).json({ message: "Tax exemption deactivated" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete tax exemption", error: err.message });
  }
};

export const getTaxExemptions = async (req, res) => {
  try {
    const { customerId, isActive = true } = req.query;
    
    const filter = { isActive };
    if (customerId) filter.customer = customerId;

    const exemptions = await TaxExemption.find(filter)
      .populate('customer', 'username email')
      .populate('exemptCategories', 'name')
      .populate('exemptProducts', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ exemptions });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch tax exemptions", error: err.message });
  }
};

// Tax Configuration Management
export const createOrUpdateTaxConfig = async (req, res) => {
  try {
    const configData = req.body;
    
    let config = await TaxConfig.findOne({ isActive: true });
    
    if (config) {
      Object.assign(config, { ...configData, updatedBy: req.user._id });
      await config.save();
    } else {
      config = await TaxConfig.create({ ...configData, updatedBy: req.user._id });
    }

    res.status(200).json({ message: "Tax configuration updated", config });
  } catch (err) {
    res.status(500).json({ message: "Failed to update tax configuration", error: err.message });
  }
};

export const getTaxConfig = async (req, res) => {
  try {
    const config = await TaxConfig.findOne({ isActive: true });
    res.status(200).json({ config });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch tax configuration", error: err.message });
  }
};

// Tax Reporting
export const getTaxReport = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      jurisdiction,
      taxType,
      groupBy = 'jurisdiction'
    } = req.query;

    const matchStage = {
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    if (jurisdiction) matchStage.jurisdiction = jurisdiction;
    if (taxType) matchStage.taxType = taxType;

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: `$${groupBy}`,
          totalTaxCollected: { $sum: '$taxAmount' },
          totalTransactions: { $sum: 1 },
          averageRate: { $avg: '$rate' },
          taxTypes: { $addToSet: '$taxType' }
        }
      },
      { $sort: { totalTaxCollected: -1 } }
    ];

    // Note: This would need actual order/transaction data integration
    // For now, return sample structure
    const report = {
      summary: {
        totalTaxCollected: 0,
        totalTransactions: 0,
        averageRate: 0,
        reportPeriod: { startDate, endDate }
      },
      breakdown: [],
      message: "Tax reporting requires integration with order/transaction data"
    };

    res.status(200).json({ report });
  } catch (err) {
    res.status(500).json({ message: "Failed to generate tax report", error: err.message });
  }
};

// Test third-party tax service connection
export const testTaxServiceConnection = async (req, res) => {
  try {
    const { service, apiConfig } = req.body;
    
    // Initialize tax service manager
    await taxServiceManager.initialize();
    
    const result = await taxServiceManager.testService(service, apiConfig);
    
    if (result.success) {
      res.status(200).json({
        message: "Tax service connection successful",
        service,
        testResult: result.data
      });
    } else {
      res.status(400).json({
        message: "Tax service connection failed",
        error: result.error
      });
    }
  } catch (error) {
    res.status(400).json({
      message: "Tax service connection failed",
      error: error.message
    });
  }
};

// Validate address using third-party service
export const validateAddress = async (req, res) => {
  try {
    const { address, service = 'avalara' } = req.body;
    
    await taxServiceManager.initialize();
    
    const result = await taxServiceManager.validateAddress(address, service);
    
    if (result.success) {
      res.status(200).json({
        message: "Address validated successfully",
        validatedAddress: result.validatedAddress
      });
    } else {
      res.status(400).json({
        message: "Address validation failed",
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Address validation failed",
      error: error.message
    });
  }
};

// Get tax rates for location
export const getTaxRatesForLocation = async (req, res) => {
  try {
    const { zipCode, city, state, country } = req.query;
    const service = req.query.service || 'taxjar';
    
    await taxServiceManager.initialize();
    
    const params = { city, state, country };
    const result = await taxServiceManager.getRatesForLocation(zipCode, params, service);
    
    if (result.success) {
      res.status(200).json({
        message: "Tax rates retrieved successfully",
        rates: result.rates
      });
    } else {
      res.status(400).json({
        message: "Failed to retrieve tax rates",
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve tax rates",
      error: error.message
    });
  }
};

// Initialize tax service on startup
export const initializeTaxServices = async (req, res) => {
  try {
    await taxServiceManager.initialize();
    
    res.status(200).json({
      message: "Tax services initialized successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to initialize tax services",
      error: error.message
    });
  }
};

// Sync tax rules from third-party service
export const syncTaxRulesFromService = async (req, res) => {
  try {
    const { service, jurisdictions } = req.body;
    
    await taxServiceManager.initialize();
    
    // This would implement syncing logic based on the service
    // For now, return a placeholder response
    res.status(200).json({
      message: "Tax rules sync initiated",
      service,
      status: "in_progress"
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to sync tax rules",
      error: error.message
    });
  }
};

// Get tax rate for a product and customer location (Legacy support)
export const calculateTax = async (req, res) => {
  // Redirect to advanced calculation for backward compatibility
  return calculateAdvancedTax(req, res);
};

// Get all tax rules with enhanced filtering
export const getAllTaxRules = async (req, res) => {
  try {
    const {
      country,
      state,
      taxType,
      isActive = true,
      page = 1,
      limit = 50,
      sortBy = 'priority',
      sortOrder = 'desc'
    } = req.query;

    const filter = { isActive };
    if (country) filter.country = country;
    if (state) filter.state = state;
    if (taxType) filter.taxType = taxType;

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const rules = await TaxRule.find(filter)
      .populate("category brand product", "name")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await TaxRule.countDocuments(filter);

    res.status(200).json({
      rules,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch tax rules", error: err.message });
  }
};

// Delete a tax rule (soft delete)
export const deleteTaxRule = async (req, res) => {
  try {
    const { id } = req.params;
    const { permanent = false } = req.query;
    
    if (permanent) {
      const deleted = await TaxRule.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ message: "Tax rule not found" });
      res.status(200).json({ message: "Tax rule permanently deleted" });
    } else {
      const updated = await TaxRule.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
      );
      if (!updated) return res.status(404).json({ message: "Tax rule not found" });
      res.status(200).json({ message: "Tax rule deactivated", rule: updated });
    }
  } catch (err) {
    res.status(500).json({ message: "Failed to delete tax rule", error: err.message });
  }
};
