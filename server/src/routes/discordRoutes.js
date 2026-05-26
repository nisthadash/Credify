const express = require('express');
const router = express.Router();
const { verifyDiscordUser } = require('../controllers/discordController');

router.post('/verify', verifyDiscordUser);

module.exports = router;
