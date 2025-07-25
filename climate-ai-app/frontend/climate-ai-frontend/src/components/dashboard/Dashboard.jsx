import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CloudRain,
  TrendingUp,
  Leaf,
  Building,
  AlertTriangle,
  Thermometer,
  Droplets,
  Wind,
  Eye,
  MapPin,
  Calendar,
  Activity,
} from 'lucide-react';
import { weatherAPI, carbonAPI, climateAPI, alertsAPI, urbanAPI } from '../../services/api';
import '../../App.css';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    weather: null,
    carbon: null,
    urban: null,
    alerts: [],
    loading: true,
  });

  useEffect(() => {
    let intervalId;
    const fetchAllData = async () => {
      try {
        // Use user location if available, else default
        const lat = user?.profile?.location?.lat || 40.7128;
        const lng = user?.profile?.location?.lng || -74.0060;
        const city = user?.profile?.location?.city || 'New York';
        const country = user?.profile?.location?.country || 'US';

        const [weatherRes, carbonRes, alertsRes, urbanRes] = await Promise.allSettled([
          weatherAPI.getCurrentWeather(lat, lng, city, country),
          carbonAPI.getHistory('7days'),
          alertsAPI.getAlerts(lat, lng),
          urbanAPI.getSustainabilityMetrics(lat, lng),
        ]);

        setDashboardData(prev => ({
          ...prev,
          weather: weatherRes.status === 'fulfilled' ? weatherRes.value.data.data : null,
          carbon: carbonRes.status === 'fulfilled' ? carbonRes.value.data.data : null,
          urban: urbanRes.status === 'fulfilled' ? urbanRes.value.data : null,
          alerts: alertsRes.status === 'fulfilled' ? alertsRes.value.data.data.alerts : [],
          loading: false,
        }));
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setDashboardData(prev => ({ ...prev, loading: false }));
      }
    };
    fetchAllData();
    intervalId = setInterval(fetchAllData, 60000); // 1 minute
    return () => clearInterval(intervalId);
  }, [user]);

  const { weather, carbon, alerts, loading } = dashboardData;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back, {user?.profile?.firstName || user?.username}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Here's your climate and environmental overview
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="h-4 w-4" />
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-orange-800 dark:text-orange-200">
                <AlertTriangle className="h-5 w-5" />
                <span>Active Alerts</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.slice(0, 3).map((alert, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="text-2xl">{alert.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-medium text-orange-800 dark:text-orange-200">
                        {alert.title}
                      </h4>
                      <p className="text-sm text-orange-700 dark:text-orange-300">
                        {alert.message}
                      </p>
                    </div>
                    <Badge variant={alert.severity === 'high' ? 'destructive' : 'secondary'}>
                      {alert.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Weather Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Weather</CardTitle>
              <CloudRain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {weather?.current?.temperature?.toFixed(1) || '--'}°C
              </div>
              <p className="text-xs text-muted-foreground">
                {weather?.current?.condition || 'Loading...'}
              </p>
              <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Droplets className="h-3 w-3" />
                  <span>{weather?.current?.humidity || '--'}%</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Wind className="h-3 w-3" />
                  <span>{weather?.current?.windSpeed || '--'} km/h</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Carbon Footprint Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Carbon Footprint</CardTitle>
              <Leaf className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {carbon?.current?.daily?.toFixed(1) || '--'} kg
              </div>
              <p className="text-xs text-muted-foreground">CO₂e today</p>
              <div className="mt-2">
                {carbon?.stats?.trend === 'decreasing' ? (
                  <Badge variant="secondary" className="text-green-600 bg-green-100">
                    ↓ Improving
                  </Badge>
                ) : carbon?.stats?.trend === 'increasing' ? (
                  <Badge variant="secondary" className="text-red-600 bg-red-100">
                    ↑ Increasing
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    → Stable
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Climate Risk Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Climate Risk</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">Medium</div>
              <p className="text-xs text-muted-foreground">Overall risk level</p>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Heat Risk</span>
                  <Badge variant="secondary" className="text-orange-600">High</Badge>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Flood Risk</span>
                  <Badge variant="secondary" className="text-green-600">Low</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Air Quality Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Air Quality</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Good</div>
              <p className="text-xs text-muted-foreground">AQI: 45</p>
              <div className="mt-2">
                <Badge variant="secondary" className="text-green-600 bg-green-100">
                  Healthy
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Urban Planning (Sustainability Metrics) Card */}
          {dashboardData.urban && (
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Urban Sustainability</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData.urban.overallScore || '--'} / 100
                </div>
                <p className="text-xs text-muted-foreground mb-2">Overall Sustainability Score</p>
                <div className="space-y-1 text-xs">
                  {dashboardData.urban.categories && Object.entries(dashboardData.urban.categories).map(([cat, val]) => (
                    <div key={cat} className="flex justify-between">
                      <span className="capitalize">{cat}</span>
                      <span>{val.score || '--'} / 100</span>
                    </div>
                  ))}
                </div>
                {dashboardData.urban.trends && (
                  <div className="mt-2 text-xs">
                    <span className="font-medium">Trends: </span>
                    {dashboardData.urban.trends.improving?.length > 0 && (
                      <span className="text-green-600">Improving: {dashboardData.urban.trends.improving.join(', ')}</span>
                    )}
                    {dashboardData.urban.trends.stable?.length > 0 && (
                      <span className="ml-2 text-yellow-600">Stable: {dashboardData.urban.trends.stable.join(', ')}</span>
                    )}
                    {dashboardData.urban.trends.declining?.length > 0 && (
                      <span className="ml-2 text-red-600">Declining: {dashboardData.urban.trends.declining.join(', ')}</span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weather Forecast */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CloudRain className="h-5 w-5" />
                <span>7-Day Forecast</span>
              </CardTitle>
              <CardDescription>Weather outlook for the week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weather?.forecast?.slice(0, 7).map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{day.icon === '30' ? '⛅' : '🌤️'}</div>
                      <div>
                        <p className="font-medium">
                          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </p>
                        <p className="text-sm text-muted-foreground">{day.condition}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {day.temperature?.max?.toFixed(0)}° / {day.temperature?.min?.toFixed(0)}°
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {day.precipitation?.toFixed(0)}% rain
                      </p>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8 text-muted-foreground">
                    <CloudRain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Weather forecast will appear here</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Quick Actions</span>
              </CardTitle>
              <CardDescription>Common tasks and tools</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" size="sm" onClick={() => navigate('/carbon')}>
                <Leaf className="mr-2 h-4 w-4" />
                Calculate Carbon Footprint
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm" onClick={() => navigate('/charts')}>
                <TrendingUp className="mr-2 h-4 w-4" />
                Analyze Climate Trends
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm" onClick={() => navigate('/urban')}>
                <Building className="mr-2 h-4 w-4" />
                Urban Planning Tools
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm" onClick={() => navigate('/climate')}>
                <MapPin className="mr-2 h-4 w-4" />
                Set Location Preferences
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest interactions with Climate AI</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Weather check for New York</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Carbon footprint calculated</p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Climate analysis requested</p>
                  <p className="text-xs text-muted-foreground">3 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

