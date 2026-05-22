import { useState, useCallback, useEffect, useRef } from 'react';
import { Interface } from 'ethers';
import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';
import { useUGFModal } from '@tychilabs/react-ugf';
import { useEthersSigner } from '../utils/ethers.js';
import { CONTRACT_ADDRESS, ABI } from '../config/contract.js';
import { initializeClaim, saveClaim } from '../services/credentialService.js';

export function useUGFClaim() {
  const signer = useEthersSigner();
  const { openUGF, result } = useUGFModal();

  const [ugfStep, setUgfStep] = useState(''); // '' | quoting | settling | executing | confirming | success
  const [txDetails, setTxDetails] = useState(null);
  const [error, setError] = useState('');
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimAddress, setClaimAddress] = useState('');
  const [activeEventId, setActiveEventId] = useState('');
  const [activeMetadataUri, setActiveMetadataUri] = useState('');
  const [activeTierLevel, setActiveTierLevel] = useState(0);

  const resolveRef = useRef(null);
  const rejectRef = useRef(null);

  const triggerClaim = useCallback(async (address, eventId, tierLevel = 0) => {
    setError('');
    setTxDetails(null);
    setClaimAddress(address);
    setActiveEventId(eventId);
    setActiveTierLevel(tierLevel);
    setIsClaiming(true);

    return new Promise(async (resolve, reject) => {
      resolveRef.current = resolve;
      rejectRef.current = reject;

      try {
        if (!signer) {
          throw new Error('Wallet not connected or Ethers signer unavailable');
        }

        // Step 1 — Quote
        setUgfStep('quoting');

        // Fetch dynamic metadata URI from backend
        const initData = await initializeClaim(address, eventId);
        setActiveMetadataUri(initData.metadataUri);

        // Step 2 — Settle
        setUgfStep('settling');

        // Encode claimPass(tokenURI) transaction
        const iface = new Interface(ABI);
        const txData = iface.encodeFunctionData('claimPass', [initData.metadataUri]);

        const tx = {
          to: CONTRACT_ADDRESS,
          data: txData,
          value: 0n,
        };

        // Step 3 — Execute (Open UGF Modal)
        setUgfStep('executing');
        openUGF({
          signer,
          tx,
          destChainId: '84532', // Base Sepolia
        });
      } catch (err) {
        console.error('UGF Claim Trigger Error:', err);
        setError(err.message || 'Failed to trigger claim');
        setUgfStep('');
        setIsClaiming(false);
        reject(err);
      }
    });
  }, [signer, openUGF]);

  // Effect to watch the UGF modal result
  useEffect(() => {
    if (!isClaiming || !result || !result.txHash) return;

    // Reset claiming so we only process once per trigger
    setIsClaiming(false);

    (async () => {
      try {
        // Step 4 — Confirming block finalization
        setUgfStep('confirming');

        // Instantiate viem public client to wait for transaction receipt
        const publicClient = createPublicClient({
          chain: baseSepolia,
          transport: http('https://sepolia.base.org')
        });

        console.log('[UGF Claim] Awaiting transaction confirmation for hash:', result.txHash);
        const receipt = await publicClient.waitForTransactionReceipt({ hash: result.txHash });
        console.log('[UGF Claim] Transaction confirmed in block:', receipt.blockNumber);

        // Fetch user's credential status onchain to find the actual minted tokenId
        const credentialInfo = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: ABI,
          functionName: 'getCredential',
          args: [claimAddress]
        });

        const tokenId = Number(credentialInfo[0]);
        console.log('[UGF Claim] Onchain Token ID retrieved:', tokenId);

        const TIER_NAMES = {
          0: 'Event Pass',
          1: 'Participant Badge',
          2: 'Finalist Badge',
          3: 'Winner Certificate',
          4: 'Mentor / Volunteer'
        };

        // Save claim details to backend database
        await saveClaim({
          tokenId,
          walletAddress: claimAddress,
          eventId: activeEventId || '664cc56a7d7324a0d85485ab',
          txHash: result.txHash,
          metadataUri: activeMetadataUri,
          tierLevel: activeTierLevel
        });

        const details = {
          tokenId,
          txHash: result.txHash,
          metadataUri: activeMetadataUri,
          tier: TIER_NAMES[activeTierLevel] || 'Event Pass',
          tierLevel: activeTierLevel
        };

        setTxDetails(details);
        setUgfStep('success');

        if (resolveRef.current) {
          resolveRef.current(details);
          resolveRef.current = null;
        }
      } catch (err) {
        console.error('UGF Post-execution Error:', err);
        setError(err.message || 'Verification or db saving failed');
        setUgfStep('');
        if (rejectRef.current) {
          rejectRef.current(err);
          rejectRef.current = null;
        }
      }
    })();
  }, [isClaiming, result, claimAddress, activeEventId, activeMetadataUri, activeTierLevel]);

  const reset = useCallback(() => {
    setUgfStep('');
    setTxDetails(null);
    setError('');
    setIsClaiming(false);
  }, []);

  return {
    ugfStep,
    txDetails,
    error,
    triggerClaim,
    reset,
    isRunning: !!ugfStep && ugfStep !== 'success'
  };
}
