/**
 * Credify API Automation Test Script
 * Running on Node.js v24+ utilizing native fetch
 */

const BASE_URL = 'http://localhost:5000/api';

const runTests = async () => {
  console.log('🚀 Starting Credify Backend API tests...\n');

  try {
    // 1. Health Check
    console.log('📡 [Step 1] Checking API Health...');
    const healthRes = await fetch('http://localhost:5000/');
    const healthData = await healthRes.json();
    console.log('✅ Health Response:', healthData, '\n');

    // Generate unique email to avoid duplicate key errors on rerun
    const uniqueEmail = `organizer_${Date.now()}@credify.xyz`;

    // 2. Organizer Registration
    console.log('📝 [Step 2] Registering a New Organizer...');
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Numaan Bin Husain',
        email: uniqueEmail,
        password: 'password123',
        role: 'organizer'
      })
    });
    const regData = await regRes.json();
    console.log('✅ Registration Output:', regData);
    if (!regData.success) throw new Error('Registration failed');
    const token = regData.data.token;
    console.log(`🔑 Obtained JWT: ${token.substring(0, 15)}...\n`);

    // 3. Create Event
    console.log('📅 [Step 3] Creating a New Credify Event...');
    const eventRes = await fetch(`${BASE_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: 'EthIndia Hackathon 2026',
        description: 'Premium gasless Web3 bootcamp & credential program',
        date: '2026-12-05',
        tiers: ['pass', 'participant', 'finalist', 'winner']
      })
    });
    const eventData = await eventRes.json();
    console.log('✅ Event Created:', eventData);
    if (!eventData.success) throw new Error('Event creation failed');
    const eventId = eventData.data._id;
    console.log(`🆔 Event ID: ${eventId}\n`);

    // 4. Whitelist a Wallet Address
    const testWallet = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'; // Standard Hardhat test address
    console.log(`🔒 [Step 4] Whitelisting wallet: ${testWallet}`);
    const eligibleRes = await fetch(`${BASE_URL}/eligible`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        walletAddress: testWallet,
        eventId: eventId
      })
    });
    const eligibleData = await eligibleRes.json();
    console.log('✅ Whitelist Added:', eligibleData, '\n');

    // 5. Check Eligibility for the Wallet
    console.log('🔍 [Step 5] Checking Whitelist Eligibility publicly...');
    const checkRes = await fetch(`${BASE_URL}/eligible/${testWallet}/${eventId}`);
    const checkData = await checkRes.json();
    console.log('✅ Eligibility Status:', checkData, '\n');

    // 6. Claim Initialization (Fetch Dynamic metadata url)
    console.log('⚡ [Step 6] Running Claim Initialization...');
    const claimRes = await fetch(`${BASE_URL}/credentials/claim-init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        walletAddress: testWallet,
        eventId: eventId
      })
    });
    const claimData = await claimRes.json();
    console.log('✅ Claim Initialized:', claimData);
    if (!claimData.success) throw new Error('Claim initialization failed');
    const metadataUri = claimData.data.metadataUri;
    console.log(`🔗 Hosted Metadata URL: ${metadataUri}\n`);

    // 7. Verify dynamic metadata loading
    console.log('🏷️ [Step 7] Checking dynamic metadata content...');
    const metaRes = await fetch(metadataUri);
    const metaData = await metaRes.json();
    console.log('✅ Dynamic Metadata Content (ERC-721 format):', metaData, '\n');

    console.log('🏆 All Credify API tests successfully passed!');
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
};

runTests();
