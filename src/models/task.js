// models/task.js
module.exports = (sequelize, DataTypes) => {
    const Task = sequelize.define("Task", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        }
    });

    Task.associate = (models) => {
        Task.belongsToMany(models.Topic, {
            through: 'TopicTasks',
            as: 'topics',
            foreignKey: 'TaskId',
            otherKey: 'TopicId'
        });
    };

    return Task;
};
