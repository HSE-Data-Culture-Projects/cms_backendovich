const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

router.get('/:topicId', taskController.getTasksByTopic);
router.post('/', taskController.addTask);

module.exports = router;
