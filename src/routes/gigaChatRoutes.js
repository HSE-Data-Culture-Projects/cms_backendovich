const express = require('express');
const router = express.Router();
const { getAccessToken } = require('../controllers/gigaChatAuthController');
const { generateText } = require('../controllers/gigaChatController');

router.post('/auth/token', getAccessToken);
router.post('/generate', generateText);

module.exports = router;
