const { createPublicClient, http } = require('viem');
const { baseSepolia } = require('viem/chains');

const CONTRACT_ADDRESS = '0xcdF09A283a6b138A401dC0489B50AaE2E144Ed03';
const ABI = [
  {
    "inputs": [{"internalType": "address","name": "user","type": "address"}],
    "name": "isEligible",
    "outputs": [{"internalType": "bool","name": "","type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{"internalType": "address","name": "","type": "address"}],
    "stateMutability": "view",
    "type": "function"
  }
];

const check = async () => {
  const client = createPublicClient({
    chain: baseSepolia,
    transport: http('https://sepolia.base.org')
  });

  const owner = await client.readContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'owner'
  });
  console.log('Contract Owner:', owner);

  const wallets = [
    '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
    '0x58a62ab0977c4d879222a829116b019a872cd963'
  ];

  for (const wallet of wallets) {
    const isEligible = await client.readContract({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: 'isEligible',
      args: [wallet]
    });
    console.log(`Wallet ${wallet} isEligible:`, isEligible);
  }
};

check().catch(console.error);
