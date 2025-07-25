const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const ALERTS_FILE = path.join(__dirname, '../alerts.json'); // points to backend/alerts.json
const fetch = require('node-fetch'); // At the top of the file
const { sendTelegramAlert } = require('../services/telegramService');

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

module.exports = router;