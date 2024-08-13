const express = require('express');
const cors = require('cors');
const db = require('./models');

const app = express();
app.use(cors());
app.use(express.json());

// Подключение маршрутов
const examRoutes = require('./routes/examRoutes');
const topicRoutes = require('./routes/topicRoutes');
const taskRoutes = require('./routes/taskRoutes');
const importRoutes = require('./routes/importRoutes');

app.use('/api/exams', examRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/import', importRoutes);

// Подключение к базе данных и запуск сервера
const PORT = process.env.PORT || 3000;

db.sequelize.sync({ force: false }).then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}.`);
    });
});
