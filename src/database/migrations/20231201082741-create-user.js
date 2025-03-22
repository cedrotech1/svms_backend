'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      firstname: {
        type: Sequelize.STRING
      },
      lastname: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING,
        unique: true
      },
      password: {
        type: Sequelize.STRING
      },
      phone: {
        type: Sequelize.STRING,
        unique: true
      },
      gender: {
        type: Sequelize.ENUM("Male", "Female", "Other")
      },
      code: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
      },
      image: {
        type: Sequelize.STRING
      },
      role: {
        type: Sequelize.STRING,
        allowNull: false
      },
      province_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      nid: {
        type: Sequelize.STRING,
        allowNull: true
      },
      familyinfo: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable('Users');
  }
};
