const db = require('../models');
const Exam = db.Exam;
const Topic = db.Topic;

// Получение всех тем (с экзаменами)
exports.getAllTopics = async (req, res) => {
    try {
        const topics = await Topic.findAll({
            include: [{ model: Exam, as: 'exams' }] // Включаем связанные экзамены
        });
        res.json(topics);
    } catch (error) {
        console.error('Error fetching topics:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getTopicsByExam = async (req, res) => {
    const { examId } = req.params;

    // Проверяем, передан ли параметр examId
    if (!examId) {
        return res.status(400).json({ error: "examId is required" });
    }

    try {
        const exam = await Exam.findByPk(examId, {
            include: [{ model: db.Topic, as: 'topics' }]
        });

        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        res.json(exam.topics);
    } catch (error) {
        console.error('Error fetching topics:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


// Добавление новой темы с привязкой к нескольким экзаменам
exports.addTopic = async (req, res) => {
    const { name, examIds } = req.body;

    try {
        // Создаем новую тему
        const topic = await Topic.create({ name });

        // Если переданы examIds, связываем тему с экзаменами
        if (examIds && examIds.length > 0) {
            const exams = await Exam.findAll({
                where: {
                    id: examIds // Ожидаем, что examIds будет массивом
                }
            });
            await topic.setExams(exams); // Устанавливаем связь между темой и экзаменами
        }

        res.status(201).json(topic);
    } catch (error) {
        console.error('Error creating topic:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Обновление темы с привязкой к нескольким экзаменам
exports.updateTopic = async (req, res) => {
    const { id } = req.params;
    const { name, examIds } = req.body;

    try {
        const topic = await Topic.findByPk(id);
        if (!topic) {
            return res.status(404).json({ message: 'Topic not found' });
        }

        await topic.update({ name });

        // Привязка темы к экзаменам
        if (examIds && examIds.length > 0) {
            const exams = await Exam.findAll({
                where: { id: examIds }
            });
            await topic.setExams(exams);
        }

        res.status(200).json(topic);
    } catch (error) {
        console.error('Error updating topic:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


exports.deleteTopic = async (req, res) => {
    const { id } = req.params;

    try {
        const topic = await Topic.findByPk(id);
        if (!topic) {
            return res.status(404).json({ message: 'Topic not found' });
        }

        await topic.destroy();
        res.status(200).json({ message: 'Topic deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Получение одной темы по ID
exports.getTopicById = async (req, res) => {
    const { id } = req.params;

    try {
        const topic = await Topic.findByPk(id, {
            include: [{ model: db.Exam, as: 'exams' }]
        });

        if (!topic) {
            return res.status(404).json({ message: 'Topic not found' });
        }

        res.status(200).json(topic);
    } catch (error) {
        console.error('Error fetching topic:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


