const express = require('express');
const router = express.Router();
const { createEvent, getEvents, getEventById, updateEvent } = require('../controllers/eventController');
const { protect, organizerOnly } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, organizerOnly, createEvent)
  .get(getEvents);

router.route('/:id')
  .get(getEventById)
  .patch(protect, organizerOnly, updateEvent);

module.exports = router;
