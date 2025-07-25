const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

class IBMWeatherService {
  constructor() {
    this.apiKey = 'fe119406-4111-4cd8-8418-6f0074ee5a12'; // Hardcoded API key
    this.baseUrl = 'https://api.weather.com/v3'; // Hardcoded base URL
  }

  async getCurrentWeather(lat, lng) {
    try {
      const url = `${this.baseUrl}/wx/conditions/current?geocode=${lat},${lng}&format=json&apiKey=${this.apiKey}`;
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();
      return this.formatCurrentWeather(data);
    } catch (error) {
      console.error('Current weather error:', error);
      // Return mock data if API fails
      return this.getMockCurrentWeather(lat, lng);
    }
  }

  async getForecast(lat, lng, days = 7) {
    try {
      const url = `${this.baseUrl}/forecast/daily/10day?geocode=${lat},${lng}&units=m&language=en-US&format=json`;
      
      const response = await fetch(url, {
        headers: {
          'X-IBM-Client-Id': this.apiKey,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Forecast API error: ${response.status}`);
      }

      const data = await response.json();
      return this.formatForecast(data, days);
    } catch (error) {
      console.error('Forecast error:', error);
      // Return mock data if API fails
      return this.getMockForecast(lat, lng, days);
    }
  }

  async getWeatherAlerts(lat, lng) {
    try {
      const url = `${this.baseUrl}/wx/alerts/headlines?geocode=${lat},${lng}&format=json&apiKey=${this.apiKey}`;
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Alerts API error: ${response.status}`);
      }

      const data = await response.json();
      return this.formatAlerts(data);
    } catch (error) {
      console.error('Weather alerts error:', error);
      return [];
    }
  }

  formatCurrentWeather(data) {
    const observation = data.observation || {};
    return {
      temperature: observation.temp || 20,
      humidity: observation.rh || 50,
      pressure: observation.pressure || 1013,
      windSpeed: observation.wspd || 5,
      windDirection: observation.wdir || 180,
      visibility: observation.vis || 10,
      uvIndex: observation.uv_index || 3,
      condition: observation.wx_phrase || 'Partly Cloudy',
      description: observation.phrase_32char || 'Partly Cloudy',
      icon: observation.wx_icon || '30'
    };
  }

  formatForecast(data, days) {
    const forecasts = data.forecasts || [];
    return forecasts.slice(0, days).map(forecast => ({
      date: new Date(forecast.fcst_valid_local),
      temperature: {
        min: forecast.min_temp || 15,
        max: forecast.max_temp || 25
      },
      humidity: forecast.rh || 50,
      precipitation: forecast.pop || 0,
      windSpeed: forecast.wspd || 5,
      condition: forecast.phrase_32char || 'Partly Cloudy',
      description: forecast.narrative || 'Partly cloudy conditions expected',
      icon: forecast.wx_icon || '30'
    }));
  }

  formatAlerts(data) {
    const alerts = data.alerts || [];
    return alerts.map(alert => ({
      type: alert.phenomena || 'WEATHER',
      severity: alert.severity || 'Minor',
      title: alert.event_desc || 'Weather Alert',
      description: alert.detail_key || 'Weather conditions may affect your area',
      startTime: new Date(alert.start_time_local),
      endTime: new Date(alert.end_time_local),
      areas: alert.areas || []
    }));
  }

  getMockCurrentWeather(lat, lng) {
    return {
      temperature: 22 + Math.random() * 10,
      humidity: 45 + Math.random() * 30,
      pressure: 1010 + Math.random() * 20,
      windSpeed: Math.random() * 15,
      windDirection: Math.random() * 360,
      visibility: 8 + Math.random() * 7,
      uvIndex: Math.floor(Math.random() * 11),
      condition: 'Partly Cloudy',
      description: 'Partly cloudy with mild temperatures',
      icon: '30'
    };
  }

  getMockForecast(lat, lng, days) {
    const forecast = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      forecast.push({
        date,
        temperature: {
          min: 15 + Math.random() * 10,
          max: 25 + Math.random() * 10
        },
        humidity: 40 + Math.random() * 40,
        precipitation: Math.random() * 100,
        windSpeed: Math.random() * 20,
        condition: 'Partly Cloudy',
        description: 'Mixed conditions expected',
        icon: '30'
      });
    }
    return forecast;
  }
}

module.exports = new IBMWeatherService();

