module.exports = (sequelize, DataTypes) => {
    const Topic = sequelize.define("Topic", {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        examId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Exams',
                key: 'id',
            },
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE'
        }
    });

    return Topic;
};
