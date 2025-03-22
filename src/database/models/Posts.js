"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Posts extends Model {
    static associate(models) {
      Posts.belongsTo(models.Users, { foreignKey: "userID", as: "user" });
      Posts.belongsTo(models.Categories, { foreignKey: "categoryID", as: "category" });

      Posts.belongsTo(models.Provinces, { foreignKey: "province_id", as: "province" });
      Posts.belongsTo(models.Districts, { foreignKey: "district_id", as: "district" });
      Posts.belongsTo(models.Sectors, { foreignKey: "sector_id", as: "sector" });
      Posts.belongsTo(models.Cells, { foreignKey: "cell_id", as: "cell" });
      Posts.belongsTo(models.Villages, { foreignKey: "village_id", as: "village" });

      Posts.hasMany(models.Comments, { foreignKey: "postID", as: "comments" });
      

    }
  }

  Posts.init(
    {
      userID: DataTypes.INTEGER,
      categoryID: DataTypes.INTEGER,
      title: DataTypes.STRING,
      description: DataTypes.STRING,
      image: DataTypes.STRING,
      status: DataTypes.STRING,

      province_id: { type: DataTypes.INTEGER, allowNull: true },
      district_id: { type: DataTypes.INTEGER, allowNull: true },
      sector_id: { type: DataTypes.INTEGER, allowNull: true },
      cell_id: { type: DataTypes.INTEGER, allowNull: true },
      village_id: { type: DataTypes.INTEGER, allowNull: true },
    },
    {
      sequelize,
      modelName: "Posts",
    }
  );

  return Posts;
};
