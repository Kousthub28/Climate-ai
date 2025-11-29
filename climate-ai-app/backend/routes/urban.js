const express = require('express');
const { auth } = require('../middleware/auth');
const openAQService = require('../services/openAQService');
const fs = require('fs');
const path = require('path');
const csvFilePath = path.join(__dirname, '../data/carbon_emissions_with_energy.csv');

const router = express.Router();

// Get urban planning analysis
router.get('/analysis/:lat/:lng', auth, async (req, res) => {
  try {
    const { lat, lng } = req.params;
    const { radius = 5 } = req.query; // km radius

    const analysis = generateUrbanAnalysis(lat, lng, radius);

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Urban analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating urban analysis'
    });
  }
});

// Get sustainability metrics
router.get('/sustainability/:lat/:lng', auth, async (req, res) => {
  try {
    const { lat, lng } = req.params;

    const metrics = generateSustainabilityMetrics(lat, lng);

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Sustainability metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating sustainability metrics'
    });
  }
});

// Get green infrastructure recommendations
router.get('/green-infrastructure/:lat/:lng', auth, async (req, res) => {
  try {
    const { lat, lng } = req.params;

    const recommendations = generateGreenInfrastructureRecommendations(lat, lng);

    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error('Green infrastructure error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating green infrastructure recommendations'
    });
  }
});

// Get climate adaptation strategies
router.get('/adaptation/:lat/:lng', auth, async (req, res) => {
  try {
    const { lat, lng } = req.params;

    const strategies = generateClimateAdaptationStrategies(lat, lng);

    res.json({
      success: true,
      data: strategies
    });
  } catch (error) {
    console.error('Climate adaptation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating climate adaptation strategies'
    });
  }
});

// Get urban heat island analysis
router.get('/heat-island/:lat/:lng', auth, async (req, res) => {
  try {
    const { lat, lng } = req.params;

    const analysis = generateHeatIslandAnalysis(lat, lng);

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Heat island analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating heat island analysis'
    });
  }
});

// GET /urban/air-quality?city=CityName
router.get('/air-quality', async (req, res) => {
  try {
    const { city } = req.query;
    if (!city) {
      return res.status(400).json({ success: false, message: 'city is required' });
    }
    const result = await openAQService.getCityAirQuality(city);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Urban air quality error:', error);
    res.status(500).json({ success: false, message: 'Error fetching air quality data' });
  }
});

// Mock challenges endpoint
router.get('/challenges', async (req, res) => {
  const { city } = req.query;
  // For now, only mock data for New York City
  if (!city || city.toLowerCase() !== 'new york city') {
    return res.json([]);
  }
  return res.json([
    {
      id: 1,
      title: 'Air Quality Improvement',
      priority: 'High',
      impact: 'High',
      description: 'Reduce air pollution through better traffic management and industrial regulations.',
      solutions: ['Electric bus fleet', 'Low emission zones', 'Industrial filters'],
      timeline: '2-3 years',
      cost: '$2.5B',
    },
    {
      id: 2,
      title: 'Urban Heat Island Effect',
      priority: 'High',
      impact: 'Medium',
      description: 'Mitigate rising temperatures through green infrastructure and cool roofing.',
      solutions: ['Green roofs', 'Urban forests', 'Cool pavements'],
      timeline: '3-5 years',
      cost: '$1.8B',
    },
    {
      id: 3,
      title: 'Waste Management Optimization',
      priority: 'Medium',
      impact: 'Medium',
      description: 'Improve recycling rates and implement circular economy principles.',
      solutions: ['Smart bins', 'Waste-to-energy', 'Composting programs'],
      timeline: '1-2 years',
      cost: '$800M',
    },
  ]);
});

// Mock metrics endpoint
router.get('/metrics', async (req, res) => {
  const { city } = req.query;
  // For now, only mock data for New York City
  if (!city || city.toLowerCase() !== 'new york city') {
    return res.json({});
  }
  return res.json({
    energy: 78,
    transportation: 65,
    waste: 80,
    greenSpace: 68,
    airQuality: 70,
    waterManagement: 75,
  });
});

// GET /api/urban/csv-analysis
router.get('/csv-analysis', async (req, res) => {
  try {
    const csv = fs.readFileSync(csvFilePath, 'utf-8');
    const lines = csv.split('\n').filter(Boolean);
    const headers = lines[0].split(',').map(h => h.trim());
    const data = lines.slice(1).map(line => {
      const values = line.split(',');
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = values[i] ? values[i].trim() : '';
      });
      return obj;
    });
    res.json({ headers, data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to analyze urban CSV', details: err.message });
  }
});

