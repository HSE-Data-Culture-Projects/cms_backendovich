const express = require('express');
const router = express.Router();
const topicController = require('../controllers/topicController');

router.get('/', topicController.getAllTopics);
router.get('/exam/:examId', topicController.getTopicsByExam);
router.get('/:id', topicController.getTopicById);
router.post('/', topicController.addTopic);
router.put('/:id', topicController.updateTopic);
router.delete('/:id', topicController.deleteTopic);

module.exports = router;
