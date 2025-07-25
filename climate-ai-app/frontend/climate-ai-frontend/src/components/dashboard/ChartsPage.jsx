import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3,
  TrendingUp,
  Thermometer,
  CloudRain,
  Leaf,
  Globe,
  AlertTriangle,
  Calendar,
  Download,
  Share,
} from 'lucide-react';
import WeatherChart from '../charts/WeatherChart';
import CarbonChart from '../charts/CarbonChart';
import ClimateChart from '../charts/ClimateChart';
import '../../App.css';

const ChartsPage = () => {
  const [timeRange, setTimeRange] = useState('30days');
  const [activeTab, setActiveTab] = useState('weather');

  const timeRangeOptions = [
    { value: '7days', label: '7 Days' },
    { value: '30days', label: '30 Days' },
    { value: '1year', label: '1 Year' },
    { value: '10years', label: '10 Years' },
  ];

  const weatherChartTypes = [
    { type: 'temperature', label: 'Temperature', icon: Thermometer },
    { type: 'humidity', label: 'Humidity', icon: CloudRain },
    { type: 'wind', label: 'Wind Speed', icon: CloudRain },
    { type: 'precipitation', label: 'Precipitation', icon: CloudRain },
    { type: 'aqi', label: 'Air Quality', icon: AlertTriangle },
    { type: 'uv', label: 'UV Index', icon: Thermometer },
  ];

  const carbonChartTypes = [
    { type: 'overview', label: 'Overview', icon: BarChart3 },
    { type: 'breakdown', label: 'Breakdown', icon: Leaf },
    { type: 'trends', label: 'Trends', icon: TrendingUp },
  ];

  const climateChartTypes = [
    { type: 'temperature', label: 'Temperature', icon: Thermometer },
    { type: 'precipitation', label: 'Precipitation', icon: CloudRain },
    { type: 'co2', label: 'CO₂ Levels', icon: Globe },
    { type: 'risk', label: 'Risk Assessment', icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Data Visualizations
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Interactive charts and analytics for climate and environmental data
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Time Range Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Time Range</span>
            </CardTitle>
            <CardDescription>
              Select the time period for data visualization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {timeRangeOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={timeRange === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Charts Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="weather" className="flex items-center space-x-2">
              <CloudRain className="h-4 w-4" />
              <span>Weather</span>
            </TabsTrigger>
            <TabsTrigger value="carbon" className="flex items-center space-x-2">
              <Leaf className="h-4 w-4" />
              <span>Carbon</span>
            </TabsTrigger>
            <TabsTrigger value="climate" className="flex items-center space-x-2">
              <Globe className="h-4 w-4" />
              <span>Climate</span>
            </TabsTrigger>
          </TabsList>

          {/* Weather Charts */}
          <TabsContent value="weather" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {weatherChartTypes.map((chartType) => {
                const IconComponent = chartType.icon;
                return (
                  <WeatherChart
                    key={chartType.type}
                    type={chartType.type}
                    timeRange={timeRange}
                  />
                );
              })}
            </div>
          </TabsContent>

          {/* Carbon Charts */}
          <TabsContent value="carbon" className="space-y-6">
            <div className="space-y-6">
              {carbonChartTypes.map((chartType) => {
                const IconComponent = chartType.icon;
                return (
                  <CarbonChart
                    key={chartType.type}
                    type={chartType.type}
                    timeRange={timeRange}
                  />
                );
              })}
            </div>
          </TabsContent>

          {/* Climate Charts */}
          <TabsContent value="climate" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {climateChartTypes.map((chartType) => {
                const IconComponent = chartType.icon;
                return (
                  <ClimateChart
                    key={chartType.type}
                    type={chartType.type}
                    timeRange={timeRange === '7days' || timeRange === '30days' ? '10years' : timeRange}
                  />
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Insights Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Key Insights</span>
            </CardTitle>
            <CardDescription>
              AI-generated insights from your data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center space-x-2 mb-2">
                  <Thermometer className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900 dark:text-blue-100">Temperature Trend</span>
                </div>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Average temperature has increased by 1.2°C over the past decade, with more frequent heat waves.
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div className="flex items-center space-x-2 mb-2">
                  <Leaf className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-900 dark:text-green-100">Carbon Progress</span>
                </div>
                <p className="text-sm text-green-800 dark:text-green-200">
                  Your carbon footprint has decreased by 15% this month through improved transportation choices.
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <span className="font-medium text-orange-900 dark:text-orange-100">Climate Risk</span>
                </div>
                <p className="text-sm text-orange-800 dark:text-orange-200">
                  Extreme weather events are projected to increase by 40% in your region by 2050.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChartsPage;