// Helper functions for mock data generation
function generateUrbanAnalysis(lat, lng, radius) {
  return {
    location: { lat: parseFloat(lat), lng: parseFloat(lng) },
    radius: parseFloat(radius),
    demographics: {
      population: Math.floor(Math.random() * 500000) + 50000,
      density: Math.floor(Math.random() * 5000) + 1000, // people per km²
      growthRate: (Math.random() * 4 - 1).toFixed(2) + '%' // -1% to 3%
    },
    landUse: {
      residential: Math.floor(Math.random() * 40) + 30, // 30-70%
      commercial: Math.floor(Math.random() * 20) + 10, // 10-30%
      industrial: Math.floor(Math.random() * 15) + 5, // 5-20%
      greenSpace: Math.floor(Math.random() * 25) + 10, // 10-35%
      transportation: Math.floor(Math.random() * 10) + 5 // 5-15%
    },
    infrastructure: {
      roadDensity: (Math.random() * 10 + 5).toFixed(2), // km/km²
      publicTransit: {
        coverage: Math.floor(Math.random() * 60) + 40, // 40-100%
        efficiency: Math.floor(Math.random() * 40) + 60 // 60-100%
      },
      utilities: {
        waterAccess: Math.floor(Math.random() * 20) + 80, // 80-100%
        electricityReliability: Math.floor(Math.random() * 30) + 70, // 70-100%
        internetCoverage: Math.floor(Math.random() * 25) + 75 // 75-100%
      }
    },
    environmental: {
      airQualityIndex: Math.floor(Math.random() * 200) + 50, // 50-250
      noiseLevel: Math.floor(Math.random() * 40) + 40, // 40-80 dB
      greenCoverage: Math.floor(Math.random() * 30) + 20, // 20-50%
      waterQuality: Math.floor(Math.random() * 40) + 60 // 60-100%
    },
    climateRisk: {
      heatRisk: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
      floodRisk: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
      droughtRisk: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
      stormRisk: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)]
    }
  };
}

function generateSustainabilityMetrics(lat, lng) {
  return {
    location: { lat: parseFloat(lat), lng: parseFloat(lng) },
    overallScore: Math.floor(Math.random() * 40) + 60, // 60-100
    categories: {
      energy: {
        score: Math.floor(Math.random() * 40) + 60,
        renewablePercentage: Math.floor(Math.random() * 60) + 20,
        efficiency: Math.floor(Math.random() * 30) + 70,
        carbonIntensity: (Math.random() * 500 + 200).toFixed(2) // kg CO2/MWh
      },
      transportation: {
        score: Math.floor(Math.random() * 40) + 60,
        publicTransitUsage: Math.floor(Math.random() * 50) + 30,
        cyclingInfrastructure: Math.floor(Math.random() * 60) + 40,
        electricVehicles: Math.floor(Math.random() * 30) + 10
      },
      waste: {
        score: Math.floor(Math.random() * 40) + 60,
        recyclingRate: Math.floor(Math.random() * 40) + 40,
        wasteReduction: Math.floor(Math.random() * 30) + 20,
        composting: Math.floor(Math.random() * 50) + 25
      },
      water: {
        score: Math.floor(Math.random() * 40) + 60,
        conservation: Math.floor(Math.random() * 40) + 60,
        qualityIndex: Math.floor(Math.random() * 30) + 70,
        rainwaterHarvesting: Math.floor(Math.random() * 40) + 30
      },
      biodiversity: {
        score: Math.floor(Math.random() * 40) + 60,
        greenSpacePerCapita: (Math.random() * 20 + 10).toFixed(1), // m²
        treeCanopyCover: Math.floor(Math.random() * 40) + 20,
        nativeSpecies: Math.floor(Math.random() * 60) + 40
      }
    },
    trends: {
      improving: ['energy', 'transportation', 'waste'],
      stable: ['water'],
      declining: []
    },
    benchmarks: {
      national: Math.floor(Math.random() * 20) + 70,
      global: Math.floor(Math.random() * 25) + 65,
      bestPractice: Math.floor(Math.random() * 15) + 85
    }
  };
}

