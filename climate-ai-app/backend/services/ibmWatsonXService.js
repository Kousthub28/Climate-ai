const fetch = require('node-fetch');

// Hardcoded IBM watsonx.ai credentials (for testing)
const API_KEY = 'jpl8Kq906NWEv2sherKz0HOScZFP9E7WOXJGs9MpUSp0';
const ENDPOINT = 'https://us-south.ml.cloud.ibm.com';
const PROJECT_ID = 'f9853a0d-14ff-43c3-8dd8-2c8a1a19d06d';
// Use a supported model for your account
const MODEL_ID = 'google/flan-t5-xl';

class IBMWatsonXService {
  constructor() {
    this.apiKey = API_KEY;
    this.baseUrl = ENDPOINT;
    this.projectId = PROJECT_ID;
    this.modelId = MODEL_ID;
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  async getAccessToken() {
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }
    try {
      const response = await fetch('https://iam.cloud.ibm.com/identity/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: `grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=${this.apiKey}`
      });
      if (!response.ok) {
        throw new Error(`Token request failed: ${response.status}`);
      }
      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Refresh 1 minute early
      return this.accessToken;
    } catch (error) {
      console.error('Error getting access token:', error);
      throw error;
    }
  }

  async generateClimateAnalysis(prompt, context = {}) {
    try {
      const token = await this.getAccessToken();
      // For instruct models, use a plain text prompt
      const instructPrompt = prompt;
      const response = await fetch(`${this.baseUrl}/ml/v1/text/generation?version=2023-05-29`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          input: instructPrompt,
          parameters: {
            decoding_method: 'sample',
            top_p: 0.85,
            top_k: 50,
            temperature: 0.7,
            repetition_penalty: 1.05,
            max_new_tokens: 1500
          },
          model_id: this.modelId,
          project_id: this.projectId
        })
      });
      if (!response.ok) {
        let errorText = await response.text();
        console.error('WatsonX API error details:', errorText);
        throw new Error(`WatsonX API error: ${response.status}`);
      }
      const data = await response.json();
      let generatedText = data.results[0]?.generated_text || '';
      const genericResponses = ['hello.', 'chat:', '', null, undefined, 'chat is not supported on this device'];
      if (
        genericResponses.includes(generatedText.trim().toLowerCase()) ||
        generatedText.trim().length < 10
      ) {
        const fallback = this.getFallbackResponse(prompt, context);
        return {
          text: fallback.text,
          confidence: fallback.confidence,
          source: fallback.source
        };
      }
      return {
        text: generatedText,
        confidence: 0.9,
        source: 'IBM Granite-3-2-8b-Instruct'
      };
    } catch (error) {
      console.error('WatsonX generation error:', error);
      return this.getFallbackResponse(prompt, context);
    }
  }

  async generateWeatherInsights(weatherData, location) {
    const prompt = `Analyze the current weather conditions and provide insights:
    Location: ${location.city}, ${location.country}
    Temperature: ${weatherData.temperature}°C
    Humidity: ${weatherData.humidity}%
    Wind Speed: ${weatherData.windSpeed} km/h
    Condition: ${weatherData.condition}
    
    Provide insights about:
    1. Current conditions analysis
    2. Health and safety recommendations
    3. Environmental impact considerations
    4. Activity suggestions based on weather`;
    return await this.generateClimateAnalysis(prompt, { type: 'weather_analysis', location, weatherData });
  }

  async generateCarbonRecommendations(carbonData, userProfile) {
    // Implementation needed or leave as a stub
    return null;
  }

  async chatWithAI(message, conversationHistory = [], userContext = {}) {
    let contextSummary = '';
    if (userContext && userContext.weather) {
      contextSummary = `The current weather is ${userContext.weather.description}, temperature is ${userContext.weather.temperature}°C.`;
    }
    // Improved prompt for better answers
    const prompt = `You are a helpful weather assistant. ${contextSummary ? contextSummary + ' ' : ''}The user asked: ${message} Please answer in detail.`;
    const result = await this.generateClimateAnalysis(prompt, { type: 'chat' });
    return {
      text: result.text,
      confidence: result.confidence,
      source: result.source
    };
  }

  getFallbackResponse(prompt, context) {
    const fallbackResponses = {
      weather_analysis: {
        text: "I can help you understand weather patterns and their environmental impacts. Current conditions suggest monitoring for any weather alerts and considering energy-efficient practices based on temperature and humidity levels.",
        confidence: 0.6,
        source: 'Fallback Response'
      },
      carbon_analysis: {
        text: "Based on your carbon footprint data, I recommend focusing on the largest emission sources first. Transportation and energy use typically offer the greatest reduction opportunities through public transit, energy efficiency, and renewable energy adoption.",
        confidence: 0.6,
        source: 'Fallback Response'
      },
      risk_assessment: {
        text: "Climate risk assessment involves analyzing temperature trends, precipitation patterns, and extreme weather frequency. I recommend implementing adaptation strategies including improved infrastructure resilience and emergency preparedness.",
        confidence: 0.6,
        source: 'Fallback Response'
      },
      urban_planning: {
        text: "Urban sustainability can be improved through green infrastructure, efficient public transportation, renewable energy adoption, and increased green space. Focus on reducing urban heat islands and improving air quality.",
        confidence: 0.6,
        source: 'Fallback Response'
      },
      chat: {
        text: "I'm here to help with climate and environmental questions. I can analyze weather data, assess carbon footprints, evaluate climate risks, and provide sustainability recommendations. What would you like to know?",
        confidence: 0.6,
        source: 'Fallback Response'
      }
    };
    return fallbackResponses[context.type] || fallbackResponses.chat;
  }
}

module.exports = new IBMWatsonXService();
