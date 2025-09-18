import axios from 'axios';
import { TaxConfig } from '../models/taxModel.js';

// Avalara Tax Service Integration
class AvalaraTaxService {
  constructor(config) {
    this.config = config;
    this.baseUrl = config.sandbox ? 'https://sandbox-rest.avatax.com' : 'https://rest.avatax.com';
    this.headers = {
      'Authorization': `Basic ${Buffer.from(`${config.apiKey}:`).toString('base64')}`,
      'Content-Type': 'application/json'
    };
  }

  async testConnection() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/v2/utilities/ping`, {
        headers: this.headers
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async calculateTax(transactionData) {
    try {
      const payload = {
        type: 'SalesInvoice',
        companyCode: this.config.companyCode,
        date: new Date().toISOString().split('T')[0],
        customerCode: transactionData.customerCode,
        lines: transactionData.lineItems.map((item, index) => ({
          number: index + 1,
          quantity: item.quantity,
          amount: item.amount,
          taxCode: item.taxCode || 'P0000000',
          description: item.description,
          addresses: {
            shipFrom: transactionData.shipFrom,
            shipTo: transactionData.shipTo
          }
        }))
      };

      const response = await axios.post(
        `${this.baseUrl}/api/v2/companies/${this.config.companyCode}/transactions/create`,
        payload,
        { headers: this.headers }
      );

      return {
        success: true,
        totalTax: response.data.totalTax,
        totalAmount: response.data.totalAmount,
        lines: response.data.lines,
        breakdown: response.data.summary
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  async validateAddress(address) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/v2/addresses/resolve`,
        { ...address },
        { headers: this.headers }
      );
      return { success: true, validatedAddress: response.data.validatedAddresses[0] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// TaxJar Tax Service Integration
class TaxJarService {
  constructor(config) {
    this.config = config;
    this.baseUrl = config.sandbox ? 'https://api.sandbox.taxjar.com' : 'https://api.taxjar.com';
    this.headers = {
      'Authorization': `Token token=\"${config.apiKey}\"`,
      'Content-Type': 'application/json'
    };
  }

  async testConnection() {
    try {
      const response = await axios.get(`${this.baseUrl}/v2/rates/90210`, {
        headers: this.headers
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async calculateTax(transactionData) {
    try {
      const payload = {
        from_country: transactionData.shipFrom.country,
        from_zip: transactionData.shipFrom.postalCode,
        from_state: transactionData.shipFrom.region,
        from_city: transactionData.shipFrom.city,
        from_street: transactionData.shipFrom.line1,
        to_country: transactionData.shipTo.country,
        to_zip: transactionData.shipTo.postalCode,
        to_state: transactionData.shipTo.region,
        to_city: transactionData.shipTo.city,
        to_street: transactionData.shipTo.line1,
        amount: transactionData.amount,
        shipping: transactionData.shipping || 0,
        line_items: transactionData.lineItems.map(item => ({
          id: item.id,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          product_tax_code: item.taxCode
        }))
      };

      const response = await axios.post(
        `${this.baseUrl}/v2/taxes`,
        payload,
        { headers: this.headers }
      );

      return {
        success: true,
        totalTax: response.data.tax.amount_to_collect,
        totalAmount: response.data.tax.order_total_amount,
        breakdown: response.data.tax.breakdown,
        jurisdictions: response.data.tax.jurisdictions
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  async getRatesForLocation(zipCode, params = {}) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/v2/rates/${zipCode}`,
        { 
          headers: this.headers,
          params: params
        }
      );
      return { success: true, rates: response.data.rate };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Quaderno Tax Service Integration
class QuadernoService {
  constructor(config) {
    this.config = config;
    this.baseUrl = config.sandbox ? 'https://sandbox-quadernoapp.com' : 'https://quadernoapp.com';
    this.headers = {
      'Authorization': `Basic ${Buffer.from(`${config.apiKey}:`).toString('base64')}`,
      'Content-Type': 'application/json'
    };
  }

  async testConnection() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/account`, {
        headers: this.headers
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async calculateTax(transactionData) {
    try {
      const payload = {
        currency: 'USD',
        kind: 'sale',
        processor: 'api',
        processor_id: `tx_${Date.now()}`,
        customer: {
          id: transactionData.customerId,
          billing_address: transactionData.shipTo
        },
        items: transactionData.lineItems.map(item => ({
          product_code: item.taxCode,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total_amount: item.amount
        }))
      };

      const response = await axios.post(
        `${this.baseUrl}/api/transactions/calculate`,
        payload,
        { headers: this.headers }
      );

      return {
        success: true,
        totalTax: response.data.total_tax_amount,
        totalAmount: response.data.total_amount,
        breakdown: response.data.tax_breakdown
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.errors || error.message
      };
    }
  }
}

// Tax Service Factory
class TaxServiceFactory {
  static create(serviceType, config) {
    switch (serviceType) {
      case 'avalara':
        return new AvalaraTaxService(config);
      case 'taxjar':
        return new TaxJarService(config);
      case 'quaderno':
        return new QuadernoService(config);
      default:
        throw new Error(`Unsupported tax service: ${serviceType}`);
    }
  }
}

// Tax Service Manager
class TaxServiceManager {
  constructor() {
    this.services = new Map();
    this.defaultService = null;
  }

  async initialize() {
    try {
      const config = await TaxConfig.findOne({ isActive: true });
      if (config && config.taxService !== 'internal') {
        const service = TaxServiceFactory.create(config.taxService, config.apiConfig);
        this.services.set(config.taxService, service);
        this.defaultService = service;
      }
    } catch (error) {
      console.error('Failed to initialize tax service:', error);
    }
  }

  async calculateTax(transactionData, serviceType = null) {
    try {
      const service = serviceType ? 
        this.services.get(serviceType) : 
        this.defaultService;

      if (!service) {
        throw new Error('No tax service available');
      }

      return await service.calculateTax(transactionData);
    } catch (error) {
      console.error('Tax calculation failed:', error);
      return { success: false, error: error.message };
    }
  }

  async testService(serviceType, config) {
    try {
      const service = TaxServiceFactory.create(serviceType, config);
      return await service.testConnection();
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async validateAddress(address, serviceType = 'avalara') {
    try {
      const service = this.services.get(serviceType);
      if (!service || !service.validateAddress) {
        throw new Error('Address validation not supported by this service');
      }
      return await service.validateAddress(address);
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getRatesForLocation(zipCode, params = {}, serviceType = 'taxjar') {
    try {
      const service = this.services.get(serviceType);
      if (!service || !service.getRatesForLocation) {
        throw new Error('Rate lookup not supported by this service');
      }
      return await service.getRatesForLocation(zipCode, params);
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
const taxServiceManager = new TaxServiceManager();
export default taxServiceManager;
export { TaxServiceFactory, AvalaraTaxService, TaxJarService, QuadernoService };