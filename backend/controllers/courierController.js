import CourierPartner, { ShippingRate, Shipment, VendorCourierMapping } from "../models/courierModel.js";
import Order from "../models/orderModel.js";
import User from "../models/userModel.js";
import axios from "axios";

// Courier Integration APIs
const courierAPIs = {
  fedex: {
    calculateRate: async (config, shipmentData) => {
      const { apiKey, secretKey, accountNumber, meterNumber, sandbox } = config;
      const baseUrl = sandbox ? 'https://apis-sandbox.fedex.com' : 'https://apis.fedex.com';
      
      try {
        // Get OAuth token
        const tokenResponse = await axios.post(`${baseUrl}/oauth/token`, {
          grant_type: 'client_credentials',
          client_id: apiKey,
          client_secret: secretKey
        });
        
        const token = tokenResponse.data.access_token;
        
        // Calculate shipping rate
        const rateResponse = await axios.post(`${baseUrl}/rate/v1/rates/quotes`, {
          accountNumber: {
            value: accountNumber
          },
          requestedShipment: {
            shipper: {
              address: shipmentData.fromAddress
            },
            recipient: {
              address: shipmentData.toAddress
            },
            serviceType: shipmentData.serviceType,
            packagingType: "YOUR_PACKAGING",
            requestedPackageLineItems: [{
              weight: {
                units: "KG",
                value: shipmentData.weight
              },
              dimensions: {
                length: shipmentData.dimensions.length,
                width: shipmentData.dimensions.width,
                height: shipmentData.dimensions.height,
                units: "CM"
              }
            }]
          }
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        return rateResponse.data;
      } catch (error) {
        throw new Error(`FedEx API Error: ${error.response?.data?.errors?.[0]?.message || error.message}`);
      }
    },
    
    createShipment: async (config, shipmentData) => {
      // Similar implementation for creating shipment
      // This would create the actual shipping label and tracking number
      return { trackingNumber: 'FEDEX123456789', labelUrl: 'https://example.com/label.pdf' };
    },
    
    trackShipment: async (config, trackingNumber) => {
      // Implementation for tracking shipment
      return {
        trackingNumber,
        status: 'IN_TRANSIT',
        events: []
      };
    }
  },
  
  ups: {
    calculateRate: async (config, shipmentData) => {
      // UPS API implementation
      return { rate: 15.99, serviceCode: 'UPS_GROUND' };
    },
    
    createShipment: async (config, shipmentData) => {
      return { trackingNumber: 'UPS123456789', labelUrl: 'https://example.com/label.pdf' };
    },
    
    trackShipment: async (config, trackingNumber) => {
      return {
        trackingNumber,
        status: 'IN_TRANSIT',
        events: []
      };
    }
  },
  
  dhl: {
    calculateRate: async (config, shipmentData) => {
      // DHL API implementation
      return { rate: 18.50, serviceCode: 'DHL_EXPRESS' };
    },
    
    createShipment: async (config, shipmentData) => {
      return { trackingNumber: 'DHL123456789', labelUrl: 'https://example.com/label.pdf' };
    },
    
    trackShipment: async (config, trackingNumber) => {
      return {
        trackingNumber,
        status: 'IN_TRANSIT',
        events: []
      };
    }
  }
};

// Courier Partner Management
export const createCourierPartner = async (req, res) => {
  try {
    const courierData = req.body;
    courierData.createdBy = req.user._id;
    
    const courier = await CourierPartner.create(courierData);
    res.status(201).json({ message: "Courier partner created successfully", courier });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: "Courier code already exists" });
    } else {
      res.status(500).json({ message: "Failed to create courier partner", error: error.message });
    }
  }
};

export const updateCourierPartner = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const courier = await CourierPartner.findByIdAndUpdate(id, updateData, { new: true });
    if (!courier) {
      return res.status(404).json({ message: "Courier partner not found" });
    }
    
    res.status(200).json({ message: "Courier partner updated successfully", courier });
  } catch (error) {
    res.status(500).json({ message: "Failed to update courier partner", error: error.message });
  }
};

export const getCourierPartners = async (req, res) => {
  try {
    const { isActive = true, vendorId } = req.query;
    
    let couriers;
    
    if (vendorId) {
      // Get couriers mapped to specific vendor
      const mappings = await VendorCourierMapping.find({
        vendor: vendorId,
        isActive: true
      }).populate('courier');
      
      couriers = mappings.map(mapping => ({
        ...mapping.courier.toObject(),
        vendorConfig: {
          priority: mapping.priority,
          markup: mapping.markup,
          allowedServices: mapping.allowedServices,
          autoBook: mapping.autoBook
        }
      }));
    } else {
      couriers = await CourierPartner.find({ isActive }).sort({ priority: -1 });
    }
    
    res.status(200).json({ couriers });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch courier partners", error: error.message });
  }
};

