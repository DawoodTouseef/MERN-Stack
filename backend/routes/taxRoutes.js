import express from 'express';
import axios  from 'axios';
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// POST /api/tax/calculate
router.post('/calculate', async (req, res) => {
  const { location, items } = req.body;

  try {
    const response = await axios.post(
      'https://api.taxjar.com/v2/taxes',
      {
        to_country: location.country,
        to_state: location.state,
        to_zip: location.zip,
        to_city: location.city || '',
        shipping: 10,
        line_items: items.map((item) => ({
          quantity: item.qty,
          unit_price: item.price,
          product_tax_code: item.taxCode || '00000',
        })),
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.TAXJAR_API_KEY}`,
        },
      }
    );

    const taxAmount = response.data.tax.amount_to_collect || 0;
    res.json({ taxAmount });
  } catch (error) {
    console.error('TaxJar API Error:', error?.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch tax from TaxJar' });
  }
});

export default router;