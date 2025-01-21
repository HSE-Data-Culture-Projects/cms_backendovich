// routes/topicRoutes.js
const express = require('express');
const router = express.Router();
const topicController = require('../controllers/topicController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.get('/', topicController.getAllTopics);
router.get('/exam/:examId', topicController.getTopicsByExam);
router.get('/:id', topicController.getTopicById);
router.post('/', authorize(['admin']), topicController.addTopic);
router.put('/:id', authorize(['admin']), topicController.updateTopic);
router.delete('/:id', authorize(['admin']), topicController.deleteTopic);

module.exports = router;
