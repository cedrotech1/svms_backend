"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    static associate(models) {
      Users.hasMany(models.Posts, { foreignKey: "userID", as: "Posts" });
      Users.hasMany(models.Notifications, { foreignKey: "userID", as: "notifications" });
      Users.hasMany(models.Requests, { foreignKey: "userID", as: "requests" });
      Users.hasMany(models.Documents, { foreignKey: "userID", as: "documents" });
      Users.belongsTo(models.Provinces, { foreignKey: "province_id", as: "province" });
      Users.belongsTo(models.Districts, { foreignKey: "district_id", as: "district" });
      Users.belongsTo(models.Sectors, { foreignKey: "sector_id", as: "sector" });
      Users.belongsTo(models.Cells, { foreignKey: "cell_id", as: "cell" });
      Users.belongsTo(models.Villages, { foreignKey: "village_id", as: "village" });
    }
  }

  Users.init(
    {
      firstname: DataTypes.STRING,
      lastname: DataTypes.STRING,
      email: { type: DataTypes.STRING, unique: true },
      password: DataTypes.STRING,
      phone: { type: DataTypes.STRING, unique: true },
      gender: DataTypes.STRING,

      nid: DataTypes.STRING,
      familyinfo: DataTypes.STRING,
    

      code: DataTypes.STRING,
      status: DataTypes.STRING,
      image: DataTypes.STRING,
      role: {
        type: DataTypes.ENUM(
          "province_leader",
          "district_leader",
          "sector_leader",
          "cell_leader",
          "village_leader",
          "admin",
          "citizen",
        ),
        allowNull: false,
      },
      province_id: { type: DataTypes.INTEGER, allowNull: true },
      district_id: { type: DataTypes.INTEGER, allowNull: true },
      sector_id: { type: DataTypes.INTEGER, allowNull: true },
      cell_id: { type: DataTypes.INTEGER, allowNull: true },
      village_id: { type: DataTypes.INTEGER, allowNull: true },
    },
    {
      sequelize,
      modelName: "Users",
    }
  );

  return Users;
};
