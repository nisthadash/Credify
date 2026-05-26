const Credential = require('../models/Credential');
const VerificationLog = require('../models/VerificationLog');
const contractService = require('../services/contractService');
const Event = require('../models/Event');
const response = require('../utils/response');

/**
 * @desc    Verify a credential by token ID (merges onchain + offchain DB details)
 * @route   GET /api/verify/token/:tokenId
 * @access  Public
 */
const verifyByTokenId = async (req, res, next) => {
  try {
    const { tokenId } = req.params;
    const id = Number(tokenId);

    if (isNaN(id)) {
      return response.error(res, 'Invalid token ID format', 400);
    }

    // 1. Fetch off-chain cache from local database
    const credential = await Credential.findOne({ tokenId: id }).populate('eventId', 'title description date');
    
    // 2. Fetch live state onchain
    let onchainOwner = '0x0000000000000000000000000000000000000000';
    let onchainTokenUri = '';
    let isMock = true;

    let contractAddress = process.env.CONTRACT_ADDRESS;
    if (credential && credential.eventId && credential.eventId.contractAddress) {
      contractAddress = credential.eventId.contractAddress;
    }

    if (contractAddress && contractAddress !== '0x0000000000000000000000000000000000000000') {
      try {
        const publicClient = require('../services/contractService');
        onchainTokenUri = await contractService.getOnchainTokenUri(id);
        
        // Fetch ownerOf
        const { createPublicClient, http } = require('viem');
        const { baseSepolia } = require('viem/chains');
        const client = createPublicClient({
          chain: baseSepolia,
          transport: http(process.env.BASE_RPC_URL || 'https://sepolia.base.org')
        });

        const owner = await client.readContract({
          address: contractAddress,
          abi: [
            {
              "inputs": [{"name": "tokenId", "type": "uint256"}],
              "name": "ownerOf",
              "outputs": [{"name": "", "type": "address"}],
              "stateMutability": "view",
              "type": "function"
            }
          ],
          functionName: 'ownerOf',
          args: [BigInt(id)]
        });
        onchainOwner = owner;
        isMock = false;
      } catch (err) {
        console.warn(`[VerifyController] Error reading ownerOf for token #${id} onchain:`, err.message);
      }
    }

    const exists = !!(credential || (onchainOwner && onchainOwner !== '0x0000000000000000000000000000000000000000'));
    const isOwnerMatching = credential ? (credential.walletAddress === onchainOwner.toLowerCase()) : true;
    const isValid = exists && (isMock || isOwnerMatching);

    // 3. Log the verification action
    await VerificationLog.create({
      tokenId: id,
      status: isValid,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
    });

    if (!exists) {
      return response.error(res, `Credential with token ID #${id} could not be verified`, 404);
    }

    const verificationResult = {
      tokenId: id,
      verified: isValid,
      recipient: credential ? credential.walletAddress : onchainOwner.toLowerCase(),
      eventName: credential && credential.eventId ? credential.eventId.title : 'Credify Event',
      eventDescription: credential && credential.eventId ? credential.eventId.description : '',
      eventDate: credential && credential.eventId ? credential.eventId.date : null,
      tier: credential ? credential.tier : 'event pass',
      txHash: credential ? credential.txHash : 'onchain-only',
      metadataUri: credential ? credential.metadataUri : onchainTokenUri,
      onchain: {
        owner: onchainOwner,
        tokenUri: onchainTokenUri,
        isMock
      }
    };

    return response.success(
      res, 
      verificationResult, 
      isValid ? 'Credential verified successfully' : 'Credential found but ownership mismatch detected'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify credentials by wallet address (merges onchain + offchain DB details)
 * @route   GET /api/verify/wallet/:wallet
 * @access  Public
 */
const verifyByWallet = async (req, res, next) => {
  try {
    const { wallet } = req.params;
    const walletLower = wallet.toLowerCase();

    // 1. Fetch off-chain credentials cached in database
    const credentials = await Credential.find({ walletAddress: walletLower }).populate('eventId', 'title description date');

    // 2. Fetch live state onchain for this wallet (scoped by event)
    const results = [];
    let hasOnchainRecord = false;
    const allEvents = await Event.find({});

    for (const event of allEvents) {
      const eventIdStr = event._id.toString();
      try {
        const onchainInfo = await contractService.getOnchainCredential(walletLower, eventIdStr);
        if (onchainInfo && onchainInfo.hasClaimed && !onchainInfo.isMock) {
          hasOnchainRecord = true;
          const matchingCred = credentials.find(c => {
            const cEventId = typeof c.eventId === 'object' ? c.eventId?._id.toString() : c.eventId.toString();
            return cEventId === eventIdStr;
          });

          if (matchingCred) {
            const isUpToDate = onchainInfo.tokenId === matchingCred.tokenId;
            results.push({
              tokenId: matchingCred.tokenId,
              verified: isUpToDate,
              eventName: matchingCred.eventId ? matchingCred.eventId.title : 'Credify Event',
              eventDescription: matchingCred.eventId ? matchingCred.eventId.description : '',
              eventDate: matchingCred.eventId ? matchingCred.eventId.date : null,
              tier: matchingCred.tier,
              txHash: matchingCred.txHash,
              metadataUri: matchingCred.metadataUri,
              onchain: {
                tokenId: onchainInfo.tokenId,
                tierLevel: onchainInfo.tier,
                isMock: false
              }
            });
          } else {
            results.push({
              tokenId: onchainInfo.tokenId,
              verified: true,
              eventName: event.title,
              eventDescription: event.description,
              eventDate: event.date,
              tier: onchainInfo.tier === 0 ? 'event pass' : `tier ${onchainInfo.tier}`,
              txHash: 'onchain-only',
              metadataUri: 'onchain-only',
              onchain: {
                tokenId: onchainInfo.tokenId,
                tierLevel: onchainInfo.tier,
                isMock: false
              }
            });
          }
        }
      } catch (err) {
        console.warn(`[VerifyController] Error checking onchain credentials for ${walletLower} on event ${eventIdStr}:`, err.message);
      }
    }

    // Include DB-only credentials (which may be Mock-mode or not synced onchain yet)
    for (const cred of credentials) {
      const alreadyAdded = results.some(r => r.tokenId === cred.tokenId);
      if (!alreadyAdded) {
        results.push({
          tokenId: cred.tokenId,
          verified: true,
          eventName: cred.eventId ? cred.eventId.title : 'Credify Event',
          eventDescription: cred.eventId ? cred.eventId.description : '',
          eventDate: cred.eventId ? cred.eventId.date : null,
          tier: cred.tier,
          txHash: cred.txHash,
          metadataUri: cred.metadataUri,
          onchain: {
            tokenId: cred.tokenId,
            tierLevel: undefined,
            isMock: true
          }
        });
      }
    }

    const exists = results.length > 0;

    // 3. Log the verification action
    await VerificationLog.create({
      walletAddress: walletLower,
      status: exists,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
    });

    if (!exists) {
      return response.error(res, `No credentials found for wallet address: ${wallet}`, 404);
    }

    return response.success(res, {
      walletAddress: walletLower,
      totalCredentials: results.length,
      credentials: results
    }, 'Wallet credentials verified successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  verifyByTokenId,
  verifyByWallet
};
