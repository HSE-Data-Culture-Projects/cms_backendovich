const db = require('../models');
const Exam = db.Exam;

exports.getAllExams = async (req, res) => {
    const exams = await Exam.findAll();
    res.json(exams);
};

exports.addExam = async (req, res) => {
    const { name, description } = req.body;
    const exam = await Exam.create({ name, description });
    res.status(201).json(exam);
};
