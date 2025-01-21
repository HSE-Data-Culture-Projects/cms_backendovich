// routes/taskRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const taskController = require('../controllers/taskController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

const upload = multer({ dest: 'uploads/' });

router.get('/', authenticate, taskController.getAllTasks);
router.post('/', authorize(['admin']), upload.single('file'), taskController.addTask);
router.get('/topic/:topicId', authenticate, taskController.getTasksByTopicId);
router.patch('/:id', authorize(['admin']), upload.single('file'), taskController.updateTask);
router.delete('/:id', authorize(['admin']), taskController.deleteTask);
router.post('/import', authorize(['admin']), upload.single('file'), taskController.importTasks);

module.exports = router;
