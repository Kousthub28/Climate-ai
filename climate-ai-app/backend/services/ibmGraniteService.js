const axios = require('axios');

const GRANITE_API_KEY = 'jpl8Kq906NWEv2sherKz0HOScZFP9E7WOXJGs9MpUSp0';
const GRANITE_ENDPOINT = 'https://us-south.ml.cloud.ibm.com/v1/generate';

async function getGranitePrediction(weatherData) {
  const prompt = `
Given the following weather data for ${weatherData.city}, ${weatherData.country}:
- Temperature: ${weatherData.temperature}°C
- Humidity: ${weatherData.humidity}%
- Wind speed: ${weatherData.windSpeed} km/h
- Precipitation: ${weatherData.precipitation} mm

Is there a risk of a heatwave, hurricane, flood, or wildfire in the next 3 days? Explain your reasoning.
`;

  const response = await axios.post(
    GRANITE_ENDPOINT,
    {
      model_id: 'granite-3-2-8b-instruct',
      input: prompt,
      parameters: { max_new_tokens: 200 }
    },
    {
      headers: {
        'Authorization': `Bearer ${GRANITE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data.generated_text;
}

module.exports = { getGranitePrediction }; 