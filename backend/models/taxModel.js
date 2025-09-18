import mongoose from "mongoose";

// Enhanced Tax Rule Schema with comprehensive tax support
const taxRuleSchema = mongoose.Schema({
  // Geographic Configuration
  country: { type: String, required: true },
  state: { type: String }, // optional
  county: { type: String }, // for county-level taxes
  city: { type: String }, // for city-level taxes
  zipCode: { type: String }, // for specific zip code rules
  
  // Product Classifications
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand", default: null },
  productCode: { type: String }, // HSN/SAC codes for tax classification
  
  // Tax Configuration
  taxType: {
    type: String,
    enum: ["sales_tax", "vat", "gst", "customs_duty", "excise_tax", "service_tax"],
    default: "sales_tax"
  },
  rate: { type: Number, required: true }, // Tax rate percentage
  flatAmount: { type: Number, default: 0 }, // Fixed tax amount
  
  // Tax Behavior
  isInclusive: { type: Boolean, default: false }, // Tax included in price or added
  isExempt: { type: Boolean, default: false }, // Product/category exemption
  hasReducedRate: { type: Boolean, default: false }, // Reduced rate eligibility
  
  // Threshold Configuration
  minAmount: { type: Number, default: 0 }, // Minimum amount for tax application
  maxAmount: { type: Number }, // Maximum taxable amount
  
  // Time-based Rules
  isActive: { type: Boolean, default: true },
  startDate: { type: Date },
  endDate: { type: Date }, // For tax holidays
  
  // Priority and Hierarchy
  priority: { type: Number, default: 1 }, // Higher number = higher priority
  
  // Vendor/Seller Configuration
  vendorTaxPreference: {
    type: String,
    enum: ["inclusive", "exclusive", "auto"],
    default: "auto"
  },
  
  description: { type: String },
  jurisdiction: { type: String }, // Tax authority
  
  // International Support
  vatNumber: { type: String }, // For EU VAT
  customsCode: { type: String }, // For customs duties
  
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

// Customer Tax Exemption Schema
const taxExemptionSchema = mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  exemptionType: {
    type: String,
    enum: ["total_exempt", "partial_exempt", "category_exempt", "reseller_exempt"],
    required: true
  },
  exemptionCertificate: { type: String }, // Certificate number
  exemptionReason: { type: String },
  validFrom: { type: Date, required: true },
  validUntil: { type: Date },
  isActive: { type: Boolean, default: true },
  
  // Specific exemptions
  exemptCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
  exemptProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

// Tax Configuration Schema for global settings
const taxConfigSchema = mongoose.Schema({
  // Third-party Integration
  taxService: {
    type: String,
    enum: ["internal", "avalara", "taxjar", "quaderno"],
    default: "internal"
  },
  
  // API Configuration
  apiConfig: {
    apiKey: { type: String },
    sandbox: { type: Boolean, default: true },
    webhookUrl: { type: String },
    companyCode: { type: String }
  },
  
  // Default Settings
  defaultTaxBehavior: {
    type: String,
    enum: ["inclusive", "exclusive"],
    default: "exclusive"
  },
  
  // Calculation Settings
  roundingMethod: {
    type: String,
    enum: ["round", "floor", "ceil"],
    default: "round"
  },
  
  decimalPlaces: { type: Number, default: 2 },
  
  // Notification Settings
  taxUpdateNotifications: { type: Boolean, default: true },
  adminEmails: [{ type: String }],
  
  isActive: { type: Boolean, default: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

const TaxRule = mongoose.model("TaxRule", taxRuleSchema);
const TaxExemption = mongoose.model("TaxExemption", taxExemptionSchema);
const TaxConfig = mongoose.model("TaxConfig", taxConfigSchema);

export default TaxRule;
export { TaxExemption, TaxConfig };