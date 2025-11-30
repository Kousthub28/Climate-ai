// Netlify serverless function for RAG/Policy endpoints

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
    const { query } = JSON.parse(event.body || '{}');

    // Mock policies database
    const policies = {
      'green-policy': {
        title: 'Green Policy Initiative',
        description: 'Comprehensive environmental protection and sustainability measures',
        keyPoints: [
          'Reduce carbon emissions by 50% by 2030',
          'Increase renewable energy usage to 80%',
          'Protect 30% of land and ocean areas',
          'Support green jobs and sustainable industries'
        ]
      },
      'climate-action': {
        title: 'Climate Action Plan',
        description: 'Global framework for combating climate change',
        keyPoints: [
          'Net-zero emissions target by 2050',
          'Phase out coal by 2040',
          'Invest in climate resilience',
          'Support developing nations in transition'
        ]
      }
    };

    const policyKey = event.path.split('/').pop();
    const policy = policies[policyKey];

    if (!policy) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Policy not found' })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(policy)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
