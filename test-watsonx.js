const axios = require('axios');

const API_KEY = 'jpl8Kq906NWEv2sherKz0HOScZFP9E7WOXJGs9MpUSp0'; // <-- Replace with your actual API key
const ENDPOINT = 'https://us-south.ml.cloud.ibm.com';
const PROJECT_ID = 'f9853a0d-14ff-43c3-8dd8-2c8a1a19d06d'; // <-- Replace with your actual Project ID
const MODEL_ID = 'ibm/granite-13b-chat-v2'; // <-- IBM's own foundation model

async function testWatsonXPrompt() {
  try {
    // Get IAM token
    const tokenRes = await axios.post(
      'https://iam.cloud.ibm.com/identity/token',
      new URLSearchParams({
        'grant_type': 'urn:ibm:params:oauth:grant-type:apikey',
        'apikey': API_KEY
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    const token = tokenRes.data.access_token;

    // Run a prompt
    const response = await axios.post(
      `${ENDPOINT}/ml/v1/text/generation?version=2023-05-29`,
      {
        model_id: MODEL_ID,
        input: 'What is the weather like today?',
        project_id: PROJECT_ID
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('Success:', response.data);
  } catch (error) {
    if (error.response) {
      console.error('Error:', error.response.status, error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testWatsonXPrompt(); 