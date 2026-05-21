const express = require('express');
const router = express.Router();
const { 
  claimInit, 
  saveCredential, 
  upgradeCredential, 
  getMetadata, 
  getUserCredentials 
} = require('../controllers/credentialController');
const { protect, organizerOnly } = require('../middleware/authMiddleware');

router.post('/claim-init', claimInit);
router.post('/save', saveCredential);
router.post('/upgrade', protect, organizerOnly, upgradeCredential);
router.get('/metadata/:wallet/:eventId', getMetadata);
router.get('/user/:wallet', getUserCredentials);

module.exports = router;
