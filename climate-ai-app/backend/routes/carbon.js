const express = require('express');
const router = express.Router();
const climatiqService = require('../services/climatiqService');
const carbonInterfaceService = require('../services/carbonInterfaceService');
const fs = require('fs');
const path = require('path');
const csvFilePath = path.join(__dirname, '../data/enhanced_carbon_emissions_data.csv');

// POST /api/carbon/estimate (Climatiq)
router.post('/estimate', async (req, res) => {
  const { activityType, params } = req.body;
  try {
    const result = await climatiqService.estimateCarbon(activityType, params);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to estimate carbon (Climatiq)', details: err.message });
  }
});

// POST /api/carbon/estimate-ci (Carbon Interface)
router.post('/estimate-ci', async (req, res) => {
  const { type, params } = req.body;
  try {
    let result;
    if (type === 'flight') {
      result = await carbonInterfaceService.estimateFlight(params);
    } else if (type === 'vehicle') {
      result = await carbonInterfaceService.estimateVehicle(params);
    } else if (type === 'electricity') {
      result = await carbonInterfaceService.estimateElectricity(params);
    } else {
      return res.status(400).json({ error: 'Invalid type for Carbon Interface' });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to estimate carbon (Carbon Interface)', details: err.message });
  }
});



// CSV analysis endpoint
router.get('/csv-analysis', async (req, res) => {
  try {
    const csv = fs.readFileSync(csvFilePath, 'utf-8');
    const lines = csv.split('\n').filter(Boolean);
    const headers = lines[0].split(',').map(h => h.trim());
    const data = lines.slice(1).map(line => {
      const values = line.split(',');
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = values[i] ? values[i].trim() : '';
      });
      return obj;
    });

    // Parse emissions and date
    data.forEach(row => {
      row.emissions_kg = parseFloat(row.emissions_kg || row.emissions || 0);
      row.amount = parseFloat(row.amount || 0);
      row.date = row.date ? row.date.trim() : '';
    });

    // Total emissions
    const totalEmissions = data.reduce((sum, row) => sum + (row.emissions_kg || 0), 0);

    // Daily summary
    const daily = {};
    data.forEach(row => {
      if (!row.date) return;
      if (!daily[row.date]) daily[row.date] = 0;
      daily[row.date] += row.emissions_kg || 0;
    });

    // Weekly summary (by ISO week)
    const getWeek = dateStr => {
      const d = new Date(dateStr);
      const onejan = new Date(d.getFullYear(),0,1);
      return Math.ceil((((d - onejan) / 86400000) + onejan.getDay()+1)/7);
    };
    const weekly = {};
    data.forEach(row => {
      if (!row.date) return;
      const week = `${row.date.slice(0,4)}-W${getWeek(row.date)}`;
      if (!weekly[week]) weekly[week] = 0;
      weekly[week] += row.emissions_kg || 0;
    });

    // Monthly summary
    const monthly = {};
    data.forEach(row => {
      if (!row.date) return;
      const month = row.date.slice(0,7);
      if (!monthly[month]) monthly[month] = 0;
      monthly[month] += row.emissions_kg || 0;
    });

    // Simple trend: compare first and last 7 days
    const sortedDates = Object.keys(daily).sort();
    const first7 = sortedDates.slice(0,7).map(d => daily[d]);
    const last7 = sortedDates.slice(-7).map(d => daily[d]);
    const avgFirst = first7.reduce((a,b)=>a+b,0)/first7.length;
    const avgLast = last7.reduce((a,b)=>a+b,0)/last7.length;
    let trend = 'flat';
    if (avgLast > avgFirst * 1.05) trend = 'increasing';
    else if (avgLast < avgFirst * 0.95) trend = 'decreasing';

    res.json({
      totalEmissions,
      daily,
      weekly,
      monthly,
      trend,
      sample: data.slice(0,10),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to analyze CSV', details: err.message });
  }
});

module.exports = router;

