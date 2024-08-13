const { Sequelize } = require('sequelize');
const dbConfig = require('../config/dbConfig');

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Exam = require('./exam')(sequelize, Sequelize);
db.Topic = require('./topic')(sequelize, Sequelize);
db.Task = require('./task')(sequelize, Sequelize);

// Связи между моделями
db.Exam.hasMany(db.Topic, { as: "topics" });
db.Topic.belongsTo(db.Exam, { foreignKey: "examId", as: "exam" });

db.Topic.hasMany(db.Task, { as: "tasks" });
db.Task.belongsTo(db.Topic, { foreignKey: "topicId", as: "topic" });

module.exports = db;
