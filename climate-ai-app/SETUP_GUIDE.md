# Climate AI Application - Complete Setup Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [API Keys Setup](#api-keys-setup)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Running the Application](#running-the-application)
6. [Deployment](#deployment)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

Before setting up the Climate AI application, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **pnpm** (latest version)
- **MongoDB** (v5.0 or higher)
- **Git**

### System Requirements
- **Operating System**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 18.04+)
- **RAM**: Minimum 8GB, Recommended 16GB
- **Storage**: At least 2GB free space
- **Internet Connection**: Required for API calls and real-time data

## API Keys Setup

The Climate AI application requires several API keys to function properly. Follow these steps to obtain and configure them:

### 1. IBM Watson Services

#### IBM WatsonX API Key
1. Visit [IBM Cloud](https://cloud.ibm.com/)
2. Create an account or sign in
3. Navigate to **AI/Machine Learning** → **Watson Machine Learning**
4. Create a new service instance
5. Go to **Service Credentials** and create new credentials
6. Copy the **API Key** and **URL**

#### IBM Environmental Intelligence API Key
1. In IBM Cloud, navigate to **Environmental Intelligence Suite**
2. Create a new service instance
3. Generate service credentials
4. Copy the **API Key** and **Base URL**

#### IBM Watson Discovery API Key
1. Navigate to **AI/Machine Learning** → **Watson Discovery**
2. Create a new service instance
3. Create a new project
4. Copy the **API Key**, **URL**, and **Project ID**

### 2. Weather API (Alternative)
If you prefer using a different weather service:
- **OpenWeatherMap**: Visit [openweathermap.org](https://openweathermap.org/api)
- **WeatherAPI**: Visit [weatherapi.com](https://www.weatherapi.com/)

### 3. Environment Variables Configuration

Create a `.env` file in the `backend` directory with the following structure:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/climateai
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-here

# IBM API Keys
IBM_ENVIRONMENTAL_INTELLIGENCE_API_KEY=your-environmental-intelligence-api-key
IBM_ENVIRONMENTAL_INTELLIGENCE_BASE_URL=https://api.weather.com/v1

IBM_DATA_PREP_KIT_API_KEY=your-data-prep-kit-api-key
IBM_DATA_PREP_KIT_BASE_URL=https://api.dataplatform.cloud.ibm.com/v2

IBM_WATSONX_API_KEY=your-watsonx-api-key
IBM_WATSONX_BASE_URL=https://us-south.ml.cloud.ibm.com
IBM_WATSONX_PROJECT_ID=your-watsonx-project-id

IBM_WATSON_DISCOVERY_API_KEY=your-watson-discovery-api-key
IBM_WATSON_DISCOVERY_URL=https://api.us-south.discovery.watson.cloud.ibm.com
IBM_WATSON_DISCOVERY_PROJECT_ID=your-watson-discovery-project-id

# Optional: Alternative Weather APIs
OPENWEATHER_API_KEY=your-openweather-api-key
WEATHER_API_KEY=your-weather-api-key

# Server Configuration
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

**Important Security Notes:**
- Never commit the `.env` file to version control
- Use strong, unique JWT secrets in production
- Rotate API keys regularly
- Use environment-specific configurations

## Backend Setup

### 1. Navigate to Backend Directory
```bash
cd climate-ai-app/backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup

#### Option A: Local MongoDB
1. Install MongoDB Community Edition
2. Start MongoDB service:
   ```bash
   # On macOS with Homebrew
   brew services start mongodb-community
   
   # On Ubuntu
   sudo systemctl start mongod
   
   # On Windows
   net start MongoDB
   ```

#### Option B: MongoDB Atlas (Cloud)
1. Visit [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Get connection string and update `MONGODB_URI` in `.env`

### 4. Initialize Database
```bash
npm run db:seed
```

### 5. Start Backend Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The backend server will start on `http://localhost:5000`

## Frontend Setup

### 1. Navigate to Frontend Directory
```bash
cd climate-ai-app/frontend/climate-ai-frontend
```

### 2. Install Dependencies
```bash
# Using npm
npm install

# Using pnpm (recommended)
pnpm install
```

### 3. Environment Configuration
Create a `.env.local` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=Climate AI
VITE_APP_VERSION=1.0.0
```

### 4. Start Frontend Development Server
```bash
# Using npm
npm run dev

# Using pnpm
pnpm run dev
```

The frontend will start on `http://localhost:5173`

## Running the Application

### Development Mode

1. **Start Backend** (Terminal 1):
   ```bash
   cd climate-ai-app/backend
   npm run dev
   ```

2. **Start Frontend** (Terminal 2):
   ```bash
   cd climate-ai-app/frontend/climate-ai-frontend
   pnpm run dev
   ```

3. **Access Application**:
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000`
   - API Documentation: `http://localhost:5000/api-docs`

### Production Mode

1. **Build Frontend**:
   ```bash
   cd climate-ai-app/frontend/climate-ai-frontend
   pnpm run build
   ```

2. **Start Backend**:
   ```bash
   cd climate-ai-app/backend
   NODE_ENV=production npm start
   ```

## Deployment

### Option 1: Traditional Server Deployment

#### Backend Deployment
1. **Prepare Server**:
   - Ubuntu 20.04+ or similar
   - Node.js 18+
   - MongoDB
   - Nginx (optional, for reverse proxy)

2. **Deploy Backend**:
   ```bash
   # Clone repository
   git clone <your-repo-url>
   cd climate-ai-app/backend
   
   # Install dependencies
   npm ci --production
   
   # Set environment variables
   cp .env.example .env
   # Edit .env with production values
   
   # Start with PM2
   npm install -g pm2
   pm2 start ecosystem.config.js
   ```

3. **Deploy Frontend**:
   ```bash
   cd climate-ai-app/frontend/climate-ai-frontend
   pnpm install
   pnpm run build
   
   # Copy dist folder to web server
   cp -r dist/* /var/www/html/
   ```

### Option 2: Docker Deployment

1. **Create Docker Compose**:
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

2. **Deploy**:
   ```bash
   docker-compose up -d
   ```

### Option 3: Cloud Platform Deployment

#### Vercel (Frontend)
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

#### Railway/Render (Backend)
1. Connect GitHub repository
2. Set environment variables
3. Deploy with automatic scaling

## Troubleshooting

### Common Issues

#### 1. MongoDB Connection Error
```
Error: MongoNetworkError: failed to connect to server
```
**Solution**:
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify network connectivity

#### 2. API Key Authentication Error
```
Error: 401 Unauthorized - Invalid API key
```
**Solution**:
- Verify API keys in `.env` file
- Check API key permissions
- Ensure keys are not expired

#### 3. CORS Error
```
Access to fetch at 'http://localhost:5000' from origin 'http://localhost:5173' has been blocked by CORS policy
```
**Solution**:
- Check `CORS_ORIGIN` in backend `.env`
- Ensure frontend URL matches CORS configuration

#### 4. Build Errors
```
Module not found: Can't resolve '@/components/ui/card'
```
**Solution**:
- Run `pnpm install` to ensure all dependencies are installed
- Check import paths in components

#### 5. Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution**:
```bash
# Find process using port
lsof -i :5000

# Kill process
kill -9 <PID>

# Or use different port
PORT=5001 npm start
```

### Performance Optimization

#### Backend Optimization
- Enable MongoDB indexing
- Implement Redis caching
- Use compression middleware
- Optimize API queries

#### Frontend Optimization
- Enable code splitting
- Implement lazy loading
- Optimize images
- Use service workers

### Monitoring and Logging

#### Backend Monitoring
```bash
# Install monitoring tools
npm install winston morgan helmet

# View logs
pm2 logs
tail -f logs/app.log
```

#### Frontend Monitoring
- Use browser developer tools
- Implement error tracking (Sentry)
- Monitor performance metrics

### Security Considerations

1. **Environment Variables**:
   - Never expose API keys in frontend
   - Use different keys for development/production
   - Implement key rotation

2. **Authentication**:
   - Use strong JWT secrets
   - Implement refresh tokens
   - Add rate limiting

3. **Database Security**:
   - Enable MongoDB authentication
   - Use connection encryption
   - Regular backups

4. **Network Security**:
   - Use HTTPS in production
   - Implement CORS properly
   - Add security headers

## Support

For additional support:
1. Check the [FAQ section](./FAQ.md)
2. Review [API documentation](./API_DOCS.md)
3. Submit issues on GitHub
4. Contact support team

## Next Steps

After successful setup:
1. Explore the application features
2. Customize configurations
3. Add your own data sources
4. Implement additional AI features
5. Scale for production use

---

**Note**: This setup guide assumes basic familiarity with Node.js, React, and MongoDB. For beginners, consider reviewing the prerequisites and following online tutorials for these technologies.

