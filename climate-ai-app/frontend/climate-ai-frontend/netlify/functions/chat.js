// Netlify serverless function for chat/AI endpoints
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { message, category } = JSON.parse(event.body || '{}');

    if (!message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Message is required' })
      };
    }

    // Mock response for testing
    const response = `This is a test response for: "${message}". In production, this would connect to Claude or another AI service.`;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        response,
        suggestion: 'Consider reducing your carbon footprint!'
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
