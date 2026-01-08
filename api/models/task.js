"use strict";

module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define(
    "Task",
    {
      title: { type: DataTypes.STRING(300), allowNull: false },
      done: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      dueDate: { type: DataTypes.DATE, allowNull: true },
      listId: { type: DataTypes.INTEGER, allowNull: false }
    },
    { tableName: "Tasks" }
  );

  return Task;
};
