import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import WeatherChart from '../charts/WeatherChart';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { weatherAPI } from '../../services/api';
import ChatBot from '../chat/ChatBot';
import { Sun, CloudRain, Cloud, Zap, Snowflake, Droplets } from 'lucide-react';

const DEFAULT_CITY = 'New York';
const DEFAULT_COUNTRY = 'US';
const DEFAULT_LAT = 40.7128;
const DEFAULT_LNG = -74.0060;

const WeatherPage = () => {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [city, setCity] = useState(DEFAULT_CITY);
  const [country, setCountry] = useState(DEFAULT_COUNTRY);
  const [lat, setLat] = useState(DEFAULT_LAT);
  const [lng, setLng] = useState(DEFAULT_LNG);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [localTime, setLocalTime] = useState(new Date());
  const [prevTemp, setPrevTemp] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [usingGeolocation, setUsingGeolocation] = useState(true);

  useEffect(() => {
    // Try geolocation on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude);
          setLng(pos.coords.longitude);
          setUsingGeolocation(true);
        },
        () => {
          // If denied, fallback to default
          setLat(DEFAULT_LAT);
          setLng(DEFAULT_LNG);
          setUsingGeolocation(false);
        }
      );
    } else {
      setLat(DEFAULT_LAT);
      setLng(DEFAULT_LNG);
      setUsingGeolocation(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(() => {
      fetchWeather();
    }, 60000); // 1 minute
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [lat, lng]);

  useEffect(() => {
    const timer = setInterval(() => {
      setLocalTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchWeather = async () => {
    setLoading(true);
    setError('');
    try {
      const currentRes = await weatherAPI.getCurrentWeather(lat, lng);
      setPrevTemp(currentWeather?.temperature ?? null);
      setCurrentWeather(currentRes.data.data.current);
      setCity(currentRes.data.data.location.city);
      setCountry(currentRes.data.data.location.country);
      setLastUpdated(new Date());
      const forecastRes = await weatherAPI.getForecast(lat, lng, city, country, 30);
      setForecast(forecastRes.data.data.forecast || []);
      const alertsRes = await weatherAPI.getAlerts(lat, lng);
      setAlerts(alertsRes.data.data.alerts || []);
    } catch (err) {
      setError('Failed to load weather data.');
    } finally {
      setLoading(false);
    }
  };

  const handleCitySearch = async (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setLoading(true);
    setError('');
    try {
      // Geocode city name to lat/lng
      const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchInput)}`);
      const geoData = await geoRes.json();
      if (geoData && geoData.length > 0) {
        setLat(parseFloat(geoData[0].lat));
        setLng(parseFloat(geoData[0].lon));
        setUsingGeolocation(false);
      } else {
        setError('City not found.');
      }
    } catch (err) {
      setError('Failed to search for city.');
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (desc) => {
    if (!desc) return <Cloud className="h-10 w-10 text-gray-400" />;
    const d = desc.toLowerCase();
    if (d.includes('sun') || d.includes('clear')) return <Sun className="h-10 w-10 text-yellow-400 animate-pulse" />;
    if (d.includes('rain')) return <CloudRain className="h-10 w-10 text-blue-400 animate-bounce" />;
    if (d.includes('storm') || d.includes('thunder')) return <Zap className="h-10 w-10 text-yellow-600 animate-pulse" />;
    if (d.includes('snow')) return <Snowflake className="h-10 w-10 text-blue-200 animate-spin" />;
    if (d.includes('cloud')) return <Cloud className="h-10 w-10 text-gray-400 animate-fadeIn" />;
    if (d.includes('humidity') || d.includes('mist') || d.includes('fog')) return <Droplets className="h-10 w-10 text-blue-300 animate-fadeIn" />;
    return <Cloud className="h-10 w-10 text-gray-400" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Weather Dashboard</h1>
        <form onSubmit={handleCitySearch} className="flex items-center gap-2 mb-4">
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search city..."
            className="border rounded px-3 py-2 text-sm"
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Search</button>
          <button type="button" className="ml-2 text-xs underline" onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition((pos) => {
                setLat(pos.coords.latitude);
                setLng(pos.coords.longitude);
                setUsingGeolocation(true);
                setSearchInput('');
              });
            }
          }}>Use My Location</button>
        </form>
        <div className="mb-2 text-sm text-gray-600 dark:text-gray-300">
          Showing weather for <span className="font-semibold">{city}, {country}</span> {usingGeolocation && '(using your location)'}
        </div>
        {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Current Weather */}
            {currentWeather && (
              <Card>
                <CardHeader>
                  <CardTitle>Current Weather in {city}, {country}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-8 items-center">
                    <div className="flex flex-col items-center">
                      {getWeatherIcon(currentWeather.description)}
                      <div className="text-4xl font-bold">{currentWeather.temperature}°C</div>
                      <div className="text-gray-600 dark:text-gray-300">{currentWeather.description}</div>
                      {prevTemp !== null && (
                        <div className="text-xs mt-1">
                          {currentWeather.temperature > prevTemp ? (
                            <span className="text-green-600">▲ Rising</span>
                          ) : currentWeather.temperature < prevTemp ? (
                            <span className="text-red-600">▼ Falling</span>
                          ) : (
                            <span className="text-gray-500">Stable</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div>Humidity: {currentWeather.humidity}%</div>
                      <div>Wind: {currentWeather.windSpeed} km/h</div>
                      <div>Pressure: {currentWeather.pressure} hPa</div>
                      <div>UV Index: {currentWeather.uvIndex}</div>
                      <div>Local Time: {localTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                      {lastUpdated && (
                        <div className="text-xs text-gray-500">Last updated: {lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            {/* Weather Forecast Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <WeatherChart data={forecast} type="temperature" timeRange="7days" />
              <WeatherChart data={forecast} type="temperature" timeRange="30days" />
            </div>
            {/* Weather Alerts */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-2">Weather Alerts</h2>
              {alerts.length === 0 ? (
                <div className="text-gray-500">No active alerts.</div>
              ) : (
                alerts.map((alert, idx) => (
                  <Alert key={idx} variant="destructive" className="mb-2">
                    <AlertDescription>{alert.title}: {alert.message}</AlertDescription>
                  </Alert>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WeatherPage; 