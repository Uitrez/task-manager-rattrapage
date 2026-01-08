const db = require("../../models");

async function getAccess(userId, listId) {
  const list = await db.TaskList.findByPk(listId);
  if (!list) return { exists: false };

  if (!list.isCoop) {
    const isOwner = list.ownerId === userId;
    return {
      exists: true,
      list,
      role: isOwner ? "owner" : null,
      canRead: isOwner,
      canEditTasks: isOwner,
      canManageMembers: isOwner,
      canDeleteList: isOwner
    };
  }

  if (list.ownerId === userId) {
    return {
      exists: true,
      list,
      role: "owner",
      canRead: true,
      canEditTasks: true,
      canManageMembers: true,
      canDeleteList: true
    };
  }

  const membership = await db.ListMember.findOne({
    where: { listId, userId }
  });

  if (!membership) {
    return {
      exists: true,
      list,
      role: null,
      canRead: false,
      canEditTasks: false,
      canManageMembers: false,
      canDeleteList: false
    };
  }

  const role = membership.role;
  return {
    exists: true,
    list,
    role,
    canRead: true,
    canEditTasks: role === "editor",
    canManageMembers: false,
    canDeleteList: false
  };
}

module.exports = { getAccess };
