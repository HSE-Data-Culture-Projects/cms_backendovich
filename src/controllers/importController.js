const xml2js = require('xml2js');
const fs = require('fs');
const db = require('../models');
const Task = db.Task;

exports.importTasks = async (req, res) => {
    const file = req.file;
    if (!file) {
        return res.status(400).send({ message: "Please upload a file!" });
    }

    const parser = new xml2js.Parser();
    fs.readFile(file.path, async (err, data) => {
        if (err) throw err;

        parser.parseString(data, async (err, result) => {
            if (err) throw err;

            const questions = result.quiz.question;
            const tasks = questions.map((question, index) => ({
                name: question.name[0].text[0],
                type: question.$.type,
                content: JSON.stringify(question),
                topicId: null  // Привязка к теме может быть реализована
            }));

            await Task.bulkCreate(tasks);
            res.status(201).send({ message: "Tasks imported successfully!" });
        });
    });
};
