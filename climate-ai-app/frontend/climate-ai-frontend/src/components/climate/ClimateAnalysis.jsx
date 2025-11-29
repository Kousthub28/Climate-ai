import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { weatherAPI } from '../../services/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Bar, Legend } from 'recharts';
import axios from 'axios';
import { motion } from 'framer-motion';
import { WiDaySunny, WiRain, WiStrongWind, WiHumidity, WiFire, WiThermometer, WiSnow, WiStormShowers } from 'react-icons/wi';
import { FiShare2, FiDownload, FiMapPin, FiVolume2, FiSquare } from 'react-icons/fi';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import html2canvas from 'html2canvas';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const DEFAULT_CITY = 'New York';
const DEFAULT_COUNTRY = 'US';
const DEFAULT_LAT = 40.7128;
const DEFAULT_LNG = -74.0060;

// Replace with your actual OpenWeatherMap API key
const OPENWEATHERMAP_API_KEY = '0e356836821fe7c66466877bd63f9ee7';

// Fix default marker icon for leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const ClimateAnalysis = () => {
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [city, setCity] = useState(DEFAULT_CITY);
  const [country, setCountry] = useState(DEFAULT_COUNTRY);
  const [lat, setLat] = useState(DEFAULT_LAT);
  const [lng, setLng] = useState(DEFAULT_LNG);
  const [trendDays, setTrendDays] = useState(7);
  const [granitePrediction, setGranitePrediction] = useState('');
  const [graniteLoading, setGraniteLoading] = useState(false);
  const [graniteError, setGraniteError] = useState('');
  const [geminiPrediction, setGeminiPrediction] = useState('');
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [geminiError, setGeminiError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const reportRef = useRef(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  useEffect(() => {
    fetchWeather(); // Use the same function as /weather
  }, [lat, lng]);

  const fetchWeather = async () => {
    setLoading(true);
    setError('');
    try {
      // Try to get up to 14 days if available
      const forecastRes = await weatherAPI.getForecast(lat, lng, city, country, 14);
      setForecast(forecastRes.data.data.forecast || []);
      setCity(forecastRes.data.data.location.city);
      setCountry(forecastRes.data.data.location.country);
    } catch (err) {
      setError('Failed to load climate data.');
    } finally {
      setLoading(false);
    }
  };

  // Helper: group forecast data by date and summarize
  function groupForecastByDate(forecast) {
    const grouped = {};
    forecast.forEach(item => {
      const date = new Date(item.date).toISOString().split('T')[0];
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(item);
    });
    // Summarize each day
    return Object.entries(grouped).map(([date, items]) => {
      const temps = items.map(i => i.temperature);
      const winds = items.map(i => i.windSpeed);
      const hums = items.map(i => i.humidity);
      const precs = items.map(i => i.precipitation);
      // Use your event detection logic here for the day (e.g., max temp, max wind, etc.)
      const maxTemp = Math.max(...temps);
      const minTemp = Math.min(...temps);
      const avgTemp = Math.round(temps.reduce((a, b) => a + b, 0) / temps.length);
      const maxWind = Math.max(...winds);
      const avgHum = Math.round(hums.reduce((a, b) => a + b, 0) / hums.length);
      const totalPrecip = Math.round(precs.reduce((a, b) => a + b, 0));
      // Detect events for the day (e.g., if any hour is extreme)
      const events = [];
      if (maxTemp > 40) events.push('Heatwave');
      if (minTemp < 5) events.push('Cold Wave');
      if (maxWind > 70) events.push('Hurricane/Storm');
      else if (maxWind > 50) events.push('Storm');
      if (totalPrecip > 30) events.push('Heavy Rain');
      if (avgHum > 90) events.push('Very High Humidity');
      if (maxTemp > 35 && avgHum < 30 && totalPrecip < 2 && maxWind > 20) events.push('Wildfire Risk');
      return {
        date,
        avgTemp,
        maxTemp,
        minTemp,
        maxWind,
        avgHum,
        totalPrecip,
        events: events.length ? events : ['None'],
      };
    });
  }
  // Prepare trend data for selected days
  const trendData = forecast.slice(0, trendDays).map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    temperature: Math.round(item.temperature),
    precipitation: Math.round(item.precipitation || 0),
    windSpeed: item.windSpeed !== undefined ? Math.round(item.windSpeed) : undefined,
    humidity: item.humidity !== undefined ? Math.round(item.humidity) : undefined
  }));
  // Group forecast by date for the table
  const groupedDays = groupForecastByDate(forecast.slice(0, trendDays));
  const avgTemp = trendData.length ? Math.round(trendData.reduce((sum, d) => sum + d.temperature, 0) / trendData.length) : 0;
  const totalPrecip = trendData.reduce((sum, d) => sum + d.precipitation, 0);
  const tempChange = trendData.length > 1 ? trendData[trendData.length - 1].temperature - trendData[0].temperature : 0;
  const maxTemp = trendData.reduce((max, d) => d.temperature > max ? d.temperature : max, -Infinity);
  const minTemp = trendData.reduce((min, d) => d.temperature < min ? d.temperature : min, Infinity);
  const wettestDay = trendData.reduce((wet, d) => d.precipitation > wet.precipitation ? d : wet, trendData[0] || {});
  const volatility = maxTemp - minTemp;
  const rainDays = trendData.filter(d => d.precipitation > 2).length;

  // Detect extreme events in the trend data
  const extremeEvents = trendData.reduce((events, d) => {
    if (d.temperature > 40) {
      events.push({
        type: 'Heatwave',
        date: d.date,
        severity: 'High',
        description: 'Temperature exceeds 40°C. High risk for heat-sensitive populations.'
      });
    }
    if (d.temperature < 5) {
      events.push({
        type: 'Cold Wave',
        date: d.date,
        severity: 'Moderate',
        description: 'Temperature below 5°C. Risk for cold-sensitive populations.'
      });
    }
    if (d.windSpeed && d.windSpeed > 70) {
      events.push({
        type: 'Hurricane/Storm',
        date: d.date,
        severity: 'Severe',
        description: 'Wind speed exceeds 70 km/h. Possible hurricane or severe storm conditions.'
      });
    } else if (d.windSpeed && d.windSpeed > 50) {
      events.push({
        type: 'Storm',
        date: d.date,
        severity: 'Moderate',
        description: 'Wind speed exceeds 50 km/h. Possible storm conditions.'
      });
    }
    if (d.precipitation > 30) {
      events.push({
        type: 'Heavy Rain',
        date: d.date,
        severity: 'Moderate',
        description: 'Precipitation exceeds 30mm. Risk of flooding in vulnerable areas.'
      });
    }
    if (d.humidity && d.humidity > 90) {
      events.push({
        type: 'Very High Humidity',
        date: d.date,
        severity: 'Low',
        description: 'Humidity exceeds 90%. Discomfort and health risk for sensitive groups.'
      });
    }
    // Wildfire risk: temp > 35, humidity < 30, no rain, wind > 20
    if (
      d.temperature > 35 &&
      d.humidity !== undefined && d.humidity < 30 &&
      d.precipitation < 2 &&
      d.windSpeed && d.windSpeed > 20
    ) {
      events.push({
        type: 'Wildfire Risk',
        date: d.date,
        severity: 'Moderate',
        description: 'High temperature, low humidity, dry conditions, and wind. Wildfire risk elevated.'
      });
    }
    return events;
  }, []);
