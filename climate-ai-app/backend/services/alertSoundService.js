const fs = require('fs');
const path = require('path');
const { sendTelegramAlert } = require('./telegramService');

class AlertSoundService {
  constructor() {
    this.alertHistoryFile = path.join(__dirname, '../alert-sound-history.json');
    this.soundTypes = {
      rain: {
        name: 'Rain Alert',
        emoji: '🌧️',
        sound: 'rain-siren.wav',
        severity: 'moderate',
        description: 'Heavy rain detected'
      },
      flood: {
        name: 'Flood Alert',
        emoji: '🌊',
        sound: 'flood-siren.wav',
        severity: 'severe',
        description: 'Flood warning issued'
      },
      heatwave: {
        name: 'Heat Wave Alert',
        emoji: '🔥',
        sound: 'heat-siren.wav',
        severity: 'high',
        description: 'Extreme heat conditions'
      },
      storm: {
        name: 'Storm Alert',
        emoji: '⛈️',
        sound: 'storm-siren.wav',
        severity: 'severe',
        description: 'Severe storm warning'
      },
      tornado: {
        name: 'Tornado Alert',
        emoji: '🌪️',
        sound: 'tornado-siren.wav',
        severity: 'critical',
        description: 'Tornado warning'
      }
    };
  }

  async checkWeatherAlerts(location) {
    try {
      const weatherData = await this.getWeatherData(location);
      const alerts = this.analyzeWeatherConditions(weatherData, location);
      
      for (const alert of alerts) {
        if (alert.shouldAlert) {
          await this.triggerAlert(alert);
          await this.saveAlertHistory(alert);
        }
      }
      
      return alerts;
    } catch (error) {
      console.error(`Error checking weather alerts for ${location.name}:`, error);
      return [];
    }
  }

  async getWeatherData(location) {
    // Simulate weather data - in production, use actual weather API
    const mockWeatherData = {
      temperature: 15 + Math.random() * 30, // 15-45°C
      humidity: 30 + Math.random() * 60, // 30-90%
      precipitation: Math.random() * 50, // 0-50mm
      windSpeed: Math.random() * 40, // 0-40 km/h
      pressure: 1000 + Math.random() * 50, // 1000-1050 hPa
      condition: this.getRandomCondition(),
      timestamp: new Date().toISOString()
    };

    return {
      location,
      current: mockWeatherData,
      timestamp: new Date().toISOString()
    };
  }

  getRandomCondition() {
    const conditions = [
      'Clear', 'Cloudy', 'Rain', 'Heavy Rain', 'Storm', 'Heat Wave',
      'Flood Warning', 'Tornado Watch', 'Severe Weather'
    ];
    return conditions[Math.floor(Math.random() * conditions.length)];
  }

  analyzeWeatherConditions(weatherData, location) {
    const { current } = weatherData;
    const alerts = [];

    // Rain Alert Analysis
    if (current.condition.toLowerCase().includes('rain') || current.precipitation > 10) {
      const rainAlert = this.createRainAlert(current, location);
      alerts.push(rainAlert);
    }

    // Flood Alert Analysis
    if (current.precipitation > 25 || current.condition.toLowerCase().includes('flood')) {
      const floodAlert = this.createFloodAlert(current, location);
      alerts.push(floodAlert);
    }

    // Heat Wave Alert Analysis
    if (current.temperature > 35 || current.condition.toLowerCase().includes('heat')) {
      const heatAlert = this.createHeatWaveAlert(current, location);
      alerts.push(heatAlert);
    }

    // Storm Alert Analysis
    if (current.windSpeed > 25 || current.condition.toLowerCase().includes('storm')) {
      const stormAlert = this.createStormAlert(current, location);
      alerts.push(stormAlert);
    }

    // Tornado Alert Analysis
    if (current.condition.toLowerCase().includes('tornado')) {
      const tornadoAlert = this.createTornadoAlert(current, location);
      alerts.push(tornadoAlert);
    }

    return alerts;
  }

  createRainAlert(weather, location) {
    const intensity = weather.precipitation > 20 ? 'heavy' : 'moderate';
    return {
      type: 'rain',
      location: location.name,
      coordinates: `${location.lat}, ${location.lng}`,
      severity: intensity === 'heavy' ? 'high' : 'moderate',
      shouldAlert: true,
      weather: {
        temperature: weather.temperature,
        humidity: weather.humidity,
        precipitation: weather.precipitation,
        condition: weather.condition
      },
      message: `${intensity === 'heavy' ? 'Heavy' : 'Moderate'} rain detected in ${location.name}`,
      timestamp: new Date().toISOString()
    };
  }

  createFloodAlert(weather, location) {
    return {
      type: 'flood',
      location: location.name,
      coordinates: `${location.lat}, ${location.lng}`,
      severity: 'severe',
      shouldAlert: true,
      weather: {
        temperature: weather.temperature,
        humidity: weather.humidity,
        precipitation: weather.precipitation,
        condition: weather.condition
      },
      message: `Flood warning issued for ${location.name} - High precipitation levels detected`,
      timestamp: new Date().toISOString()
    };
  }

  createHeatWaveAlert(weather, location) {
    const intensity = weather.temperature > 40 ? 'extreme' : 'high';
    return {
      type: 'heatwave',
      location: location.name,
      coordinates: `${location.lat}, ${location.lng}`,
      severity: intensity === 'extreme' ? 'critical' : 'high',
      shouldAlert: true,
      weather: {
        temperature: weather.temperature,
        humidity: weather.humidity,
        condition: weather.condition
      },
      message: `${intensity === 'extreme' ? 'Extreme' : 'High'} heat conditions in ${location.name}`,
      timestamp: new Date().toISOString()
    };
  }

