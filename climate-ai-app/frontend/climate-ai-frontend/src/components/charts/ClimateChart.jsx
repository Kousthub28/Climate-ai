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
  ScatterChart,
  Scatter,
  ComposedChart,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  Thermometer,
  CloudRain,
  AlertTriangle,
  Globe,
  Calendar,
  BarChart3,
} from 'lucide-react';

const ClimateChart = ({ data, type = 'temperature', timeRange = '10years' }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateChartData();
  }, [data, type, timeRange]);

  const generateChartData = () => {
    setLoading(true);
    
    if (type === 'temperature') {
      // Generate temperature anomaly data
      const years = timeRange === '10years' ? 10 : timeRange === '50years' ? 50 : 100;
      const tempData = [];
      
      for (let i = 0; i < years; i++) {
        const year = new Date().getFullYear() - (years - 1 - i);
        const baseAnomaly = Math.sin(i * 0.1) * 0.5 + (i / years) * 1.2; // Warming trend
        const seasonalVariation = Math.sin(i * 2 * Math.PI / 12) * 0.3;
        const randomVariation = (Math.random() - 0.5) * 0.4;
        
        tempData.push({
          year: year,
          anomaly: Math.round((baseAnomaly + seasonalVariation + randomVariation) * 100) / 100,
          average: Math.round((14.5 + baseAnomaly + seasonalVariation + randomVariation) * 10) / 10,
          historical: 14.5,
        });
      }
      setChartData(tempData);
    } else if (type === 'precipitation') {
      // Generate precipitation data
      const years = timeRange === '10years' ? 10 : timeRange === '50years' ? 50 : 100;
      const precipData = [];
      
      for (let i = 0; i < years; i++) {
        const year = new Date().getFullYear() - (years - 1 - i);
        const basePrecip = 800 + Math.sin(i * 0.15) * 200 + Math.random() * 100;
        const trend = (i / years) * 50; // Slight increase over time
        
        precipData.push({
          year: year,
          precipitation: Math.round(basePrecip + trend),
          average: 850,
          extreme: basePrecip > 1000 ? basePrecip : null,
        });
      }
      setChartData(precipData);
    } else if (type === 'co2') {
      // Generate CO2 concentration data
      const years = timeRange === '10years' ? 10 : timeRange === '50years' ? 50 : 100;
      const co2Data = [];
      
      for (let i = 0; i < years; i++) {
        const year = new Date().getFullYear() - (years - 1 - i);
        const baseCO2 = 350 + (i / years) * 70; // Increasing trend
        const seasonal = Math.sin(i * 2 * Math.PI) * 3;
        
        co2Data.push({
          year: year,
          co2: Math.round((baseCO2 + seasonal) * 10) / 10,
          target: 350,
          dangerous: 450,
        });
      }
      setChartData(co2Data);
    } else if (type === 'risk') {
      // Generate climate risk assessment data
      const riskData = [
        { category: 'Heat Waves', current: 65, projected: 85, impact: 'High' },
        { category: 'Flooding', current: 45, projected: 70, impact: 'Medium' },
        { category: 'Drought', current: 55, projected: 75, impact: 'High' },
        { category: 'Storms', current: 40, projected: 60, impact: 'Medium' },
        { category: 'Sea Level Rise', current: 30, projected: 80, impact: 'High' },
        { category: 'Wildfires', current: 50, projected: 90, impact: 'High' },
      ];
      setChartData(riskData);
    }
    
    setLoading(false);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}${getUnit()}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const getUnit = () => {
    switch (type) {
      case 'temperature':
        return '°C';
      case 'precipitation':
        return ' mm';
      case 'co2':
        return ' ppm';
      case 'risk':
        return '%';
      default:
        return '';
    }
  };

  const getColor = () => {
    switch (type) {
      case 'temperature':
        return '#ef4444';
      case 'precipitation':
        return '#3b82f6';
      case 'co2':
        return '#f59e0b';
      case 'risk':
        return '#dc2626';
      default:
        return '#6b7280';
    }
  };

  const renderTemperatureChart = () => {
    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="year" 
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fontSize: 12 }}
              label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            <Line
              type="monotone"
              dataKey="historical"
              stroke="#94a3b8"
              strokeDasharray="5 5"
              strokeWidth={1}
              dot={false}
              name="Historical Average"
            />
            <Line
              type="monotone"
              dataKey="average"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ fill: '#ef4444', strokeWidth: 2, r: 3 }}
              name="Annual Average"
            />
            <Bar
              dataKey="anomaly"
              fill={(entry) => entry > 0 ? '#ef4444' : '#3b82f6'}
              name="Temperature Anomaly"
              opacity={0.7}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderPrecipitationChart = () => {
    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="year" 
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fontSize: 12 }}
              label={{ value: 'Precipitation (mm)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            <Bar
              dataKey="precipitation"
              fill="#3b82f6"
              name="Annual Precipitation"
              radius={[2, 2, 0, 0]}
            />
            <Line
              type="monotone"
              dataKey="average"
              stroke="#10b981"
              strokeDasharray="5 5"
              strokeWidth={2}
              dot={false}
              name="Long-term Average"
            />
            <Scatter
              dataKey="extreme"
              fill="#ef4444"
              name="Extreme Events"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderCO2Chart = () => {
    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="year" 
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fontSize: 12 }}
              label={{ value: 'CO₂ (ppm)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            <Area
              type="monotone"
              dataKey="co2"
              stroke="#f59e0b"
              fill="#f59e0b"
              fillOpacity={0.3}
              name="CO₂ Concentration"
            />
            <Line
              type="monotone"
              dataKey="target"
              stroke="#10b981"
              strokeDasharray="5 5"
              strokeWidth={2}
              dot={false}
              name="Safe Level"
            />
            <Line
              type="monotone"
              dataKey="dangerous"
              stroke="#ef4444"
              strokeDasharray="10 5"
              strokeWidth={2}
              dot={false}
              name="Dangerous Level"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderRiskChart = () => {
    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="horizontal" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              type="number"
              className="text-xs"
              tick={{ fontSize: 12 }}
              domain={[0, 100]}
            />
            <YAxis 
              type="category"
              dataKey="category"
              className="text-xs"
              tick={{ fontSize: 12 }}
              width={80}
            />
            <Tooltip formatter={(value) => [`${value}%`, '']} />
            <Legend />
            
            <Bar dataKey="current" fill="#3b82f6" name="Current Risk" />
            <Bar dataKey="projected" fill="#ef4444" name="Projected Risk (2050)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const getTitle = () => {
    switch (type) {
      case 'temperature':
        return 'Temperature Trends';
      case 'precipitation':
        return 'Precipitation Patterns';
      case 'co2':
        return 'CO₂ Concentration';
      case 'risk':
        return 'Climate Risk Assessment';
      default:
        return 'Climate Analysis';
    }
  };

  const getDescription = () => {
    switch (type) {
      case 'temperature':
        return 'Long-term temperature trends and anomalies';
      case 'precipitation':
        return 'Annual precipitation patterns and extremes';
      case 'co2':
        return 'Atmospheric CO₂ concentration over time';
      case 'risk':
        return 'Current and projected climate risks';
      default:
        return 'Climate data visualization';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'temperature':
        return Thermometer;
      case 'precipitation':
        return CloudRain;
      case 'co2':
        return Globe;
      case 'risk':
        return AlertTriangle;
      default:
        return BarChart3;
    }
  };

  const getStatistics = () => {
    if (chartData.length === 0) return null;

    switch (type) {
      case 'temperature':
        const tempValues = chartData.map(d => d.anomaly);
        const avgAnomaly = tempValues.reduce((a, b) => a + b, 0) / tempValues.length;
        const trend = tempValues[tempValues.length - 1] > tempValues[0] ? 'warming' : 'cooling';
        return {
          average: `${Math.round(avgAnomaly * 100) / 100}°C anomaly`,
          trend: trend,
          latest: `${chartData[chartData.length - 1]?.average}°C`,
        };
      
      case 'precipitation':
        const precipValues = chartData.map(d => d.precipitation);
        const avgPrecip = precipValues.reduce((a, b) => a + b, 0) / precipValues.length;
        return {
          average: `${Math.round(avgPrecip)} mm/year`,
          trend: 'variable',
          latest: `${chartData[chartData.length - 1]?.precipitation} mm`,
        };
      
      case 'co2':
        const co2Values = chartData.map(d => d.co2);
        const currentCO2 = co2Values[co2Values.length - 1];
        const rate = ((co2Values[co2Values.length - 1] - co2Values[0]) / co2Values.length).toFixed(1);
        return {
          current: `${currentCO2} ppm`,
          rate: `+${rate} ppm/year`,
          status: currentCO2 > 450 ? 'dangerous' : currentCO2 > 400 ? 'elevated' : 'safe',
        };
      
      default:
        return null;
    }
  };

  const IconComponent = getIcon();
  const stats = getStatistics();

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
              <IconComponent className="h-5 w-5" style={{ color: getColor() }} />
            </div>
            <div>
              <CardTitle className="text-lg">{getTitle()}</CardTitle>
              <CardDescription>{getDescription()}</CardDescription>
            </div>
          </div>
          {stats && (
            <div className="flex items-center space-x-2">
              {stats.trend && (
                <Badge variant={stats.trend === 'warming' ? 'destructive' : 'secondary'} className="text-xs">
                  {stats.trend === 'warming' ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {stats.trend}
                </Badge>
              )}
              {stats.status && (
                <Badge 
                  variant={stats.status === 'dangerous' ? 'destructive' : stats.status === 'elevated' ? 'secondary' : 'default'}
                  className="text-xs"
                >
                  {stats.status}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {type === 'temperature' && renderTemperatureChart()}
        {type === 'precipitation' && renderPrecipitationChart()}
        {type === 'co2' && renderCO2Chart()}
        {type === 'risk' && renderRiskChart()}
        
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            {Object.entries(stats).map(([key, value]) => (
              <div key={key} className="text-center">
                <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">{key}</p>
                <p className="font-medium">{value}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClimateChart;

