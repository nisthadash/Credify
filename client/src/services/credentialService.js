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

export async function initializeClaim(walletAddress, eventId) {
  try {
    const data = await apiFetch('/credentials/claim-init', {
      method: 'POST',
      body: JSON.stringify({ walletAddress, eventId }),
    });
    
    if (data && data.success) {
      return data.data;
    }
    
    if (data && data.success === false) {
      const apiErr = new Error(data.message || 'Failed to initialize claim');
      apiErr.isApiError = true;
      throw apiErr;
    }
    
    throw new Error('Unknown API response');
  } catch (err) {
    if (err.isApiError) {
      throw err;
    }
    
    console.warn('[credentialService] initializeClaim connection failed — falling back to local metadata URI.');
    const protocol = window.location.protocol;
    const host = window.location.host;
    const cleanEventId = eventId || '664cc56a7d7324a0d85485ab';
    return {
      walletAddress,
      eventId: cleanEventId,
      metadataUri: `${protocol}//${host}/api/credentials/metadata/${walletAddress}/${cleanEventId}`,
      tier: 'pass',
      tierLevel: 0
    };
  }
}