// Drought detection (all days precip < 2mm)
const isDrought = trendData.length > 0 && trendData.every(d => d.precipitation < 2);
if (isDrought) {
  extremeEvents.push({
    type: 'Drought',
    date: `${trendData[0]?.date} - ${trendData[trendData.length-1]?.date}`,
    severity: 'High',
    description: 'Very low precipitation for the entire period. Drought risk for agriculture and water supply.'
  });
}
// Event stacking: if multiple events, increase overall risk
const stackedSeverity = extremeEvents.length > 1 ? 'Multiple extreme events detected. Severe risk for vulnerable populations and infrastructure.' : null;
// Simple vulnerability/impact analysis
const impactSummary = stackedSeverity
  ? stackedSeverity
  : extremeEvents.length > 0
    ? 'Extreme weather events detected. Increased risk for vulnerable populations (elderly, children, outdoor workers).'
    : 'No extreme weather events detected. Standard risk.';

  // For each day, collect detected events (use trendData for consistent formatting)
  const dayEvents = trendData.map(d => {
    const events = [];
    if (d.temperature > 40) events.push('Heatwave');
    if (d.temperature < 5) events.push('Cold Wave');
    if (d.windSpeed > 70) events.push('Hurricane/Storm');
    else if (d.windSpeed > 50) events.push('Storm');
    if (d.precipitation > 30) events.push('Heavy Rain');
    if (d.humidity > 90) events.push('Very High Humidity');
    if (d.temperature > 35 && d.humidity < 30 && d.precipitation < 2 && d.windSpeed > 20) events.push('Wildfire Risk');
    return { ...d, events: events.length ? events : ['None'] };
  });

  // Function to send data to Granite endpoint
  const handleGranitePredict = async () => {
    setGraniteLoading(true);
    setGraniteError('');
    setGranitePrediction('');
    try {
      // Use average values for the period
      const avgWind = trendData.length ? Math.round(trendData.reduce((sum, d) => sum + (d.windSpeed || 0), 0) / trendData.length) : 0;
      const avgHumidity = trendData.length ? Math.round(trendData.reduce((sum, d) => sum + (d.humidity || 0), 0) / trendData.length) : 0;
      const avgPrecip = trendData.length ? Math.round(trendData.reduce((sum, d) => sum + (d.precipitation || 0), 0) / trendData.length) : 0;
      const payload = {
        city,
        country,
        temperature: avgTemp,
        humidity: avgHumidity,
        windSpeed: avgWind,
        precipitation: avgPrecip
      };
      const res = await axios.post('/api/climate/granite-predict', payload);
      setGranitePrediction(res.data.prediction);
    } catch (err) {
      setGraniteError('Failed to get Granite prediction.');
    } finally {
      setGraniteLoading(false);
    }
  };

  // Function to send data to Gemini endpoint
  const handleGeminiPredict = async () => {
    setGeminiLoading(true);
    setGeminiError('');
    setGeminiPrediction('');
    try {
      const avgWind = trendData.length ? Math.round(trendData.reduce((sum, d) => sum + (d.windSpeed || 0), 0) / trendData.length) : 0;
      const avgHumidity = trendData.length ? Math.round(trendData.reduce((sum, d) => sum + (d.humidity || 0), 0) / trendData.length) : 0;
      const avgPrecip = trendData.length ? Math.round(trendData.reduce((sum, d) => sum + (d.precipitation || 0), 0) / trendData.length) : 0;
      const payload = {
        city,
        country,
        temperature: avgTemp,
        humidity: avgHumidity,
        windSpeed: avgWind,
        precipitation: avgPrecip,
        description: trendData[trendData.length-1]?.description || ''
      };
      const res = await axios.post('/api/climate/gemini-predict', payload);
      setGeminiPrediction(res.data.prediction);
      if (window && window.speechSynthesis) {
        const utter = new window.SpeechSynthesisUtterance(res.data.prediction);
        utter.onend = () => setIsSpeaking(false);
        utter.onerror = () => setIsSpeaking(false);
        setIsSpeaking(true);
        window.speechSynthesis.speak(utter);
      }
    } catch (err) {
      setGeminiError('Failed to get Gemini prediction.');
    } finally {
      setGeminiLoading(false);
    }
  };

  // City search autocomplete (using OpenWeatherMap geocoding API)
  const handleSearchInput = async (e) => {
    setSearchInput(e.target.value);
    if (e.target.value.length > 2) {
      try {
        const res = await axios.get(`https://api.openweathermap.org/geo/1.0/direct?q=${e.target.value}&limit=5&appid=${OPENWEATHERMAP_API_KEY}`);
        setSearchResults(res.data);
      } catch (err) {
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };
  const handleSelectLocation = (loc) => {
    setCity(loc.name);
    setCountry(loc.country);
    setLat(loc.lat);
    setLng(loc.lon);
    setSearchInput(`${loc.name}, ${loc.country}`);
    setSearchResults([]);
  };
  // Simple toast notification
  const showToast = (msg, type = 'success') => {
    const toast = document.createElement('div');
    toast.textContent = msg;
    toast.className = `fixed top-6 right-6 z-50 px-4 py-2 rounded shadow-lg text-white font-semibold ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`;
    document.body.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 2500);
  };
  const shareSummary = `Climate Analysis for ${city}, ${country}\nAverage Temp: ${avgTemp}°C\nTotal Precip: ${totalPrecip}mm\n${impactSummary}`;
  const shareSummaryEncoded = encodeURIComponent(shareSummary.replace(/\n/g, '%0A'));
  const handleCopyShare = () => {
    navigator.clipboard.writeText(shareSummary)
      .then(() => showToast('Analysis summary copied to clipboard!'))
      .catch(() => showToast('Failed to copy summary.', 'error'));
    setShowShareMenu(false);
  };
  const handleShareGmail = () => {
    window.open(`mailto:?subject=Climate Analysis Report&body=${shareSummaryEncoded}`);
    setShowShareMenu(false);
  };
  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=&quote=${shareSummaryEncoded}`);
    setShowShareMenu(false);
  };
  const handleShareWhatsApp = () => {
    window.open(`https://wa.me/?text=${shareSummaryEncoded}`);
    setShowShareMenu(false);
  };
  // Download report as PNG
  const handleDownload = async () => {
    setDownloadError('');
    setDownloadLoading(true);
    if (reportRef.current) {
      try {
        // Scroll to top to ensure full capture
        window.scrollTo(0, 0);
        await new Promise(r => setTimeout(r, 300));
        const canvas = await html2canvas(reportRef.current, { useCORS: true, backgroundColor: null, scale: 2 });
        const link = document.createElement('a');
        link.download = `climate-analysis-${city}.png`;
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Report downloaded!');
      } catch (err) {
        setDownloadError('Failed to download report. Please check your browser console for details.');
        showToast('Failed to download report.', 'error');
        console.error('Download report error:', err);
      } finally {
        setDownloadLoading(false);
      }
    } else {
      setDownloadError('Report content not found.');
      setDownloadLoading(false);
    }
  };

  // Speak the Gemini prediction aloud
  const handleSpeak = () => {
    if (window && window.speechSynthesis && geminiPrediction) {
      const utter = new window.SpeechSynthesisUtterance(geminiPrediction);
      utter.onend = () => setIsSpeaking(false);
      utter.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utter);
    }
  };
  // Stop speaking
  const handleStop = () => {
    if (window && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Helper: reverse geocode lat/lng to city/country
  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await axios.get(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lng}&limit=1&appid=${OPENWEATHERMAP_API_KEY}`);
      if (res.data && res.data.length > 0) {
        return {
          city: res.data[0].name || 'Unknown',
          country: res.data[0].country || 'Unknown',
        };
      }
    } catch (err) {}
    return { city: 'Unknown', country: 'Unknown' };
  };

  // Map click handler component
  function LocationMarker() {
    const map = useMapEvents({
      click: async (e) => {
        setLoading(true);
        setLat(e.latlng.lat);
        setLng(e.latlng.lng);
        // Reverse geocode to get city/country
        const loc = await reverseGeocode(e.latlng.lat, e.latlng.lng);
        setCity(loc.city);
        setCountry(loc.country);
        setLoading(false);
      },
    });
    return (
      <Marker position={[lat, lng]}>
        <Popup>
          <div className="text-xs font-semibold text-blue-900 dark:text-blue-100">
            {city}, {country}
          </div>
        </Popup>
      </Marker>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8 transition-colors duration-700">
      {/* Map Section */}
      <div className="max-w-4xl mx-auto mb-6 rounded-2xl overflow-hidden shadow-2xl border border-blue-200 dark:border-blue-900 relative bg-white/80 dark:bg-gray-900/80">
        <div className="relative">
          <MapContainer center={[lat, lng]} zoom={6} style={{ height: 'min(320px,40vw)', width: '100%' }} scrollWheelZoom={true} className="z-0">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker />
          </MapContainer>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-gray-900/70 z-10">
              <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
            </div>
          )}
        </div>
        <div className="p-2 text-xs text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900 border-t border-blue-200 dark:border-blue-900">Click anywhere on the map to analyze weather and climate for that location.</div>
      </div>
      {/* Controls Section */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 rounded-xl shadow px-4 py-2">
            <FiMapPin className="text-blue-500" size={22} />
            <input
              type="text"
              className="flex-1 bg-transparent outline-none text-lg text-gray-900 dark:text-gray-100"
              placeholder="Search city or country..."
              value={searchInput}
              onChange={handleSearchInput}
            />
          </div>
          {searchResults.length > 0 && (
            <div className="absolute left-0 right-0 bg-white dark:bg-gray-900 rounded-b-xl shadow z-10">
              {searchResults.map((loc, idx) => (
                <div key={idx} className="px-4 py-2 hover:bg-blue-100 dark:hover:bg-blue-800 cursor-pointer" onClick={() => handleSelectLocation(loc)}>
                  {loc.name}, {loc.country}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="relative">
          <button className="flex items-center gap-2 px-4 py-2 rounded bg-blue-500 text-white font-semibold hover:bg-blue-600 transition" onClick={() => setShowShareMenu(v => !v)} data-tooltip-id="share-tip">
            <FiShare2 /> Share Analysis
          </button>
          {showShareMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg z-50 border border-blue-100 dark:border-blue-900 animate-fade-in">
              <button className="w-full flex items-center gap-2 px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900 transition" onClick={handleShareGmail}>
                <img src="https://img.icons8.com/color/24/000000/gmail-new.png" alt="Gmail" className="inline-block" /> Gmail
              </button>
              <button className="w-full flex items-center gap-2 px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900 transition" onClick={handleShareFacebook}>
                <img src="https://img.icons8.com/color/24/000000/facebook-new.png" alt="Facebook" className="inline-block" /> Facebook
              </button>
              <button className="w-full flex items-center gap-2 px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900 transition" onClick={handleShareWhatsApp}>
                <img src="https://img.icons8.com/color/24/000000/whatsapp.png" alt="WhatsApp" className="inline-block" /> WhatsApp
              </button>
              <button className="w-full flex items-center gap-2 px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900 transition" onClick={handleCopyShare}>
                <FiShare2 /> Copy to Clipboard
              </button>
            </div>
          )}
          <ReactTooltip id="share-tip" place="top" content="Share analysis via social or copy" />
        </div>
      </div>
      {/* Main Report Content */}
      <div ref={reportRef}>
      <div className="max-w-6xl mx-auto space-y-8">
         <motion.h1 initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-4xl font-extrabold text-blue-900 dark:text-blue-100 mb-4 tracking-tight drop-shadow-lg">
           <WiDaySunny className="inline-block mr-2 text-yellow-400 animate-pulse" size={40} />
           Real-Time Climate Analysis
         </motion.h1>
        {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
        {loading ? (
          <div className="flex flex-col gap-4">
            {[...Array(3)].map((_, i) => (
              <motion.div key={i} className="bg-white/60 dark:bg-gray-700/60 rounded-xl shadow-lg h-32 animate-pulse" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.2 }} />
            ))}
          </div>
        ) : (
          <>
            {/* Toggle for 7/14 days if enough data */}
            {forecast.length >= 14 && (
               <motion.div className="flex gap-4 mb-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <button
                  className={`px-4 py-2 rounded ${trendDays === 7 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
                  onClick={() => setTrendDays(7)}
                >
                  7-Day Trend
                </button>
                <button
                  className={`px-4 py-2 rounded ${trendDays === 14 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
                  onClick={() => setTrendDays(14)}
                >
                  14-Day Trend
                </button>
               </motion.div>
            )}
            {/* Climate Trends Chart */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7 }}>
              <Card className="rounded-2xl shadow-2xl bg-white/80 dark:bg-gray-900/80">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <WiThermometer className="text-blue-500" size={28} />
                    Temperature & Precipitation Trends ({trendDays} Days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={dayEvents} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis yAxisId="left" domain={['auto', 'auto']} tick={{ fontSize: 12 }} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                      <Tooltip content={({ active, payload, label }) => {
                        if (!active || !payload || !payload.length) return null;
                        const d = payload[0].payload;
                        return (
                          <div className="bg-white dark:bg-gray-900 rounded shadow p-2 text-xs">
                            <div className="font-bold mb-1">{label}</div>
                            <div>Temp: <span className="font-mono">{d.temperature}°C</span></div>
                            <div>Precip: <span className="font-mono">{d.precipitation} mm</span></div>
                            <div>Wind: <span className="font-mono">{d.windSpeed || '-'} km/h</span></div>
                            <div>Humidity: <span className="font-mono">{d.humidity || '-'}%</span></div>
                            <div className="mt-1">Event(s): <span className={d.events && d.events[0] !== 'None' ? 'text-red-600 font-semibold' : 'text-green-700'}>{d.events ? d.events.join(', ') : 'None'}</span></div>
                          </div>
                        );
                      }} />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="temperature" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} name="Temp (°C)" />
                      <Bar yAxisId="right" dataKey="precipitation" fill="#60a5fa" name="Precip (mm)" barSize={18} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
            {/* Real-Time Event Table */}
            <motion.div className="mt-8 overflow-x-auto" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <WiStormShowers className="text-blue-600" size={24} />
                Daily Extreme Event Detection
              </h2>
              <div className="rounded-2xl shadow-xl border border-blue-200 dark:border-blue-900 overflow-x-auto bg-white/60 dark:bg-gray-900/60 backdrop-blur-md" style={{background: 'linear-gradient(120deg, rgba(147,197,253,0.25) 0%, rgba(59,130,246,0.10) 100%)'}}>
                <table className="min-w-full text-xs bg-white/90 dark:bg-gray-800/90 rounded-2xl">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-blue-100 dark:bg-blue-900">
                      <th className="px-4 py-3 border-b border-blue-200 dark:border-blue-900 text-left">Date</th>
                      <th className="px-4 py-3 border-b border-blue-200 dark:border-blue-900 text-left">Avg Temp (°C)</th>
                      <th className="px-4 py-3 border-b border-blue-200 dark:border-blue-900 text-left">Max Temp</th>
                      <th className="px-4 py-3 border-b border-blue-200 dark:border-blue-900 text-left">Min Temp</th>
                      <th className="px-4 py-3 border-b border-blue-200 dark:border-blue-900 text-left">Max Wind (km/h)</th>
                      <th className="px-4 py-3 border-b border-blue-200 dark:border-blue-900 text-left">Avg Humidity (%)</th>
                      <th className="px-4 py-3 border-b border-blue-200 dark:border-blue-900 text-left">Total Precip (mm)</th>
                      <th className="px-4 py-3 border-b border-blue-200 dark:border-blue-900 text-left">Event(s) Detected</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedDays.map((d, idx) => (
                      <motion.tr
                        key={idx}
                        className={
                          `${d.events[0] !== 'None' ? 'bg-red-50 dark:bg-red-900 font-semibold' : idx % 2 === 0 ? 'bg-gray-50 dark:bg-gray-900' : 'bg-white dark:bg-gray-800'} ` +
                          'hover:bg-blue-50 dark:hover:bg-blue-800 transition-colors border-b border-blue-100 dark:border-blue-900'
                        }
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * idx }}
                      >
                        <td className="px-4 py-3 align-middle">{d.date}</td>
                        <td className="px-4 py-3 align-middle">{d.avgTemp}</td>
                        <td className="px-4 py-3 align-middle">{d.maxTemp}</td>
                        <td className="px-4 py-3 align-middle">{d.minTemp}</td>
                        <td className="px-4 py-3 align-middle">{d.maxWind}</td>
                        <td className="px-4 py-3 align-middle">{d.avgHum}</td>
                        <td className="px-4 py-3 align-middle">{d.totalPrecip}</td>
                        <td className={d.events[0] !== 'None' ? 'text-red-700 dark:text-red-300' : 'text-green-700 dark:text-green-300'}>
                          {d.events && d.events.length > 0 && d.events[0] !== 'None'
                            ? d.events.map((event, i) => {
                                let icon = null;
                                if (event.includes('Heatwave')) icon = <WiDaySunny className="inline-block text-yellow-500" size={18} />;
                                if (event.includes('Cold')) icon = <WiSnow className="inline-block text-blue-300" size={18} />;
                                if (event.includes('Storm') || event.includes('Hurricane')) icon = <WiStormShowers className="inline-block text-blue-700" size={18} />;
                                if (event.includes('Heavy Rain')) icon = <WiRain className="inline-block text-blue-600" size={18} />;
                                if (event.includes('Humidity')) icon = <WiHumidity className="inline-block text-blue-400" size={18} />;
                                if (event.includes('Wildfire')) icon = <WiFire className="inline-block text-orange-500" size={18} />;
                                if (event.includes('Drought')) icon = <WiFire className="inline-block text-orange-700" size={18} />;
                                return <span key={i} className="inline-flex items-center gap-1 mr-2">{icon}{event}</span>;
                              })
                            : <span className="text-gray-400">–</span>}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
            {/* Analysis Summary */}
            <div className="mt-8 bg-blue-50 dark:bg-blue-900 rounded-xl shadow p-4">
              <h2 className="text-lg font-semibold mb-2 text-blue-800 dark:text-blue-200">Advanced Climate Analysis</h2>
              <ul className="list-disc pl-5 text-blue-900 dark:text-blue-100 text-sm">
                <li>Average temperature: <span className="font-bold">{avgTemp}°C</span></li>
                {totalPrecip > 0 && (
                  <li>Total precipitation: <span className="font-bold">{totalPrecip} mm</span></li>
                )}
                {tempChange !== 0 && (
                  <li>Temperature change over period: <span className="font-bold">{tempChange > 0 ? '+' : ''}{tempChange}°C</span></li>
                )}
                {maxTemp !== -Infinity && (
                  <li>Highest temperature: <span className="font-bold">{maxTemp}°C</span></li>
                )}
                {minTemp !== Infinity && (
                  <li>Lowest temperature: <span className="font-bold">{minTemp}°C</span></li>
                )}
                {wettestDay && wettestDay.precipitation > 0 && (
                  <li>Wettest day: <span className="font-bold">{wettestDay?.date}</span> ({wettestDay?.precipitation} mm)</li>
                )}
                {volatility > 0 && (
                  <li>Temperature volatility: <span className="font-bold">{volatility}°C</span></li>
                )}
                {rainDays > 0 && (
                  <li>Rainy days (&gt;2mm): <span className="font-bold">{rainDays}</span></li>
                )}
                <li>Location: <span className="font-bold">{city}, {country}</span></li>
              </ul>
              {/* Extreme Events Section */}
              <div className="mt-4">
                <h3 className="text-md font-semibold mb-1 text-red-700 dark:text-red-300">Extreme Events & Impact</h3>
                {extremeEvents.length === 0 ? (
                  <div className="text-green-700 dark:text-green-300">No extreme events detected.</div>
                ) : (
                  <ul className="list-disc pl-5 text-red-800 dark:text-red-200 text-sm">
                    {extremeEvents.map((event, idx) => (
                      <li key={idx}>
                        <span className="font-bold">{event.type}</span> on {event.date} ({event.severity}): {event.description}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-2 text-blue-900 dark:text-blue-100 text-sm font-medium">{impactSummary}</div>
              </div>
            </div>
            {/* Gemini AI Prediction */}
            <div className="mt-8 bg-gray-100 dark:bg-gray-800 rounded-xl shadow p-4">
              <h2 className="text-lg font-semibold mb-2 text-blue-800 dark:text-blue-200">AI Prediction</h2>
              <button
                className="px-4 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700 transition mb-2"
                onClick={handleGeminiPredict}
                disabled={geminiLoading}
              >
                {geminiLoading ? 'Predicting...' : 'Get AI Prediction'}
              </button>
              {geminiError && <div className="text-red-600 mt-2">{geminiError}</div>}
              {geminiPrediction && (
                <>
                  <div className="mt-2 p-3 bg-white dark:bg-gray-900 rounded shadow text-sm whitespace-pre-line">
                    {geminiPrediction}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition disabled:opacity-60"
                      onClick={handleSpeak}
                      disabled={isSpeaking}
                      title="Speak prediction"
                    >
                      <FiVolume2 size={20} />
                    </button>
                    <button
                      className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-60"
                      onClick={handleStop}
                      disabled={!isSpeaking}
                      title="Stop speaking"
                    >
                      <FiSquare size={20} />
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        )}
        </div>
      </div>
    </div>
  );
};

export default ClimateAnalysis; 