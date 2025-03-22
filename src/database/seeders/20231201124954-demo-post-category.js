'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Categories', [
      {
        name: 'minutes',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'announcements',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'news updates',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'emergency alerts',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'events',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'community notices',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Categories', null, {});
  }
};
