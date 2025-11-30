// Netlify function for carbon tracking endpoints
const fs = require('fs');
const path = require('path');

const csvFilePath = path.join(__dirname, '../../climate-ai-app/backend/data/enhanced_carbon_emissions_data.csv');

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const path = event.path.split('/').pop();
    const { method } = event;

    if (path === 'estimate' && method === 'POST') {
      return handleEstimateCarbon(event);
    } else if (path === 'estimate-ci' && method === 'POST') {
      return handleEstimateCI(event);
    } else if (path === 'csv-analysis' && method === 'GET') {
      return handleCSVAnalysis(event);
    } else if (path === 'track' && method === 'POST') {
      return handleTrackCarbon(event);
    } else if (path === 'history' && method === 'GET') {
      return handleCarbonHistory(event);
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Not found' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};

async function handleEstimateCarbon(event) {
  const { activityType, params } = JSON.parse(event.body || '{}');

  // Mock carbon estimation
  const estimates = {
    'car': { emissions_kg: (params?.distance || 10) * 0.21 },
    'flight': { emissions_kg: (params?.distance || 1000) * 0.0001 },
    'electricity': { emissions_kg: (params?.kwh || 100) * 0.5 },
    'natural_gas': { emissions_kg: (params?.volume || 10) * 2.0 }
  };

  const estimate = estimates[activityType] || { emissions_kg: 0 };

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      activity_type: activityType,
      ...estimate,
      timestamp: new Date().toISOString()
    })
  };
}

async function handleEstimateCI(event) {
  const { type, params } = JSON.parse(event.body || '{}');

  let emissions = 0;
  switch (type) {
    case 'flight':
      emissions = (params?.passengers_count || 1) * (params?.distance || 1000) * 0.0001;
      break;
    case 'vehicle':
      emissions = (params?.distance_km || 10) * 0.21;
      break;
    case 'electricity':
      emissions = (params?.energy_kwh || 100) * 0.5;
      break;
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      type,
      carbon_kg: parseFloat(emissions.toFixed(2)),
      timestamp: new Date().toISOString()
    })
  };
}

function handleCSVAnalysis(event) {
  try {
    // Mock CSV analysis
    const mockData = [
      { date: '2024-11-25', emissions_kg: 15.5, category: 'transportation' },
      { date: '2024-11-26', emissions_kg: 12.3, category: 'energy' },
      { date: '2024-11-27', emissions_kg: 18.7, category: 'transportation' },
      { date: '2024-11-28', emissions_kg: 14.2, category: 'diet' },
      { date: '2024-11-29', emissions_kg: 16.5, category: 'energy' },
      { date: '2024-11-30', emissions_kg: 13.8, category: 'consumption' }
    ];

    const totalEmissions = mockData.reduce((sum, row) => sum + row.emissions_kg, 0);
    const avgDaily = totalEmissions / mockData.length;

    const daily = {};
    mockData.forEach(row => {
      daily[row.date] = row.emissions_kg;
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        total_emissions_kg: parseFloat(totalEmissions.toFixed(2)),
        average_daily_kg: parseFloat(avgDaily.toFixed(2)),
        daily_breakdown: daily,
        total_records: mockData.length,
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
}

async function handleTrackCarbon(event) {
  const { activity, amount, category } = JSON.parse(event.body || '{}');

  const emission = amount * (category === 'car' ? 0.21 : category === 'flight' ? 0.0001 : 0.5);

  return {
    statusCode: 201,
    headers,
    body: JSON.stringify({
      id: Date.now().toString(),
      activity,
      amount,
      category,
      emissions_kg: parseFloat(emission.toFixed(2)),
      timestamp: new Date().toISOString()
    })
  };
}

function handleCarbonHistory(event) {
  const userId = event.queryStringParameters?.userId;

  // Mock history
  const mockHistory = [
    { id: '1', activity: 'Drive car', emissions_kg: 5.2, date: '2024-11-30', category: 'transportation' },
    { id: '2', activity: 'Flight booking', emissions_kg: 100, date: '2024-11-29', category: 'transportation' },
    { id: '3', activity: 'Daily electricity', emissions_kg: 8.5, date: '2024-11-28', category: 'energy' }
  ];

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      userId,
      history: mockHistory,
      total_count: mockHistory.length
    })
  };
}
