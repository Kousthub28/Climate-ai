const mongoose = require('mongoose');

const climateAnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    city: String,
    country: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  analysisType: {
    type: String,
    enum: ['temperature_trend', 'precipitation_pattern', 'extreme_events', 'seasonal_analysis', 'climate_risk'],
    required: true
  },
  timeRange: {
    start: Date,
    end: Date
  },
  data: {
    historical: mongoose.Schema.Types.Mixed,
    current: mongoose.Schema.Types.Mixed,
    predictions: mongoose.Schema.Types.Mixed,
    trends: mongoose.Schema.Types.Mixed,
    insights: [String],
    recommendations: [String]
  },
  aiPredictions: {
    shortTerm: {
      period: String,
      confidence: Number,
      predictions: mongoose.Schema.Types.Mixed
    },
    longTerm: {
      period: String,
      confidence: Number,
      predictions: mongoose.Schema.Types.Mixed
    }
  },
  riskAssessment: {
    overall: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    categories: {
      flooding: String,
      drought: String,
      heatWave: String,
      storms: String,
      airQuality: String
    }
  },
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed'],
    default: 'processing'
  }
}, {
  timestamps: true
});

// Index for user and location queries
climateAnalysisSchema.index({ userId: 1, createdAt: -1 });
climateAnalysisSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('ClimateAnalysis', climateAnalysisSchema);

