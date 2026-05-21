const express = require('express');
const router = express.Router();
const { 
  checkEligibility, 
  checkLatestEligibility, 
  addToWhitelist, 
  bulkAddToWhitelist 
} = require('../controllers/eligibilityController');
const { protect, organizerOnly } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, organizerOnly, addToWhitelist);

router.route('/bulk')
  .post(protect, organizerOnly, bulkAddToWhitelist);

router.route('/:wallet')
  .get(checkLatestEligibility);

router.route('/:wallet/:eventId')
  .get(checkEligibility);

module.exports = router;
