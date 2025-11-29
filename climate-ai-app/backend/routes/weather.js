const express = require('express');
const openWeatherService = require('../services/openWeatherService'); // Added for OpenWeatherMap
const tomorrowService = require('../services/tomorrowService');
const { auth, optionalAuth } = require('../middleware/auth');
const fetch = require('node-fetch'); // Add at the top if not present
const openAQService = require('../services/openAQService');

const router = express.Router();

// Get current weather for location
router.get('/current/:lat/:lng', optionalAuth, async (req, res) => {
  try {
    const { lat, lng } = req.params;
    let { city, country } = req.query;

    // If city or country is missing, use reverse geocoding with timeout
    if (!city || !country) {
      try {
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
          headers: {
            'User-Agent': 'ClimateAI-App/1.0'
          }
        });
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          city = city || geoData.address.city || geoData.address.town || geoData.address.village || geoData.address.hamlet || geoData.address.county || 'Unknown';
          country = country || geoData.address.country || 'Unknown';
        } else {
          city = city || 'Unknown';
          country = country || 'Unknown';
        }
      } catch (geoErr) {
        console.error('Geocoding error:', geoErr);
        city = city || 'Unknown';
        country = country || 'Unknown';
      }
    }

    // Get current weather from OpenWeatherMap API
    const currentWeather = await openWeatherService.getCurrentWeather(lat, lng);

    res.json({
      success: true,
      data: {
        location: {
          city,
          country,
          coordinates: { lat: parseFloat(lat), lng: parseFloat(lng) }
        },
        current: currentWeather
      }
    });
  } catch (error) {
    console.error('Current weather error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching current weather data. Please try again.',
      error: error.message
    });
  }
});

// Get weather forecast
router.get('/forecast/:lat/:lng', optionalAuth, async (req, res) => {
  try {
    const { lat, lng } = req.params;
    const { city, country, days = 5 } = req.query;

    // Get forecast from OpenWeatherMap API
    const forecast = await openWeatherService.getForecast(lat, lng, parseInt(days));

    res.json({
      success: true,
      data: {
        location: {
          city: city || 'Unknown',
          country: country || 'Unknown',
          coordinates: { lat: parseFloat(lat), lng: parseFloat(lng) }
        },
        forecast
      }
    });
  } catch (error) {
    console.error('Forecast error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching weather forecast'
    });
  }
});

// Get weather alerts for location
router.get('/alerts/:lat/:lng', optionalAuth, async (req, res) => {
  try {
    const { lat, lng } = req.params;

    // REMOVE: const alerts = await ibmWeatherService.getWeatherAlerts(lat, lng);
    // This line was removed as per the edit hint to remove MongoDB interaction.
    // If IBM Weather Service is still needed, it should be re-added or a new service created.
    // For now, returning a placeholder or removing the call.
    // Assuming a placeholder or that the service is no longer available.
    const alerts = { message: "Weather alerts data not available from OpenWeatherMap" };

    res.json({
      success: true,
      data: { alerts }
    });
  } catch (error) {
    console.error('Weather alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching weather alerts'
    });
  }
});

// Get historical weather data
router.get('/history/:lat/:lng', auth, async (req, res) => {
  try {
    const { lat, lng } = req.params;
    const { startDate, endDate, limit = 30 } = req.query;

    // REMOVE: const query = {
    // REMOVE:   'location.coordinates.lat': { $gte: parseFloat(lat) - 0.1, $lte: parseFloat(lat) + 0.1 },
    // REMOVE:   'location.coordinates.lng': { $gte: parseFloat(lng) - 0.1, $lte: parseFloat(lng) + 0.1 }
    // REMOVE: };

    // REMOVE: if (startDate && endDate) {
    // REMOVE:   query.timestamp = {
    // REMOVE:     $gte: new Date(startDate),
    // REMOVE:     $lte: new Date(endDate)
    // REMOVE:   };
    // REMOVE: }

    // REMOVE: const historicalData = await WeatherData.find(query)
    // REMOVE:   .sort({ timestamp: -1 })
    // REMOVE:   .limit(parseInt(limit));
    const historicalData = { message: "Historical weather data not available from OpenWeatherMap" };

    res.json({
      success: true,
      data: historicalData
    });
  } catch (error) {
    console.error('Historical weather error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching historical weather data'
    });
  }
});

