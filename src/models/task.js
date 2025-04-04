module.exports = (sequelize, DataTypes) => {
    const Task = sequelize.define('Task', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        filename: {
            type: DataTypes.STRING,
        },
        filepath: {
            type: DataTypes.STRING,
        },
        originalname: {
            type: DataTypes.STRING,
        },
    });

    Task.associate = (models) => {
        Task.belongsToMany(models.Topic, {
            through: 'TopicTasks',
            as: 'topics',
            foreignKey: 'TaskId',
            otherKey: 'TopicId',
        });
    };

    return Task;
};
