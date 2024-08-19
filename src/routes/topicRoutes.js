const express = require('express');
const router = express.Router();
const topicController = require('../controllers/topicController');

router.get('/', topicController.getAllTopics);
router.get('/:examId', topicController.getTopicsByExam);
router.post('/', topicController.addTopic);
router.patch('/:id', topicController.updateTopic);


module.exports = router;
