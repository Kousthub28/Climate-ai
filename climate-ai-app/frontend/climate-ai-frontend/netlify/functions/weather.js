// Netlify function for weather and climate endpoints

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const path = event.path.split('/').pop() || event.path.split('/')[event.path.split('/').length - 2];
    const { method } = event;

    if (path === 'current' && method === 'GET') {
      return handleCurrentWeather(event);
    } else if (path === 'forecast' && method === 'GET') {
      return handleWeatherForecast(event);
    } else if (path === 'climate' && method === 'GET') {
      return handleClimateData(event);
    } else if (path === 'alerts' && method === 'GET') {
      return handleClimateAlerts(event);
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

function handleCurrentWeather(event) {
  const { lat, lon, city } = event.queryStringParameters || {};

  const mockWeather = {
    city: city || 'New York',
    temperature: 15,
    feels_like: 13,
    humidity: 65,
    wind_speed: 12,
    condition: 'Partly Cloudy',
    icon: '02d',
    timestamp: new Date().toISOString(),
    air_quality: {
      aqi: 2,
      description: 'Good',
      pm25: 12.5,
      pm10: 25.3,
      no2: 35.5,
      o3: 65.2
    }
  };

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(mockWeather)
  };
}

function handleWeatherForecast(event) {
  const { lat, lon, days = 5 } = event.queryStringParameters || {};

  const forecast = [];
  for (let i = 0; i < parseInt(days); i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    forecast.push({
      date: date.toISOString().split('T')[0],
      high: 20 - i,
      low: 12 - i,
      condition: ['Sunny', 'Cloudy', 'Rainy'][i % 3],
      precipitation: i % 3 === 2 ? 5 : 0,
      wind_speed: 10 + i
    });
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ forecast })
  };
}

function handleClimateData(event) {
  const { city } = event.queryStringParameters || {};

  const climateData = {
    city: city || 'New York',
    annual_temperature: 10.5,
    annual_precipitation: 1050,
    climate_zones: 'Humid Continental',
    carbon_emissions_trend: 'Decreasing',
    renewable_energy_percent: 35,
    data_points: [
      { month: 'Jan', avg_temp: -3.5, precipitation: 100 },
      { month: 'Feb', avg_temp: -1.2, precipitation: 95 },
      { month: 'Mar', avg_temp: 4.5, precipitation: 110 },
      { month: 'Apr', avg_temp: 12.3, precipitation: 105 },
      { month: 'May', avg_temp: 20.1, precipitation: 115 },
      { month: 'Jun', avg_temp: 25.5, precipitation: 130 },
      { month: 'Jul', avg_temp: 27.8, precipitation: 120 },
      { month: 'Aug', avg_temp: 26.9, precipitation: 125 },
      { month: 'Sep', avg_temp: 22.3, precipitation: 110 },
      { month: 'Oct', avg_temp: 15.7, precipitation: 95 },
      { month: 'Nov', avg_temp: 8.9, precipitation: 105 },
      { month: 'Dec', avg_temp: 1.2, precipitation: 100 }
    ]
  };

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(climateData)
  };
}

function handleClimateAlerts(event) {
  const { city } = event.queryStringParameters || {};

  const alerts = [
    {
      id: '1',
      type: 'heat_wave',
      severity: 'high',
      title: 'Heat Wave Warning',
      description: 'Extreme heat expected. Stay hydrated and avoid prolonged sun exposure.',
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      type: 'air_quality',
      severity: 'medium',
      title: 'Poor Air Quality Alert',
      description: 'Air quality index is elevated. Sensitive groups should reduce outdoor activities.',
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      city: city || 'New York',
      alerts,
      alert_count: alerts.length
    })
  };
}
