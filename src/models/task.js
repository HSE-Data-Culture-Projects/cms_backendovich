module.exports = (sequelize, DataTypes) => {
    const Task = sequelize.define("Task", {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        type: {
            type: DataTypes.STRING,
        },
        content: {
            type: DataTypes.TEXT,
        },
    });

    return Task;
};
