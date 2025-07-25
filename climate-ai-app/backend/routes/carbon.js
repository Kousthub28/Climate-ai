const express = require('express');
const climatiqService = require('../services/climatiqService');
const router = express.Router();

// POST /carbon/calculate
router.post('/calculate', async (req, res) => {
  try {
    const { activity_type, parameters } = req.body;
    if (!activity_type || !parameters) {
      return res.status(400).json({ success: false, message: 'activity_type and parameters are required' });
    }
    const result = await climatiqService.calculateCarbon({ activity_type, parameters });
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Carbon calculation error:', error);
    res.status(500).json({ success: false, message: 'Error calculating carbon footprint' });
  }
});

module.exports = router;

