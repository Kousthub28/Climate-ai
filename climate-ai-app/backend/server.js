const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { fetchAndSendSevereWeatherAlerts } = require('./services/weatherAlertFetcher');
const alertSoundService = require('./services/alertSoundService');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/weather', require('./routes/weather'));
app.use('/api/climate', require('./routes/climate'));
app.use('/api/carbon', require('./routes/carbon'));
app.use('/api/urban', require('./routes/urban'));
app.use('/api/chat', require('./routes/chat'));
const alertsRouter = require('./routes/alerts');
app.use('/api/alerts', alertsRouter);
app.use('/api/ai', require('./routes/ai'));
const ragRoutes = require('./routes/rag');
app.use('/api/rag', ragRoutes);
app.use('/api', require('./routes/genaiPoster'));

// Schedule periodic weather alert fetching (every 10 minutes)
setInterval(fetchAndSendSevereWeatherAlerts, 10 * 60 * 1000);
// Optionally, run once on startup
fetchAndSendSevereWeatherAlerts();

// Schedule weather alert sound checking (every 5 minutes)
const monitoredLocations = [
  { name: 'New York', lat: 40.7128, lng: -74.0060 },
  { name: 'London', lat: 51.5074, lng: -0.1278 },
  { name: 'Tokyo', lat: 35.6762, lng: 139.6503 },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
  { name: 'Sydney', lat: -33.8688, lng: 151.2093 }
];

setInterval(async () => {
  try {
    for (const location of monitoredLocations) {
      await alertSoundService.checkWeatherAlerts(location);
    }
  } catch (error) {
    console.error('Scheduled weather alert sound check failed:', error);
  }
}, 5 * 60 * 1000);

// Run weather alert sound check once on startup
(async () => {
  try {
    for (const location of monitoredLocations) {
      await alertSoundService.checkWeatherAlerts(location);
    }
  } catch (error) {
    console.error('Startup weather alert sound check failed:', error);
  }
})();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Climate AI Backend is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler (must be last)
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = 5050;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

