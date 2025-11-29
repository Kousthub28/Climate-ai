const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const ALERTS_FILE = path.join(__dirname, '../alerts.json'); // points to backend/alerts.json
const fetch = require('node-fetch'); // At the top of the file
const { sendTelegramAlert } = require('../services/telegramService');
const alertSoundService = require('../services/alertSoundService');

router.get('/', (req, res) => {
  if (fs.existsSync(ALERTS_FILE)) {
    try {
      const alerts = JSON.parse(fs.readFileSync(ALERTS_FILE, 'utf8'));
      res.json(alerts);
    } catch (e) {
      res.status(500).json({ error: 'Failed to read alerts.' });
    }
  } else {
    res.json([]);
  }
});

router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const alert = {
      message: data.message || 'Manual test alert!',
      timestamp: data.timestamp || new Date().toISOString()
    };
    let alerts = [];
    if (fs.existsSync(ALERTS_FILE)) {
      alerts = JSON.parse(fs.readFileSync(ALERTS_FILE, 'utf8'));
    }
    alerts.unshift(alert);
    fs.writeFileSync(ALERTS_FILE, JSON.stringify(alerts.slice(0, 50), null, 2));

    // Telegram integration
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      try {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: `🚨 *New Alert!*\n\n${alert.message}\n\n🕒 ${alert.timestamp}`,
            parse_mode: 'Markdown'
          })
        });
      } catch (err) {
        console.error('Failed to send Telegram alert:', err);
        // Do not throw, just log
      }
    }

    res.status(201).json({ success: true, alert });
  } catch (e) {
    console.error('POST /api/alerts error:', e);
    res.status(400).json({ error: 'Invalid request' });
  }
});

router.post('/weather-alert', async (req, res) => {
  const alert = req.body; // { type, severity, description, ... }
  // ... your existing alert logic ...

  // Send to Telegram if it's a severe alert
  if (alert.severity === 'severe') {
    await sendTelegramAlert(`⚠️ ${alert.type.toUpperCase()} Alert: ${alert.description}`);
  }

  res.json({ success: true });
});

// Check weather alerts with sound notifications
router.post('/check-weather-alerts', async (req, res) => {
  try {
    const { lat, lng, name } = req.body;
    const location = { 
      name: name || 'Test Location', 
      lat: lat || 40.7128, 
      lng: lng || -74.0060 
    };
    
    const alerts = await alertSoundService.checkWeatherAlerts(location);
    res.json({ success: true, data: alerts });
  } catch (error) {
    console.error('Weather alert check error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get alert sound history
router.get('/sound-history', async (req, res) => {
  try {
    const history = await alertSoundService.getAlertHistory();
    res.json({ success: true, data: history });
  } catch (error) {
    console.error('Error fetching sound alert history:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get available sound types
router.get('/sound-types', async (req, res) => {
  try {
    const soundTypes = alertSoundService.getSoundTypes();
    res.json({ success: true, data: soundTypes });
  } catch (error) {
    console.error('Error fetching sound types:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test specific alert type
router.post('/test-alert', async (req, res) => {
  try {
    const { type, location } = req.body;
    const testLocation = location || { name: 'Test Location', lat: 40.7128, lng: -74.0060 };
    
    // Create a test alert of the specified type
    const testAlert = {
      type: type || 'rain',
      location: testLocation.name,
      coordinates: `${testLocation.lat}, ${testLocation.lng}`,
      severity: 'moderate',
      shouldAlert: true,
      weather: {
        temperature: 25,
        humidity: 70,
        precipitation: type === 'rain' || type === 'flood' ? 30 : 0,
        windSpeed: type === 'storm' || type === 'tornado' ? 35 : 10,
        condition: `${type.charAt(0).toUpperCase() + type.slice(1)} Test Condition`
      },
      message: `Test ${type} alert for ${testLocation.name}`,
      timestamp: new Date().toISOString()
    };
    
    await alertSoundService.triggerAlert(testAlert);
    await alertSoundService.saveAlertHistory(testAlert);
    
    res.json({ success: true, data: testAlert });
  } catch (error) {
    console.error('Test alert error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;