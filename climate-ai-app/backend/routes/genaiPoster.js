const axios = require('axios');
const express = require('express');
const router = express.Router();

// POST /genai-poster
router.post('/genai-poster', async (req, res) => {
  const { userInput } = req.body;
  const prompt = `A colorful, kid-friendly poster about: ${userInput}. Style: cartoon, playful, climate campaign, high quality, text: "${userInput}"`;

  try {
    const response = await axios.post(
      'https://stablediffusionapi.com/api/v3/text2img',
      {
        key: 'Z6k6uQXKkJkmPuf54m2JBxMvZaLLh7mXRibSaJVOQgrXe19K1OXDOeZZY4P7',
        prompt: prompt,
        negative_prompt: '',
        width: '512',
        height: '512',
        samples: '1',
        num_inference_steps: '30',
        guidance_scale: 7.5,
        webhook: null,
        track_id: null
      },
      { timeout: 120000 }
    );

    // The API returns an image URL in response.data.output[0]
    const imageUrl = response.data.output[0];
    res.json({ imageUrl, caption: userInput });
  } catch (err) {
    if (err.response) {
      console.error('Poster generation error:', err.response.status, err.response.statusText, err.response.data);
      res.status(500).json({ error: "Failed to generate poster", details: err.response.data });
    } else {
      console.error('Poster generation error:', err.message);
      res.status(500).json({ error: "Failed to generate poster", details: err.message });
    }
  }
});

module.exports = router; 