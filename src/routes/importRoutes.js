const express = require('express');
const router = express.Router();
const multer = require('multer');
const importController = require('../controllers/importController');

const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('file'), importController.importTasks);

module.exports = router;