export const deleteCourierPartner = async (req, res) => {
  try {
    const { id } = req.params;
    
    const courier = await CourierPartner.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    
    if (!courier) {
      return res.status(404).json({ message: "Courier partner not found" });
    }
    
    res.status(200).json({ message: "Courier partner deactivated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete courier partner", error: error.message });
  }
};

// Shipping Rate Management
export const calculateShippingRates = async (req, res) => {
  try {
    const {
      fromAddress,
      toAddress,
      weight,
      dimensions,
      orderValue,
      vendorId,
      useRealTimeRates = false
    } = req.body;
    
    // Get available couriers for the vendor
    let availableCouriers;
    if (vendorId) {
      const mappings = await VendorCourierMapping.find({
        vendor: vendorId,
        isActive: true
      }).populate('courier');
      availableCouriers = mappings.filter(m => m.courier.isActive);
    } else {
      const couriers = await CourierPartner.find({ isActive: true });
      availableCouriers = couriers.map(c => ({ courier: c }));
    }
    
    const rates = [];
    
    for (const mapping of availableCouriers) {
      const courier = mapping.courier;
      
      try {
        if (useRealTimeRates && courierAPIs[courier.code]) {
          // Get real-time rates from courier API
          const apiRates = await courierAPIs[courier.code].calculateRate(
            courier.apiConfig,
            { fromAddress, toAddress, weight, dimensions }
          );
          
          for (const service of courier.services) {
            if (service.isActive) {
              const baseRate = apiRates.rate || 0;
              const markup = mapping.markup || 0;
              const finalRate = baseRate + (baseRate * markup / 100);
              
              rates.push({
                courier: {
                  id: courier._id,
                  name: courier.name,
                  displayName: courier.displayName,
                  logo: courier.logo
                },
                service: {
                  code: service.serviceCode,
                  name: service.serviceName,
                  type: service.serviceType,
                  deliveryTime: service.deliveryTime
                },
                rate: finalRate,
                estimatedDelivery: calculateEstimatedDelivery(service.serviceType),
                isRealTime: true
              });
            }
          }
        } else {
          // Use stored rates
          const storedRates = await ShippingRate.find({
            courier: courier._id,
            isActive: true,
            'fromZone.country': fromAddress.country,
            'toZone.country': toAddress.country
          });
          
          for (const rate of storedRates) {
            const applicableRate = calculateRateFromStored(rate, weight, orderValue);
            const markup = mapping.markup || 0;
            const finalRate = applicableRate + (applicableRate * markup / 100);
            
            const service = courier.services.find(s => s.serviceCode === rate.service);
            if (service && service.isActive) {
              rates.push({
                courier: {
                  id: courier._id,
                  name: courier.name,
                  displayName: courier.displayName,
                  logo: courier.logo
                },
                service: {
                  code: service.serviceCode,
                  name: service.serviceName,
                  type: service.serviceType,
                  deliveryTime: service.deliveryTime
                },
                rate: finalRate,
                estimatedDelivery: calculateEstimatedDelivery(service.serviceType),
                isRealTime: false
              });
            }
          }
        }
      } catch (error) {
        console.log(`Error calculating rates for ${courier.name}:`, error.message);
        // Continue with other couriers
      }
    }
    
    // Sort by rate (cheapest first)
    rates.sort((a, b) => a.rate - b.rate);
    
    res.status(200).json({ rates });
  } catch (error) {
    res.status(500).json({ message: "Failed to calculate shipping rates", error: error.message });
  }
};

// Helper function to calculate rate from stored configuration
const calculateRateFromStored = (rateConfig, weight, orderValue) => {
  let rate = rateConfig.basePrice;
  
  if (rateConfig.pricingType === 'weight_based') {
    const applicableRange = rateConfig.weightRanges.find(
      range => weight >= range.minWeight && weight <= range.maxWeight
    );
    if (applicableRange) {
      rate = applicableRange.price;
    }
  }
  
  // Add additional charges
  rate += rateConfig.handlingFee || 0;
  rate += (rate * (rateConfig.fuelSurcharge || 0)) / 100;
  
  if (rateConfig.insuranceFee && orderValue) {
    rate += (orderValue * rateConfig.insuranceFee) / 100;
  }
  
  return rate;
};

