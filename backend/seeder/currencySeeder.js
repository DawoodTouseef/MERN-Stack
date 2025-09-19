import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Currency from '../models/currencyModel.js';
import connectDB from '../config/db.js';

dotenv.config();

const defaultCurrencies = [
  {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    rate: 1.0,
    isDefault: true,
    isEnabled: true,
    region: 'United States'
  },
  {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    rate: 0.93,
    isDefault: false,
    isEnabled: true,
    region: 'Europe'
  },
  {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    rate: 0.79,
    isDefault: false,
    isEnabled: true,
    region: 'United Kingdom'
  },
  {
    code: 'INR',
    name: 'Indian Rupee',
    symbol: '₹',
    rate: 83.0,
    isDefault: false,
    isEnabled: true,
    region: 'India'
  },
  {
    code: 'JPY',
    name: 'Japanese Yen',
    symbol: '¥',
    rate: 148.0,
    isDefault: false,
    isEnabled: true,
    region: 'Japan'
  }
];

const importData = async () => {
  try {
    await connectDB();
    
    // Clear existing currencies
    await Currency.deleteMany();
    console.log('Cleared existing currencies');
    
    // Insert default currencies
    await Currency.insertMany(defaultCurrencies);
    console.log('Default currencies inserted');
    
    process.exit();
  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();
    
    await Currency.deleteMany();
    console.log('Data destroyed');
    
    process.exit();
  } catch (error) {
    console.error('Error destroying data:', error);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}