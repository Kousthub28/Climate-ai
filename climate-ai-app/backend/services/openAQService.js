// openAQService.js
const axios = require('axios');

async function getAirQuality(lat, lng) {
  const url = `https://api.openaq.org/v2/nearest?coordinates=${lat},${lng}&radius=10000&order_by=distance&limit=1`;
  const res = await axios.get(url);
  if (!res.data || !res.data.results || res.data.results.length === 0) {
    return null;
  }
  const measurements = res.data.results[0].measurements;
  // Map measurements to a key-value object
  const aq = {};
  for (const m of measurements) {
    aq[m.parameter] = m.value;
  }
  return {
    pm25: aq.pm25 || 'N/A',
    pm10: aq.pm10 || 'N/A',
    no2: aq.no2 || 'N/A',
    o3: aq.o3 || 'N/A',
    co: aq.co || 'N/A',
    so2: aq.so2 || 'N/A',
    unit: measurements[0]?.unit || '',
    source: res.data.results[0].location || '',
  };
}

module.exports = {
  getAirQuality,
}; 