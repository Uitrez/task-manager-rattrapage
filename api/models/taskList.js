"use strict";

module.exports = (sequelize, DataTypes) => {
  const TaskList = sequelize.define(
    "TaskList",
    {
      name: { type: DataTypes.STRING(200), allowNull: false },
      isCoop: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      ownerId: { type: DataTypes.INTEGER, allowNull: false }
    },
    { tableName: "TaskLists" }
  );

  return TaskList;
};
