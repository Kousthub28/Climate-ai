const mongoose = require('mongoose');

const weatherDataSchema = new mongoose.Schema({
  location: {
    city: { type: String, required: true },
    country: { type: String, required: true },
    coordinates: {
      type: { type: String, enum: ['Point'], required: true },
      coordinates: { type: [Number], required: true }
    }
  },
  current: {
    temperature: Number,
    humidity: Number,
    pressure: Number,
    windSpeed: Number,
    windDirection: Number,
    visibility: Number,
    uvIndex: Number,
    condition: String,
    description: String,
    icon: String
  },
  forecast: [{
    date: Date,
    temperature: {
      min: Number,
      max: Number
    },
    humidity: Number,
    precipitation: Number,
    windSpeed: Number,
    condition: String,
    description: String,
    icon: String
  }],
  alerts: [{
    type: String,
    severity: String,
    title: String,
    description: String,
    startTime: Date,
    endTime: Date,
    areas: [String]
  }],
  airQuality: {
    aqi: Number,
    pm25: Number,
    pm10: Number,
    o3: Number,
    no2: Number,
    so2: Number,
    co: Number
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for location-based queries
weatherDataSchema.index({ 'location.coordinates': '2dsphere' });
weatherDataSchema.index({ timestamp: -1 });

module.exports = mongoose.model('WeatherData', weatherDataSchema);

