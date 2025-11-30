// Netlify function for weather and climate endpoints
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || '0e356836821fe7c66466877bd63f9ee7';
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';
const OPENAQ_API_URL = 'https://api.openaq.org/v2';

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const path = event.path.split('/').pop() || event.path.split('/')[event.path.split('/').length - 2];
    const { method } = event;

    if (path === 'current' && method === 'GET') {
      return await handleCurrentWeather(event);
    } else if (path === 'forecast' && method === 'GET') {
      return await handleWeatherForecast(event);
    } else if (path === 'climate' && method === 'GET') {
      return await handleClimateData(event);
    } else if (path === 'alerts' && method === 'GET') {
      return await handleClimateAlerts(event);
    } else if (path === 'air-quality' && method === 'GET') {
      return await handleAirQuality(event);
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

async function handleCurrentWeather(event) {
  try {
    const { lat, lon, city } = event.queryStringParameters || {};
    
    if (!lat || !lon) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'lat and lon required' })
      };
    }

    const url = `${OPENWEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        city: data.name,
        temperature: data.main.temp,
        feels_like: data.main.feels_like,
        humidity: data.main.humidity,
        wind_speed: data.wind.speed,
        condition: data.weather[0].main,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
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

async function handleWeatherForecast(event) {
  try {
    const { lat, lon, days = 5 } = event.queryStringParameters || {};
    
    if (!lat || !lon) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'lat and lon required' })
      };
    }

    const url = `${OPENWEATHER_BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Forecast API error: ${response.status}`);
    }

    const data = await response.json();
    const forecast = {};
    
    data.list.forEach(item => {
      const date = new Date(item.dt * 1000).toISOString().split('T')[0];
      if (!forecast[date]) {
        forecast[date] = {
          date,
          high: item.main.temp_max,
          low: item.main.temp_min,
          condition: item.weather[0].main,
          description: item.weather[0].description,
          precipitation: item.rain?.['3h'] || 0
        };
      } else {
        forecast[date].high = Math.max(forecast[date].high, item.main.temp_max);
        forecast[date].low = Math.min(forecast[date].low, item.main.temp_min);
      }
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        forecast: Object.values(forecast).slice(0, parseInt(days))
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

async function handleClimateData(event) {
  // Return mock climate data (can be enhanced with real data sources)
  const { city } = event.queryStringParameters || {};

  const climateData = {
    city: city || 'Global',
    annual_temperature: 10.5,
    annual_precipitation: 1050,
    climate_zones: 'Humid Continental',
    carbon_emissions_trend: 'Decreasing',
    renewable_energy_percent: 35,
    timestamp: new Date().toISOString()
  };

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(climateData)
  };
}

async function handleClimateAlerts(event) {
  const { city } = event.queryStringParameters || {};

  const alerts = [
    {
      id: '1',
      type: 'heat_wave',
      severity: 'medium',
      title: 'Temperature Alert',
      description: 'Monitor temperature changes in your area',
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      city: city || 'Global',
      alerts,
      alert_count: alerts.length,
      timestamp: new Date().toISOString()
    })
  };
}

async function handleAirQuality(event) {
  try {
    const { lat, lon, city } = event.queryStringParameters || {};
    
    if (!lat || !lon) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'lat and lon required' })
      };
    }

    // Fallback to mock data since OpenAQ requires more complex setup
    const airQuality = {
      city: city || 'Current Location',
      aqi: 'Good',
      pm25: 12.5,
      pm10: 25.3,
      no2: 35.5,
      o3: 65.2,
      timestamp: new Date().toISOString()
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(airQuality)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
}

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
