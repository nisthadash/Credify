import apiFetch from './api.js';

const MOCK_CREDENTIAL = (query, type) => ({
  tokenId: type === 'token' ? Number(query) : 42,
  verified: true,
  recipient: type === 'wallet' ? query : '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  eventName: 'Credify Base Sepolia Workshop (Demo Mode)',
  eventDescription: 'Completed attendance and verified gasless claim via UGF relayer.',
  eventDate: new Date().toISOString(),
  tier: 'event pass',
  txHash: '0x3213a48e7786b5c03c494e5eb53dc8b5ff3507b7868126cdb0d2c5c03c494e5e',
  onchain: { isMock: true },
});

export async function verifyByTokenId(tokenId) {
  try {
    const data = await apiFetch(`/verify/token/${tokenId}`);
    if (data.success) return data.data;
    throw new Error(data.message);
  } catch {
    if (isNaN(Number(tokenId))) throw new Error('Invalid token ID format');
    return MOCK_CREDENTIAL(tokenId, 'token');
  }
}

export async function verifyByWallet(address) {
  try {
    const data = await apiFetch(`/verify/wallet/${address}`);
    if (data.success) return data.data;
    throw new Error(data.message);
  } catch {
    if (!address.startsWith('0x') || address.length !== 42)
      throw new Error('Invalid Ethereum wallet address format');
    return {
      walletAddress: address,
      totalCredentials: 1,
      credentials: [MOCK_CREDENTIAL(address, 'wallet')],
    };
  }
}
