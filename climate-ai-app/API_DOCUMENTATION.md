# Climate AI Application - API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Base URLs](#base-urls)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [API Endpoints](#api-endpoints)
7. [Data Models](#data-models)
8. [Examples](#examples)

## Overview

The Climate AI API provides comprehensive endpoints for weather data, climate analysis, carbon footprint tracking, urban planning insights, and AI-powered recommendations. The API follows RESTful principles and returns JSON responses.

### API Version
- **Current Version**: v1
- **Base Path**: `/api/v1`
- **Content Type**: `application/json`

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header for protected endpoints.

### Authentication Flow

1. **Register/Login**: Obtain JWT token
2. **Include Token**: Add to Authorization header
3. **Token Refresh**: Refresh expired tokens

### Headers
```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

## Base URLs

- **Development**: `http://localhost:5000/api/v1`
- **Production**: `https://your-domain.com/api/v1`

## Error Handling

The API returns standard HTTP status codes and structured error responses.

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "Additional error details (optional)"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## Rate Limiting

API requests are rate-limited to ensure fair usage:

- **Authenticated Users**: 1000 requests/hour
- **Anonymous Users**: 100 requests/hour
- **Premium Users**: 5000 requests/hour

Rate limit headers are included in responses:
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642248600
```

## API Endpoints

### Authentication Endpoints

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "username": "johndoe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "token": "jwt_token_here"
  }
}
```

#### POST /auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "username": "johndoe",
      "email": "john@example.com"
    },
    "token": "jwt_token_here"
  }
}
```

#### POST /auth/refresh
Refresh expired JWT token.

**Headers:**
```http
Authorization: Bearer <expired-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "new_jwt_token_here"
  }
}
```

### Weather Endpoints

#### GET /weather/current
Get current weather data for a location.

**Query Parameters:**
- `lat` (required): Latitude
- `lng` (required): Longitude
- `units` (optional): `metric`, `imperial`, `kelvin` (default: `metric`)

**Example Request:**
```http
GET /api/v1/weather/current?lat=40.7128&lng=-74.0060&units=metric
```

**Response:**
```json
{
  "success": true,
  "data": {
    "location": {
      "name": "New York",
      "country": "US",
      "lat": 40.7128,
      "lng": -74.0060
    },
    "current": {
      "temperature": 22.5,
      "humidity": 65,
      "pressure": 1013.2,
      "windSpeed": 12.5,
      "windDirection": 180,
      "visibility": 10,
      "uvIndex": 6,
      "condition": "partly_cloudy",
      "description": "Partly cloudy"
    },
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

#### GET /weather/forecast
Get weather forecast for a location.

**Query Parameters:**
- `lat` (required): Latitude
- `lng` (required): Longitude
- `days` (optional): Number of forecast days (1-10, default: 5)
- `units` (optional): `metric`, `imperial`, `kelvin`

**Response:**
```json
{
  "success": true,
  "data": {
    "location": {
      "name": "New York",
      "country": "US"
    },
    "forecast": [
      {
        "date": "2024-01-15",
        "temperature": {
          "min": 18,
          "max": 25,
          "avg": 21.5
        },
        "humidity": 70,
        "precipitation": 2.5,
        "windSpeed": 15,
        "condition": "light_rain"
      }
    ]
  }
}
```

#### GET /weather/historical
Get historical weather data.

**Query Parameters:**
- `lat` (required): Latitude
- `lng` (required): Longitude
- `startDate` (required): Start date (YYYY-MM-DD)
- `endDate` (required): End date (YYYY-MM-DD)

### Climate Analysis Endpoints

#### GET /climate/analysis
Get climate analysis for a region.

**Query Parameters:**
- `lat` (required): Latitude
- `lng` (required): Longitude
- `timeRange` (optional): `1year`, `5years`, `10years`, `50years`
- `metrics` (optional): Comma-separated list of metrics

**Response:**
```json
{
  "success": true,
  "data": {
    "location": {
      "name": "New York",
      "region": "Northeast US"
    },
    "analysis": {
      "temperatureTrend": {
        "change": 1.2,
        "unit": "°C",
        "period": "10 years",
        "trend": "warming"
      },
      "precipitationTrend": {
        "change": 5.8,
        "unit": "%",
        "period": "10 years",
        "trend": "increasing"
      },
      "extremeEvents": {
        "heatWaves": {
          "frequency": 12,
          "change": "+40%"
        },
        "heavyRain": {
          "frequency": 8,
          "change": "+25%"
        }
      }
    }
  }
}
```

#### POST /climate/predict
Generate climate predictions using AI.

**Request Body:**
```json
{
  "location": {
    "lat": 40.7128,
    "lng": -74.0060
  },
  "timeHorizon": "2050",
  "scenarios": ["rcp45", "rcp85"],
  "metrics": ["temperature", "precipitation", "sea_level"]
}
```

### Carbon Footprint Endpoints

#### GET /carbon/footprint
Get user's carbon footprint data.

**Headers:**
```http
Authorization: Bearer <token>
```

**Query Parameters:**
- `period` (optional): `daily`, `weekly`, `monthly`, `yearly`
- `category` (optional): Filter by category

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "daily": 6.2,
      "weekly": 43.4,
      "monthly": 186.5,
      "yearly": 2238.0
    },
    "breakdown": {
      "transportation": 2.5,
      "energy": 1.8,
      "diet": 1.2,
      "waste": 0.3,
      "consumption": 0.4
    },
    "targets": {
      "daily": 5.0,
      "monthly": 150.0,
      "yearly": 1800.0
    }
  }
}
```

#### POST /carbon/activity
Add a carbon-generating activity.

**Request Body:**
```json
{
  "category": "transportation",
  "activity": "car-petrol",
  "amount": 25.5,
  "unit": "km",
  "date": "2024-01-15",
  "notes": "Daily commute"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "activity_id",
    "emissions": 5.36,
    "unit": "kg CO2e",
    "category": "transportation"
  }
}
```

#### GET /carbon/recommendations
Get personalized carbon reduction recommendations.

**Response:**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "id": "rec_1",
        "title": "Use Public Transport",
        "category": "transportation",
        "description": "Taking public transport instead of driving can reduce your daily emissions by up to 2.3 kg CO₂e.",
        "impact": "high",
        "effort": "low",
        "savings": 2.3,
        "priority": 1
      }
    ]
  }
}
```

