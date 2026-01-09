const express = require("express");
const { authRequired } = require("../middleware/auth");
const { createList, getMyLists, getListById } = require("../controllers/listController");
const { createTask } = require("../controllers/taskController");
const router = express.Router();

router.use(authRequired);
router.post("/", createList);
router.get("/", getMyLists);
router.get("/:id", getListById);
router.post("/:id/tasks", createTask);

module.exports = router;
