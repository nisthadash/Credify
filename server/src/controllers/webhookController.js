const crypto = require('crypto');
const User = require('../models/User');
const Event = require('../models/Event');
const Eligibility = require('../models/Eligibility');
const Credential = require('../models/Credential');
const response = require('../utils/response');

// Helper to recursively find a wallet address in any object
const findWalletAddress = (obj) => {
  if (typeof obj === 'string') {
    const match = obj.trim().match(/^0x[a-fA-F0-9]{40}$/);
    if (match) return match[0].toLowerCase();
  }
  if (typeof obj === 'object' && obj !== null) {
    for (const key in obj) {
      const found = findWalletAddress(obj[key]);
      if (found) return found;
    }
  }
  return null;
};

/**
 * @desc    Generate a new API key for the organizer
 * @route   POST /api/webhooks/keys
 * @access  Private (Organizer only)
 */
const generateApiKey = async (req, res, next) => {
  try {
    const { name } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return response.error(res, 'User not found', 404);
    }

    // Generate a random secure key
    const rawKey = crypto.randomBytes(32).toString('hex');
    const apiKey = `credify_${rawKey}`;

    user.apiKeys.push({
      key: apiKey,
      name: name || 'Webhook API Key'
    });

    await user.save();

    return response.success(res, { apiKey }, 'API key generated successfully. Please copy it now, it will not be shown again.', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    List all API keys for the organizer
 * @route   GET /api/webhooks/keys
 * @access  Private (Organizer only)
 */
const listApiKeys = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return response.error(res, 'User not found', 404);
    }

    // Don't send the full keys, just the prefix/suffix or name
    const keys = user.apiKeys.map(k => ({
      _id: k._id,
      name: k.name,
      createdAt: k.createdAt,
      prefix: k.key.substring(0, 12) + '...'
    }));

    return response.success(res, keys, 'API keys retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Revoke an API key
 * @route   DELETE /api/webhooks/keys/:keyId
 * @access  Private (Organizer only)
 */
const revokeApiKey = async (req, res, next) => {
  try {
    const { keyId } = req.params;
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return response.error(res, 'User not found', 404);
    }

    user.apiKeys = user.apiKeys.filter(k => k._id.toString() !== keyId);
    await user.save();

    return response.success(res, null, 'API key revoked successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Webhook endpoint to add a wallet to the whitelist
 * @route   POST /api/webhooks/whitelist/:eventId
 * @access  Public (Requires x-api-key header)
 */
const webhookAddToWhitelist = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { walletAddress } = req.body;
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      return response.error(res, 'Missing x-api-key header', 401);
    }

    if (!walletAddress) {
      return response.error(res, 'Missing walletAddress in request body', 400);
    }

    // Find user with this API key
    const user = await User.findOne({ 'apiKeys.key': apiKey });
    if (!user) {
      return response.error(res, 'Invalid API key', 401);
    }

    // Verify user owns the event
    const event = await Event.findById(eventId);
    if (!event) {
      return response.error(res, 'Event not found', 404);
    }

    if (event.organizerId.toString() !== user._id.toString()) {
      return response.error(res, 'API key does not have permission for this event', 403);
    }

    // Add to whitelist
    const walletLower = walletAddress.toLowerCase();
    const existing = await Eligibility.findOne({ walletAddress: walletLower, eventId });
    
    if (existing) {
      if (!existing.approved) {
        existing.approved = true;
        await existing.save();
        return response.success(res, existing, 'Wallet whitelist status updated to approved');
      }
      return response.error(res, 'Wallet is already whitelisted', 400);
    }

    const eligibility = await Eligibility.create({
      walletAddress: walletLower,
      eventId,
      approved: true
    });

    return response.success(res, eligibility, 'Wallet successfully added to whitelist via webhook', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Luma webhook handler to whitelist attendee wallets
 * @route   POST /api/webhooks/luma/:eventId
 * @access  Public (x-api-key)
 */
const webhookLumaSync = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      return response.error(res, 'Missing x-api-key header', 401);
    }

    const walletAddress = findWalletAddress(req.body);
    if (!walletAddress) {
      return response.error(res, 'No valid wallet address found in webhook payload', 400);
    }

    const user = await User.findOne({ 'apiKeys.key': apiKey });
    if (!user) {
      return response.error(res, 'Invalid API key', 401);
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return response.error(res, 'Event not found', 404);
    }

    if (event.organizerId.toString() !== user._id.toString()) {
      return response.error(res, 'API key does not have permission for this event', 403);
    }

    const existing = await Eligibility.findOne({ walletAddress, eventId });
    if (existing) {
      if (!existing.approved) {
        existing.approved = true;
        await existing.save();
      }
      return response.success(res, existing, 'Wallet already whitelisted');
    }

    const eligibility = await Eligibility.create({
      walletAddress,
      eventId,
      approved: true
    });

    return response.success(res, eligibility, 'Attendee whitelisted from Luma successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Devpost webhook handler to whitelist/upgrade participant credentials
 * @route   POST /api/webhooks/devpost/:eventId
 * @access  Public (x-api-key)
 */
const webhookDevpostSync = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      return response.error(res, 'Missing x-api-key header', 401);
    }

    const walletAddress = findWalletAddress(req.body);
    if (!walletAddress) {
      return response.error(res, 'No valid wallet address found in webhook payload', 400);
    }

    const user = await User.findOne({ 'apiKeys.key': apiKey });
    if (!user) {
      return response.error(res, 'Invalid API key', 401);
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return response.error(res, 'Event not found', 404);
    }

    if (event.organizerId.toString() !== user._id.toString()) {
      return response.error(res, 'API key does not have permission for this event', 403);
    }

    // Whitelist in DB if not already done
    let eligibility = await Eligibility.findOne({ walletAddress, eventId });
    if (!eligibility) {
      eligibility = await Eligibility.create({
        walletAddress,
        eventId,
        approved: true
      });
    } else if (!eligibility.approved) {
      eligibility.approved = true;
      await eligibility.save();
    }

    // Check if they already claimed their event pass (Tier 0). If so, auto-upgrade to Participant (Tier 1)
    const credential = await Credential.findOne({ walletAddress, eventId });
    let upgraded = false;
    if (credential && credential.tier === 'pass') {
      credential.tier = 'participant';
      credential.status = 'upgraded';
      
      const protocol = req.protocol;
      const host = req.get('host');
      credential.metadataUri = `${protocol}://${host}/api/credentials/metadata/${walletAddress}/${eventId}`;
      
      await credential.save();
      upgraded = true;
    }

    return response.success(res, {
      eligibility,
      credentialUpgraded: upgraded,
      credential: credential || null
    }, upgraded ? 'Attendee whitelisted and upgraded to Participant' : 'Attendee whitelisted successfully', 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateApiKey,
  listApiKeys,
  revokeApiKey,
  webhookAddToWhitelist,
  webhookLumaSync,
  webhookDevpostSync
};