### Urban Planning Endpoints

#### GET /urban/city/:cityId
Get urban sustainability data for a city.

**Path Parameters:**
- `cityId`: City identifier

**Response:**
```json
{
  "success": true,
  "data": {
    "city": {
      "id": "nyc",
      "name": "New York City",
      "population": 8400000,
      "area": 783
    },
    "sustainability": {
      "score": 72,
      "rank": 15,
      "categories": {
        "energy": 78,
        "transportation": 65,
        "waste": 80,
        "greenSpace": 68,
        "airQuality": 70,
        "waterManagement": 75
      }
    },
    "infrastructure": {
      "greenBuildings": 1250,
      "renewableEnergy": 35,
      "publicTransport": 85,
      "recyclingRate": 67
    }
  }
}
```

#### GET /urban/recommendations/:cityId
Get AI-powered urban planning recommendations.

**Response:**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "id": "urban_rec_1",
        "title": "Implement Smart Grid Technology",
        "category": "energy",
        "priority": "high",
        "description": "Deploy smart grid infrastructure to optimize energy distribution.",
        "benefits": ["20% energy savings", "Improved reliability"],
        "cost": 1200000000,
        "timeline": "3-4 years",
        "co2Reduction": 150000
      }
    ]
  }
}
```

### Chat/AI Endpoints

#### POST /chat/message
Send message to AI chatbot.

**Request Body:**
```json
{
  "message": "What's the current air quality in New York?",
  "context": {
    "location": {
      "lat": 40.7128,
      "lng": -74.0060
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "The current air quality in New York is moderate with an AQI of 65. This is acceptable for most people, but sensitive individuals should consider limiting prolonged outdoor activities.",
    "sources": ["EPA AirNow", "Local monitoring stations"],
    "confidence": 0.92
  }
}
```

### Alerts Endpoints

#### GET /alerts/weather
Get weather alerts for a location.

**Query Parameters:**
- `lat` (required): Latitude
- `lng` (required): Longitude
- `severity` (optional): Minimum severity level

**Response:**
```json
{
  "success": true,
  "data": {
    "alerts": [
      {
        "id": "alert_1",
        "type": "thunderstorm",
        "title": "Severe Thunderstorm Warning",
        "message": "Severe thunderstorms with heavy rain and strong winds expected.",
        "severity": "high",
        "location": "New York, NY",
        "issued": "2024-01-15T10:00:00Z",
        "expires": "2024-01-15T18:00:00Z",
        "active": true
      }
    ]
  }
}
```

## Data Models

### User Model
```json
{
  "id": "string",
  "username": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "preferences": {
    "units": "metric|imperial",
    "notifications": "boolean",
    "location": {
      "lat": "number",
      "lng": "number"
    }
  },
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Weather Data Model
```json
{
  "location": {
    "name": "string",
    "country": "string",
    "lat": "number",
    "lng": "number"
  },
  "current": {
    "temperature": "number",
    "humidity": "number",
    "pressure": "number",
    "windSpeed": "number",
    "windDirection": "number",
    "visibility": "number",
    "uvIndex": "number",
    "condition": "string",
    "description": "string"
  },
  "timestamp": "datetime"
}
```

### Carbon Activity Model
```json
{
  "id": "string",
  "userId": "string",
  "category": "transportation|energy|diet|waste|consumption",
  "activity": "string",
  "amount": "number",
  "unit": "string",
  "emissions": "number",
  "date": "date",
  "notes": "string",
  "createdAt": "datetime"
}
```

## Examples

### Complete Authentication Flow

```javascript
// Register new user
const registerResponse = await fetch('/api/v1/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    firstName: 'John',
    lastName: 'Doe',
    username: 'johndoe',
    email: 'john@example.com',
    password: 'securePassword123'
  })
});

const { data } = await registerResponse.json();
const token = data.token;

// Use token for authenticated requests
const weatherResponse = await fetch('/api/v1/weather/current?lat=40.7128&lng=-74.0060', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Carbon Footprint Tracking

```javascript
// Add transportation activity
const activityResponse = await fetch('/api/v1/carbon/activity', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    category: 'transportation',
    activity: 'car-petrol',
    amount: 25.5,
    unit: 'km',
    date: '2024-01-15'
  })
});

