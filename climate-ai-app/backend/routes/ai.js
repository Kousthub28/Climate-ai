const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

// Helper to extract JSON from text
function extractJsonFromText(text) {
  const match = text.match(/{[\s\S]*}/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch (e) {
      return null;
    }
  }
  return null;
}

// Improved JSON extraction: get substring from first '{' to last '}'
function robustExtractJson(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    const jsonStr = text.substring(start, end + 1);
    try {
      return JSON.parse(jsonStr);
    } catch (e) {
      return null;
    }
  }
  return null;
}

// POST /api/ai/chart-spec
router.post('/chart-spec', async (req, res) => {
  const { userData, cityData, question } = req.body;
  console.log('Received /chart-spec request:', { userData, cityData, question });
  const prompt = `Given user carbon: ${userData.carbon} and city carbon: ${cityData.carbon}, respond ONLY with this JSON: {"chartConfig": {"labels": ["Your Carbon Footprint", "City Average"], "data": [${userData.carbon}, ${cityData.carbon}]}, "explanation": "Your explanation here."} No extra text.`;

  try {
    console.log('Sending request to Ollama...');
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'phi',
        prompt,
        stream: false
      })
    });
    console.log('Received response from Ollama, parsing...');
    const data = await response.json();
    console.log('Ollama raw response:', data);

    let aiResult;
    try {
      aiResult = JSON.parse(data.response);
    } catch (e) {
      aiResult = extractJsonFromText(data.response);
      if (!aiResult) {
        aiResult = robustExtractJson(data.response);
      }
      if (!aiResult) {
        // Fallback: generate default chart config
        aiResult = {
          chartConfig: {
            data: {
              labels: ["Your Carbon Footprint", "City Average"],
              datasets: [{
                label: 'Value',
                data: [userData.carbon, cityData.carbon],
                backgroundColor: ['#36A2EB', '#FF6384']
              }]
            },
            options: {
              responsive: true,
              plugins: {
                legend: { display: false },
                title: { display: true, text: 'Your Carbon Footprint vs. City Average' }
              }
            }
          },
          explanation: 'Your carbon footprint is compared to the city average.'
        };
        console.error('LLM response incomplete or invalid, using fallback chart config.');
      }
    }
    // Post-process to Chart.js config if needed
    if (aiResult && aiResult.chartConfig) {
      // If the LLM returned variables or expressions, replace with actual numbers
      let labels = aiResult.chartConfig.labels || ["Your Carbon Footprint", "City Average"];
      let data = aiResult.chartConfig.data;
      if (!Array.isArray(data) || typeof data[0] !== 'number' || typeof data[1] !== 'number') {
        data = [userData.carbon, cityData.carbon];
      }
      aiResult.chartConfig = {
        data: {
          labels,
          datasets: [{
            label: 'Value',
            data,
            backgroundColor: ['#36A2EB', '#FF6384']
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            title: { display: true, text: 'Your Carbon Footprint vs. City Average' }
          }
        }
      };
    }
    res.json(aiResult);
  } catch (err) {
    console.error('Error in /chart-spec:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// GET /api/urban/challenges?city=New%20York%20City
router.get('/urban/challenges', (req, res) => {
  res.json([
    { id: 1, title: 'Air Quality Improvement', description: 'Reduce air pollution through better traffic management and industrial regulations.' },
    { id: 2, title: 'Green Space Expansion', description: 'Increase green areas to improve urban biodiversity and residents’ well-being.' }
    // ...more challenges
  ]);
});

// GET /api/urban/metrics?city=New%20York%20City
router.get('/urban/metrics', async (req, res) => {
  try {
    // Simulate real-time data for demo: random air quality value
    const airQuality = Math.floor(Math.random() * 100) + 1;
    const metrics = {
      city: 'New York City',
      airQuality,
      year: new Date().getFullYear(),
    };
    res.json(metrics);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch real-time metrics', details: err.message });
  }
});

// POST /api/ai/urban-insight
router.post('/urban-insight', async (req, res) => {
  const { challenge, city, metrics } = req.body;
  const prompt = `\nCity: ${city}\nMetrics: ${JSON.stringify(metrics)}\nChallenge: ${challenge.title}\nDescription: ${challenge.description}\n\nAs an AI urban planner, provide a real-time, actionable insight or solution for this challenge, considering the city's current metrics. Respond in 2-3 sentences.`;
  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'phi',
        prompt,
        stream: false
      })
    });
    const data = await response.json();
    res.json({ insight: data.response.trim() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate AI insight', details: err.message });
  }
});

module.exports = router; 