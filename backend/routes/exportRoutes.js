const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { exportCSV, exportPDF } = require('../controllers/exportController');

router.use(protect);

router.get('/csv', exportCSV);
router.get('/pdf', exportPDF);

module.exports = router;
