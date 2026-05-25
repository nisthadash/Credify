const express = require('express');
const router = express.Router();
const { createEvent, getEvents, getEventById, updateEvent } = require('../controllers/eventController');
const { protect, organizerOnly } = require('../middleware/authMiddleware');
const { requireEventOwner } = require('../middleware/tenantMiddleware');

router.route('/')
  .post(protect, organizerOnly, createEvent)
  .get(getEvents);

router.route('/:id')
  .get(getEventById)
  .patch(protect, organizerOnly, requireEventOwner, updateEvent);

module.exports = router;
