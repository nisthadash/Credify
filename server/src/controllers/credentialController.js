const Credential = require('../models/Credential');
const Event = require('../models/Event');
const Eligibility = require('../models/Eligibility');
const response = require('../utils/response');

// Map tier numbers to human-readable names and images
const TIER_DETAILS = {
  0: { name: 'Event Pass', image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=600&q=80', description: 'Access pass for the event.' },
  1: { name: 'Participant Badge', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80', description: 'Completed attendance and general check-in.' },
  2: { name: 'Finalist Badge', image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=600&q=80', description: 'Recognized as an outstanding finalist.' },
  3: { name: 'Winner Certificate', image: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?auto=format&fit=crop&w=600&q=80', description: 'Awarded to event winners.' },
  4: { name: 'Mentor Badge', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80', description: 'Assigned as an active mentor or volunteer.' }
};

/**
 * @desc    Initialize a claim by validating eligibility and return metadata URL
 * @route   POST /api/credentials/claim-init
 * @access  Public
 */
const claimInit = async (req, res, next) => {
  try {
    const { walletAddress, eventId } = req.body;

    if (!walletAddress || !eventId) {
      return response.error(res, 'Please provide walletAddress and eventId', 400);
    }

    const walletLower = walletAddress.toLowerCase();

    // 1. Check if event exists and is open for claims
    const event = await Event.findById(eventId);
    if (!event) {
      return response.error(res, 'Event not found', 404);
    }
    if (!event.claimOpen) {
      return response.error(res, 'Claiming is closed for this event', 400);
    }

    // 2. Check whitelist eligibility
    const eligible = await Eligibility.findOne({ walletAddress: walletLower, eventId });
    if (!eligible || !eligible.approved) {
      return response.error(res, 'Your wallet address is not whitelisted for this event', 403);
    }

    // 3. Check if already claimed
    const existing = await Credential.findOne({ walletAddress: walletLower, eventId });
    if (existing) {
      return response.error(res, 'You have already claimed your credential for this event', 400);
    }

    // 4. Generate dynamic metadata URL hostable by our backend
    const protocol = req.protocol;
    const host = req.get('host');
    const metadataUri = `${protocol}://${host}/api/credentials/metadata/${walletLower}/${eventId}`;

    return response.success(res, {
      walletAddress: walletLower,
      eventId,
      metadataUri,
      tier: 'pass',
      tierLevel: 0
    }, 'Claim initialized successfully. Use the provided metadataUri to mint the credential.');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Save minted credential information in DB after successful transaction
 * @route   POST /api/credentials/save
 * @access  Public
 */
const saveCredential = async (req, res, next) => {
  try {
    const { tokenId, walletAddress, eventId, txHash, metadataUri, tierLevel } = req.body;

    if (tokenId === undefined || !walletAddress || !eventId || !txHash || !metadataUri) {
      return response.error(res, 'Please provide tokenId, walletAddress, eventId, txHash, and metadataUri', 400);
    }

    const walletLower = walletAddress.toLowerCase();

    // Verify eligibility
    const eligible = await Eligibility.findOne({ walletAddress: walletLower, eventId });
    if (!eligible || !eligible.approved) {
      return response.error(res, 'Unauthorized: Wallet is not eligible', 403);
    }

    // Check if already registered
    const existing = await Credential.findOne({ tokenId });
    if (existing) {
      return response.error(res, 'Credential token ID is already recorded in the database', 400);
    }

    const tierInt = tierLevel !== undefined ? Number(tierLevel) : 0;
    const tierName = TIER_DETAILS[tierInt]?.name || 'Event Pass';

    const credential = await Credential.create({
      tokenId: Number(tokenId),
      walletAddress: walletLower,
      eventId,
      tier: tierName.toLowerCase(),
      metadataUri,
      txHash,
      status: 'minted'
    });

    return response.success(res, credential, 'Credential record saved successfully in database', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upgrade a credential tier
 * @route   POST /api/credentials/upgrade
 * @access  Private (Organizer only)
 */
const upgradeCredential = async (req, res, next) => {
  try {
    const { tokenId, newTierLevel } = req.body;

    if (tokenId === undefined || newTierLevel === undefined) {
      return response.error(res, 'Please provide tokenId and newTierLevel', 400);
    }

    const credential = await Credential.findOne({ tokenId: Number(tokenId) });
    if (!credential) {
      return response.error(res, 'Credential not found', 404);
    }

    // Verify that user has organizer rights to the event
    const event = await Event.findById(credential.eventId);
    if (!event) {
      return response.error(res, 'Event linked to this credential not found', 404);
    }

    if (event.organizerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return response.error(res, 'Not authorized to upgrade credentials for this event', 403);
    }

    const tierInt = Number(newTierLevel);
    if (TIER_DETAILS[tierInt] === undefined) {
      return response.error(res, 'Invalid tier level. Must be between 0 and 4', 400);
    }

    const tierName = TIER_DETAILS[tierInt].name;

    // Update credential state
    credential.tier = tierName.toLowerCase();
    credential.status = 'upgraded';
    
    // Dynamically regenerate metadata URI to reflect updated tier level
    const protocol = req.protocol;
    const host = req.get('host');
    credential.metadataUri = `${protocol}://${host}/api/credentials/metadata/${credential.walletAddress}/${credential.eventId}`;

    await credential.save();

    return response.success(res, credential, `Credential successfully upgraded to ${tierName}`);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Dynamically serve token metadata JSON matching ERC-721 standards
 * @route   GET /api/credentials/metadata/:wallet/:eventId
 * @access  Public
 */
const getMetadata = async (req, res, next) => {
  try {
    const { wallet, eventId } = req.params;
    const walletLower = wallet.toLowerCase();

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Look up cached credential in database to find active tier
    const credential = await Credential.findOne({ walletAddress: walletLower, eventId });
    
    let activeTierInt = 0;
    if (credential) {
      // Find matching tier level number
      const matched = Object.entries(TIER_DETAILS).find(
        ([_, detail]) => detail.name.toLowerCase() === credential.tier
      );
      activeTierInt = matched ? Number(matched[0]) : 0;
    }

    const details = TIER_DETAILS[activeTierInt] || TIER_DETAILS[0];

    // standard Opensea/ERC-721 metadata structure
    const metadata = {
      name: `Credify ${details.name} - ${event.title}`,
      description: `${details.description} Verified onchain via Credify gasless framework.`,
      image: details.image,
      external_url: `https://credify.network/verify/${walletLower}`,
      attributes: [
        {
          trait_type: 'Event Name',
          value: event.title
        },
        {
          trait_type: 'Credential Tier',
          value: details.name
        },
        {
          trait_type: 'Tier Level',
          value: activeTierInt,
          max_value: 4
        },
        {
          trait_type: 'Recipient Wallet',
          value: walletLower
        }
      ]
    };

    return res.status(200).json(metadata);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all credentials owned by a user wallet address
 * @route   GET /api/credentials/user/:wallet
 * @access  Public
 */
const getUserCredentials = async (req, res, next) => {
  try {
    const { wallet } = req.params;
    const credentials = await Credential.find({ walletAddress: wallet.toLowerCase() })
      .populate('eventId', 'title description date');
    return response.success(res, credentials, 'User credentials retrieved successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  claimInit,
  saveCredential,
  upgradeCredential,
  getMetadata,
  getUserCredentials
};
