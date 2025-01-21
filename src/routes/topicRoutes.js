// routes/topicRoutes.js
const express = require('express');
const router = express.Router();
const topicController = require('../controllers/topicController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.get('/', authenticate, topicController.getAllTopics);
router.get('/exam/:examId', authenticate, topicController.getTopicsByExam);
router.get('/:id', authenticate, topicController.getTopicById);
router.post('/', authorize(['admin']), topicController.addTopic);
router.put('/:id', authorize(['admin']), topicController.updateTopic);
router.delete('/:id', authorize(['admin']), topicController.deleteTopic);

module.exports = router;