// Get footprint summary
const footprintResponse = await fetch('/api/v1/carbon/footprint', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### AI Chat Integration

```javascript
// Send message to AI chatbot
const chatResponse = await fetch('/api/v1/chat/message', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: 'How can I reduce my carbon footprint?',
    context: {
      location: { lat: 40.7128, lng: -74.0060 }
    }
  })
});

const { data } = await chatResponse.json();
console.log(data.response);
```

## SDK and Libraries

### JavaScript/Node.js SDK

```javascript
import ClimateAI from 'climate-ai-sdk';

const client = new ClimateAI({
  apiKey: 'your-api-key',
  baseURL: 'https://api.climate-ai.com/v1'
});

// Get weather data
const weather = await client.weather.getCurrent({
  lat: 40.7128,
  lng: -74.0060
});

// Track carbon activity
const activity = await client.carbon.addActivity({
  category: 'transportation',
  activity: 'car-petrol',
  amount: 25.5,
  unit: 'km'
});
```

### Python SDK

```python
from climate_ai import ClimateAI

client = ClimateAI(api_key='your-api-key')

# Get weather data
weather = client.weather.get_current(lat=40.7128, lng=-74.0060)

# Track carbon activity
activity = client.carbon.add_activity(
    category='transportation',
    activity='car-petrol',
    amount=25.5,
    unit='km'
)
```

## Webhooks

The API supports webhooks for real-time notifications:

### Weather Alerts Webhook
```json
{
  "event": "weather.alert.created",
  "data": {
    "alert": {
      "id": "alert_123",
      "type": "thunderstorm",
      "severity": "high",
      "location": {
        "lat": 40.7128,
        "lng": -74.0060
      }
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Carbon Goal Achievement Webhook
```json
{
  "event": "carbon.goal.achieved",
  "data": {
    "user": "user_123",
    "goal": "monthly_target",
    "achievement": {
      "target": 150.0,
      "actual": 148.5,
      "reduction": 1.0
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Support

For API support:
- **Documentation**: [https://docs.climate-ai.com](https://docs.climate-ai.com)
- **Status Page**: [https://status.climate-ai.com](https://status.climate-ai.com)
- **Support Email**: api-support@climate-ai.com
- **GitHub Issues**: [https://github.com/climate-ai/api/issues](https://github.com/climate-ai/api/issues)

---

**API Version**: 1.0.0  
**Last Updated**: January 15, 2024  
**Next Update**: February 15, 2024