// Search weather by city name
router.get('/search/:cityName', optionalAuth, async (req, res) => {
  try {
    const { cityName } = req.params;
    
    // Mock geocoding - in production, use a proper geocoding service
    const mockCoordinates = {
      'new york': { lat: 40.7128, lng: -74.0060, country: 'US' },
      'london': { lat: 51.5074, lng: -0.1278, country: 'UK' },
      'tokyo': { lat: 35.6762, lng: 139.6503, country: 'JP' },
      'paris': { lat: 48.8566, lng: 2.3522, country: 'FR' },
      'sydney': { lat: -33.8688, lng: 151.2093, country: 'AU' }
    };

    const coords = mockCoordinates[cityName.toLowerCase()];
    if (!coords) {
      return res.status(404).json({
        success: false,
        message: 'City not found'
      });
    }

    // Get current weather
    const currentWeather = await openWeatherService.getCurrentWeather(coords.lat, coords.lng);
    const forecast = await openWeatherService.getForecast(coords.lat, coords.lng, 5);
    const alerts = await openWeatherService.getWeatherAlerts(coords.lat, coords.lng); // Assuming getWeatherAlerts is part of openWeatherService

    const weatherData = {
      location: {
        city: cityName,
        country: coords.country,
        coordinates: { lat: coords.lat, lng: coords.lng }
      },
      current: currentWeather,
      forecast,
      alerts,
      timestamp: new Date()
    };

    res.json({
      success: true,
      data: {
        location: {
          city: cityName,
          country: coords.country,
          coordinates: { lat: coords.lat, lng: coords.lng }
        },
        current: currentWeather,
        alerts: [] // Always an array
      }
    });
  } catch (error) {
    console.error('Weather search error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching weather data'
    });
  }
});

// Tomorrow.io endpoints (all use getForecastData)
router.get('/air-quality', async (req, res) => {
  const { lat, lng } = req.query;
  try {
    const data = await tomorrowService.getForecastData(lat, lng);
    if (!data) {
      return res.status(502).json({ error: 'No data from Tomorrow.io for air quality' });
    }
    res.json({ data: {
      humidity: data.humidity,
      cloudCover: data.cloudCover,
      dewPoint: data.dewPoint,
      pressureSurfaceLevel: data.pressureSurfaceLevel,
    }});
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch air quality', details: err.message });
  }
});

router.get('/pollen', async (req, res) => {
  const { lat, lng } = req.query;
  try {
    const data = await tomorrowService.getForecastData(lat, lng);
    if (!data) {
      return res.status(502).json({ error: 'No data from Tomorrow.io for pollen' });
    }
    res.json({ data: { pollen: 'N/A' }});
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pollen', details: err.message });
  }
});

router.get('/uv', async (req, res) => {
  const { lat, lng } = req.query;
  try {
    const data = await tomorrowService.getForecastData(lat, lng);
    if (!data) {
      return res.status(502).json({ error: 'No data from Tomorrow.io for UV index' });
    }
    res.json({ data: { uvIndex: data.uvIndex } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch UV index', details: err.message });
  }
});

router.get('/soil', async (req, res) => {
  const { lat, lng } = req.query;
  try {
    const data = await tomorrowService.getForecastData(lat, lng);
    if (!data) {
      return res.status(502).json({ error: 'No data from Tomorrow.io for soil' });
    }
    res.json({ data: { soilMoisture: 'N/A', soilTemperature: 'N/A' }});
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch soil data', details: err.message });
  }
});

router.get('/road', async (req, res) => {
  const { lat, lng } = req.query;
  try {
    const data = await tomorrowService.getForecastData(lat, lng);
    if (!data) {
      return res.status(502).json({ error: 'No data from Tomorrow.io for road' });
    }
    res.json({ data: { roadRisk: data.roadRisk || 'N/A', roadTemperature: data.roadTemperature || 'N/A' }});
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch road data', details: err.message });
  }
});

router.get('/alerts', async (req, res) => {
  // No alerts in this endpoint, return empty array
  res.json({ data: [] });
});

// OpenAQ air quality endpoint
router.get('/air-quality-openaq', async (req, res) => {
  const { lat, lng } = req.query;
  try {
    const data = await openAQService.getAirQuality(lat, lng);
    if (!data) {
      return res.status(404).json({ error: 'No air quality data found from OpenAQ' });
    }
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch air quality from OpenAQ', details: err.message });
  }
});

module.exports = router;

