const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');

router.get('/', examController.getAllExams);
router.post('/', examController.addExam);
router.patch('/:id', examController.updateExam);
router.delete('/:id', examController.deleteExam);

module.exports = router;
