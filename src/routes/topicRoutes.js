const express = require('express');
const router = express.Router();
const topicController = require('../controllers/topicController');

router.get('/:examId', topicController.getTopicsByExam);
router.post('/', topicController.addTopic);

module.exports = router;
