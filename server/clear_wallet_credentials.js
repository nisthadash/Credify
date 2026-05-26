require('dotenv').config();
const mongoose = require('mongoose');
const Credential = require('./src/models/Credential');

const wallet = '0x58a62aB0977C4d879222a829116B019A872Cd963'.toLowerCase();

async function run() {
  console.log(`🧹 Connecting to DB to clear credentials for wallet: ${wallet}...`);
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB Connected');

  const deleteResult = await Credential.deleteMany({ walletAddress: wallet });
  console.log(`🗑️ Successfully deleted ${deleteResult.deletedCount} credentials from the database for wallet ${wallet}.`);

  await mongoose.disconnect();
  console.log('👋 Database connection closed.');
}

run().catch(async (err) => {
  console.error('❌ Error clearing credentials:', err);
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  process.exit(1);
});
