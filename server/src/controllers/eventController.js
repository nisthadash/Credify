const Event = require('../models/Event');
const response = require('../utils/response');

/**
 * @desc    Create a new event
 * @route   POST /api/events
 * @access  Private (Organizer only)
 */
const createEvent = async (req, res, next) => {
  try {
    const { title, description, date, tiers } = req.body;

    if (!title || !description || !date) {
      return response.error(res, 'Please provide event title, description, and date', 400);
    }

    const event = await Event.create({
      title,
      description,
      date: new Date(date),
      organizerId: req.user._id,
      tiers: tiers || ['pass', 'participant', 'finalist', 'winner', 'mentor']
    });

    return response.success(res, event, 'Event created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all events
 * @route   GET /api/events
 * @access  Public
 */
const getEvents = async (req, res, next) => {
  try {
    const events = await Event.find().populate('organizerId', 'name email');
    return response.success(res, events, 'Events list retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get event by ID
 * @route   GET /api/events/:id
 * @access  Public
 */
const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizerId', 'name email');
    if (!event) {
      return response.error(res, 'Event not found', 404);
    }
    return response.success(res, event, 'Event retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an event
 * @route   PATCH /api/events/:id
 * @access  Private (Organizer only)
 */
const updateEvent = async (req, res, next) => {
  try {
    const { title, description, date, claimOpen, tiers, contractAddress } = req.body;

    let event = await Event.findById(req.params.id);
    if (!event) {
      return response.error(res, 'Event not found', 404);
    }

    // Verify ownership
    if (event.organizerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return response.error(res, 'Not authorized to modify this event', 403);
    }

    // Prepare updates
    if (title) event.title = title;
    if (description) event.description = description;
    if (date) event.date = new Date(date);
    if (claimOpen !== undefined) event.claimOpen = claimOpen;
    if (tiers) event.tiers = tiers;
    if (contractAddress !== undefined) event.contractAddress = contractAddress;

    const updatedEvent = await event.save();
    return response.success(res, updatedEvent, 'Event updated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent
};
