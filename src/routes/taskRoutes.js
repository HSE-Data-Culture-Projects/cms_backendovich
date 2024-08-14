const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

router.get('/', taskController.getAllTasks); // Новый маршрут для получения всех задач
router.get('/:topicId', taskController.getTasksByTopic);
router.post('/', taskController.addTask);

module.exports = router;
