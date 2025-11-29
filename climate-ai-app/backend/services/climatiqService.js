// climatiqService.js
const axios = require('axios');

const CLIMATIQ_API_KEY = '43B2A4BTGS3558SMQ7DF86NPTG';
const BASE_URL = 'https://beta3.api.climatiq.io';

async function estimateCarbon(activityType, params) {
  const url = `${BASE_URL}/estimate`;
  const headers = {
    Authorization: `Bearer ${CLIMATIQ_API_KEY}`,
    'Content-Type': 'application/json',
  };
  const body = {
    emission_factor: { activity_id: activityType },
    parameters: params,
  };
  const res = await axios.post(url, body, { headers });
  return res.data;
}

module.exports = {
  estimateCarbon,
}; 