  createStormAlert(weather, location) {
    return {
      type: 'storm',
      location: location.name,
      coordinates: `${location.lat}, ${location.lng}`,
      severity: 'severe',
      shouldAlert: true,
      weather: {
        temperature: weather.temperature,
        windSpeed: weather.windSpeed,
        condition: weather.condition
      },
      message: `Severe storm warning for ${location.name} - High winds detected`,
      timestamp: new Date().toISOString()
    };
  }

  createTornadoAlert(weather, location) {
    return {
      type: 'tornado',
      location: location.name,
      coordinates: `${location.lat}, ${location.lng}`,
      severity: 'critical',
      shouldAlert: true,
      weather: {
        temperature: weather.temperature,
        windSpeed: weather.windSpeed,
        condition: weather.condition
      },
      message: `Tornado warning issued for ${location.name} - Take immediate shelter`,
      timestamp: new Date().toISOString()
    };
  }

  async triggerAlert(alert) {
    const soundType = this.soundTypes[alert.type];
    if (!soundType) return;

    const alertMessage = this.formatAlertMessage(alert, soundType);
    
    try {
      // Log the alert with sound information (no Telegram sending)
      console.log(`🚨 ${soundType.emoji} ${soundType.name} triggered for ${alert.location}`);
      console.log(`🔊 Sound file: ${soundType.sound}`);
      console.log(`📊 Severity: ${alert.severity}`);
      console.log(`🌐 Alert will be played directly on website`);
      
    } catch (error) {
      console.error(`❌ Failed to process ${alert.type} alert for ${alert.location}:`, error);
    }
  }

  formatAlertMessage(alert, soundType) {
    const severityEmoji = {
      moderate: '⚠️',
      high: '🚨',
      severe: '🚨',
      critical: '🚨'
    };

    const precautions = this.getPrecautions(alert.type, alert.severity);
    
    return `${severityEmoji[alert.severity]} *${soundType.name.toUpperCase()}* ${soundType.emoji}

📍 *Location:* ${alert.location}
🌍 *Coordinates:* ${alert.coordinates}
🕒 *Time:* ${new Date().toLocaleString()}

🌡️ *Weather Conditions:*
• Temperature: ${alert.weather.temperature.toFixed(1)}°C
• Humidity: ${alert.weather.humidity}%
${alert.weather.precipitation ? `• Precipitation: ${alert.weather.precipitation.toFixed(1)}mm` : ''}
${alert.weather.windSpeed ? `• Wind Speed: ${alert.weather.windSpeed.toFixed(1)} km/h` : ''}
• Condition: ${alert.weather.condition}

🔊 *Alert Type:* ${soundType.name}
📊 *Severity:* ${alert.severity.toUpperCase()}

⚠️ *Safety Precautions:*
${precautions}

🔔 *Sound Alert:* ${soundType.sound}

Stay safe and follow local emergency instructions!`;
  }

  getPrecautions(alertType, severity) {
    const precautions = {
      rain: {
        moderate: [
          "• Carry an umbrella or raincoat",
          "• Drive carefully on wet roads",
          "• Avoid outdoor activities if possible"
        ],
        high: [
          "• Stay indoors if possible",
          "• Avoid driving unless necessary",
          "• Keep emergency supplies ready",
          "• Monitor local weather updates"
        ]
      },
      flood: {
        severe: [
          "• Move to higher ground immediately",
          "• Avoid walking or driving through floodwaters",
          "• Keep emergency kit ready",
          "• Follow evacuation orders if issued",
          "• Stay away from rivers and streams"
        ]
      },
      heatwave: {
        high: [
          "• Stay hydrated and drink plenty of water",
          "• Avoid outdoor activities during peak hours",
          "• Stay in air-conditioned spaces",
          "• Check on elderly and vulnerable people"
        ],
        critical: [
          "• Stay indoors with air conditioning",
          "• Drink water frequently",
          "• Avoid strenuous activities",
          "• Seek medical attention if needed",
          "• Monitor heat index warnings"
        ]
      },
      storm: {
        severe: [
          "• Stay indoors and away from windows",
          "• Secure outdoor objects",
          "• Avoid driving during the storm",
          "• Keep emergency supplies ready"
        ]
      },
      tornado: {
        critical: [
          "• Take shelter immediately in basement or interior room",
          "• Stay away from windows and exterior walls",
          "• Cover yourself with blankets or mattresses",
          "• Monitor emergency broadcasts",
          "• Follow evacuation orders if issued"
        ]
      }
    };

    return precautions[alertType]?.[severity]?.join('\n') || "• Stay informed about weather conditions";
  }

  async saveAlertHistory(alert) {
    try {
      let history = [];
      if (fs.existsSync(this.alertHistoryFile)) {
        history = JSON.parse(fs.readFileSync(this.alertHistoryFile, 'utf8'));
      }
      
      history.unshift({
        ...alert,
        sentAt: new Date().toISOString(),
        soundFile: this.soundTypes[alert.type]?.sound
      });
      
      // Keep only last 100 alerts
      history = history.slice(0, 100);
      
      fs.writeFileSync(this.alertHistoryFile, JSON.stringify(history, null, 2));
    } catch (error) {
      console.error('Error saving alert history:', error);
    }
  }

  async getAlertHistory() {
    try {
      if (fs.existsSync(this.alertHistoryFile)) {
        return JSON.parse(fs.readFileSync(this.alertHistoryFile, 'utf8'));
      }
      return [];
    } catch (error) {
      console.error('Error reading alert history:', error);
      return [];
    }
  }

  getSoundTypes() {
    return this.soundTypes;
  }
}

module.exports = new AlertSoundService(); 