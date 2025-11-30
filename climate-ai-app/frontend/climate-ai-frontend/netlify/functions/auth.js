// Netlify serverless function for authentication endpoints - SIMPLIFIED
// Uses simple token generation instead of JWT to avoid dependencies

const JWT_SECRET = process.env.JWT_SECRET || 'climate-ai-secret-key-2024';

// CORS headers
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json'
};

// Mock user database (replace with MongoDB in production)
let mockUsers = {
  'test@example.com': {
    id: '1',
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User',
    created_at: new Date().toISOString(),
    profile: {
      bio: 'Testing Climate AI',
      avatar: '',
      location: 'Test City'
    },
    carbon_tracker: {
      daily: 0,
      weekly: 0,
      monthly: 0,
      yearly: 0
    }
  }
};

// Simple token generation (base64 encoded)
function generateToken(email, id) {
  const tokenData = JSON.stringify({ email, id, timestamp: Date.now() });
  return Buffer.from(tokenData).toString('base64');
}

// Verify token
function verifyToken(token) {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    return decoded;
  } catch {
    return null;
  }
}

exports.handler = async (event) => {
  const method = event.httpMethod;
  const path = event.path.split('/').pop();

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    if (path === 'register') {
      return handleRegister(event);
    } else if (path === 'login') {
      return handleLogin(event);
    } else if (path === 'me') {
      return handleGetProfile(event);
    } else if (path === 'profile' && method === 'PUT') {
      return handleUpdateProfile(event);
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

async function handleRegister(event) {
  const { email, password, name } = JSON.parse(event.body || '{}');

  if (!email || !password || !name) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Missing required fields: email, password, name' })
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
    password,
    name,
    created_at: new Date().toISOString(),
    profile: {
      bio: '',
      avatar: '',
      location: ''
    },
    carbon_tracker: {
      daily: 0,
      weekly: 0,
      monthly: 0,
      yearly: 0
    }
  };

  mockUsers[email] = newUser;
  const token = generateToken(email, newUser.id);

  return {
    statusCode: 201,
    headers,
    body: JSON.stringify({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        created_at: newUser.created_at
      },
      message: 'User registered successfully'
    })
  };
}

async function handleLogin(event) {
  const { email, password } = JSON.parse(event.body || '{}');

  if (!email || !password) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Email and password required' })
    };
  }

  const user = mockUsers[email];
  if (!user || user.password !== password) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Invalid email or password' })
    };
  }

  const token = generateToken(email, user.id);

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.created_at
      },
      message: 'Login successful'
    })
  };
}

async function handleGetProfile(event) {
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
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid token' })
      };
    }

    const user = mockUsers[decoded.email];
    if (!user) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'User not found' })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          profile: user.profile,
          carbon_tracker: user.carbon_tracker,
          created_at: user.created_at
        }
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

async function handleUpdateProfile(event) {
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
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid token' })
      };
    }

    const user = mockUsers[decoded.email];
    if (!user) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'User not found' })
      };
    }

    const { name, bio, avatar, location } = JSON.parse(event.body || '{}');

    if (name) user.name = name;
    if (bio !== undefined) user.profile.bio = bio;
    if (avatar) user.profile.avatar = avatar;
    if (location) user.profile.location = location;
    user.updated_at = new Date().toISOString();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Profile updated',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          profile: user.profile
        }
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
}

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
