import { useState, useCallback } from 'react';
import { saveClaim } from '../services/credentialService.js';

export function useUGFClaim() {
  const [ugfStep, setUgfStep] = useState(''); // '' | quoting | settling | executing | confirming | success
  const [txDetails, setTxDetails] = useState(null);
  const [error, setError] = useState('');

  const triggerClaim = useCallback(async (address) => {
    setError('');
    setTxDetails(null);

    // Step 1 — Quote
    setUgfStep('quoting');
    await delay(2000);

    // Step 2 — Settle
    setUgfStep('settling');
    await delay(1800);

    // Step 3 — Execute
    setUgfStep('executing');
    await delay(2200);

    // Step 4 — Confirm
    setUgfStep('confirming');

    const txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const tokenId = Math.floor(Math.random() * 500) + 1;
    const metadataUri = `https://credify.app/api/metadata/${address}/${tokenId}`;

    await saveClaim({
      tokenId, walletAddress: address,
      eventId: '664cc56a7d7324a0d85485ab',
      txHash, metadataUri, tierLevel: 0,
    });

    await delay(800);

    const details = { tokenId, txHash, metadataUri, tier: 'Event Pass', tierLevel: 0 };
    setTxDetails(details);
    setUgfStep('success');
    return details;
  }, []);

  const reset = useCallback(() => {
    setUgfStep('');
    setTxDetails(null);
    setError('');
  }, []);

  return { ugfStep, txDetails, error, triggerClaim, reset, isRunning: !!ugfStep && ugfStep !== 'success' };
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}
