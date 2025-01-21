// controllers/authController.js
const db = require('../models');
const User = db.User;
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

exports.register = async (req, res) => {
    const { username, password, role } = req.body;

    try {
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const user = await User.create({ username, password, role });
        logger.info(`User registered: ${user.id}`);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        logger.error('Error registering user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isValid = await user.validPassword(password);
        if (!isValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const payload = { id: user.id, username: user.username, role: user.role };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

        logger.info(`User logged in: ${user.id}`);
        res.status(200).json({ token });
    } catch (error) {
        logger.error('Error during login:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
