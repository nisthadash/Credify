const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  console.warn('[DNS] Failed to set public DNS servers:', e.message);
}
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Event = require('./src/models/Event');
const Eligibility = require('./src/models/Eligibility');
const Credential = require('./src/models/Credential');

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const events = await Event.find({});
    console.log('--- Events ---');
    console.log(events);

    const eligibilities = await Eligibility.find({});
    console.log('--- Whitelisted Wallets ---');
    console.log(eligibilities);

    const credentials = await Credential.find({});
    console.log('--- Credentials ---');
    console.log(credentials);

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
};

run();
