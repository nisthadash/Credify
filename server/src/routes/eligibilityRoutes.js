const express = require('express');
const router = express.Router();
const { 
  checkEligibility, 
  checkLatestEligibility, 
  addToWhitelist, 
  bulkAddToWhitelist,
  getEventParticipants
} = require('../controllers/eligibilityController');
const { protect, organizerOnly } = require('../middleware/authMiddleware');
const { requireEventOwner } = require('../middleware/tenantMiddleware');

router.route('/')
  .post(protect, organizerOnly, requireEventOwner, addToWhitelist);

router.route('/bulk')
  .post(protect, organizerOnly, requireEventOwner, bulkAddToWhitelist);

router.route('/event/:eventId')
  .get(protect, organizerOnly, requireEventOwner, getEventParticipants);

router.route('/:wallet')
  .get(checkLatestEligibility);

router.route('/:wallet/:eventId')
  .get(checkEligibility);

module.exports = router;
