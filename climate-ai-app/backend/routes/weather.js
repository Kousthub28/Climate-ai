const express = require('express');
const WeatherData = require('../models/WeatherData');
const ibmWeatherService = require('../services/ibmWeatherService');
const { auth, optionalAuth } = require('../middleware/auth');
const fetch = require('node-fetch'); // Add at the top if not present

const router = express.Router();

// Get current weather for location
router.get('/current/:lat/:lng', optionalAuth, async (req, res) => {
  try {
    const { lat, lng } = req.params;
    let { city, country } = req.query;

    // If city or country is missing, use reverse geocoding
    if (!city || !country) {
      try {
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          city = city || geoData.address.city || geoData.address.town || geoData.address.village || geoData.address.hamlet || geoData.address.county || 'Unknown';
          country = country || geoData.address.country || 'Unknown';
        }
      } catch (geoErr) {
        console.error('Reverse geocoding error:', geoErr);
        city = city || 'Unknown';
        country = country || 'Unknown';
      }
    }

    // Get current weather from IBM API
    const currentWeather = await ibmWeatherService.getCurrentWeather(lat, lng);
    const alerts = await ibmWeatherService.getWeatherAlerts(lat, lng);

    // Create weather data object
    const weatherData = {
      location: {
        city,
        country,
        coordinates: { lat: parseFloat(lat), lng: parseFloat(lng) }
      },
      current: currentWeather,
      alerts,
      timestamp: new Date()
    };

    // Save to database
    const savedWeatherData = new WeatherData(weatherData);
    await savedWeatherData.save();

    // Log user activity if authenticated
    if (req.user) {
      req.user.activityLog.push({
        action: 'weather_check',
        timestamp: new Date(),
        data: { location: { lat, lng, city, country } }
      });
      await req.user.save();
    }

    res.json({
      success: true,
      data: weatherData
    });
  } catch (error) {
    console.error('Current weather error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching current weather data'
    });
  }
});

// Get weather forecast
router.get('/forecast/:lat/:lng', optionalAuth, async (req, res) => {
  try {
    const { lat, lng } = req.params;
    const { city, country, days = 7 } = req.query;

    // Get forecast from IBM API
    const forecast = await ibmWeatherService.getForecast(lat, lng, parseInt(days));

    const weatherData = {
      location: {
        city: city || 'Unknown',
        country: country || 'Unknown',
        coordinates: { lat: parseFloat(lat), lng: parseFloat(lng) }
      },
      forecast,
      timestamp: new Date()
    };

    res.json({
      success: true,
      data: weatherData
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

    const alerts = await ibmWeatherService.getWeatherAlerts(lat, lng);

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

    const query = {
      'location.coordinates.lat': { $gte: parseFloat(lat) - 0.1, $lte: parseFloat(lat) + 0.1 },
      'location.coordinates.lng': { $gte: parseFloat(lng) - 0.1, $lte: parseFloat(lng) + 0.1 }
    };

    if (startDate && endDate) {
      query.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const historicalData = await WeatherData.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

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
    const currentWeather = await ibmWeatherService.getCurrentWeather(coords.lat, coords.lng);
    const forecast = await ibmWeatherService.getForecast(coords.lat, coords.lng, 5);
    const alerts = await ibmWeatherService.getWeatherAlerts(coords.lat, coords.lng);

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
      data: weatherData
    });
  } catch (error) {
    console.error('Weather search error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching weather data'
    });
  }
});

module.exports = router;

