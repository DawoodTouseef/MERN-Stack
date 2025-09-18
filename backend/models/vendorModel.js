import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vendor name is required'],
    trim: true,
    maxlength: [100, 'Vendor name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
  },
  address: {
    street: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    zipCode: {
      type: String,
      required: true,
      trim: true
    },
    country: {
      type: String,
      required: true,
      trim: true,
      default: 'USA'
    }
  },
  businessType: {
    type: String,
    required: true,
    enum: ['Individual', 'Corporation', 'Partnership', 'LLC', 'Other'],
    default: 'Individual'
  },
  taxId: {
    type: String,
    trim: true,
    sparse: true
  },
  bankDetails: {
    accountName: String,
    accountNumber: String,
    bankName: String,
    routingNumber: String
  },
  contactPerson: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
      type: String,
      match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
vendorSchema.index({ email: 1 });
vendorSchema.index({ name: 1 });
vendorSchema.index({ isActive: 1 });

// Virtual for full address
vendorSchema.virtual('fullAddress').get(function() {
  return `${this.address.street}, ${this.address.city}, ${this.address.state} ${this.address.zipCode}, ${this.address.country}`;
});

// Pre-save middleware
vendorSchema.pre('save', function(next) {
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase();
  }
  next();
});

// Static method to find active vendors
vendorSchema.statics.findActiveVendors = function() {
  return this.find({ isActive: true }).sort({ name: 1 });
};

// Instance method to deactivate vendor
vendorSchema.methods.deactivate = function() {
  this.isActive = false;
  return this.save();
};

const Vendor = mongoose.model('Vendor', vendorSchema);


export default Vendor;