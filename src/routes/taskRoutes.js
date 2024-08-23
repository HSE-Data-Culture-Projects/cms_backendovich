const express = require('express');
const router = express.Router();
const multer = require('multer');
const taskController = require('../controllers/taskController');

const upload = multer({ dest: 'uploads/' });

router.get('/', taskController.getAllTasks); // Получение всех заданий
router.post('/', upload.single('file'), taskController.addTask); // Добавление задания с файлом
router.patch('/:id', upload.single('file'), taskController.updateTask); // Обновление задания
router.delete('/:id', taskController.deleteTask); // Удаление задания
router.post('/import', upload.single('file'), taskController.importTasks); // Импорт XML файлов

module.exports = router;
