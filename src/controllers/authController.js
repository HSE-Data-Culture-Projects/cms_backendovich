// controllers/authController.js
const db = require('../models');
const User = db.User;
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

// Генерация Access Token
const generateAccessToken = (user) => {
    return jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
};

// Генерация Refresh Token
const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
    );
};

exports.register = async (req, res) => {
    const { username, password, role } = req.body;

    try {
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ message: 'Username уже существует' });
        }

        const user = await User.create({ username, password, role });
        logger.info(`User registered: ${user.id}`);
        res.status(201).json({ message: 'Пользователь успешно зарегистрирован' });
    } catch (error) {
        logger.error('Error registering user:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(401).json({ message: 'Неверные учетные данные' });
        }

        const isValid = await user.validPassword(password);
        if (!isValid) {
            return res.status(401).json({ message: 'Неверные учетные данные' });
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // Сохранение Refresh Token в базе данных
        user.refreshToken = refreshToken;
        await user.save();

        logger.info(`User logged in: ${user.id}`);
        res.status(200).json({ accessToken, refreshToken });
    } catch (error) {
        logger.error('Error during login:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
};

// Метод для обновления токенов
exports.refreshToken = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh Token не предоставлен' });
    }

    try {
        // Проверка наличия пользователя с данным Refresh Token
        const user = await User.findOne({ where: { refreshToken } });
        if (!user) {
            return res.status(403).json({ message: 'Refresh Token недействителен' });
        }

        // Верификация Refresh Token
        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
            if (err || user.id !== decoded.id) {
                return res.status(403).json({ message: 'Refresh Token недействителен' });
            }

            const newAccessToken = generateAccessToken(user);
            const newRefreshToken = generateRefreshToken(user);

            // Обновление Refresh Token в базе данных
            user.refreshToken = newRefreshToken;
            user.save();

            res.status(200).json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
        });
    } catch (error) {
        logger.error('Error during token refresh:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
};

// Метод для выхода из системы (удаление Refresh Token)
exports.logout = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh Token не предоставлен' });
    }

    try {
        const user = await User.findOne({ where: { refreshToken } });
        if (!user) {
            return res.status(403).json({ message: 'Refresh Token недействителен' });
        }

        // Удаление Refresh Token из базы данных
        user.refreshToken = null;
        await user.save();

        logger.info(`User logged out: ${user.id}`);
        res.status(200).json({ message: 'Вы успешно вышли из системы' });
    } catch (error) {
        logger.error('Error during logout:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
};
