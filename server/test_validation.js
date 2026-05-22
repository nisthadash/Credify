/**
 * Credify API Validation Test Script (Mongoose CastError & Demo Handling)
 */

const BASE_URL = 'http://localhost:5000/api';
const testWallet = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266';

const runTests = async () => {
  console.log('🧪 Starting validation tests for CastError and Demo mode...\n');

  try {
    // 1. Metadata with 'demo'
    console.log('🏷️ [Test 1] Fetching metadata for "demo" eventId...');
    const metaDemoRes = await fetch(`${BASE_URL}/credentials/metadata/${testWallet}/demo`);
    const metaDemoData = await metaDemoRes.json();
    console.log('Status:', metaDemoRes.status);
    console.log('Data:', metaDemoData);
    if (metaDemoRes.status !== 200 || !metaDemoData.name.includes('Demo Mode')) {
      throw new Error('Test 1 failed: Expected 200 OK and name containing "Demo Mode"');
    }
    console.log('✅ Test 1 Passed.\n');

    // 2. Metadata with invalid ObjectId
    console.log('🏷️ [Test 2] Fetching metadata for invalid eventId...');
    const metaInvalidRes = await fetch(`${BASE_URL}/credentials/metadata/${testWallet}/invalid_id_value`);
    const metaInvalidData = await metaInvalidRes.json();
    console.log('Status:', metaInvalidRes.status);
    console.log('Data:', metaInvalidData);
    if (metaInvalidRes.status !== 200 || !metaInvalidData.name.includes('Demo Mode')) {
      throw new Error('Test 2 failed: Expected 200 OK and fallback/demo metadata');
    }
    console.log('✅ Test 2 Passed.\n');

    // 3. Eligibility check with 'demo'
    console.log('🔍 [Test 3] Checking eligibility for "demo" eventId...');
    const eligibleDemoRes = await fetch(`${BASE_URL}/eligible/${testWallet}/demo`);
    const eligibleDemoData = await eligibleDemoRes.json();
    console.log('Status:', eligibleDemoRes.status);
    console.log('Data:', eligibleDemoData);
    if (eligibleDemoRes.status !== 200 || eligibleDemoData.success !== true || eligibleDemoData.data.isEligible !== true) {
      throw new Error('Test 3 failed: Expected eligible to be true for demo mode');
    }
    console.log('✅ Test 3 Passed.\n');

    // 4. Eligibility check with invalid ID
    console.log('🔍 [Test 4] Checking eligibility for invalid eventId...');
    const eligibleInvalidRes = await fetch(`${BASE_URL}/eligible/${testWallet}/invalid_id_value`);
    const eligibleInvalidData = await eligibleInvalidRes.json();
    console.log('Status:', eligibleInvalidRes.status);
    console.log('Data:', eligibleInvalidData);
    if (eligibleInvalidRes.status !== 400 || eligibleInvalidData.success !== false) {
      throw new Error('Test 4 failed: Expected 400 Bad Request error');
    }
    console.log('✅ Test 4 Passed.\n');

    // 5. Claim init with 'demo'
    console.log('⚡ [Test 5] Claim init with "demo" eventId...');
    const claimDemoRes = await fetch(`${BASE_URL}/credentials/claim-init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        walletAddress: testWallet,
        eventId: 'demo'
      })
    });
    const claimDemoData = await claimDemoRes.json();
    console.log('Status:', claimDemoRes.status);
    console.log('Data:', claimDemoData);
    if (claimDemoRes.status !== 200 || claimDemoData.success !== true || !claimDemoData.data.metadataUri.includes('/demo')) {
      throw new Error('Test 5 failed: Expected 200 OK success for claim-init demo');
    }
    console.log('✅ Test 5 Passed.\n');

    // 6. Claim init with invalid eventId
    console.log('⚡ [Test 6] Claim init with invalid eventId...');
    const claimInvalidRes = await fetch(`${BASE_URL}/credentials/claim-init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        walletAddress: testWallet,
        eventId: 'invalid_id_value'
      })
    });
    const claimInvalidData = await claimInvalidRes.json();
    console.log('Status:', claimInvalidRes.status);
    console.log('Data:', claimInvalidData);
    if (claimInvalidRes.status !== 400 || claimInvalidData.success !== false) {
      throw new Error('Test 6 failed: Expected 400 Bad Request error');
    }
    console.log('✅ Test 6 Passed.\n');

    console.log('🎉 All Validation and Error Handling Tests Passed Successfully!');
  } catch (err) {
    console.error('❌ Validation Test Failed:', err.message);
  }
};

runTests();
