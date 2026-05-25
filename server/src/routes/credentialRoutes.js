const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { 
  claimInit, 
  saveCredential, 
  upgradeCredential, 
  getMetadata, 
  getUserCredentials,
  revokeCredential
} = require('../controllers/credentialController');
const { protect, organizerOnly } = require('../middleware/authMiddleware');
const { requireEventOwner } = require('../middleware/tenantMiddleware');

// Rate limiter for claim-init to protect relayer
const claimLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: { success: false, error: 'Too many claim requests from this IP, please try again after 15 minutes' }
});

router.post('/claim-init', claimLimiter, claimInit);
router.post('/save', saveCredential);
router.post('/upgrade', protect, organizerOnly, requireEventOwner, upgradeCredential);
router.post('/revoke', protect, organizerOnly, requireEventOwner, revokeCredential);
router.get('/metadata/:wallet/:eventId', getMetadata);
router.get('/user/:wallet', getUserCredentials);

module.exports = router;
