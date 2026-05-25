const Credential = require('../models/Credential');
const Eligibility = require('../models/Eligibility');
const Event = require('../models/Event');
const response = require('../utils/response');
const mongoose = require('mongoose');

/**
 * @desc    Get analytics for a specific event
 * @route   GET /api/analytics/:eventId
 * @access  Private (Organizer only)
 */
const getEventAnalytics = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    // Validate eventId
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return response.error(res, 'Invalid event ID format', 400);
    }

    // 1. Total whitelisted vs Total claimed
    const totalWhitelisted = await Eligibility.countDocuments({ eventId, approved: true });
    const totalClaimed = await Credential.countDocuments({ eventId });

    // 2. Tier Breakdown
    const tierBreakdownRaw = await Credential.aggregate([
      { $match: { eventId: new mongoose.Types.ObjectId(eventId) } },
      { $group: { _id: '$tier', count: { $sum: 1 } } }
    ]);
    
    const tierBreakdown = {};
    tierBreakdownRaw.forEach(t => {
      tierBreakdown[t._id] = t.count;
    });

    // 3. Claims over time (Time-series data, grouped by day)
    const claimsOverTimeRaw = await Credential.aggregate([
      { $match: { eventId: new mongoose.Types.ObjectId(eventId) } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } } // Sort by date ascending
    ]);

    const claimsOverTime = claimsOverTimeRaw.map(item => ({
      date: item._id,
      claims: item.count
    }));

    return response.success(res, {
      totalWhitelisted,
      totalClaimed,
      conversionRate: totalWhitelisted > 0 ? ((totalClaimed / totalWhitelisted) * 100).toFixed(2) : 0,
      tierBreakdown,
      claimsOverTime
    }, 'Analytics retrieved successfully');

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEventAnalytics
};
