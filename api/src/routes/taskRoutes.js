const express = require("express");
const { authRequired } = require("../middleware/auth");
const { updateTask, deleteTask } = require("../controllers/taskController");
const router = express.Router();

router.use(authRequired);
router.patch("/:id", updateTask);
router.delete("/:id", deleteTask);

module.exports = router;
