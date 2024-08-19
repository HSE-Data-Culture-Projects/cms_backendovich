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

exports.updateExam = async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;

    try {
        const exam = await Exam.findByPk(id);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        await exam.update({ name, description });
        res.status(200).json(exam);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

