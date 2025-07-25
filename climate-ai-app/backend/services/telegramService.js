const axios = require('axios');

const TELEGRAM_BOT_TOKEN = '7982181803:AAE3rqrU9-c8li2oz208e8oIAakUWm08U-g'; // Replace with your bot token
const TELEGRAM_CHAT_ID = '5380608179';     // Replace with your chat ID

async function sendTelegramAlert(message) {
  try {
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
    });
  } catch (error) {
    console.error('Failed to send Telegram alert:', error.message);
  }
}

module.exports = { sendTelegramAlert }; 