require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./models');
const logger = require('./utils/logger');

const app = express();


app.use((req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    return next();
  }
  express.json({ limit: '100mb' })(req, res, next);
});

app.use((req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    return next();
  }
  express.urlencoded({ limit: '100mb', extended: true })(req, res, next);
});

app.use(cors());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', require('./routes/authRoutes'));
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
