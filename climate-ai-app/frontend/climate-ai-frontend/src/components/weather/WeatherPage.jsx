import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import WeatherChart from '../charts/WeatherChart';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { weatherAPI } from '../../services/api';
import ChatBot from '../chat/ChatBot';
import { Sun, CloudRain, Cloud, Zap, Snowflake, Droplets, Wind, CloudRain as RainIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

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

  const fetchWeather = async (retryCount = 0) => {
    setLoading(true);
    setError('');
    try {
      // Add timeout to prevent hanging requests
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 15000)
      );

      const currentRes = await Promise.race([
        weatherAPI.getCurrentWeather(lat, lng),
        timeoutPromise
      ]);
      
      setPrevTemp(currentWeather?.temperature ?? null);
      setCurrentWeather(currentRes.data.data.current);
      setCity(currentRes.data.data.location.city);
      setCountry(currentRes.data.data.location.country);
      setLastUpdated(new Date());
      
      const forecastRes = await Promise.race([
        weatherAPI.getForecast(lat, lng, city, country, 30),
        timeoutPromise
      ]);
      setForecast(forecastRes.data.data.forecast || []);
      
      const alertsRes = await Promise.race([
        weatherAPI.getAlerts(lat, lng),
        timeoutPromise
      ]);
      setAlerts(alertsRes.data.data.alerts || []);
      
    } catch (err) {
      console.error('Weather fetch error:', err);
      
      // Retry logic for temporary failures
      if (retryCount < 2) {
        console.log(`Retrying weather fetch (attempt ${retryCount + 1})...`);
        setTimeout(() => fetchWeather(retryCount + 1), 2000); // Retry after 2 seconds
        return;
      }
      
      setError('Failed to load weather data. Please check your internet connection and try again.');
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

  // Group forecast data by day (OpenWeatherMap returns 3-hour intervals)
  const getDailyForecast = () => {
    const days = {};
    forecast.forEach(item => {
      const dateObj = new Date(item.date);
      const date = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      if (!days[date]) days[date] = [];
      days[date].push(item);
    });
    // For each day, get min/max temp, avg wind, avg humidity, total precipitation, and the most frequent condition
    return Object.entries(days).slice(0, 7).map(([date, items]) => {
      const temps = items.map(i => i.temperature);
      const min = Math.min(...temps);
      const max = Math.max(...temps);
      const condition = items[0].condition;
      const icon = items[0].icon;
      const wind = Math.round(items.reduce((sum, i) => sum + (i.windSpeed || 0), 0) / items.length);
      const humidity = Math.round(items.reduce((sum, i) => sum + (i.humidity || 0), 0) / items.length);
      const precipitation = Math.round(items.reduce((sum, i) => sum + (i.precipitation || 0), 0) * 10) / 10;
      const isToday = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) === date;
      return { date, min, max, condition, icon, wind, humidity, precipitation, isToday };
    });
  };

  // Hourly forecast for next 24 hours
  const getHourlyForecast = () => {
    return forecast.slice(0, 8).map(item => ({
      time: new Date(item.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      temperature: Math.round(item.temperature),
      icon: item.icon,
      condition: item.condition
    }));
  };
  // Analysis: warmest/coldest day
  const daily = getDailyForecast().sort((a, b) => {
    // Sort by date ascending
    const da = new Date(a.date);
    const db = new Date(b.date);
    return da - db;
  });
  const warmest = daily.reduce((a, b) => (b.max > a.max ? b : a), daily[0] || {});
  const coldest = daily.reduce((a, b) => (b.min < a.min ? b : a), daily[0] || {});
  const rainDays = daily.filter(d => d.precipitation > 0).length;

  // Animated background based on current weather
  const getBgClass = () => {
    if (!currentWeather) return 'bg-gradient-to-br from-blue-100 to-blue-300';
    const desc = currentWeather.description?.toLowerCase() || '';
    if (desc.includes('sun') || desc.includes('clear')) return 'bg-gradient-to-br from-yellow-100 to-blue-200 animate-pulse';
    if (desc.includes('rain')) return 'bg-gradient-to-br from-blue-200 to-blue-500 animate-rainy';
    if (desc.includes('storm') || desc.includes('thunder')) return 'bg-gradient-to-br from-gray-400 to-blue-900 animate-thunder';
    if (desc.includes('snow')) return 'bg-gradient-to-br from-blue-100 to-white animate-snowy';
    if (desc.includes('cloud')) return 'bg-gradient-to-br from-gray-200 to-gray-400 animate-cloudy';
    return 'bg-gradient-to-br from-blue-100 to-blue-300';
  };

  return (
    <div className={`min-h-screen p-6 transition-colors duration-700 ${getBgClass()}`}>
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
        <div className="mb-2 text-sm text-gray-600 dark:text-gray-300 flex items-center justify-between">
          <div>
            Showing weather for <span className="font-semibold">{city}, {country}</span> {usingGeolocation && '(using your location)'}
          </div>
          <button 
            onClick={() => fetchWeather()} 
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
            disabled={loading}
          >
            {loading ? '🔄 Loading...' : '🔄 Refresh'}
          </button>
        </div>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>
              {error}
              <button 
                onClick={() => fetchWeather()} 
                className="ml-2 underline hover:no-underline"
              >
                Try again
              </button>
            </AlertDescription>
          </Alert>
        )}
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
            {/* 7-Day Forecast */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">7-Day Forecast</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {daily.map((day, idx) => (
                  <div
                    key={idx}
                    className={`relative bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex flex-col items-center transition hover:scale-105 ${day.isToday ? 'ring-4 ring-blue-400 dark:ring-blue-600' : ''}`}
                    style={{ minWidth: 120 }}
                    title={`Wind: ${day.wind} km/h\nHumidity: ${day.humidity}%\nPrecipitation: ${day.precipitation} mm`}
                  >
                    <img
                      src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
                      alt={day.condition}
                      className="h-12 w-12 mb-2"
                    />
                    <div className="font-semibold text-gray-800 dark:text-white">{day.date}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-300 mb-1">{day.condition}</div>
                    <div className="flex gap-2 items-end mb-1">
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-300">{Math.round(day.max)}°</span>
                      <span className="text-sm text-gray-500 dark:text-gray-300">/</span>
                      <span className="text-md font-medium text-gray-500 dark:text-gray-300">{Math.round(day.min)}°</span>
                    </div>
                    <div className="flex gap-2 items-center text-xs text-gray-500 dark:text-gray-300 mt-1">
                      <Wind className="h-4 w-4" /> {day.wind} km/h
                      <Droplets className="h-4 w-4 ml-2" /> {day.humidity}%
                      <RainIcon className="h-4 w-4 ml-2" /> {day.precipitation} mm
                    </div>
                    {day.isToday && (
                      <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full shadow">Today</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {/* Temperature Trend Line Chart */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-2">Temperature Trend</h2>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={daily} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="max" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} name="Max Temp" />
                    <Line type="monotone" dataKey="min" stroke="#60a5fa" strokeWidth={2} dot={{ r: 3 }} name="Min Temp" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* Hourly Forecast Carousel */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-2">Next 24 Hours</h2>
              <div className="flex overflow-x-auto gap-4 pb-2">
                {getHourlyForecast().map((hour, idx) => (
                  <div key={idx} className="flex-shrink-0 bg-white dark:bg-gray-800 rounded-xl shadow p-3 flex flex-col items-center min-w-[80px]">
                    <div className="text-xs text-gray-500 mb-1">{hour.time}</div>
                    <img src={`https://openweathermap.org/img/wn/${hour.icon}@2x.png`} alt={hour.condition} className="h-8 w-8 mb-1" />
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-300">{hour.temperature}°</div>
                    <div className="text-xs text-gray-500 dark:text-gray-300">{hour.condition}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Simple Analysis Section */}
            <div className="mt-8 bg-blue-50 dark:bg-blue-900 rounded-xl shadow p-4">
              <h2 className="text-lg font-semibold mb-2 text-blue-800 dark:text-blue-200">Weather Analysis</h2>
              <ul className="list-disc pl-5 text-blue-900 dark:text-blue-100 text-sm">
                <li>Warmest day: <span className="font-bold">{warmest?.date}</span> ({Math.round(warmest?.max)}°C)</li>
                <li>Coldest day: <span className="font-bold">{coldest?.date}</span> ({Math.round(coldest?.min)}°C)</li>
              </ul>
            </div>
            {/* Weather Alerts */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-2">Weather Alerts</h2>
              {(Array.isArray(alerts) ? alerts : []).length === 0 ? (
                <div className="text-gray-500">No active alerts.</div>
              ) : (
                (Array.isArray(alerts) ? alerts : []).map((alert, idx) => (
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