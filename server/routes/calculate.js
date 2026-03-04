const express = require('express');
const router = express.Router();
const { calculateSalaryProjection } = require('../calculators/salaryProjection');
const { calculateFire } = require('../calculators/fireCalculator');
const { calculateHomeSaleStrategies } = require('../calculators/homeSaleStrategy');

// POST /api/calculate/salary-projection
router.post('/salary-projection', (req, res) => {
  try {
    const data = req.body;
    if (!data || !data.loon || !data.profile) {
      return res.status(400).json({ errors: ['Ongeldige invoerdata. Loon en profiel zijn verplicht.'] });
    }
    const result = calculateSalaryProjection(data);
    return res.json({
      data: result,
      meta: { berekeningsDatum: new Date() },
    });
  } catch (err) {
    console.error('Error in salary-projection:', err);
    return res.status(500).json({ errors: [err.message] });
  }
});

// POST /api/calculate/fire
router.post('/fire', (req, res) => {
  try {
    const { scenario, ...data } = req.body;
    if (!data || !data.loon || !data.profile) {
      return res.status(400).json({ errors: ['Ongeldige invoerdata. Loon en profiel zijn verplicht.'] });
    }
    const result = calculateFire(data, scenario || 'neutraal');
    return res.json({
      data: result,
      meta: { berekeningsDatum: new Date() },
    });
  } catch (err) {
    console.error('Error in fire:', err);
    return res.status(500).json({ errors: [err.message] });
  }
});

// POST /api/calculate/home-sale-strategies
router.post('/home-sale-strategies', (req, res) => {
  try {
    const data = req.body;
    if (!data || !data.woning || !data.loon) {
      return res.status(400).json({ errors: ['Ongeldige invoerdata. Woning en loon zijn verplicht.'] });
    }
    const result = calculateHomeSaleStrategies(data);
    return res.json({
      data: result,
      meta: { berekeningsDatum: new Date() },
    });
  } catch (err) {
    console.error('Error in home-sale-strategies:', err);
    return res.status(500).json({ errors: [err.message] });
  }
});

module.exports = router;
