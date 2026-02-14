import asyncHandler from '../middlewares/asyncHandler.js';
import AppSettings from '../models/appSettingsModel.js';

const GLOBAL_KEY = 'global';

const getOrCreateSettings = async () => {
  let settings = await AppSettings.findOne({ key: GLOBAL_KEY });
  if (!settings) {
    settings = await AppSettings.create({ key: GLOBAL_KEY });
  }
  return settings;
};

const getSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();

  res.json({
    success: true,
    settings: {
      payment: {
        paypalClientId: settings.payment?.paypalClientId || '',
        hasPaypalSecret: Boolean(settings.payment?.paypalSecret),
      },
      tax: settings.tax || { apiKey: '', defaultRate: 0 },
      exchange: settings.exchange || { apiUrl: '', apiKey: '' },
    },
  });
});

const updateSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();
  const { payment, tax, exchange } = req.body;

  if (payment) {
    if (typeof payment.paypalClientId === 'string') settings.payment.paypalClientId = payment.paypalClientId;
    if (typeof payment.paypalSecret === 'string' && payment.paypalSecret.trim()) settings.payment.paypalSecret = payment.paypalSecret;
  }

  if (tax) {
    if (typeof tax.apiKey === 'string') settings.tax.apiKey = tax.apiKey;
    if (tax.defaultRate !== undefined) settings.tax.defaultRate = Number(tax.defaultRate) || 0;
  }

  if (exchange) {
    if (typeof exchange.apiUrl === 'string') settings.exchange.apiUrl = exchange.apiUrl;
    if (typeof exchange.apiKey === 'string') settings.exchange.apiKey = exchange.apiKey;
  }

  await settings.save();

  res.json({
    success: true,
    message: 'Settings updated successfully',
  });
});

export { getSettings, updateSettings };
