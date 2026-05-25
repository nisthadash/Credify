const mongoose = require('mongoose');
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

    // Demo mode handling
    if (eventId === 'demo') {
      return response.success(res, {
        walletAddress: wallet,
        eventId,
        isEligible: true
      }, 'Wallet is eligible (Demo Mode)');
    }

    // Validate eventId format
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return response.error(res, 'Invalid event ID format', 400);
    }

    // Offline database fallback
    if (mongoose.connection.readyState !== 1) {
      return response.success(res, {
        walletAddress: wallet,
        eventId,
        isEligible: true
      }, 'Wallet is eligible (Fallback Mode)');
    }

    const check = await Eligibility.findOne({
      walletAddress: wallet.toLowerCase(),
      eventId
    });

    let isEligible = !!(check && check.approved);
    
    if (!isEligible) {
      const contractService = require('../services/contractService');
      const contractOwner = await contractService.getContractOwner();
      if (contractOwner && contractOwner.toLowerCase() === wallet.toLowerCase()) {
        isEligible = true;
        // Upsert to DB
        await Eligibility.findOneAndUpdate(
          { walletAddress: wallet.toLowerCase(), eventId },
          { approved: true },
          { new: true, upsert: true }
        );
      }
    }
    
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

    // Offline database fallback
    if (mongoose.connection.readyState !== 1) {
      return response.success(res, {
        walletAddress: wallet,
        eventId: '664cc56a7d7324a0d85485ab',
        eventTitle: 'Credify Base Sepolia Workshop (Fallback Mode)',
        isEligible: true
      }, 'Wallet is eligible for latest event (Fallback Mode)');
    }

    // Get latest event
    const latestEvent = await Event.findOne().sort({ createdAt: -1 });
    if (!latestEvent) {
      return response.success(res, { isEligible: false }, 'No events created yet');
    }

    const check = await Eligibility.findOne({
      walletAddress: wallet.toLowerCase(),
      eventId: latestEvent._id
    });

    let isEligible = !!(check && check.approved);

    if (!isEligible) {
      const contractService = require('../services/contractService');
      const contractOwner = await contractService.getContractOwner();
      if (contractOwner && contractOwner.toLowerCase() === wallet.toLowerCase()) {
        isEligible = true;
        // Upsert to DB
        await Eligibility.findOneAndUpdate(
          { walletAddress: wallet.toLowerCase(), eventId: latestEvent._id },
          { approved: true },
          { new: true, upsert: true }
        );
      }
    }

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

    // Offline database fallback
    if (mongoose.connection.readyState !== 1) {
      return response.error(res, 'Database offline: Cannot add to whitelist', 503);
    }

    // Validate eventId format
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return response.error(res, 'Invalid event ID format', 400);
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

    // Offline database fallback
    if (mongoose.connection.readyState !== 1) {
      return response.error(res, 'Database offline: Cannot bulk whitelist', 503);
    }

    // Validate eventId format
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return response.error(res, 'Invalid event ID format', 400);
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

/**
 * @desc    Get all participants (whitelisted and claimed) for an event
 * @route   GET /api/eligible/event/:eventId
 * @access  Private (Organizer only)
 */
const getEventParticipants = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return response.error(res, 'Invalid event ID format', 400);
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return response.error(res, 'Event not found', 404);
    }

    // Verify ownership
    if (event.organizerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return response.error(res, 'Not authorized to view participants for this event', 403);
    }

    const eligibilities = await Eligibility.find({ eventId });
    const Credential = require('../models/Credential');
    const credentials = await Credential.find({ eventId });

    // Map credentials by wallet address for quick lookup
    const credentialMap = new Map();
    credentials.forEach(cred => {
      credentialMap.set(cred.walletAddress.toLowerCase(), cred);
    });

    const participants = eligibilities.map(elig => {
      const walletLower = elig.walletAddress.toLowerCase();
      const cred = credentialMap.get(walletLower);

      if (cred) {
        return {
          walletAddress: elig.walletAddress,
          tokenId: cred.tokenId,
          eventName: event.title,
          tier: cred.tier,
          txHash: cred.txHash,
          status: cred.status,
          createdAt: cred.createdAt
        };
      } else {
        return {
          walletAddress: elig.walletAddress,
          tokenId: null,
          eventName: event.title,
          tier: 'none',
          txHash: null,
          status: 'whitelisted',
          createdAt: elig.createdAt
        };
      }
    });

    return response.success(res, participants, 'Participants list retrieved successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkEligibility,
  checkLatestEligibility,
  addToWhitelist,
  bulkAddToWhitelist,
  getEventParticipants
};

