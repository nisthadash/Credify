const express = require('express');
const router = express.Router();
const { registerOrganizer, loginOrganizer, getMe, getSiweNonce, verifySiweSignature } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerOrganizer);
router.post('/login', loginOrganizer);
router.get('/me', protect, getMe);

router.get('/siwe/nonce', getSiweNonce);
router.post('/siwe/verify', verifySiweSignature);

module.exports = router;
