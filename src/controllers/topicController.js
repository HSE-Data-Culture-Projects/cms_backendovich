const db = require('../models');
const { Exam, Topic } = db;
const logger = require('../utils/logger');

// Получение всех тем
exports.getAllTopics = async (req, res) => {
    try {
        const topics = await Topic.findAll({
            include: [{ model: Exam, as: 'exams' }],
        });
        logger.info('Fetched all topics');
        res.json(topics);
    } catch (error) {
        logger.error('Error fetching topics:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getTopicsByExam = async (req, res) => {
    const { examId } = req.params;

    try {
        const exam = await Exam.findByPk(examId, {
            include: [
                {
                    model: Topic,
                    as: 'topics',
                    through: { attributes: [] },
                },
            ],
        });

        if (!exam) {
            logger.warn(`Exam not found: ${examId}`);
            return res.status(404).json({ message: 'Exam not found' });
        }

        logger.info(`Fetched topics for exam: ${examId}`);
        res.status(200).json(exam.topics);
    } catch (error) {
        logger.error(`Error fetching topics for exam ${examId}:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


// Добавление новой темы
exports.addTopic = async (req, res) => {
    const { name, examIds } = req.body;

    try {
        const topic = await Topic.create({ name });

        if (examIds && examIds.length > 0) {
            const exams = await Exam.findAll({
                where: { id: examIds },
            });
            await topic.setExams(exams);
        }

        logger.info(`Created new topic: ${topic.id}`);
        res.status(201).json(topic);
    } catch (error) {
        logger.error('Error creating topic:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Обновление темы
exports.updateTopic = async (req, res) => {
    const { id } = req.params;
    const { name, examIds } = req.body;

    try {
        const topic = await Topic.findByPk(id);
        if (!topic) {
            logger.warn(`Topic not found: ${id}`);
            return res.status(404).json({ message: 'Topic not found' });
        }

        await topic.update({ name });

        if (examIds && examIds.length > 0) {
            const exams = await Exam.findAll({
                where: { id: examIds },
            });
            await topic.setExams(exams);
        }

        logger.info(`Updated topic: ${id}`);
        res.status(200).json(topic);
    } catch (error) {
        logger.error(`Error updating topic ${id}:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Удаление темы
exports.deleteTopic = async (req, res) => {
    const { id } = req.params;

    try {
        const topic = await Topic.findByPk(id);
        if (!topic) {
            logger.warn(`Topic not found: ${id}`);
            return res.status(404).json({ message: 'Topic not found' });
        }

        await topic.destroy();
        logger.info(`Deleted topic: ${id}`);
        res.status(200).json({ message: 'Topic deleted successfully' });
    } catch (error) {
        logger.error(`Error deleting topic ${id}:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Получение темы по ID
exports.getTopicById = async (req, res) => {
    const { id } = req.params;

    try {
        const topic = await Topic.findByPk(id, {
            include: [{ model: Exam, as: 'exams' }],
        });

        if (!topic) {
            logger.warn(`Topic not found: ${id}`);
            return res.status(404).json({ message: 'Topic not found' });
        }

        logger.info(`Fetched topic: ${id}`);
        res.status(200).json(topic);
    } catch (error) {
        logger.error(`Error fetching topic ${id}:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


