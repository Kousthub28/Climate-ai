// tomorrowService.js
const axios = require('axios');

const TOMORROW_API_KEY = 'JsFtriyWlKZQJ3jMvon8mQn67zOmOFRH';
const BASE_URL = 'https://api.tomorrow.io/v4/weather/forecast';

async function getForecastData(lat, lng) {
  try {
    const url = `${BASE_URL}?location=${lat},${lng}&apikey=${TOMORROW_API_KEY}`;
    const res = await axios.get(url);
    if (!res.data || !res.data.timelines || !res.data.timelines.minutely || !Array.isArray(res.data.timelines.minutely) || res.data.timelines.minutely.length === 0) {
      console.error('Tomorrow.io response missing minutely data:', JSON.stringify(res.data, null, 2));
      return null;
    }
    const current = res.data.timelines.minutely[0];
    if (!current.values) {
      console.error('Tomorrow.io minutely[0] missing values:', JSON.stringify(current, null, 2));
      return null;
    }
    const v = current.values;
    return {
      uvIndex: v.uvIndex,
      humidity: v.humidity,
      windSpeed: v.windSpeed,
      precipitationProbability: v.precipitationProbability,
      temperature: v.temperature,
      dewPoint: v.dewPoint,
      cloudCover: v.cloudCover,
      rainIntensity: v.rainIntensity,
      snowIntensity: v.snowIntensity,
      sleetIntensity: v.sleetIntensity,
      visibility: v.visibility,
      weatherCode: v.weatherCode,
      windGust: v.windGust,
      windDirection: v.windDirection,
      pressureSurfaceLevel: v.pressureSurfaceLevel,
      // Add more fields as needed
    };
  } catch (err) {
    console.error('Tomorrow.io getForecastData error:', err.response ? err.response.data : err);
    return null;
  }
}

module.exports = {
  getForecastData,
}; 