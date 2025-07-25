# Climate AI Application - File Structure

## Project Overview

This document provides a comprehensive overview of the Climate AI application's file structure, explaining the purpose and organization of each directory and key files.

## Root Directory Structure

```
climate-ai-app/
├── backend/                          # Node.js/Express backend server
├── frontend/                         # React frontend application
├── docs/                            # Additional documentation
├── scripts/                         # Utility scripts
├── .gitignore                       # Git ignore rules
├── README.md                        # Main project documentation
├── SETUP_GUIDE.md                   # Comprehensive setup instructions
├── API_DOCUMENTATION.md             # Complete API reference
├── FILE_STRUCTURE.md               # This file - project structure guide
├── LICENSE                         # MIT license
└── package.json                    # Root package configuration
```

## Backend Structure (`/backend`)

```
backend/
├── config/                         # Configuration files
│   ├── database.js                 # MongoDB connection configuration
│   ├── jwt.js                      # JWT token configuration
│   └── cors.js                     # CORS settings
├── middleware/                     # Express middleware
│   ├── auth.js                     # JWT authentication middleware
│   ├── validation.js               # Input validation middleware
│   ├── errorHandler.js             # Global error handling
│   └── rateLimiter.js              # API rate limiting
├── models/                         # MongoDB/Mongoose models
│   ├── User.js                     # User account model
│   ├── WeatherData.js              # Weather data model
│   ├── ClimateAnalysis.js          # Climate analysis model
│   ├── CarbonActivity.js           # Carbon footprint activity model
│   └── UrbanData.js                # Urban planning data model
├── routes/                         # API route definitions
│   ├── auth.js                     # Authentication routes (/auth)
│   ├── weather.js                  # Weather data routes (/weather)
│   ├── climate.js                  # Climate analysis routes (/climate)
│   ├── carbon.js                   # Carbon footprint routes (/carbon)
│   ├── urban.js                    # Urban planning routes (/urban)
│   ├── chat.js                     # AI chatbot routes (/chat)
│   └── alerts.js                   # Weather alerts routes (/alerts)
├── services/                       # External service integrations
│   ├── ibmWeatherService.js        # IBM Environmental Intelligence API
│   ├── ibmWatsonXService.js        # IBM WatsonX AI service
│   ├── ibmDiscoveryService.js      # IBM Watson Discovery service
│   └── notificationService.js      # Push notification service
├── utils/                          # Utility functions
│   ├── logger.js                   # Logging utility
│   ├── validators.js               # Data validation helpers
│   ├── encryption.js               # Encryption utilities
│   └── dateHelpers.js              # Date manipulation helpers
├── tests/                          # Backend tests
│   ├── unit/                       # Unit tests
│   ├── integration/                # Integration tests
│   └── fixtures/                   # Test data fixtures
├── logs/                           # Application logs
├── .env                            # Environment variables (not in git)
├── .env.example                    # Environment variables template
├── package.json                    # Backend dependencies
├── package-lock.json               # Locked dependency versions
└── server.js                       # Main server entry point
```

### Key Backend Files

#### `server.js`
Main application entry point that:
- Initializes Express server
- Sets up middleware
- Connects to MongoDB
- Defines API routes
- Starts the server

#### `models/User.js`
User model defining:
- User schema (name, email, password, preferences)
- Password hashing methods
- JWT token generation
- User validation rules

#### `routes/auth.js`
Authentication endpoints:
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Token refresh
- `POST /auth/logout` - User logout

#### `services/ibmWatsonXService.js`
IBM WatsonX integration:
- AI model initialization
- Natural language processing
- Climate data analysis
- Recommendation generation

## Frontend Structure (`/frontend/climate-ai-frontend`)