// Helper function to calculate estimated delivery
const calculateEstimatedDelivery = (serviceType) => {
  const now = new Date();
  let days = 3; // default
  
  switch (serviceType) {
    case 'same_day':
      days = 0;
      break;
    case 'next_day':
      days = 1;
      break;
    case 'express':
      days = 2;
      break;
    case 'standard':
      days = 3;
      break;
    case 'economy':
      days = 5;
      break;
  }
  
  const estimatedDate = new Date(now);
  estimatedDate.setDate(estimatedDate.getDate() + days);
  return estimatedDate;
};

// Shipment Management
export const createShipment = async (req, res) => {
  try {
    const {
      orderId,
      courierId,
      serviceCode,
      fromAddress,
      toAddress,
      weight,
      dimensions,
      instructions,
      signatureRequired = false,
      insuranceValue = 0,
      codAmount = 0
    } = req.body;
    
    // Validate order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    // Get courier details
    const courier = await CourierPartner.findById(courierId);
    if (!courier || !courier.isActive) {
      return res.status(404).json({ message: "Courier not found or inactive" });
    }
    
    // Generate tracking number
    const trackingNumber = generateTrackingNumber(courier.code);
    
    // Calculate shipping cost
    const shippingCost = await calculateShippingCost(courier, serviceCode, weight, fromAddress, toAddress);
    const totalCost = shippingCost + insuranceValue + codAmount;
    
    // Create shipment record
    const shipment = await Shipment.create({
      order: orderId,
      trackingNumber,
      courier: courierId,
      service: serviceCode,
      weight,
      dimensions,
      fromAddress,
      toAddress,
      shippingCost,
      insuranceValue,
      codAmount,
      totalCost,
      instructions,
      signatureRequired,
      estimatedDelivery: calculateEstimatedDelivery(
        courier.services.find(s => s.serviceCode === serviceCode)?.serviceType || 'standard'
      ),
      createdBy: req.user._id
    });
    
    // Create shipment with courier API if configured
    if (courierAPIs[courier.code]) {
      try {
        const courierResponse = await courierAPIs[courier.code].createShipment(
          courier.apiConfig,
          {
            trackingNumber,
            fromAddress,
            toAddress,
            weight,
            dimensions,
            serviceCode,
            instructions
          }
        );
        
        shipment.courierResponse = courierResponse;
        shipment.labelUrl = courierResponse.labelUrl;
        shipment.status = 'booked';
        await shipment.save();
      } catch (error) {
        console.log(`Error creating shipment with ${courier.name}:`, error.message);
        // Continue with internal tracking
      }
    }
    
    // Update order with tracking information
    order.trackingNumber = trackingNumber;
    order.shippingCarrier = courier.name;
    order.trackingUrl = courier.trackingConfig?.trackingUrl?.replace('{trackingNumber}', trackingNumber);
    order.orderStatus = 'Shipped';
    await order.save();
    
    res.status(201).json({
      message: "Shipment created successfully",
      shipment,
      trackingNumber,
      labelUrl: shipment.labelUrl
    });
    
  } catch (error) {
    res.status(500).json({ message: "Failed to create shipment", error: error.message });
  }
};

