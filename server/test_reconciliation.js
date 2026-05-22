require('dotenv').config();
const mongoose = require('mongoose');
const Credential = require('./src/models/Credential');
const Event = require('./src/models/Event');

const BASE_URL = 'http://localhost:5000/api';
const wallet = '0x58a62aB0977C4d879222a829116B019A872Cd963';

async function run() {
  console.log('🧪 Starting Database Reconciliation and Double-Claiming tests...\n');

  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB Connected');

  // Step 1: Clean up any existing credentials for this user in the local database
  // to prove that the database reconciliation logic successfully auto-creates it on-chain query.
  console.log(`🧹 Removing local database credentials for wallet: ${wallet}`);
  const deleteResult = await Credential.deleteMany({ walletAddress: wallet.toLowerCase() });
  console.log(`Deleted ${deleteResult.deletedCount} local credential documents.`);

  // Find a valid event ID from database to use for testing
  const latestEvent = await Event.findOne().sort({ createdAt: -1 });
  if (!latestEvent) {
    throw new Error('No events found in database to run reconciliation tests.');
  }
  const eventId = latestEvent._id.toString();
  console.log(`📅 Using Event ID for testing: ${eventId} (${latestEvent.title})`);

  // Step 2: Request user credentials from API. This should trigger on-chain reconciliation
  // because the wallet has claimed on-chain (TokenId: 0).
  console.log(`\n🔍 [Test 1] Requesting credentials for ${wallet} via API (Should trigger DB sync)...`);
  const getCredsRes = await fetch(`${BASE_URL}/credentials/user/${wallet}`);
  const getCredsData = await getCredsRes.json();
  
  console.log('Status:', getCredsRes.status);
  console.log('Returned Credentials Count:', getCredsData.data ? getCredsData.data.length : 0);

  // Verify that the record now exists in the database
  const dbCreds = await Credential.find({ walletAddress: wallet.toLowerCase() });
  console.log('Local DB Query for wallet:', JSON.stringify(dbCreds, null, 2));

  if (dbCreds.length === 0) {
    throw new Error('Test 1 failed: Database did not reconcile the missing on-chain credential.');
  }
  console.log('✅ Test 1 Passed: Database successfully reconciled the missing on-chain credential.');

  // Step 3: Now try to initialize a new claim for this wallet address.
  // It should detect the on-chain claim (or the reconciled DB claim) and block it.
  console.log(`\n⚡ [Test 2] Triggering claim-init for already claimed wallet ${wallet}...`);
  const claimInitRes = await fetch(`${BASE_URL}/credentials/claim-init`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      walletAddress: wallet,
      eventId: eventId
    })
  });
  
  const claimInitData = await claimInitRes.json();
  console.log('Status:', claimInitRes.status);
  console.log('Data:', claimInitData);

  if (claimInitRes.status !== 400 || claimInitData.success !== false) {
    throw new Error('Test 2 failed: Expected 400 Bad Request for double claim initialization.');
  }
  if (!claimInitData.message.includes('already claimed')) {
    throw new Error(`Test 2 failed: Unexpected error message: "${claimInitData.message}"`);
  }
  
  console.log('✅ Test 2 Passed: API correctly blocks duplicate claim with a 400 Bad Request duplicate message.');

  await mongoose.connection.close();
  console.log('\n🎉 All Reconciliation & Double-Claiming Tests Passed Successfully!');
}

run().catch(async (err) => {
  console.error('\n❌ Test failed with error:', err);
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  process.exit(1);
});