function generateGreenInfrastructureRecommendations(lat, lng) {
  return {
    location: { lat: parseFloat(lat), lng: parseFloat(lng) },
    priority: 'high',
    recommendations: [
      {
        type: 'green_roofs',
        title: 'Green Roof Implementation',
        description: 'Install green roofs on commercial and residential buildings',
        benefits: ['Reduce urban heat island', 'Improve air quality', 'Manage stormwater'],
        cost: 'medium',
        timeframe: '2-3 years',
        carbonReduction: '15-25 tons CO2/year per building'
      },
      {
        type: 'urban_forests',
        title: 'Urban Forest Expansion',
        description: 'Plant native trees along streets and in parks',
        benefits: ['Carbon sequestration', 'Air purification', 'Temperature regulation'],
        cost: 'low',
        timeframe: '1-2 years',
        carbonReduction: '48 lbs CO2/year per tree'
      },
      {
        type: 'permeable_surfaces',
        title: 'Permeable Pavement',
        description: 'Replace traditional pavement with permeable alternatives',
        benefits: ['Reduce flooding', 'Groundwater recharge', 'Pollution filtration'],
        cost: 'medium',
        timeframe: '3-5 years',
        carbonReduction: '5-10% reduction in runoff management emissions'
      },
      {
        type: 'bioswales',
        title: 'Bioswale Installation',
        description: 'Create natural drainage systems along roads',
        benefits: ['Water filtration', 'Habitat creation', 'Aesthetic improvement'],
        cost: 'low',
        timeframe: '1 year',
        carbonReduction: '2-5 tons CO2/year per mile'
      },
      {
        type: 'vertical_gardens',
        title: 'Vertical Garden Systems',
        description: 'Install living walls on building facades',
        benefits: ['Air purification', 'Building insulation', 'Urban biodiversity'],
        cost: 'high',
        timeframe: '1-2 years',
        carbonReduction: '10-20 lbs CO2/year per m²'
      }
    ],
    implementation: {
      phase1: ['urban_forests', 'bioswales'],
      phase2: ['permeable_surfaces', 'green_roofs'],
      phase3: ['vertical_gardens']
    },
    funding: {
      government: 'Available grants for green infrastructure projects',
      private: 'Tax incentives for private green building initiatives',
      partnerships: 'Public-private partnerships for large-scale projects'
    }
  };
}

function generateClimateAdaptationStrategies(lat, lng) {
  return {
    location: { lat: parseFloat(lat), lng: parseFloat(lng) },
    strategies: [
      {
        category: 'heat_management',
        title: 'Urban Heat Mitigation',
        actions: [
          'Increase tree canopy coverage to 40%',
          'Install cool roofs and pavements',
          'Create cooling centers for vulnerable populations',
          'Implement building design standards for heat resilience'
        ],
        priority: 'high',
        timeline: '2-5 years'
      },
      {
        category: 'flood_protection',
        title: 'Flood Risk Management',
        actions: [
          'Upgrade stormwater infrastructure',
          'Create flood retention areas',
          'Implement early warning systems',
          'Develop evacuation plans for flood-prone areas'
        ],
        priority: 'high',
        timeline: '3-7 years'
      },
      {
        category: 'water_security',
        title: 'Water Resource Management',
        actions: [
          'Diversify water supply sources',
          'Implement water conservation programs',
          'Upgrade water treatment facilities',
          'Develop drought contingency plans'
        ],
        priority: 'medium',
        timeline: '5-10 years'
      },
      {
        category: 'ecosystem_resilience',
        title: 'Ecosystem Protection',
        actions: [
          'Restore native habitats',
          'Create wildlife corridors',
          'Protect wetlands and natural areas',
          'Implement invasive species management'
        ],
        priority: 'medium',
        timeline: '3-8 years'
      },
      {
        category: 'infrastructure_resilience',
        title: 'Critical Infrastructure Protection',
        actions: [
          'Harden electrical grid against extreme weather',
          'Upgrade transportation infrastructure',
          'Improve building codes for climate resilience',
          'Develop backup systems for essential services'
        ],
        priority: 'high',
        timeline: '5-15 years'
      }
    ],
    monitoring: {
      indicators: [
        'Temperature trends',
        'Precipitation patterns',
        'Extreme weather frequency',
        'Infrastructure performance',
        'Ecosystem health'
      ],
      frequency: 'Annual assessment with quarterly updates'
    }
  };
}

