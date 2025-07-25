const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const ALERTS_FILE = path.join(__dirname, '../alerts.json');

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

    // Respond to the frontend immediately
    res.status(201).json({ success: true, alert });

    // Send to Telegram in the background (do not await)
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: `🚨 *New Alert!*\n\n${alert.message}\n\n🕒 ${alert.timestamp}`,
          parse_mode: 'Markdown'
        })
      }).catch(err => console.error('Failed to send Telegram alert:', err));
    }
  } catch (e) {
    console.error('POST /api/alerts error:', e);
    res.status(400).json({ error: 'Invalid request' });
  }
});

module.exports = router; 