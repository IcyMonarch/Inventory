const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

router.post('/product-info', async (req, res) => {
  const { barcode } = req.body;

  if (!barcode) {
    return res.status(400).json({ error: 'Barcode is required' });
  }

  try {
    const response = await axios.get('https://api.upcitemdb.com/prod/trial/lookup', {
      params: { upc: barcode },
    });

    const items = response.data.items || [];

    if (items.length === 0) {
      return res.status(404).json({ error: 'No product found for this barcode' });
    }

    res.json({ product: items[0] });
  } catch (err) {
    console.error('Error fetching product info:', err.message);
    res.status(500).json({ error: 'Failed to fetch product info' });
  }
});

module.exports = router;
