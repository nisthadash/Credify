const express = require('express');
const router = express.Router();
const { 
  generateApiKey, 
  listApiKeys, 
  revokeApiKey, 
  webhookAddToWhitelist,
  webhookLumaSync,
  webhookDevpostSync
} = require('../controllers/webhookController');
const { protect, organizerOnly } = require('../middleware/authMiddleware');

// API Key Management (Private)
router.route('/keys')
  .post(protect, organizerOnly, generateApiKey)
  .get(protect, organizerOnly, listApiKeys);

router.route('/keys/:keyId')
  .delete(protect, organizerOnly, revokeApiKey);

// Webhook Endpoints (Public, auth via x-api-key)
router.post('/whitelist/:eventId', webhookAddToWhitelist);
router.post('/luma/:eventId', webhookLumaSync);
router.post('/devpost/:eventId', webhookDevpostSync);

module.exports = router;
