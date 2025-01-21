// routes/examRoutes.js
const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// Защищенные маршруты: только аутентифицированные пользователи
router.get('/', examController.getAllExams);
router.post('/', authorize(['admin']), examController.addExam); // Только админы могут добавлять экзамены
router.patch('/:id', authorize(['admin']), examController.updateExam);
router.delete('/:id', authorize(['admin']), examController.deleteExam);

module.exports = router;
