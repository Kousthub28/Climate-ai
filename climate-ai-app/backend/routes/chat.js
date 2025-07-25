const express = require('express');
const { auth, optionalAuth } = require('../middleware/auth');
const ibmWatsonXService = require('../services/ibmWatsonXService');

const router = express.Router();

// Chat with AI assistant
router.post('/message', optionalAuth, async (req, res) => {
  try {
    const { message, context, conversationHistory } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Get user context for personalized responses
    const userContext = req.user ? {
      userId: req.user._id,
      location: req.user.profile?.location,
      preferences: req.user.profile?.preferences
    } : {};

    // Use IBM WatsonX for AI responses
    const aiResponse = await ibmWatsonXService.chatWithAI(
      message, 
      conversationHistory || [], 
      userContext
    );

    // Generate contextual suggestions and actions
    const suggestions = generateContextualSuggestions(message, context);
    const actions = generateContextualActions(message, context);

    // Log user activity if authenticated
    if (req.user) {
      req.user.activityLog.push({
        action: 'chat_interaction',
        timestamp: new Date(),
        data: { 
          message: message.substring(0, 100),
          responseSource: aiResponse.source,
          confidence: aiResponse.confidence
        }
      });
      await req.user.save();
    }

    res.json({
      success: true,
      data: {
        response: aiResponse.text,
        confidence: aiResponse.confidence,
        source: aiResponse.source,
        suggestions,
        actions,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing chat message'
    });
  }
});

// Get specialized AI analysis
router.post('/analyze', auth, async (req, res) => {
  try {
    const { type, data, location } = req.body;

    let analysis;
    
    switch (type) {
      case 'weather':
        analysis = await ibmWatsonXService.generateWeatherInsights(data, location);
        break;
      case 'carbon':
        analysis = await ibmWatsonXService.generateCarbonRecommendations(data, req.user.profile);
        break;
      case 'climate_risk':
        analysis = await ibmWatsonXService.generateClimateRiskAssessment(location, data.timeframe);
        break;
      case 'urban_planning':
        analysis = await ibmWatsonXService.generateUrbanPlanningInsights(data, location);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid analysis type'
        });
    }

    // Log analysis request
    req.user.activityLog.push({
      action: 'ai_analysis_request',
      timestamp: new Date(),
      data: { type, confidence: analysis.confidence }
    });
    await req.user.save();

    res.json({
      success: true,
      data: {
        analysis: analysis.text,
        confidence: analysis.confidence,
        source: analysis.source,
        type,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('AI analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating AI analysis'
    });
  }
});

// Get chat history
router.get('/history', auth, async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    // Get chat interactions from user activity log
    const chatHistory = req.user.activityLog
      .filter(log => log.action === 'chat_interaction' || log.action === 'ai_analysis_request')
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: { history: chatHistory }
    });
  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching chat history'
    });
  }
});

// Get suggested questions
router.get('/suggestions', optionalAuth, async (req, res) => {
  try {
    const { category } = req.query;

    const suggestions = getClimateQuestionSuggestions(category);

    res.json({
      success: true,
      data: { suggestions }
    });
  } catch (error) {
    console.error('Chat suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching chat suggestions'
    });
  }
});

// Helper functions
function generateContextualSuggestions(message, context) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('weather') || lowerMessage.includes('temperature')) {
    return [
      "What's the weather forecast for this week?",
      "How does this weather compare to historical averages?",
      "What are the health impacts of current conditions?",
      "Should I be concerned about air quality today?"
    ];
  } else if (lowerMessage.includes('carbon') || lowerMessage.includes('footprint')) {
    return [
      "How can I reduce my transportation emissions?",
      "What's the impact of my energy usage?",
      "Compare my footprint to global averages",
      "What are the most effective reduction strategies?"
    ];
  } else if (lowerMessage.includes('climate') || lowerMessage.includes('risk')) {
    return [
      "What climate risks should I prepare for?",
      "How is climate change affecting my area?",
      "What adaptation strategies are recommended?",
      "Show me long-term climate projections"
    ];
  } else if (lowerMessage.includes('urban') || lowerMessage.includes('city')) {
    return [
      "How sustainable is my city?",
      "What green infrastructure is needed?",
      "How can urban planning address climate change?",
      "What are the air quality improvement options?"
    ];
  }
  
  return [
    "What can you help me with?",
    "Check the weather in my area",
    "Calculate my carbon footprint",
    "Analyze climate trends",
    "Show urban sustainability metrics"
  ];
}

function generateContextualActions(message, context) {
  const lowerMessage = message.toLowerCase();
  
  const actions = [];
  
  if (lowerMessage.includes('weather')) {
    actions.push(
      { type: 'weather_check', label: 'Check Current Weather', icon: 'cloud-rain' },
      { type: 'forecast', label: 'View 7-Day Forecast', icon: 'calendar' }
    );
  }
  
  if (lowerMessage.includes('carbon') || lowerMessage.includes('footprint')) {
    actions.push(
      { type: 'carbon_calculator', label: 'Calculate Footprint', icon: 'leaf' },
      { type: 'carbon_tips', label: 'Reduction Tips', icon: 'lightbulb' }
    );
  }
  
  if (lowerMessage.includes('climate') || lowerMessage.includes('risk')) {
    actions.push(
      { type: 'climate_analysis', label: 'Climate Analysis', icon: 'trending-up' },
      { type: 'risk_assessment', label: 'Risk Assessment', icon: 'alert-triangle' }
    );
  }
  
  if (lowerMessage.includes('urban') || lowerMessage.includes('city')) {
    actions.push(
      { type: 'urban_analysis', label: 'Urban Analysis', icon: 'building' },
      { type: 'sustainability_metrics', label: 'Sustainability Metrics', icon: 'bar-chart' }
    );
  }
  
  // Default actions if no specific context
  if (actions.length === 0) {
    actions.push(
      { type: 'weather_check', label: 'Weather Info', icon: 'cloud-rain' },
      { type: 'carbon_calculator', label: 'Carbon Calculator', icon: 'leaf' },
      { type: 'climate_analysis', label: 'Climate Analysis', icon: 'trending-up' }
    );
  }
  
  return actions;
}

function getClimateQuestionSuggestions(category) {
  const suggestions = {
    weather: [
      "What's the current weather in [city]?",
      "Show me the 7-day forecast",
      "Are there any weather alerts?",
      "How does today's weather compare to historical averages?",
      "What's the air quality like today?"
    ],
    climate: [
      "How has the climate changed in my area?",
      "What are the climate risks for my region?",
      "Show me temperature trends over the past decade",
      "What climate impacts should I prepare for?",
      "How do global climate patterns affect local weather?"
    ],
    carbon: [
      "Calculate my carbon footprint",
      "How can I reduce my emissions?",
      "What's the biggest source of my carbon footprint?",
      "Compare my footprint to the global average",
      "What are some easy ways to go carbon neutral?"
    ],
    urban: [
      "Analyze my city's sustainability metrics",
      "What green infrastructure does my area need?",
      "How can my city adapt to climate change?",
      "Show me the urban heat island effect",
      "What are the air quality improvement options?"
    ],
    sustainability: [
      "How can I live more sustainably?",
      "What are the best renewable energy options?",
      "How can I reduce waste in my daily life?",
      "What sustainable transportation options do I have?",
      "How can I make my home more energy efficient?"
    ]
  };

  return category ? suggestions[category] || suggestions.general : Object.values(suggestions).flat();
}

module.exports = router;

