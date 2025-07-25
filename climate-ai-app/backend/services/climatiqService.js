const fetch = require('node-fetch');

const CLIMATIQ_API_KEY = '89Y8JM11RX7Q5ADG5AK8RPXVHR'; // Provided API key
const BASE_URL = 'https://api.climatiq.io';

class ClimatiqService {
  async calculateCarbon({ activity_type, parameters }) {
    const url = `${BASE_URL}/estimate`;
    const body = {
      emission_factor: { activity_id: activity_type, data_version: '23.23' },
      parameters
    };
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLIMATIQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Climatiq API error details:', errorText);
      throw new Error(`Climatiq API error: ${response.status}`);
    }
    return await response.json();
  }
}

module.exports = new ClimatiqService(); 