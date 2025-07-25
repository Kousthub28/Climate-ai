import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Leaf,
  Car,
  Home,
  Utensils,
  Trash2,
  ShoppingBag,
  Plus,
  Target,
  TrendingUp,
  TrendingDown,
  Calculator,
  Award,
  Lightbulb,
  BarChart3,
} from 'lucide-react';
import CarbonChart from '../charts/CarbonChart';
import { carbonAPI, chatAPI } from '../../services/api';
import '../../App.css';

const CarbonTracker = () => {
  const { user } = useAuth();
  const [carbonData, setCarbonData] = useState({
    daily: 0,
    weekly: 0,
    monthly: 0,
    yearly: 0,
    breakdown: {
      transportation: 0,
      energy: 0,
      diet: 0,
      waste: 0,
      consumption: 0,
    },
    history: [],
    targets: {
      daily: 5.0,
      monthly: 150.0,
      yearly: 1800.0,
    }
  });
  const [newEntry, setNewEntry] = useState({
    category: 'transportation',
    activity: '',
    amount: '',
    unit: 'km',
    date: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [climatiqResult, setClimatiqResult] = useState(null);
  const [climatiqError, setClimatiqError] = useState('');
  const [country, setCountry] = useState('US');

  useEffect(() => {
    loadCarbonData();
    loadRecommendations();
  }, []);

  const loadCarbonData = async () => {
    try {
      setLoading(true);
      // Mock data - in production, fetch from API
      const mockData = {
        daily: 6.2,
        weekly: 43.4,
        monthly: 186.5,
        yearly: 2238.0,
        breakdown: {
          transportation: 2.5,
          energy: 1.8,
          diet: 1.2,
          waste: 0.3,
          consumption: 0.4,
        },
        history: generateMockHistory(),
        targets: {
          daily: 5.0,
          monthly: 150.0,
          yearly: 1800.0,
        }
      };
      setCarbonData(mockData);
    } catch (error) {
      console.error('Error loading carbon data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendations = async () => {
    try {
      const mockRecommendations = [
        {
          id: 1,
          category: 'transportation',
          title: 'Use Public Transport',
          description: 'Taking public transport instead of driving can reduce your daily emissions by up to 2.3 kg CO₂e.',
          impact: 'High',
          effort: 'Low',
          savings: 2.3,
        },
        {
          id: 2,
          category: 'energy',
          title: 'Switch to LED Bulbs',
          description: 'Replace incandescent bulbs with LED lights to reduce energy consumption by 75%.',
          impact: 'Medium',
          effort: 'Low',
          savings: 0.8,
        },
        {
          id: 3,
          category: 'diet',
          title: 'Reduce Meat Consumption',
          description: 'Having one plant-based meal per day can reduce your carbon footprint by 0.5 kg CO₂e daily.',
          impact: 'Medium',
          effort: 'Medium',
          savings: 0.5,
        },
        {
          id: 4,
          category: 'consumption',
          title: 'Buy Local Products',
          description: 'Choosing locally sourced products reduces transportation emissions and supports local economy.',
          impact: 'Low',
          effort: 'Low',
          savings: 0.3,
        },
      ];
      setRecommendations(mockRecommendations);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };

  const generateMockHistory = () => {
    const history = [];
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      history.push({
        date: date.toISOString().split('T')[0],
        total: 5 + Math.random() * 3,
        transportation: 2 + Math.random() * 1,
        energy: 1.5 + Math.random() * 0.8,
        diet: 1 + Math.random() * 0.5,
        waste: 0.2 + Math.random() * 0.2,
        consumption: 0.3 + Math.random() * 0.4,
      });
    }
    return history;
  };

  const handleAddEntry = async () => {
    if (!newEntry.activity || !newEntry.amount) return;

    try {
      // Calculate emissions based on activity
      const emissions = calculateEmissions(newEntry);
      
      // Add to carbon data (mock implementation)
      const updatedData = { ...carbonData };
      updatedData.breakdown[newEntry.category] += emissions;
      updatedData.daily += emissions;
      
      setCarbonData(updatedData);
      
      // Reset form
      setNewEntry({
        category: 'transportation',
        activity: '',
        amount: '',
        unit: 'km',
        date: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      console.error('Error adding carbon entry:', error);
    }
  };

  const calculateEmissions = (entry) => {
    // Simplified emission factors (kg CO₂e per unit)
    const emissionFactors = {
      transportation: {
        'car-petrol': 0.21, // per km
        'car-diesel': 0.17,
        'bus': 0.05,
        'train': 0.04,
        'flight-domestic': 0.25,
        'flight-international': 0.35,
      },
      energy: {
        'electricity': 0.5, // per kWh
        'gas': 2.0, // per m³
        'heating-oil': 2.5, // per liter
      },
      diet: {
        'beef': 27, // per kg
        'pork': 12,
        'chicken': 6,
        'fish': 4,
        'dairy': 3,
        'vegetables': 0.5,
      },
      waste: {
        'general-waste': 0.5, // per kg
        'recycling': 0.1,
        'compost': 0.05,
      },
      consumption: {
        'clothing': 10, // per item
        'electronics': 50,
        'furniture': 100,
        'books': 2,
      }
    };

    const factor = emissionFactors[entry.category]?.[entry.activity] || 1;
    return parseFloat(entry.amount) * factor;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      transportation: Car,
      energy: Home,
      diet: Utensils,
      waste: Trash2,
      consumption: ShoppingBag,
    };
    return icons[category] || Leaf;
  };

  const getCategoryColor = (category) => {
    const colors = {
      transportation: '#ef4444',
      energy: '#f59e0b',
      diet: '#10b981',
      waste: '#6366f1',
      consumption: '#8b5cf6',
    };
    return colors[category] || '#6b7280';
  };

  const getImpactBadgeColor = (impact) => {
    switch (impact) {
      case 'High':
        return 'destructive';
      case 'Medium':
        return 'secondary';
      case 'Low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getEffortBadgeColor = (effort) => {
    switch (effort) {
      case 'High':
        return 'destructive';
      case 'Medium':
        return 'secondary';
      case 'Low':
        return 'default';
      default:
        return 'outline';
    }
  };

  // Add a list of valid activity IDs for the dropdown
  const CLIMATIQ_ACTIVITIES = [
    {
      id: 'passenger_vehicle-vehicle_type_car-fuel_source_diesel-engine_size_na-distance_na',
      label: 'Car (Diesel, per km)'
    },
    {
      id: 'passenger_vehicle-vehicle_type_car-fuel_source_petrol-engine_size_na-distance_na',
      label: 'Car (Petrol, per km)'
    },
    {
      id: 'flight-type_domestic-aircraft_type_na-distance_na-class_na',
      label: 'Flight (Domestic, per km)'
    },
    {
      id: 'electricity-energy_source_grid_mix',
      label: 'Electricity (Grid Mix, per kWh)'
    },
    {
      id: 'meals-food_type_beef',
      label: 'Meal (Beef)'
    },
    {
      id: 'meals-food_type_vegetarian',
      label: 'Meal (Vegetarian)'
    }
  ];

  // Helper to determine if country is required for the selected activity
  const requiresCountry = (activityId) => {
    return activityId === 'electricity-energy_source_grid_mix';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
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
              Carbon Footprint Tracker
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Monitor and reduce your environmental impact
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Target className="h-4 w-4 mr-2" />
              Set Goals
            </Button>
            <Button variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Report
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today</CardTitle>
              <Leaf className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{carbonData.daily.toFixed(1)} kg</div>
              <p className="text-xs text-muted-foreground">
                CO₂e emissions
              </p>
              <div className="mt-2">
                {carbonData.daily <= carbonData.targets.daily ? (
                  <Badge variant="default" className="text-xs">
                    <Target className="h-3 w-3 mr-1" />
                    On Track
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="text-xs">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Over Target
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{carbonData.weekly.toFixed(1)} kg</div>
              <p className="text-xs text-muted-foreground">
                CO₂e emissions
              </p>
              <div className="mt-2">
                <Badge variant="secondary" className="text-xs">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  -5% vs last week
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{carbonData.monthly.toFixed(1)} kg</div>
              <p className="text-xs text-muted-foreground">
                CO₂e emissions
              </p>
              <div className="mt-2">
                {carbonData.monthly <= carbonData.targets.monthly ? (
                  <Badge variant="default" className="text-xs">
                    Under Target
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="text-xs">
                    Over Target
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Year</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{carbonData.yearly.toFixed(0)} kg</div>
              <p className="text-xs text-muted-foreground">
                CO₂e emissions
              </p>
              <div className="mt-2">
                <Badge variant="secondary" className="text-xs">
                  Global Avg: 4000 kg
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="track">Track</TabsTrigger>
            <TabsTrigger value="recommendations">Tips</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CarbonChart type="breakdown" />
              <CarbonChart type="trends" timeRange="30days" />
            </div>
            <CarbonChart type="overview" />
          </TabsContent>

          {/* Track Tab */}
          <TabsContent value="track" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Add New Entry */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Plus className="h-5 w-5" />
                    <span>Add Activity</span>
                  </CardTitle>
                  <CardDescription>
                    Track your daily carbon-generating activities
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <select
                        id="category"
                        value={newEntry.category}
                        onChange={(e) => setNewEntry({ ...newEntry, category: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="transportation">Transportation</option>
                        <option value="energy">Energy</option>
                        <option value="diet">Diet</option>
                        <option value="waste">Waste</option>
                        <option value="consumption">Consumption</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={newEntry.date}
                        onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="activity">Activity</Label>
                    <Input
                      id="activity"
                      placeholder="e.g., car-petrol, electricity, beef"
                      value={newEntry.activity}
                      onChange={(e) => setNewEntry({ ...newEntry, activity: e.target.value })}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0"
                        value={newEntry.amount}
                        onChange={(e) => setNewEntry({ ...newEntry, amount: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit">Unit</Label>
                      <select
                        id="unit"
                        value={newEntry.unit}
                        onChange={(e) => setNewEntry({ ...newEntry, unit: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="km">km</option>
                        <option value="kWh">kWh</option>
                        <option value="kg">kg</option>
                        <option value="liters">liters</option>
                        <option value="items">items</option>
                      </select>
                    </div>
                  </div>
                  
                  <Button onClick={handleAddEntry} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Activity
                  </Button>
                </CardContent>
              </Card>

              {/* Current Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Today's Breakdown</CardTitle>
                  <CardDescription>
                    Your carbon emissions by category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(carbonData.breakdown).map(([category, value]) => {
                      const IconComponent = getCategoryIcon(category);
                      const color = getCategoryColor(category);
                      const percentage = (value / carbonData.daily) * 100;
                      
                      return (
                        <div key={category} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
                              <IconComponent className="h-4 w-4" style={{ color }} />
                            </div>
                            <span className="font-medium capitalize">{category}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{value.toFixed(1)} kg</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {percentage.toFixed(0)}%
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Remove the real-time Climatiq carbon calculation form and related logic */}
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendations.map((rec) => {
                const IconComponent = getCategoryIcon(rec.category);
                const color = getCategoryColor(rec.category);
                
                return (
                  <Card key={rec.id}>
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
                          <IconComponent className="h-4 w-4" style={{ color }} />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{rec.title}</CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant={getImpactBadgeColor(rec.impact)} className="text-xs">
                              {rec.impact} Impact
                            </Badge>
                            <Badge variant={getEffortBadgeColor(rec.effort)} className="text-xs">
                              {rec.effort} Effort
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {rec.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Lightbulb className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-600">
                            Save {rec.savings} kg CO₂e/day
                          </span>
                        </div>
                        <Button size="sm" variant="outline">
                          Learn More
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <Alert>
              <Target className="h-4 w-4" />
              <AlertDescription>
                Set realistic carbon reduction goals to track your progress towards a more sustainable lifestyle.
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Daily Goal</CardTitle>
                  <CardDescription>Target daily emissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">
                    {carbonData.targets.daily} kg CO₂e
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Current: {carbonData.daily.toFixed(1)} kg CO₂e
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min((carbonData.targets.daily / carbonData.daily) * 100, 100)}%`
                      }}
                    ></div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Goal</CardTitle>
                  <CardDescription>Target monthly emissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">
                    {carbonData.targets.monthly} kg CO₂e
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Current: {carbonData.monthly.toFixed(1)} kg CO₂e
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min((carbonData.targets.monthly / carbonData.monthly) * 100, 100)}%`
                      }}
                    ></div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Yearly Goal</CardTitle>
                  <CardDescription>Target yearly emissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">
                    {carbonData.targets.yearly} kg CO₂e
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Current: {carbonData.yearly.toFixed(0)} kg CO₂e
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min((carbonData.targets.yearly / carbonData.yearly) * 100, 100)}%`
                      }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CarbonTracker;

