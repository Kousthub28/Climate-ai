// Netlify function for urban planning and city insights

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const segments = event.path.split('/').filter(Boolean);
    const endpoint = segments[segments.length - 1];

    if (endpoint === 'recommendations' && event.httpMethod === 'GET') {
      return handleUrbanRecommendations(event);
    } else if (endpoint === 'insights' && event.httpMethod === 'GET') {
      return handleCityInsights(event);
    } else if (endpoint === 'green-spaces' && event.httpMethod === 'GET') {
      return handleGreenSpaces(event);
    } else if (endpoint === 'sustainability' && event.httpMethod === 'GET') {
      return handleSustainability(event);
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Endpoint not found' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};

function handleUrbanRecommendations(event) {
  const { city } = event.queryStringParameters || {};

  const recommendations = [
    {
      id: '1',
      category: 'Transportation',
      title: 'Expand Public Transit',
      description: 'Increase metro/bus coverage to reduce car dependency',
      impact: 'Reduce CO2 by 25%',
      cost: 'High',
      timeline: '3-5 years'
    },
    {
      id: '2',
      category: 'Energy',
      title: 'Solar Panel Initiative',
      description: 'Promote rooftop solar installation for buildings',
      impact: 'Reduce emissions by 15%',
      cost: 'Medium',
      timeline: '1-2 years'
    },
    {
      id: '3',
      category: 'Green Space',
      title: 'Urban Forestry Program',
      description: 'Plant trees across the city for cooling and carbon sequestration',
      impact: 'Offset 5% of emissions',
      cost: 'Low',
      timeline: 'Ongoing'
    },
    {
      id: '4',
      category: 'Waste',
      title: 'Zero Waste Initiative',
      description: 'Implement composting and recycling programs',
      impact: 'Reduce waste by 40%',
      cost: 'Medium',
      timeline: '2 years'
    }
  ];

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      city: city || 'New York',
      recommendations,
      total_recommendations: recommendations.length
    })
  };
}

function handleCityInsights(event) {
  const { city } = event.queryStringParameters || {};

  const insights = {
    city: city || 'New York',
    population: '8.3M',
    area_sq_km: 783,
    carbon_emissions_mtco2_year: '60M',
    renewable_energy_percent: 35,
    public_transit_usage: '55%',
    green_space_percent: 14,
    air_quality_aqi: 'Moderate',
    water_quality: 'Good',
    key_metrics: {
      energy_efficiency_rank: 'B+',
      transportation_sustainability: 'A-',
      waste_management: 'B',
      green_infrastructure: 'B+',
      overall_score: 'B'
    },
    recent_initiatives: [
      'Carbon neutrality goal by 2050',
      'Ban on fossil fuel vehicles by 2035',
      'Expand green infrastructure',
      'Climate adaptation plans'
    ]
  };

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(insights)
  };
}

function handleGreenSpaces(event) {
  const { city } = event.queryStringParameters || {};

  const greenSpaces = [
    {
      id: '1',
      name: 'Central Park',
      type: 'Urban Forest',
      area_hectares: 341,
      trees: 'Approx 5,000',
      carbon_sequestered_tons_year: 2500,
      visitor_annual: '40M',
      biodiversity: 'High'
    },
    {
      id: '2',
      name: 'Hudson River Greenway',
      type: 'Linear Park',
      area_hectares: 288,
      trees: 'Approx 3,000',
      carbon_sequestered_tons_year: 1800,
      visitor_annual: '20M',
      biodiversity: 'Medium'
    },
    {
      id: '3',
      name: 'Brooklyn Bridge Park',
      type: 'Waterfront Park',
      area_hectares: 34,
      trees: 'Approx 500',
      carbon_sequestered_tons_year: 300,
      visitor_annual: '5M',
      biodiversity: 'High'
    }
  ];

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      city: city || 'New York',
      green_spaces: greenSpaces,
      total_green_area_hectares: 663,
      total_carbon_offset_tons_year: 4600
    })
  };
}

function handleSustainability(event) {
  const { city } = event.queryStringParameters || {};

  const sustainability = {
    city: city || 'New York',
    sdg_goals: [
      { goal: 'Clean Energy', progress: 35, target: 80 },
      { goal: 'Sustainable Cities', progress: 55, target: 100 },
      { goal: 'Climate Action', progress: 42, target: 100 },
      { goal: 'Responsible Consumption', progress: 48, target: 100 },
      { goal: 'Life on Land', progress: 38, target: 100 }
    ],
    certifications: [
      'Carbon Trust Standard',
      'ISO 14001',
      'B Corp Certified Districts'
    ],
    investments_billions: {
      renewable_energy: 2.5,
      green_infrastructure: 1.8,
      public_transport: 3.2,
      climate_adaptation: 0.9
    },
    estimated_co2_reduction_2030: '50%'
  };

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(sustainability)
  };
}
