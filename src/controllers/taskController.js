// Импорт необходимых модулей
const fs = require('fs').promises;
const { Task, Topic } = require('../models'); // Добавлен Topic
const logger = require('../utils/logger');

async function safeUnlink(filepath) {
    try {
        await fs.access(filepath);
        await fs.unlink(filepath);
        logger.info(`File deleted: ${filepath}`);
    } catch (error) {
        if (error.code === 'ENOENT') {
            logger.warn(`File does not exist: ${filepath}`);
        } else {
            logger.error('Error deleting file:', error);
            throw error;
        }
    }
}

/**
 * Обработчик импорта XML с вопросами.
 * Из файла извлекаются блоки между тегами <question> и </question>
 * и сохраняется «сырое» содержимое вместе с тегами в БД.
 * Если в теле запроса переданы topicIds, то для каждого созданного задания
 * производится привязка к указанным темам.
 */
exports.importXmlQuestions = async (req, res) => {
    // Извлекаем topicIds из тела запроса (ожидается строка с id, разделёнными запятыми или JSON-массив)
    const { topicIds } = req.body;

    // Определяем, загружены ли файлы через req.files или req.file
    let files = [];
    if (req.files && req.files.length) {
        files = req.files;
    } else if (req.file) {
        files.push(req.file);
    } else {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    let importedCount = 0;
    const errors = [];

    // Регулярное выражение для поиска содержимого тега <question>…</question>
    const questionRegex = /<question\b[^>]*>[\s\S]*?<\/question>/gi;

    // Попытаемся получить массив идентификаторов тем
    let topicIdArray = [];
    if (topicIds && topicIds.trim() !== '') {
        try {
            // Если topicIds передан как JSON-массив, распарсим его
            topicIdArray = JSON.parse(topicIds);
            if (!Array.isArray(topicIdArray)) {
                topicIdArray = [topicIdArray];
            }
        } catch (e) {
            // Если не получается, разделим строку по запятой
            topicIdArray = topicIds.split(',').map(id => id.trim());
        }
        logger.info(`TOPIC FROM IMPORT: ${JSON.stringify(topicIdArray)}`);
    }

    for (const file of files) {
        try {
            const xmlData = await fs.readFile(file.path, 'utf-8');
            let match;
            // Ищем все совпадения в файле
            while ((match = questionRegex.exec(xmlData)) !== null) {
                // match[0] содержит весь найденный блок, включая теги
                const questionBlock = match[0].trim();
                try {
                    // Создаем задание с извлечённым содержимым
                    const createdTask = await Task.create({ content: questionBlock });
                    // Если переданы topicIds, привязываем задание к этим темам
                    if (topicIdArray.length > 0) {
                        const topics = await Topic.findAll({
                            where: { id: topicIdArray }
                        });
                        if (topics && topics.length > 0) {
                            await createdTask.setTopics(topics);
                        } else {
                            logger.info('FOUND TOPICS: ', topics);
                        }
                    }
                    importedCount++;
                } catch (err) {
                    const errMsg = `Error importing question from file ${file.originalname}: ${err.message}`;
                    logger.error(errMsg);
                    errors.push(errMsg);
                }
            }
            // Удаляем файл после обработки
            await safeUnlink(file.path);
        } catch (err) {
            const errMsg = `Error processing file ${file.originalname}: ${err.message}`;
            logger.error(errMsg);
            errors.push(errMsg);
            try {
                await safeUnlink(file.path);
            } catch (unlinkErr) {
                logger.error(`Error deleting file ${file.originalname} after failure:`, unlinkErr);
            }
        }
    }

    logger.info(`Imported ${importedCount} questions from ${files.length} file(s)`);
    res.status(201).json({ message: `${importedCount} questions imported`, errors });
};


// Получение всех задач
exports.getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.findAll({
            include: [{ model: Topic, as: 'topics' }],
        });
        logger.info('Fetched all tasks');
        res.json(tasks);
    } catch (error) {
        logger.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getTasksByTopicId = async (req, res) => {
    const { topicId } = req.params;

    try {
        const topic = await Topic.findByPk(topicId);
        if (!topic) {
            return res.status(404).json({ message: 'Тема не найдена' });
        }

        const tasks = await topic.getTasks({
            include: [
                {
                    model: Topic,
                    as: 'topics',
                    attributes: ['id', 'name'],
                    through: { attributes: [] }
                }
            ]
        });

        const tasksMapped = tasks.map(task => ({
            id: task.id,
            content: task.content,
            topics: task.topics
        }));

        res.status(200).json(tasksMapped);
    } catch (error) {
        console.error('Ошибка при получении заданий по ID темы:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
};

// Добавление новой задачи
exports.addTask = async (req, res) => {
    const { content, topicIds } = req.body;
    const file = req.file;

    try {
        const taskData = { content };

        if (file) {
            taskData.filename = file.filename;
            taskData.filepath = file.path;
            taskData.originalname = file.originalname;
        }

        const task = await Task.create(taskData);

        if (topicIds && topicIds.length > 0) {
            const topics = await Topic.findAll({
                where: { id: topicIds.split(',') },
            });
            await task.setTopics(topics);
        }

        logger.info(`Created new task: ${task.id}`);
        res.status(201).json(task);
    } catch (error) {
        logger.error('Error creating task:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Обновление задачи
exports.updateTask = async (req, res) => {
    const { id } = req.params;
    const { content, topicIds } = req.body;
    const file = req.file;

    try {
        const task = await Task.findByPk(id);
        if (!task) {
            logger.warn(`Task not found: ${id}`);
            return res.status(404).json({ message: 'Task not found' });
        }

        const updatedData = { content };

        if (file) {
            if (task.filepath) {
                await safeUnlink(task.filepath);
            }
            updatedData.filename = file.filename;
            updatedData.filepath = file.path;
            updatedData.originalname = file.originalname;
        }

        await task.update(updatedData);

        if (topicIds && topicIds.length > 0) {
            const topics = await Topic.findAll({
                where: { id: topicIds.split(',') },
            });
            await task.setTopics(topics);
        }

        logger.info(`Updated task: ${id}`);
        res.status(200).json(task);
    } catch (error) {
        logger.error(`Error updating task ${id}:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Удаление задачи
exports.deleteTask = async (req, res) => {
    const { id } = req.params;

    try {
        const task = await Task.findByPk(id);
        if (!task) {
            logger.warn(`Task not found: ${id}`);
            return res.status(404).json({ message: 'Task not found' });
        }

        if (task.filepath) {
            await safeUnlink(task.filepath);
        }

        await task.destroy();
        logger.info(`Deleted task: ${id}`);
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        logger.error(`Error deleting task ${id}:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Импорт заданий из XML
exports.importTasks = async (req, res) => {
    const file = req.file;

    if (!file) {
        logger.warn('No file uploaded for import');
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        const xmlData = await fs.readFile(file.path, 'utf-8');
        const parser = new xml2js.Parser();

        parser.parseString(xmlData, async (err, result) => {
            if (err) {
                logger.error('Error parsing XML:', err);
                return res.status(500).json({ error: 'Error parsing XML' });
            }

            const tasks = result.tasks.task;

            for (let taskData of tasks) {
                const task = {
                    content: taskData.content[0],
                };

                await Task.create(task);
            }

            await safeUnlink(file.path);
            logger.info('Imported tasks from XML');
            res.status(201).json({ message: 'Tasks imported successfully' });
        });
    } catch (error) {
        logger.error('Error importing tasks from XML:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
