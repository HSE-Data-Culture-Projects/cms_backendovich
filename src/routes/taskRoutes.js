const express = require('express');
const router = express.Router();
const multer = require('multer');
const taskController = require('../controllers/taskController');
const { authorize } = require('../middlewares/authMiddleware');

const upload = multer({ dest: 'uploads/' });

router.get('/', taskController.getAllTasks);
router.post('/', authorize(['admin']), upload.single('file'), taskController.addTask);
router.get('/topic/:topicId', taskController.getTasksByTopicId);
router.patch('/:id', authorize(['admin']), upload.single('file'), taskController.updateTask);
router.delete('/:id', authorize(['admin']), taskController.deleteTask);
router.post('/import', authorize(['admin']), upload.single('file'), taskController.importTasks);
router.post('/import-multiple', authorize(['admin']), upload.array('files', 10), taskController.importMultipleTasks);

module.exports = router;
