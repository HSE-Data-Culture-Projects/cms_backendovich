const db = require('../models');
const Topic = db.Topic;

exports.getTopicsByExam = async (req, res) => {
    const { examId } = req.params;
    const topics = await Topic.findAll({ where: { examId } });
    res.json(topics);
};

exports.addTopic = async (req, res) => {
    const { name, examId } = req.body;
    const topic = await Topic.create({ name, examId });
    res.status(201).json(topic);
};
