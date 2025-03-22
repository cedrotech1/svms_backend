'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Posts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users', // Refers to Users table
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      categoryID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Categories', // Refers to Categories table
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      title: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING
      },
      image: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
      },
      province_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      district_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      sector_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      cell_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      village_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Posts');
  }
};
