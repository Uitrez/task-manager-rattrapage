"use strict";

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      email: { type: DataTypes.STRING(320), allowNull: false, unique: true },
      passwordHash: { type: DataTypes.STRING, allowNull: false }
    },
    { tableName: "Users" }
  );

  return User;
};
