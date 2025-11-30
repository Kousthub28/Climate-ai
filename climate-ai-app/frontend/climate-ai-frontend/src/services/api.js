import axios from 'axios';

// Use /api path which will be handled by Netlify Functions in production
// In development, Vite proxy will handle it
const API_BASE_URL = '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwordData) => api.put('/auth/password', passwordData),
  getActivity: () => api.get('/auth/activity'),
};

// Weather API
export const weatherAPI = {
  getCurrentWeather: (lat, lng, city, country) => {
    let url = `/weather/current/${lat}/${lng}`;
    const params = [];
    if (city && city !== 'undefined') params.push(`city=${encodeURIComponent(city)}`);
    if (country && country !== 'undefined') params.push(`country=${encodeURIComponent(country)}`);
    if (params.length) url += '?' + params.join('&');
    return api.get(url);
  },
  getForecast: (lat, lng, city, country, days = 7) => 
    api.get(`/weather/forecast/${lat}/${lng}?city=${city}&country=${country}&days=${days}`),
  getAlerts: (lat, lng) => api.get(`/weather/alerts/${lat}/${lng}`),
  getHistory: (lat, lng, startDate, endDate, limit = 30) => 
    api.get(`/weather/history/${lat}/${lng}?startDate=${startDate}&endDate=${endDate}&limit=${limit}`),
  searchByCity: (cityName) => api.get(`/weather/search/${cityName}`),

};

// Climate API
export const climateAPI = {
  createAnalysis: (analysisData) => api.post('/climate/analyze', analysisData),
  getAnalysis: (analysisId) => api.get(`/climate/analysis/${analysisId}`),
  getHistory: (page = 1, limit = 10, analysisType) => 
    api.get(`/climate/history?page=${page}&limit=${limit}&analysisType=${analysisType}`),
  getTrends: (lat, lng, period = '1year') => 
    api.get(`/climate/trends/${lat}/${lng}?period=${period}`),
  getRiskAssessment: (lat, lng) => api.get(`/climate/risk/${lat}/${lng}`),
};

// Carbon API
export const carbonAPI = {
  calculate: (carbonData) => api.post('/carbon/calculate', carbonData),
  getHistory: (period = '30days') => api.get(`/carbon/history?period=${period}`),
  getInsights: () => api.get('/carbon/insights'),
  getTips: (category) => api.get(`/carbon/tips?category=${category}`),
  compare: () => api.get('/carbon/compare'),
};

// Urban API
export const urbanAPI = {
  getAnalysis: (lat, lng, radius = 5) => 
    api.get(`/urban/analysis/${lat}/${lng}?radius=${radius}`),
  getSustainabilityMetrics: (lat, lng) => 
    api.get(`/urban/sustainability/${lat}/${lng}`),
  getGreenInfrastructure: (lat, lng) => 
    api.get(`/urban/green-infrastructure/${lat}/${lng}`),
  getAdaptationStrategies: (lat, lng) => 
    api.get(`/urban/adaptation/${lat}/${lng}`),
  getHeatIslandAnalysis: (lat, lng) => 
    api.get(`/urban/heat-island/${lat}/${lng}`),
  getAirQualityImprovements: (lat, lng) => 
    api.get(`/urban/air-quality/${lat}/${lng}`),
};

// Chat API
export const chatAPI = {
  sendMessage: (message, context, conversationHistory) => api.post('/chat/message', { message, context, conversationHistory }),
  getHistory: (limit = 50) => api.get(`/chat/history?limit=${limit}`),
  getSuggestions: (category) => api.get(`/chat/suggestions?category=${category}`),
};

// Chart API
export const chartAPI = {
  generateChartSpec: (userData, cityData, question) =>
    api.post('/ai/chart-spec', { userData, cityData, question }),
};

// Alerts API
export const alertsAPI = {
  getAlerts: (lat, lng, severity) => 
    api.get(`/alerts/${lat}/${lng}?severity=${severity}`),
  subscribe: (subscriptionData) => api.post('/alerts/subscribe', subscriptionData),
  getPreferences: () => api.get('/alerts/preferences'),
  updatePreferences: (preferences) => api.put('/alerts/preferences', preferences),
  getHistory: (limit = 50, type) => 
    api.get(`/alerts/history?limit=${limit}&type=${type}`),
  sendTestAlert: (type, severity) => 
    api.post('/alerts/test', { type, severity }),
  dismissAlert: (alertId) => api.post(`/alerts/dismiss/${alertId}`),
};

// Poster GenAI API
export const posterAPI = {
  generatePoster: (userInput) => api.post('/genai-poster', { userInput }),
};

export default api;

