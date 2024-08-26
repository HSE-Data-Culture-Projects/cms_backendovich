// src/routes/gigaChatRoutes.js
const express = require('express');
const router = express.Router();
const gigaChatAuthController = require('../controllers/gigaChatAuthController');
const gigaChatController = require('../controllers/gigaChatController');

router.post('/auth/token', gigaChatAuthController.getAccessToken);

router.post('/generate', gigaChatController.generateText);

module.exports = router;
