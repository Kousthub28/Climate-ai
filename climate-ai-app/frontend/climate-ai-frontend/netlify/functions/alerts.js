// Netlify function for alerts and notifications

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json'
};

// Mock alert storage (in production, use a database)
let mockAlerts = [
  {
    id: '1',
    type: 'weather',
    severity: 'high',
    title: 'Severe Weather Warning',
    message: 'Heavy rain expected in the next 6 hours',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    read: false
  },
  {
    id: '2',
    type: 'air_quality',
    severity: 'medium',
    title: 'Air Quality Alert',
    message: 'Air quality index has increased to unhealthy levels',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    read: false
  }
];

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const path = event.path.split('/').pop();

    if (path === 'alerts' && event.httpMethod === 'GET') {
      return handleGetAlerts(event);
    } else if (path === 'alerts' && event.httpMethod === 'POST') {
      return handleCreateAlert(event);
    } else if (event.path.includes('/alerts/') && event.httpMethod === 'PUT') {
      return handleUpdateAlert(event);
    } else if (event.path.includes('/alerts/') && event.httpMethod === 'DELETE') {
      return handleDeleteAlert(event);
    } else if (path === 'subscribe' && event.httpMethod === 'POST') {
      return handleSubscribe(event);
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Not found' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};

function handleGetAlerts(event) {
  const { userId, type, limit = 10 } = event.queryStringParameters || {};

  let filtered = mockAlerts;
  if (type) {
    filtered = filtered.filter(a => a.type === type);
  }

  const alerts = filtered.slice(0, parseInt(limit));

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      alerts,
      total: filtered.length,
      unread_count: filtered.filter(a => !a.read).length
    })
  };
}

function handleCreateAlert(event) {
  const { type, severity, title, message } = JSON.parse(event.body || '{}');

  const newAlert = {
    id: Date.now().toString(),
    type,
    severity,
    title,
    message,
    created_at: new Date().toISOString(),
    read: false
  };

  mockAlerts.unshift(newAlert);

  return {
    statusCode: 201,
    headers,
    body: JSON.stringify(newAlert)
  };
}

function handleUpdateAlert(event) {
  const segments = event.path.split('/');
  const alertId = segments[segments.length - 1];
  const { read } = JSON.parse(event.body || '{}');

  const alert = mockAlerts.find(a => a.id === alertId);
  if (!alert) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Alert not found' })
    };
  }

  alert.read = read;

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(alert)
  };
}

function handleDeleteAlert(event) {
  const segments = event.path.split('/');
  const alertId = segments[segments.length - 1];

  mockAlerts = mockAlerts.filter(a => a.id !== alertId);

  return {
    statusCode: 204,
    headers,
    body: ''
  };
}

function handleSubscribe(event) {
  const { email, types } = JSON.parse(event.body || '{}');

  return {
    statusCode: 201,
    headers,
    body: JSON.stringify({
      subscription_id: Date.now().toString(),
      email,
      types: types || ['weather', 'air_quality', 'climate'],
      status: 'active',
      created_at: new Date().toISOString()
    })
  };
}
