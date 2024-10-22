const db = require('../models');
const { Exam, Topic } = db;
const logger = require('../utils/logger');
const { Sequelize } = require('sequelize');

exports.getAllExams = async (req, res) => {
    try {
        const exams = await Exam.findAll({
            attributes: {
                include: [
                    [Sequelize.fn('COUNT', Sequelize.col('topics.id')), 'topicsCount']
                ]
            },
            include: [
                {
                    model: Topic,
                    as: 'topics',
                    attributes: [],
                    through: { attributes: [] },
                }
            ],
            group: ['Exam.id']
        });

        logger.info('Fetched all exams with topics count');
        res.json(exams);
    } catch (error) {
        logger.error('Error fetching exams:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


exports.addExam = async (req, res) => {
    const { name, description } = req.body;
    try {
        const exam = await Exam.create({ name, description });
        logger.info(`Created new exam: ${exam.id}`);
        res.status(201).json(exam);
    } catch (error) {
        logger.error('Error creating exam:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateExam = async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;

    try {
        const exam = await Exam.findByPk(id);
        if (!exam) {
            logger.warn(`Exam not found: ${id}`);
            return res.status(404).json({ message: 'Exam not found' });
        }

        await exam.update({ name, description });
        logger.info(`Updated exam: ${id}`);
        res.status(200).json(exam);
    } catch (error) {
        logger.error(`Error updating exam ${id}:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteExam = async (req, res) => {
    const { id } = req.params;

    try {
        const exam = await Exam.findByPk(id);
        if (!exam) {
            logger.warn(`Exam not found: ${id}`);
            return res.status(404).json({ message: 'Exam not found' });
        }

        await exam.destroy();
        logger.info(`Deleted exam: ${id}`);
        res.status(200).json({ message: 'Exam deleted successfully' });
    } catch (error) {
        logger.error(`Error deleting exam ${id}:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
