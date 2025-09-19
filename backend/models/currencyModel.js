import mongoose from "mongoose";

const currencySchema = mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true
  },
  symbol: {
    type: String,
    required: true
  },
  rate: {
    type: Number,
    required: true,
    default: 1.0
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isEnabled: {
    type: Boolean,
    default: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  region: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

const Currency = mongoose.model("Currency", currencySchema);
export default Currency;