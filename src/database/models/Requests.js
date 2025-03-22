"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Requests extends Model {
    static associate(models) {
      Requests.belongsTo(models.Users, { foreignKey: "userID", as: "user" });

      Requests.belongsTo(models.Provinces, { foreignKey: "province_id", as: "province" });
      Requests.belongsTo(models.Districts, { foreignKey: "district_id", as: "district" });
      Requests.belongsTo(models.Sectors, { foreignKey: "sector_id", as: "sector" });
      Requests.belongsTo(models.Cells, { foreignKey: "cell_id", as: "cell" });
      Requests.belongsTo(models.Villages, { foreignKey: "village_id", as: "village" });

    }
  }

  Requests.init(
    {
      userID: DataTypes.STRING,
      reson: DataTypes.STRING,
      status: DataTypes.STRING,
      province_id: { type: DataTypes.INTEGER, allowNull: true },
      district_id: { type: DataTypes.INTEGER, allowNull: true },
      sector_id: { type: DataTypes.INTEGER, allowNull: true },
      cell_id: { type: DataTypes.INTEGER, allowNull: true },
      village_id: { type: DataTypes.INTEGER, allowNull: true },
    },
    {
      sequelize,
      modelName: "Requests",
    }
  );

  return Requests;
};
