const Eligibility = require('../models/Eligibility');
const Event = require('../models/Event');
const response = require('../utils/response');

/**
 * @desc    Check if a wallet address is eligible for an event
 * @route   GET /api/eligible/:wallet/:eventId
 * @access  Public
 */
const checkEligibility = async (req, res, next) => {
  try {
    const { wallet, eventId } = req.params;

    if (!wallet || !eventId) {
      return response.error(res, 'Please provide both wallet and eventId', 400);
    }

    const check = await Eligibility.findOne({
      walletAddress: wallet.toLowerCase(),
      eventId
    });

    const isEligible = !!(check && check.approved);
    
    return response.success(res, {
      walletAddress: wallet,
      eventId,
      isEligible
    }, isEligible ? 'Wallet is eligible' : 'Wallet is not eligible');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Check eligibility against the most recent event
 * @route   GET /api/eligible/:wallet
 * @access  Public
 */
const checkLatestEligibility = async (req, res, next) => {
  try {
    const { wallet } = req.params;

    // Get latest event
    const latestEvent = await Event.findOne().sort({ createdAt: -1 });
    if (!latestEvent) {
      return response.success(res, { isEligible: false }, 'No events created yet');
    }

    const check = await Eligibility.findOne({
      walletAddress: wallet.toLowerCase(),
      eventId: latestEvent._id
    });

    const isEligible = !!(check && check.approved);

    return response.success(res, {
      walletAddress: wallet,
      eventId: latestEvent._id,
      eventTitle: latestEvent.title,
      isEligible
    }, isEligible ? 'Wallet is eligible for latest event' : 'Wallet is not eligible');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add a single wallet address to whitelist
 * @route   POST /api/eligible
 * @access  Private (Organizer only)
 */
const addToWhitelist = async (req, res, next) => {
  try {
    const { walletAddress, eventId } = req.body;

    if (!walletAddress || !eventId) {
      return response.error(res, 'Please provide walletAddress and eventId', 400);
    }

    // Verify event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return response.error(res, 'Event not found', 404);
    }

    // Upsert whitelist record
    const eligibility = await Eligibility.findOneAndUpdate(
      { walletAddress: walletAddress.toLowerCase(), eventId },
      { approved: true, approvedBy: req.user._id },
      { new: true, upsert: true }
    );

    return response.success(res, eligibility, 'Wallet added to whitelist successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Bulk add wallets to whitelist
 * @route   POST /api/eligible/bulk
 * @access  Private (Organizer only)
 */
const bulkAddToWhitelist = async (req, res, next) => {
  try {
    const { wallets, eventId } = req.body;

    if (!wallets || !Array.isArray(wallets) || !eventId) {
      return response.error(res, 'Please provide wallets (array) and eventId', 400);
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return response.error(res, 'Event not found', 404);
    }

    const operations = wallets.map(wallet => ({
      updateOne: {
        filter: { walletAddress: wallet.toLowerCase(), eventId },
        update: { approved: true, approvedBy: req.user._id },
        upsert: true
      }
    }));

    await Eligibility.bulkWrite(operations);

    return response.success(res, { count: wallets.length }, 'Bulk whitelist completed successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkEligibility,
  checkLatestEligibility,
  addToWhitelist,
  bulkAddToWhitelist
};
