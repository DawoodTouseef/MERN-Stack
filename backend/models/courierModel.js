import mongoose from "mongoose";

// Courier Partner Schema
const courierPartnerSchema = mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true }, // e.g., 'fedex', 'ups', 'dhl'
  displayName: { type: String, required: true },
  logo: { type: String }, // URL to courier logo
  
  // API Configuration
  apiConfig: {
    baseUrl: { type: String, required: true },
    apiKey: { type: String, required: true },
    secretKey: { type: String },
    accountNumber: { type: String },
    meterNumber: { type: String }, // For FedEx
    sandbox: { type: Boolean, default: true },
    webhookUrl: { type: String }
  },
  
  // Service Capabilities
  services: [{
    serviceCode: { type: String, required: true }, // e.g., 'STANDARD_OVERNIGHT'
    serviceName: { type: String, required: true },
    serviceType: {
      type: String,
      enum: ['express', 'standard', 'economy', 'same_day', 'next_day'],
      required: true
    },
    deliveryTime: { type: String }, // e.g., '1-2 business days'
    isActive: { type: Boolean, default: true }
  }],
  
  // Delivery Zones and Pricing
  deliveryZones: [{
    zoneName: { type: String, required: true },
    countries: [{ type: String }],
    states: [{ type: String }],
    cities: [{ type: String }],
    zipCodes: [{ type: String }],
    basePrice: { type: Number, required: true },
    pricePerKg: { type: Number, required: true },
    pricePerKm: { type: Number, default: 0 },
    maxWeight: { type: Number, default: 50 }, // in kg
    isActive: { type: Boolean, default: true }
  }],
  
  // Tracking Configuration
  trackingConfig: {
    trackingUrl: { type: String }, // URL pattern for tracking
    trackingApiUrl: { type: String },
    supportsBulkTracking: { type: Boolean, default: false },
    trackingEventMapping: [{
      courierStatus: { type: String },
      internalStatus: {
        type: String,
        enum: ['Placed', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Exception', 'Returned']
      },
      description: { type: String }
    }]
  },
  
  // Business Configuration
  isActive: { type: Boolean, default: true },
  priority: { type: Number, default: 1 }, // Higher number = higher priority
  minOrderValue: { type: Number, default: 0 },
  maxOrderValue: { type: Number },
  supportsCOD: { type: Boolean, default: false },
  supportsInsurance: { type: Boolean, default: false },
  supportsPickup: { type: Boolean, default: true },
  
  // Operational Hours
  operationalHours: {
    monday: { start: String, end: String, isActive: Boolean },
    tuesday: { start: String, end: String, isActive: Boolean },
    wednesday: { start: String, end: String, isActive: Boolean },
    thursday: { start: String, end: String, isActive: Boolean },
    friday: { start: String, end: String, isActive: Boolean },
    saturday: { start: String, end: String, isActive: Boolean },
    sunday: { start: String, end: String, isActive: Boolean }
  },
  
  // Contact Information
  contactInfo: {
    phone: { type: String },
    email: { type: String },
    supportUrl: { type: String },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    }
  },
  
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

// Shipping Rate Schema for dynamic pricing
const shippingRateSchema = mongoose.Schema({
  courier: { type: mongoose.Schema.Types.ObjectId, ref: "CourierPartner", required: true },
  service: { type: String, required: true }, // Service code from courier
  
  // Geographic Coverage
  fromZone: {
    country: { type: String, required: true },
    state: { type: String },
    city: { type: String },
    zipCode: { type: String }
  },
  
  toZone: {
    country: { type: String, required: true },
    state: { type: String },
    city: { type: String },
    zipCode: { type: String }
  },
  
  // Pricing Structure
  pricingType: {
    type: String,
    enum: ['flat', 'weight_based', 'zone_based', 'distance_based'],
    default: 'weight_based'
  },
  
  basePrice: { type: Number, required: true },
  
  // Weight-based pricing
  weightRanges: [{
    minWeight: { type: Number, required: true }, // in kg
    maxWeight: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  
  // Distance-based pricing
  pricePerKm: { type: Number, default: 0 },
  
  // Additional charges
  fuelSurcharge: { type: Number, default: 0 }, // percentage
  handlingFee: { type: Number, default: 0 },
  insuranceFee: { type: Number, default: 0 }, // percentage of order value
  codFee: { type: Number, default: 0 },
  
  // Validity
  isActive: { type: Boolean, default: true },
  validFrom: { type: Date, default: Date.now },
  validUntil: { type: Date },
  
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

// Shipment Schema for tracking individual shipments
const shipmentSchema = mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  trackingNumber: { type: String, required: true, unique: true },
  
  // Courier Information
  courier: { type: mongoose.Schema.Types.ObjectId, ref: "CourierPartner", required: true },
  service: { type: String, required: true },
  
  // Shipment Details
  weight: { type: Number, required: true }, // in kg
  dimensions: {
    length: { type: Number, required: true }, // in cm
    width: { type: Number, required: true },
    height: { type: Number, required: true }
  },
  
  // Addresses
  fromAddress: {
    name: { type: String, required: true },
    company: { type: String },
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  
  toAddress: {
    name: { type: String, required: true },
    company: { type: String },
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  
  // Pricing
  shippingCost: { type: Number, required: true },
  insuranceValue: { type: Number, default: 0 },
  codAmount: { type: Number, default: 0 },
  totalCost: { type: Number, required: true },
  
  // Status and Tracking
  status: {
    type: String,
    enum: ['created', 'booked', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'exception', 'returned'],
    default: 'created'
  },
  
  // Tracking Events
  trackingEvents: [{
    timestamp: { type: Date, required: true },
    status: { type: String, required: true },
    location: {
      city: String,
      state: String,
      country: String
    },
    description: { type: String, required: true },
    courierStatus: { type: String }, // Original status from courier
    isDelivered: { type: Boolean, default: false },
    signedBy: { type: String }
  }],
  
  // Estimated and Actual Delivery
  estimatedDelivery: { type: Date },
  actualDelivery: { type: Date },
  
  // Special Instructions
  instructions: { type: String },
  signatureRequired: { type: Boolean, default: false },
  
  // Documents
  labelUrl: { type: String }, // URL to shipping label
  invoiceUrl: { type: String },
  
  // API Response Storage
  courierResponse: { type: mongoose.Schema.Types.Mixed }, // Store full API response
  
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

// Vendor-Courier Mapping Schema
const vendorCourierMappingSchema = mongoose.Schema({
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  courier: { type: mongoose.Schema.Types.ObjectId, ref: "CourierPartner", required: true },
  
  // Custom Configuration for this vendor
  isActive: { type: Boolean, default: true },
  priority: { type: Number, default: 1 },
  
  // Custom pricing override
  markup: { type: Number, default: 0 }, // percentage markup on courier rates
  discountPercentage: { type: Number, default: 0 },
  
  // Service restrictions
  allowedServices: [{ type: String }], // Array of service codes
  blockedZones: [{ type: String }], // Array of zone names
  
  // Custom operational settings
  autoBook: { type: Boolean, default: false }, // Auto-book shipments
  requireApproval: { type: Boolean, default: true },
  
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

const CourierPartner = mongoose.model("CourierPartner", courierPartnerSchema);
const ShippingRate = mongoose.model("ShippingRate", shippingRateSchema);
const Shipment = mongoose.model("Shipment", shipmentSchema);
const VendorCourierMapping = mongoose.model("VendorCourierMapping", vendorCourierMappingSchema);

export default CourierPartner;
export { ShippingRate, Shipment, VendorCourierMapping };