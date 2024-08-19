// models/file.js
module.exports = (sequelize, DataTypes) => {
    const File = sequelize.define("File", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        filename: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        filepath: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        originalname: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    });

    return File;
};
