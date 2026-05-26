require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Event = require('./src/models/Event');
const Eligibility = require('./src/models/Eligibility');
const Credential = require('./src/models/Credential');

const wallet = '0x58a62aB0977C4d879222a829116B019A872Cd963'.toLowerCase();

async function run() {
  console.log('⚡ Starting event creation and credential issuance...\n');

  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB Connected');

  // Step 1: Find or create an organizer
  let organizer = await User.findOne({ role: 'organizer' });
  if (!organizer) {
    console.log('No organizer found, creating a default mock organizer account...');
    organizer = await User.create({
      name: 'Mumbai Admin',
      email: 'admin@mumbaihack.xyz',
      password: 'mumbaipassword123',
      role: 'organizer'
    });
    console.log(`Created organizer: ${organizer.email} (ID: ${organizer._id})`);
  } else {
    console.log(`Using existing organizer: ${organizer.email} (ID: ${organizer._id})`);
  }

  // Step 2: Create a new Event "Hack with Mumbai 3.0"
  console.log('\n📅 Creating new event: "Hack with Mumbai 3.0"...');
  const event = await Event.create({
    title: 'Hack with Mumbai 3.0',
    description: 'The ultimate builder bootcamp and credential program in Mumbai. Build on Base, scale on Base!',
    date: new Date('2026-07-20'),
    organizerId: organizer._id,
    claimOpen: true,
    tiers: ['pass', 'participant', 'finalist', 'winner', 'mentor']
  });
  console.log(`✅ Event Created: ${event.title} (ID: ${event._id})`);

  // Step 3: Whitelist the user's wallet address for this event
  console.log(`\n🔒 Whitelisting wallet address ${wallet} for "Hack with Mumbai 3.0"...`);
  const whitelistEntry = await Eligibility.create({
    walletAddress: wallet,
    eventId: event._id,
    approved: true,
    approvedBy: organizer._id
  });
  console.log(`✅ Whitelist entry created: ${whitelistEntry._id}`);

  // Step 4: Issue a new Credential
  // Determine next unique tokenId by finding the highest one in the database
  const highestCred = await Credential.findOne().sort({ tokenId: -1 });
  const nextTokenId = highestCred ? highestCred.tokenId + 1 : 1;

  console.log(`\n🎫 Issuing Credential (Token ID: ${nextTokenId}) for wallet: ${wallet}...`);
  const randomTxHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
  const metadataUri = `http://localhost:5000/api/credentials/metadata/${wallet}/${event._id}`;

  const credential = await Credential.create({
    tokenId: nextTokenId,
    walletAddress: wallet,
    eventId: event._id,
    tier: 'event pass',
    metadataUri: metadataUri,
    txHash: randomTxHash,
    status: 'minted'
  });
  console.log(`✅ Credential Document successfully created in Database:`);
  console.log(JSON.stringify(credential, null, 2));

  await mongoose.disconnect();
  console.log('\n🎉 Finished setting up mumbai 3.0 credential!');
}

run().catch(async (err) => {
  console.error('\n❌ Operation failed:', err);
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  process.exit(1);
});
