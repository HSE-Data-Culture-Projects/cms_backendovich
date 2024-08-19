const express = require('express');
const router = express.Router();
const multer = require('multer');
const fileController = require('../controllers/importController');

const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('file'), fileController.uploadFile);
router.get('/', fileController.getFiles);
router.get('/:id/download', fileController.downloadFile);

module.exports = router;
