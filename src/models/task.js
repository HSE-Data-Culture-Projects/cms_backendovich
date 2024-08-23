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
        },
        filename: {
            type: DataTypes.STRING, // Имя загруженного файла
        },
        filepath: {
            type: DataTypes.STRING, // Путь к файлу в файловой системе
        },
        originalname: {
            type: DataTypes.STRING, // Оригинальное имя файла
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
