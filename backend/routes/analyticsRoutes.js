const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { generateIntelligenceMetrics, generateRecommendations } = require('../controllers/analyticsController');

router.get('/ai-insights', protect, generateIntelligenceMetrics);
router.post('/recommendations', protect, generateRecommendations);

module.exports = router;
