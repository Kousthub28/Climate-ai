const fetch = require('node-fetch');

const BASE_URL = 'https://api.openaq.org/v2';
const OPENAQ_API_KEY = 'ec865842222b48e328f2f7a15c93773bb1b099afdbc598e465b9107dd67feaf2'; // Provided API key

class OpenAQService {
  async getCityAirQuality(city) {
    const url = `${BASE_URL}/latest?city=${encodeURIComponent(city)}&api_key=${OPENAQ_API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`OpenAQ API error: ${response.status}`);
    }
    return await response.json();
  }
}

module.exports = new OpenAQService(); 