// Netlify serverless function for authentication endpoints
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Mock database - replace with MongoDB later
const mockUsers = {
  'test@example.com': {
    id: '1',
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User'
  }
};

exports.handler = async (event) => {
  const method = event.httpMethod;
  const path = event.path.split('/').pop();

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    if (path === 'register') {
      return handleRegister(event, headers);
    } else if (path === 'login') {
      return handleLogin(event, headers);
    } else if (path === 'me') {
      return handleGetProfile(event, headers);
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }

  return {
    statusCode: 404,
    headers,
    body: JSON.stringify({ error: 'Not found' })
  };
};

async function handleRegister(event, headers) {
  const { email, password, name } = JSON.parse(event.body || '{}');

  if (!email || !password || !name) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Missing required fields' })
    };
  }

  // Check if user exists
  if (mockUsers[email]) {
    return {
      statusCode: 409,
      headers,
      body: JSON.stringify({ error: 'User already exists' })
    };
  }

  // Create new user
  const newUser = {
    id: Date.now().toString(),
    email,
    password, // In production, hash this!
    name
  };

  mockUsers[email] = newUser;

  const token = jwt.sign({ id: newUser.id, email }, JWT_SECRET, {
    expiresIn: '7d'
  });

  return {
    statusCode: 201,
    headers,
    body: JSON.stringify({
      token,
      user: { id: newUser.id, email, name }
    })
  };
}

async function handleLogin(event, headers) {
  const { email, password } = JSON.parse(event.body || '{}');

  if (!email || !password) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Missing email or password' })
    };
  }

  const user = mockUsers[email];
  if (!user || user.password !== password) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Invalid credentials' })
    };
  }

  const token = jwt.sign({ id: user.id, email }, JWT_SECRET, {
    expiresIn: '7d'
  });

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      token,
      user: { id: user.id, email: user.email, name: user.name }
    })
  };
}

async function handleGetProfile(event, headers) {
  const authHeader = event.headers.authorization;
  if (!authHeader) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'No token provided' })
    };
  }

  try {
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = mockUsers[decoded.email];

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        user: { id: user.id, email: user.email, name: user.name }
      })
    };
  } catch (error) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Invalid token' })
    };
  }
}
