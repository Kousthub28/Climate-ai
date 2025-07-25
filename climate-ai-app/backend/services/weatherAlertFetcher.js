const axios = require('axios');
const { sendTelegramAlert } = require('./telegramService');

// Example: Replace with your real weather alert API endpoint
const WEATHER_ALERT_API = 'https://api.example.com/weather-alerts';

async function fetchAndSendSevereWeatherAlerts() {
  try {
    // Fetch weather alerts (mocked response for now)
    // const response = await axios.get(WEATHER_ALERT_API);
    // const alerts = response.data.alerts;
    // For demo, use a mock alert array:
    const alerts = [
      { type: 'rain', severity: 'severe', description: 'Heavy rainfall expected in your area.' },
      { type: 'heat', severity: 'moderate', description: 'Warm temperatures expected.' }
    ];

    for (const alert of alerts) {
      if (alert.severity === 'severe') {
        await sendTelegramAlert(`⚠️ ${alert.type.toUpperCase()} Alert: ${alert.description}`);
      }
    }
  } catch (error) {
    console.error('Failed to fetch or send weather alerts:', error.message);
  }
}

module.exports = { fetchAndSendSevereWeatherAlerts }; 