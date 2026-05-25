const { createPublicClient, http } = require('viem');
const { baseSepolia } = require('viem/chains');

// Minimal ABI required for read interactions with CredifyBadge contract
const ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "eventId",
        "type": "uint256"
      }
    ],
    "name": "getCredential",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      },
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "tokenURI",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "ownerOf",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Instantiates a public client on Base Sepolia
const getPublicClient = () => {
  const rpcUrl = process.env.BASE_RPC_URL || 'https://sepolia.base.org';
  return createPublicClient({
    chain: baseSepolia,
    transport: http(rpcUrl)
  });
};

/**
 * Fetch the contract owner address onchain
 * @returns {Promise<string|null>}
 */
const getContractOwner = async () => {
  const contractAddress = process.env.CONTRACT_ADDRESS;

  if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
    return null;
  }

  try {
    const client = getPublicClient();
    const owner = await client.readContract({
      address: contractAddress,
      abi: ABI,
      functionName: 'owner'
    });
    return owner;
  } catch (error) {
    console.error('[ContractService] Error calling owner:', error.message);
    return null;
  }
};

/**
 * Fetch onchain credential information for a given wallet address and event
 * @param {string} walletAddress 
 * @param {string} eventId
 * @returns {Promise<{tokenId: number, tier: number, hasClaimed: boolean}>}
 */
const getOnchainCredential = async (walletAddress, eventId) => {
  const contractAddress = process.env.CONTRACT_ADDRESS;

  // Graceful fallback if contract is not configured or dummy address is used
  if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
    console.log('[ContractService] Contract address not configured. Returning default/mock state.');
    return { tokenId: 0, tier: 0, hasClaimed: false, isMock: true };
  }

  try {
    const client = getPublicClient();
    
    let eventIdBigInt = 0n;
    if (eventId && eventId.length === 24) {
      eventIdBigInt = BigInt('0x' + eventId);
    } else if (eventId && eventId.startsWith('0x')) {
      eventIdBigInt = BigInt(eventId);
    }

    // Call contract getCredential(address, eventId)
    const result = await client.readContract({
      address: contractAddress,
      abi: ABI,
      functionName: 'getCredential',
      args: [walletAddress, eventIdBigInt]
    });

    return {
      tokenId: Number(result[0]),
      tier: Number(result[1]),
      hasClaimed: result[2],
      isMock: false
    };
  } catch (error) {
    console.error(`[ContractService] Error calling getCredential for ${walletAddress} on event ${eventId}:`, error.message);
    return { tokenId: 0, tier: 0, hasClaimed: false, error: error.message };
  }
};

/**
 * Fetch token metadata URI onchain
 * @param {number} tokenId 
 * @returns {Promise<string>}
 */
const getOnchainTokenUri = async (tokenId) => {
  const contractAddress = process.env.CONTRACT_ADDRESS;

  if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
    return 'ipfs://mock-uri';
  }

  try {
    const client = getPublicClient();
    const uri = await client.readContract({
      address: contractAddress,
      abi: ABI,
      functionName: 'tokenURI',
      args: [BigInt(tokenId)]
    });
    return uri;
  } catch (error) {
    console.error(`[ContractService] Error calling tokenURI for token #${tokenId}:`, error.message);
    return 'ipfs://error-fetching-uri';
  }
};

module.exports = {
  getContractOwner,
  getOnchainCredential,
  getOnchainTokenUri
};
