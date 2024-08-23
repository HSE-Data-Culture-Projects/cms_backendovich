const db = require('../models');
const Task = db.Task;
const Topic = db.Topic;
const fs = require('fs');
const path = require('path');

// Проверка на существование файла перед удалением
function safeUnlink(filepath) {
    if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
    }
}

// Получение всех задач (с файлами)
// Получение всех задач (с файлами и темами)
exports.getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.findAll({
            include: [{ model: Topic, as: 'topics' }] // Добавляем связанные темы
        });
        res.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


// Добавление новой задачи с файлом
exports.addTask = async (req, res) => {
    const { content, topicIds } = req.body;
    const file = req.file;

    try {
        const taskData = { content };

        // Если есть файл, добавляем информацию о файле в задачу
        if (file) {
            taskData.filename = file.filename;
            taskData.filepath = file.path;
            taskData.originalname = file.originalname;
        }

        const task = await Task.create(taskData);

        // Привязка задания к темам
        if (topicIds && topicIds.length > 0) {
            const topics = await Topic.findAll({
                where: { id: topicIds.split(',') } // Парсим список тем
            });
            await task.setTopics(topics);
        }

        res.status(201).json(task);
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Обновление задачи с возможностью замены файла
exports.updateTask = async (req, res) => {
    const { id } = req.params;
    const { content, topicIds } = req.body;
    const file = req.file;

    try {
        const task = await Task.findByPk(id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const updatedData = { content };

        // Если загружен новый файл, обновляем его информацию и удаляем старый файл
        if (file) {
            if (task.filepath) {
                safeUnlink(task.filepath);
            }
            updatedData.filename = file.filename;
            updatedData.filepath = file.path;
            updatedData.originalname = file.originalname;
        }

        await task.update(updatedData);

        // Обновление привязанных тем
        if (topicIds && topicIds.length > 0) {
            const topics = await Topic.findAll({
                where: { id: topicIds.split(',') }
            });
            await task.setTopics(topics);
        }

        res.status(200).json(task);
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Удаление задачи и связанного с ней файла
exports.deleteTask = async (req, res) => {
    const { id } = req.params;

    try {
        const task = await Task.findByPk(id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Удаление файла из файловой системы, если он существует
        if (task.filepath) {
            safeUnlink(task.filepath);
        }

        await task.destroy();
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Импорт заданий из XML файла
const xml2js = require('xml2js');
exports.importTasks = async (req, res) => {
    const file = req.file;
    if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    try {
        const xmlData = fs.readFileSync(file.path, 'utf-8');
        const parser = new xml2js.Parser();

        parser.parseString(xmlData, async (err, result) => {
            if (err) {
                console.error('Error parsing XML:', err);
                return res.status(500).json({ error: 'Error parsing XML' });
            }

            // Пример структуры XML и логики сохранения в БД
            const tasks = result.tasks.task; // Предполагаем, что в XML есть список задач

            for (let taskData of tasks) {
                const task = {
                    content: taskData.content[0]
                    // Здесь логика привязки тем, если нужно
                };

                await Task.create(task);
            }

            // Удаляем файл с сервера после обработки
            safeUnlink(file.path);

            res.status(201).json({ message: "Tasks imported successfully" });
        });

    } catch (error) {
        console.error('Error importing tasks from XML:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