```
frontend/climate-ai-frontend/
├── public/                         # Static public assets
│   ├── index.html                  # Main HTML template
│   ├── favicon.ico                 # Application favicon
│   ├── manifest.json               # PWA manifest
│   └── robots.txt                  # Search engine instructions
├── src/                            # Source code
│   ├── components/                 # React components
│   │   ├── auth/                   # Authentication components
│   │   │   ├── Login.jsx           # Login form component
│   │   │   ├── Register.jsx        # Registration form component
│   │   │   └── ProtectedRoute.jsx  # Route protection component
│   │   ├── layout/                 # Layout components
│   │   │   ├── Navbar.jsx          # Navigation bar
│   │   │   ├── Sidebar.jsx         # Sidebar navigation
│   │   │   └── Footer.jsx          # Footer component
│   │   ├── dashboard/              # Dashboard components
│   │   │   ├── Dashboard.jsx       # Main dashboard
│   │   │   ├── ChartsPage.jsx      # Data visualization page
│   │   │   └── StatsCard.jsx       # Statistics card component
│   │   ├── weather/                # Weather components
│   │   │   ├── CurrentWeather.jsx  # Current weather display
│   │   │   ├── Forecast.jsx        # Weather forecast
│   │   │   └── WeatherMap.jsx      # Interactive weather map
│   │   ├── climate/                # Climate analysis components
│   │   │   ├── ClimateAnalysis.jsx # Climate data analysis
│   │   │   ├── TrendChart.jsx      # Climate trend visualization
│   │   │   └── RiskAssessment.jsx  # Climate risk assessment
│   │   ├── carbon/                 # Carbon footprint components
│   │   │   ├── CarbonTracker.jsx   # Carbon footprint tracker
│   │   │   ├── ActivityLogger.jsx  # Activity logging form
│   │   │   └── GoalSetting.jsx     # Carbon reduction goals
│   │   ├── urban/                  # Urban planning components
│   │   │   ├── UrbanPlanning.jsx   # Urban sustainability dashboard
│   │   │   ├── CityMetrics.jsx     # City sustainability metrics
│   │   │   └── ProjectTracker.jsx  # Urban project tracking
│   │   ├── chat/                   # AI chatbot components
│   │   │   ├── ChatBot.jsx         # Main chatbot interface
│   │   │   ├── MessageBubble.jsx   # Chat message component
│   │   │   └── ChatInput.jsx       # Chat input component
│   │   ├── alerts/                 # Alert system components
│   │   │   ├── WeatherAlerts.jsx   # Weather alert management
│   │   │   ├── AlertCard.jsx       # Individual alert display
│   │   │   └── NotificationCenter.jsx # Notification center
│   │   ├── charts/                 # Chart components
│   │   │   ├── WeatherChart.jsx    # Weather data charts
│   │   │   ├── CarbonChart.jsx     # Carbon footprint charts
│   │   │   ├── ClimateChart.jsx    # Climate analysis charts
│   │   │   └── ChartContainer.jsx  # Chart wrapper component
│   │   └── ui/                     # Reusable UI components
│   │       ├── Button.jsx          # Button component
│   │       ├── Card.jsx            # Card component
│   │       ├── Input.jsx           # Input component
│   │       ├── Modal.jsx           # Modal component
│   │       └── Loading.jsx         # Loading spinner
│   ├── context/                    # React context providers
│   │   ├── AuthContext.jsx         # Authentication context
│   │   ├── ThemeContext.jsx        # Theme/dark mode context
│   │   └── NotificationContext.jsx # Notification context
│   ├── hooks/                      # Custom React hooks
│   │   ├── useAuth.js              # Authentication hook
│   │   ├── useWeather.js           # Weather data hook
│   │   ├── useCarbon.js            # Carbon tracking hook
│   │   └── useNotifications.js     # Notifications hook
│   ├── services/                   # API service functions
│   │   ├── api.js                  # Main API client
│   │   ├── authService.js          # Authentication API calls
│   │   ├── weatherService.js       # Weather API calls
│   │   ├── carbonService.js        # Carbon tracking API calls
│   │   └── notificationService.js  # Notification service
│   ├── utils/                      # Utility functions
│   │   ├── formatters.js           # Data formatting utilities
│   │   ├── validators.js           # Form validation
│   │   ├── constants.js            # Application constants
│   │   └── helpers.js              # General helper functions
│   ├── styles/                     # Styling files
│   │   ├── globals.css             # Global styles
│   │   ├── components.css          # Component-specific styles
│   │   └── themes.css              # Theme definitions
│   ├── assets/                     # Static assets
│   │   ├── images/                 # Image files
│   │   ├── icons/                  # Icon files
│   │   ├── sounds/                 # Audio files (siren sounds)
│   │   │   ├── siren-alert.wav     # Weather alert siren
│   │   │   └── emergency-siren.wav # Emergency alert siren
│   │   └── fonts/                  # Custom fonts
│   ├── App.jsx                     # Main App component
│   ├── App.css                     # App-specific styles
│   ├── main.jsx                    # Application entry point
│   └── index.css                   # Base styles
├── .env.local                      # Frontend environment variables
├── .env.example                    # Environment variables template
├── package.json                    # Frontend dependencies
├── package-lock.json               # Locked dependency versions
├── vite.config.js                  # Vite configuration
├── tailwind.config.js              # Tailwind CSS configuration
├── postcss.config.js               # PostCSS configuration
└── index.html                      # HTML template
```

