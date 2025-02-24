// Импорт необходимых модулей
const fs = require('fs').promises;
const xml2js = require('xml2js');
const { Task, Topic } = require('../models');
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
 * Поддерживаются три сценария:
 *  1. Один XML-файл, содержащий несколько вопросов (несколько тегов <question> внутри корневого тега, например, <quiz>).
 *  2. Несколько XML-файлов, каждый из которых содержит несколько вопросов.
 *  3. Один XML-файл, содержащий один вопрос (один тег <question>).
 *
 * Для каждого тега <question> создаётся отдельная запись в БД.
 */
exports.importXmlQuestions = async (req, res) => {
    // Определяем, загружены ли файлы через req.files (множественная загрузка) или через req.file (один файл)
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
    const parser = new xml2js.Parser();

    // Обработка каждого файла
    for (const file of files) {
        try {
            const xmlData = await fs.readFile(file.path, 'utf-8');
            const parsedResult = await parser.parseStringPromise(xmlData);

            // Определяем, где лежат вопросы
            let questions = [];
            if (parsedResult.quiz && parsedResult.quiz.question) {
                questions = parsedResult.quiz.question;
            } else if (parsedResult.question) {
                questions = [parsedResult.question];
            } else {
                const errorMsg = `Invalid XML structure in file ${file.originalname}`;
                logger.warn(errorMsg);
                errors.push(errorMsg);
                await safeUnlink(file.path);
                continue;
            }

            // Для каждого вопроса создаём отдельную запись
            for (const q of questions) {
                try {
                    // Здесь можно доработать логику сохранения:
                    // например, извлекать определённые поля из q,
                    // а в данном примере сохраняется JSON‑представление вопроса.
                    await Task.create({ content: JSON.stringify(q) });
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
