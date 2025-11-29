// carbonInterfaceService.js
const axios = require('axios');

const CARBON_INTERFACE_API_KEY = 'bMRm325nrGQKLY6uv1Fwhw';
const BASE_URL = 'https://www.carboninterface.com/api/v1';

function getHeaders() {
  return {
    Authorization: `Bearer ${CARBON_INTERFACE_API_KEY}`,
    'Content-Type': 'application/json',
  };
}

async function estimateFlight(params) {
  const url = `${BASE_URL}/estimates`;
  const body = {
    type: 'flight',
    ...params,
  };
  const res = await axios.post(url, body, { headers: getHeaders() });
  return res.data;
}

async function estimateVehicle(params) {
  const url = `${BASE_URL}/estimates`;
  const body = {
    type: 'vehicle',
    ...params,
  };
  const res = await axios.post(url, body, { headers: getHeaders() });
  return res.data;
}

async function estimateElectricity(params) {
  const url = `${BASE_URL}/estimates`;
  const body = {
    type: 'electricity',
    ...params,
  };
  const res = await axios.post(url, body, { headers: getHeaders() });
  return res.data;
}

module.exports = {
  estimateFlight,
  estimateVehicle,
  estimateElectricity,
}; 