### Key Frontend Files

#### `src/App.jsx`
Main application component that:
- Sets up routing with React Router
- Provides authentication context
- Defines protected and public routes
- Handles global state management

#### `src/components/dashboard/Dashboard.jsx`
Main dashboard component featuring:
- Weather overview cards
- Carbon footprint summary
- Climate insights
- Quick action buttons
- Recent alerts and notifications

#### `src/services/api.js`
Central API client that:
- Configures axios instance
- Handles authentication headers
- Implements request/response interceptors
- Manages API error handling

#### `src/context/AuthContext.jsx`
Authentication context providing:
- User authentication state
- Login/logout functions
- Token management
- Protected route logic

## Documentation Structure (`/docs`)

```
docs/
├── api/                            # API documentation
│   ├── authentication.md           # Authentication endpoints
│   ├── weather.md                  # Weather API endpoints
│   ├── carbon.md                   # Carbon tracking endpoints
│   └── urban.md                    # Urban planning endpoints
├── deployment/                     # Deployment guides
│   ├── docker.md                   # Docker deployment
│   ├── aws.md                      # AWS deployment
│   ├── vercel.md                   # Vercel deployment
│   └── traditional.md              # Traditional server deployment
├── development/                    # Development guides
│   ├── getting-started.md          # Getting started guide
│   ├── coding-standards.md         # Coding standards
│   ├── testing.md                  # Testing guidelines
│   └── contributing.md             # Contribution guidelines
├── user-guides/                    # User documentation
│   ├── dashboard.md                # Dashboard usage
│   ├── carbon-tracking.md          # Carbon footprint tracking
│   ├── weather-alerts.md           # Weather alert system
│   └── ai-chatbot.md               # AI chatbot usage
└── troubleshooting/                # Troubleshooting guides
    ├── common-issues.md            # Common problems and solutions
    ├── api-errors.md               # API error troubleshooting
    └── deployment-issues.md        # Deployment troubleshooting
```

## Configuration Files

### Backend Configuration

#### `.env` (Backend Environment Variables)
```env
# Database
MONGODB_URI=mongodb://localhost:27017/climateai
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secure-jwt-secret

# IBM API Keys
IBM_WATSONX_API_KEY=your-watsonx-api-key
IBM_WATSONX_BASE_URL=https://us-south.ml.cloud.ibm.com
IBM_WATSONX_PROJECT_ID=your-project-id

# Server
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

#### `package.json` (Backend Dependencies)
Key dependencies:
- `express`: Web framework
- `mongoose`: MongoDB ODM
- `jsonwebtoken`: JWT authentication
- `bcryptjs`: Password hashing
- `cors`: Cross-origin resource sharing
- `helmet`: Security headers
- `morgan`: HTTP request logger

### Frontend Configuration

#### `.env.local` (Frontend Environment Variables)
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=Climate AI
VITE_APP_VERSION=1.0.0
```

