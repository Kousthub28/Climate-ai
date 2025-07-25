import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CloudRain,
  Thermometer,
  Droplets,
  Wind,
  Eye,
  Sun,
  Calendar,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

const WeatherChart = ({ data, type = 'temperature', timeRange = '7days' }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateChartData();
  }, [data, type, timeRange]);

  const generateChartData = () => {
    setLoading(true);
    
    // Generate mock data based on type and time range
    const days = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 365;
    const mockData = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      
      const baseTemp = 20 + Math.sin(i * 0.1) * 10 + Math.random() * 5;
      const baseHumidity = 50 + Math.sin(i * 0.15) * 20 + Math.random() * 10;
      const baseWindSpeed = 10 + Math.random() * 15;
      const basePrecipitation = Math.random() * 20;
      const baseAQI = 50 + Math.random() * 100;
      const baseUVIndex = Math.max(0, 5 + Math.sin(i * 0.2) * 3 + Math.random() * 2);
      
      mockData.push({
        date: date.toISOString().split('T')[0],
        dateFormatted: date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          ...(days > 30 ? { year: '2-digit' } : {})
        }),
        temperature: Math.round(baseTemp * 10) / 10,
        humidity: Math.round(baseHumidity),
        windSpeed: Math.round(baseWindSpeed * 10) / 10,
        precipitation: Math.round(basePrecipitation * 10) / 10,
        aqi: Math.round(baseAQI),
        uvIndex: Math.round(baseUVIndex * 10) / 10,
        pressure: Math.round((1013 + Math.sin(i * 0.1) * 20 + Math.random() * 10) * 10) / 10,
      });
    }
    
    setChartData(mockData);
    setLoading(false);
  };

  const getChartConfig = () => {
    switch (type) {
      case 'temperature':
        return {
          title: 'Temperature Trends',
          description: 'Daily temperature variations over time',
          icon: Thermometer,
          color: '#ef4444',
          dataKey: 'temperature',
          unit: '°C',
          chartType: 'line'
        };
      case 'humidity':
        return {
          title: 'Humidity Levels',
          description: 'Relative humidity percentage over time',
          icon: Droplets,
          color: '#3b82f6',
          dataKey: 'humidity',
          unit: '%',
          chartType: 'area'
        };
      case 'wind':
        return {
          title: 'Wind Speed',
          description: 'Wind speed measurements over time',
          icon: Wind,
          color: '#10b981',
          dataKey: 'windSpeed',
          unit: ' km/h',
          chartType: 'line'
        };
      case 'precipitation':
        return {
          title: 'Precipitation',
          description: 'Daily rainfall and precipitation',
          icon: CloudRain,
          color: '#6366f1',
          dataKey: 'precipitation',
          unit: ' mm',
          chartType: 'bar'
        };
      case 'aqi':
        return {
          title: 'Air Quality Index',
          description: 'Air quality measurements over time',
          icon: Eye,
          color: '#f59e0b',
          dataKey: 'aqi',
          unit: ' AQI',
          chartType: 'area'
        };
      case 'uv':
        return {
          title: 'UV Index',
          description: 'UV radiation levels throughout the day',
          icon: Sun,
          color: '#f97316',
          dataKey: 'uvIndex',
          unit: '',
          chartType: 'line'
        };
      default:
        return {
          title: 'Weather Data',
          description: 'Weather measurements over time',
          icon: CloudRain,
          color: '#6b7280',
          dataKey: 'temperature',
          unit: '°C',
          chartType: 'line'
        };
    }
  };

  const config = getChartConfig();
  const IconComponent = config.icon;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white">{label}</p>
          <p className="text-sm" style={{ color: config.color }}>
            {`${config.title}: ${payload[0].value}${config.unit}`}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    if (loading) {
      return (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (config.chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="dateFormatted" 
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey={config.dataKey}
              stroke={config.color}
              strokeWidth={2}
              dot={{ fill: config.color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: config.color, strokeWidth: 2 }}
            />
          </LineChart>
        );
      
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="dateFormatted" 
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey={config.dataKey}
              stroke={config.color}
              fill={config.color}
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </AreaChart>
        );
      
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="dateFormatted" 
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey={config.dataKey}
              fill={config.color}
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        );
      
      default:
        return <div>Chart type not supported</div>;
    }
  };

  const getStatistics = () => {
    if (chartData.length === 0) return null;

    const values = chartData.map(d => d[config.dataKey]);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const latest = values[values.length - 1];
    const previous = values[values.length - 2];
    const trend = latest > previous ? 'up' : latest < previous ? 'down' : 'stable';

    return {
      average: Math.round(avg * 10) / 10,
      minimum: min,
      maximum: max,
      latest: latest,
      trend
    };
  };

  const stats = getStatistics();

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
              <IconComponent className="h-5 w-5" style={{ color: config.color }} />
            </div>
            <div>
              <CardTitle className="text-lg">{config.title}</CardTitle>
              <CardDescription>{config.description}</CardDescription>
            </div>
          </div>
          {stats && (
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                Latest: {stats.latest}{config.unit}
              </Badge>
              <Badge 
                variant={stats.trend === 'up' ? 'default' : stats.trend === 'down' ? 'destructive' : 'secondary'}
                className="text-xs"
              >
                {stats.trend === 'up' ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : stats.trend === 'down' ? (
                  <TrendingDown className="h-3 w-3 mr-1" />
                ) : (
                  <Calendar className="h-3 w-3 mr-1" />
                )}
                {stats.trend}
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
        
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <p className="text-xs text-gray-600 dark:text-gray-400">Average</p>
              <p className="font-medium">{stats.average}{config.unit}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600 dark:text-gray-400">Minimum</p>
              <p className="font-medium">{stats.minimum}{config.unit}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600 dark:text-gray-400">Maximum</p>
              <p className="font-medium">{stats.maximum}{config.unit}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600 dark:text-gray-400">Latest</p>
              <p className="font-medium">{stats.latest}{config.unit}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeatherChart;

