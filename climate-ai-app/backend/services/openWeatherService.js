const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

class OpenWeatherService {
  constructor() {
    this.apiKey = '0e356836821fe7c66466877bd63f9ee7'; // <-- User's OpenWeatherMap API key
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
  }

  async getCurrentWeather(lat, lng) {
    try {
      const url = `${this.baseUrl}/weather?lat=${lat}&lon=${lng}&units=metric&appid=${this.apiKey}`;
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'ClimateAI-App/1.0'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error(`Weather API error: ${response.status}`);
      const data = await response.json();
      return {
        temperature: data.main.temp,
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        windSpeed: data.wind.speed,
        windDirection: data.wind.deg,
        visibility: data.visibility / 1000,
        condition: data.weather[0].main,
        description: data.weather[0].description,
        icon: data.weather[0].icon
      };
    } catch (error) {
      console.error('Current weather error:', error);
      throw error; // Re-throw to let the frontend handle it
    }
  }

  async getForecast(lat, lng, days = 7) {
    try {
      const url = `${this.baseUrl}/forecast?lat=${lat}&lon=${lng}&units=metric&appid=${this.apiKey}`;
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'ClimateAI-App/1.0'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error(`Forecast API error: ${response.status}`);
      const data = await response.json();
      // OpenWeatherMap returns 3-hour intervals, so you may want to process this for daily summaries
      return data.list.map(item => ({
        date: item.dt_txt,
        temperature: item.main.temp,
        condition: item.weather[0].main,
        description: item.weather[0].description,
        icon: item.weather[0].icon,
        precipitation: item.rain ? item.rain['3h'] || 0 : 0,
        humidity: item.main.humidity,
        windSpeed: item.wind.speed
      }));
    } catch (error) {
      console.error('Forecast error:', error);
      throw error; // Re-throw to let the frontend handle it
    }
  }

  async getWeatherAlerts(lat, lng) {
    // OpenWeatherMap alerts are not available on free plan
    return [];
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

module.exports = new OpenWeatherService();

