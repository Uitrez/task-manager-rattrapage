const db = require("../../models");
const { getAccess } = require("../services/accessService");

async function addMember(req, res) {
  const userId = req.user.id;
  const listId = Number(req.params.id);
  const { email, role } = req.body;

  if (!email || !role) {
    return res.status(400).json({ error: "email and role are required" });
  }

  if (!["editor", "reader"].includes(role)) {
    return res.status(400).json({ error: "invalid role" });
  }

  try {
    const access = await getAccess(userId, listId);
    if (!access.exists) return res.status(404).json({ error: "List not found" });
    if (!access.canManageMembers) return res.status(404).json({ error: "List not found" });

    if (!access.list.isCoop) {
      return res.status(400).json({ error: "List is not cooperative" });
    }

    const user = await db.User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const member = await db.ListMember.create({
      listId,
      userId: user.id,
      role
    });

    return res.status(201).json({ member });
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ error: "User already member of list" });
    }
    return res.status(500).json({ error: "Server error" });
  }
}

async function removeMember(req, res) {
  const currentUserId = req.user.id;
  const listId = Number(req.params.id);
  const memberUserId = Number(req.params.userId);

  try {
    const access = await getAccess(currentUserId, listId);
    if (!access.exists) return res.status(404).json({ error: "List not found" });
    if (!access.canManageMembers) return res.status(404).json({ error: "List not found" });

    const member = await db.ListMember.findOne({
      where: { listId, userId: memberUserId }
    });

    if (!member) return res.status(404).json({ error: "Member not found" });

    await member.destroy();
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
}

module.exports = { addMember, removeMember };
