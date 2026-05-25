const express = require('express');
const router = express.Router();
const { getEventAnalytics } = require('../controllers/analyticsController');
const { protect, organizerOnly } = require('../middleware/authMiddleware');
const { requireEventOwner } = require('../middleware/tenantMiddleware');

router.route('/:eventId')
  .get(protect, organizerOnly, requireEventOwner, getEventAnalytics);

module.exports = router;
