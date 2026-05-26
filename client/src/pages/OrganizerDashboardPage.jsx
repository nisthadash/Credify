import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Award, Clock, Plus, Upload, LogOut, ArrowUp, ExternalLink, Calendar, CheckCircle2, UserPlus, Info, Sliders, TrendingUp, Zap, Layers, XCircle, Ban } from 'lucide-react';
import apiFetch from '../services/api.js';

import BadgeStudio from '../components/organizer/BadgeStudio.jsx';
import AnalyticsDashboard from '../components/organizer/AnalyticsDashboard.jsx';
import WebhookPanel from '../components/organizer/WebhookPanel.jsx';

// Web3 Imports
import { useAccount } from 'wagmi';
import { Contract } from 'ethers';
import { useEthersSigner } from '../utils/ethers.js';
import { CONTRACT_ADDRESS, ABI } from '../config/contract.js';
import ConnectWalletButton from '../components/wallet/ConnectWalletButton.jsx';
import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';

const TIER_NAMES  = { 0: 'Pass', 1: 'Participant', 2: 'Finalist', 3: 'Winner', 4: 'Mentor' };
const TIER_COLORS = { 0: '#93c5fd', 1: '#a5b4fc', 2: '#d8b4fe', 3: '#f9a8d4', 4: '#86efac' };

const TIER_LEVELS = {
  'none': -1,
  'event pass': 0,
  'participant badge': 1,
  'finalist badge': 2,
  'winner certificate': 3,
  'mentor badge': 4,
  'mentor / volunteer': 4
};

const getTierLevel = (tierName) => {
  if (!tierName) return -1;
  const clean = tierName.toLowerCase().trim();
  return TIER_LEVELS[clean] !== undefined ? TIER_LEVELS[clean] : -1;
};

