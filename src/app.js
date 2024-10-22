require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./models');
const logger = require('./utils/logger');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/exams', require('./routes/examRoutes'));
app.use('/api/topics', require('./routes/topicRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/gigachat', require('./routes/gigaChatRoutes'));

const PORT = process.env.PORT || 3000;
db.sequelize
    .sync({ force: false })
    .then(() => {
        app.listen(PORT, () => {
            logger.info(`Server is running on port ${PORT}.`);
        });
    })
    .catch((error) => {
        logger.error('Error syncing database:', error);
    });
