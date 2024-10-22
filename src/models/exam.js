module.exports = (sequelize, DataTypes) => {
    const Exam = sequelize.define('Exam', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    });

    Exam.associate = (models) => {
        Exam.belongsToMany(models.Topic, {
            through: 'ExamTopics',
            as: 'topics',
            foreignKey: 'ExamId',
            otherKey: 'TopicId',
        });
    };

    return Exam;
};
