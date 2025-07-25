const axios = require('axios');
const express = require('express');
const router = express.Router();

router.post('/genai-poster', async (req, res) => {
  const { userInput } = req.body;
  const prompt = `A colorful, kid-friendly poster about: ${userInput}. Style: cartoon, playful, climate campaign, high quality, text: "${userInput}"`;

  try {
    const response = await axios.post(
      'https://anzorq-sdxl.hf.space/run/predict',
      { data: [prompt, 1] },
      { timeout: 120000 }
    );

    // The API returns a URL in response.data.data[0]
    const imageUrl = response.data.data[0];
    res.json({ imageUrl, caption: userInput });
  } catch (err) {
    console.error('Poster generation error:', err.response?.data || err.message);
    res.status(500).json({ error: "Failed to generate poster", details: err.message });
  }
});

module.exports = router; 