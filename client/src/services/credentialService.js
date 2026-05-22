import apiFetch from './api.js';

export async function checkEligibility(address) {
  try {
    const data = await apiFetch(`/eligible/${address}`);
    if (data.success) return data.data;
    throw new Error(data.message);
  } catch {
    // Demo mode fallback
    return { isEligible: true, eventTitle: 'Credify Base Sepolia Workshop (Demo Mode)' };
  }
}

export async function saveClaim({ tokenId, walletAddress, eventId, txHash, metadataUri, tierLevel }) {
  try {
    await apiFetch('/credentials/save', {
      method: 'POST',
      body: JSON.stringify({ tokenId, walletAddress, eventId, txHash, metadataUri, tierLevel }),
    });
  } catch {
    console.warn('[credentialService] saveClaim failed — storing in localStorage as fallback.');
    const existing = JSON.parse(localStorage.getItem('credify_credentials') || '[]');
    existing.push({ tokenId, walletAddress, eventId, txHash, metadataUri, tierLevel, eventDate: new Date().toISOString(), eventName: 'Credify Workshop (Demo)' });
    localStorage.setItem('credify_credentials', JSON.stringify(existing));
  }
}

export async function getCredentialsByWallet(address) {
  try {
    const data = await apiFetch(`/credentials/user/${address}`);
    if (data.success) return data.data;
    throw new Error(data.message);
  } catch {
    // Return from localStorage demo fallback
    const all = JSON.parse(localStorage.getItem('credify_credentials') || '[]');
    return all.filter(c => c.walletAddress?.toLowerCase() === address?.toLowerCase());
  }
}
