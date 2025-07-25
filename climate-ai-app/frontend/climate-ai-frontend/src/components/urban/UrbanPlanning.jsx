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
  Building,
  TreePine,
  Car,
  Zap,
  Droplets,
  Wind,
  MapPin,
  TrendingUp,
  TrendingDown,
  Target,
  Lightbulb,
  Users,
  Factory,
  Home,
  Bus,
  Recycle,
  Sun,
  Leaf,
  BarChart3,
  Map,
  Calculator,
  Brain,
} from 'lucide-react';
import { urbanAPI, chatAPI } from '../../services/api';
import '../../App.css';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle as DialogTitleUI, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import html2pdf from 'html2pdf.js';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const UrbanPlanning = () => {
  const { user } = useAuth();
  const [cityData, setCityData] = useState({
    name: 'New York City',
    population: 8400000,
    area: 783, // km²
    sustainability: {
      score: 72,
      rank: 15,
      categories: {
        energy: 78,
        transportation: 65,
        waste: 80,
        greenSpace: 68,
        airQuality: 70,
        waterManagement: 75,
      }
    },
    infrastructure: {
      greenBuildings: 1250,
      renewableEnergy: 35, // percentage
      publicTransport: 85, // coverage percentage
      recyclingRate: 67,
      greenSpaces: 23, // percentage of city area
      electricVehicles: 12, // percentage of vehicles
    },
    challenges: [
      {
        id: 1,
        title: 'Air Quality Improvement',
        priority: 'High',
        impact: 'High',
        description: 'Reduce air pollution through better traffic management and industrial regulations.',
        solutions: ['Electric bus fleet', 'Low emission zones', 'Industrial filters'],
        timeline: '2-3 years',
        cost: '$2.5B',
      },
      {
        id: 2,
        title: 'Urban Heat Island Effect',
        priority: 'High',
        impact: 'Medium',
        description: 'Mitigate rising temperatures through green infrastructure and cool roofing.',
        solutions: ['Green roofs', 'Urban forests', 'Cool pavements'],
        timeline: '3-5 years',
        cost: '$1.8B',
      },
      {
        id: 3,
        title: 'Waste Management Optimization',
        priority: 'Medium',
        impact: 'Medium',
        description: 'Improve recycling rates and implement circular economy principles.',
        solutions: ['Smart bins', 'Waste-to-energy', 'Composting programs'],
        timeline: '1-2 years',
        cost: '$800M',
      },
    ],
    projects: [
      {
        id: 1,
        name: 'Central Park Expansion',
        type: 'Green Infrastructure',
        status: 'In Progress',
        completion: 65,
        budget: '$150M',
        impact: 'Increase green space by 15%',
        timeline: '2024-2026',
      },
      {
        id: 2,
        name: 'Smart Traffic System',
        type: 'Transportation',
        status: 'Planning',
        completion: 20,
        budget: '$300M',
        impact: 'Reduce traffic congestion by 25%',
        timeline: '2025-2027',
      },
      {
        id: 3,
        name: 'Solar Panel Initiative',
        type: 'Energy',
        status: 'Active',
        completion: 80,
        budget: '$500M',
        impact: 'Add 200MW renewable capacity',
        timeline: '2023-2025',
      },
    ]
  });
  const [selectedScenario, setSelectedScenario] = useState('current');
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [reportOpen, setReportOpen] = useState(false);
  const reportRef = React.useRef();
  const [mapOpen, setMapOpen] = useState(false);
  // Default to New York City if no coordinates
  const cityLat = cityData?.lat || 40.7128;
  const cityLng = cityData?.lng || -74.0060;

  const [challenges, setChallenges] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [aiInsight, setAiInsight] = useState({});
  const [city, setCity] = useState('New York City');
  const [metrics, setMetrics] = useState({}); // e.g., { energy: 78, transportation: 65, ... }

  useEffect(() => {
    // Fetch challenges and metrics from backend
    const fetchData = () => {
      fetch(`/api/urban/challenges?city=${encodeURIComponent(city)}`)
        .then(res => res.json())
        .then(data => setChallenges(Array.isArray(data) ? data : []));
      fetch(`/api/urban/metrics?city=${encodeURIComponent(city)}`)
        .then(res => res.json())
        .then(data => setMetrics(data));
    };
    fetchData();
    const interval = setInterval(fetchData, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [city]);

  const handleViewDetails = async (id, challenge) => {
    setExpandedId(id);
    const res = await fetch('/api/ai/urban-insight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challenge, city, metrics })
    });
    const data = await res.json();
    setAiInsight(prev => ({ ...prev, [id]: data.insight }));
  };

  // Remove the real-time OpenAQ air quality form and related logic

  useEffect(() => {
    loadUrbanData();
    loadAIRecommendations();
  }, []);

  const loadUrbanData = async () => {
    try {
      setLoading(true);
      // Mock data - in production, fetch from API
      // const response = await urbanAPI.getCityData(cityId);
      // setCityData(response.data);
    } catch (error) {
      console.error('Error loading urban data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAIRecommendations = async () => {
    try {
      const mockRecommendations = [
        {
          id: 1,
          title: 'Implement Smart Grid Technology',
          category: 'Energy',
          priority: 'High',
          description: 'Deploy smart grid infrastructure to optimize energy distribution and reduce waste by 20%.',
          benefits: ['20% energy savings', 'Improved reliability', 'Better renewable integration'],
          cost: '$1.2B',
          timeline: '3-4 years',
          co2Reduction: 150000, // tons per year
        },
        {
          id: 2,
          title: 'Expand Bike Lane Network',
          category: 'Transportation',
          priority: 'Medium',
          description: 'Create 500km of protected bike lanes to encourage sustainable transportation.',
          benefits: ['Reduced traffic', 'Improved air quality', 'Health benefits'],
          cost: '$200M',
          timeline: '2-3 years',
          co2Reduction: 50000,
        },
        {
          id: 3,
          title: 'Vertical Forest Buildings',
          category: 'Green Infrastructure',
          priority: 'Medium',
          description: 'Mandate green facades for new buildings to improve air quality and reduce urban heat.',
          benefits: ['Better air quality', 'Temperature reduction', 'Biodiversity'],
          cost: '$800M',
          timeline: '5-7 years',
          co2Reduction: 75000,
        },
        {
          id: 4,
          title: 'Circular Economy Hub',
          category: 'Waste Management',
          priority: 'High',
          description: 'Establish industrial symbiosis networks where waste from one industry becomes input for another.',
          benefits: ['90% waste reduction', 'Job creation', 'Economic growth'],
          cost: '$600M',
          timeline: '2-4 years',
          co2Reduction: 100000,
        },
      ];
      setAiRecommendations(mockRecommendations);
    } catch (error) {
      console.error('Error loading AI recommendations:', error);
    }
  };

  const handleDownloadPDF = () => {
    if (reportRef.current) {
      html2pdf().from(reportRef.current).set({
        margin: 0.5,
        filename: `${cityData.name.replace(/\s+/g, '_')}_Urban_Report.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      }).save();
    }
  };

  // Remove the handleAirQualitySearch function

  const getCategoryIcon = (category) => {
    const icons = {
      energy: Zap,
      transportation: Car,
      waste: Recycle,
      greenSpace: TreePine,
      airQuality: Wind,
      waterManagement: Droplets,
      'Green Infrastructure': TreePine,
      'Transportation': Bus,
      'Energy': Sun,
      'Waste Management': Recycle,
    };
    return icons[category] || Building;
  };

  const getCategoryColor = (category) => {
    const colors = {
      energy: '#f59e0b',
      transportation: '#3b82f6',
      waste: '#10b981',
      greenSpace: '#22c55e',
      airQuality: '#06b6d4',
      waterManagement: '#0ea5e9',
      'Green Infrastructure': '#22c55e',
      'Transportation': '#3b82f6',
      'Energy': '#f59e0b',
      'Waste Management': '#10b981',
    };
    return colors[category] || '#6b7280';
  };

  const getPriorityBadgeColor = (priority) => {
    switch (priority) {
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

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Active':
      case 'In Progress':
        return 'default';
      case 'Planning':
        return 'secondary';
      case 'Completed':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const formatCurrency = (amount) => {
    if (amount >= 1000000000) {
      return `$${(amount / 1000000000).toFixed(1)}B`;
    } else if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(0)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
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
              Urban Planning & Sustainability
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              AI-powered insights for sustainable city development
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Dialog open={mapOpen} onOpenChange={setMapOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => setMapOpen(true)}>
                  <Map className="h-4 w-4 mr-2" />
                  View Map
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl h-[500px]">
                <DialogHeader>
                  <DialogTitleUI>City Map</DialogTitleUI>
                  <DialogDescription>Map centered on {cityData.name}.</DialogDescription>
                </DialogHeader>
                <div className="w-full h-[400px] rounded overflow-hidden">
                  <MapContainer center={[cityLat, cityLng]} zoom={12} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[cityLat, cityLng]}>
                      <Popup>{cityData.name}</Popup>
                    </Marker>
                  </MapContainer>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Close</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog open={reportOpen} onOpenChange={setReportOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => setReportOpen(true)}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto print:max-h-none print:overflow-visible">
                <DialogHeader>
                  <DialogTitleUI>Urban Sustainability Report</DialogTitleUI>
                  <DialogDescription>Summary of city sustainability, challenges, projects, and AI recommendations.</DialogDescription>
                </DialogHeader>
                <div ref={reportRef} className="space-y-6 p-4 bg-white dark:bg-gray-900 rounded print:bg-white print:text-black">
                  <h2 className="text-2xl font-bold mb-4 text-center">{cityData.name} Urban Sustainability Report</h2>
                  <div className="text-base text-gray-700 dark:text-gray-200">
                    <strong>Population:</strong> {cityData.population.toLocaleString()}<br />
                    <strong>Area:</strong> {cityData.area} km²<br />
                    <strong>Sustainability Score:</strong> {cityData.sustainability.score}/100 (Rank #{cityData.sustainability.rank})
                  </div>
                  <div>
                    <h3 className="font-semibold mt-4 mb-2">Sustainability Categories</h3>
                    <ul className="list-disc ml-8">
                      {Object.entries(cityData.sustainability.categories).map(([cat, val]) => (
                        <li key={cat} className="mb-1">{cat.replace(/([A-Z])/g, ' $1').trim()}: {val}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mt-4 mb-2">Challenges</h3>
                    <ul className="list-disc ml-8">
                      {cityData.challenges.map(ch => (
                        <li key={ch.id} className="mb-1"><strong>{ch.title}</strong>: {ch.description} (Priority: {ch.priority}, Impact: {ch.impact})</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mt-4 mb-2">Projects</h3>
                    <ul className="list-disc ml-8">
                      {cityData.projects.map(pr => (
                        <li key={pr.id} className="mb-1"><strong>{pr.name}</strong> ({pr.type}): {pr.impact}, Status: {pr.status}, Completion: {pr.completion}%, Budget: {pr.budget}, Timeline: {pr.timeline}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mt-4 mb-2">AI Recommendations</h3>
                    <ul className="list-disc ml-8">
                      {aiRecommendations.map(rec => (
                        <li key={rec.id} className="mb-1"><strong>{rec.title}</strong> ({rec.category}): {rec.description} (Priority: {rec.priority}, CO₂ Reduction: {rec.co2Reduction.toLocaleString()} tons/year)</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleDownloadPDF} variant="default">Download as PDF</Button>
                  <DialogClose asChild>
                    <Button variant="outline">Close</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* City Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                  <Building className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">{cityData.name}</CardTitle>
                  <CardDescription>
                    Population: {cityData.population.toLocaleString()} • Area: {cityData.area} km²
                  </CardDescription>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  {cityData.sustainability.score}/100
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Sustainability Score
                </p>
                <Badge variant="outline" className="mt-1">
                  Rank #{cityData.sustainability.rank} globally
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {Object.entries(cityData.sustainability.categories).map(([category, score]) => {
                const IconComponent = getCategoryIcon(category);
                const color = getCategoryColor(category);
                
                return (
                  <div key={category} className="text-center">
                    <div className="flex justify-center mb-2">
                      <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
                        <IconComponent className="h-4 w-4" style={{ color }} />
                      </div>
                    </div>
                    <div className="text-lg font-semibold">{score}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                      {category.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="challenges">Challenges</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building className="h-5 w-5 text-green-600" />
                    <span>Green Buildings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">
                    {cityData.infrastructure.greenBuildings.toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    LEED certified buildings
                  </p>
                  <div className="mt-2">
                    <Badge variant="default" className="text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +15% this year
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Sun className="h-5 w-5 text-yellow-600" />
                    <span>Renewable Energy</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">
                    {cityData.infrastructure.renewableEnergy}%
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Of total energy consumption
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-yellow-600 h-2 rounded-full"
                      style={{ width: `${cityData.infrastructure.renewableEnergy}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bus className="h-5 w-5 text-blue-600" />
                    <span>Public Transport</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">
                    {cityData.infrastructure.publicTransport}%
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Population coverage
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${cityData.infrastructure.publicTransport}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Recycle className="h-5 w-5 text-green-600" />
                    <span>Recycling Rate</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">
                    {cityData.infrastructure.recyclingRate}%
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Waste recycled annually
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${cityData.infrastructure.recyclingRate}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TreePine className="h-5 w-5 text-green-600" />
                    <span>Green Spaces</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">
                    {cityData.infrastructure.greenSpaces}%
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Of total city area
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${cityData.infrastructure.greenSpaces}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Car className="h-5 w-5 text-blue-600" />
                    <span>Electric Vehicles</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">
                    {cityData.infrastructure.electricVehicles}%
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Of total vehicle fleet
                  </p>
                  <div className="mt-2">
                    <Badge variant="secondary" className="text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +8% this year
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Challenges Tab */}
          <TabsContent value="challenges" className="space-y-6">
            <Alert>
              <Brain className="h-4 w-4" />
              <AlertDescription>
                AI-powered recommendations based on city data analysis, global best practices, and sustainability goals.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4">
              {(Array.isArray(challenges) ? challenges : []).map((challenge) => (
                <Card key={challenge.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{challenge.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {challenge.description}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getPriorityBadgeColor(challenge.priority)}>
                          {challenge.priority} Priority
                        </Badge>
                        <Badge variant="outline">
                          {challenge.impact} Impact
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-2">Proposed Solutions:</h4>
                        <ul className="space-y-1">
                          {challenge.solutions.map((solution, index) => (
                            <li key={index} className="flex items-center space-x-2 text-sm">
                              <Lightbulb className="h-3 w-3 text-yellow-600" />
                              <span>{solution}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Timeline:</span>
                          <span className="font-medium">{challenge.timeline}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Estimated Cost:</span>
                          <span className="font-medium">{challenge.cost}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cityData.projects.map((project) => {
                const IconComponent = getCategoryIcon(project.type);
                const color = getCategoryColor(project.type);
                
                return (
                  <Card key={project.id}>
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
                          <IconComponent className="h-4 w-4" style={{ color }} />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{project.name}</CardTitle>
                          <CardDescription>{project.type}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant={getStatusBadgeColor(project.status)}>
                          {project.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {project.completion}% Complete
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${project.completion}%` }}
                          ></div>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Budget:</span>
                            <span className="font-medium">{project.budget}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Timeline:</span>
                            <span className="font-medium">{project.timeline}</span>
                          </div>
                        </div>
                        
                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            <strong>Impact:</strong> {project.impact}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="ai-insights" className="space-y-6">
            <Alert>
              <Brain className="h-4 w-4" />
              <AlertDescription>
                AI-powered recommendations based on city data analysis, global best practices, and sustainability goals.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4">
              {aiRecommendations.map((rec) => {
                const IconComponent = getCategoryIcon(rec.category);
                const color = getCategoryColor(rec.category);
                
                return (
                  <Card key={rec.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
                            <IconComponent className="h-4 w-4" style={{ color }} />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{rec.title}</CardTitle>
                            <CardDescription>{rec.category}</CardDescription>
                          </div>
                        </div>
                        <Badge variant={getPriorityBadgeColor(rec.priority)}>
                          {rec.priority} Priority
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {rec.description}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-2">Key Benefits:</h4>
                          <ul className="space-y-1">
                            {rec.benefits.map((benefit, index) => (
                              <li key={index} className="flex items-center space-x-2 text-sm">
                                <Target className="h-3 w-3 text-green-600" />
                                <span>{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Investment:</span>
                            <span className="font-medium">{rec.cost}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Timeline:</span>
                            <span className="font-medium">{rec.timeline}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">CO₂ Reduction:</span>
                            <span className="font-medium text-green-600">
                              {rec.co2Reduction.toLocaleString()} tons/year
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-2">
                          <Calculator className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium">
                            ROI: {((rec.co2Reduction * 50) / parseFloat(rec.cost.replace(/[$BM]/g, '')) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <Button size="sm">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UrbanPlanning;

