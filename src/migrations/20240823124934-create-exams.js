'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Tasks', 'filename', {
      type: Sequelize.STRING,
      allowNull: true, // Поле может быть пустым
    });
    
    await queryInterface.addColumn('Tasks', 'filepath', {
      type: Sequelize.STRING,
      allowNull: true, // Поле может быть пустым
    });
    
    await queryInterface.addColumn('Tasks', 'originalname', {
      type: Sequelize.STRING,
      allowNull: true, // Поле может быть пустым
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Tasks', 'filename');
    await queryInterface.removeColumn('Tasks', 'filepath');
    await queryInterface.removeColumn('Tasks', 'originalname');
  }
};
