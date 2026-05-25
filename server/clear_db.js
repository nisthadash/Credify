const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const clearDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Get all collections
    const collections = Object.keys(mongoose.connection.collections);
    
    for (const collectionName of collections) {
      const collection = mongoose.connection.collections[collectionName];
      await collection.drop();
      console.log(`Dropped collection: ${collectionName}`);
    }
    
    console.log('Database cleared successfully');
    process.exit(0);
  } catch (error) {
    if (error.code === 26) {
      console.log('NamespaceNotFound - Database might already be empty');
      process.exit(0);
    }
    console.error('Error clearing database:', error);
    process.exit(1);
  }
};

clearDatabase();
