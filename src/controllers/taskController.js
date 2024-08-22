const db = require('../models');
const Task = db.Task;
const Topic = db.Topic;

// Получение всех задач (независимо от темы)
exports.getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.findAll();
        res.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Получение задач по теме
exports.getTasksByTopic = async (req, res) => {
    const { topicId } = req.params;

    try {
        const topic = await Topic.findByPk(topicId, {
            include: [{ model: db.Task, as: 'tasks' }]
        });

        if (!topic) {
            return res.status(404).json({ message: 'Topic not found' });
        }

        res.json(topic.tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Добавление новой задачи и привязка её к темам
exports.addTask = async (req, res) => {
    const { content, topicIds } = req.body;

    try {
        // Создаем новое задание
        const task = await Task.create({ content });

        // Если переданы topicIds, связываем задание с темами
        if (topicIds && topicIds.length > 0) {
            const topics = await Topic.findAll({
                where: {
                    id: topicIds
                }
            });
            await task.setTopics(topics);
        }

        res.status(201).json(task);
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


exports.updateTask = async (req, res) => {
    const { id } = req.params;
    const { content, topicIds } = req.body;

    try {
        const task = await Task.findByPk(id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        await task.update({ content });

        if (topicIds && topicIds.length > 0) {
            const topics = await Topic.findAll({
                where: { id: topicIds },
            });
            await task.setTopics(topics);
        }

        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteTask = async (req, res) => {
    const { id } = req.params;

    try {
        const task = await Task.findByPk(id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        await task.destroy();
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
