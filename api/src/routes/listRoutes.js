const express = require("express");
const { authRequired } = require("../middleware/auth");
const { createList, getMyLists, getListById } = require("../controllers/listController");
const router = express.Router();

router.use(authRequired);
router.post("/", createList);
router.get("/", getMyLists);
router.get("/:id", getListById);

module.exports = router;
