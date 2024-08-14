const db = require('../models');
const Exam = db.Exam;
const Topic = db.Topic;

exports.getAllTopics = async (req, res) => {
    try {
        const topics = await Topic.findAll();
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


exports.addTopic = async (req, res) => {
    const { name, examIds } = req.body;

    try {
        // Создаем новую тему
        const topic = await Topic.create({ name });

        // Если переданы examIds, связываем тему с экзаменами
        if (examIds && examIds.length > 0) {
            const exams = await Exam.findAll({
                where: {
                    id: examIds
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
