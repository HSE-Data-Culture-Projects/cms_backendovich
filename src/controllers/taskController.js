const db = require('../models');
const Task = db.Task;
const Topic = db.Topic;
const fs = require('fs').promises;
const path = require('path');

// Проверка на существование файла перед удалением

// Асинхронная функция для безопасного удаления файла
async function safeUnlink(filepath) {
    try {
        await fs.access(filepath); // Проверяем существование файла
        await fs.unlink(filepath); // Удаляем файл
        console.log('Файл успешно удален:', filepath);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.warn('Файл не существует и не может быть удален:', filepath);
        } else {
            console.error('Ошибка при удалении файла:', error);
            throw error; // Пробрасываем ошибку дальше для обработки
        }
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

exports.getTasksByTopicId = async (req, res) => {
    const { topicId } = req.params;

    try {
        // Проверяем, существует ли тема с данным ID
        const topic = await Topic.findByPk(topicId);
        if (!topic) {
            return res.status(404).json({ message: 'Тема не найдена' });
        }

        // Получаем все задания, связанные с данной темой
        const tasks = await topic.getTasks({
            include: [
                {
                    model: Topic,
                    as: 'topics',
                    attributes: ['id', 'name'], // Выбираем необходимые поля
                    through: { attributes: [] } // Не включаем поля таблицы связи
                }
            ]
        });

        // Читаем содержимое XML-файлов для каждого задания
        const tasksWithXml = await Promise.all(tasks.map(async (task) => {
            if (task.filepath) {
                try {
                    const xmlContent = await fs.readFile(task.filepath, 'utf-8');
                    return {
                        id: task.id,
                        content: xmlContent
                    };
                } catch (fileError) {
                    console.error(`Ошибка при чтении файла для задания ID ${task.id}:`, fileError);
                    return {
                        id: task.id,
                        content: null,
                        error: 'Не удалось прочитать файл задания.'
                    };
                }
            } else {
                return {
                    id: task.id,
                    content: null,
                    error: 'Файл задания не указан.'
                };
            }
        }));

        res.status(200).json(tasksWithXml);
    } catch (error) {
        console.error('Ошибка при получении заданий по ID темы:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
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
    console.log('Получен запрос на удаление задания с id:', id); // Отладочный вывод

    try {
        const task = await Task.findByPk(id);
        if (!task) {
            console.log('Задание не найдено с id:', id); // Отладочный вывод
            return res.status(404).json({ message: 'Task not found' });
        }

        // Удаление файла из файловой системы, если он существует
        if (task.filepath) {
            console.log('Попытка удалить файл:', task.filepath); // Отладочный вывод
            await safeUnlink(task.filepath);
        }

        await task.destroy();
        console.log('Задание успешно удалено с id:', id); // Отладочный вывод
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Ошибка при удалении задания:', error);
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
