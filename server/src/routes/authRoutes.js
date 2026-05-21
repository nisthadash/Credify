const express = require('express');
const router = express.Router();
const { registerOrganizer, loginOrganizer, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerOrganizer);
router.post('/login', loginOrganizer);
router.get('/me', protect, getMe);

module.exports = router;
