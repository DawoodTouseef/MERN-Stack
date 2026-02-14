import mongoose from 'mongoose';

const appSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: 'global' },
    payment: {
      paypalClientId: { type: String, default: '' },
      paypalSecret: { type: String, default: '' },
    },
    tax: {
      apiKey: { type: String, default: '' },
      defaultRate: { type: Number, default: 0 },
    },
    exchange: {
      apiUrl: { type: String, default: '' },
      apiKey: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

const AppSettings = mongoose.model('AppSettings', appSettingsSchema);

export default AppSettings;
