const Event = require('../models/Event');

/**
 * Middleware to enforce tenant isolation.
 * Ensures the authenticated user is the organizer of the requested event.
 * Must be used AFTER authMiddleware.protect.
 */
const requireEventOwner = async (req, res, next) => {
  try {
    // Determine eventId from params, body, or query
    const eventId = req.params.eventId || req.body.eventId || req.query.eventId || req.params.id;

    if (!eventId) {
      return res.status(400).json({ success: false, error: 'Event ID is required for this action' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    // Check if the authenticated user owns this event
    if (event.organizerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized to access this event' });
    }

    // Attach event to request for downstream handlers if needed
    req.event = event;
    next();
  } catch (error) {
    console.error('Tenant isolation error:', error);
    res.status(500).json({ success: false, error: 'Server error during authorization' });
  }
};

module.exports = { requireEventOwner };
