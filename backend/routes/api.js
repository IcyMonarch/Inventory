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




const multer = require('multer');
const { OpenAI } = require('openai');

// Setup OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Multer for file uploads
const upload = multer({ dest: 'uploads/' });

router.post('/analyze-image', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }

  try {
    const fs = require('fs');
    const imageBuffer = fs.readFileSync(req.file.path);
    const base64Image = imageBuffer.toString('base64');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'What item is shown in this image? Provide as much detail as possible.' },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
          ]
        }
      ],
      max_tokens: 500
    });

    const description = response.choices[0].message.content;
    res.json({ description });
  } catch (err) {
    console.error('AI analysis error:', err.message);
    res.status(500).json({ error: 'Image analysis failed' });
  }
});
