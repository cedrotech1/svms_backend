"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Documents extends Model {
    static associate(models) {
      Documents.belongsTo(models.Users, { foreignKey: "userID", as: "document" });
      Documents.belongsTo(models.Users, { foreignKey: "RecordedBy", as: "recorder" });
    }
  }
  Documents.init(
    {
      userID: DataTypes.INTEGER,
      category: DataTypes.STRING,
      title: DataTypes.STRING,
      description: DataTypes.STRING,
      image: DataTypes.STRING,
      RecordedBy: DataTypes.INTEGER,

    },
    {
      sequelize,
      modelName: "Documents",
    }
  );

  return Documents;
};
