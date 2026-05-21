const express = require('express');
const router = express.Router();
const { verifyByTokenId, verifyByWallet } = require('../controllers/verifyController');

router.get('/token/:tokenId', verifyByTokenId);
router.get('/wallet/:wallet', verifyByWallet);

module.exports = router;
