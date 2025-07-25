const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
require('dotenv').config();

const ALERTS_FILE = path.join(__dirname, '../alerts.json');
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Use your actual API keys and coordinates
const OPENAQ_URL = 'https://api.openaq.org/v2/latest?coordinates=12.9716,77.5946&parameter=pm25';
const OPENWEATHER_URL = `https://api.openweathermap.org/data/2.5/weather?lat=12.9716&lon=77.5946&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`;

function calculateHeatIndex(temp, humidity) {
  return -8.784695 + 1.61139411*temp + 2.338549*humidity - 0.14611605*temp*humidity;
}

async function checkAndAlert() {
  try {
    // 1. Fetch AQI
    const aqiRes = await fetch(OPENAQ_URL);
    const aqiData = await aqiRes.json();
    const pm25 = aqiData.results[0]?.measurements[0]?.value;

    // 2. Fetch Weather
    const weatherRes = await fetch(OPENWEATHER_URL);
    const weatherData = await weatherRes.json();
    const temp = weatherData.main.temp;
    const humidity = weatherData.main.humidity;
    const heatIndex = calculateHeatIndex(temp, humidity);

    // 3. Check thresholds (set low for testing)
    if (pm25 > 100 || heatIndex > 40) { // For testing only!
      const alertMsg = `PM2.5: ${pm25}, Heat Index: ${heatIndex.toFixed(1)}°C. Please take precautions!`;

      // Save to alerts.json
      const alert = { message: alertMsg, timestamp: new Date().toISOString() };
      let alerts = [];
      if (fs.existsSync(ALERTS_FILE)) {
        alerts = JSON.parse(fs.readFileSync(ALERTS_FILE, 'utf8'));
      }
      alerts.unshift(alert);
      fs.writeFileSync(ALERTS_FILE, JSON.stringify(alerts.slice(0, 50), null, 2));

      // Send to Telegram
      if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
        fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: `🚨 *Weather Alert!*\n\n${alertMsg}\n\n🕒 ${alert.timestamp}`,
            parse_mode: 'Markdown'
          })
        }).catch(err => console.error('Failed to send Telegram alert:', err));
      }
    }
  } catch (err) {
    console.error('Guardian Agent error:', err);
  }
}

// Schedule every 5 minutes for testing (change to '*/30 * * * *' for every 30 min)
cron.schedule('* * * * *', checkAndAlert);

module.exports = { checkAndAlert }; 