// Helper function to generate tracking number
const generateTrackingNumber = (courierCode) => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${courierCode.toUpperCase()}${timestamp.slice(-8)}${random}`;
};

// Helper function to calculate shipping cost
const calculateShippingCost = async (courier, serviceCode, weight, fromAddress, toAddress) => {
  // This would typically use the rate calculation logic
  // For now, return a default calculation
  const baseRate = 10; // Default base rate
  const weightRate = weight * 2; // $2 per kg
  return baseRate + weightRate;
};

// Track shipment
export const trackShipment = async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    
    const shipment = await Shipment.findOne({ trackingNumber })
      .populate('courier', 'name code trackingConfig')
      .populate('order', 'orderNumber user');
    
    if (!shipment) {
      return res.status(404).json({ message: "Shipment not found" });
    }
    
    // Try to get real-time tracking from courier API
    if (courierAPIs[shipment.courier.code]) {
      try {
        const trackingData = await courierAPIs[shipment.courier.code].trackShipment(
          shipment.courier.apiConfig,
          trackingNumber
        );
        
        // Update shipment with latest tracking data
        if (trackingData.events && trackingData.events.length > 0) {
          shipment.trackingEvents = trackingData.events.map(event => ({
            timestamp: new Date(event.timestamp),
            status: event.status,
            location: event.location,
            description: event.description,
            courierStatus: event.courierStatus,
            isDelivered: event.isDelivered
          }));
          
          // Update shipment status
          const latestEvent = trackingData.events[trackingData.events.length - 1];
          shipment.status = mapCourierStatusToInternal(latestEvent.status, shipment.courier.trackingConfig);
          
          if (latestEvent.isDelivered) {
            shipment.actualDelivery = new Date(latestEvent.timestamp);
            
            // Update order status
            const order = await Order.findById(shipment.order._id);
            if (order) {
              order.orderStatus = 'Delivered';
              order.deliveredAt = shipment.actualDelivery;
              await order.save();
            }
          }
          
          await shipment.save();
        }
      } catch (error) {
        console.log(`Error tracking shipment ${trackingNumber}:`, error.message);
        // Continue with stored data
      }
    }
    
    res.status(200).json({
      trackingNumber: shipment.trackingNumber,
      status: shipment.status,
      estimatedDelivery: shipment.estimatedDelivery,
      actualDelivery: shipment.actualDelivery,
      courier: {
        name: shipment.courier.name,
        trackingUrl: shipment.courier.trackingConfig?.trackingUrl?.replace('{trackingNumber}', trackingNumber)
      },
      events: shipment.trackingEvents.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
      order: {
        orderNumber: shipment.order.orderNumber,
        customer: shipment.order.user
      }
    });
    
  } catch (error) {
    res.status(500).json({ message: "Failed to track shipment", error: error.message });
  }
};

// Helper function to map courier status to internal status
const mapCourierStatusToInternal = (courierStatus, trackingConfig) => {
  const mapping = trackingConfig?.trackingEventMapping?.find(
    m => m.courierStatus === courierStatus
  );
  
  return mapping?.internalStatus || 'in_transit';
};

// Vendor-Courier Mapping Management
export const createVendorCourierMapping = async (req, res) => {
  try {
    const mappingData = req.body;
    mappingData.createdBy = req.user._id;
    
    // Check if mapping already exists
    const existingMapping = await VendorCourierMapping.findOne({
      vendor: mappingData.vendor,
      courier: mappingData.courier
    });
    
    if (existingMapping) {
      return res.status(400).json({ message: "Vendor-courier mapping already exists" });
    }
    
    const mapping = await VendorCourierMapping.create(mappingData);
    
    res.status(201).json({ message: "Vendor-courier mapping created successfully", mapping });
  } catch (error) {
    res.status(500).json({ message: "Failed to create vendor-courier mapping", error: error.message });
  }
};

export const updateVendorCourierMapping = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const mapping = await VendorCourierMapping.findByIdAndUpdate(id, updateData, { new: true });
    if (!mapping) {
      return res.status(404).json({ message: "Vendor-courier mapping not found" });
    }
    
    res.status(200).json({ message: "Vendor-courier mapping updated successfully", mapping });
  } catch (error) {
    res.status(500).json({ message: "Failed to update vendor-courier mapping", error: error.message });
  }
};

export const getVendorCourierMappings = async (req, res) => {
  try {
    const { vendorId } = req.query;
    
    const filter = {};
    if (vendorId) filter.vendor = vendorId;
    
    const mappings = await VendorCourierMapping.find(filter)
      .populate('vendor', 'username email companyName')
      .populate('courier', 'name displayName code logo')
      .sort({ priority: -1 });
    
    res.status(200).json({ mappings });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch vendor-courier mappings", error: error.message });
  }
};

// Bulk shipment operations
export const createBulkShipments = async (req, res) => {
  try {
    const { shipments } = req.body;
    
    if (!Array.isArray(shipments) || shipments.length === 0) {
      return res.status(400).json({ message: "Shipments array is required" });
    }
    
    const results = {
      created: 0,
      failed: 0,
      errors: []
    };
    
    for (const [index, shipmentData] of shipments.entries()) {
      try {
        // Create individual shipment (reuse createShipment logic)
        const trackingNumber = generateTrackingNumber(shipmentData.courierCode || 'BULK');
        
        const shipment = await Shipment.create({
          ...shipmentData,
          trackingNumber,
          createdBy: req.user._id
        });
        
        results.created++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          index,
          shipmentData,
          error: error.message
        });
      }
    }
    
    res.status(200).json({
      message: "Bulk shipment creation completed",
      results
    });
    
  } catch (error) {
    res.status(500).json({ message: "Failed to create bulk shipments", error: error.message });
  }
};

export const getShipments = async (req, res) => {
  try {
    const {
      orderId,
      courierId,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 20
    } = req.query;
    
    const filter = { isActive: true };
    
    if (orderId) filter.order = orderId;
    if (courierId) filter.courier = courierId;
    if (status) filter.status = status;
    
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const shipments = await Shipment.find(filter)
      .populate('order', 'orderNumber totalPrice')
      .populate('courier', 'name displayName code')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    const total = await Shipment.countDocuments(filter);
    
    res.status(200).json({
      shipments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
    
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch shipments", error: error.message });
  }
};