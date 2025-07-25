import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import ClimateChart from '../charts/ClimateChart';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { climateAPI } from '../../services/api';
import ChatBot from '../chat/ChatBot';

const ClimateAnalysis = () => {
  const [trends, setTrends] = useState([]);
  const [risk, setRisk] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [city, setCity] = useState('New York');
  const [country, setCountry] = useState('US');
  const lat = 40.7128;
  const lng = -74.0060;

  useEffect(() => {
    fetchClimate();
  }, []);

  const fetchClimate = async () => {
    setLoading(true);
    setError('');
    try {
      const trendsRes = await climateAPI.getTrends(lat, lng, '10years');
      setTrends(trendsRes.data.data.trends || []);
      const riskRes = await climateAPI.getRiskAssessment(lat, lng);
      setRisk(riskRes.data.data || []);
    } catch (err) {
      setError('Failed to load climate data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Climate Analysis Dashboard</h1>
        {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Climate Trends Chart */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ClimateChart data={trends} type="temperature" timeRange="10years" />
              <ClimateChart data={trends} type="co2" timeRange="10years" />
            </div>
            {/* Climate Risk Chart */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-2">Climate Risks</h2>
              <ClimateChart data={risk} type="risk" timeRange="10years" />
            </div>
            {/* AI Chat Assistant */}
            {/* (Removed) */}
          </>
        )}
      </div>
    </div>
  );
};

export default ClimateAnalysis; 