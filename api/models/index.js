"use strict";

require("dotenv").config();
const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false
});

const db = {};

db.User = require("./user")(sequelize, DataTypes);
db.TaskList = require("./taskList")(sequelize, DataTypes);
db.Task = require("./task")(sequelize, DataTypes);
db.ListMember = require("./listMember")(sequelize, DataTypes);
db.User.hasMany(db.TaskList, { foreignKey: "ownerId", as: "ownedLists" });
db.TaskList.belongsTo(db.User, { foreignKey: "ownerId", as: "owner" });
db.TaskList.hasMany(db.Task, { foreignKey: "listId", as: "tasks" });
db.Task.belongsTo(db.TaskList, { foreignKey: "listId", as: "list" });
db.User.hasMany(db.ListMember, { foreignKey: "userId", as: "memberships" });
db.ListMember.belongsTo(db.User, { foreignKey: "userId", as: "user" });
db.TaskList.hasMany(db.ListMember, { foreignKey: "listId", as: "members" });
db.ListMember.belongsTo(db.TaskList, { foreignKey: "listId", as: "list" });
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
