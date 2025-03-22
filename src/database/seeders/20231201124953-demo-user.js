'use strict';
import bcrypt from "bcrypt";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const saltRounds = 10; // Number of salt rounds for bcrypt

    const hashedPasswordAdmin = await bcrypt.hash("1234", saltRounds);
    const hashedPasswordProvinceLeader = await bcrypt.hash("1234", saltRounds);
    const hashedPasswordDistrictLeader = await bcrypt.hash("1234", saltRounds);
    const hashedPasswordSectorLeader = await bcrypt.hash("1234", saltRounds);
    const hashedPasswordCellLeader = await bcrypt.hash("1234", saltRounds);
    const hashedPasswordVillageLeader = await bcrypt.hash("1234", saltRounds);

    return queryInterface.bulkInsert("Users", [
      {
        firstname: "admin",
        lastname: "Mado",
        email: "admin@gmail.com",
        phone: "0780000000",
        role: "admin", // Admin role
        status: "active",
        password: hashedPasswordAdmin,
        gender: "Male",
        province_id: null,
        district_id: null,
        sector_id: null,
        cell_id: null,
        village_id: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
     
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("Users", null, {});
  }
};
