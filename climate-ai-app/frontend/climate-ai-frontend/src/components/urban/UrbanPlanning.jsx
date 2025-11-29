import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Lightbulb, TrendingUp, TrendingDown, Leaf, Zap, Car, Trash2, ShoppingBag, Droplets, Utensils, Globe, Award, Trophy, Flame, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import html2canvas from 'html2canvas';
import { MapContainer, TileLayer, Marker, Popup, Tooltip as LeafletTooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import * as L from 'leaflet';

const regionCoords = {
  'India': [20.5937, 78.9629],
  'USA': [37.0902, -95.7129],
  'Germany': [51.1657, 10.4515],
  'Brazil': [-14.2350, -51.9253],
  'Australia': [-25.2744, 133.7751],
  // Add more as needed
};

const UrbanPlanning = () => {
  const [csvData, setCsvData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [regionOptions, setRegionOptions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [compareRegion, setCompareRegion] = useState('');
  const [drilldown, setDrilldown] = useState({ open: false, category: '', year: '' });
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const trendsChartRef = useRef();
  const breakdownChartRef = useRef();

  // Fetch CSV data
  useEffect(() => {
    setLoading(true);
    setError('');
    fetch('/api/urban/csv-analysis')
      .then(res => res.json())
      .then(data => {
        setHeaders(data.headers);
        setCsvData(data.data);
        // Build region options
        const regions = Array.from(
          new Set(
            (Array.isArray(data.data) ? data.data.map(row => (row.region || '').trim()) : []).filter(Boolean)
          )
        );
        setRegionOptions(regions);
        if (regions.length > 0) setSelectedRegion(regions[0]);
        // Set default date range (YYYY-MM)
        const months = Array.from(new Set((data.data || []).map(row => row.date?.slice(0, 7)).filter(Boolean))).sort();
        if (months.length > 0) setDateRange({ start: months[0], end: months[months.length - 1] });
      })
      .catch(() => setError('Failed to load carbon emissions data.'))
      .finally(() => setLoading(false));
  }, []);

  // Filtered data for selected region and date range
  const filterRows = (region) => Array.isArray(csvData)
    ? csvData.filter(row => {
        const regionMatch = (row.region || '').trim() === region;
        const month = row.date?.slice(0, 7);
        const start = dateRange.start;
        const end = dateRange.end;
        const monthMatch = (!start || month >= start) && (!end || month <= end);
        return regionMatch && monthMatch;
      })
    : [];
  const regionRows = filterRows(selectedRegion);
  const compareRows = compareRegion ? filterRows(compareRegion) : [];

  // Trends data: total emissions per year
  const trendsData = (rows) => {
    const byYear = {};
    rows.forEach(row => {
      const year = row.date?.slice(0, 4);
      if (!year) return;
      byYear[year] = (byYear[year] || 0) + (Number(row.emissions_kg) || 0);
    });
    return Object.entries(byYear).map(([year, value]) => ({ year, total_emissions: value / 1000 })); // kg to t
  };

  // Breakdown data: emissions by category for latest year
  const breakdownData = (rows) => {
    if (rows.length === 0) return [];
    const years = rows.map(r => r.date?.slice(0, 4)).filter(Boolean);
    const latestYear = Math.max(...years.map(Number));
    const yearRows = rows.filter(r => r.date?.slice(0, 4) === String(latestYear));
    const byCategory = {};
    yearRows.forEach(row => {
      const cat = row.category || 'Other';
      byCategory[cat] = (byCategory[cat] || 0) + (Number(row.emissions_kg) || 0);
    });
    return Object.entries(byCategory).map(([category, value]) => ({ category, value: value / 1000, year: latestYear }));
  };

  // AI Insights
  const aiInsights = (rows) => {
    if (rows.length === 0) return null;
    const years = rows.map(r => r.date?.slice(0, 4)).filter(Boolean);
    const allYears = Array.from(new Set(years)).sort();
    const latestYear = Math.max(...years.map(Number));
    const yearRows = rows.filter(r => r.date?.slice(0, 4) === String(latestYear));
    const byCategory = {};
    yearRows.forEach(row => {
      const cat = row.category || 'Other';
      byCategory[cat] = (byCategory[cat] || 0) + (Number(row.emissions_kg) || 0);
    });
    const sorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
    // Trend
    const trendData = trendsData(rows).sort((a, b) => a.year.localeCompare(b.year));
    let trend = 'flat';
    if (trendData.length > 1) {
      const first = trendData[0].total_emissions;
      const last = trendData[trendData.length - 1].total_emissions;
      if (last > first * 1.05) trend = 'increasing';
      else if (last < first * 0.95) trend = 'decreasing';
    }
    // Anomaly detection: years with >50% above avg
    const avg = trendData.reduce((a, b) => a + b.total_emissions, 0) / (trendData.length || 1);
    const anomalies = trendData.filter(d => d.total_emissions > avg * 1.5).map(d => d.year);
    // Recommendation
    let recommendation = '';
    if (trend === 'increasing') recommendation = 'Emissions are rising. Focus on top categories and recent years.';
    else if (trend === 'decreasing') recommendation = 'Emissions are decreasing. Keep up the good work and target remaining high categories.';
    else recommendation = 'Emissions are stable. Review top categories for further reduction.';
    return {
      latestYear,
      topCategory: sorted[0]?.[0] || '',
      topValue: sorted[0] ? (sorted[0][1] / 1000).toFixed(2) : '',
      trend,
      anomalies,
      recommendation,
      trendData
    };
  };

  // Download CSV for selected region
  const handleDownloadCSV = (rows, region) => {
    if (!rows.length) return;
    const csv = [headers.join(',')].concat(
      rows.map(row => headers.map(h => row[h] || '').join(','))
    ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${region}_carbon_emissions.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Drilldown data for modal
  const drilldownRows = regionRows.filter(
    row => row.category === drilldown.category && row.date?.slice(0, 4) === String(drilldown.year)
  );

  // Months for date range selector
  const allMonths = Array.from(new Set((csvData || []).map(row => row.date?.slice(0, 7)).filter(Boolean))).sort();

  // Table data for filtered region and date range
  const tableRows = regionRows;

  // Chart colors
  const regionColor = '#3b82f6';
  const compareColor = '#f59e42';
  const pieColors = ['#3b82f6', '#f59e42', '#10b981', '#f87171', '#6366f1', '#fbbf24', '#a21caf', '#0ea5e9', '#e11d48'];

  // Export chart as image
  const handleExportChart = async (ref, name) => {
    if (!ref.current) return;
    const canvas = await html2canvas(ref.current, { backgroundColor: null });
    const link = document.createElement('a');
    link.download = `${name}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  // Extra AI summary
  const aiSummary = (() => {
    const rows = regionRows;
    if (!rows.length) return '';
    const ai = aiInsights(rows);
    if (!ai) return '';
    return `From ${dateRange.start} to ${dateRange.end}, ${selectedRegion} emitted a total of ${trendsData(rows).reduce((a, b) => a + b.total_emissions, 0).toFixed(2)} tCO₂. The top emission category in ${ai.latestYear} was ${ai.topCategory} (${ai.topValue} tCO₂). The overall trend is ${ai.trend}. ${ai.recommendation}`;
  })();

  // Pie chart data: emissions by category for selected region and date range
  const pieData = (() => {
    if (regionRows.length === 0) return [];
    const byCategory = {};
    regionRows.forEach(row => {
      const cat = row.category || 'Other';
      byCategory[cat] = (byCategory[cat] || 0) + (Number(row.emissions_kg) || 0);
    });
    return Object.entries(byCategory).map(([category, value]) => ({ name: category, value: value / 1000 }));
  })();

  // Area chart data: cumulative emissions over time
  const areaData = (() => {
    const sorted = trendsData(regionRows).sort((a, b) => a.year.localeCompare(b.year));
    let cumulative = 0;
    return sorted.map(d => {
      cumulative += d.total_emissions;
      return { ...d, cumulative };
    });
  })();

  // Top 3 emission tips with icons and color
  const emissionTips = (() => {
    if (regionRows.length === 0) return [];
    const byCategory = {};
    regionRows.forEach(row => {
      const cat = row.category || 'Other';
      byCategory[cat] = (byCategory[cat] || 0) + (Number(row.emissions_kg) || 0);
    });
    const sorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
    const tips = {
      'energy': { tip: 'Switch to renewable energy sources and improve energy efficiency at home and work.', icon: <Zap className="text-yellow-500 w-6 h-6" />, color: 'bg-yellow-50 border-yellow-300' },
      'transportation': { tip: 'Use public transport, carpool, bike, or walk to reduce transportation emissions.', icon: <Car className="text-blue-500 w-6 h-6" />, color: 'bg-blue-50 border-blue-300' },
      'waste': { tip: 'Reduce, reuse, and recycle. Compost organic waste and avoid single-use plastics.', icon: <Trash2 className="text-green-600 w-6 h-6" />, color: 'bg-green-50 border-green-300' },
      'goods': { tip: 'Buy less, choose sustainable products, and support circular economy initiatives.', icon: <ShoppingBag className="text-purple-500 w-6 h-6" />, color: 'bg-purple-50 border-purple-300' },
      'water': { tip: 'Conserve water and fix leaks to reduce water-related emissions.', icon: <Droplets className="text-cyan-500 w-6 h-6" />, color: 'bg-cyan-50 border-cyan-300' },
      'food_waste': { tip: 'Plan meals, store food properly, and compost to minimize food waste.', icon: <Utensils className="text-orange-500 w-6 h-6" />, color: 'bg-orange-50 border-orange-300' },
      'plastic': { tip: 'Avoid single-use plastics and support plastic recycling programs.', icon: <Globe className="text-pink-500 w-6 h-6" />, color: 'bg-pink-50 border-pink-300' },
      'Other': { tip: 'Review your lifestyle for other emission sources and seek sustainable alternatives.', icon: <Leaf className="text-lime-600 w-6 h-6" />, color: 'bg-lime-50 border-lime-300' }
    };
    return sorted.slice(0, 3).map(([cat]) => ({ ...tips[cat] || tips['Other'], category: cat }));
  })();

  // Personalized AI suggestion
  const aiSuggestion = (() => {
    if (regionRows.length === 0) return '';
    const ai = aiInsights(regionRows);
    if (!ai) return '';
    const friendly = [
      `🌱 Great job! Your emissions are ${ai.trend === 'decreasing' ? 'going down' : ai.trend === 'increasing' ? 'rising' : 'stable'}. Focus on ${ai.topCategory} for the biggest impact!`,
      `💡 Tip: Small changes in ${ai.topCategory} can make a big difference.`,
      `🚀 Keep it up! Review your ${ai.topCategory} habits for more savings.`,
      `🌍 Every step counts. ${ai.recommendation}`
    ];
    return friendly[Math.floor(Math.random() * friendly.length)];
  })();

  // Year-over-year change in emissions
  const yearOverYearChange = (() => {
    const trend = trendsData(regionRows).sort((a, b) => a.year.localeCompare(b.year));
    if (trend.length < 2) return null;
    const last = trend[trend.length - 1];
    const prev = trend[trend.length - 2];
    const change = ((last.total_emissions - prev.total_emissions) / prev.total_emissions) * 100;
    return { year: last.year, prevYear: prev.year, change: change.toFixed(1) };
  })();

  // Streak: consecutive months of decreasing emissions
  const streak = (() => {
    const trend = trendsData(regionRows).sort((a, b) => a.year.localeCompare(b.year));
    if (trend.length < 2) return 0;
    let count = 0;
    for (let i = trend.length - 1; i > 0; i--) {
      if (trend[i].total_emissions < trend[i - 1].total_emissions) count++;
      else break;
    }
    return count;
  })();

  // Personal Best: month with lowest emissions
  const personalBest = (() => {
    if (regionRows.length === 0) return null;
    const byMonth = {};
    regionRows.forEach(row => {
      const month = row.date?.slice(0, 7);
      byMonth[month] = (byMonth[month] || 0) + (Number(row.emissions_kg) || 0);
    });
    const sorted = Object.entries(byMonth).sort((a, b) => a[1] - b[1]);
    if (!sorted.length) return null;
    return { month: sorted[0][0], value: (sorted[0][1] / 1000).toFixed(2) };
  })();

  // Challenge of the Month (rotating)
  const ecoChallenges = [
    'Bike or walk for all trips under 3km this month.',
    'Go meatless every Monday for a month.',
    'Reduce your shower time by 2 minutes.',
    'Host a recycling drive in your community.',
    'Switch to LED lighting in your home.',
    'Plant a tree or start a small garden.',
    'Use public transport instead of driving for a week.',
    'Compost your kitchen waste for a month.',
    'Replace one meat meal per week with a vegetarian option.',
    'Share your best eco-tip on social media.'
  ];
  const challengeOfMonth = ecoChallenges[new Date().getMonth() % ecoChallenges.length];

  // Progress Badge (color based on trend)
  const ai = aiInsights(regionRows);
  const badgeColor = ai?.trend === 'decreasing' ? 'bg-green-500' : ai?.trend === 'increasing' ? 'bg-red-500' : 'bg-yellow-400';
  const badgeText = ai?.trend === 'decreasing' ? 'On Track' : ai?.trend === 'increasing' ? 'Needs Attention' : 'Stable';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center mb-4">Carbon Emissions Dashboard</h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
          Visualize and analyze carbon emissions by region and date range
        </p>
        {/* Map Visualization */}
        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle>Region Map</CardTitle>
            <CardDescription>Click a marker to select a region</CardDescription>
          </CardHeader>
          <CardContent>
            {regionOptions.some(r => regionCoords[r]) ? (
              <MapContainer
                center={regionCoords[selectedRegion] || [20, 0]}
                zoom={3}
                style={{ height: 300, width: '100%' }}
                scrollWheelZoom={true}
                dragging={true}
                doubleClickZoom={true}
                zoomControl={true}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {regionOptions.filter(r => regionCoords[r]).map(region => (
                  <Marker
                    key={region}
                    position={regionCoords[region]}
                    eventHandlers={{
                      click: () => setSelectedRegion(region)
                    }}
                  >
                    <Popup>
                      <b>{region}</b>
                    </Popup>
                    <LeafletTooltip>{region}</LeafletTooltip>
                  </Marker>
                ))}
              </MapContainer>
            ) : (
              <div className="text-gray-500">No map location for these regions.</div>
            )}
            <div className="mt-2 text-xs text-gray-500">Blue marker = selected region</div>
          </CardContent>
        </Card>
        <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
          <div className="flex flex-col items-center gap-2">
            <Label htmlFor="region-select" className="font-medium">Select Region</Label>
            {regionOptions.length === 0 ? (
              <div className="text-red-600">No regions available.</div>
            ) : (
              <select
                id="region-select"
                className="p-2 rounded border"
                value={selectedRegion}
                onChange={e => setSelectedRegion(e.target.value)}
                style={{ maxHeight: 200, overflowY: 'auto' }}
              >
                {regionOptions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            )}
            <Button className="mt-2" onClick={() => handleDownloadCSV(regionRows, selectedRegion)} disabled={!regionRows.length}>
              Download CSV for {selectedRegion}
            </Button>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Label htmlFor="compare-select" className="font-medium">Compare With</Label>
            <select
              id="compare-select"
              className="p-2 rounded border"
              value={compareRegion}
              onChange={e => setCompareRegion(e.target.value)}
              style={{ maxHeight: 200, overflowY: 'auto' }}
            >
              <option value="">None</option>
              {regionOptions.filter(r => r !== selectedRegion).map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
            {compareRegion && (
              <Button className="mt-2" onClick={() => handleDownloadCSV(compareRows, compareRegion)} disabled={!compareRows.length}>
                Download CSV for {compareRegion}
              </Button>
            )}
          </div>
          <div className="flex flex-col items-center gap-2">
            <Label className="font-medium">Date Range (Year-Month)</Label>
            <div className="flex gap-2">
              <select
                value={dateRange.start}
                onChange={e => setDateRange(d => ({ ...d, start: e.target.value }))}
                className="p-2 rounded border"
              >
                {allMonths.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <span className="mx-1">to</span>
              <select
                value={dateRange.end}
                onChange={e => setDateRange(d => ({ ...d, end: e.target.value }))}
                className="p-2 rounded border"
              >
                {allMonths.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
        </div>
        {loading ? (
          <div className="text-center text-gray-600">Loading data...</div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : regionRows.length === 0 ? (
          <div className="text-center text-gray-600">No data for this region and date range.</div>
        ) : (
          <>
            {/* AI Summary */}
            <Card className="shadow-lg rounded-xl">
              <CardHeader>
                <CardTitle>AI Summary</CardTitle>
                <CardDescription>Automated summary for {selectedRegion}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-base text-gray-700 dark:text-gray-200">{aiSummary}</div>
              </CardContent>
            </Card>
            <Card className="shadow-lg rounded-xl">
              <CardHeader>
                <CardTitle>Emissions Trends</CardTitle>
                <CardDescription>Total emissions per year (tCO₂)</CardDescription>
              </CardHeader>
              <CardContent>
                <div ref={trendsChartRef} style={{ position: 'relative' }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="total_emissions"
                        stroke={regionColor}
                        name={selectedRegion}
                        data={trendsData(regionRows)}
                      />
                      {compareRegion && (
                        <Line
                          type="monotone"
                          dataKey="total_emissions"
                          stroke={compareColor}
                          name={compareRegion}
                          data={trendsData(compareRows)}
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                  <Button className="absolute top-2 right-2" size="sm" onClick={() => handleExportChart(trendsChartRef, `trends_${selectedRegion}`)}>
                    Export as Image
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-lg rounded-xl">
              <CardHeader>
                <CardTitle>Emissions Breakdown</CardTitle>
                <CardDescription>By category for the latest year (click a bar for details)</CardDescription>
              </CardHeader>
              <CardContent>
                <div ref={breakdownChartRef} style={{ position: 'relative' }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={breakdownData(regionRows)}
                      onClick={e => {
                        if (e && e.activeLabel) {
                          setDrilldown({ open: true, category: e.activeLabel, year: breakdownData(regionRows)[0]?.year });
                        }
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis label={{ value: 'tCO₂', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill={regionColor} name={selectedRegion} />
                      {compareRegion && (
                        <Bar dataKey="value" fill={compareColor} name={compareRegion} data={breakdownData(compareRows)} />
                      )}
                    </BarChart>
                  </ResponsiveContainer>
                  <Button className="absolute top-2 right-2" size="sm" onClick={() => handleExportChart(breakdownChartRef, `breakdown_${selectedRegion}`)}>
                    Export as Image
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-lg rounded-xl">
              <CardHeader>
                <CardTitle>AI Insights</CardTitle>
                <CardDescription>Trends, anomalies, and recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                {(() => {
                  const ai = aiInsights(regionRows);
                  if (!ai) return <div>No insight available for this region and date range.</div>;
                  return (
                    <div>
                      <div><strong>Trend:</strong> {ai.trend === 'increasing' ? '⬆️ Increasing' : ai.trend === 'decreasing' ? '⬇️ Decreasing' : 'Stable'}</div>
                      <div><strong>Top Category ({ai.latestYear}):</strong> {ai.topCategory} ({ai.topValue} tCO₂)</div>
                      {ai.anomalies.length > 0 && (
                        <div className="text-orange-600 mt-2">Anomalies detected in years: {ai.anomalies.join(', ')}</div>
                      )}
                      <div className="mt-2 text-green-700">{ai.recommendation}</div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
            <Card className="shadow-lg rounded-xl">
              <CardHeader>
                <CardTitle>Data Table</CardTitle>
                <CardDescription>All data for {selectedRegion} ({dateRange.start}–{dateRange.end})</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto max-h-96">
                  <table className="min-w-full text-xs border border-gray-200 dark:border-gray-700">
                    <thead className="bg-gray-100 dark:bg-gray-800">
                      <tr>
                        {headers.map(col => <th key={col} className="px-2 py-1 border-b border-gray-200 dark:border-gray-700 text-left">{col}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {tableRows.map((row, i) => (
                        <tr key={i} className="even:bg-gray-50 dark:even:bg-gray-900">
                          {headers.map(col => <td key={col} className="px-2 py-1 border-b border-gray-100 dark:border-gray-800">{row[col]}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
            {/* Drilldown Modal */}
            <Dialog open={drilldown.open} onOpenChange={open => setDrilldown(d => ({ ...d, open }))}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Details for {drilldown.category} ({drilldown.year})</DialogTitle>
                  <DialogDescription>All activities for this category and year in {selectedRegion}</DialogDescription>
                </DialogHeader>
                <div className="overflow-x-auto max-h-96">
                  <table className="min-w-full text-xs border border-gray-200 dark:border-gray-700">
                    <thead className="bg-gray-100 dark:bg-gray-800">
                      <tr>
                        {headers.map(col => <th key={col} className="px-2 py-1 border-b border-gray-200 dark:border-gray-700 text-left">{col}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {drilldownRows.map((row, i) => (
                        <tr key={i} className="even:bg-gray-50 dark:even:bg-gray-900">
                          {headers.map(col => <td key={col} className="px-2 py-1 border-b border-gray-100 dark:border-gray-800">{row[col]}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </DialogContent>
            </Dialog>
            {/* Pie Chart: Emissions by Category */}
            <Card className="shadow-lg rounded-xl">
              <CardHeader>
                <CardTitle>Emissions Breakdown (Pie)</CardTitle>
                <CardDescription>Share of emissions by category for the selected region and date range</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={`cell-${i}`} fill={pieColors[i % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Area Chart: Cumulative Emissions */}
            <Card className="shadow-lg rounded-xl">
              <CardHeader>
                <CardTitle>Cumulative Emissions</CardTitle>
                <CardDescription>Total emissions accumulated over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={areaData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="cumulative" stroke="#6366f1" fill="#a5b4fc" name="Cumulative Emissions (tCO₂)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* AI Tips & Suggestions Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top 3 Emission Tips as cards */}
              {emissionTips.map((tip, i) => (
                <div key={i} className={`flex items-center gap-4 p-4 border rounded-xl shadow ${tip.color} transition-transform hover:scale-105`}>
                  <div>{tip.icon}</div>
                  <div>
                    <div className="font-semibold text-lg capitalize">{tip.category.replace('_', ' ')}</div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">{tip.tip}</div>
                  </div>
                </div>
              ))}
              {/* Personalized AI Suggestion */}
              <div className="flex flex-col justify-center items-center p-6 border rounded-xl shadow bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
                <Lightbulb className="w-8 h-8 text-yellow-400 mb-2 animate-pulse" />
                <div className="font-bold text-lg mb-1">Personalized AI Suggestion</div>
                <div className="text-base text-center text-gray-800 dark:text-gray-200">{aiSuggestion}</div>
              </div>
            </div>
            {/* Gamified AI Features Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {/* Progress Badge */}
              <div className={`flex flex-col items-center justify-center p-4 rounded-xl shadow text-white ${badgeColor} transition-transform hover:scale-105`}>
                <Award className="w-8 h-8 mb-2" />
                <div className="font-bold text-lg">Progress Badge</div>
                <div className="text-base">{badgeText}</div>
              </div>
              {/* Streak Card */}
              <div className="flex flex-col items-center justify-center p-4 rounded-xl shadow bg-orange-50 border-orange-200 transition-transform hover:scale-105">
                <Flame className="w-8 h-8 text-orange-500 mb-2 animate-bounce" />
                <div className="font-bold text-lg">Streak</div>
                <div className="text-base">{streak} month{streak === 1 ? '' : 's'} of decreasing emissions</div>
              </div>
              {/* Personal Best Card */}
              <div className="flex flex-col items-center justify-center p-4 rounded-xl shadow bg-blue-50 border-blue-200 transition-transform hover:scale-105">
                <Trophy className="w-8 h-8 text-blue-500 mb-2" />
                <div className="font-bold text-lg">Personal Best</div>
                <div className="text-base">{personalBest ? `${personalBest.month}: ${personalBest.value} tCO₂` : 'N/A'}</div>
              </div>
              {/* Challenge of the Month */}
              <div className="flex flex-col items-center justify-center p-4 rounded-xl shadow bg-green-50 border-green-200 transition-transform hover:scale-105">
                <Star className="w-8 h-8 text-green-500 mb-2 animate-spin" />
                <div className="font-bold text-lg">Challenge of the Month</div>
                <div className="text-base text-center">{challengeOfMonth}</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UrbanPlanning;

