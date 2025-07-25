import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Dashboard from './components/dashboard/Dashboard';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ChatBot from './components/chat/ChatBot';
import WeatherAlerts from './components/alerts/WeatherAlerts';
import ChartsPage from './components/dashboard/ChartsPage';
import CarbonTracker from './components/carbon/CarbonTracker';
import UrbanPlanning from './components/urban/UrbanPlanning';
import Profile from './components/profile/Profile';
import WeatherPage from './components/weather/WeatherPage';
import ClimateAnalysis from './components/climate/ClimateAnalysis';
import FloatingChatWidget from './components/chat/FloatingChatWidget';
import RagAdvisor from './components/rag/RagAdvisor';
import ClimatePosterDesigner from './components/poster/ClimatePosterDesigner';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Public Route Component (redirect to dashboard if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return isAuthenticated ? <Navigate to="/" /> : children;
};

// App Routes Component
const AppRoutes = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <Routes>
        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatBot />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/alerts"
          element={
            <ProtectedRoute>
              <WeatherAlerts />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/charts"
          element={
            <ProtectedRoute>
              <ChartsPage />
            </ProtectedRoute>
          }
        />
        
        {/* Placeholder routes for other features */}
        <Route
          path="/weather"
          element={
            <ProtectedRoute>
              <WeatherPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/climate"
          element={
            <ProtectedRoute>
              <ClimateAnalysis />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/carbon"
          element={
            <ProtectedRoute>
              <CarbonTracker />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/urban"
          element={
            <ProtectedRoute>
              <UrbanPlanning />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <div className="p-6">
                <h1 className="text-2xl font-bold">Settings</h1>
                <p>Settings page coming soon...</p>
              </div>
            </ProtectedRoute>
          }
        />

        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
};

// Main App Component
function App() {
  return (
    <AuthProvider>
      <ClimatePosterDesigner />
      <RagAdvisor />
      <Router>
        <AppRoutes />
        <FloatingChatWidget />
      </Router>
    </AuthProvider>
  );
}

export default App;

