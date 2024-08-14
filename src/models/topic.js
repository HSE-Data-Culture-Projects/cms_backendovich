// models/topic.js
module.exports = (sequelize, DataTypes) => {
    const Topic = sequelize.define("Topic", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    });

    Topic.associate = (models) => {
        Topic.belongsToMany(models.Exam, {
            through: 'ExamTopics',
            as: 'exams',
            foreignKey: 'TopicId',
            otherKey: 'ExamId'
        });
        Topic.belongsToMany(models.Task, {
            through: 'TopicTasks',
            as: 'tasks',
            foreignKey: 'TopicId',
            otherKey: 'TaskId'
        });
    };

    return Topic;
};
