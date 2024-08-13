module.exports = (sequelize, DataTypes) => {
    const Exam = sequelize.define("Exam", {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
        },
    });

    return Exam;
};
