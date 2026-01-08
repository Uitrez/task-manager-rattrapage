"use strict";

module.exports = (sequelize, DataTypes) => {
  const ListMember = sequelize.define(
    "ListMember",
    {
      listId: { type: DataTypes.INTEGER, allowNull: false },
      userId: { type: DataTypes.INTEGER, allowNull: false },
      role: {
        type: DataTypes.ENUM("owner", "editor", "reader"),
        allowNull: false
      }
    },
    { tableName: "ListMembers" }
  );

  return ListMember;
};
