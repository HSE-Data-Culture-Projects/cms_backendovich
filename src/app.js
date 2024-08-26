// src/app.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./models');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/exams', require('./routes/examRoutes'));
app.use('/api/topics', require('./routes/topicRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/gigachat', './routes/gigaChatRoutes');

const PORT = process.env.PORT || 3000;
db.sequelize.sync({ force: false }).then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}.`);
    });
});
