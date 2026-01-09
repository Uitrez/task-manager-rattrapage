const db = require("../../models");
const { getAccess } = require("../services/accessService");

async function createTask(req, res) {
  const userId = req.user.id;
  const listId = Number(req.params.id);

  if (Number.isNaN(listId)) return res.status(400).json({ error: "Invalid list id" });

  const { title, dueDate } = req.body;
  if (!title) return res.status(400).json({ error: "title is required" });

  try {
    const access = await getAccess(userId, listId);
    if (!access.exists) return res.status(404).json({ error: "List not found" });
    if (!access.canRead) return res.status(404).json({ error: "List not found" }); 
    if (!access.canEditTasks) return res.status(403).json({ error: "Forbidden" });

    const task = await db.Task.create({
      title,
      dueDate: dueDate ? new Date(dueDate) : null,
      listId,
      done: false
    });
    res.set("Last-Modified", new Date(task.updatedAt).toUTCString());

    return res.status(201).json({ task });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
}

async function updateTask(req, res) {
  const userId = req.user.id;
  const taskId = Number(req.params.id);

  if (Number.isNaN(taskId)) return res.status(400).json({ error: "Invalid task id" });

  const ius = req.headers["if-unmodified-since"];
  if (!ius) {
    return res.status(428).json({
      error: "Precondition required",
      hint: "Send If-Unmodified-Since header with the task last known updatedAt"
    });
  }

  const clientDate = new Date(ius);
  if (Number.isNaN(clientDate.getTime())) {
    return res.status(400).json({ error: "Invalid If-Unmodified-Since date" });
  }

  const { title, done, dueDate } = req.body;

  try {
    const task = await db.Task.findByPk(taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });

    const access = await getAccess(userId, task.listId);
    if (!access.canRead) return res.status(404).json({ error: "Task not found" }); 
    if (!access.canEditTasks) return res.status(403).json({ error: "Forbidden" });

    const serverTime = new Date(task.updatedAt).getTime();
    const clientTime = clientDate.getTime();

    if (serverTime !== clientTime) {
      res.set("Last-Modified", new Date(task.updatedAt).toUTCString());
      return res.status(409).json({
        error: "Conflict",
        message: "Task has been modified since your last read",
        serverUpdatedAt: task.updatedAt
      });
    }

    if (title !== undefined) task.title = title;
    if (done !== undefined) task.done = !!done;
    if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null;

    await task.save();

    res.set("Last-Modified", new Date(task.updatedAt).toUTCString());
    return res.json({ task });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
}

async function deleteTask(req, res) {
  const userId = req.user.id;
  const taskId = Number(req.params.id);

  if (Number.isNaN(taskId)) return res.status(400).json({ error: "Invalid task id" });

  try {
    const task = await db.Task.findByPk(taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });

    const access = await getAccess(userId, task.listId);
    if (!access.canRead) return res.status(404).json({ error: "Task not found" }); // anti-leak

    if (!access.canDeleteList) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await task.destroy();
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
}

module.exports = { createTask, updateTask, deleteTask };
