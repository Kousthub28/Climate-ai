import React, { useState, useEffect, useMemo } from 'react';
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
import axios from 'axios';
import '../../App.css';
import { FaRobot, FaLeaf, FaArrowUp, FaArrowDown, FaExclamationTriangle, FaLightbulb, FaChartLine, FaArrowRight, FaRegSmile, FaRegMeh, FaRegFrown } from 'react-icons/fa';
import { useRef } from 'react';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const CarbonTracker = () => {
  // const { user } = useAuth(); // removed unused variable
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
  // removed unused climatiqResult, setClimatiqResult, climatiqError, setClimatiqError
  const [country, setCountry] = useState('US');

  // Real-time carbon estimation state
  const [estimationType, setEstimationType] = useState('car');
  const [estimationParams, setEstimationParams] = useState({
    distance: '', // for car/flight
    fuel_efficiency: '', // for car
    electricity_value: '', // for electricity
    electricity_unit: 'kwh',
    from: '', // for flight
    to: '', // for flight
    passengers: 1,
  });
  const [estimationResult, setEstimationResult] = useState(null);
  const [estimationLoading, setEstimationLoading] = useState(false);
  const [estimationError, setEstimationError] = useState('');

  // CSV analysis state
  const [csvAnalysis, setCsvAnalysis] = useState(null);
  const [csvLoading, setCsvLoading] = useState(true);
  const [csvError, setCsvError] = useState('');

  // User input for custom comparison/target values
  const [userDayTarget, setUserDayTarget] = useState('');
  const [userWeekTarget, setUserWeekTarget] = useState('');
  const [userMonthTarget, setUserMonthTarget] = useState('');
  const [userYearTarget, setUserYearTarget] = useState('');

  // Helper for safe percent diff
  const percentDiff = (actual, target) => target && !isNaN(target) ? (((actual - target) / target) * 100).toFixed(1) : '0';

  useEffect(() => {
    loadCarbonData();
    loadRecommendations();
    // Fetch CSV analysis from backend
    const fetchCsvAnalysis = async () => {
      setCsvLoading(true);
      setCsvError('');
      try {
        const res = await axios.get('/api/carbon/csv-analysis');
        setCsvAnalysis(res.data);
      } catch (err) {
        setCsvError('Failed to load carbon analysis.');
      } finally {
        setCsvLoading(false);
      }
    };
    fetchCsvAnalysis();
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
  // removed unused CLIMATIQ_ACTIVITIES

  // Helper to determine if country is required for the selected activity
  // removed unused requiresCountry

  // Handle real-time carbon estimation submit
  const handleEstimateCarbon = async (e) => {
    e.preventDefault();
    setEstimationLoading(true);
    setEstimationError('');
    setEstimationResult(null);
    try {
      let res;
      if (estimationType === 'car') {
        // Use Carbon Interface for car
        res = await axios.post('/api/carbon/estimate-ci', {
          type: 'vehicle',
          params: {
            distance_unit: 'km',
            distance_value: estimationParams.distance,
            vehicle_type: 'car',
            fuel_source: 'petrol',
          },
        });
        setEstimationResult(res.data.data || res.data);
      } else if (estimationType === 'flight') {
        // Use Carbon Interface for flight
        res = await axios.post('/api/carbon/estimate-ci', {
          type: 'flight',
          params: {
            legs: [
              {
                from: estimationParams.from,
                to: estimationParams.to,
              },
            ],
            passengers: estimationParams.passengers,
          },
        });
        setEstimationResult(res.data.data || res.data);
      } else if (estimationType === 'electricity') {
        // Use Carbon Interface for electricity
        res = await axios.post('/api/carbon/estimate-ci', {
          type: 'electricity',
          params: {
            electricity_unit: estimationParams.electricity_unit,
            electricity_value: estimationParams.electricity_value,
            country: country,
          },
        });
        setEstimationResult(res.data.data || res.data);
      }
    } catch {
      setEstimationError('Failed to estimate carbon.');
    } finally {
      setEstimationLoading(false);
    }
  };

  // --- AI/ML Analysis ---
  // Breakdown by category
  const breakdownData = useMemo(() => {
    if (!csvAnalysis || !csvAnalysis.sample) return [];
    const categoryTotals = {};
    csvAnalysis.sample.forEach(row => {
      const cat = row.category || 'Other';
      if (!categoryTotals[cat]) categoryTotals[cat] = 0;
      categoryTotals[cat] += row.emissions_kg || 0;
    });
    return Object.entries(categoryTotals).map(([category, value]) => ({ category, value }));
  }, [csvAnalysis]);

  // Anomaly detection: highlight days with >50% above average
  const dailyValues = csvAnalysis && csvAnalysis.daily ? Object.values(csvAnalysis.daily) : [];
  const dailyAvg = dailyValues.length ? dailyValues.reduce((a,b)=>a+b,0)/dailyValues.length : 0;
  const anomalies = csvAnalysis && csvAnalysis.daily ? Object.entries(csvAnalysis.daily).filter(([date, val]) => val > dailyAvg * 1.5) : [];

  // Simple forecast: linear regression for next week
  function linearRegression(y) {
    const n = y.length;
    const x = Array.from({length: n}, (_, i) => i+1);
    const xSum = x.reduce((a,b)=>a+b,0);
    const ySum = y.reduce((a,b)=>a+b,0);
    const xySum = x.reduce((sum, xi, i) => sum + xi*y[i], 0);
    const xxSum = x.reduce((sum, xi) => sum + xi*xi, 0);
    const slope = (n*xySum - xSum*ySum)/(n*xxSum - xSum*xSum);
    const intercept = (ySum - slope*xSum)/n;
    return { slope, intercept };
  }
  const forecast = (() => {
    if (!dailyValues.length) return null;
    const { slope, intercept } = linearRegression(dailyValues);
    const next7 = Array.from({length: 7}, (_, i) => slope * (dailyValues.length + i + 1) + intercept);
    return next7;
  })();

  // AI Insights
  const aiInsights = !csvAnalysis ? [] : [
    csvAnalysis.trend === 'increasing' ? 'Your emissions are trending up. Consider reviewing your highest categories.' :
    csvAnalysis.trend === 'decreasing' ? 'Great job! Your emissions are trending down.' :
    'Your emissions are stable. Try new reduction strategies.',
    anomalies.length ? `Unusually high emissions detected on: ${anomalies.map(([date]) => date).join(', ')}` : 'No major anomalies detected.',
    forecast ? `Next week forecast: ${forecast.map(v => v.toFixed(1)).join(', ')} kg CO₂e/day` : 'Forecast unavailable.'
  ];

  // Advanced analytics: category trends, emission hotspots, reduction opportunities
  const categoryTrends = useMemo(() => {
    if (!csvAnalysis || !csvAnalysis.sample) return [];
    const catMap = {};
    csvAnalysis.sample.forEach(row => {
      const cat = row.category || 'Other';
      if (!catMap[cat]) catMap[cat] = [];
      catMap[cat].push(row.emissions_kg || 0);
    });
    return Object.entries(catMap).map(([cat, vals]) => ({
      category: cat,
      avg: vals.reduce((a,b)=>a+b,0)/vals.length,
      max: Math.max(...vals),
      min: Math.min(...vals)
    })).sort((a,b)=>b.avg-a.avg);
  }, [csvAnalysis]);

  const emissionHotspots = useMemo(() => {
    if (!csvAnalysis || !csvAnalysis.daily) return [];
    return Object.entries(csvAnalysis.daily)
      .sort((a,b)=>b[1]-a[1])
      .slice(0,3)
      .map(([date, val]) => ({ date, val }));
  }, [csvAnalysis]);

  const reductionOpportunities = useMemo(() => {
    if (!categoryTrends.length) return [];
    return categoryTrends.slice(0,2).map(cat => `Focus on reducing ${cat.category} emissions for biggest impact.`);
  }, [categoryTrends]);

  // Confidence bar for forecast (simple: higher slope = lower confidence)
  const forecastConfidence = forecast && forecast.length ? Math.max(0, 100 - Math.abs(linearRegression(dailyValues).slope * 100)) : 0;

  // Typewriter effect for main insight
  const [typedInsight, setTypedInsight] = useState('');
  const [typing, setTyping] = useState(false);
  const mainInsight = aiInsights[0] || '';
  useEffect(() => {
    if (!mainInsight) return;
    setTypedInsight('');
    setTyping(true);
    let i = 0;
    const interval = setInterval(() => {
      setTypedInsight(mainInsight.slice(0, i + 1));
      i++;
      if (i >= mainInsight.length) {
        clearInterval(interval);
        setTyping(false);
      }
    }, 25);
    return () => clearInterval(interval);
  }, [mainInsight]);

  // Voice output for main insight
  const synthRef = useRef(window.speechSynthesis);
  const utterRef = useRef(null);
  const speakInsight = () => {
    if (!mainInsight) return;
    if (synthRef.current.speaking) synthRef.current.cancel();
    utterRef.current = new window.SpeechSynthesisUtterance(mainInsight);
    utterRef.current.rate = 1.05;
    utterRef.current.pitch = 1.1;
    synthRef.current.speak(utterRef.current);
  };
  const stopSpeaking = () => {
    if (synthRef.current.speaking) synthRef.current.cancel();
  };

  // Expandable insights
  const [expanded, setExpanded] = useState([false, false, false]);
  const toggleExpand = idx => setExpanded(arr => arr.map((v, i) => i === idx ? !v : v));

  // --- Dashboard Card Insights ---
  // Calculate daily, weekly, monthly stats
  const dailyArr = csvAnalysis && csvAnalysis.daily ? Object.values(csvAnalysis.daily) : [];
  const weeklyArr = csvAnalysis && csvAnalysis.weekly ? Object.values(csvAnalysis.weekly) : [];
  const monthlyArr = csvAnalysis && csvAnalysis.monthly ? Object.values(csvAnalysis.monthly) : [];
  const todayVal = dailyArr.length ? dailyArr[dailyArr.length-1] : 0;
  const weekVal = weeklyArr.length ? weeklyArr[weeklyArr.length-1] : 0;
  const monthVal = monthlyArr.length ? monthlyArr[monthlyArr.length-1] : 0;
  const prevDay = dailyArr.length > 1 ? dailyArr[dailyArr.length-2] : todayVal;
  const prevWeek = weeklyArr.length > 1 ? weeklyArr[weeklyArr.length-2] : weekVal;
  const prevMonth = monthlyArr.length > 1 ? monthlyArr[monthlyArr.length-2] : monthVal;
  const dayDelta = todayVal - prevDay;
  const weekDelta = weekVal - prevWeek;
  const monthDelta = monthVal - prevMonth;
  const dayTrend = dayDelta > 0 ? 'up' : dayDelta < 0 ? 'down' : 'flat';
  const weekTrend = weekDelta > 0 ? 'up' : weekDelta < 0 ? 'down' : 'flat';
  const monthTrend = monthDelta > 0 ? 'up' : monthDelta < 0 ? 'down' : 'flat';
  const dayPct = prevDay ? ((todayVal - prevDay) / prevDay * 100).toFixed(1) : '0';
  const weekPct = prevWeek ? ((weekVal - prevWeek) / prevWeek * 100).toFixed(1) : '0';
  const monthPct = prevMonth ? ((monthVal - prevMonth) / prevMonth * 100).toFixed(1) : '0';
  // Progress bars (vs. average)
  const avgDay = dailyArr.length ? dailyArr.reduce((a,b)=>a+b,0)/dailyArr.length : 0;
  const avgWeek = weeklyArr.length ? weeklyArr.reduce((a,b)=>a+b,0)/weeklyArr.length : 0;
  const avgMonth = monthlyArr.length ? monthlyArr.reduce((a,b)=>a+b,0)/monthlyArr.length : 0;

  // Dashboard card summaries (with user input)
  const todaySummary = !csvAnalysis ? '' : userDayTarget && !isNaN(Number(userDayTarget))
    ? `${percentDiff(todayVal, Number(userDayTarget))}% ${todayVal > Number(userDayTarget) ? 'above' : todayVal < Number(userDayTarget) ? 'below' : 'at'} your target`
    : prevDay === 0 ? 'No previous data.' : dayDelta > 0 ? `Up ${Math.abs(dayPct)}% from yesterday` : dayDelta < 0 ? `Down ${Math.abs(dayPct)}% from yesterday` : 'No change from yesterday';
  const weekSummary = !csvAnalysis ? '' : userWeekTarget && !isNaN(Number(userWeekTarget))
    ? `${percentDiff(weekVal, Number(userWeekTarget))}% ${weekVal > Number(userWeekTarget) ? 'above' : weekVal < Number(userWeekTarget) ? 'below' : 'at'} your target`
    : prevWeek === 0 ? 'No previous data.' : weekDelta > 0 ? `Up ${Math.abs(weekPct)}% from last week` : weekDelta < 0 ? `Down ${Math.abs(weekPct)}% from last week` : 'No change from last week';
  const monthSummary = !csvAnalysis ? '' : userMonthTarget && !isNaN(Number(userMonthTarget))
    ? `${percentDiff(monthVal, Number(userMonthTarget))}% ${monthVal > Number(userMonthTarget) ? 'above' : monthVal < Number(userMonthTarget) ? 'below' : 'at'} your target`
    : prevMonth === 0 ? 'No previous data.' : monthDelta > 0 ? `Up ${Math.abs(monthPct)}% from last month` : monthDelta < 0 ? `Down ${Math.abs(monthPct)}% from last month` : 'No change from last month';
  const yearSummary = !csvAnalysis ? '' : userYearTarget && !isNaN(Number(userYearTarget))
    ? `${percentDiff(csvAnalysis.totalEmissions, Number(userYearTarget))}% ${csvAnalysis.totalEmissions > Number(userYearTarget) ? 'above' : csvAnalysis.totalEmissions < Number(userYearTarget) ? 'below' : 'at'} your target`
    : csvAnalysis.totalEmissions < 4000 ? 'Below global average' : csvAnalysis.totalEmissions > 4000 ? 'Above global average' : 'At global average';

  // Generate PDF report
  const handleViewReport = async () => {
    const reportElement = document.getElementById('carbon-report-section');
    if (!reportElement) return;
    const canvas = await html2canvas(reportElement, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth - 40;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 20, 20, imgWidth, imgHeight);
    pdf.save('carbon_report.pdf');
  };

  // AI-powered tips logic
  const staticTips = [
    'Use public transport or carpool when possible.',
    'Switch to energy-efficient appliances.',
    'Reduce meat and dairy consumption.',
    'Recycle and compost waste.',
    'Set monthly carbon goals and track your progress.',
    'Unplug devices when not in use.',
    'Wash clothes in cold water.',
    'Plant a tree or support reforestation.',
    'Take shorter showers to save water and energy.',
    'Buy local and seasonal produce.'
  ];
  const aiPersonalizedTips = [
    ...(categoryTrends.length ? [`Focus on reducing your top emission category: ${categoryTrends[0].category}.`] : []),
    ...(csvAnalysis && csvAnalysis.trend === 'increasing' ? ['Your emissions are rising. Try to identify and cut back on your highest activities.'] : []),
    ...(reductionOpportunities.length ? [reductionOpportunities[0]] : []),
  ];
  const allTips = [...aiPersonalizedTips, ...staticTips];
  const [randomTip, setRandomTip] = useState('');
  const handleRandomTip = () => {
    const idx = Math.floor(Math.random() * allTips.length);
    setRandomTip(allTips[idx]);
  };

  if (csvLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600"></div>
      </div>
    );
  }
  if (csvError) {
    return <div className="text-red-600 text-center mt-8">{csvError}</div>;
  }
  if (!csvAnalysis) {
    return <div className="text-gray-600 text-center mt-8">No carbon data available.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div id="carbon-report-section" className="max-w-7xl mx-auto flex flex-col gap-10">
        {/* Header */}
        <div className="flex flex-col items-center justify-center gap-2 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center">
              Carbon Footprint Tracker
            </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-center">
              Monitor and reduce your environmental impact
            </p>
        </div>

        {/* Overview Cards - Redesigned with insights, trends, progress bars */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Today */}
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today</CardTitle>
              {dayTrend === 'up' ? <FaArrowUp className="h-4 w-4 text-red-500" /> : dayTrend === 'down' ? <FaArrowDown className="h-4 w-4 text-green-500" /> : <FaRegMeh className="h-4 w-4 text-gray-400" />}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">{todayVal.toFixed(1)} kg</div>
              <p className="text-xs text-muted-foreground">CO₂e emissions</p>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant={dayTrend === 'down' ? 'default' : dayTrend === 'up' ? 'destructive' : 'secondary'} className="text-xs">
                  {dayTrend === 'up' ? <FaArrowUp className="h-3 w-3 mr-1" /> : dayTrend === 'down' ? <FaArrowDown className="h-3 w-3 mr-1" /> : <FaRegMeh className="h-3 w-3 mr-1" />}
                  {dayTrend === 'up' ? `${dayPct}% higher` : dayTrend === 'down' ? `${Math.abs(dayPct)}% lower` : 'No change'}
                  </Badge>
                <span className="text-xs text-gray-500">Avg: {avgDay.toFixed(1)} kg</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
                <div className="h-2 rounded-full bg-gradient-to-r from-green-400 to-blue-400 transition-all duration-700" style={{ width: `${Math.min(100, todayVal / (avgDay || 1) * 100)}%` }}></div>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="text-xs text-gray-500">{todaySummary}</div>
                <input type="number" className="ml-2 p-1 border rounded text-xs w-20" placeholder="Your target" value={userDayTarget} onChange={e => setUserDayTarget(e.target.value)} />
              </div>
            </CardContent>
          </Card>
          {/* This Week */}
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              {weekTrend === 'up' ? <FaArrowUp className="h-4 w-4 text-red-500" /> : weekTrend === 'down' ? <FaArrowDown className="h-4 w-4 text-green-500" /> : <FaRegMeh className="h-4 w-4 text-gray-400" />}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">{weekVal.toFixed(1)} kg</div>
              <p className="text-xs text-muted-foreground">CO₂e emissions</p>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant={weekTrend === 'down' ? 'default' : weekTrend === 'up' ? 'destructive' : 'secondary'} className="text-xs">
                  {weekTrend === 'up' ? <FaArrowUp className="h-3 w-3 mr-1" /> : weekTrend === 'down' ? <FaArrowDown className="h-3 w-3 mr-1" /> : <FaRegMeh className="h-3 w-3 mr-1" />}
                  {weekTrend === 'up' ? `${weekPct}% higher` : weekTrend === 'down' ? `${Math.abs(weekPct)}% lower` : 'No change'}
                </Badge>
                <span className="text-xs text-gray-500">Avg: {avgWeek.toFixed(1)} kg</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
                <div className="h-2 rounded-full bg-gradient-to-r from-green-400 to-blue-400 transition-all duration-700" style={{ width: `${Math.min(100, weekVal / (avgWeek || 1) * 100)}%` }}></div>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="text-xs text-gray-500">{weekSummary}</div>
                <input type="number" className="ml-2 p-1 border rounded text-xs w-20" placeholder="Your target" value={userWeekTarget} onChange={e => setUserWeekTarget(e.target.value)} />
              </div>
            </CardContent>
          </Card>
          {/* This Month */}
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              {monthTrend === 'up' ? <FaArrowUp className="h-4 w-4 text-red-500" /> : monthTrend === 'down' ? <FaArrowDown className="h-4 w-4 text-green-500" /> : <FaRegMeh className="h-4 w-4 text-gray-400" />}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">{monthVal.toFixed(1)} kg</div>
              <p className="text-xs text-muted-foreground">CO₂e emissions</p>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant={monthTrend === 'down' ? 'default' : monthTrend === 'up' ? 'destructive' : 'secondary'} className="text-xs">
                  {monthTrend === 'up' ? <FaArrowUp className="h-3 w-3 mr-1" /> : monthTrend === 'down' ? <FaArrowDown className="h-3 w-3 mr-1" /> : <FaRegMeh className="h-3 w-3 mr-1" />}
                  {monthTrend === 'up' ? `${monthPct}% higher` : monthTrend === 'down' ? `${Math.abs(monthPct)}% lower` : 'No change'}
                  </Badge>
                <span className="text-xs text-gray-500">Avg: {avgMonth.toFixed(1)} kg</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
                <div className="h-2 rounded-full bg-gradient-to-r from-green-400 to-blue-400 transition-all duration-700" style={{ width: `${Math.min(100, monthVal / (avgMonth || 1) * 100)}%` }}></div>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="text-xs text-gray-500">{monthSummary}</div>
                <input type="number" className="ml-2 p-1 border rounded text-xs w-20" placeholder="Your target" value={userMonthTarget} onChange={e => setUserMonthTarget(e.target.value)} />
              </div>
            </CardContent>
          </Card>
          {/* This Year */}
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Year</CardTitle>
              <FaRegSmile className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">{csvAnalysis.totalEmissions.toFixed(1)} kg</div>
              <p className="text-xs text-muted-foreground">CO₂e emissions</p>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  Global Avg: 4000 kg
                </Badge>
                <span className="text-xs text-gray-500">{csvAnalysis.trend === 'decreasing' ? 'Trend: Decreasing' : csvAnalysis.trend === 'increasing' ? 'Trend: Increasing' : 'Trend: Flat'}</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
                <div className="h-2 rounded-full bg-gradient-to-r from-green-400 to-blue-400 transition-all duration-700" style={{ width: `${Math.min(100, (csvAnalysis ? csvAnalysis.totalEmissions : 0) / 4000 * 100)}%` }}></div>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="text-xs text-gray-500">{yearSummary}</div>
                <input type="number" className="ml-2 p-1 border rounded text-xs w-20" placeholder="Your target" value={userYearTarget} onChange={e => setUserYearTarget(e.target.value)} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights and Breakdown Chart - Redesigned */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10 justify-center">
          {/* AI Insights Chat Bubble */}
          <div className="flex flex-col items-start">
            <div className="flex items-center mb-2">
              <span className="relative flex h-12 w-12 mr-3" aria-label="Eco AI Avatar">
                <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60 animate-ping"></span>
                <span className="relative inline-flex rounded-full h-12 w-12 bg-gradient-to-br from-green-500 to-blue-400 flex items-center justify-center animate-bounce-slow">
                  <FaLeaf className="text-white text-xl" />
                  <FaRobot className="text-white text-lg absolute right-1 bottom-1" />
                </span>
              </span>
              <span className="font-bold text-lg text-green-700 dark:text-green-200">Eco AI</span>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900 dark:to-blue-900 p-5 shadow-lg max-w-xl w-full mb-2 animate-fade-in">
              {/* Typewriter effect for main insight */}
              <div className="flex items-center mb-2">
                {csvAnalysis.trend === 'increasing' && <FaArrowUp className="text-red-500 mr-2" />}
                {csvAnalysis.trend === 'decreasing' && <FaArrowDown className="text-green-500 mr-2" />}
                <span className={csvAnalysis.trend === 'increasing' ? 'text-red-600 font-semibold' : csvAnalysis.trend === 'decreasing' ? 'text-green-600 font-semibold' : 'text-gray-700 dark:text-gray-200'} aria-live="polite">
                  {typedInsight}
                  {typing && <span className="animate-blink">|</span>}
                </span>
                {/* Voice output buttons */}
                <button aria-label="Speak insight" className="ml-2 p-1 rounded-full bg-green-200 hover:bg-green-300" onClick={speakInsight} type="button"><FaRobot /></button>
                <button aria-label="Stop speaking" className="ml-1 p-1 rounded-full bg-red-200 hover:bg-red-300" onClick={stopSpeaking} type="button"><FaLeaf /></button>
              </div>
              {/* Expandable/clickable insights */}
              {[1,2].map((idx) => (
                <div key={idx} className="flex items-center mb-2 cursor-pointer group" onClick={() => toggleExpand(idx)} aria-expanded={expanded[idx]} tabIndex={0} role="button">
                  {idx === 1 ? (anomalies.length ? <FaExclamationTriangle className="text-yellow-500 mr-2" /> : <FaLightbulb className="text-green-400 mr-2" />) : <FaChartLine className="text-blue-500 mr-2" />}
                  <span>{aiInsights[idx]}</span>
                  <span className="ml-2 text-xs text-blue-500 group-hover:underline">{expanded[idx] ? 'Show less' : 'Show more'}</span>
                  {expanded[idx] && (
                    <div className="ml-4 text-xs text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 rounded p-2 shadow animate-fade-in">
                      {idx === 1 && anomalies.length ? (
                        <ul>
                          {anomalies.map(([date, val], i) => <li key={i}>{date}: {val.toFixed(1)} kg</li>)}
                        </ul>
                      ) : idx === 2 && forecast ? (
                        <div>Forecast values:<br />{forecast.map((v, i) => `Day ${i+1}: ${v.toFixed(1)} kg`).join(', ')}</div>
                      ) : null}
                    </div>
                  )}
                </div>
              ))}
              {/* Confidence bar */}
              {forecast && (
                <div className="mt-2">
                  <div className="text-xs text-gray-500 mb-1">AI Confidence</div>
                  <div className="w-full h-2 bg-gray-200 rounded-full" aria-label="AI Confidence Bar">
                    <div className="h-2 rounded-full bg-gradient-to-r from-green-400 to-blue-400 transition-all duration-700" style={{ width: `${forecastConfidence}%` }}></div>
                  </div>
                </div>
              )}
            </div>
            {/* Advanced analytics: category trends, hotspots, reduction */}
            <div className="mt-2 space-y-1 text-sm">
              <div data-tooltip-id="cat-trend-tip" data-tooltip-content="Categories with highest average emissions."><span className="font-semibold">Top Emission Categories:</span> {categoryTrends.map(c => c.category).join(', ')}</div>
              <div data-tooltip-id="hotspot-tip" data-tooltip-content="Days with highest emissions."><span className="font-semibold">Emission Hotspots:</span> {emissionHotspots.map(h => `${h.date} (${h.val.toFixed(1)} kg)`).join(', ')}</div>
              <div data-tooltip-id="reduction-tip" data-tooltip-content="AI-suggested focus areas for reduction."><span className="font-semibold">Reduction Opportunities:</span> {reductionOpportunities.join(' | ')}</div>
              <ReactTooltip id="cat-trend-tip" />
              <ReactTooltip id="hotspot-tip" />
              <ReactTooltip id="reduction-tip" />
            </div>
          </div>
          {/* Breakdown Pie Chart */}
          <Card className="shadow-xl animate-fade-in">
            <CardHeader>
              <CardTitle>Emissions Breakdown</CardTitle>
              <CardDescription>By activity/category (sample)</CardDescription>
            </CardHeader>
            <CardContent>
              <CarbonChart type="breakdown" data={breakdownData} />
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="recommendations">Tips</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Total Emissions Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Total Emissions</CardTitle>
                  <CardDescription>Total emissions from your CSV data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-green-700 dark:text-green-200">
                    {csvAnalysis.totalEmissions.toFixed(2)} kg CO₂e
                  </div>
                  <div className="text-sm text-gray-600 mt-2">Trend: <span className="font-semibold">{csvAnalysis.trend}</span></div>
                </CardContent>
              </Card>
                  </div>
            {/* Daily, Weekly, Monthly Emissions Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 mb-8">
              {/* Daily */}
              <Card className="shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Daily Emissions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-700">{todayVal.toFixed(1)} kg</div>
                  <div className="text-xs text-gray-500 mt-1">{todaySummary}</div>
                </CardContent>
              </Card>
              {/* Weekly */}
              <Card className="shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Weekly Emissions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-700">{weekVal.toFixed(1)} kg</div>
                  <div className="text-xs text-gray-500 mt-1">{weekSummary}</div>
                </CardContent>
              </Card>
              {/* Monthly */}
              <Card className="shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Emissions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-700">{monthVal.toFixed(1)} kg</div>
                  <div className="text-xs text-gray-500 mt-1">{monthSummary}</div>
                </CardContent>
              </Card>
            </div>
            {/* (Removed Weekly and Monthly Chart Cards as requested) */}
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="flex justify-center">
            <Card className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900 dark:to-blue-900 shadow-lg p-8 rounded-2xl max-w-2xl w-full">
              <CardHeader className="mb-2">
                <CardTitle className="text-2xl font-bold mb-1 text-green-700 dark:text-green-200">AI-Powered Tips</CardTitle>
                <CardDescription className="text-base">
                  {csvAnalysis.trend === 'increasing' && <span className="text-red-600 font-semibold">Your emissions are increasing. Try to reduce your top activities.</span>}
                  {csvAnalysis.trend === 'decreasing' && <span className="text-green-600 font-semibold">Great job! Your emissions are decreasing. Keep up the sustainable habits.</span>}
                  {csvAnalysis.trend === 'flat' && <span className="text-gray-700 dark:text-gray-200">Your emissions are stable. Try new ways to reduce your carbon footprint.</span>}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* AI-personalized tips */}
                {aiPersonalizedTips.length > 0 && (
                  <div className="mb-4 p-4 rounded-xl bg-green-100 dark:bg-green-800 shadow flex flex-col gap-2">
                    <div className="font-semibold text-green-800 dark:text-green-100 flex items-center gap-2">
                      <span role="img" aria-label="ai">🤖</span> Personalized for you:
                        </div>
                    {aiPersonalizedTips.map((tip, i) => (
                      <div key={i} className="pl-2 text-green-900 dark:text-green-50">{tip}</div>
                    ))}
                          </div>
                )}
                {/* Static tips grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  {staticTips.map((tip, i) => (
                    <div key={i} className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
                      <span role="img" aria-label="tip">🌱</span> <span>{tip}</span>
                        </div>
                  ))}
                      </div>
                {/* Eco-Challenge generator */}
                <div className="flex flex-col items-center gap-3 mt-4">
                  <button onClick={handleRandomTip} className="px-4 py-2 rounded-full bg-green-500 text-white hover:bg-green-600 transition flex items-center gap-2 text-lg shadow">
                    <span role="img" aria-label="spark">✨</span> Generate Eco-Challenge
                  </button>
                  {randomTip && (
                    <div className="mt-2 px-4 py-3 rounded-2xl bg-green-50 dark:bg-green-900 shadow animate-fade-in flex items-center gap-2 text-base font-medium">
                      <span role="img" aria-label="ai">🤖</span> <span>{randomTip}</span>
                        </div>
                  )}
                      </div>
                    </CardContent>
                  </Card>
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
                    {csvAnalysis.daily && Object.values(csvAnalysis.daily).length > 0 ? (Object.values(csvAnalysis.daily).reduce((a,b)=>a+b,0)/Object.values(csvAnalysis.daily).length).toFixed(1) : 0} kg CO₂e
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Current: {csvAnalysis.daily && Object.values(csvAnalysis.daily).length > 0 ? (Object.values(csvAnalysis.daily).slice(-1)[0]).toFixed(1) : 0} kg CO₂e
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
                    {csvAnalysis.monthly && Object.values(csvAnalysis.monthly).length > 0 ? (Object.values(csvAnalysis.monthly).reduce((a,b)=>a+b,0)/Object.values(csvAnalysis.monthly).length).toFixed(1) : 0} kg CO₂e
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Current: {csvAnalysis.monthly && Object.values(csvAnalysis.monthly).length > 0 ? (Object.values(csvAnalysis.monthly).slice(-1)[0]).toFixed(1) : 0} kg CO₂e
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
                    {csvAnalysis.totalEmissions.toFixed(0)} kg CO₂e
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Current: {csvAnalysis.totalEmissions.toFixed(0)} kg CO₂e
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

