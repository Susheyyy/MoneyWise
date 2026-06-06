const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { generateIntelligenceMetrics } = require('../controllers/analyticsController');

router.get('/ai-insights', protect, generateIntelligenceMetrics);

module.exports = router;