#### `package.json` (Frontend Dependencies)
Key dependencies:
- `react`: UI framework
- `react-router-dom`: Client-side routing
- `axios`: HTTP client
- `recharts`: Data visualization
- `tailwindcss`: CSS framework
- `lucide-react`: Icon library

#### `vite.config.js` (Vite Configuration)
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
})
```

## Database Schema

### Collections Structure

#### Users Collection
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String (hashed),
  firstName: String,
  lastName: String,
  preferences: {
    units: String,
    notifications: Boolean,
    location: {
      lat: Number,
      lng: Number
    }
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### Weather Data Collection
```javascript
{
  _id: ObjectId,
  location: {
    name: String,
    lat: Number,
    lng: Number
  },
  current: {
    temperature: Number,
    humidity: Number,
    pressure: Number,
    windSpeed: Number,
    condition: String
  },
  timestamp: Date
}
```

#### Carbon Activities Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  category: String,
  activity: String,
  amount: Number,
  unit: String,
  emissions: Number,
  date: Date,
  createdAt: Date
}
```

## Build and Deployment Files

### Docker Configuration

#### `Dockerfile` (Backend)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

#### `Dockerfile` (Frontend)
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### `docker-compose.yml`
```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:5.0
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
    volumes:
      - mongodb_data:/data/db
    ports:
      - "27017:27017"

  backend:
    build: ./backend
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://admin:password@mongodb:27017/climateai?authSource=admin
    ports:
      - "5000:5000"
    depends_on:
      - mongodb

  frontend:
    build: ./frontend/climate-ai-frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mongodb_data:
```

## Testing Structure

### Backend Tests
```
backend/tests/
├── unit/
│   ├── models/
│   │   ├── User.test.js
│   │   └── WeatherData.test.js
│   ├── services/
│   │   ├── ibmWeatherService.test.js
│   │   └── ibmWatsonXService.test.js
│   └── utils/
│       └── validators.test.js
├── integration/
│   ├── auth.test.js
│   ├── weather.test.js
│   └── carbon.test.js
└── fixtures/
    ├── users.json
    └── weatherData.json
```

### Frontend Tests
```
frontend/climate-ai-frontend/src/tests/
├── components/
│   ├── Dashboard.test.jsx
│   ├── Login.test.jsx
│   └── CarbonTracker.test.jsx
├── hooks/
│   ├── useAuth.test.js
│   └── useWeather.test.js
├── services/
│   └── api.test.js
└── utils/
    └── formatters.test.js
```

## Scripts and Automation

### Package.json Scripts

#### Backend Scripts
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "db:seed": "node scripts/seedDatabase.js"
  }
}
```

#### Frontend Scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext js,jsx --fix"
  }
}
```

## Security Considerations

### File Security
- `.env` files are excluded from version control
- Sensitive configuration stored in environment variables
- API keys and secrets properly secured
- Input validation on all user inputs
- SQL injection prevention through parameterized queries

### Access Control
- JWT-based authentication
- Role-based authorization
- Rate limiting on API endpoints
- CORS configuration for cross-origin requests

## Performance Optimization

### Frontend Optimization
- Code splitting with React.lazy()
- Image optimization and lazy loading
- Bundle size optimization with Vite
- Caching strategies for API responses

### Backend Optimization
- Database indexing for frequently queried fields
- Response compression with gzip
- Connection pooling for database connections
- Caching with Redis (optional)

## Monitoring and Logging

### Log Files Structure
```
backend/logs/
├── app.log              # Application logs
├── error.log            # Error logs
├── access.log           # HTTP access logs
└── debug.log            # Debug information
```

### Monitoring Tools
- Application performance monitoring
- Error tracking and reporting
- Database performance monitoring
- API endpoint monitoring

---

This file structure documentation provides a comprehensive overview of the Climate AI application's organization. Each component is designed to be modular, maintainable, and scalable, following modern web development best practices.

