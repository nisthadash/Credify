const Credential = require('../models/Credential');
const response = require('../utils/response');

const TIER_LEVELS = {
  'pass': 0,
  'participant': 1,
  'finalist': 2,
  'winner': 3,
  'mentor': 4
};

const ROLE_IDS = {
  0: process.env.DISCORD_ROLE_PASS || '111222333444555000',
  1: process.env.DISCORD_ROLE_PARTICIPANT || '111222333444555001',
  2: process.env.DISCORD_ROLE_FINALIST || '111222333444555002',
  3: process.env.DISCORD_ROLE_WINNER || '111222333444555003',
  4: process.env.DISCORD_ROLE_MENTOR || '111222333444555004'
};

const ROLE_NAMES = {
  0: 'Credify Passholder',
  1: 'Credify Participant',
  2: 'Credify Finalist',
  3: 'Credify Winner',
  4: 'Credify Mentor'
};

/**
 * @desc    Verify wallet credentials and assign Discord roles
 * @route   POST /api/discord/verify
 * @access  Public
 */
const verifyDiscordUser = async (req, res, next) => {
  try {
    const { walletAddress, discordUserId, guildId } = req.body;

    if (!walletAddress) {
      return response.error(res, 'Please provide walletAddress', 400);
    }

    const walletLower = walletAddress.toLowerCase();

    // 1. Fetch all claimed credentials for this wallet
    const credentials = await Credential.find({ 
      walletAddress: walletLower, 
      status: { $ne: 'revoked' } 
    }).populate('eventId', 'title');

    if (credentials.length === 0) {
      return response.success(res, {
        verified: false,
        highestTier: -1,
        message: 'No active credentials found for this wallet. Claim a badge first!'
      }, 'Verification checked: No credentials found');
    }

    // 2. Find highest tier
    let highestTier = 0;
    credentials.forEach(cred => {
      const level = TIER_LEVELS[cred.tier] !== undefined ? TIER_LEVELS[cred.tier] : 0;
      if (level > highestTier) {
        highestTier = level;
      }
    });

    const roleName = ROLE_NAMES[highestTier];
    const roleId = ROLE_IDS[highestTier];

    // 3. If Discord integration config is present, invoke Discord API
    const botToken = process.env.DISCORD_BOT_TOKEN;
    const activeGuildId = guildId || process.env.DISCORD_GUILD_ID;
    
    let discordIntegrationStatus = 'not_configured';
    let discordError = null;

    if (botToken && activeGuildId && discordUserId) {
      try {
        const url = `https://discord.com/api/v10/guilds/${activeGuildId}/members/${discordUserId}/roles/${roleId}`;
        
        const discordRes = await fetch(url, {
          method: 'PUT',
          headers: {
            'Authorization': `Bot ${botToken}`,
            'Content-Type': 'application/json',
            'X-Audit-Log-Reason': 'Credify Badge Holder Verification'
          }
        });

        if (discordRes.status === 204) {
          discordIntegrationStatus = 'success';
        } else {
          const errData = await discordRes.json().catch(() => ({}));
          discordIntegrationStatus = 'failed';
          discordError = errData.message || `Discord API returned status code ${discordRes.status}`;
        }
      } catch (err) {
        console.error('Discord API assignment error:', err);
        discordIntegrationStatus = 'failed';
        discordError = err.message;
      }
    } else {
      if (!botToken) {
        discordIntegrationStatus = 'missing_bot_token';
      } else if (!activeGuildId) {
        discordIntegrationStatus = 'missing_guild_id';
      } else if (!discordUserId) {
        discordIntegrationStatus = 'missing_user_id';
      }
    }

    return response.success(res, {
      verified: true,
      highestTier,
      roleName,
      roleId,
      credentialsCount: credentials.length,
      credentials: credentials.map(c => ({
        eventId: c.eventId?._id,
        eventTitle: c.eventId?.title,
        tier: c.tier,
        tokenId: c.tokenId
      })),
      discordIntegrationStatus,
      discordError
    }, 'Credentials verified successfully');

  } catch (error) {
    next(error);
  }
};

module.exports = {
  verifyDiscordUser
};
