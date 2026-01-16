
import axios from 'axios';

const API_URL = 'http://localhost:5501/api/tax/calculate-advanced';

const testTaxCalculation = async () => {
    try {
        console.log('Testing Public Tax Calculation Endpoint...');
        console.log('Fetching a product first...');
        const productsRes = await axios.get('http://localhost:5501/api/products');
        const products = productsRes.data.products;

        if (!products || products.length === 0) {
            console.error('No products found to test with.');
            return;
        }

        const product = products[0];
        console.log(`Using Product: ${product.name} (ID: ${product._id})`);

        const taxPayload = {
            productId: product._id,
            price: product.price,
            quantity: 1,
            shippingAddress: {
                country: 'US',
                zipCode: '10001',
                state: 'NY'
            },
            useThirdPartyService: false // Test internal calculation first
        };

        const res = await axios.post(API_URL, taxPayload);

        console.log('✅ Tax Calculation Result:', JSON.stringify(res.data, null, 2));

    } catch (error) {
        if (error.response) {
            console.error('❌ API Error:', error.response.status, error.response.data);
        } else {
            console.error('❌ Error:', error.message);
        }
    }
};

testTaxCalculation();
