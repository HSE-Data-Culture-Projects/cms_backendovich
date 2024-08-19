// controllers/fileController.js
const db = require('../models');
const fs = require('fs');
const path = require('path');
const File = db.File;

exports.uploadFile = async (req, res) => {
    const file = req.file;
    if (!file) {
        return res.status(400).send({ message: "Please upload a file!" });
    }

    try {
        const newFile = await File.create({
            filename: file.filename,
            filepath: file.path,
            originalname: file.originalname,
        });

        res.status(201).json(newFile);
    } catch (error) {
        res.status(500).json({ error: "Error while saving file" });
    }
};

exports.getFiles = async (req, res) => {
    try {
        const files = await File.findAll();
        res.json(files);
    } catch (error) {
        res.status(500).json({ error: "Error fetching files" });
    }
};

exports.downloadFile = async (req, res) => {
    const { id } = req.params;

    try {
        const file = await File.findByPk(id);
        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }

        const filepath = path.resolve(file.filepath);
        res.download(filepath, file.originalname);
    } catch (error) {
        res.status(500).json({ error: "Error downloading file" });
    }
};

exports.updateFile = async (req, res) => {
    const { id } = req.params;
    const { originalname } = req.body;

    try {
        const file = await File.findByPk(id);
        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        await file.update({ originalname });
        res.status(200).json(file);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
