require('dotenv').config();
const mongoose = require('mongoose');
const Credential = require('./src/models/Credential');

async function run() {
  console.log('🧹 Connecting to MongoDB to clean up duplicate credentials...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  const credentials = await Credential.find({});
  console.log(`Found ${credentials.length} total credentials in database.`);

  const groups = {};
  const getTierLevel = (tierName) => {
    if (!tierName) return 0;
    const name = tierName.toLowerCase().trim();
    if (name.includes('pass')) return 0;
    if (name.includes('participant')) return 1;
    if (name.includes('finalist')) return 2;
    if (name.includes('winner')) return 3;
    if (name.includes('mentor') || name.includes('volunteer')) return 4;
    return 0;
  };

  credentials.forEach(c => {
    const key = `${c.walletAddress.toLowerCase()}_${c.eventId.toString()}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(c);
  });

  let deletedCount = 0;
  for (const [key, items] of Object.entries(groups)) {
    if (items.length > 1) {
      console.log(`⚠️ Found ${items.length} duplicate credentials for group ${key}:`);
      
      // Sort by tierLevel descending (keep the highest or most updated tier level, or latest if same level)
      items.sort((a, b) => {
        const lvlA = getTierLevel(a.tier);
        const lvlB = getTierLevel(b.tier);
        if (lvlA !== lvlB) return lvlB - lvlA;
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      });

      const keepItem = items[0];
      console.log(`   Keeping: Token #${keepItem.tokenId} (Tier: ${keepItem.tier}, Level: ${getTierLevel(keepItem.tier)}, Updated: ${keepItem.updatedAt})`);

      for (let i = 1; i < items.length; i++) {
        const deleteItem = items[i];
        console.log(`   Deleting: Token #${deleteItem.tokenId} (Tier: ${deleteItem.tier}, Level: ${getTierLevel(deleteItem.tier)})`);
        await Credential.deleteOne({ _id: deleteItem._id });
        deletedCount++;
      }
    }
  }

  console.log(`🎉 Successfully cleaned up ${deletedCount} duplicate credential documents.`);
  await mongoose.disconnect();
  console.log('👋 Database connection closed.');
}

run().catch(async (err) => {
  console.error('❌ Error in deduplication script:', err);
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  process.exit(1);
});