export default function OrganizerDashboardPage() {
  const navigate = useNavigate();
  const [organizer, setOrganizer] = useState(null);
  
  // Data States
  const [events, setEvents] = useState([]);
  const [activeEvent, setActiveEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  
  // Input Form States
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  
  const [showWhitelist, setShowWhitelist] = useState(false);
  const [whitelistAddress, setWhitelistAddress] = useState('');
  const [whitelistMode, setWhitelistMode] = useState('single');

  // Tab View
  const [activeTab, setActiveTab] = useState('roster'); // 'roster' | 'upgrades' | 'analytics' | 'studio' | 'webhooks'

  // Web3 States
  const { address: connectedAddress, isConnected } = useAccount();
  const signer = useEthersSigner();
  const [contractOwner, setContractOwner] = useState('');
  const [checkingOwner, setCheckingOwner] = useState(false);
  const [upgradingWallet, setUpgradingWallet] = useState(null); // wallet address being upgraded
  const [isRevokingWallet, setIsRevokingWallet] = useState(null);
  
  // On-chain sync states
  const [onchainEligibleMap, setOnchainEligibleMap] = useState({});
  const [checkingOnchainMap, setCheckingOnchainMap] = useState(false);
  const [syncingWallet, setSyncingWallet] = useState(null);

  const canWriteOnchain = Boolean(
    signer &&
    connectedAddress &&
    contractOwner &&
    connectedAddress.toLowerCase() === contractOwner.toLowerCase()
  );

  const checkOnchainEligibility = async (participantsList) => {
    if (!participantsList || participantsList.length === 0) return;
    setCheckingOnchainMap(true);
    try {
      const publicClient = createPublicClient({
        chain: baseSepolia,
        transport: http('https://sepolia.base.org')
      });
      
      const map = {};
      await Promise.all(
        participantsList.map(async (p) => {
          try {
            const isEligible = await publicClient.readContract({
              address: CONTRACT_ADDRESS,
              abi: ABI,
              functionName: 'isEligible',
              args: [p.walletAddress]
            });
            map[p.walletAddress.toLowerCase()] = isEligible;
          } catch (err) {
            console.error(`Failed to check onchain eligibility for ${p.walletAddress}:`, err);
            map[p.walletAddress.toLowerCase()] = false;
          }
        })
      );
      setOnchainEligibleMap(prev => ({ ...prev, ...map }));
    } catch (err) {
      console.error('Error checking onchain eligibility map:', err);
    } finally {
      setCheckingOnchainMap(false);
    }
  };

  const handleSyncSingleOnchain = async (walletAddress) => {
    if (!canWriteOnchain) {
      showToast('Connect the contract owner wallet in Web3 Console first.');
      return;
    }
    
    setSyncingWallet(walletAddress);
    try {
      const contract = new Contract(CONTRACT_ADDRESS, ABI, signer);
      showToast(`Please confirm the whitelist transaction for ${walletAddress.substring(0, 6)}... in your wallet.`);
      const tx = await contract.addEligible(walletAddress);
      showToast('Transaction sent! Waiting for block confirmation...');
      await tx.wait();
      showToast(`Successfully whitelisted ${walletAddress.substring(0, 6)}... on-chain!`);
      setOnchainEligibleMap(prev => ({
        ...prev,
        [walletAddress.toLowerCase()]: true
      }));
    } catch (err) {
      console.error('On-chain whitelist sync failed:', err);
      showToast('Failed to whitelist: ' + (err.reason || err.message || err));
    } finally {
      setSyncingWallet(null);
    }
  };

  const unsyncedParticipants = participants.filter(p => p.tokenId === null && !onchainEligibleMap[p.walletAddress.toLowerCase()]);

  const handleSyncAllOnchain = async () => {
    if (!canWriteOnchain) {
      showToast('Connect the contract owner wallet in Web3 Console first.');
      return;
    }
    if (unsyncedParticipants.length === 0) return;

    const walletsToSync = unsyncedParticipants.map(p => p.walletAddress);
    showToast(`Syncing ${walletsToSync.length} wallets on-chain...`);
    try {
      const contract = new Contract(CONTRACT_ADDRESS, ABI, signer);
      let tx;
      if (walletsToSync.length === 1) {
        tx = await contract.addEligible(walletsToSync[0]);
      } else {
        tx = await contract.addEligibleBulk(walletsToSync);
      }
      showToast('Bulk transaction sent! Waiting for block confirmation...');
      await tx.wait();
      showToast(`Successfully whitelisted ${walletsToSync.length} wallets on-chain!`);
      
      const newMapUpdates = {};
      walletsToSync.forEach(w => {
        newMapUpdates[w.toLowerCase()] = true;
      });
      setOnchainEligibleMap(prev => ({ ...prev, ...newMapUpdates }));
    } catch (err) {
      console.error('Bulk sync failed:', err);
      showToast('Bulk sync failed: ' + (err.reason || err.message || err));
    }
  };

  const syncWhitelistOnchain = async (wallets) => {
    if (!canWriteOnchain) {
      return { synced: false, reason: 'owner-not-connected' };
    }

    const contract = new Contract(CONTRACT_ADDRESS, ABI, signer);

    if (wallets.length === 1) {
      const tx = await contract.addEligible(wallets[0]);
      await tx.wait();
      return { synced: true };
    }

    const tx = await contract.addEligibleBulk(wallets);
    await tx.wait();
    return { synced: true };
  };

  const checkContractOwner = async () => {
    setCheckingOwner(true);
    try {
      const publicClient = createPublicClient({
        chain: baseSepolia,
        transport: http('https://sepolia.base.org')
      });
      const ownerAddress = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: 'owner'
      });
      setContractOwner(ownerAddress);
    } catch (err) {
      console.error('Error fetching contract owner:', err);
    } finally {
      setCheckingOwner(false);
    }
  };

  useEffect(() => {
    checkContractOwner();
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  // Load organizer session
  useEffect(() => {
    const session = sessionStorage.getItem('credify_organizer');
    if (!session) {
      navigate('/organizer/login');
      return;
    }
    try {
      const parsed = JSON.parse(session);
      setOrganizer(parsed);
    } catch {
      navigate('/organizer/login');
    }
  }, [navigate]);

  // Load events
  const loadEvents = async (orgId) => {
    setLoading(true);
    try {
      const data = await apiFetch('/events');
      if (data && data.success) {
        // Filter events owned by this organizer
        const ownedEvents = data.data.filter(e => e.organizerId?._id === orgId || e.organizerId === orgId);
        setEvents(ownedEvents);
        if (ownedEvents.length > 0) {
          setActiveEvent(ownedEvents[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      showToast('Failed to load events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (organizer) {
      loadEvents(organizer.id);
    }
  }, [organizer]);

  // Load participants of active event
  const loadParticipants = async (eventId) => {
    if (!eventId) return;
    try {
      const data = await apiFetch(`/eligible/event/${eventId}`);
      if (data && data.success) {
        const list = data.data || [];
        setParticipants(list);
        checkOnchainEligibility(list);
      }
    } catch (err) {
      console.error('Error fetching participants:', err);
      showToast('Failed to load participants.');
    }
  };

  useEffect(() => {
    if (activeEvent) {
      loadParticipants(activeEvent._id);
    } else {
      setParticipants([]);
    }
  }, [activeEvent]);

  // Create Event Action
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!eventTitle || !eventDescription || !eventDate) return;
    try {
      const data = await apiFetch('/events', {
        method: 'POST',
        body: JSON.stringify({
          title: eventTitle,
          description: eventDescription,
          date: eventDate
        })
      });
      if (data && data.success) {
        showToast('Event created successfully!');
        setEventTitle('');
        setEventDescription('');
        setEventDate('');
        setShowCreateEvent(false);
        if (organizer) {
          await loadEvents(organizer.id);
        }
      } else {
        showToast(data.message || 'Failed to create event.');
      }
    } catch (err) {
      console.error('Create event error:', err);
      showToast('Connection error. Could not create event.');
    }
  };

  // Whitelist Address Action
  const handleWhitelist = async (e) => {
    e.preventDefault();
    if (!whitelistAddress || !activeEvent) return;
    const cleanAddress = whitelistAddress.trim();
    try {
      const data = await apiFetch('/eligible', {
        method: 'POST',
        body: JSON.stringify({
          walletAddress: cleanAddress,
          eventId: activeEvent._id
        })
      });
      if (data && data.success) {
        try {
          const onchain = await syncWhitelistOnchain([cleanAddress]);
          showToast(
            onchain.synced
              ? 'Wallet whitelisted in database and on-chain!'
              : 'Wallet whitelisted in database. Connect the contract owner wallet to sync on-chain.'
          );
        } catch (chainErr) {
          console.error('On-chain whitelist sync failed:', chainErr);
          showToast('Wallet saved in database, but on-chain sync failed. Check wallet/network.');
        }
        setWhitelistAddress('');
        setShowWhitelist(false);
        loadParticipants(activeEvent._id);
      } else {
        showToast(data.message || 'Failed to whitelist wallet.');
      }
    } catch (err) {
      console.error('Whitelist error:', err);
      showToast('Connection error. Could not whitelist wallet.');
    }
  };

  // Bulk CSV Whitelist Action
  const handleCsvUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeEvent) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target.result;
        // Split by newlines, commas, or semicolons
        const rawWallets = text
          .split(/[\n,\r;]+/)
          .map(w => w.replace(/["']/g, '').trim())
          .filter(w => w.length > 0);

        // Filter valid address patterns (starts with 0x followed by 40 hex characters)
        const validWallets = rawWallets.filter(w => /^0x[a-fA-F0-9]{40}$/.test(w));

        if (validWallets.length === 0) {
          showToast('No valid Ethereum wallet addresses found in the CSV file.');
          setLoading(false);
          return;
        }

        const data = await apiFetch('/eligible/bulk', {
          method: 'POST',
          body: JSON.stringify({
            wallets: validWallets,
            eventId: activeEvent._id
          })
        });

        if (data && data.success) {
          try {
            const onchain = await syncWhitelistOnchain(validWallets);
            showToast(
              onchain.synced
                ? `Whitelisted ${validWallets.length} addresses in database and on-chain!`
                : `Whitelisted ${validWallets.length} addresses in database. Connect the contract owner wallet to sync on-chain.`
            );
          } catch (chainErr) {
            console.error('Bulk on-chain whitelist sync failed:', chainErr);
            showToast(`Whitelisted ${validWallets.length} addresses in database, but on-chain sync failed.`);
          }
          setShowWhitelist(false);
          loadParticipants(activeEvent._id);
        } else {
          showToast(data.message || 'Failed to bulk whitelist.');
        }
      } catch (err) {
        console.error('CSV upload error:', err);
        showToast('Error parsing or uploading CSV.');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  // Upgrade Credential Action (On-Chain + DB Sync)
  const handleUpgrade = async (participant) => {
    if (participant.tokenId === null) {
      showToast('User has not claimed their initial event pass yet.');
      return;
    }
    const currentTier = getTierLevel(participant.tier);
    if (currentTier >= 4) {
      showToast('User is already at the highest level (Mentor).');
      return;
    }
    const nextTier = currentTier + 1;

    const hasContract = CONTRACT_ADDRESS && CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000';

    if (!hasContract) {
      // Fallback: DB-only upgrade
      setUpgradingWallet(participant.walletAddress);
      try {
        const data = await apiFetch('/credentials/upgrade', {
          method: 'POST',
          body: JSON.stringify({
            tokenId: participant.tokenId,
            newTierLevel: nextTier
          })
        });
        if (data && data.success) {
          showToast(`Successfully upgraded to ${TIER_NAMES[nextTier]} (Database-only Mode)`);
          loadParticipants(activeEvent._id);
        } else {
          showToast(data.message || 'Upgrade failed.');
        }
      } catch (err) {
        console.error('Upgrade error:', err);
        showToast('Connection error. Could not upgrade.');
      } finally {
        setUpgradingWallet(null);
      }
      return;
    }

    // Check wallet connection for real on-chain transaction
    if (!isConnected || !connectedAddress) {
      showToast('Please connect your owner wallet in the Web3 Console first.');
      return;
    }

    if (contractOwner && connectedAddress.toLowerCase() !== contractOwner.toLowerCase()) {
      showToast('Connected wallet is not the smart contract owner.');
      return;
    }

    if (!signer) {
      showToast('Wallet signer not ready. Please confirm connection.');
      return;
    }

    setUpgradingWallet(participant.walletAddress);
    try {
      const contract = new Contract(CONTRACT_ADDRESS, ABI, signer);
      // Generate the metadata URI pointing to the backend
      const protocol = window.location.protocol;
      const host = window.location.host;
      const metadataUri = `${protocol}//${host}/api/credentials/metadata/${participant.walletAddress.toLowerCase()}/${activeEvent._id}`;

      console.log(`[On-chain Upgrade] Upgrading wallet ${participant.walletAddress} to tier ${nextTier} with URI ${metadataUri}`);
      
      showToast(`Please confirm the upgrade to ${TIER_NAMES[nextTier]} in your wallet...`);
      const tx = await contract.upgradeTier(participant.walletAddress, nextTier, metadataUri);
      console.log('[On-chain Upgrade] Transaction sent:', tx.hash);
      
      showToast(`Transaction sent! Waiting for block confirmation...`);
      const receipt = await tx.wait();
      console.log('[On-chain Upgrade] Transaction confirmed:', receipt);

      // Now update the database record
      showToast(`On-chain transaction confirmed! Updating database...`);
      const data = await apiFetch('/credentials/upgrade', {
        method: 'POST',
        body: JSON.stringify({
          tokenId: participant.tokenId,
          newTierLevel: nextTier
        })
      });

      if (data && data.success) {
        showToast(`Successfully upgraded to ${TIER_NAMES[nextTier]} on-chain and database!`);
        loadParticipants(activeEvent._id);
      } else {
        showToast('On-chain transaction succeeded, but database sync failed.');
      }
    } catch (err) {
      console.error('Upgrade on-chain error:', err);
      showToast('Upgrade failed: ' + (err.reason || err.message || err));
    } finally {
      setUpgradingWallet(null);
    }
  };

  const handleRevoke = async (participant) => {
    if (participant.tokenId === null) {
      showToast('User has not claimed their initial event pass yet.');
      return;
    }

    if (window.confirm(`Are you sure you want to revoke the credential for ${participant.walletAddress}? This cannot be undone.`)) {
      const hasContract = CONTRACT_ADDRESS && CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000';

      if (!hasContract) {
        // Fallback: DB-only revocation
        setIsRevokingWallet(participant.walletAddress);
        try {
          const data = await apiFetch('/credentials/revoke', {
            method: 'POST',
            body: JSON.stringify({
              tokenId: participant.tokenId,
              eventId: activeEvent._id
            })
          });
          if (data && data.success) {
            showToast('Credential successfully revoked (Database-only Mode).');
            loadParticipants(activeEvent._id);
          } else {
            showToast(data.message || 'Revocation failed.');
          }
        } catch (err) {
          console.error('Revocation error:', err);
          showToast('Connection error. Could not revoke.');
        } finally {
          setIsRevokingWallet(null);
        }
        return;
      }

      // Check wallet connection for real on-chain transaction
      if (!isConnected || !connectedAddress) {
        showToast('Please connect your owner wallet in the Web3 Console first.');
        return;
      }

      if (contractOwner && connectedAddress.toLowerCase() !== contractOwner.toLowerCase()) {
        showToast('Connected wallet is not the smart contract owner.');
        return;
      }

      if (!signer) {
        showToast('Wallet signer not ready. Please confirm connection.');
        return;
      }

      setIsRevokingWallet(participant.walletAddress);
      try {
        const contract = new Contract(CONTRACT_ADDRESS, ABI, signer);
        
        console.log(`[On-chain Revocation] Revoking wallet ${participant.walletAddress} on event ${activeEvent._id}`);
        
        showToast('Please confirm the revocation transaction in your wallet...');
        const eventIdBigInt = BigInt('0x' + activeEvent._id);
        const tx = await contract.revokeCredential(participant.walletAddress, eventIdBigInt);
        console.log('[On-chain Revocation] Transaction sent:', tx.hash);
        
        showToast('Transaction sent! Waiting for block confirmation...');
        const receipt = await tx.wait();
        console.log('[On-chain Revocation] Transaction confirmed:', receipt);

        // Now update the database record
        showToast('On-chain transaction confirmed! Updating database...');
        const data = await apiFetch('/credentials/revoke', {
          method: 'POST',
          body: JSON.stringify({
            tokenId: participant.tokenId,
            eventId: activeEvent._id
          })
        });

        if (data && data.success) {
          showToast('Credential successfully revoked on-chain and database!');
          loadParticipants(activeEvent._id);
        } else {
          showToast('On-chain transaction succeeded, but database sync failed.');
        }
      } catch (err) {
        console.error('Revocation on-chain error:', err);
        showToast('Revocation failed: ' + (err.reason || err.message || err));
      } finally {
        setIsRevokingWallet(null);
      }
    }
  };

  // Stats derivation
  const whitelistCount = participants.length;
  const mintedCount = participants.filter(p => p.tokenId !== null).length;
  const upgradedCount = participants.filter(p => getTierLevel(p.tier) > 0).length;

  return (
    <div className="page-content">
      <div className="container">

        {/* Header */}
        <div className="animate-fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', marginBottom: '6px' }}>Organizer Dashboard</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              Welcome back, <strong style={{ color: 'var(--text)' }}>{organizer?.name || 'Organizer'}</strong> &middot; Manage events, whitelist, and upgrades.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => { setShowCreateEvent(!showCreateEvent); setShowWhitelist(false); }}>
              <Plus size={13} /> {showCreateEvent ? 'Close Form' : 'Create Event'}
            </button>
            {activeEvent && (
              <>
                <button className="btn btn-ghost btn-sm" onClick={() => { setShowWhitelist(true); setWhitelistMode('csv'); setShowCreateEvent(false); }}>
                  <Upload size={13} /> Upload CSV
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => { setShowWhitelist(!showWhitelist || whitelistMode !== 'single'); setWhitelistMode('single'); setShowCreateEvent(false); }}>
                  <UserPlus size={13} /> Whitelist User
                </button>
              </>
            )}
            <button className="btn btn-danger btn-sm" onClick={() => { sessionStorage.removeItem('credify_organizer'); navigate('/organizer/login'); }}>
              <LogOut size={13} /> Logout
            </button>
          </div>
        </div>

        {/* Forms Sections */}
        {showCreateEvent && (
          <div className="card animate-fade-up" style={{ padding: '24px', marginBottom: '32px', maxWidth: '600px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} style={{ color: 'var(--primary)' }} /> Create a New Event
            </h3>
            <form onSubmit={handleCreateEvent} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>Event Title</label>
                <input type="text" className="input-field" value={eventTitle} onChange={e => setEventTitle(e.target.value)} placeholder="e.g. Hack with Mumbai 3.0" required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>Description</label>
                <input type="text" className="input-field" value={eventDescription} onChange={e => setEventDescription(e.target.value)} placeholder="e.g. Premium gasless Web3 bootcamp" required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>Event Date</label>
                <input type="date" className="input-field" value={eventDate} onChange={e => setEventDate(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Save Event</button>
            </form>
          </div>
        )}

        {showWhitelist && activeEvent && (
          <div className="card animate-fade-up" style={{ padding: '24px', marginBottom: '32px', maxWidth: '600px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserPlus size={18} style={{ color: 'var(--primary)' }} /> Whitelist Wallet Address
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Whitelist participants to let them claim their initial event pass (Tier 0) gaslessly.
            </p>
            
            <div className="seg-toggle" style={{ width: 'fit-content', marginBottom: '20px' }}>
              <button type="button" className={`seg-btn ${whitelistMode === 'single' ? 'active' : ''}`} onClick={() => setWhitelistMode('single')} style={{ padding: '6px 16px', fontSize: '12px' }}>
                Single Wallet
              </button>
              <button type="button" className={`seg-btn ${whitelistMode === 'csv' ? 'active' : ''}`} onClick={() => setWhitelistMode('csv')} style={{ padding: '6px 16px', fontSize: '12px' }}>
                Bulk CSV Upload
              </button>
            </div>

            {whitelistMode === 'single' ? (
              <form onSubmit={handleWhitelist} style={{ display: 'flex', gap: '10px' }}>
                <input type="text" className="input-field input-mono" style={{ fontSize: '12px' }} value={whitelistAddress} onChange={e => setWhitelistAddress(e.target.value)} placeholder="e.g. 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266" required />
                <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}>Add User</button>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ 
                  border: '1.5px dashed rgba(255,255,255,0.15)', 
                  borderRadius: 'var(--radius-lg)', 
                  padding: '24px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  background: 'rgba(255,255,255,0.01)',
                  transition: 'all 0.25s ease'
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}
                >
                  <Upload size={24} style={{ color: 'var(--primary)' }} />
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>Click to select a CSV file</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>Addresses can be comma-separated or one per line</span>
                  <input type="file" accept=".csv,.txt" onChange={handleCsvUpload} style={{ display: 'none' }} />
                </label>
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="animate-fade-up delay-100" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(147,197,253,0.15)', border: '1px solid rgba(147,197,253,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#93c5fd' }}>
              <Users size={20} />
            </div>
            <div>
              <p style={{ fontSize: '11px', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: '4px' }}>
                Whitelisted Users
              </p>
              <p style={{ fontSize: '30px', fontWeight: 800, fontFamily: 'var(--font-display)', lineHeight: 1 }}>{whitelistCount}</p>
            </div>
          </div>

          <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(134,239,172,0.15)', border: '1px solid rgba(134,239,172,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#86efac' }}>
              <Award size={20} />
            </div>
            <div>
              <p style={{ fontSize: '11px', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: '4px' }}>
                Minted Credentials
              </p>
              <p style={{ fontSize: '30px', fontWeight: 800, fontFamily: 'var(--font-display)', lineHeight: 1 }}>{mintedCount}</p>
            </div>
          </div>

          <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(252,211,77,0.15)', border: '1px solid rgba(252,211,77,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fcd34d' }}>
              <Clock size={20} />
            </div>
            <div>
              <p style={{ fontSize: '11px', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: '4px' }}>
                Upgraded Levels
              </p>
              <p style={{ fontSize: '30px', fontWeight: 800, fontFamily: 'var(--font-display)', lineHeight: 1 }}>{upgradedCount}</p>
            </div>
          </div>

          <div className="card" style={{ 
            padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px',
            border: isConnected ? (connectedAddress?.toLowerCase() === contractOwner?.toLowerCase() ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(239,68,68,0.3)') : '1px dashed rgba(255,255,255,0.15)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <Sliders size={20} />
              </div>
              <ConnectWalletButton style={{ height: '32px' }} />
            </div>
            <div>
              <p style={{ fontSize: '11px', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: '4px' }}>
                On-Chain Admin Console
              </p>
              {isConnected ? (
                connectedAddress?.toLowerCase() === contractOwner?.toLowerCase() ? (
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#86efac', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Owner Wallet Connected
                  </p>
                ) : (
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#fca5a5' }}>
                    Non-Owner Account Connected
                  </p>
                )
              ) : (
                <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Wallet Disconnected</p>
              )}
            </div>
          </div>
        </div>

        {/* Active Event Selector */}
        <div className="animate-fade-up delay-200" style={{ marginBottom: '28px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Managing Event:</span>
          {events.length > 0 ? (
            <select 
              value={activeEvent?._id || ''} 
              onChange={e => {
                const found = events.find(ev => ev._id === e.target.value);
                if (found) setActiveEvent(found);
              }}
              className="input-field"
              style={{ width: 'auto', minWidth: '240px', background: 'var(--surface-alt)', border: '1px solid var(--border)' }}
            >
              {events.map(ev => (
                <option key={ev._id} value={ev._id}>{ev.title}</option>
              ))}
            </select>
          ) : (
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--error)' }}>
              No active events found. Create one to begin.
            </span>
          )}
        </div>

        {/* Roster / Upgrades Container */}
        {activeEvent && (
          <div className="card animate-fade-up delay-300" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => setActiveTab('roster')} 
                  style={{ 
                    background: 'transparent', border: 'none', 
                    borderBottom: activeTab === 'roster' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
                    color: activeTab === 'roster' ? '#fff' : 'var(--text-muted)', 
                    fontWeight: 700, paddingBottom: '6px', cursor: 'pointer', fontSize: '14px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Event Roster
                </button>
                <button 
                  onClick={() => setActiveTab('upgrades')} 
                  style={{ 
                    background: 'transparent', border: 'none', 
                    borderBottom: activeTab === 'upgrades' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
                    color: activeTab === 'upgrades' ? '#fff' : 'var(--text-muted)', 
                    fontWeight: 700, paddingBottom: '6px', cursor: 'pointer', fontSize: '14px',
                    display: 'flex', alignItems: 'center', gap: '6px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Pass Upgrades
                  {participants.filter(p => p.tokenId !== null && getTierLevel(p.tier) < 4).length > 0 && (
                    <span style={{ 
                      background: 'var(--primary)', color: '#000', fontSize: '10px', 
                      borderRadius: '10px', padding: '2px 6px', fontWeight: 800,
                      lineHeight: 1
                    }}>
                      {participants.filter(p => p.tokenId !== null && getTierLevel(p.tier) < 4).length}
                    </span>
                  )}
                </button>
                <button 
                  onClick={() => setActiveTab('analytics')} 
                  style={{ 
                    background: 'transparent', border: 'none', 
                    borderBottom: activeTab === 'analytics' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
                    color: activeTab === 'analytics' ? '#fff' : 'var(--text-muted)', 
                    fontWeight: 700, paddingBottom: '6px', cursor: 'pointer', fontSize: '14px',
                    display: 'flex', alignItems: 'center', gap: '6px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <TrendingUp size={13} /> Analytics
                </button>
                <button 
                  onClick={() => setActiveTab('studio')} 
                  style={{ 
                    background: 'transparent', border: 'none', 
                    borderBottom: activeTab === 'studio' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
                    color: activeTab === 'studio' ? '#fff' : 'var(--text-muted)', 
                    fontWeight: 700, paddingBottom: '6px', cursor: 'pointer', fontSize: '14px',
                    display: 'flex', alignItems: 'center', gap: '6px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Layers size={13} /> Badge Studio
                </button>
                <button 
                  onClick={() => setActiveTab('webhooks')} 
                  style={{ 
                    background: 'transparent', border: 'none', 
                    borderBottom: activeTab === 'webhooks' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
                    color: activeTab === 'webhooks' ? '#fff' : 'var(--text-muted)', 
                    fontWeight: 700, paddingBottom: '6px', cursor: 'pointer', fontSize: '14px',
                    display: 'flex', alignItems: 'center', gap: '6px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Zap size={13} /> Webhooks & API
                </button>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>{participants.length} whitelisted</span>
            </div>

            {activeTab === 'roster' && (
              /* TAB 1: FULL ROSTER TABLE */
              participants.length === 0 ? (
                <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Users size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                  <p style={{ fontSize: '14px' }}>No participants whitelisted yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {unsyncedParticipants.length > 0 && (
                    <div style={{ 
                      margin: '10px 24px 0', 
                      padding: '12px 16px', 
                      background: 'rgba(245,158,11,0.08)', 
                      border: '1px solid rgba(245,158,11,0.2)', 
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#fcd34d' }}>
                        <Info size={16} />
                        <span>There are {unsyncedParticipants.length} whitelisted wallets that are not synced on-chain.</span>
                      </div>
                      <button
                        onClick={handleSyncAllOnchain}
                        disabled={!canWriteOnchain}
                        className="btn btn-primary btn-sm"
                        style={{ background: 'var(--primary)', color: '#000', fontWeight: 700 }}
                      >
                        Sync All {unsyncedParticipants.length} Wallets
                      </button>
                    </div>
                  )}

                  <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          {['Wallet Address', 'Token ID', 'Current Tier', 'Status', 'Actions'].map(h => (
                            <th key={h}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {participants.map((p, i) => {
                          const tierLvl = getTierLevel(p.tier);
                          const isUpgrading = upgradingWallet === p.walletAddress;
                          return (
                            <tr key={i}>
                              <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                                {p.walletAddress}
                              </td>
                              <td style={{ fontFamily: 'var(--font-mono)' }}>
                                {p.tokenId !== null ? `#${p.tokenId}` : '—'}
                              </td>
                              <td>
                                <span style={{ 
                                  color: tierLvl >= 0 ? TIER_COLORS[tierLvl] : 'var(--text-muted)', 
                                  fontWeight: 700, 
                                  fontSize: '12px', 
                                  fontFamily: 'var(--font-display)', 
                                  textTransform: 'uppercase', 
                                  letterSpacing: '0.05em' 
                                }}>
                                  {tierLvl >= 0 ? TIER_NAMES[tierLvl] : 'None'}
                                </span>
                              </td>
                              <td>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  <span className={`chip ${p.tokenId !== null ? 'chip-verified' : 'chip-pending'}`} style={{ fontSize: '10px' }}>
                                    <span className="chip-dot"></span>
                                    {p.status}
                                  </span>
                                  {p.tokenId === null && (
                                    onchainEligibleMap[p.walletAddress.toLowerCase()] ? (
                                      <span style={{ fontSize: '9px', color: 'var(--success)', fontWeight: 600 }}>
                                        ✓ Synced On-Chain
                                      </span>
                                    ) : (
                                      <span style={{ fontSize: '9px', color: 'var(--warning)', fontWeight: 600 }}>
                                        ⚠ DB Only (Pending Sync)
                                      </span>
                                    )
                                  )}
                                </div>
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                  {p.txHash && p.txHash !== 'onchain-reconciled' && (
                                    <a 
                                      href={`https://sepolia.basescan.org/tx/${p.txHash}`} 
                                      target="_blank" 
                                      rel="noreferrer"
                                      className="btn btn-ghost btn-sm" 
                                      style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                      <ExternalLink size={11} />
                                    </a>
                                  )}
                                  {p.status === 'revoked' ? (
                                    <span style={{ fontSize: '11px', color: 'var(--error)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                      <Ban size={11} /> Revoked
                                    </span>
                                  ) : p.tokenId !== null ? (
                                    <>
                                      {tierLvl < 4 ? (
                                        <button 
                                          onClick={() => handleUpgrade(p)} 
                                          disabled={isUpgrading}
                                          className="btn btn-secondary btn-sm" 
                                          style={{ gap: '4px' }}
                                        >
                                          {isUpgrading ? 'Upgrading...' : `Upgrade (${TIER_NAMES[tierLvl + 1]})`}
                                        </button>
                                      ) : (
                                        <span style={{ fontSize: '11px', color: '#86efac', fontWeight: 600 }}>Max Tier Reached</span>
                                      )}
                                      <button 
                                        onClick={() => handleRevoke(p)} 
                                        disabled={isRevokingWallet === p.walletAddress}
                                        className="btn btn-danger btn-sm" 
                                        style={{ gap: '4px', display: 'inline-flex', alignItems: 'center' }}
                                      >
                                        {isRevokingWallet === p.walletAddress ? 'Revoking...' : <><XCircle size={11} /> Revoke</>}
                                      </button>
                                    </>
                                  ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <span style={{ fontSize: '11px', color: 'var(--text-subtle)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                        <Info size={11} /> Awaiting Claim
                                      </span>
                                      {!onchainEligibleMap[p.walletAddress.toLowerCase()] && (
                                        <button
                                          onClick={() => handleSyncSingleOnchain(p.walletAddress)}
                                          disabled={syncingWallet === p.walletAddress || !canWriteOnchain}
                                          className="btn btn-primary btn-sm"
                                          style={{ fontSize: '11px', padding: '4px 10px', height: 'auto', background: 'var(--primary)', color: '#000' }}
                                        >
                                          {syncingWallet === p.walletAddress ? 'Syncing...' : 'Sync On-Chain'}
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            )}
            
            {activeTab === 'upgrades' && (
              /* TAB 2: PASS UPGRADES & APPROVALS WORKSPACE */
              <>
                {!isConnected && (
                  <div style={{ 
                    margin: '20px 24px 0', padding: '12px 16px', background: 'rgba(245,158,11,0.08)', 
                    border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px',
                    fontSize: '13px', color: '#fcd34d', display: 'flex', alignItems: 'center', gap: '8px'
                  }}>
                    <Info size={16} />
                    <span>Please connect the smart contract owner wallet in the Web3 Console above to approve and execute on-chain upgrades.</span>
                  </div>
                )}
                {isConnected && contractOwner && connectedAddress.toLowerCase() !== contractOwner.toLowerCase() && (
                  <div style={{ 
                    margin: '20px 24px 0', padding: '12px 16px', background: 'rgba(239,68,68,0.08)', 
                    border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px',
                    fontSize: '13px', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '8px'
                  }}>
                    <Info size={16} />
                    <span>The connected wallet is not the owner of the smart contract. Upgrades will fail on-chain. Please switch accounts.</span>
                  </div>
                )}

                {participants.filter(p => p.tokenId !== null && getTierLevel(p.tier) < 4).length === 0 ? (
                  <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <Award size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                    <p style={{ fontSize: '14px' }}>No participants are currently eligible for upgrades.</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-subtle)', marginTop: '4px' }}>Participants must claim their initial Event Pass first.</p>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          {['Participant Address', 'Token ID', 'Current Level', 'Target Level Upgrade', 'Approval Action'].map(h => (
                            <th key={h}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {participants.filter(p => p.tokenId !== null && getTierLevel(p.tier) < 4).map((p, i) => {
                          const tierLvl = getTierLevel(p.tier);
                          const isUpgrading = upgradingWallet === p.walletAddress;
                          return (
                            <tr key={i}>
                              <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                                {p.walletAddress}
                              </td>
                              <td style={{ fontFamily: 'var(--font-mono)' }}>
                                #{p.tokenId}
                              </td>
                              <td>
                                <span style={{ 
                                  color: TIER_COLORS[tierLvl], 
                                  fontWeight: 700, 
                                  fontSize: '12px', 
                                  fontFamily: 'var(--font-display)', 
                                  textTransform: 'uppercase', 
                                  letterSpacing: '0.05em' 
                                }}>
                                  {TIER_NAMES[tierLvl]}
                                </span>
                              </td>
                              <td>
                                <span style={{ 
                                  color: TIER_COLORS[tierLvl + 1], 
                                  fontWeight: 700, 
                                  fontSize: '12px', 
                                  fontFamily: 'var(--font-display)', 
                                  textTransform: 'uppercase', 
                                  letterSpacing: '0.05em',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px'
                                }}>
                                  {TIER_NAMES[tierLvl + 1]}
                                </span>
                              </td>
                              <td>
                                <button 
                                  onClick={() => handleUpgrade(p)} 
                                  disabled={isUpgrading || (isConnected && contractOwner && connectedAddress.toLowerCase() !== contractOwner.toLowerCase())}
                                  className="btn btn-primary btn-sm" 
                                  style={{ 
                                    gap: '6px', 
                                    background: TIER_COLORS[tierLvl + 1], 
                                    color: '#000', 
                                    fontWeight: 700 
                                  }}
                                >
                                  {isUpgrading ? (
                                    'Processing...'
                                  ) : (
                                    <>
                                      <ArrowUp size={11} /> Approve Upgrade
                                    </>
                                  )}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {activeTab === 'analytics' && (
              <AnalyticsDashboard eventId={activeEvent._id} />
            )}

            {activeTab === 'studio' && (
              <BadgeStudio activeEvent={activeEvent} onSave={(config) => {
                showToast('Badge design saved successfully!');
              }} />
            )}

            {activeTab === 'webhooks' && (
              <WebhookPanel eventId={activeEvent._id} />
            )}
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 3000,
          background: 'var(--surface)', border: '1px solid rgba(37,99,235,0.3)',
          borderRadius: 12, padding: '12px 20px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          fontSize: '14px', color: 'var(--text)',
          display: 'flex', alignItems: 'center', gap: '8px',
          animation: 'slideUp 0.25s ease',
        }}>
          <CheckCircle2 size={15} style={{ color: '#86efac', flexShrink: 0 }} /> {toast}
        </div>
      )}
    </div>
  );
}