function generateHeatIslandAnalysis(lat, lng) {
  return {
    location: { lat: parseFloat(lat), lng: parseFloat(lng) },
    intensity: (Math.random() * 6 + 2).toFixed(1), // 2-8°C difference
    severity: ['moderate', 'high', 'severe'][Math.floor(Math.random() * 3)],
    contributing_factors: {
      building_density: Math.floor(Math.random() * 40) + 60, // 60-100%
      pavement_coverage: Math.floor(Math.random() * 30) + 50, // 50-80%
      green_space_deficit: Math.floor(Math.random() * 50) + 20, // 20-70%
      industrial_activity: Math.floor(Math.random() * 60) + 20, // 20-80%
      traffic_volume: Math.floor(Math.random() * 50) + 30 // 30-80%
    },
    hotspots: [
      {
        area: 'Downtown Commercial District',
        temperature_increase: (Math.random() * 4 + 4).toFixed(1),
        primary_cause: 'High building density and limited green space'
      },
      {
        area: 'Industrial Zone',
        temperature_increase: (Math.random() * 3 + 3).toFixed(1),
        primary_cause: 'Industrial heat emissions and paved surfaces'
      },
      {
        area: 'Major Highway Corridors',
        temperature_increase: (Math.random() * 2 + 2).toFixed(1),
        primary_cause: 'Traffic emissions and asphalt surfaces'
      }
    ],
    mitigation_potential: {
      tree_planting: '2-8°C reduction',
      green_roofs: '1-5°C reduction',
      cool_pavements: '1-3°C reduction',
      water_features: '2-6°C reduction'
    },
    health_impacts: {
      heat_related_illness: 'Increased risk during summer months',
      vulnerable_populations: 'Elderly, children, and outdoor workers',
      energy_demand: 'Higher cooling costs and peak demand'
    }
  };
}

function generateAirQualityImprovements(lat, lng) {
  return {
    location: { lat: parseFloat(lat), lng: parseFloat(lng) },
    current_aqi: Math.floor(Math.random() * 150) + 50, // 50-200
    pollutants: {
      pm25: (Math.random() * 30 + 10).toFixed(1),
      pm10: (Math.random() * 50 + 20).toFixed(1),
      no2: (Math.random() * 40 + 20).toFixed(1),
      o3: (Math.random() * 80 + 40).toFixed(1),
      so2: (Math.random() * 20 + 5).toFixed(1),
      co: (Math.random() * 10 + 2).toFixed(1)
    },
    sources: [
      { source: 'Vehicle emissions', contribution: '35%' },
      { source: 'Industrial activities', contribution: '25%' },
      { source: 'Power generation', contribution: '20%' },
      { source: 'Residential heating', contribution: '15%' },
      { source: 'Other sources', contribution: '5%' }
    ],
    improvements: [
      {
        strategy: 'Expand Public Transportation',
        impact: 'Reduce vehicle emissions by 20-30%',
        timeframe: '3-5 years',
        cost: 'High'
      },
      {
        strategy: 'Promote Electric Vehicles',
        impact: 'Reduce transportation emissions by 40-60%',
        timeframe: '5-10 years',
        cost: 'Medium'
      },
      {
        strategy: 'Industrial Emission Controls',
        impact: 'Reduce industrial pollution by 30-50%',
        timeframe: '2-4 years',
        cost: 'High'
      },
      {
        strategy: 'Urban Greening',
        impact: 'Natural air filtration, 10-20% improvement',
        timeframe: '2-3 years',
        cost: 'Low'
      },
      {
        strategy: 'Clean Energy Transition',
        impact: 'Reduce power sector emissions by 50-80%',
        timeframe: '10-15 years',
        cost: 'Very High'
      }
    ],
    monitoring: {
      stations: Math.floor(Math.random() * 10) + 5,
      frequency: 'Continuous monitoring with hourly updates',
      alerts: 'Automatic alerts when AQI exceeds unhealthy levels'
    },
    health_benefits: {
      respiratory_improvement: 'Reduced asthma and respiratory illness',
      cardiovascular_health: 'Lower risk of heart disease',
      life_expectancy: 'Potential increase of 1-3 years',
      healthcare_savings: '$500-2000 per person annually'
    }
  };
}

async function askGreenPolicyRAG(question) {
  const response = await fetch('/api/rag/green-policy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ question })
  });

  if (!response.ok) {
    throw new Error('Failed to get answer from RAG advisor');
  }

  const data = await response.json();
  return data.answer; // This is the Gemini-generated answer
}

router.get('/test', (req, res) => {
  res.send('genaiPoster route is working!');
});

module.exports = router;

