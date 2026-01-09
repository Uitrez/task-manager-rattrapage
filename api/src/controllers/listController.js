const db = require("../../models");
const { getAccess } = require("../services/accessService");

async function createList(req, res) {
  const { name, isCoop } = req.body;
  if (!name) return res.status(400).json({ error: "name is required" });

  const userId = req.user.id;

  try {
    const list = await db.TaskList.create({
      name,
      isCoop: !!isCoop,
      ownerId: userId
    });

    if (list.isCoop) {
      await db.ListMember.create({
        listId: list.id,
        userId,
        role: "owner"
      });
    }

    return res.status(201).json({ list });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
}

async function getMyLists(req, res) {
  const userId = req.user.id;

  try {
    const ownedPrivate = await db.TaskList.findAll({
      where: { ownerId: userId, isCoop: false }
    });

    const ownedCoop = await db.TaskList.findAll({
      where: { ownerId: userId, isCoop: true }
    });

    const memberships = await db.ListMember.findAll({
      where: { userId }
    });

    const memberListIds = memberships.map((m) => m.listId);

    const memberCoopLists =
      memberListIds.length === 0
        ? []
        : await db.TaskList.findAll({
            where: { id: memberListIds, isCoop: true }
          });

    const byId = new Map();
    [...ownedPrivate, ...ownedCoop, ...memberCoopLists].forEach((l) =>
      byId.set(l.id, l)
    );

    return res.json({ lists: Array.from(byId.values()) });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
}

// GET /lists/:id
async function getListById(req, res) {
  const userId = req.user.id;
  const listId = Number(req.params.id);

  if (Number.isNaN(listId)) return res.status(400).json({ error: "Invalid list id" });

  try {
    const access = await getAccess(userId, listId);
    if (!access.exists) return res.status(404).json({ error: "List not found" });
    if (!access.canRead) return res.status(404).json({ error: "List not found" }); // anti leak

    const list = await db.TaskList.findByPk(listId, {
      include: [
        { model: db.Task, as: "tasks" },
        { model: db.ListMember, as: "members" }
      ]
    });

    res.set("Last-Modified", new Date(list.updatedAt).toUTCString());

    const payload = {
      id: list.id,
      name: list.name,
      isCoop: list.isCoop,
      ownerId: list.ownerId,
      tasks: list.tasks
    };

    if (list.isCoop) {
      payload.members = list.members;
      payload.myRole = access.role;
    }

    return res.json({ list: payload });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
}

module.exports = { createList, getMyLists, getListById };
