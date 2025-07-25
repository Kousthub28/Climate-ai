const express = require('express');
const ClimateAnalysis = require('../models/ClimateAnalysis');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Create new climate analysis
router.post('/analyze', auth, async (req, res) => {
  try {
    const { location, analysisType, timeRange } = req.body;

    const analysis = new ClimateAnalysis({
      userId: req.user._id,
      location,
      analysisType,
      timeRange,
      status: 'processing'
    });

    await analysis.save();

    // Simulate AI analysis processing
    setTimeout(async () => {
      try {
        const mockAnalysisData = generateMockAnalysis(analysisType, location);
        
        analysis.data = mockAnalysisData.data;
        analysis.aiPredictions = mockAnalysisData.aiPredictions;
        analysis.riskAssessment = mockAnalysisData.riskAssessment;
        analysis.status = 'completed';
        
        await analysis.save();
      } catch (error) {
        console.error('Analysis processing error:', error);
        analysis.status = 'failed';
        await analysis.save();
      }
    }, 3000);

    res.json({
      success: true,
      message: 'Climate analysis started',
      analysisId: analysis._id
    });
  } catch (error) {
    console.error('Climate analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Error starting climate analysis'
    });
  }
});

// Get analysis results
router.get('/analysis/:id', auth, async (req, res) => {
  try {
    const analysis = await ClimateAnalysis.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis not found'
      });
    }

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Get analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analysis'
    });
  }
});

// Get user's analysis history
router.get('/history', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, analysisType } = req.query;
    
    const query = { userId: req.user._id };
    if (analysisType) {
      query.analysisType = analysisType;
    }

    const analyses = await ClimateAnalysis.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ClimateAnalysis.countDocuments(query);

    res.json({
      success: true,
      data: {
        analyses,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Analysis history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analysis history'
    });
  }
});

// Get climate trends for location
router.get('/trends/:lat/:lng', auth, async (req, res) => {
  try {
    const { lat, lng } = req.params;
    const { period = '1year' } = req.query;

    // Mock climate trends data
    const trends = generateClimateTriends(lat, lng, period);

    res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    console.error('Climate trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching climate trends'
    });
  }
});

// Get climate risk assessment
router.get('/risk/:lat/:lng', auth, async (req, res) => {
  try {
    const { lat, lng } = req.params;

    const riskAssessment = generateRiskAssessment(lat, lng);

    res.json({
      success: true,
      data: riskAssessment
    });
  } catch (error) {
    console.error('Risk assessment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating risk assessment'
    });
  }
});

// Helper functions for mock data generation
function generateMockAnalysis(analysisType, location) {
  const baseData = {
    data: {
      historical: generateHistoricalData(),
      current: generateCurrentData(),
      predictions: generatePredictions(),
      trends: generateTrends(),
      insights: [
        'Temperature has increased by 1.2°C over the past decade',
        'Precipitation patterns show increased variability',
        'Extreme weather events are becoming more frequent'
      ],
      recommendations: [
        'Implement water conservation measures',
        'Prepare for increased heat wave frequency',
        'Consider climate-resilient infrastructure'
      ]
    },
    aiPredictions: {
      shortTerm: {
        period: '3 months',
        confidence: 0.85,
        predictions: {
          temperature: { change: '+0.5°C', trend: 'increasing' },
          precipitation: { change: '-10%', trend: 'decreasing' }
        }
      },
      longTerm: {
        period: '10 years',
        confidence: 0.72,
        predictions: {
          temperature: { change: '+2.1°C', trend: 'increasing' },
          precipitation: { change: '-15%', trend: 'decreasing' }
        }
      }
    },
    riskAssessment: {
      overall: 'medium',
      categories: {
        flooding: 'low',
        drought: 'high',
        heatWave: 'medium',
        storms: 'medium',
        airQuality: 'medium'
      }
    }
  };

  return baseData;
}

function generateHistoricalData() {
  return {
    temperature: Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      average: 15 + Math.random() * 20,
      min: 5 + Math.random() * 15,
      max: 25 + Math.random() * 15
    })),
    precipitation: Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      total: Math.random() * 150
    }))
  };
}

function generateCurrentData() {
  return {
    temperature: 22.5,
    humidity: 65,
    pressure: 1013.2,
    windSpeed: 12.5
  };
}

function generatePredictions() {
  return {
    nextWeek: {
      temperature: { min: 18, max: 28, average: 23 },
      precipitation: 15,
      conditions: 'Partly cloudy with occasional showers'
    },
    nextMonth: {
      temperature: { min: 16, max: 30, average: 24 },
      precipitation: 45,
      conditions: 'Warmer than average with normal rainfall'
    }
  };
}

function generateTrends() {
  return {
    temperature: {
      trend: 'increasing',
      rate: '+0.12°C per year',
      confidence: 0.89
    },
    precipitation: {
      trend: 'variable',
      rate: 'No significant trend',
      confidence: 0.65
    }
  };
}

function generateClimateTriends(lat, lng, period) {
  return {
    location: { lat: parseFloat(lat), lng: parseFloat(lng) },
    period,
    temperature: {
      historical: Array.from({ length: 24 }, (_, i) => ({
        date: new Date(Date.now() - (23 - i) * 30 * 24 * 60 * 60 * 1000),
        value: 20 + Math.sin(i * 0.5) * 5 + Math.random() * 3
      })),
      trend: 'increasing',
      changeRate: '+0.15°C per year'
    },
    precipitation: {
      historical: Array.from({ length: 24 }, (_, i) => ({
        date: new Date(Date.now() - (23 - i) * 30 * 24 * 60 * 60 * 1000),
        value: 50 + Math.random() * 100
      })),
      trend: 'stable',
      changeRate: 'No significant change'
    }
  };
}

function generateRiskAssessment(lat, lng) {
  return {
    location: { lat: parseFloat(lat), lng: parseFloat(lng) },
    overall: 'medium',
    categories: {
      flooding: {
        risk: 'low',
        probability: 0.15,
        impact: 'medium',
        description: 'Low flood risk due to good drainage infrastructure'
      },
      drought: {
        risk: 'high',
        probability: 0.75,
        impact: 'high',
        description: 'High drought risk due to decreasing precipitation trends'
      },
      heatWave: {
        risk: 'medium',
        probability: 0.45,
        impact: 'medium',
        description: 'Moderate heat wave risk with increasing temperatures'
      },
      storms: {
        risk: 'medium',
        probability: 0.35,
        impact: 'high',
        description: 'Moderate storm risk but potentially high impact'
      },
      airQuality: {
        risk: 'medium',
        probability: 0.55,
        impact: 'medium',
        description: 'Air quality concerns during certain weather patterns'
      }
    },
    recommendations: [
      'Implement water conservation strategies',
      'Prepare emergency plans for extreme weather',
      'Monitor air quality during high-risk periods',
      'Consider climate adaptation measures'
    ]
  };
}

module.exports = router;

