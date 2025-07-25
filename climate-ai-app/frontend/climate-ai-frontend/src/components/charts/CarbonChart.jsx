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
  ComposedChart,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Leaf,
  Car,
  Home,
  Utensils,
  Trash2,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
} from 'lucide-react';

const CarbonChart = ({ data, type = 'overview', timeRange = '30days' }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateChartData();
  }, [data, type, timeRange]);

  const generateChartData = () => {
    setLoading(true);
    
    if (type === 'breakdown') {
      // Generate carbon footprint breakdown data
      const breakdownData = [
        { category: 'Transportation', value: 2.5, color: '#ef4444', icon: Car },
        { category: 'Energy', value: 1.8, color: '#f59e0b', icon: Home },
        { category: 'Diet', value: 1.2, color: '#10b981', icon: Utensils },
        { category: 'Waste', value: 0.3, color: '#6366f1', icon: Trash2 },
        { category: 'Consumption', value: 0.8, color: '#8b5cf6', icon: ShoppingBag },
      ];
      setChartData(breakdownData);
    } else if (type === 'trends') {
      // Generate carbon footprint trends over time
      const days = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 365;
      const trendsData = [];
      
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (days - 1 - i));
        
        const baseCarbon = 6 + Math.sin(i * 0.1) * 2 + Math.random() * 1;
        const transportation = 2.5 + Math.sin(i * 0.15) * 0.5 + Math.random() * 0.3;
        const energy = 1.8 + Math.sin(i * 0.12) * 0.4 + Math.random() * 0.2;
        const diet = 1.2 + Math.random() * 0.2;
        const waste = 0.3 + Math.random() * 0.1;
        const consumption = 0.8 + Math.random() * 0.2;
        
        trendsData.push({
          date: date.toISOString().split('T')[0],
          dateFormatted: date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            ...(days > 30 ? { year: '2-digit' } : {})
          }),
          total: Math.round(baseCarbon * 10) / 10,
          transportation: Math.round(transportation * 10) / 10,
          energy: Math.round(energy * 10) / 10,
          diet: Math.round(diet * 10) / 10,
          waste: Math.round(waste * 10) / 10,
          consumption: Math.round(consumption * 10) / 10,
          target: 5.0, // Daily target
        });
      }
      setChartData(trendsData);
    } else {
      // Generate overview data
      const overviewData = [
        {
          period: 'This Week',
          current: 42.5,
          previous: 45.2,
          target: 35.0,
          reduction: 6.0
        },
        {
          period: 'This Month',
          current: 185.3,
          previous: 198.7,
          target: 150.0,
          reduction: 6.7
        },
        {
          period: 'This Year',
          current: 2156.8,
          previous: 2387.4,
          target: 1800.0,
          reduction: 9.7
        }
      ];
      setChartData(overviewData);
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
              {`${entry.name}: ${entry.value} kg CO₂e`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderBreakdownChart = () => {
    const COLORS = chartData.map(item => item.color);
    
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} kg CO₂e`, 'Daily Average']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="space-y-4">
          {chartData.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: `${item.color}20` }}>
                    <IconComponent className="h-4 w-4" style={{ color: item.color }} />
                  </div>
                  <span className="font-medium">{item.category}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{item.value} kg CO₂e</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">per day</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderTrendsChart = () => {
    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="dateFormatted" 
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fontSize: 12 }}
              label={{ value: 'kg CO₂e', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            <Area
              type="monotone"
              dataKey="total"
              stroke="#ef4444"
              fill="#ef4444"
              fillOpacity={0.3}
              name="Total Emissions"
            />
            <Line
              type="monotone"
              dataKey="target"
              stroke="#10b981"
              strokeDasharray="5 5"
              strokeWidth={2}
              dot={false}
              name="Daily Target"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderOverviewChart = () => {
    return (
      <div className="space-y-6">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="period" 
                className="text-xs"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fontSize: 12 }}
                label={{ value: 'kg CO₂e', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip formatter={(value) => [`${value} kg CO₂e`, '']} />
              <Legend />
              
              <Bar dataKey="current" fill="#ef4444" name="Current Period" radius={[2, 2, 0, 0]} />
              <Bar dataKey="previous" fill="#f87171" name="Previous Period" radius={[2, 2, 0, 0]} />
              <Bar dataKey="target" fill="#10b981" name="Target" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {chartData.map((item, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">{item.period}</h4>
                <Badge variant={item.current <= item.target ? 'default' : 'destructive'} className="text-xs">
                  {item.current <= item.target ? (
                    <Target className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  )}
                  {item.current <= item.target ? 'On Track' : 'Over Target'}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Current:</span>
                  <span className="font-medium">{item.current} kg CO₂e</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Target:</span>
                  <span className="font-medium text-green-600">{item.target} kg CO₂e</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Reduction:</span>
                  <span className="font-medium text-blue-600">{item.reduction}%</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const getTitle = () => {
    switch (type) {
      case 'breakdown':
        return 'Carbon Footprint Breakdown';
      case 'trends':
        return 'Carbon Emissions Trends';
      case 'overview':
        return 'Carbon Footprint Overview';
      default:
        return 'Carbon Footprint Analysis';
    }
  };

  const getDescription = () => {
    switch (type) {
      case 'breakdown':
        return 'Daily carbon emissions by category';
      case 'trends':
        return 'Carbon footprint trends over time';
      case 'overview':
        return 'Carbon footprint summary and targets';
      default:
        return 'Carbon footprint data visualization';
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
            <Leaf className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <CardTitle className="text-lg">{getTitle()}</CardTitle>
            <CardDescription>{getDescription()}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {type === 'breakdown' && renderBreakdownChart()}
        {type === 'trends' && renderTrendsChart()}
        {type === 'overview' && renderOverviewChart()}
      </CardContent>
    </Card>
  );
};

export default CarbonChart;

