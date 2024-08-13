const db = require('../models');
const Task = db.Task;

exports.getTasksByTopic = async (req, res) => {
    const { topicId } = req.params;
    const tasks = await Task.findAll({ where: { topicId } });
    res.json(tasks);
};

exports.addTask = async (req, res) => {
    const { name, type, content, topicId } = req.body;
    const task = await Task.create({ name, type, content, topicId });
    res.status(201).json(task);
};
