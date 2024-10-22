const express = require('express');
const router = express.Router();
const multer = require('multer');
const taskController = require('../controllers/taskController');

const upload = multer({ dest: 'uploads/' });

router.get('/', taskController.getAllTasks);
router.post('/', upload.single('file'), taskController.addTask);
router.get('/topic/:topicId', taskController.getTasksByTopicId);
router.patch('/:id', upload.single('file'), taskController.updateTask);
router.delete('/:id', taskController.deleteTask);
router.post('/import', upload.single('file'), taskController.importTasks);

module.exports = router;
