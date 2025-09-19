import axios from 'axios';

const addDefaultCurrency = async () => {
  try {
    const response = await axios.post('http://localhost:5500/api/currencies', {
      code: 'USD',
      name: 'US Dollar',
      symbol: '$',
      rate: 1.0,
      isDefault: true,
      isEnabled: true,
      region: 'United States'
    });
    
    console.log('Currency added:', response.data);
  } catch (error) {
    console.error('Error adding currency:', error.response?.data || error.message);
  }
};

addDefaultCurrency();